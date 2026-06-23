---
layout: home

hero:
  name: nopCommerce Automation
  text: Playwright test framework
  tagline: 9 features · 34 tests · Page Object Model · Cloudflare-ready · data-driven
  image:
    src: /pulse-dashboard.png
    alt: Playwright Pulse dashboard — 34 passed
  actions:
    - theme: brand
      text: How to Run
      link: /guide/running
    - theme: alt
      text: Step 1 — Features
      link: /Step1-Identify-Key-Areas
    - theme: alt
      text: View on GitHub
      link: https://github.com/siraajul/nopCom_Automation

features:
  - icon: 🧱
    title: Page Object Model
    details: Reusable page objects hold selectors + actions; specs read as intent, never raw selectors.
  - icon: 🎯
    title: Pass / Fail / Edge
    details: Every feature has positive, negative and boundary scenarios — several data-driven from JSON.
  - icon: 🔁
    title: 3 E2E checkout journeys
    details: Full purchase flow as a guest, a logged-in user, and register-then-buy in one session.
  - icon: 🛡️
    title: Beats Cloudflare
    details: Handles the headless block and Rocket Loader handler-gating that break naive suites.
  - icon: ⚡
    title: Hybrid API setup
    details: Accounts created via form POST (fast, stable); features verified through the UI.
  - icon: 📊
    title: Dual reporting
    details: Built-in Playwright HTML report plus the Playwright Pulse dashboard with trends.
---

## What is this?

A **test automation framework** built on **Playwright + TypeScript** for the
[nopCommerce demo store](https://demo.nopcommerce.com/). It covers **9 features
in 34 tests** with happy-path, negative and boundary coverage, and is engineered
to run reliably against a live, Cloudflare-protected site.

- **Framework layer** — page objects, fixtures, hybrid API setup, data layer (reusable, zero tests).
- **Test suite** — feature specs + 3 end-to-end checkout journeys.
- **Reporting** — Playwright HTML + Pulse dashboard, with screenshot/trace/video on failure.

➡️ Start with **[How to Run](/guide/running)**, or read the assignment
deliverables: **[Step 1 — Feature Selection](/Step1-Identify-Key-Areas)** and
**[Step 2 — Test Scenarios](/Step2-Test-Scenarios)**.
