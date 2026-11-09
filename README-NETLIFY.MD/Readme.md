# Beth's Pet Store

A mobile-first, marketplace-oriented pet store experience for Nigeria and international discovery.

## Project structure
- index.html — homepage
- shop.html — concept catalogue with search, filters, sorting, preview bag and wishlist
- sell.html — seller interest form; seller-thanks.html — confirmation
- care.html — starter pet-care journal
- about, adoption, community, contact, events, FAQ, feedback, gallery, partnerships, services, success-stories, support, terms and privacy pages
- styles/marketplace.css — responsive visual system and 3D-style product-card effects
- scripts/marketplace.js — preview catalogue interactions
- scripts/site.config.js — public-only site settings
- assets/beths-mark.svg — custom SVG mark
- images/ — existing pet and product imagery
- supabase/schema.sql — database blueprint (not deployed)
- docs/MARKETPLACE-READINESS.md — launch and integration checklist

## Local preview
Open index.html in a browser or serve the repository root with a static development server. The current preview is static HTML/CSS/JavaScript and has no build step.

## Netlify
The publish directory is the repository root. Netlify Forms markup is included for seller applications, contact, support and feedback. Verify form capture in the Netlify dashboard after deployment; a successful page render alone does not prove a form has been received.

## Important: not a live store yet
The sample catalogue and its USD prices/discounts are illustrative. The shopping bag and wishlist are stored in the visitor's browser only. Checkout is disabled. There are no live seller accounts, approved product listings, payment collection, order fulfilment, seller payouts or live inventory yet.

The Supabase schema is a starting blueprint and has not been applied to a database. No credentials or private keys belong in this repository.

## Before accepting money
Follow docs/MARKETPLACE-READINESS.md. A real merchant/payment account, verified settlement destination, backend, payment webhook verification, seller approval, refund policy, shipping arrangements and legal review are required before transactions begin.

## Privacy and safety
Do not commit private addresses, location coordinates, passwords, access tokens, API keys, payment credentials or identity documents. Never fabricate customer reviews, seller ratings, product availability, adoption listings or delivery guarantees.
