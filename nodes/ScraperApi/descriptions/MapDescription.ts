import { INodeProperties } from 'n8n-workflow';

export const mapOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['map'] } },
    options: [
      {
        name: 'Discover URLs',
        value: 'discover',
        action: 'Discover urls under a base url',
        description: 'Combine sitemap parsing with optional search results to map a site',
      },
    ],
    default: 'discover',
  },
];

export const mapFields: INodeProperties[] = [
  {
    displayName: 'URL',
    name: 'url',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'https://example.com',
    description: 'Base URL to discover links from',
    displayOptions: { show: { resource: ['map'], operation: ['discover'] } },
  },
  {
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: { show: { resource: ['map'], operation: ['discover'] } },
    options: [
      {
        displayName: 'Search Keyword',
        name: 'search',
        type: 'string',
        default: '',
        description: 'Optional keyword to filter discovered links',
      },
      {
        displayName: 'Include Subdomains',
        name: 'include_subdomains',
        type: 'boolean',
        default: true,
      },
      {
        displayName: 'Ignore Query Parameters',
        name: 'ignore_query_parameters',
        type: 'boolean',
        default: true,
      },
    ],
  },
];
