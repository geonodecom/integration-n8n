import { INodeProperties } from 'n8n-workflow';

import { paginationFields, pollingFields, proxyCollection } from './shared';

const startShow = { resource: ['crawl'], operation: ['start'] };
const statusShow = { resource: ['crawl'], operation: ['getStatus'] };

export const crawlOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['crawl'] } },
    options: [
      {
        name: 'Start Crawl',
        value: 'start',
        action: 'Start a crawl job',
        description: 'Crawl a website starting from a seed URL',
      },
      {
        name: 'Get Status',
        value: 'getStatus',
        action: 'Get crawl job status',
        description: 'Poll for the current status and results of a crawl job',
      },
    ],
    default: 'start',
  },
];

export const crawlFields: INodeProperties[] = [
  // ----- start -----
  {
    displayName: 'URL',
    name: 'url',
    type: 'string',
    required: true,
    default: '',
    description: 'Seed URL to start crawling from',
    displayOptions: { show: startShow },
  },
  {
    displayName: 'Depth',
    name: 'depth',
    type: 'number',
    default: 2,
    typeOptions: { minValue: 1, maxValue: 10 },
    description: 'Maximum BFS depth from the seed URL (1 = seed only)',
    displayOptions: { show: startShow },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: { minValue: 1 },
    description: 'Max number of results to return',
    displayOptions: { show: startShow },
  },
  {
    displayName: 'Output Formats',
    name: 'formats',
    type: 'multiOptions',
    options: [
      { name: 'Markdown', value: 'markdown' },
      { name: 'HTML', value: 'html' },
    ],
    default: ['markdown'],
    displayOptions: { show: startShow },
  },
  {
    displayName: 'Render JavaScript',
    name: 'render_js',
    type: 'boolean',
    default: false,
    displayOptions: { show: startShow },
  },
  {
    displayName: 'Same Domain Only',
    name: 'same_domain_only',
    type: 'boolean',
    default: true,
    displayOptions: { show: startShow },
  },
  {
    displayName: 'Include Subdomains',
    name: 'include_subdomains',
    type: 'boolean',
    default: false,
    displayOptions: { show: { ...startShow, same_domain_only: [true] } },
  },
  proxyCollection(startShow),

  // ----- getStatus -----
  {
    displayName: 'Job ID',
    name: 'jobId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: statusShow },
  },
  ...pollingFields(statusShow, { waitDefault: false, intervalMs: 5000, timeoutMs: 600000 }),
  ...paginationFields(statusShow),
];
