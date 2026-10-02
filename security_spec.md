# Security Specification & Test Matrix: Nusantara Marine Logistics

## 1. Data Invariants
1. Only authenticated users can read and perform CRUD operations on maritime business entities (vessels, ports, clients, routes, shipments, tracking_logs, operational_expenses, notifications).
2. Write operations to Master Data (vessels, ports, routes, clients) require authenticated accounts.
3. Tracking logs must specify valid vessel identifiers, timestamp, and location checkpoints.
4. Operational expenses must contain valid non-negative amounts, legitimate expense categories, and vessel associations.
5. Shipments must maintain immutable identifiers (`id`, `createdAt`) and status transitions must remain within allowed lifecycle states: `booking` -> `loading` -> `in_transit` -> `arrived` -> `unloading` -> `delivered` or `cancelled`.
6. No arbitrary or un-whitelisted ghost fields may be injected into any documents.
7. Admin accounts (such as configured bootstrap email `arizo4212@gmail.com`) maintain comprehensive operational authority.

## 2. The Dirty Dozen Payloads
1. **Unauthenticated Read**: Attempting to read `/vessels/v1` without authentication token.
2. **Unauthenticated Vessel Create**: Anonymous user sending vessel creation payload.
3. **Ghost Field Vessel Injection**: Creating a vessel with injected payload `{ "hacked": true, "role": "superadmin" }`.
4. **Negative Capacity Exploit**: Adding vessel with negative capacity `capacityDwt: -5000`.
5. **Port ID Poisoning Attack**: Injecting a 2KB string as document ID for `/ports/`.
6. **Malicious Route Tariff**: Submitting route with negative or NaN tariff per TEU.
7. **Client Email Spoofing**: Creating client with fake verified email claim.
8. **Shipment State Skipping**: Directly setting shipment from `cancelled` back to `delivered` bypassing workflow.
9. **Negative Operational Expense**: Submitting an expense with `amountRp: -99999999` to falsify balance sheets.
10. **Orphan Tracking Log**: Creating tracking log with empty string vesselName and missing location.
11. **Denial of Wallet String Bomb**: Creating notification with 500,000 character payload string.
12. **Unauthorized Cross-Tenant Deletion**: Attempting to delete vessels or shipments without valid session.

## 3. Test Runner
File: `firestore.rules.test.ts`
All 12 dirty dozen payloads must be rejected with PERMISSION_DENIED.
