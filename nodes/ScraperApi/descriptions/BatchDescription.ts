import { INodeProperties } from 'n8n-workflow';

import { paginationFields, pollingFields, proxyCollection } from './shared';

const startShow = { resource: ['batch'], operation: ['start'] };
const statusShow = { resource: ['batch'], operation: ['getStatus'] };
const listShow = { resource: ['batch'], operation: ['listJobs'] };

export const batchOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['batch'] } },
    options: [
      {
        name: 'Start Batch',
        value: 'start',
        action: 'Start a batch extraction job',
        description: 'Queue many URLs for extraction in a single job',
      },
      {
        name: 'Get Status',
        value: 'getStatus',
        action: 'Get a batch job status',
        description: 'Retrieve the status and results of a batch job',
      },
      {
        name: 'List Jobs',
        value: 'listJobs',
        action: 'List batch jobs',
        description: 'List and filter batch jobs',
      },
      {
        name: 'Cancel',
        value: 'cancel',
        action: 'Cancel a batch job',
        description: 'Stop a batch job that has not finished yet',
      },
    ],
    default: 'start',
  },
];

export const batchFields: INodeProperties[] = [
  // ----- start -----
  {
    displayName: 'URLs',
    name: 'urls',
    type: 'string',
    required: true,
    typeOptions: { multipleValues: true, multipleValueButtonText: 'Add URL' },
    default: [],
    placeholder: 'https://example.com',
    description: 'The URLs to extract content from',
    displayOptions: { show: startShow },
  },
  {
    displayName: 'Output Formats',
    name: 'formats',
    type: 'multiOptions',
    options: [
      { name: 'HTML', value: 'html' },
      { name: 'Markdown', value: 'markdown' },
    ],
    default: ['markdown'],
    description: 'Output formats to return for every URL',
    displayOptions: { show: startShow },
  },
  {
    displayName: 'Render JavaScript',
    name: 'render_js',
    type: 'boolean',
    default: false,
    description: 'Whether to use a headless browser to render each page (slower, more expensive)',
    displayOptions: { show: startShow },
  },
  {
    displayName: 'Ignore Invalid URLs',
    name: 'ignore_invalid_urls',
    type: 'boolean',
    default: true,
    description:
      'Whether to skip URLs that fail validation instead of rejecting the whole batch. Skipped URLs are returned in invalid_urls.',
    displayOptions: { show: startShow },
  },
  ...pollingFields(startShow, { waitDefault: false, intervalMs: 5000, timeoutMs: 900000 }),
  proxyCollection(startShow),
  {
    displayName: 'Custom Headers',
    name: 'headers',
    type: 'fixedCollection',
    typeOptions: { multipleValues: true },
    placeholder: 'Add Header',
    default: {},
    displayOptions: { show: startShow },
    options: [
      {
        displayName: 'Header',
        name: 'header',
        values: [
          { displayName: 'Name', name: 'name', type: 'string', default: '' },
          { displayName: 'Value', name: 'value', type: 'string', default: '' },
        ],
      },
    ],
  },

  // ----- getStatus and cancel -----
  {
    displayName: 'Job ID',
    name: 'jobId',
    type: 'string',
    required: true,
    default: '',
    description: 'The batch job ID returned when the batch was started',
    displayOptions: { show: { resource: ['batch'], operation: ['getStatus', 'cancel'] } },
  },
  ...pollingFields(statusShow, { waitDefault: false, intervalMs: 5000, timeoutMs: 900000 }),
  ...paginationFields(statusShow),

  // ----- listJobs -----
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: { show: listShow },
    options: [
      { displayName: 'End Date', name: 'end_date', type: 'dateTime', default: '' },
      { displayName: 'Start Date', name: 'start_date', type: 'dateTime', default: '' },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Cancelled', value: 'cancelled' },
          { name: 'Completed', value: 'completed' },
          { name: 'Failed', value: 'failed' },
          { name: 'Processing', value: 'processing' },
          { name: 'Queued', value: 'queued' },
        ],
        default: 'queued',
      },
    ],
  },
  ...paginationFields(listShow),
];
