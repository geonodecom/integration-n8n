# Changelog

All notable changes to the n8n community node will be documented in this file.

The format is inspired by Keep a Changelog.

## [0.3.2] - 2026-11-08

- The package's author email is logins@geonode.com, the address of the npm account that publishes it, instead of support@geonode.com. n8n's Creator Portal checks that we own the package through this address.
- An example workflow to import: `examples/extract-page-to-markdown.json` extracts one page as Markdown. It is not part of the npm package.

## [0.3.1] - 2026-11-06

- The icon is 1 KB instead of 638 KB and looks the same; the package is about 1.9 MB smaller. The node, trigger and credential set it for both light and dark themes.
- The README no longer says the workflow recipes are untested: the Extract recipe ran on n8n 1.85 and 2.45 with 0.3.0.

## [0.3.0] - 2026-11-01

- The node, trigger and credential are named "Geonode Scraper API" and "Geonode Scraper API Trigger" in the n8n editor. Internal node and credential names are unchanged, so existing workflows keep working.
- The node can be used as a tool by n8n's AI Agent (`usableAsTool`).
- Passes n8n's community package checks: credential icon, connection types, error wrapping and parameter defaults. A webhook that can't be deleted on deactivation is now logged as a warning.
- Needs n8n 1.85 or newer.
- The integrations page link and package homepage point to this integration's own page.

## [0.2.4] - 2026-10-28

- Releases carry an npm provenance statement linking the package to this repository.

- Removed the internal repository preparation notes and links to the old monorepo.

- Docs links point to the package's page at https://docs.geonode.com/docs/scraper-api/guides/sdks/n8n.

- README rewritten for n8n users so it can be published as the node page on docs.geonode.com: install, credentials, a first workflow, operations, the trigger, errors and retries. Developer notes moved to the end.

## [0.2.3] - 2026-10-21

- The package page links to geonode.com, the Scraper API docs and sign-up.
- README: a sign-up link near the top.

## [0.2.2] - 2026-10-19

- Every request from the node and the trigger sends `X-Geonode-Client: n8n/<version>`, so the API can tell n8n traffic apart. n8n sets its own User-Agent, which is why this is a separate header.

## [0.2.1] - 2026-09-24

- Default new Scraper API credentials to the production endpoint, `https://scraper.geonode.io`, while keeping the Base URL editable and existing saved credentials unchanged.
- Link to the official API reference and update setup instructions for production credentials, intentional staging use and the authenticated `/v1/statistics` credential test.

## [0.2.0] - 2026-09-16

First published release.

- Added the `Search` resource: run a search, get a search job, list search jobs. Supports engine, locale, page, safe search and time range.
- Added the `Batch` resource: start a batch extraction over many URLs, get status, list jobs and cancel. Supports output formats, JavaScript rendering, proxy options, custom headers and skipping invalid URLs.
- Both batch operations can poll until the job reaches a terminal state, reusing the existing polling controls.

## [0.1.0] - unreleased

Never published to npm. Kept here for history.

- `ScraperApi` node covering extract, map, crawl, webhooks and statistics.
- `ScraperApiTrigger` node for webhook deliveries.
- `ScraperApiApi` credentials, authenticating with an `X-Api-Key` header.
