# AfyaQuik HMS Roadmap

## 1. Vision and Scope
- Deliver a configurable, tenant-aware Hospital Management System (HMS) that covers outpatient and inpatient workflows, diagnostics, pharmacy, and billing.
- Provide rich patient queuing and hand-off capabilities so every staff member can track, document, and complete their portion of a visit lifecycle.
- Ship a React + Spring Boot solution that can be stood up quickly, extended easily, and tuned for low memory overhead in all tiers.

## 2. Guiding Constraints and Assumptions
- **Technology stack:** Spring Boot 3.5.x (Java 17), PostgreSQL, Redis (optional), React 18 + TypeScript, React Router (HashRouter), Axios, React Query, Bootstrap 5 + custom SCSS modules. No Tailwind.
- **Schema management:** Rely on Hibernate `spring.jpa.hibernate.ddl-auto=update` for schema evolution during rapid development; DDL migrations captured manually for production hardening.
- **Configuration model:** Feature toggles, form schemas, and tenant theming stored in database tables and cached in memory.
- **Authentication:** JWT-based SSO integration ready (Keycloak/Auth0) with RBAC claims in token; fallback local user store for MVP.
- **Deployment:** Containerized micro-monolith; profiles for `dev`, `staging`, `prod`. SPA deployed to CDN/static hosting.
- **Performance & memory:** Prioritize connection pooling, controlled entity graphs, streaming/pagination, and client-side virtualization for large datasets.

## 3. Solution Architecture

### 3.1 Backend Overview
- Package-by-feature layout under `com.afyaquik.hms` with modules: patient, staff, queue, clinical, diagnostics, pharmacy, billing, reports, configuration.
- REST controllers expose versioned endpoints (`/api/v1/...`); all responses wrapped with `{ status, data, errors, meta }` convention.
- Service layer enforces business rules, queue transitions, and audit logging. Use Spring State Machine or a custom workflow service backed by config-driven transitions.
- Repository layer uses Spring Data JPA with entity graphs to minimize eager loading, and projections for list endpoints.
- Memory-safe practices: capped caches (Caffeine), DTO mapping (MapStruct) to detach large graphs, asynchronous processing using bounded thread pools, opportunistic streaming for exports.

### 3.2 Frontend Overview
- React 18 + TypeScript SPA bootstrapped with Vite, using `HashRouter` for deployment simplicity.
- State management via React Query + lightweight Zustand store for UI state; React Context for auth/session.
- Bootstrap 5 base styles with custom SCSS modules per feature. Component library documented with Storybook.
- Default primary theme color `#7db9f3`; expose SCSS variables and tenant overrides while keeping this as base palette.
- Memory focus: virtualization for long tables (React Window), lazy loading for heavy modules, cleanup of timers/subscriptions via hooks.

### 3.3 Cross-Cutting Concerns
- **Security:** Spring Security JWT filters, method-level RBAC, field-level permissions in service layer.
- **Multi-tenancy:** Tenant context resolved from JWT + `X-Tenant-Id`; Hibernate filter to scope data.
- **Config service:** `ConfigController` returns feature flags, form definitions, tenant theme. Frontend caches with stale-while-revalidate strategy.
- **Observability:** Micrometer metrics, centralized logging (JSON), distributed tracing ready via OpenTelemetry.
- **Notifications:** Email/SMS/Push dispatcher using templated payloads stored in DB.
- **Role context:** Users may hold multiple roles; upon login they select an active role (with ability to switch) which scopes navigation, queue assignments, and permissions until changed.

## 4. Domain Model and Data Design

### 4.1 Core Entities
- `Patient`, `PatientAddress`, `EmergencyContact`, `Allergy`, `Medication`, `CarePlan`.
- `PatientVisit` (aka Visit Record) capturing each encounter episode with references to registration data and queue item.
- `StaffUser`, `StaffRole`, `StaffSchedule`, `Department`.
- `Encounter`, `EncounterNote`, `VitalSign`, `Procedure`, `Order` (lab/imaging/pharmacy).
- `Invoice`, `InvoiceLine`, `Payment`, `InsuranceClaim`, `Tariff`.
- `InventoryItem`, `InventoryTransaction`, `Supplier`.
- `FeatureFlag`, `FormDefinition`, `TenantTheme`, `NotificationTemplate`.
- All entities include `tenantId`, audit columns, and optional soft-delete (`archivedAt`).

