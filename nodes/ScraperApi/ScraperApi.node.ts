import {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  JsonObject,
  NodeOperationError,
} from 'n8n-workflow';

import {
  headersFromCollection,
  pollUntilComplete,
  pruneEmpty,
  scraperApiRequest,
} from './GenericFunctions';

import { extractFields, extractOperations } from './descriptions/ExtractDescription';
import { mapFields, mapOperations } from './descriptions/MapDescription';
import { crawlFields, crawlOperations } from './descriptions/CrawlDescription';
import { webhookFields, webhookOperations } from './descriptions/WebhookDescription';
import { statisticsFields, statisticsOperations } from './descriptions/StatisticsDescription';
import { searchFields, searchOperations } from './descriptions/SearchDescription';
import { batchFields, batchOperations } from './descriptions/BatchDescription';

type Handler = (this: IExecuteFunctions, i: number, operation: string) => Promise<JsonObject>;

export class ScraperApi implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Scraper API',
    name: 'scraperApi',
    icon: 'file:scraper-geonode.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}: {{$parameter["resource"]}}',
    description:
      'Interact with the Scraper API (extract, search, batch, map, crawl, webhooks, statistics)',
    defaults: { name: 'Scraper API' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'scraperApiApi', required: true }],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Batch', value: 'batch' },
          { name: 'Crawl', value: 'crawl' },
          { name: 'Extract', value: 'extract' },
          { name: 'Map', value: 'map' },
          { name: 'Search', value: 'search' },
          { name: 'Statistic', value: 'statistics' },
          { name: 'Webhook', value: 'webhook' },
        ],
        default: 'extract',
      },
      ...extractOperations,
      ...extractFields,
      ...searchOperations,
      ...searchFields,
      ...batchOperations,
      ...batchFields,
      ...mapOperations,
      ...mapFields,
      ...crawlOperations,
      ...crawlFields,
      ...webhookOperations,
      ...webhookFields,
      ...statisticsOperations,
      ...statisticsFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;
        const handler = handlers[resource];
        if (!handler) {
          throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
        }
        const response = await handler.call(this, i, operation);
        returnData.push({ json: response, pairedItem: { item: i } });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: (error as Error).message },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}

// ---------- helpers ----------

interface PollDefaults {
  intervalMs: number;
  timeoutMs: number;
}

async function pollIfRequested(
  this: IExecuteFunctions,
  i: number,
  jobUrl: string,
  defaults: PollDefaults,
): Promise<JsonObject> {
  const intervalMs = this.getNodeParameter('pollIntervalMs', i, defaults.intervalMs) as number;
  const timeoutMs = this.getNodeParameter('pollTimeoutMs', i, defaults.timeoutMs) as number;
  return pollUntilComplete.call(this, { jobUrl, intervalMs, timeoutMs });
}

// ---------- handlers ----------

const extractOps: Record<string, Handler> = {
  async run(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const headersRaw = this.getNodeParameter('headers', i, {}) as {
      header?: Array<{ name: string; value: string }>;
    };

    const body = pruneEmpty({
      url: this.getNodeParameter('url', i) as string,
      formats: this.getNodeParameter('formats', i, ['html']) as string[],
      render_js: this.getNodeParameter('render_js', i, false) as boolean,
      processing_mode: this.getNodeParameter('processing_mode', i, 'sync') as string,
      extract_links: this.getNodeParameter('extract_links', i, false) as boolean,
      proxy: this.getNodeParameter('proxy', i, {}) as IDataObject,
      headers: headersFromCollection(headersRaw),
    });

    const response = await scraperApiRequest.call(this, {
      method: 'POST',
      url: '/v1/extract',
      body,
    });

    const isAsync = body.processing_mode === 'async';
    const waitForCompletion = isAsync && (this.getNodeParameter('waitForCompletion', i, true) as boolean);
    if (!waitForCompletion) return response;

    const statusUrl =
      (response as { status_url?: string }).status_url ??
      `/v1/extract/${(response as { job_id?: string }).job_id}`;
    return pollIfRequested.call(this, i, statusUrl, { intervalMs: 2000, timeoutMs: 300000 });
  },

  async getJob(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const jobId = this.getNodeParameter('jobId', i) as string;
    return scraperApiRequest.call(this, { method: 'GET', url: `/v1/extract/${jobId}` });
  },

  async listJobs(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
    const page = this.getNodeParameter('page', i, 1) as number;
    const pageSize = this.getNodeParameter('page_size', i, 100) as number;
    return scraperApiRequest.call(this, {
      method: 'GET',
      url: '/v1/extract/jobs',
      qs: pruneEmpty({ ...filters, page, page_size: pageSize }),
    });
  },
};

