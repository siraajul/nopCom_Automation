# Step 2 — Test Scenarios

For each of the 8 features there are at least **3 scenario types**:
**Pass** (expected positive flow), **Fail** (negative validation), and
**Edge** (boundary / unexpected behaviour). Each row maps 1:1 to an automated
test in the suite (see the spec file noted per feature).

Legend: **P** = Pass, **F** = Fail, **E** = Edge.
General precondition for every test: the nopCommerce demo store is reachable and
the home page has loaded (Cloudflare interstitial cleared).

---

## 1. User Registration — `tests/registration.spec.ts`

| ID | Type | Precondition | Steps | Expected Result |
|----|------|--------------|-------|-----------------|
| REG-P1 | P | On `/register`, email not yet used | Select gender → enter first/last name, unique email, valid password + matching confirm → click **Register** | "Your registration completed" is shown and the user is logged in (Log out link visible). Runs data-driven for a male and a female profile. |
| REG-F1 | F | An account already exists with email X | Open `/register` → fill the form using email X → **Register** | Error summary shows **"The specified email already exists"**; no new account created. |
| REG-E1 | E | On `/register` | Enter an invalid email format, a 3-char password, and a non-matching confirm password → **Register** | Inline field errors appear: email "Wrong email", password length error, and "The password and confirmation password do not match." |

## 2. Login — `tests/login.spec.ts`

| ID | Type | Precondition | Steps | Expected Result |
|----|------|--------------|-------|-----------------|
| LOG-P1 | P | A registered account exists (created by fixture) | Open `/login` → enter valid email + password → **Log in** | User is authenticated; Log out link visible and account link shows the email. |
| LOG-F1 | F | — | Open `/login` → enter an **unknown email** + password → **Log in** | Login rejected, error "No customer account found"; user stays unauthenticated. (Data-driven) |
| LOG-F2 | F | — | Open `/login` → leave **email empty** → **Log in** | Field validation "Please enter your email"; not authenticated. (Data-driven) |
| LOG-F3 | F | — | Open `/login` → enter a **malformed email** → **Log in** | Validation "Please enter a valid email address"; not authenticated. (Data-driven) |
| LOG-E1 | E | A registered account exists | Open `/login` → enter the **correct email** but a **wrong password** → **Log in** | Error summary shown; user not authenticated. |

## 3. Product Search — `tests/search.spec.ts`

| ID | Type | Precondition | Steps | Expected Result |
|----|------|--------------|-------|-----------------|
| SRCH-P1 | P | On home page | Type a real keyword (`laptop`, `phone`, `book`) in the header search → **Search** | At least one product is returned and the result titles contain the keyword. (Data-driven over 3 keywords.) |
| SRCH-F1 | F | On home page | Search for a gibberish term (`zxqwvbnmasdf123`) → **Search** | "No products were found" message; zero results. |
| SRCH-E1 | E | On home page | Search for a 2-character term (`ab`) → **Search** | Warning "Search term minimum length is 3 characters". |

## 4. Add to Cart — `tests/addToCart.spec.ts`

| ID | Type | Precondition | Steps | Expected Result |
|----|------|--------------|-------|-----------------|
| CART-P1 | P | On product page (HTC smartphone) | Click **Add to cart** | Success toast "The product has been added to your shopping cart"; cart counter increases by 1; cart page shows the line item. |
| CART-F1 | F | Cart contains a product | Open `/cart` → enter an invalid coupon code → **Apply coupon** | Failure message "The coupon code cannot be found". |
| CART-E1 | E | Cart contains a product | Open `/cart` → change the line quantity to **3** | Quantity field shows 3 and cart counter shows (3); totals recalculated. |

## 5. Wishlist — `tests/wishlist.spec.ts`

| ID | Type | Precondition | Steps | Expected Result |
|----|------|--------------|-------|-----------------|
| WISH-P1 | P | On product page (HTC smartphone) | Click **Add to wishlist** | Success toast "The product has been added to your wishlist"; wishlist counter shows (1); item appears on `/wishlist`. |
| WISH-F1 | F | Fresh session, nothing added | Open `/wishlist` | Empty-state message "The wishlist is empty!". |
| WISH-E1 | E | A product is in the wishlist | Open `/wishlist` → tick the item → **Add to cart** | User is taken to `/cart` and the item is present in the cart. |