### 4.2 Queue & Workflow Model
- `VisitQueueItem` tracks patient visit through lifecycle with `currentStatus`, `priority`, `currentAssigneeId`, and SLA metadata.
- `QueueStageConfig` defines allowed transitions, required fields, default SLA, and supported roles per tenant.
- `WorkflowTransition`, `QueueAssignment`, `QueueNote`, and `QueueAttachment` capture hand-offs, documentation, and supporting artifacts.

### 4.3 Visit Record Strategy
- A patient is registered once and persists across visits; subsequent encounters create `PatientVisit` records linked to the existing `Patient` and optionally previous encounters.
- Visit creation workflow:
	1. Search patient registry (demographics, MRN, phone) with fuzzy matching and merge suggestions.
	2. If found, prefill visit intake with stored demographics and insurance; otherwise, allow creation of new patient profile before continuing.
	3. Instantiate `PatientVisit` with metadata (visit type, reason, preferred provider) and bind to `VisitQueueItem` for real-time status tracking.
	4. Maintain visit history for staff via timeline view; avoid duplicate registration unless demographic or insurance changes require updates.
- Provide guardrails (alerts) when staff attempt to add a new patient with matching identifiers to enforce reuse of existing registration data.

### 4.4 Department Model & Governance
- Departments represent clinical or operational units (e.g., Outpatient, Emergency, Pharmacy) and act as a primary grouping for staff, rooms, schedules, and queue lanes.
- Core relationships:
  - `Department` \<1..n\> `StaffUser` through `StaffDepartment` join supporting primary and secondary assignments.
  - `Department` \<1..n\> `QueueStageConfig` to enable department-specific workflows (e.g., Emergency triage vs. Outpatient).
  - `Department` \<1..n\> `Schedule` (shifts, on-call rosters) and `Resource` (rooms, equipment) for calendar visualization.
  - `Department` \<1..n\> `ServiceCatalog` entries to drive billing defaults and analytics segmentation.
- Support hierarchical departments (e.g., `Clinical` → `Cardiology`) via optional parent-child relationship; store display order for navigation.
- Multi-tenant note: each department scoped by `tenantId` with optional tenant-wide templates for quick setup.

## 5. Patient Queue Workflow Lifecycle
- **Pre-Check-In → Registration → Triage → Provider Consultation → Diagnostics → Pharmacy → Billing → Discharge → QA**.
- Each transition validated against `QueueStageConfig`; business rules enforce required data (e.g., vitals before provider, payment before discharge if needed).
- Staff can place items in `BLOCKED`, `NO_SHOW`, or `RETURN_TO_*` states with reason capture; SLA timers produce alerts and color-coded indicators.
- Notes stored as structured JSON + rich text; attachments stored via S3-compatible storage with metadata references.
- Assignment service supports auto-assignment, manual reassignment with reason, and assist mode (dual ownership).

### 5.1 Example Patient Journey (Outpatient Consultation)
1. **Pre-Check-In (Online Portal / Reception)**
	- *Status:* `PENDING_CHECKIN`
	- *Actor:* Patient or receptionist
	- *Data captured:* Demographics confirmation, visit reason ("persistent cough"), preferred clinician, insurance card photos
	- *System actions:* Create `VisitQueueItem`, set priority to `Medium`, emit notification to registration queue; lightweight DTO used to avoid loading full patient graph.

2. **Registration Verification**
	- *Status transition:* `PENDING_CHECKIN → IN_REGISTRATION`
	- *Actor:* Registration officer (Role: Reception)
	- *Data captured:* Consent forms, coverage eligibility, co-pay estimate
	- *System actions:* Lock record to registrar, persist verification checklist, auto-generate queue ticket number, start SLA timer (10 minutes).