const searchOps: Record<string, Handler> = {
  async run(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const options = this.getNodeParameter('options', i, {}) as IDataObject;

    // Options the user never added are absent rather than null, so the API
    // applies its own defaults for engine, locale, safe and time_range.
    const body = pruneEmpty({
      query: this.getNodeParameter('query', i) as string,
      ...options,
    });

    return scraperApiRequest.call(this, { method: 'POST', url: '/v1/search', body });
  },

  async getJob(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const jobId = this.getNodeParameter('jobId', i) as string;
    return scraperApiRequest.call(this, { method: 'GET', url: `/v1/search/${jobId}` });
  },

  async listJobs(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
    const page = this.getNodeParameter('page', i, 1) as number;
    const pageSize = this.getNodeParameter('page_size', i, 100) as number;
    return scraperApiRequest.call(this, {
      method: 'GET',
      url: '/v1/search/jobs',
      qs: pruneEmpty({ ...filters, page, page_size: pageSize }),
    });
  },
};

const batchOps: Record<string, Handler> = {
  async start(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const headersRaw = this.getNodeParameter('headers', i, {}) as {
      header?: Array<{ name: string; value: string }>;
    };

    const body = pruneEmpty({
      urls: this.getNodeParameter('urls', i) as string[],
      formats: this.getNodeParameter('formats', i, ['markdown']) as string[],
      render_js: this.getNodeParameter('render_js', i, false) as boolean,
      ignore_invalid_urls: this.getNodeParameter('ignore_invalid_urls', i, true) as boolean,
      proxy: this.getNodeParameter('proxy', i, {}) as IDataObject,
      headers: headersFromCollection(headersRaw),
    });

    const response = await scraperApiRequest.call(this, {
      method: 'POST',
      url: '/v1/batch',
      body,
    });

    const waitForCompletion = this.getNodeParameter('waitForCompletion', i, false) as boolean;
    if (!waitForCompletion) return response;

    const statusUrl =
      (response as { status_url?: string }).status_url ??
      `/v1/batch/${(response as { job_id?: string }).job_id}`;
    return pollIfRequested.call(this, i, statusUrl, { intervalMs: 5000, timeoutMs: 900000 });
  },

  async getStatus(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const jobId = this.getNodeParameter('jobId', i) as string;
    const page = this.getNodeParameter('page', i, 1) as number;
    const pageSize = this.getNodeParameter('page_size', i, 100) as number;
    const wait = this.getNodeParameter('waitForCompletion', i, false) as boolean;

    const jobUrl = `/v1/batch/${jobId}`;
    if (wait) {
      return pollIfRequested.call(
        this,
        i,
        `${jobUrl}?page=${page}&page_size=${pageSize}`,
        { intervalMs: 5000, timeoutMs: 900000 },
      );
    }
    return scraperApiRequest.call(this, {
      method: 'GET',
      url: jobUrl,
      qs: { page, page_size: pageSize },
    });
  },

  async listJobs(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
    const page = this.getNodeParameter('page', i, 1) as number;
    const pageSize = this.getNodeParameter('page_size', i, 100) as number;
    return scraperApiRequest.call(this, {
      method: 'GET',
      url: '/v1/batch/jobs',
      qs: pruneEmpty({ ...filters, page, page_size: pageSize }),
    });
  },

  async cancel(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const jobId = this.getNodeParameter('jobId', i) as string;
    return scraperApiRequest.call(this, { method: 'DELETE', url: `/v1/batch/${jobId}` });
  },
};

