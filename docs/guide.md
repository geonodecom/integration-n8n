> This guide is adapted from the [original source guide](https://github.com/geonodecom/scraper-api-sdks/blob/b9ebe5d53bd1b74a9de3f17d33e62e4f9054eea0/n8n-nodes-scraperapi/README.md). Paths below are relative to this standalone repository. Publishing remains in the original monorepo; see [release migration](release-migration.md).

# Geonode Scraper API node for n8n

[Integrations page](https://geonode.com/integrations) · [Geonode API docs](https://docs.geonode.com/docs/scraper-api) · [n8n setup guide](https://docs.geonode.com/docs/scraper-api/guides/sdks/n8n) · [GitHub source](https://github.com/geonodecom/integration-n8n) · [Published package](https://www.npmjs.com/package/n8n-nodes-scraperapi) · [Repository overview](../README.md)

**[Try Geonode for free](https://app.geonode.com/sign-up)**

An n8n community node for the [Geonode Scraper API](https://geonode.com/products/scraper-api). The **Scraper API** node extracts pages as Markdown or HTML, runs batches and crawls, maps a site's URLs, searches the web, manages webhooks and reads statistics. The **Scraper API Trigger** node starts a workflow when an extraction or a crawl finishes. Package: [`n8n-nodes-scraperapi` on npm](https://www.npmjs.com/package/n8n-nodes-scraperapi).

## Before you start

- A self-hosted n8n. Community nodes install on self-hosted n8n; n8n Cloud offers only nodes that n8n has verified, and this one is not verified yet.
- A Geonode API key. Sign in to the [Geonode dashboard](https://app.geonode.com/), open **API Keys**, and create a key or copy an existing one.

## Install

1. In n8n, open **Settings → Community Nodes** and select **Install**.
2. Enter `n8n-nodes-scraperapi`, confirm that you understand the risks of community nodes, and select **Install**.

The **Scraper API** and **Scraper API Trigger** nodes now appear in the node panel.

## Add your credentials

1. Open **Credentials → Add credential** and choose **Scraper API**.
2. Paste your key into **API Key**. Leave **Base URL** as `https://scraper.geonode.io`.
3. Select **Test**. n8n calls `GET /v1/statistics` with the key, so a green check means the key works.

## Your first workflow

1. Add a **Scraper API** node.
2. Set **Resource** to **Extract** and **Operation** to **Run Extraction**.
3. Enter `https://example.com` as the URL, choose **Markdown** in **Output Formats** and keep **Processing Mode** on **Sync (Block Until Done)**.
4. Select **Execute step**. The output has the page in `data.markdown` and the cost in `tokens_charged`.

## What the node can do

| Resource | Operations | What it does |
|---|---|---|
| Extract | Run Extraction, Get Job, List Jobs | Extract one URL as Markdown or HTML, with JavaScript rendering, a proxy country and request headers if you need them. |
| Batch | Start Batch, Get Status, List Jobs, Cancel | One job for many URLs. |
| Crawl | Start Crawl, Get Status | Follow links from one URL up to a depth and a page limit. |
| Map | Discover URLs | Find the URLs under a site from its sitemap and links, optionally only those containing a word. |
| Search | Run Search, Get Job, List Jobs | Search the web, with a choice of engine, locale, page, safe search and time range. |
| Statistic | Get | Usage statistics for a period. |
| Webhook | Create, Get, List, Update, Delete, Rotate Secret, List Deliveries | Manage webhook subscriptions and see their deliveries. |

### Long jobs

Background extractions, batches and crawls return a job ID straight away. **Wait for Completion** makes the node check the job until it is completed, failed or cancelled, and return the final result. It is on **Run Extraction** (in async mode), **Start Batch**, and the **Get Status** operations of Batch and Crawl. For a crawl, start it, then add a **Get Status** step with **Wait for Completion** on.

## Start a workflow when a job finishes

1. Add a **Scraper API Trigger** node to a new workflow.
2. Choose the **Event Type**: **Extract Completed** or **Crawl Completed**.
3. Keep **Verify Signature** on. Then the node rejects deliveries whose `X-Webhook-Signature` doesn't match the secret it got when it registered.
4. Save and activate the workflow.

On activation, the node registers n8n's webhook URL with the Scraper API. On deactivation, it deletes that registration. Each delivery reaches the workflow as `{headers, body}`, where `body` holds `event`, `webhook_id`, `delivery_id`, `timestamp` and `data`.

## Errors and retries

The node retries a request that gets HTTP 429 or a 5xx, up to 5 attempts in total, with growing pauses and respecting the API's `Retry-After` header. Other errors stop the node and show the API's message: for example 401 for a wrong key, 402 when the balance is too low, or 422 when a page could not be extracted. The [error handling guide](https://docs.geonode.com/docs/scraper-api/troubleshooting/error-handling) explains each status.

## Versions and support

- The latest version is on [npm](https://www.npmjs.com/package/n8n-nodes-scraperapi). To update, open **Settings → Community Nodes** and update the package.
- Requests send `X-Geonode-Client: n8n/<version>`, which helps support see which version you use.
- Questions or problems: [contact Geonode](https://geonode.com/contact).

## Develop the node

To work on the node itself, build it and run it in a local n8n with the compose file in this folder:

```bash
npm install
npm run build
docker compose -f docker-compose.n8n.yml up -d
```

The compose file mounts this folder into n8n's custom extensions and serves the editor at `http://localhost:5678`. After a code change, run `npm run build` and `docker compose -f docker-compose.n8n.yml restart n8n`. Other scripts: `npm run dev` (compile on change), `npm run lint`, `npm run lintfix`, `npm run format` and `npm test`.