3. **Triage**
	- *Status transition:* `IN_REGISTRATION → WAITING_TRIAGE → IN_TRIAGE`
	- *Actor:* Triage nurse
	- *Data captured:* Vital signs, chief complaint, acuity score, allergy confirmation
	- *System actions:* Dynamic triage form rendered via `DynamicForm` component; vitals stored as smaller projections, auto-assign provider with matching specialty; SLA timer shortened to 5 minutes due to medium acuity.

4. **Provider Consultation**
	- *Status transition:* `IN_TRIAGE → WAITING_PROVIDER → IN_CONSULT`
	- *Actor:* General practitioner
	- *Data captured:* SOAP note, differential diagnoses, orders for chest X-ray and CBC, e-prescription draft
	- *System actions:* Encounter locked to provider; autosave every 30 seconds to prevent data loss; orders published to diagnostics and pharmacy queues; memory usage controlled by storing note segments lazily until submit.

5. **Diagnostics**
	- *Status transition:* `WAITING_DIAGNOSTICS → IN_DIAGNOSTICS → WAITING_PROVIDER`
	- *Actors:* Radiology technician and lab technician
	- *Data captured:* X-ray image reference, lab specimen metadata, lab result values
	- *System actions:* Results uploaded to object storage, metadata cached; provider notified via SSE to reopen consultation; queue item returns to provider waiting state for review.

6. **Consultation Follow-Up**
	- *Status transition:* `WAITING_PROVIDER → IN_CONSULT`
	- *Actor:* Same general practitioner
	- *Data captured:* Final diagnosis (bronchitis), updated care plan, finalized prescription, sick-leave note attachment
	- *System actions:* Encounter closed, discharge instructions generated, prescription routed to pharmacy queue.

7. **Pharmacy Dispense**
	- *Status transition:* `WAITING_PHARMACY → IN_PHARMACY → WAITING_BILLING`
	- *Actor:* Pharmacist
	- *Data captured:* Medication substitutions (generic allowed), counseling notes, dispensed quantity
	- *System actions:* Real-time inventory decrement, print-ready medication label generated, SLA timer paused once patient notified to collect meds.

8. **Billing & Checkout**
	- *Status transition:* `WAITING_BILLING → IN_BILLING → CLOSED`
	- *Actor:* Billing clerk
	- *Data captured:* Final invoice, payment method (card), insurance claim number
	- *System actions:* Payment posted, electronic receipt emailed, follow-up appointment scheduled for two weeks; queue item archived with full audit trail.

