# One More Chapter

$19 for the gold driftwood reader and the TPU 95A cradle together. Reader 116 x 43 x 8 mm; cradle 132 x 36 x 14 mm.

STRIPE_PRICE_ONE_MORE_CHAPTER must point to a one-time USD 1900-cent price. The server compares the Stripe price with data/products.json and refuses to sell on a mismatch, so the product is not buyable until the variable (in wrangler.jsonc, which is the source of truth) holds a $19 price ID. Preview needs its own sandbox price.
