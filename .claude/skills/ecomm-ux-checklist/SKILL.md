---
name: ecomm-ux-checklist
description: Frontend and UI/UX review checklist for an ecommerce storefront — navigation, search UI, homepage, category/PLP, product detail, cart, checkout, account screens, luxury layer, mobile, component states, accessibility, failure states, and perceived performance. Use when auditing, reviewing, or building any storefront surface, or when asked what is still missing from a shop build.
---

# Ecommerce UI/UX checklist

Scope: what the browser renders and what the visitor experiences. Backend
concerns (relevance engines, payment processing, tax calculation, fulfilment,
legal copy authoring) are out of scope here — only their presentation layer
appears below.

How to use it: walk one section at a time against the running build, not
against the code. Mark each line **ok**, **missing**, or **n/a** with a reason.
A line is only ok if you have seen it. `where relevant` means the house may
decide it does not apply: say so rather than leaving it blank.

## 01 Global navigation

- [ ] Logo links to homepage
- [ ] Primary navigation is immediately understandable
- [ ] Categories have a logical hierarchy
- [ ] Search is reachable from every page
- [ ] Cart is globally accessible
- [ ] Cart item count is visible
- [ ] Account/login is accessible
- [ ] Wishlist is accessible where relevant
- [ ] Support/contact is reachable from the chrome
- [ ] Navigation works without relying solely on hover
- [ ] Mobile navigation is easy to operate
- [ ] Header does not consume excessive mobile viewport
- [ ] Breadcrumbs where they improve orientation
- [ ] Shipping/location context shown where relevant

## 02 Search UI

- [ ] Search entry point available site-wide
- [ ] Autocomplete/suggestion panel
- [ ] Product suggestions in the panel
- [ ] Category suggestions where relevant
- [ ] Suggestions respond to partial terms
- [ ] Results can be filtered
- [ ] Results can be sorted
- [ ] Query stays visible on the results page
- [ ] Result count/context is clear
- [ ] Zero-results state offers alternatives
- [ ] Search is never a dead end

## 03 Homepage

- [ ] Store proposition is clear immediately
- [ ] Primary categories are discoverable
- [ ] Main products are discoverable
- [ ] Primary CTA is obvious
- [ ] Promotional content does not obscure navigation
- [ ] Featured products are clickable
- [ ] Featured collections are clickable
- [ ] Bestsellers where relevant
- [ ] New arrivals where relevant
- [ ] Brand story entry point where relevant
- [ ] Trust signals
- [ ] Shipping/returns proposition
- [ ] Support access
- [ ] No dead-end sections
- [ ] No unnecessary carousel dependence
- [ ] Useful without excessive scrolling

## 04 Category / PLP

### Product cards
- [ ] Image is immediately understandable
- [ ] Consistent image treatment across cards
- [ ] Product name
- [ ] Price
- [ ] Sale price where relevant
- [ ] Original price where relevant
- [ ] Rating/review count where relevant
- [ ] Availability where relevant
- [ ] Badges used sparingly and meaningfully
- [ ] Variant information where relevant
- [ ] Multiple thumbnails where useful
- [ ] Image and title lead to the expected destination
- [ ] Card hierarchy is easy to scan

### Filtering
- [ ] Category-specific filters
- [ ] Price
- [ ] Brand where relevant
- [ ] Rating where relevant
- [ ] Size
- [ ] Colour
- [ ] Material/specification filters where relevant
- [ ] Multiple selections within a filter
- [ ] Applied filters are visible
- [ ] Individual filters can be removed
- [ ] Clear-all
- [ ] Filter state persists on back-navigation
- [ ] Mobile filter experience is clear
- [ ] Filter actions give obvious feedback
- [ ] Result count updates

### Sorting
- [ ] Relevance
- [ ] Price low to high
- [ ] Price high to low
- [ ] Newest where relevant
- [ ] Rating where relevant
- [ ] Category-specific options where relevant

### Listing behaviour
- [ ] Pagination or load-more is clear
- [ ] Loading state
- [ ] Empty state
- [ ] No-results state
- [ ] Variations consolidated sensibly
- [ ] Recently viewed where useful
- [ ] Compare where useful
- [ ] Wishlist/save where relevant

## 05 Product detail page

### Above the fold
- [ ] Product name
- [ ] Brand
- [ ] Rating
- [ ] Review count
- [ ] Main image
- [ ] Gallery
- [ ] Price
- [ ] Sale information where applicable
- [ ] Availability
- [ ] Variant selectors
- [ ] Quantity
- [ ] Primary purchase CTA
- [ ] Secondary purchase CTA where appropriate
- [ ] Shipping information
- [ ] Delivery estimate
- [ ] Returns information
- [ ] Accepted payment shown legibly