9. **Post-Visit QA**
	- *Status:* `CLOSED` (optional QA reopen)
	- *Actor:* Quality officer (asynchronous)
	- *Data captured:* Documentation checklist score, any corrective feedback
	- *System actions:* If issues found, workflow can be reopened to specific stage with rationale; metrics logged for continuous improvement.

	### 5.2 Status Transition Matrix
	| From status | Allowed next statuses | Primary trigger | Guards & required data | System actions |
	| --- | --- | --- | --- | --- |
	| `PENDING_CHECKIN` | `IN_REGISTRATION`, `CANCELLED`, `NO_SHOW` | Patient arrives / receptionist confirms visit | Patient linked, basic demographics & visit reason provided | Create queue item, assign ticket, notify registration board |
	| `IN_REGISTRATION` | `WAITING_TRIAGE`, `BLOCKED` | Registrar completes verification checklist | Insurance/consent captured; unresolved issues move to `BLOCKED` | Release record lock, start triage SLA timer |
	| `WAITING_TRIAGE` | `IN_TRIAGE`, `RETURN_TO_REGISTRATION` | Nurse accepts patient | Nurse role required; if documents missing, registrar invoked | Announce triage assignment, pause registration SLA |
	| `IN_TRIAGE` | `WAITING_PROVIDER`, `BLOCKED` | Vitals and acuity submitted | Required fields: vitals, complaint, acuity | Persist vitals snapshot, auto-assign provider |
	| `WAITING_PROVIDER` | `IN_CONSULT`, `RETURN_TO_TRIAGE`, `BLOCKED` | Provider opens encounter | Provider must match department/permission | Lock encounter, preload patient summary |
	| `IN_CONSULT` | `WAITING_DIAGNOSTICS`, `WAITING_PHARMACY`, `WAITING_BILLING`, `CLOSED`, `BLOCKED` | Orders placed, consult finished, or discharge decided | Required: SOAP note sections per config; closing needs discharge notes | Publish orders to downstream queues, autosave encounter |
	| `WAITING_DIAGNOSTICS` | `IN_DIAGNOSTICS`, `WAITING_PROVIDER` | Technician accepts or provider cancels order | Diagnostics staff role | Reserve lab/radiology slots, notify technician |
	| `IN_DIAGNOSTICS` | `WAITING_PROVIDER`, `BLOCKED` | Results uploaded / specimen rejected | Results metadata + attachments; rejection reason required | Store result refs, ping provider via SSE |
	| `WAITING_PHARMACY` | `IN_PHARMACY`, `WAITING_PROVIDER` | Pharmacist opens dispense task or provider amends prescription | Pharmacist role, meds in stock | Reserve inventory, render dispense form |
	| `IN_PHARMACY` | `WAITING_BILLING`, `WAITING_PROVIDER` | Dispense completed / clarification needed | Dispense quantity, counseling notes required | Update stock ledger, notify billing queue |
	| `WAITING_BILLING` | `IN_BILLING`, `CLOSED`, `BLOCKED` | Billing clerk opens case or auto-close for zero balance | Charges calculated; payment source confirmed or waiver provided | Generate invoice draft, start payment SLA |
	| `IN_BILLING` | `CLOSED`, `WAITING_PROVIDER` | Payment posted / provider follow-up requested | Payment amount, receipt number; reopen requires provider note | Post financial transaction, email receipt |
	| `BLOCKED` | Previous valid status | Missing info resolved, supervisor override | Block reason resolved, supervisor approval logged | Resume SLA timer, create transition audit |
	| `RETURN_TO_*` | Stage-specific prior state | Staff requests redo (e.g., incorrect vitals) | Reason mandatory; limited to same encounter window | Notify responsible team, reset SLA |
	| `CANCELLED` | — | Patient cancels | Cancellation reason captured | Release resources, update analytics |
	| `NO_SHOW` | — | Patient absent after threshold | Auto-trigger after timer, staff confirmation | Mark slot free, notify scheduler |
	| `CLOSED` | `IN_BILLING` (reopen), `IN_CONSULT` (reopen) | QA audit requires correction | Supervisor-only action, reopen reason recorded | Reopen appropriate stage, reset SLA |

	> Guards are validated in the queue service before state mutation; unauthorized or invalid transitions return `409 Conflict` with specific error codes.

	### 5.3 Queue Assignment Policy
	- **Availability awareness:** Queue engine consumes staff availability feed from Scheduling Service (shift rosters, leave, break status, online presence). When the next attendant is out-of-office/inactive, the engine automatically skips to the next eligible staff and logs the bypass.
	- **Department routing:** Default assignment filters staff by required department (from visit reason or queue lane). Cross-department handoffs require supervisor override or fallback mappings defined in department settings.
	- **Graceful degradation:** If no staff are currently active for a required role, the queue enters `BLOCKED` with an escalation notification to supervisors and triggers backup role mapping where configured.
	- **Manual overrides:** Default behaviour is auto-assignment based on priority, skill, and workload balancing. Supervisors (and optionally authorized staff) may manually choose the next assignee using a restricted picker that only lists currently available staff; the override reason is captured in `QueueAssignment`.
	- **Active role scoping:** Queue views and notifications show only items relevant to the user’s selected active role; switching roles rehydrates filtered caches and updates presence in the availability service.
	- **Recommendation:** Keep manual selection disabled for general staff to reduce bias and delays; enable it only for charge nurse/supervisor roles through a feature toggle. All overrides are auditable and feed into performance analytics.
	- **Assist mode:** Staff can request assistance, temporarily allowing dual ownership without reassigning the primary owner; built-in timers ensure assist tasks don’t stall the queue.

## 6. Backend Implementation Plan

