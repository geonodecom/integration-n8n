![Geonode for n8n: Web Scraping & Workflow Automation](assets/banner.svg)

# Geonode for n8n: Web Scraping & Workflow Automation

Bring web data into self-hosted n8n agents and workflows with Geonode’s community node. Extract pages, crawl sites, discover URLs, search the web and run batches. Use extraction and crawl completion triggers to continue your own AI processing, research or record-update steps.

**[Try Geonode for free](https://app.geonode.com/sign-up)**

[Integrations page](https://geonode.com/integrations) · [Geonode API docs](https://docs.geonode.com/docs/scraper-api) · [n8n setup guide](https://docs.geonode.com/docs/scraper-api/guides/sdks/n8n) · [View package on npm](https://www.npmjs.com/package/n8n-nodes-scraperapi) · [View source on GitHub](https://github.com/geonodecom/integration-n8n) · [Complete guide](docs/guide.md)

**For self-hosted n8n.** This is a community node, not a verified n8n Cloud node. The npm package name remains `n8n-nodes-scraperapi`.

<!-- BEGIN README NAV -->
[Get started](#get-started) · [Build these workflows](#build-these-workflows) · [Example: a URL to a spreadsheet row](#example-a-url-to-a-spreadsheet-row) · [Setup questions](#setup-questions)
<!-- END README NAV -->

## Workflow ideas

- **Feed a knowledge base.** Extract source pages as Markdown, then connect your own chunking, embedding and storage nodes.
- **Refresh a website dataset.** Start a bounded crawl and process the returned content after the job completes.
- **React to completed extraction.** Use Scraper API Trigger to start follow-up processing for extraction or crawl completion.

## Get started

1. In n8n, open **Settings → Community Nodes → Install** and enter `n8n-nodes-scraperapi`.
2. Create a **Scraper API** credential. Paste your Geonode API key and keep the base URL `https://scraper.geonode.io`.
3. Add a **Scraper API** node. Choose **Extract → Run Extraction**, enter a URL, and choose **Markdown** as the output format.
4. Execute the step. The result contains the page content in `data.markdown` and its cost in `tokens_charged`.

You can obtain a key from **API Keys** in the [Geonode dashboard](https://app.geonode.com/). The credential test checks authenticated usage statistics.

## Build these workflows

| Workflow | Node capability |
| --- | --- |
| Feed a knowledge base | Extract pages as Markdown with optional JavaScript rendering. |
| Refresh many sources | Start a batch, then wait for or retrieve its results. |
| Collect a site | Crawl from a seed URL with depth and page limits. |
| Discover URLs | Map a site's links before choosing pages to extract. |
| Search the web | Run search jobs with engine and locale controls. |
| React to completed jobs | Use **Scraper API Trigger** for extraction or crawl completion. |
| Monitor usage | Read statistics and manage webhook subscriptions. |

For long jobs, use asynchronous extraction or a start/status sequence. The [full guide](docs/guide.md) covers polling, webhook signature checks, errors and retries.

<!-- BEGIN SHARED WORKFLOW GUIDE -->
## Example: a URL to a spreadsheet row

1. Supply a URL from a trigger or an Edit Fields node, then add Scraper API → Extract → Run Extraction.
2. Select your Scraper API credential, map the incoming URL, choose Markdown and keep synchronous processing for the first test.
3. Execute the step and inspect data.markdown, metadata.url and tokens_charged in the returned item's JSON.
4. Connect a separate Google Sheets node and map those fields into Content, Source URL and Usage columns using n8n's expression editor.
5. Test the destination write before activating the workflow. Add a separate AI node if you want a summary rather than the raw Markdown.

**Expected result:** Geonode retrieves the page content. The Sheets or AI node needs its own connection; this recipe does not install or configure those services.

## Understand output and completion triggers

Each successful input item produces an output item whose JSON contains the API response. A queued extraction returns job information, while completed extraction returns content. Do not map a job ID as if it were Markdown.

Scraper API Trigger supports extraction and crawl completion. Activation registers a webhook and deactivation removes it. Keep signature verification enabled and use a callback URL reachable by the API.

If Continue On Fail is enabled, a failed item can contain an error string. Route those items separately instead of sending them to your normal content destination.

## Setup questions

Can't install on n8n Cloud? This is a self-hosted community node and has not been verified for n8n Cloud. The package name is n8n-nodes-scraperapi.

No trigger events? Check workflow activation, the reachable webhook URL and signature verification. A successful credential test alone does not prove that callbacks arrive.

Need parsed product fields or change alerts? Add your own parsing, storage and comparison nodes after extraction. The content response does not promise those outputs automatically.

These recipes describe source-supported workflows. They have not been run as authenticated end-to-end examples in this review.
<!-- END SHARED WORKFLOW GUIDE -->

## Develop locally

Use Node.js 20.15 or newer and npm. Run from this repository root:

```sh
npm ci
npm run build
npm test
npm run lint
```

To open a local n8n editor with the built nodes mounted:

```sh
docker compose -f docker-compose.n8n.yml up -d
```

Open `http://localhost:5678`. Rebuild after editing TypeScript, then restart the n8n container. This Compose setup is for local development; webhook triggers require a URL the API can reach.

## Source and releases

This repository preserves the node's extracted history from the Geonode SDK monorepo. Package names, node identifiers and credential types are unchanged. Publishing remains in the original monorepo until the [release migration](docs/release-migration.md) is completed; this repository has no automatic publishing workflow.

[Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md) · [Source provenance](docs/provenance.md) · [Contact Geonode](https://geonode.com/contact)

MIT licensed. See [LICENSE](LICENSE).

**[Try Geonode for free](https://app.geonode.com/sign-up)**
