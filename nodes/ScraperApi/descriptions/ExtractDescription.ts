import { INodeProperties } from 'n8n-workflow';

import { paginationFields, pollingFields, proxyCollection } from './shared';

const runShow = { resource: ['extract'], operation: ['run'] };
const listShow = { resource: ['extract'], operation: ['listJobs'] };

export const extractOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['extract'] } },
    options: [
      {
        name: 'Run Extraction',
        value: 'run',
        action: 'Extract content from a URL',
        description: 'Extract clean markdown or HTML from any URL',
      },
      {
        name: 'Get Job',
        value: 'getJob',
        action: 'Get an extraction job result',
        description: 'Retrieve a single async extraction job',
      },
      {
        name: 'List Jobs',
        value: 'listJobs',
        action: 'List extraction jobs',
        description: 'List and filter extraction jobs',
      },
    ],
    default: 'run',
  },
];

export const extractFields: INodeProperties[] = [
  // ----- run -----
  {
    displayName: 'URL',
    name: 'url',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'https://example.com',
    description: 'The URL to extract content from',
    displayOptions: { show: runShow },
  },
  {
    displayName: 'Output Formats',
    name: 'formats',
    type: 'multiOptions',
    options: [
      { name: 'HTML', value: 'html' },
      { name: 'Markdown', value: 'markdown' },
    ],
    default: ['html'],
    description: 'Output formats to return',
    displayOptions: { show: runShow },
  },
  {
    displayName: 'Render JavaScript',
    name: 'render_js',
    type: 'boolean',
    default: false,
    description: 'Whether to use a headless browser to render the page (slower, more expensive)',
    displayOptions: { show: runShow },
  },
  {
    displayName: 'Processing Mode',
    name: 'processing_mode',
    type: 'options',
    options: [
      { name: 'Sync (Block Until Done)', value: 'sync' },
      { name: 'Async (Queue and Return Job ID)', value: 'async' },
    ],
    default: 'sync',
    description: 'Processing mode: sync blocks until done; async returns a job ID',
    displayOptions: { show: runShow },
  },
  ...pollingFields(
    { ...runShow, processing_mode: ['async'] },
    { waitDefault: true, intervalMs: 2000, timeoutMs: 300000 },
  ),
  {
    displayName: 'Extract Links',
    name: 'extract_links',
    type: 'boolean',
    default: false,
    description: 'Whether to extract all links found on the page',
    displayOptions: { show: runShow },
  },
  proxyCollection(runShow),
  {
    displayName: 'Custom Headers',
    name: 'headers',
    type: 'fixedCollection',
    typeOptions: { multipleValues: true },
    placeholder: 'Add Header',
    default: {},
    displayOptions: { show: runShow },
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

  // ----- getJob -----
  {
    displayName: 'Job ID',
    name: 'jobId',
    type: 'string',
    required: true,
    default: '',
    description: 'The extraction job ID returned from an async run',
    displayOptions: { show: { resource: ['extract'], operation: ['getJob'] } },
  },

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
      { displayName: 'Job ID', name: 'job_id', type: 'string', default: '' },
      {
        displayName: 'Output Format',
        name: 'output',
        type: 'options',
        options: [
          { name: 'HTML', value: 'html' },
          { name: 'Markdown', value: 'markdown' },
        ],
        default: 'html',
      },
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
      { displayName: 'URL', name: 'url', type: 'string', default: '' },
    ],
  },
  ...paginationFields(listShow),
];
