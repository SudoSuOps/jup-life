# JUP LIFE by MRS SMASH

A coastal storefront for **juplifestudio.com**, with a private media studio and Stripe-hosted checkout. The founder story celebrates a mom of four, a wife to one, and the family’s anniversary: **Est. 10.23.99**. That date describes their roots, not the business incorporation date.

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

Follow [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for D1, R2, admin credentials, Stripe, and the launch check. Do not turn on checkout until real products, approved policies and tested payments are ready.

## What’s included

- Responsive storefront, three product pages, saved bag, founder story, contact links, social metadata and local fonts.
- Private `/admin/` studio: password sign-in, image/video uploads with progress, drafts, captions, publication controls, deletion, payment status and fulfillment tracking.
- Published media can replace the homepage image, update a product’s photograph, add a product video, or appear as a studio note.
- Server-selected Stripe prices, hosted checkout, shipping-address collection and signed webhook events. A redirect alone never marks an order paid.
- Private R2 originals delivered through same-origin media routes, with byte-range video support. D1 stores metadata, order state and rate-limit counters.

## Launch state

**Collection preview** is the default. There are no invented selling prices. Product imagery is clearly labeled AI-created studio concepts; it is not manufacturing evidence. Final photos, dimensions, colors, care details, stock/production arrangements, shipping timing, returns and retention periods need Dee’s real business decisions before taking payments. A donation program or charity percentage is not claimed.

This is a small studio catalog, not an inventory management system. There is no automated stock reservation, refund interface, carrier integration or customer email sender. Use Stripe for customer/shipping details, receipts and refunds. Admin “fulfilled” records an internal state; it does not send tracking. Uploaded media limits: images 20 MB; videos 75 MB. Original videos are served without transcoding.

## Brand and contact

Two chairs, from behind, facing one wave. Ocean teal, warm ivory, sand, a quiet editorial serif. Contact **dee@juplifestudio.com**, **561.532.7120**, **@juplifestudio** on X.

Generated concept imagery is included as compressed WebP files. SVG brand marks are resolution independent. The locally hosted Nimbus Roman font’s license is in `docs/FONT-LICENSE.txt`.
