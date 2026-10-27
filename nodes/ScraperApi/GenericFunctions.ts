import {
  IDataObject,
  IExecuteFunctions,
  IHookFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  ILoadOptionsFunctions,
  IWebhookFunctions,
  JsonObject,
  NodeApiError,
  sleep,
} from 'n8n-workflow';

import { version } from '../../package.json';

// n8n owns the User-Agent, so the node names itself in this header instead (scraper-api#674).
export const CLIENT_HEADERS = { 'X-Geonode-Client': `n8n/${version}` };

export type ScraperApiContext =
  | IExecuteFunctions
  | IHookFunctions
  | IWebhookFunctions
  | ILoadOptionsFunctions;

export interface ScraperApiRequestOptions {
  method: IHttpRequestMethods;
  url: string;
  body?: IDataObject;
  qs?: IDataObject;
}

const MAX_RETRY_ATTEMPTS = 5;
const DEFAULT_BACKOFF_MS = 1000;
const TERMINAL_STATUSES = ['completed', 'failed', 'cancelled'];

function parseRetryAfter(value: unknown): number | null {
  if (value == null) return null;
  const raw = Array.isArray(value) ? value[0] : value;
  const seconds = Number(raw);
  if (!Number.isNaN(seconds) && seconds >= 0) return Math.ceil(seconds * 1000);
  const dateMs = Date.parse(String(raw));
  if (Number.isNaN(dateMs)) return null;
  return Math.max(0, dateMs - Date.now());
}

export async function scraperApiRequest(
  this: ScraperApiContext,
  options: ScraperApiRequestOptions,
): Promise<JsonObject> {
  const credentials = await this.getCredentials('scraperApiApi');
  const baseUrl = String(credentials.baseUrl).replace(/\/+$/, '');
  const isAbsoluteUrl = /^https?:\/\//i.test(options.url);

  const requestOptions: IHttpRequestOptions = {
    method: options.method,
    url: isAbsoluteUrl ? options.url : `${baseUrl}${options.url}`,
    body: options.body,
    qs: options.qs,
    headers: { ...CLIENT_HEADERS },
    json: true,
    returnFullResponse: true,
  };

  for (let attempt = 1; ; attempt++) {
    try {
      const response = (await this.helpers.httpRequestWithAuthentication.call(
        this,
        'scraperApiApi',
        requestOptions,
      )) as { body: JsonObject };
      return response.body;
    } catch (error) {
      const err = error as {
        statusCode?: number;
        httpCode?: number;
        response?: { headers?: Record<string, unknown> };
      };
      const status = err.statusCode ?? err.httpCode;
      const isRetryable = status === 429 || (status !== undefined && status >= 500 && status < 600);

      if (isRetryable && attempt < MAX_RETRY_ATTEMPTS) {
        const retryAfterMs =
          parseRetryAfter(err.response?.headers?.['retry-after']) ??
          DEFAULT_BACKOFF_MS * 2 ** (attempt - 1);
        await sleep(retryAfterMs);
        continue;
      }

      throw new NodeApiError(this.getNode(), error as JsonObject);
    }
  }
}

export interface PollOptions {
  jobUrl: string;
  intervalMs?: number;
  timeoutMs?: number;
  terminalStatuses?: string[];
}

export async function pollUntilComplete(
  this: ScraperApiContext,
  opts: PollOptions,
): Promise<JsonObject> {
  const interval = opts.intervalMs ?? 2000;
  const timeout = opts.timeoutMs ?? 5 * 60 * 1000;
  const terminal = (opts.terminalStatuses ?? TERMINAL_STATUSES).map((s) => s.toLowerCase());
  const deadline = Date.now() + timeout;

  while (true) {
    const body = await scraperApiRequest.call(this, { method: 'GET', url: opts.jobUrl });
    const status = String((body as { status?: string }).status ?? '').toLowerCase();
    if (terminal.includes(status)) return body;
    if (Date.now() > deadline) {
      throw new NodeApiError(this.getNode(), {
        message: `Polling timed out after ${timeout}ms (last status: ${status || 'unknown'})`,
      } as JsonObject);
    }
    await sleep(interval);
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Recursively drops undefined, null, empty strings, empty arrays, and empty objects.
 * Lets call sites build request bodies declaratively without manual nesting.
 */
export function pruneEmpty<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && v.length === 0) continue;
    if (Array.isArray(v)) {
      if (v.length === 0) continue;
      out[k] = v;
      continue;
    }
    if (isPlainObject(v)) {
      const pruned = pruneEmpty(v);
      if (Object.keys(pruned).length === 0) continue;
      out[k] = pruned;
      continue;
    }
    out[k] = v;
  }
  return out as T;
}

export function headersFromCollection(
  raw: { header?: Array<{ name: string; value: string }> } | undefined,
): Record<string, string> | undefined {
  if (!raw?.header?.length) return undefined;
  const out: Record<string, string> = {};
  for (const h of raw.header) {
    if (h.name) out[h.name] = h.value ?? '';
  }
  return Object.keys(out).length === 0 ? undefined : out;
}
