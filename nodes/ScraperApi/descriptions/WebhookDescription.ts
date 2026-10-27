import { INodeProperties } from 'n8n-workflow';

import { eventTypeOptions, paginationFields } from './shared';

const createShow = { resource: ['webhook'], operation: ['create'] };
const idShow = {
  resource: ['webhook'],
  operation: ['get', 'update', 'delete', 'rotateSecret', 'listDeliveries'],
};
const listShow = { resource: ['webhook'], operation: ['list', 'listDeliveries'] };

export const webhookOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['webhook'] } },
    options: [
      { name: 'Create', value: 'create', action: 'Register a webhook' },
      { name: 'Delete', value: 'delete', action: 'Delete a webhook' },
      { name: 'Get', value: 'get', action: 'Get a webhook' },
      { name: 'List', value: 'list', action: 'List webhooks' },
      { name: 'List Deliveries', value: 'listDeliveries', action: 'List webhook deliveries' },
      { name: 'Rotate Secret', value: 'rotateSecret', action: 'Rotate webhook signing secret' },
      { name: 'Update', value: 'update', action: 'Update a webhook' },
    ],
    default: 'list',
  },
];

export const webhookFields: INodeProperties[] = [
  // create
  {
    displayName: 'Target URL',
    name: 'url',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'https://my-app.example.com/hooks/scraper',
    displayOptions: { show: createShow },
  },
  {
    displayName: 'Event Type',
    name: 'event_type',
    type: 'options',
    options: eventTypeOptions,
    default: 'extract_completed',
    displayOptions: { show: createShow },
  },
  {
    displayName: 'Description',
    name: 'description',
    type: 'string',
    default: '',
    displayOptions: { show: createShow },
  },

  // get/update/delete/rotate/listDeliveries — webhook id
  {
    displayName: 'Webhook ID',
    name: 'webhookId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: idShow },
  },

  // update — partial fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: { show: { resource: ['webhook'], operation: ['update'] } },
    options: [
      { displayName: 'Target URL', name: 'url', type: 'string', default: '' },
      { displayName: 'Description', name: 'description', type: 'string', default: '' },
      { displayName: 'Active', name: 'is_active', type: 'boolean', default: true },
      {
        displayName: 'Event Type',
        name: 'event_type',
        type: 'options',
        options: eventTypeOptions,
        default: 'extract_completed',
      },
    ],
  },

  // pagination — list & listDeliveries
  ...paginationFields(listShow),

  // listDeliveries — filter
  {
    displayName: 'Delivery Status',
    name: 'deliveryStatus',
    type: 'string',
    default: '',
    description: 'Optional status filter for deliveries (e.g. delivered, failed)',
    displayOptions: { show: { resource: ['webhook'], operation: ['listDeliveries'] } },
  },
];