const crawlOps: Record<string, Handler> = {
  async start(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const body = pruneEmpty({
      url: this.getNodeParameter('url', i) as string,
      depth: this.getNodeParameter('depth', i, 2) as number,
      limit: this.getNodeParameter('limit', i, 50) as number,
      formats: this.getNodeParameter('formats', i, ['markdown']) as string[],
      render_js: this.getNodeParameter('render_js', i, false) as boolean,
      same_domain_only: this.getNodeParameter('same_domain_only', i, true) as boolean,
      include_subdomains: this.getNodeParameter('include_subdomains', i, false) as boolean,
      proxy: this.getNodeParameter('proxy', i, {}) as IDataObject,
    });
    return scraperApiRequest.call(this, { method: 'POST', url: '/v1/crawl', body });
  },

  async getStatus(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const jobId = this.getNodeParameter('jobId', i) as string;
    const page = this.getNodeParameter('page', i, 1) as number;
    const pageSize = this.getNodeParameter('page_size', i, 100) as number;
    const wait = this.getNodeParameter('waitForCompletion', i, false) as boolean;

    const jobUrl = `/v1/crawl/${jobId}`;
    if (wait) {
      return pollIfRequested.call(
        this,
        i,
        `${jobUrl}?page=${page}&page_size=${pageSize}`,
        { intervalMs: 5000, timeoutMs: 600000 },
      );
    }
    return scraperApiRequest.call(this, {
      method: 'GET',
      url: jobUrl,
      qs: { page, page_size: pageSize },
    });
  },
};

const webhookOps: Record<string, Handler> = {
  async create(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const body = pruneEmpty({
      url: this.getNodeParameter('url', i) as string,
      event_type: this.getNodeParameter('event_type', i) as string,
      description: this.getNodeParameter('description', i, '') as string,
    });
    return scraperApiRequest.call(this, { method: 'POST', url: '/v1/webhooks', body });
  },

  async list(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const page = this.getNodeParameter('page', i, 1) as number;
    const pageSize = this.getNodeParameter('page_size', i, 100) as number;
    return scraperApiRequest.call(this, {
      method: 'GET',
      url: '/v1/webhooks',
      qs: { page, page_size: pageSize },
    });
  },

  async get(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const id = this.getNodeParameter('webhookId', i) as string;
    return scraperApiRequest.call(this, { method: 'GET', url: `/v1/webhooks/${id}` });
  },

  async update(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const id = this.getNodeParameter('webhookId', i) as string;
    const body = pruneEmpty(this.getNodeParameter('updateFields', i, {}) as IDataObject);
    return scraperApiRequest.call(this, { method: 'PATCH', url: `/v1/webhooks/${id}`, body });
  },

  async delete(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const id = this.getNodeParameter('webhookId', i) as string;
    await scraperApiRequest.call(this, { method: 'DELETE', url: `/v1/webhooks/${id}` });
    return { success: true, id };
  },

  async rotateSecret(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const id = this.getNodeParameter('webhookId', i) as string;
    return scraperApiRequest.call(this, {
      method: 'POST',
      url: `/v1/webhooks/${id}/rotate-secret`,
    });
  },

  async listDeliveries(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const id = this.getNodeParameter('webhookId', i) as string;
    const page = this.getNodeParameter('page', i, 1) as number;
    const pageSize = this.getNodeParameter('page_size', i, 100) as number;
    const status = this.getNodeParameter('deliveryStatus', i, '') as string;
    return scraperApiRequest.call(this, {
      method: 'GET',
      url: `/v1/webhooks/${id}/deliveries`,
      qs: pruneEmpty({ page, page_size: pageSize, status }),
    });
  },
};

function dispatch(ops: Record<string, Handler>, resource: string): Handler {
  return async function (this: IExecuteFunctions, i: number, operation: string) {
    const op = ops[operation];
    if (!op) {
      throw new NodeOperationError(this.getNode(), `Unknown ${resource} operation: ${operation}`);
    }
    return op.call(this, i, operation);
  };
}

const handlers: Record<string, Handler> = {
  extract: dispatch(extractOps, 'extract'),
  search: dispatch(searchOps, 'search'),
  batch: dispatch(batchOps, 'batch'),
  crawl: dispatch(crawlOps, 'crawl'),
  webhook: dispatch(webhookOps, 'webhook'),

  async map(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const url = this.getNodeParameter('url', i) as string;
    const options = this.getNodeParameter('options', i, {}) as IDataObject;
    return scraperApiRequest.call(this, {
      method: 'POST',
      url: '/v1/map',
      body: pruneEmpty({ url, ...options }),
    });
  },

  async statistics(this: IExecuteFunctions, i: number): Promise<JsonObject> {
    const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
    return scraperApiRequest.call(this, {
      method: 'GET',
      url: '/v1/statistics',
      qs: pruneEmpty(filters),
    });
  },
};
