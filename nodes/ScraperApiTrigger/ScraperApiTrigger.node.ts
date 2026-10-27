import { createHmac, timingSafeEqual } from 'crypto';
import {
  IHookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookFunctions,
  IWebhookResponseData,
  JsonObject,
} from 'n8n-workflow';

import { scraperApiRequest } from '../ScraperApi/GenericFunctions';
import { eventTypeOptions } from '../ScraperApi/descriptions/shared';

const SIGNATURE_HEADER = 'x-webhook-signature';

function isValidSignature(secret: string, rawBody: Buffer | string, providedHeader: string): boolean {
  const provided = providedHeader.replace(/^sha256=/i, '').trim().toLowerCase();
  if (!provided) return false;

  const payload = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf8');
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  if (expected.length !== provided.length) return false;

  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'));
  } catch {
    return false;
  }
}

export class ScraperApiTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Scraper API Trigger',
    name: 'scraperApiTrigger',
    icon: 'file:scraper-geonode.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event_type"]}}',
    description: 'Starts the workflow when the Scraper API delivers a webhook event',
    defaults: { name: 'Scraper API Trigger' },
    inputs: [],
    outputs: ['main'],
    credentials: [{ name: 'scraperApiApi', required: true }],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Event Type',
        name: 'event_type',
        type: 'options',
        options: eventTypeOptions,
        default: 'extract_completed',
        required: true,
        description: 'Which Scraper API event should trigger this workflow',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: 'n8n workflow webhook',
        description: 'Free-form description stored on the webhook record',
      },
      {
        displayName: 'Verify Signature',
        name: 'verifySignature',
        type: 'boolean',
        default: true,
        description:
          'Whether to verify the X-Webhook-Signature header against the secret returned at registration; rejects mismatched payloads',
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        if (!webhookData.webhookId) return false;

        try {
          await scraperApiRequest.call(this, {
            method: 'GET',
            url: `/v1/webhooks/${webhookData.webhookId}`,
          });
          return true;
        } catch {
          delete webhookData.webhookId;
          delete webhookData.secret;
          return false;
        }
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default');
        if (!webhookUrl) return false;
        const eventType = this.getNodeParameter('event_type') as string;
        const description = this.getNodeParameter('description', 'n8n workflow webhook') as string;

        const response = (await scraperApiRequest.call(this, {
          method: 'POST',
          url: '/v1/webhooks',
          body: {
            url: webhookUrl,
            event_type: eventType,
            description,
          },
        })) as { id?: string; secret?: string };

        if (!response.id) return false;

        const webhookData = this.getWorkflowStaticData('node');
        webhookData.webhookId = response.id;
        if (response.secret) webhookData.secret = response.secret;
        return true;
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        if (!webhookData.webhookId) return true;

        try {
          await scraperApiRequest.call(this, {
            method: 'DELETE',
            url: `/v1/webhooks/${webhookData.webhookId}`,
          });
        } catch {
          // ignore — already gone or unreachable
        }

        delete webhookData.webhookId;
        delete webhookData.secret;
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const req = this.getRequestObject();
    const body = (req.body ?? {}) as JsonObject;
    const headers = (req.headers ?? {}) as Record<string, string | string[] | undefined>;

    const verify = this.getNodeParameter('verifySignature', true) as boolean;
    if (verify) {
      const staticData = this.getWorkflowStaticData('node');
      const secret = staticData.secret as string | undefined;
      const rawHeader = headers[SIGNATURE_HEADER] ?? headers[SIGNATURE_HEADER.toUpperCase()];
      const signature = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

      if (!secret) {
        return {
          webhookResponse: { statusCode: 500, body: 'Webhook secret not stored — re-activate workflow' },
          noWebhookResponse: false,
        };
      }
      if (!signature) {
        return {
          webhookResponse: { statusCode: 401, body: 'Missing X-Webhook-Signature header' },
          noWebhookResponse: false,
        };
      }

      const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody ?? Buffer.from(JSON.stringify(body), 'utf8');
      if (!isValidSignature(secret, rawBody, signature)) {
        return {
          webhookResponse: { statusCode: 401, body: 'Invalid signature' },
          noWebhookResponse: false,
        };
      }
    }

    return {
      workflowData: [this.helpers.returnJsonArray([{ headers, body }])],
    };
  }
}
