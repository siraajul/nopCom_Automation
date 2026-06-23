# Step 1: Identify Key Areas (40 marks)

**Assignment:** Automation on https://demo.nopcommerce.com/
**Deliverable:** 8 selected features/pages to automate, each with its business / QA benefit.

---

## Selected Features

I selected the **8 features** below because, together, they cover the *complete
critical path* of an e-commerce store — account access, product discovery, the
revenue funnel, store-wide settings, and customer support. These are the areas
exercised by almost every visitor, so a regression in any of them has the
highest business impact, which makes them the highest-value candidates for
automation.

| # | Feature | Page / URL | Why automating it is beneficial (business & QA benefit) |
|---|---------|------------|----------------------------------------------------------|
| 1 | **User Registration** | `/register` | Account creation is the entry point to the entire customer lifecycle. It is a validation-heavy form (email format, password strength, confirm-password match). Re-testing every rule by hand on each release is slow and error-prone — automation guarantees the sign-up funnel stays open and conversion isn't silently broken. |
| 2 | **Login** | `/login` | Login is repeated by *every* returning customer and is a prerequisite for checkout, order history and wishlist. Automating it removes large amounts of repetitive manual regression effort and protects against an authentication bug that could lock out **all** users at once. |
| 3 | **Product Search** | header search / `/search` | Search is the primary way customers find products; broken or irrelevant search directly reduces sales. Automated checks for valid results, no-result handling, and input validation catch search/indexing regressions immediately. |
| 4 | **Add to Cart** | product page / `/cart` | The cart is the core of the purchase funnel — bugs here (item not added, wrong totals, broken coupons) directly cost revenue. Automation verifies the add-to-cart action, quantity updates and coupon validation on every build. |
| 5 | **Wishlist** | product page / `/wishlist` | Wishlist drives re-engagement and later purchases. It shares logic with the cart and is easy to overlook in manual testing, so automated coverage protects a revenue-influencing feature that is otherwise rarely re-tested. |
| 6 | **Currency Change** | header currency selector | An international store must show correct prices per currency. Currency switching touches **every** price label on the site, so a regression is highly visible and embarrassing. Automation confirms prices re-render and the choice persists across navigation. |
| 7 | **Newsletter Subscription** | footer (every page) | Newsletter sign-up feeds marketing/lead generation and appears on every page. It is a small but high-frequency input with its own validation (valid vs. invalid email). Automating it ensures lead capture keeps working and the validation messages stay correct. |
| 8 | **Contact Us** | `/contactus` | The contact form is the customer's support lifeline and a common source of validation/spam bugs. Automated coverage ensures genuine enquiries are accepted while invalid input is correctly rejected. |

---

## Why these 8 (coverage rationale)

- **Account lifecycle** — Registration + Login cover the authentication surface.
- **Shopping funnel** — Search → Add to Cart → Wishlist cover discovery and the
  revenue path end-to-end.
- **Store-wide UX** — Currency Change and Newsletter appear on *every* page, so a
  regression there has the widest blast radius.
- **Support path** — Contact Us covers post-sale / customer-service interaction.

Each selected feature is automated with **happy-path, negative, and edge-case**
scenarios (see Step 2), so the suite proves not only that each feature works,
but that it correctly rejects invalid input and handles boundary conditions.

---

## Bonus: 9th feature — End-to-End Checkout

Beyond the required 8, I also automated the **full end-to-end checkout journey**
(`/cart` → `/onepagecheckout`) — the single most important flow on the store,
because it is the path that actually takes money. It stitches the other features
together (search → add to cart → cart → checkout → order placed) and is
automated **three ways** — as a **guest**, as a **logged-in user**, and
**register-then-buy** — because each customer type takes a slightly different
checkout path and all three must keep working.

