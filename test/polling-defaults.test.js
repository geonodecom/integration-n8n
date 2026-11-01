'use strict';

// Runs against the build output: `npm run build` first.
const { test } = require('node:test');
const assert = require('node:assert');

const { pollingFields } = require('../dist/nodes/ScraperApi/descriptions/shared');

const defaultsOf = (fields) => Object.fromEntries(fields.map((f) => [f.name, f.default]));

test('polling fields keep the defaults each resource passes in', () => {
  assert.deepStrictEqual(
    defaultsOf(pollingFields({}, { waitDefault: true, intervalMs: 2000, timeoutMs: 300000 })),
    { waitForCompletion: true, pollIntervalMs: 2000, pollTimeoutMs: 300000 },
  );
  assert.deepStrictEqual(
    defaultsOf(pollingFields({}, { waitDefault: false, intervalMs: 5000, timeoutMs: 900000 })),
    { waitForCompletion: false, pollIntervalMs: 5000, pollTimeoutMs: 900000 },
  );
});
