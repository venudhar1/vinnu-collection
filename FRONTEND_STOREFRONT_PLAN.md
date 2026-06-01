# Saree Sales Frontend + Storefront Plan

## Objective
Build a modern, premium saree web experience with two connected surfaces on top of the current backend:

1. Admin App (internal inventory operations)
2. Storefront (customer browsing and buying)

This plan avoids copying competitor sites directly and instead borrows proven UX patterns while preserving a distinct brand identity.

## Current Backend Capabilities (Available Now)
- API key generation and revocation
- Sets CRUD
- Items (color variants) CRUD within sets
- Bulk actions:
  - Mark sold
  - Adjust inventory quantities
- Inventory summary API

## Gap Analysis for Full E-commerce
Current APIs are inventory-centric. Storefront buying flow requires additional backend support:

1. Public catalog endpoints (customer-safe, no private admin data)
2. Product media and richer merchandising fields:
   - images
   - fabric, occasion, style, work type, blouse details, etc.
3. Cart and checkout APIs
4. Order placement and order history APIs
5. Payment integration (Razorpay/Stripe)
6. Stock reservation and reduction logic during checkout
7. Customer identity/session model (guest + logged-in options)

## Product Architecture
Single codebase frontend with route-level separation:

1. `/admin/*` for staff operations
2. `/shop/*` for storefront

Shared backend service and shared design system, with role/public API boundaries.

## Proposed Tech Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS + component primitives
- TanStack Query for API state
- Zod for validation
- Framer Motion for purposeful animation

## UX Direction (Inspired, Not Copied)
- Editorial hero storytelling for key collections
- High-quality product cards with rich swatch/price metadata
- Strong filtering and sorting patterns
- Distinct typography, color system, spacing, and motion signature
- Mobile-first with premium desktop refinement

## Phased Delivery Plan

## Phase 1: Foundation
1. Scaffold frontend app
2. Set design tokens (colors, type, spacing, shadows)
3. Build shared layout shell (header/nav/footer, responsive containers)
4. Implement API client + environment config

## Phase 2: Admin App (Uses Existing APIs)
1. API key setup screen
2. Dashboard using inventory summary
3. Sets management (list/create/edit/delete)
4. Items management per set (color/SKU/qty/price/status)
5. Bulk actions UI (mark sold, adjust inventory)
6. Tables + card views + mobile actions

## Phase 3: Storefront MVP (Requires Backend Additions)
1. Public catalog listing page
2. Product detail page
3. Search/filter/sort UX
4. Basic cart experience (client + server cart)

## Phase 4: Checkout + Orders
1. Address and shipping form
2. Payment gateway integration
3. Order creation and confirmation
4. Order status and admin visibility

## Phase 5: Polish and Launch Readiness
1. Loading/empty/error states
2. Accessibility and performance pass
3. SEO essentials for storefront pages
4. QA checklist and release prep

## Backend Change Backlog (Planned)
1. Add product media support to models and APIs
2. Add public catalog routes
3. Add cart model and APIs
4. Add order model and APIs
5. Add payment webhook handling
6. Add transactional inventory safety checks

## Delivery Sequence Recommendation
1. Complete Phase 1 + Phase 2 first (fastest value, uses existing backend)
2. Implement minimum backend additions for public catalog
3. Build storefront MVP
4. Add checkout and payments
5. Harden and launch

## Success Criteria
1. Staff can manage inventory without Swagger
2. Customers can browse and place orders from storefront
3. Stock updates stay consistent across admin and storefront
4. UI feels premium, modern, and brand-distinct

## Immediate Next Step
Finalize backend extension spec for storefront (new models + endpoints), then start Phase 1 implementation.
