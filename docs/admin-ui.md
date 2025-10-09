# Admin UI Overview

This document summarizes the administrative interface components and configuration-driven features recently added.

## Feature Flags
Admin navigation and certain sections are gated by feature flags retrieved from `/api/v1/config/features`:
- `admin-ui`: Controls visibility of the top-level Admin nav item.
- `departments-admin`: Controls visibility of Departments link inside Admin sidebar.

Flags are loaded via `useFeatureFlags()` (React Query). The helper `flagEnabled(key)` pattern is used to determine visibility.

## Theme Configuration
`ThemeConfigProvider` fetches the tenant theme (`/api/v1/config/theme`) and applies CSS variable `--aq-primary` if defined. This enables future theming (e.g., overriding Bootstrap primary color through SCSS mapping or runtime style adjustments).

## Dynamic Form Schema Demo
`RoleListWithFormDemo` consumes the patient intake form schema (key: `patient-intake`) through `useFormSchema(formKey)` and displays its raw JSON in a scrollable `<pre>` block. This is a placeholder for a future dynamic form renderer.

## Components
- `AdminLayout`: Sidebar + guarded content area ensuring current user has an admin role.
- `UserDirectory`: Table with search, enable/disable toggle, and placeholder for future edit / create modal (integration point available via `UserFormModal`).
- `UserFormModal`: Modal allowing creation of new users with role assignment (wired to `useCreateUser`). Currently triggered manually (integration button disabled until flow finalized).
- `RoleList` / `RoleListWithFormDemo`: Lists roles and includes a form to add a new role. Extended variant shows dynamic form demo.
- `DepartmentTable`: Lists departments with placeholder edit actions.
- Utility Components: `RoleBadge`, `StatusToggle`, `DepartmentTag` provide cohesive visual chips and toggles.

## Data Hooks (adminApi.ts)
Added mutation hooks:
- `useUpdateUser` (PUT `/api/v1/admin/users/{id}`)
- `useUpdateUserRoles` (PATCH `/api/v1/admin/users/{id}/roles`)
These invalidate the `['admin','users']` query on success.

## Access Control
`AdminLayout` checks current user roles (string or object with `roleKey`) for `ADMIN` or `ROLE_ADMIN` to gate access. Denied users see an inline alert.

## Routing
`/admin` parent route nests `users`, `roles`, and `departments` paths. Default index redirects to `/admin/users`.

## Build Verification
Frontend production build (Vite) completes successfully with new components:
- Main JS ~389 kB (post-additions), CSS ~231 kB.

## Next Opportunities
- Wire the "New User" button to open `UserFormModal` (state lift into `UserDirectory`).
- Implement role editing and department creation forms.
- Add optimistic UI for enable/disable toggle.
- Style theme application beyond primary color variable (SCSS customization layer).
- Replace raw schema `<pre>` with dynamic form renderer component.

## Testing Considerations
- Add React Testing Library tests for `AdminLayout` gating and `UserDirectory` filtering.
- Integration test to verify feature-flag-driven nav visibility.

## Maintenance Notes
- Keep feature flag keys centralized (consider a `featureFlags.ts` constant file) as surface expands.
- When adding new admin sections, extend `AdminLayout` nav with flag gating and update documentation accordingly.
