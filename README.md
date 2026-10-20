# JUP LIFE by MRS SMASH

A coastal storefront for **juplifestudio.com**, with a private media studio and Stripe-hosted checkout. The founder story celebrates a mom of four, a wife to one, and the family’s anniversary: **Est. 10.23.99**. That date describes their roots, not the business incorporation date.

[View the desktop design preview](docs/site-preview.webp) · [Verification results](docs/VERIFICATION.md)

## Run

Node 22+ and Python 3 (for one real SQLite test). No application dependencies or build-time downloads.

```sh
npm run dev        # http://localhost:4173, storefront preview
npm run check      # syntax + local HTML references
npm test           # backend/payment/security tests
npm run build      # static output in dist/
```

The lightweight preview intentionally has no production secrets or database. For the full Cloudflare runtime, use `npx wrangler pages dev dist` after configuring local bindings and `.dev.vars` from the example. Never commit that file.

## Connect Cloudflare Pages

Connect **SudoSuOps/jup-life**, branch **main**. Framework preset **None**, build command **npm run build**, output directory **dist**, root directory repository root. Set Node version to **22**. Cloudflare discovers the root `functions/` directory alongside the build output; this app uses Pages Functions, not a separately deployed Worker. Add **juplifestudio.com** as the custom domain. The site can be deployed in collection-preview mode before any commerce setup.

Production deploys are triggered automatically by pushes to `main`.

Follow [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for D1, R2, admin credentials, Stripe, and the launch check. Do not turn on checkout until real products, approved policies and tested payments are ready.

## Editing products and pages

- **`data/products.json`** is the one place for each product's name, price (in cents), description, status (`buyable` or `coming-soon`), image and the Cloudflare variable that holds its Stripe price ID. The server, the shop grids, the FAQ, the product pages' structured data and the checks all read from it.
- After editing it, run **`npm run render`**. That rewrites every price/name mention, the card grids, the shared header and sticky buttons, Product JSON-LD, the CSP script hashes, asset and CSS/JS version strings and the AVIF `<picture>` sources. `npm run check` fails if anything is out of date, if a price in the HTML is not in the data file, or if banned wording (PETG, Lucky Shuck, "AI concept"…) comes back.
- To add real product photos: put the WebP in `public/assets/`, run `npm i --no-save sharp && node scripts/optimize-images.mjs` for AVIF and small variants, point the product's `image` fields at it, set `imageKind` to `photo`, then `npm run render`. The “studio rendering” note disappears when no product in the grid is a rendering.

## Restaurants & bars

`/restaurants` has a free sample-pack request form. It posts to `functions/api/restaurant-request.js`, which emails Dee through the existing Resend setup (`RESEND_API_KEY`, optional `CONTACT_TO` and `CONTACT_FROM`), attaches the logo (PNG, JPG, SVG, WebP or PDF, up to 4 MB) and sends the requester a thank-you. No storage bucket is needed.

## Cloudflare Web Analytics

The CSP allows Cloudflare's analytics beacon (`static.cloudflareinsights.com`, reporting to `cloudflareinsights.com`). To turn analytics off, disable it in the Cloudflare dashboard and remove those two hosts in `scripts/render.mjs`.

## What’s included

- Responsive storefront, three product pages, saved bag, founder story, contact links, social metadata and local fonts.
- Private `/admin/` studio: password sign-in, image/video uploads with progress, drafts, captions, publication controls, deletion, payment status and fulfillment tracking.
- Published media can replace the homepage image, update a product’s photograph, add a product video, or appear as a studio note.
- Server-selected Stripe prices, hosted checkout, shipping-address collection and signed webhook events. A redirect alone never marks an order paid.
- Private R2 originals delivered through same-origin media routes, with byte-range video support. D1 stores metadata, order state and rate-limit counters.

## Launch state

**Collection preview** is the default. There are no invented selling prices. Product imagery is labeled as studio renderings until real photos replace it. Final photos, dimensions, colors, care details, stock/production arrangements, shipping timing, returns and retention periods need Dee’s real business decisions before taking payments. A donation program or charity percentage is not claimed.

This is a small studio catalog, not an inventory management system. There is no automated stock reservation, refund interface, carrier integration or customer email sender. Use Stripe for customer/shipping details, receipts and refunds. Admin “fulfilled” records an internal state; it does not send tracking. Uploaded media limits: images 20 MB; videos 75 MB. Original videos are served without transcoding.

## Brand and contact

Two chairs, from behind, facing one wave. Ocean teal, warm ivory, sand, a quiet editorial serif. Contact **dee@juplifestudio.com**, **561.532.7120**, **@juplifestudio** on X.

Generated concept imagery is included as compressed WebP files. SVG brand marks are resolution independent. The locally hosted Nimbus Roman font’s license is in `docs/FONT-LICENSE.txt`.
