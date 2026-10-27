import { INodeProperties } from 'n8n-workflow';

import { paginationFields } from './shared';

const runShow = { resource: ['search'], operation: ['run'] };
const listShow = { resource: ['search'], operation: ['listJobs'] };

export const searchOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['search'] } },
    options: [
      {
        name: 'Run Search',
        value: 'run',
        action: 'Run a search query',
        description: 'Search the web and return ranked results',
      },
      {
        name: 'Get Job',
        value: 'getJob',
        action: 'Get a search job',
        description: 'Retrieve a single search job by ID',
      },
      {
        name: 'List Jobs',
        value: 'listJobs',
        action: 'List search jobs',
        description: 'List and filter past search jobs',
      },
    ],
    default: 'run',
  },
];

export const searchFields: INodeProperties[] = [
  // ----- run -----
  {
    displayName: 'Query',
    name: 'query',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'best running shoes',
    description: 'The search query to run',
    displayOptions: { show: runShow },
  },
  {
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: { show: runShow },
    options: [
      {
        displayName: 'Engine',
        name: 'engine',
        type: 'options',
        options: [
          { name: 'Brave', value: 'brave' },
          { name: 'DuckDuckGo', value: 'duckduckgo' },
          { name: 'Naver', value: 'naver' },
        ],
        default: 'brave',
        description: 'Search engine to query. Leave this option out to let the API choose.',
      },
      {
        displayName: 'Locale',
        name: 'locale',
        type: 'string',
        default: '',
        placeholder: 'en-US',
        description: 'Language and region to search in, such as en-US or ko-KR',
      },
      {
        displayName: 'Page',
        name: 'page',
        type: 'number',
        default: 1,
        typeOptions: { minValue: 1 },
        description: 'Result page to return',
      },
      {
        displayName: 'Safe Search',
        name: 'safe',
        type: 'options',
        options: [
          { name: 'Moderate', value: 'moderate' },
          { name: 'Off', value: 'off' },
          { name: 'Strict', value: 'strict' },
        ],
        default: 'off',
        description: 'How strictly to filter adult content',
      },
      {
        displayName: 'Time Range',
        name: 'time_range',
        type: 'options',
        options: [
          { name: 'Day', value: 'day' },
          { name: 'Month', value: 'month' },
          { name: 'Week', value: 'week' },
          { name: 'Year', value: 'year' },
        ],
        default: 'week',
        description: 'Restrict results to content published within this period',
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
    description: 'The search job ID returned by a previous run',
    displayOptions: { show: { resource: ['search'], operation: ['getJob'] } },
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
      { displayName: 'Query', name: 'query', type: 'string', default: '' },
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
