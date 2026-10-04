# Cloudflare + Stripe setup

## 1. Publish the preview

Connect the GitHub repository in Cloudflare Pages: **None / npm run build / dist / main**, Node 22. Add the custom domain. Keep `STORE_READY=false` and `POLICIES_APPROVED=false`. Links to Dee work immediately; “Add to bag” appears only for configured, available Stripe prices when checkout is enabled.

## 2. Database and media

Create a Cloudflare D1 database named `jup-life` and a private R2 bucket named `jup-life-media`. Bind them to the Pages project as **DB** and **MEDIA**. Apply `migrations/0001_initial.sql` to D1 before using admin or checkout. In the D1 console you can paste the migration, or use the CLI:

```sh
npx wrangler d1 create jup-life
npx wrangler r2 bucket create jup-life-media
```

Then uncomment the D1/R2 configuration in `wrangler.jsonc`, enter the real database ID returned by Cloudflare and commit it (an ID is not a secret). Keep binding names `DB` and `MEDIA`. This makes the checked-in configuration the source of truth. Apply the migration:

```sh
npx wrangler d1 migrations apply jup-life --remote
```

Redeploy after adding bindings. Configure production and preview bindings separately; use a separate preview database/bucket if testing unpublished changes. Local use can apply the migration with `--local` and run `npx wrangler pages dev dist`. Use the local Wrangler runtime for API tests; `npm run dev` is a storefront-only preview.

## 3. Private studio

Add encrypted Pages environment secrets, separately for the environments you need:

| Secret | Requirement |
| --- | --- |
| `ADMIN_PASSWORD` | Unique password of at least 16 characters; generated random text recommended |
| `SESSION_SECRET` | Random value of at least 32 characters; keep it independent of the password |

Generate each separately with `openssl rand -hex 32`. Set them in Cloudflare, never in source or client JavaScript. Redeploy. Visit **https://juplifestudio.com/admin/**. Sessions use HTTPS-only HttpOnly cookies and expire after eight hours. Changing the session secret invalidates existing sessions. The sign-in route is rate limited in D1.

Upload media, add titles and image descriptions, choose the destination, and check **Publish on website**. Uploads remain private drafts until published. Newest published homepage image is used. Product photos and videos are assigned to one collection piece. Published originals are accessible on the public website; do not publish confidential content. Large videos need reasonable web compression before upload.

## 4. Stripe in test mode first

Create one-time Stripe prices for the three products and a shipping rate. Add these secrets/values in Cloudflare:

| Name | Value |
| --- | --- |
| `STRIPE_SECRET_KEY` | Server secret key, test mode first |
| `STRIPE_PRICE_COASTERS` | `price_…` for six coasters |
| `STRIPE_PRICE_HOLDER` | `price_…` for the holder |
| `STRIPE_PRICE_STUDIO_SET` | `price_…` for six coasters + holder |
| `STRIPE_SHIPPING_RATE` | `shr_…` from the same Stripe mode |
| `STRIPE_WEBHOOK_SECRET` | Endpoint’s `whsec_…` signing secret |
| `SITE_URL` | `https://juplifestudio.com`, or the test deployment’s own HTTPS origin |
| `SHIPPING_COUNTRIES` | Comma-separated supported two-letter codes; default `US` |
| `STORE_READY` | `true` only when the store is ready to take orders |
| `POLICIES_APPROVED` | `true` only after reviewing and replacing launch-draft policy text |
| `STRIPE_AUTOMATIC_TAX` | Optional `true`, only after Stripe Tax is configured |

All prices in a cart must use the same currency. Prices are read from Stripe on the server; browser-supplied amounts are ignored. No publishable Stripe key is necessary for a hosted Checkout redirect. A live product selling out requires disabling its Stripe price (or setting `STORE_READY=false` to pause the whole shop).

Add a Stripe webhook endpoint at **https://juplifestudio.com/api/stripe/webhook** for:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`

Use the endpoint’s signing secret, not an API key. Configure Stripe business contact details, receipt settings, privacy-policy URL and terms URL (`/shipping-returns`) for hosted Checkout’s required terms consent. Confirm eligibility, tax obligations and shipping coverage for the actual business. The site does not calculate taxes by itself; automatic tax is off unless configured.

## 5. Launch check

Replace concept media with final product photographs and verify the design against the printed product. Update product page specifications and the shipping/returns and privacy drafts with Dee’s approved terms. This includes fulfillment timing, returns window, handling of shipping fees, care instructions, and data retention. Do not simply flip the policy flag while draft text remains.

In a separate Stripe test environment, enable the flags and test a successful card, failed card, cancellation, delayed webhook, repeated webhook delivery, a mobile purchase and administrator media publication. Confirm that unpaid orders cannot be marked fulfilled and paid orders show in `/admin/`. Test product prices and shipping charges against Stripe. Payment completion is confirmed by a signed webhook, not by the thank-you URL.

For production, replace *all* Stripe test IDs and secrets with live-mode equivalents, register the live webhook and verify delivery. Redeploy. Keep preview deployments in collection-preview mode or in a separate Stripe test setup.

Customer and shipping details live in Stripe. Fulfill the order using Stripe’s details; only then mark it fulfilled in the studio. Stripe handles receipts when enabled. Refunds are managed through Stripe. No donation percentage or charity arrangement is implied by the founder story.

## Maintenance

Back up D1 and retain R2 originals according to the final privacy policy. Review Cloudflare and Stripe service usage in their dashboards. Keep secrets out of GitHub. The app’s R2 bucket remains private; its `/media/:id` function controls draft access. Unpublishing removes a media item from the feed immediately, but an already public cached media response may remain accessible for up to one hour.

## Proof of Coin OG six-pack

The public set price is $39 USD. Email ordering is available on `/collection/proof-of-coin`. For a future Stripe checkout, configure `STRIPE_PRICE_PROOF_OF_COIN` to a one-time USD 3900-cent price in the same mode as the other IDs. The server rejects a different price. Existing readiness and policy flags remain in effect. The page includes the authorized Lucky inspiration story; product images remain labeled as design previews.
