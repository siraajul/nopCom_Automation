---
pageClass: page-wide
aside: false
---

# Step 1: Identify Key Areas

**Assignment:** Automation on https://demo.nopcommerce.com/
**Deliverable:** 8 features/pages to automate, each with its business / QA benefit.

---

## The eight features

The way I picked these: walk through what an actual shopper does, from making an
account to handing over money, and automate the steps that nearly everyone
touches. Those are the ones where a regression hurts the most and where manual
re-testing every release wastes the most time, which is the whole point of
automating in the first place.

| # | Feature | Page / URL | Why it's worth automating |
|---|---------|------------|----------------------------|
| 1 | User Registration | `/register` | This is where a customer's whole relationship with the store starts, and it's a form full of validation rules: email format, password strength, matching confirmation. Checking all of those by hand every release is tedious and easy to get wrong. Automate it once and the signup path stays honest. |
| 2 | Login | `/login` | Every returning customer does this, and checkout, order history, and wishlist all depend on it. It's the definition of repetitive manual regression, and an auth bug here doesn't lock out one user, it locks out everyone. |
| 3 | Product Search | header search / `/search` | Search is how people find things to buy, so when it breaks, sales drop quietly. The tests cover real results, the empty-results case, and the minimum-length validation, which catches indexing and UX regressions fast. |
| 4 | Add to Cart | product page / `/cart` | The cart is where money starts changing hands, so the expensive bugs live here: items that don't add, wrong totals, coupons that misbehave. The tests check the add, a quantity change, and coupon validation on every run. |
| 5 | Wishlist | product page / `/wishlist` | Wishlist is what brings people back to buy later, and it reuses a lot of cart logic. It's also the kind of thing that quietly rots because nobody manually re-tests it, which is exactly why it's worth covering. |
| 6 | Currency Change | header currency selector | An international store has to show the right prices in the right currency, and switching touches every price on the page. A bug here is loud and embarrassing. The tests confirm prices re-render in euros and the choice sticks as you move around the site. |
| 7 | Newsletter Subscription | footer (every page) | Sign-up sits on every page and feeds the marketing list, so it gets a lot of traffic for such a small input. It has its own validation, and the tests make sure a good email signs up and a bad one gets the right error. |
| 8 | Contact Us | `/contactus` | This is how customers reach support, and contact forms are a classic spot for validation bugs. The tests confirm a real enquiry goes through and junk input gets turned away. |

---

## Why these eight

Grouped by where they sit in the journey:

- **Getting in.** Registration and Login cover the whole authentication surface.
- **Shopping.** Search, then Add to Cart, then Wishlist trace the path from
  finding a product to almost buying it.
- **Everywhere at once.** Currency and Newsletter show up on every page, so a
  bug in either is visible site-wide.
- **After the sale.** Contact Us covers reaching support.

Each one gets a happy path, a negative case, and an edge case (that's Step 2), so
the suite proves the feature works *and* that it pushes back on bad input.

---

## Bonus: a ninth feature, end-to-end checkout

On top of the required eight I added the full checkout journey
(`/cart` → `/onepagecheckout`). It's the most important flow on the store for the
obvious reason: it's the one that takes the money. It also ties the other features
together, going search → add to cart → cart → checkout → order placed in a single
run. I automated it three ways, as a guest, as a logged-in user, and registering
then buying, because each of those takes a slightly different path through
checkout and all three have to keep working.