### Imagery
- [ ] Multiple views
- [ ] Detail/close-up view
- [ ] Back/side views where relevant
- [ ] Scale/context image where useful
- [ ] Lifestyle or editorial image where useful
- [ ] Zoom
- [ ] Mobile gallery works correctly
- [ ] Images change with the selected variant

### Variants
- [ ] Options are clearly labelled
- [ ] Selected option is unmistakable
- [ ] Unavailable combinations are obvious
- [ ] Required selections cannot be missed
- [ ] Price updates correctly
- [ ] Availability updates correctly
- [ ] Imagery updates correctly

### Information
- [ ] Concise summary
- [ ] Key benefits/features
- [ ] Full description
- [ ] Specifications
- [ ] Dimensions
- [ ] Materials
- [ ] What is included
- [ ] Care/use information
- [ ] Compatibility where relevant
- [ ] Documentation where relevant

### Confidence
- [ ] Shipping cost/threshold
- [ ] Delivery estimate
- [ ] Returns
- [ ] Warranty
- [ ] Authenticity where relevant
- [ ] Support route
- [ ] Financing/instalments where relevant
- [ ] Stock status
- [ ] Purchase expectations are unambiguous

## 06 Reviews / social proof

- [ ] Rating displayed near the product title
- [ ] Review count
- [ ] Rating distribution
- [ ] Review filtering
- [ ] Review sorting
- [ ] Photo/video reviews where relevant
- [ ] Verified-purchase indicator where applicable
- [ ] Questions/Q&A where useful
- [ ] Reviews stay easy to scan

## 07 Cart

- [ ] Product image
- [ ] Product name
- [ ] Selected variants
- [ ] Quantity controls
- [ ] Remove
- [ ] Save for later where appropriate
- [ ] Unit price
- [ ] Line total
- [ ] Subtotal
- [ ] Discount line
- [ ] Shipping shown or clearly deferred
- [ ] Tax shown or clearly deferred
- [ ] Estimated total
- [ ] Checkout CTA
- [ ] Continue shopping
- [ ] Stock changes communicated in place
- [ ] Recommendations do not obstruct checkout

## 08 Checkout

### Entry
- [ ] Guest checkout is offered
- [ ] Account creation is optional
- [ ] Login available without being forced
- [ ] Recovery route where relevant

### Forms
- [ ] Minimum necessary fields
- [ ] Clear labels
- [ ] Required/optional states
- [ ] Autofill works
- [ ] Correct mobile keyboard per field
- [ ] Address autocomplete where available
- [ ] Billing-same-as-shipping option
- [ ] Inline validation
- [ ] Error messages say how to fix it
- [ ] Entered information survives an error

### Shipping
- [ ] Options are legible and comparable
- [ ] Cost per option
- [ ] Delivery estimate per option
- [ ] Pickup option where relevant
- [ ] Restrictions communicated before the last step

### Payment
- [ ] Available methods are legible and selectable
- [ ] Promo code entry
- [ ] Payment errors surfaced clearly and recoverably
- [ ] Security reassurance at the point of entry

### Review
- [ ] Products
- [ ] Variants
- [ ] Quantities
- [ ] Shipping
- [ ] Taxes
- [ ] Discounts
- [ ] Payment method
- [ ] Final total
- [ ] Place-order CTA
- [ ] Terms/consent where required

## 09 Order confirmation

- [ ] Unmistakable success state
- [ ] Order number
- [ ] Purchased products
- [ ] Total
- [ ] Shipping address
- [ ] Delivery estimate
- [ ] Payment summary
- [ ] Tracking path
- [ ] Support path
- [ ] Continue shopping
- [ ] Optional account creation

## 10 Account / post-purchase screens

- [ ] Order history list
- [ ] Order detail view
- [ ] Tracking surface
- [ ] Reorder where relevant
- [ ] Returns entry point
- [ ] Refund status display
- [ ] Receipt/invoice access
- [ ] Saved addresses
- [ ] Saved payment methods
- [ ] Wishlist
- [ ] Support entry point
- [ ] Review submission
- [ ] Every one of the above has an empty state

## 11 High-end / luxury layer

Additive, not a substitute for the sections above. The goal is less visible
friction and less visual noise, never less functionality.

