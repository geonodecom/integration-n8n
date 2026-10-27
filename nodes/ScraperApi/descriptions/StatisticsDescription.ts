import { INodeProperties } from 'n8n-workflow';

export const statisticsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['statistics'] } },
    options: [
      {
        name: 'Get',
        value: 'get',
        action: 'Get extraction statistics',
        description: 'Retrieve aggregated extraction statistics for a date range',
      },
    ],
    default: 'get',
  },
];

export const statisticsFields: INodeProperties[] = [
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: { show: { resource: ['statistics'], operation: ['get'] } },
    options: [
      {
        displayName: 'Start Date',
        name: 'start_date',
        type: 'dateTime',
        default: '',
        description: 'Defaults to 30 days ago',
      },
      {
        displayName: 'End Date',
        name: 'end_date',
        type: 'dateTime',
        default: '',
        description: 'Defaults to now',
      },
    ],
  },
];
