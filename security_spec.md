# Culinara Security Specification

## 1. Data Invariants
- A **Recipe** must belong to an existing **Household**.
- A **Recipe** must have an **authorId** matching the creator's UID.
- A **Household** must have an **ownerId** matching the creator's UID.
- **Household roles** ('admin', 'member', 'viewer') are restricted.
- **Public Recipes** can be read by anyone, but modified only by authorized household members.
- **User Profiles** are public for display names but protected for modification.
- **Immutability**: `createdAt`, `authorId`, and `householdId` of recipes cannot be changed after creation.

## 2. The "Dirty Dozen" Payloads (Red Team Test Cases)

1.  **Identity Theft**: Create a recipe with `authorId` = 'SOMEONE_ELSE_UID'.
2.  **Orphaned Recipe**: Create a recipe with a non-existent `householdId`.
3.  **Ghost Elevation**: User updates their own `users/{uid}` document to include `{ "role": "admin" }`.
4.  **Role Poisoning**: A 'member' updates a household to make themselves 'admin'.
5.  **Resource Exhaustion**: Recipe `ingredients` list containing a 1MB string.
6.  **Timeline Fraud**: Create a recipe with a backdated `createdAt` timestamp.
7.  **Shadow Update**: Update a recipe to add an undocumented field `isVerified: true`.
8.  **Ownership Hijack**: Update another user's recipe by changing its `authorId`.
9.  **Household Hijack**: Change a recipe's `householdId` to a household the user doesn't belong to.
10. **Public Leak**: Read a private recipe that is not marked `isPublic: true` and where the user is not a member of the parent household.
11. **Admin Spoof**: Try to write as admin with `email_verified: false`.
12. **Id Poisoning**: Create a document with an ID containing shell escape characters or 2KB of junk.

## 3. Test Registry (Expected Rejections)
All the above payloads MUST return `PERMISSION_DENIED`.
