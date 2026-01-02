# Garka

Backend & frontend for the Garka property verification platform.

## Monnify integration (Sandbox)

This project supports Monnify for payment collection and escrow. To enable end-to-end Monnify tests and webhook verification, set the following environment variables in your `.env` or CI environment:

- `MONNIFY_CONTRACT_CODE` - Monnify contract code for your account
- `MONNIFY_API_KEY` - Monnify API key
- `MONNIFY_API_SECRET` - Monnify API secret (also used as default webhook secret)
- `MONNIFY_WEBHOOK_SECRET` (optional) - If set, used to verify webhook signatures; otherwise `MONNIFY_API_SECRET` is used
- `MONNIFY_WEBHOOK_ALGO` (optional) - HMAC algorithm used for webhook signature (defaults to `sha512`)

Webhook details:

- URL: `POST /api/payment/monnify/webhook`
- Content-Type: `application/json` (endpoint expects raw body for signature verification)
- Signature header: `x-monnify-signature` (HMAC hex digest of raw body using `MONNIFY_WEBHOOK_SECRET`)

Testing:

- E2E tests that exercise Monnify flows are located in `backend/tests/monnify_e2e.test.js` and will only run when all required Monnify env vars are present and MongoDB is available.

## Running tests locally with Dockerized MongoDB

If you want to run the DB-dependent tests locally (the test suite will skip them when no MongoDB is available), you can start a local MongoDB using the included `docker-compose.test.yml` and then run the backend test script.

1) Start MongoDB for tests

```bash
docker compose -f docker-compose.test.yml up -d
```

2) Export the test DB connection and run the backend test suite (from project root):

```bash
export MONGODB_URI=mongodb://localhost:27017/garka_test
cd backend
npm run test:local-mongo
```

3) When finished, stop MongoDB

```bash
docker compose -f docker-compose.test.yml down
```

This will run the backend tests in-band against the local MongoDB instance so DB-dependent suites will execute (same environment the CI job uses).

## CONTRIBUTING & Running E2E locally

- To run the Monnify E2E tests locally you need:
  - A running MongoDB instance and the usual test environment
  - Monnify sandbox credentials set in your `.env`:
    - `MONNIFY_CONTRACT_CODE`, `MONNIFY_API_KEY`, `MONNIFY_API_SECRET`
  - Optionally expose your local webhook endpoint to Monnify using `ngrok http 5000` and configure Monnify webhook URL (for real sandbox interactions).

- Postman: the `docs/postman.json` collection can be extended with the following example requests:
  - `POST /api/payment/monnify/initiate` (body: `{ verificationId, amount, redirectUrl }`)
  - `POST /api/payment/monnify/webhook` (raw body example of `TRANSACTION_SUCCESSFUL` with header `x-monnify-signature` and `x-event-id`)
  - `POST /api/deal-initiator/claim/:verificationId` (auth required)
  - `PATCH /api/verification/:id/approve` (admin only)

- Run tests: `npm test` (DB-dependent suites are skipped when MongoDB isn't available).


## Sandbox payment simulation & reservation cleanup (developer notes)

- To simulate a successful payment during local development, call POST `/api/payment/simulate/:verificationId/complete` as the buyer; this will mark the verification as paid, set a 12-hour reservation, and mark the associated property as `reserved`.
- The Monnify webhook (`POST /api/payment/monnify/webhook`) will also set reservation and property status on real payments.
- A reservation cleaner runs in the backend (default every 1 minute in dev) and expires reservations that pass their `reservedUntil` timestamp without admin approval; those verifications become `expired` and the property status returns to `available`.
