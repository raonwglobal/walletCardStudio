# Product and Revenue Metrics

Collect only the events needed to answer product questions; do not place names, emails, phone numbers, QR payloads or full profile contents in analytics.

## Activation funnel

- `card_create_started`
- `card_create_completed`
- `card_saved`
- `qr_previewed`
- `vcard_exported`
- `card_json_exported`

Track completion rate by device class and step, without recording field values.

## Retention and quality

- D1 / D7 / D30 return rate.
- Cards created per activated user.
- Save/restore success and data-loss reports.
- Mobile task completion and time to first export.
- Frontend error rate, performance and accessibility defects.

## Monetization

- Free-to-Pro conversion.
- Team trial-to-paid conversion.
- MRR / ARR, churn and expansion revenue.
- CAC, payback period and LTV assumptions.
- Gross margin after infrastructure, payment fees, support and AI usage.
- Refunds, cancellations and reasons for downgrade.

## B2B operations

- Invitation and provisioning success rate.
- Time to onboard a team.
- Employee deactivation and badge-revocation completion time.
- Audit export success and support response time.

## Privacy guardrails

- Analytics must not capture card fields or serialized objects.
- Use consent and retention limits appropriate to the deployment region.
- Prefer aggregate metrics; document ownership and access controls.
