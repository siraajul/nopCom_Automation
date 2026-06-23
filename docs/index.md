---
layout: home

hero:
  name: nopCommerce Automation
  text: A Playwright test framework
  tagline: Nine features, 34 tests, Page Object Model, and a real fight with Cloudflare.
  image:
    src: /nopcommerce-x-playwright.svg
    alt: nopCommerce and Playwright
  actions:
    - theme: brand
      text: How to Run
      link: /guide/running
    - theme: alt
      text: Getting Past Cloudflare
      link: /Cloudflare-Bypass
    - theme: alt
      text: GitHub
      link: https://github.com/siraajul/nopCom_Automation

features:
  - icon: 🧱
    title: Page Object Model
    details: Selectors and actions live in page objects. The specs only say what to check, never how to find a button.
  - icon: 🎯
    title: Pass, Fail, Edge
    details: Every feature has a happy path, a negative case, and a boundary case. Several are data-driven from JSON.
  - icon: 🔁
    title: Three checkout journeys
    details: The full buy flow as a guest, as a logged-in user, and registering then buying in one session.
  - icon: 🛡️
    title: Gets past Cloudflare
    details: Handles the headless block and the Rocket Loader trick that makes clicks quietly do nothing.
  - icon: ⚡
    title: API-assisted setup
    details: Accounts are created by posting the form directly, then the feature is checked through the UI.
  - icon: 📊
    title: Two reports
    details: The built-in Playwright HTML report, plus the Pulse dashboard with trends across runs.
---

## The short version

A Playwright and TypeScript test framework for the
[nopCommerce demo store](https://demo.nopcommerce.com/). It covers nine features
in 34 tests, checks the happy paths along with the ways things should break, and
is built to hold up against a live site that Cloudflare actively guards.

It's split into two layers on purpose: the framework (page objects, fixtures, the
data layer) is reusable scaffolding with no tests in it, and the suite is the
feature specs plus three end-to-end checkout journeys.

## By the numbers

| | |
|---|---|
| Features | 9 (8 core + an end-to-end checkout) |
| Tests | 34 (Pass / Fail / Edge, several data-driven) |
| Page objects | 9 (`BasePage` + one per feature) |
| Reporting | Playwright HTML + Pulse (with trends) |
| On failure | screenshot, trace, and video |
| Proof | 34/34 even with `--retries=0` |

## Read next

**Guides**

- [How to Run](/guide/running): install, run, and record the suite
- [Getting Past Cloudflare](/Cloudflare-Bypass): the part actually worth reading

**Assignment deliverables**

- [Step 1: Feature Selection](/feature-selection): the 8 features and why each matters
- [Step 2: Test Scenarios](/test-scenarios): the Pass / Fail / Edge tables
- [Step 3: Script Automation](/script-automation): how the scripts meet the brief
