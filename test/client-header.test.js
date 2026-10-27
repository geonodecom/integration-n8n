'use strict';

// Runs against the build output: `npm run build` first.
const { test } = require('node:test');
const assert = require('node:assert');

const { version } = require('../package.json');
const { scraperApiRequest } = require('../dist/nodes/ScraperApi/GenericFunctions');

function fakeContext(calls) {
  return {
    getCredentials: async () => ({ baseUrl: 'https://api.example.com/', apiKey: 'test-key' }),
    getNode: () => ({ name: 'Scraper API' }),
    helpers: {
      httpRequestWithAuthentication: async (credentialType, options) => {
        calls.push({ credentialType, options });
        return { body: { ok: true } };
      },
    },
  };
}

test('every request names the node and its version (scraper-api#674)', async () => {
  const calls = [];
  const body = await scraperApiRequest.call(fakeContext(calls), { method: 'GET', url: '/v1/statistics' });

  assert.deepStrictEqual(body, { ok: true });
  assert.strictEqual(calls.length, 1);
  assert.strictEqual(calls[0].credentialType, 'scraperApiApi');
  assert.strictEqual(calls[0].options.url, 'https://api.example.com/v1/statistics');
  assert.strictEqual(calls[0].options.headers['X-Geonode-Client'], `n8n/${version}`);
});