### Brand experience
- [ ] Brand story is discoverable
- [ ] Product story supports the brand
- [ ] The design feels intentionally branded
- [ ] Typographic hierarchy feels premium
- [ ] Imagery reads editorial rather than catalogue
- [ ] Whitespace is intentional
- [ ] Visual hierarchy is restrained
- [ ] Promotional UI does not cheapen the presentation
- [ ] No pile-up of badges or urgency devices

### Product storytelling
- [ ] Craftsmanship
- [ ] Materials
- [ ] Origin/provenance where relevant
- [ ] Design story
- [ ] Detail imagery
- [ ] Product history where relevant
- [ ] Care information
- [ ] Certification/authenticity where applicable

### Service surfaces
- [ ] Concierge/contact option
- [ ] Personal assistance
- [ ] Gift wrapping
- [ ] Gift message
- [ ] Appointment booking where relevant
- [ ] Personal shopping/styling where relevant
- [ ] Premium delivery options
- [ ] Aftercare/service information

### Purchase confidence
- [ ] Authenticity reassurance
- [ ] Warranty/guarantee
- [ ] Secure payment reassurance
- [ ] The delivery experience is explained
- [ ] The returns experience is explained
- [ ] Human support is easy to reach
- [ ] Availability/scarcity is communicated truthfully

## 12 Mobile

Review mobile as its own pass, not as a resize.

- [ ] Search reachable immediately
- [ ] Navigation is thumb-friendly
- [ ] Filters are usable
- [ ] Sort is usable
- [ ] Gallery is swipeable
- [ ] Variant selectors are easy to operate
- [ ] Add to cart is easy to reach
- [ ] Sticky purchase CTA considered
- [ ] No sticky element obscures content
- [ ] Forms are easy to complete
- [ ] Autofill works
- [ ] Checkout adds no extra steps
- [ ] No horizontal overflow
- [ ] Tap targets are large enough
- [ ] Loading states work
- [ ] Slow-network experience considered

## 13 Component / interaction states

Check every important interactive component for all of these. A build can look
right in the happy path and fall apart in real commerce states.

- [ ] Default
- [ ] Hover
- [ ] Focus
- [ ] Active
- [ ] Selected
- [ ] Disabled
- [ ] Loading
- [ ] Success
- [ ] Error
- [ ] Empty
- [ ] Out of stock
- [ ] Low stock
- [ ] Sale
- [ ] Preorder/backorder where relevant

## 14 Accessibility

- [ ] Keyboard navigation reaches everything
- [ ] Visible focus states
- [ ] Logical heading hierarchy
- [ ] Semantic controls (a button is a button)
- [ ] Form labels
- [ ] Accessible error messaging
- [ ] Alt text
- [ ] Sufficient contrast
- [ ] Colour is never the only status indicator
- [ ] Accessible dropdowns
- [ ] Accessible drawers/modals
- [ ] Accessible carousels
- [ ] Accessible variant selectors
- [ ] Accessible quantity controls

## 15 Trust surfaces

The frontend obligation is reachability and legibility, not the wording.

- [ ] Contact information reachable
- [ ] Shipping policy reachable from cart and PDP
- [ ] Returns policy reachable from cart and PDP
- [ ] Privacy policy reachable
- [ ] Terms reachable
- [ ] Warranty reachable where relevant
- [ ] Payment information reachable
- [ ] Customer service reachable
- [ ] Store/physical presence where relevant

## 16 Failure states

Do not only test the ideal path. Each of these needs a designed screen or
region, not a thrown error.

- [ ] No search results
- [ ] No products in category
- [ ] Out of stock
- [ ] Selected variant unavailable
- [ ] Product discontinued
- [ ] Cart item unavailable
- [ ] Shipping unavailable
- [ ] Invalid address
- [ ] Payment declined
- [ ] Invalid promo code
- [ ] Session expired
- [ ] Network failure
- [ ] API failure
- [ ] Loading
- [ ] Empty account
- [ ] Empty wishlist
- [ ] Empty cart

## 17 Perceived performance

- [ ] Images optimised
- [ ] Below-the-fold product images lazy-load
- [ ] Above-the-fold content loads quickly
- [ ] Search feels responsive
- [ ] Filter interactions feel responsive
- [ ] Cart updates without a full page reload
- [ ] Checkout interactions feel responsive
- [ ] Loading states prevent perceived dead clicks
- [ ] Mobile performance checked on a throttled connection
- [ ] No animation delays the purchase journey

## Reporting

Report by section, worst first. For each gap give the route, the component
file, and one sentence on the visitor consequence. Do not pad the report with
lines that are genuinely not applicable to the house: list those once, at the
end, as explicitly out of scope.