## 6. Currency Change — `tests/currency.spec.ts`

| ID | Type | Precondition | Steps | Expected Result |
|----|------|--------------|-------|-----------------|
| CUR-P1 | P | On home page (default USD) | Choose **Euro** in the currency selector | Product prices re-render with the **€** symbol. |
| CUR-F1 | F | On home page | Inspect the currency selector options; attempt to select an unsupported currency ("Bitcoin") | Only "US Dollar" and "Euro" are offered; selecting an unsupported value throws / is impossible (input is constrained). |
| CUR-E1 | E | On home page | Switch to **Euro** → navigate to a search results page | Euro stays selected and prices still display **€** after navigation (selection persists). |

## 7. Newsletter Subscription — `tests/newsletter.spec.ts`

| ID | Type | Precondition | Steps | Expected Result |
|----|------|--------------|-------|-----------------|
| NEWS-P1 | P | On any page (footer visible) | Enter a valid unique email → **Subscribe** | Result block shows "Thank you for signing up …". |
| NEWS-F1 | F | On any page | Enter a malformed email (`plainaddress`) → **Subscribe** | Error "Enter valid email". |
| NEWS-E1 | E | On any page | Leave the email empty → **Subscribe** | Error "Enter valid email" (empty boundary rejected). |

## 8. Contact Us — `tests/contactUs.spec.ts`

| ID | Type | Precondition | Steps | Expected Result |
|----|------|--------------|-------|-----------------|
| CON-P1 | P | On `/contactus` | Enter name, valid email, enquiry text → **Send** | "Your enquiry has been successfully sent to the store owner …" confirmation. |
| CON-F1 | F | On `/contactus` | Enter name, **invalid email**, enquiry → **Send** | Inline email validation "Wrong email"; enquiry not sent. |
| CON-E1 | E | On `/contactus` | Enter a **very long** (~3,300 char) enquiry body with valid name/email → **Send** | Long body accepted; success confirmation shown (boundary input handled). |

## 9. End-to-End Checkout — `tests/e2e-checkout.spec.ts`

Three complete purchase journeys (guest, logged-in user, and register-then-buy)
plus negative/edge coverage of the checkout gate.

| ID | Type | Precondition | Steps | Expected Result |
|----|------|--------------|-------|-----------------|
| E2E-P1 | P (guest) | Not logged in | Visit store → search a product → scroll to it → open it → Add to cart → `/cart` → accept Terms → Checkout → **Checkout as Guest** → fill billing (US address) → accept default shipping/payment → **Confirm order** | "Your order has been successfully processed!" confirmation. |
| E2E-P2 | P (logged-in user) | A registered account exists | **Log in** → add product to cart → `/cart` → accept Terms → Checkout (no guest step) → fill billing → confirm order | Order placed; confirmation shown for the authenticated customer. |
| E2E-P3 | P (register → buy) | New visitor | **Register** a new account (auto-login) → add product to cart → `/cart` → accept Terms → Checkout → fill billing → confirm order | Order placed; confirmation shown end-to-end from sign-up to purchase. |
| E2E-F1 | F | Empty cart | Open `/cart` with nothing added → attempt to checkout | "Your Shopping Cart is empty!" message; no checkout button available. |
| E2E-E1 | E | Cart has a product | Open `/cart` → click **Checkout** WITHOUT ticking Terms of Service | A validation popup appears and the user stays on the cart page. |

---

### Coverage summary

- **8 core features × ≥3 scenario types = 24 scenarios**, plus a **9th
  end-to-end checkout feature** with **3 full journeys + 2 negative/edge** = 5
  more = **29 scenario definitions**.
- Several scenarios are **data-driven** (Registration profiles, Login negative
  sets, Search keywords) so the table rows above expand to **34 executed
  tests**.
- Every scenario maps to an automated, independently runnable test that produces
  a pass/fail result and captures a screenshot + trace + video on failure.
