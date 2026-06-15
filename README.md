# Stamp Me

Stamp Me is a professional mockup for a mobile loyalty app built with Ionic, Angular, and Capacitor. The app lets customers discover local businesses, add loyalty cards to a wallet, collect digital stamps, and see reward progress.

This repository is currently optimized for sales demos and product validation. It is not production-ready yet: authentication, backend storage, merchant dashboards, payments, and real camera QR scanning are intentionally mocked.

## Current Demo Scope

- Marketplace-style Home screen with realistic local businesses.
- Business detail pages with ratings, location, opening state, services, and reward details.
- Seeded Wallet with active stamp cards on first run.
- Persistent local demo state using `localStorage`.
- Stamp card screen with staged QR validation and presentation-mode stamp simulation.
- Profile screen with editable mock profile, demo reset, dark mode, and merchant interest form.
- Capacitor app naming for iOS and Android.

## Main Routes

- `/tabs/home` - browse and filter businesses.
- `/tabs/home/business/:id` - business detail.
- `/tabs/wallet` - active loyalty cards.
- `/tabs/wallet/stamp-card/:businessId` - card progress and QR validation.
- `/tabs/profile` - user profile, settings, and merchant interest.

## Demo Notes

The app seeds a few active stamp cards when no previous local demo state exists. Use Profile > Repor demonstracao to restore the default wallet state.

Mock QR validation uses the `qrCodePattern` values in `src/app/mocks/businesses.mock.ts`. On the scanner modal, "Usar codigo de demonstracao" fills the correct code for the current business.

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm start
```

Run lint:

```bash
npm run lint
```

Build:

```bash
npm run build
```

Run tests:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

## Mobile Shell

Build and sync Capacitor assets:

```bash
npm run build
npx cap sync
```

Open native projects:

```bash
npx cap open android
npx cap open ios
```

## Known Mock Limitations

- Data is local mock data only.
- User profile and loyalty state are stored in `localStorage`.
- QR scanning is a staged demo interaction, not camera integration.
- Merchant signup stores a local mock lead only.
- Maps, ratings, and distances are static mock values.
