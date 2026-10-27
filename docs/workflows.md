# n8n: workflow recipes and output guide

[Repository overview](../README.md) · [Geonode documentation](https://www.npmjs.com/package/n8n-nodes-scraperapi)

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

Source-reviewed recipes; authenticated workflow execution has not been tested in this review.
