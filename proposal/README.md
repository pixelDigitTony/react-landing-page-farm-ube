# Roote Origin System MVP scope and costing proposal

Client PDF: `ube-farm-mvp-costing-proposal.pdf`.

The seven-page revision dated **3 October 2026** proposes **PHP 220,000 negotiable** and a **10-week delivery plan** for the public animated farm/produce inventory plus a **new Roote Origin backend**, as confirmed by the client. The total supersedes the earlier PHP 60,000 frontend-only quotation; it is not PHP 220,000 on top of that amount. Previously agreed payments/credits are reconciled in the final agreement.

The MVP uses **MERN: MongoDB, Express, React and Node.js 26, with TypeScript**. It includes protected ecosystem accounts, farming and harvest batch records, processor and brand/distributor links, public per-batch summaries and downloadable QR artwork. Interface text/colors remain in constants; operational records are edited in the dashboard/database. Ordinary record creation is included; the assisted onboarding allowance is not a software limit.

Itemized development costs, 40/30/20/10 payment milestones, recurring operating allowances, optional maintenance, pilot acceptance, client inputs and the negotiable additional-feature clause are included. Operating and maintenance budgets are separate from development. The app itself is not changed by this document update.

Published Davao/Philippine provider references were checked on **3 October 2026**. Private research is in `source/content.mjs` and is not printed in the client PDF. There is **no sources appendix**, preserving the client's prior request. Vendor packages are not like-for-like estimates or a statistical Davao market average; the proposed fee and PHP operating allowances are scope-based planning estimates. MongoDB/API and related service plans will be confirmed at kickoff.

Copy, scope, costs and visual tokens are editable in `source/content.mjs`. Run from the project root:

```powershell
node proposal/source/build-proposal.mjs
node proposal/source/verify-pdf.mjs
```

The builder uses existing local fonts and prototype imagery and exports a tagged, searchable PDF through Chrome/Playwright. The HTML is an editable print source; the final PDF is standalone.

QA uses the Codex bundled Python/pypdf and Poppler without adding application dependencies. `PROPOSAL_PYTHON` and `PROPOSAL_PDFTOPPM` can override their paths if needed. Verification checks every A4 page, page numbering, amounts, weekly milestones, expanded scope and removal of obsolete scope. Layout measurements and extracted text are in `source/`; all final PDF page renders are in `previews/` for visual review.

This is a draft commercial proposal for negotiation. Final scope, amount, operating arrangements, schedule, applicable taxes and terms must be mutually confirmed in writing.
