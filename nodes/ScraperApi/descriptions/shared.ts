import { INodeProperties } from 'n8n-workflow';

export const eventTypeOptions = [
  { name: 'Extract Completed', value: 'extract_completed' },
  { name: 'Crawl Completed', value: 'crawl_completed' },
];

type Show = NonNullable<INodeProperties['displayOptions']>['show'];

export function proxyCollection(show: Show): INodeProperties {
  return {
    displayName: 'Proxy',
    name: 'proxy',
    type: 'collection',
    placeholder: 'Add Proxy Option',
    default: {},
    displayOptions: { show },
    options: [
      {
        displayName: 'Country',
        name: 'country',
        type: 'string',
        default: '',
        placeholder: 'US',
        description: 'ISO 3166-1 alpha-2 country code (e.g., US, GB)',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'Residential', value: 'residential' },
          { name: 'Datacenter', value: 'datacenter' },
          { name: 'Mix', value: 'mix' },
        ],
        default: 'residential',
      },
    ],
  };
}

export function paginationFields(show: Show): INodeProperties[] {
  return [
    {
      displayName: 'Page',
      name: 'page',
      type: 'number',
      default: 1,
      typeOptions: { minValue: 1 },
      displayOptions: { show },
    },
    {
      displayName: 'Page Size',
      name: 'page_size',
      type: 'number',
      default: 100,
      typeOptions: { minValue: 1, maxValue: 100 },
      displayOptions: { show },
    },
  ];
}

export interface PollingDefaults {
  waitDefault: boolean;
  intervalMs: number;
  timeoutMs: number;
}

export function pollingFields(show: Show, defaults: PollingDefaults): INodeProperties[] {
  const waitShow: Show = { ...show, waitForCompletion: [true] };
  const { waitDefault, intervalMs, timeoutMs } = defaults;
  const waitField: INodeProperties = {
    displayName: 'Wait for Completion',
    name: 'waitForCompletion',
    type: 'boolean',
    default: false,
    description:
      'Whether to poll the job until it reaches a terminal state and return the final result',
    displayOptions: { show },
  };
  // Lint needs a boolean literal above; extraction waits by default, batches and crawls don't.
  waitField.default = waitDefault;
  return [
    waitField,
    {
      displayName: 'Poll Interval (Ms)',
      name: 'pollIntervalMs',
      type: 'number',
      default: intervalMs,
      typeOptions: { minValue: 500 },
      displayOptions: { show: waitShow },
    },
    {
      displayName: 'Poll Timeout (Ms)',
      name: 'pollTimeoutMs',
      type: 'number',
      default: timeoutMs,
      typeOptions: { minValue: 1000 },
      displayOptions: { show: waitShow },
    },
  ];
}
