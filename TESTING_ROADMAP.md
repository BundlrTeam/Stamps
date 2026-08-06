# Testing Roadmap & Coverage Tracker

This document outlines the test coverage status of the Stamp Me codebase, detailing what is currently tested, what is missing, and how to write and run future tests.

---

## 📊 Coverage Status

### 1. Fully Tested & Verified
These files have complete unit test suites matching the refactored architecture:

*   **Frontend Services**:
    *   [`stamp.service.ts`](file:///c:/Git/Stamps/src/app/services/stamp.service.ts) &rarr; Tested in [`stamp.service.spec.ts`](file:///c:/Git/Stamps/src/app/services/stamp.service.spec.ts) (Checks rewards, icons, progression labels, and badge unlocks).
    *   [`wallet.service.ts`](file:///c:/Git/Stamps/src/app/services/wallet.service.ts) &rarr; Tested in [`wallet.service.spec.ts`](file:///c:/Git/Stamps/src/app/services/wallet.service.spec.ts) (Checks card state, stamp additions, cap of 10 stamps, and persistence).
    *   [`business.service.ts`](file:///c:/Git/Stamps/src/app/services/business.service.ts) &rarr; Tested in [`business.service.spec.ts`](file:///c:/Git/Stamps/src/app/services/business.service.spec.ts) (Checks seeding, search, filtering).
*   **Frontend Pages**:
    *   [`home.page.ts`](file:///c:/Git/Stamps/src/app/pages/home/home.page.ts) &rarr; Tested in [`home.page.spec.ts`](file:///c:/Git/Stamps/src/app/pages/home/home.page.spec.ts) (Checks default list rendering, search queries, categories, and greetings).
*   **Backend Auth & Logic**:
    *   [`auth.middleware.js`](file:///c:/Git/Stamps/backend/auth.middleware.js) &rarr; Tested in [`server.spec.js`](file:///c:/Git/Stamps/backend/server.spec.js) (Checks header authorization and email parameter checks).

---

### 2. Missing Coverage (Future Backlog)
These components are currently untested and require test suites before moving past the pitch/mockup stage:

#### Frontend Pages
*   `ProfilePage` (`src/app/pages/profile/profile.page.ts`):
    *   *Test scenario*: Verify the multi-step merchant signup form validation.
    *   *Test scenario*: Mock file upload API responses for logo and store gallery images.
    *   *Test scenario*: Validate theme toggling triggers `ion-palette-dark` class on documentElement.
*   `StampCardPage` (`src/app/pages/stamp-card/stamp-card.page.ts`):
    *   *Test scenario*: Validate stamp grid dynamically displays collected stamp items.
    *   *Test scenario*: Mock QR scanner triggers matching QR code stamp addition.
*   `LoginPage` (`src/app/pages/login/login.page.ts`):
    *   *Test scenario*: Validate login redirects to home with mock credentials.
*   `BusinessDetailPage` (`src/app/pages/business-detail/business-detail.page.ts`):
    *   *Test scenario*: Verify adding business card to wallet state change.

#### Backend Controllers & Migrations
*   `business.controller.js` (`backend/controllers/business.controller.js`):
    *   *Test scenario*: Validate mock fallback data structures when Postgres is offline.
*   `stamp.controller.js` (`backend/controllers/stamp.controller.js`):
    *   *Test scenario*: Test stamp adding and reward claim route validation constraints.
*   `db.js` (`backend/db.js`):
    *   *Test scenario*: Test database connection recovery fallbacks.

---

## 🚀 How to Run Tests

### Frontend Unit Tests (Angular / Karma)
To execute the Angular unit specs:
```bash
npm run test -- --watch=false
```

### Backend Integration Tests (Node / Jest)
To execute the backend mock validation specs:
```bash
node backend/server.spec.js
```
*(Optionally, if Jest integration is added to the project scripts later, run `npm test` or `npx jest`).*
