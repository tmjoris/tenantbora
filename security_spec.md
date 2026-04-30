# Security Specification - TenantBora

## Data Invariants
1. A **User** profile must match the `request.auth.uid`.
2. A **Property** can only be created by a user with a `landlord` role.
3. An **Application** must be created by a `tenant` and reference a valid `Property`.
4. A **Tenancy** is created automatically (or by landlord) when an application is approved.
5. **Payments** must link to an active `Tenancy` and the `tenantId` must match the payer.
6. **MaintenanceRequests** must be created by the tenant of that specific `Tenancy`.

## The "Dirty Dozen" Payloads (Red Team Tests)
1. **Identity Spoofing**: Attempt to create a user profile with a UID that doesn't match `request.auth.uid`.
2. **Role Escalation**: Attempt to update a user's role from `tenant` to `landlord` after profile creation.
3. **Ghost Property**: Non-landlord user attempting to create a property.
4. **Shadow Application**: Tenant attempting to apply for a property that doesn't exist.
5. **Admin Spoofing**: Attempting to set `verified: true` on their own tenant profile.
6. **Cross-Tenant Payment**: Tenant A attempting to record a payment for Tenant B's tenancy.
7. **Unauthorized Maintenance**: Tenant A creating a maintenance request for Tenant B's property.
8. **Relational Sync Bypass**: Approving an application without being the landlord of that property.
9. **Illegal Update Gap**: Updating the `winner` or `status` of an application without being the landlord.
10. **ID Poisoning**: Injecting a 1MB string as a property ID.
11. **PII Leak**: Non-landlord/non-owner attempting to read a tenant's private employment details.
12. **Terminal State Lock**: Attempting to change an application status after it has been `rejected` or `approved`.

## Test Runner Plan
I will implement `firestore.rules` to prevent these vulnerabilities by using:
- `isValidId()` guards.
- `role` checks via `get()` lookups.
- `affectedKeys().hasOnly()` for state transitions.
- Strict schema validation in helpers.