### 6.1 Service Modules
- **Patient Management:** CRUD, merging, document upload, demographic validation.
- **Queue Service:** Status machine, availability-aware assignment engine, SLA watcher, and real-time notifications (WebSocket/SSE).
- **Clinical Service:** Encounter creation, SOAP note templates, order placement, result ingestion.
- **Diagnostics & Pharmacy:** Order lifecycle management, result upload, inventory reservations, dispense logging.
- **Billing Service:** Charge capture, invoice generation, payment posting, claim creation.
- **Configuration Service:** Feature toggles, form schema management, tenant branding.
- **Administration Service:** User provisioning, profile updates, department catalog management, role/permission assignments, credential resets, and activity audit trails.
- **Scheduling Service:** Staff rostering, shift management, leave tracking, department-based rota templates, and availability feeds powering queue assignment and shared calendars.
- **Reporting Service:** KPI aggregations, CSV/PDF exports implemented with streaming responses to reduce memory footprint.

### 6.2 API Contracts
- Auth: `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`.
- Queue: `POST /api/v1/queue/checkin`, `GET /api/v1/queue`, `POST /api/v1/queue/{id}/assign`, `POST /api/v1/queue/{id}/transition`, `GET /api/v1/queue/{id}/timeline`.
- Patients: `GET/POST/PUT /api/v1/patients`, search/filter endpoints, document upload.
- Clinical: `POST /api/v1/encounters`, `POST /api/v1/encounters/{id}/notes`, `POST /api/v1/encounters/{id}/orders`.
- Diagnostics: `POST /api/v1/labs/orders`, `POST /api/v1/labs/{id}/results`.
- Pharmacy: `POST /api/v1/pharmacy/dispense`, `GET /api/v1/pharmacy/inventory`.
- Billing: `POST /api/v1/billing/invoices`, `POST /api/v1/billing/payments`, `POST /api/v1/billing/claims`.
- Config: `GET /api/v1/config/features`, `PUT /api/v1/config/features`, `GET /api/v1/config/forms/{formKey}`, `POST /api/v1/config/forms`.
- Auth context: `POST /api/v1/auth/active-role` to switch role and refresh scoped permissions.
- Admin: `POST /api/v1/admin/users`, `PUT /api/v1/admin/users/{id}`, `PATCH /api/v1/admin/users/{id}/roles`, `GET /api/v1/admin/roles`, `POST /api/v1/admin/roles`, `GET /api/v1/admin/departments`, `POST /api/v1/admin/departments`, `PUT /api/v1/admin/departments/{id}`.
- Scheduling: `GET /api/v1/scheduling/calendar`, `POST /api/v1/scheduling/shifts`, `POST /api/v1/scheduling/availability`, `GET /api/v1/scheduling/unavailable-staff`.
- Streaming endpoints include pagination and filtering to avoid loading large datasets in memory.

### 6.3 Persistence Strategy
- Hibernate `ddl-auto=update` enabled for fast iteration; capture resulting DDL scripts to version-control manually.
- Schema indexes aligned with queue lookups (status, tenant, assignee) and reporting queries.
- Use connection pooling (HikariCP) tuned for available memory; cap fetch sizes, apply read-only transactions where applicable.
- Enable second-level cache cautiously (Caffeine) for reference data; monitor hit/miss to prevent memory bloat.

## 7. Frontend Implementation Plan

### 7.1 Module Structure
- Top-level folders: `app/` (bootstrapping), `modules/` (per domain), `components/` (shared), `hooks/`, `services/`, `styles/`.
- Each module exports routing configuration, page components, and feature-specific hooks.
- Modules include dedicated `scheduling` package for shared calendars and staff availability management, and `admin` package for user provisioning and role governance.
- Hash routes include `/dashboard`, `/queue`, `/patients`, `/appointments`, `/clinical/encounters/:id`, `/pharmacy`, `/billing`, `/reports`, `/admin/users`, `/admin/roles`, `/admin/departments`, `/scheduling`.

