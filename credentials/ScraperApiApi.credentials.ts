import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class ScraperApiApi implements ICredentialType {
  name = 'scraperApiApi';
  displayName = 'Scraper API';
  documentationUrl = 'https://docs.geonode.com/docs/scraper-api/v1/reference';

  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://scraper.geonode.io',
      placeholder: 'https://scraper.geonode.io',
      description: 'Root URL of the Scraper API deployment (no trailing slash)',
      required: true,
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description:
        'Sent as the X-Api-Key header. Required when the deployment has billing enabled (the default).',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'X-Api-Key': '={{$credentials.apiKey}}',
      },
    },
  };

  // Hits an authenticated v1 endpoint so the API key is actually exercised.
  // /health is unauthenticated and would pass even with a bad key.
  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl}}',
      url: '/v1/statistics',
      method: 'GET',
    },
  };
}