### 7.2 Shared Component Library
- `FilterBar`, `DataTable` (TanStack Table + Bootstrap styling), `QueueBoard`, `StatusBadge`, `Timeline`, `DynamicForm`, `AssignmentPanel`, `NotesEditor`, `SLAIndicator`, `ModalManager`, `EmptyState`.
- Components themed via Bootstrap variables + SCSS; ensure accessible color palette per tenant theme.
- Storybook stories to validate memory use (e.g., virtualization scenarios) and document props.
- `ScheduleCalendar` component presenting staff availability with resource view, role/department filters, shift type legend, drag-to-request swaps, and conflict indicators for overlapping assignments.
- `UserDirectory`, `RoleMatrix`, and `DepartmentTree` components enable administrators to manage staff, permissions, and department hierarchies with audit-friendly interactions.
- `RoleSwitcher` chip/dropdown surfaces current active role, lists available roles, enforces confirmation when switching during in-flight tasks, and refreshes scoped data caches.
- `UserDirectory` grid with inline editing and `RoleMatrix` visualiser enabling administrators to provision users, assign role bundles, and review permissions.

### 7.3 State Management & Data Fetching
- React Query handles server data with caching, pagination, and background refresh; queries scoped by tenant + filters.
- Axios instance with interceptors for JWT, tenant headers, and response normalization.
- Hooks: `useQueueData`, `useFeatureFlag`, `useFormSchema`, `useTenantTheme`, `useAssignmentActions`, `useDepartmentData` (hierarchy + metadata), `useRoleContext` (active role + switch handler).
- Hooks: `useScheduleData` for staff calendar, supporting role/department filters and availability updates in real time.
- Memory controls: cancel queries on unmount, prefer derived data selectors over storing duplicative state, use suspense boundaries for lazy modules.

## 8. Quality, Monitoring, and Memory Management
- **Testing:** JUnit + Mockito for backend unit tests; Spring Boot slices for APIs; Testcontainers optional but can be toggled. Frontend uses Vitest + React Testing Library, Cypress for critical flows.
- **Memory safeguards (backend):**
	- Configure JVM with G1GC, enable heap dumps on OOM, integrate Micrometer JVM metrics.
	- Use DTO projections, pagination defaults, and streaming (e.g., `Streamable`, `ResponseBodyEmitter`) for large exports.
	- Clean up schedulers with bounded thread pools and backpressure.
- **Memory safeguards (frontend):**
	- Virtualize large tables/queues, avoid storing large blobs in state, use Web Workers for heavy computations if needed.
	- Clear intervals/timeouts in `useEffect` cleanup, use `memo`/`useCallback` to prevent unnecessary re-renders.
- **Monitoring:** Grafana dashboards for heap usage, DB pool metrics; frontend integrates with browser performance APIs and Sentry for error tracking.

## 9. Two-Day Execution Timeline

### Day 1
- Morning: Scaffold Spring Boot modules, configure security, queue entities, login API; set `ddl-auto=update`, seed reference data (departments, roles) via data loaders.
- Midday: Implement patient CRUD + queue check-in, assignment endpoints, SSE update channel.
- Afternoon: Build React shell with HashRouter, auth context, dashboard layout, queue board MVP using shared components.
- End of Day: Integrate patient search/list, basic forms via DynamicForm, commit roadmap + docs.

### Day 2
- Morning: Expand queue transitions, provider encounter forms, diagnostics modules; add billing workflow endpoints.
- Midday: Flesh out shared components (FilterBar, DataTable, NotesEditor, DepartmentTree, RoleSwitcher), connect to APIs with React Query, ensure virtualization for long queues.
- Afternoon: Implement analytics widgets, audit log viewer, memory profiling passes (VisualVM, Chrome devtools), finalize theming + configuration screens.
- End of Day: Polish tests, review performance metrics, prepare deployment scripts and knowledge transfer package.

## 10. Deliverables and Next Steps
- Deliverables: Roadmap (this doc), architecture diagrams (sequence/ERD), backend + frontend scaffolds, shared component library with Storybook, deployment guide, performance checklist.
- Immediate next steps: Confirm stakeholder buy-in on workflow states, set up repositories/CI, generate seed data scripts, begin implementation per Day 1 plan.
- Longer-term actions: Formalize migration scripts once schema stabilizes, integrate external systems (LIS/RIS, insurance), and run load tests.
