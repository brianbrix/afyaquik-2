import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { FilterBar, type FilterBarValues, type FilterFieldConfig } from "../../../components/shared/FilterBar";
import { FormModal } from "../../../components/shared/FormModal";
import { PageHeader } from "../../../components/shared/PageHeader";
import { useRoleContext } from "../../../hooks/useRoleContext";
import { useRoles, useDepartments } from "../../reference/hooks/useReferenceData";
import type { RoleDefinition, DepartmentDefinition } from "../../../types/reference";
import { useApproveShiftSwap, useCreateStaffShift, useRequestShiftSwap, useStaffShiftsList, useUpdateStaffShift } from "../hooks/useStaffShifts";
import { SHIFT_STATUS_LABELS, SHIFT_TYPE_LABELS, SHIFT_TYPES, type CreateStaffShiftPayload, type ShiftStatus, type ShiftSwapApprovalPayload, type ShiftSwapRequestPayload, type ShiftType, type StaffShift, type StaffShiftFilters, type UpdateStaffShiftPayload } from "../../../types/scheduling";

type ModalType = "create" | "edit" | "swap-request" | "swap-approve" | null;
const SHIFT_STATUSES: readonly ShiftStatus[] = Object.keys(SHIFT_STATUS_LABELS) as ShiftStatus[];

const BASE_FILTER_VALUES: FilterBarValues = { searchTerm: "", status: "", departmentId: "", roleKey: "", rangeStart: "", rangeEnd: "", restrictToRole: true };
const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });

function statusVariant(status: ShiftStatus): string {
  switch (status) {
    case "SCHEDULED": return "info";
    case "CHECKED_IN":
    case "IN_PROGRESS": return "primary";
    case "SWAP_REQUESTED": return "warning";
    case "SWAPPED":
    case "COMPLETED": return "success";
    case "CANCELLED": return "secondary";
    default: return "dark";
  }
}
function toDateTimeLocalValue(iso: string): string { if (!iso) return ""; const d = new Date(iso); if (Number.isNaN(d.getTime())) return ""; const local = new Date(d.getTime() - d.getTimezoneOffset()*60000); return local.toISOString().slice(0,16);} 
function formatTimeRange(shift: StaffShift) { return `${timeFormatter.format(new Date(shift.startsAt))} – ${timeFormatter.format(new Date(shift.endsAt))}`; }

// Modal components
type ShiftCreateModalProps = { show: boolean; onHide: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void; isSubmitting: boolean; error?: unknown; defaultRole: string; roles: RoleDefinition[]; departments: DepartmentDefinition[]; };
function ShiftCreateModal({ show, onHide, onSubmit, isSubmitting, error, defaultRole, roles, departments }: ShiftCreateModalProps) {
  return (<FormModal show={show} title="Create shift" submitLabel="Create shift" onHide={onHide} onSubmit={onSubmit} isSubmitting={isSubmitting} error={error} size="lg">
    <Row className="g-3">
  <Col md={6}><Form.Group controlId="cStaff"><Form.Label className="fw-semibold">Staff user ID</Form.Label><Form.Control name="staffUserId" type="number" min="1" required /></Form.Group></Col>
  <Col md={6}><Form.Group controlId="cRole"><Form.Label className="fw-semibold">Role</Form.Label><Form.Select name="roleKey" defaultValue={defaultRole}>{roles.map(r=> <option key={r.roleKey} value={r.roleKey}>{r.displayName}</option>)}</Form.Select></Form.Group></Col>
  <Col md={6}><Form.Group controlId="cDept"><Form.Label className="fw-semibold">Department</Form.Label><Form.Select name="departmentId" required defaultValue=""> <option value="" disabled>Select…</option> {departments.map(d=> <option key={d.departmentId} value={d.departmentId}>{d.displayName}</option>)} </Form.Select></Form.Group></Col>
  <Col md={6}><Form.Group controlId="cType"><Form.Label className="fw-semibold">Shift type</Form.Label><Form.Select name="shiftType" defaultValue="MORNING" required>{SHIFT_TYPES.map(t=> <option key={t} value={t}>{SHIFT_TYPE_LABELS[t]}</option>)}</Form.Select></Form.Group></Col>
  <Col md={6}><Form.Group controlId="cStart"><Form.Label className="fw-semibold">Starts at</Form.Label><Form.Control name="startsAt" type="datetime-local" required /></Form.Group></Col>
  <Col md={6}><Form.Group controlId="cEnd"><Form.Label className="fw-semibold">Ends at</Form.Label><Form.Control name="endsAt" type="datetime-local" required /></Form.Group></Col>
  <Col xs={12}><Form.Group controlId="cNotes"><Form.Label className="fw-semibold">Notes</Form.Label><Form.Control name="notes" as="textarea" rows={3} placeholder="Optional" /></Form.Group></Col>
    </Row>
  </FormModal>);
}
type ShiftEditModalProps = { show: boolean; onHide: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void; isSubmitting: boolean; error?: unknown; shift: StaffShift | null; roles: RoleDefinition[]; departments: DepartmentDefinition[]; };
function ShiftEditModal({ show, onHide, onSubmit, isSubmitting, error, shift, roles, departments }: ShiftEditModalProps) { if(!shift) return null; return (<FormModal show={show} title="Update shift" submitLabel="Save changes" onHide={onHide} onSubmit={onSubmit} isSubmitting={isSubmitting} error={error} size="lg">
  <Row className="g-3">
  <Col md={6}><Form.Group controlId="eStaff"><Form.Label className="fw-semibold">Staff user ID</Form.Label><Form.Control name="staffUserId" type="number" min="1" defaultValue={shift.staffUserId} required /></Form.Group></Col>
  <Col md={6}><Form.Group controlId="eRole"><Form.Label className="fw-semibold">Role</Form.Label><Form.Select name="roleKey" defaultValue={shift.roleKey}>{roles.map(r=> <option key={r.roleKey} value={r.roleKey}>{r.displayName}</option>)}</Form.Select></Form.Group></Col>
  <Col md={6}><Form.Group controlId="eDept"><Form.Label className="fw-semibold">Department</Form.Label><Form.Select name="departmentId" defaultValue={shift.departmentId} required>{departments.map(d=> <option key={d.departmentId} value={d.departmentId}>{d.displayName}</option>)}</Form.Select></Form.Group></Col>
  <Col md={6}><Form.Group controlId="eType"><Form.Label className="fw-semibold">Shift type</Form.Label><Form.Select name="shiftType" defaultValue={shift.shiftType} required>{SHIFT_TYPES.map(t=> <option key={t} value={t}>{SHIFT_TYPE_LABELS[t]}</option>)}</Form.Select></Form.Group></Col>
  <Col md={6}><Form.Group controlId="eStatus"><Form.Label className="fw-semibold">Status</Form.Label><Form.Select name="status" defaultValue={shift.status} required>{SHIFT_STATUSES.map(s=> <option key={s} value={s}>{SHIFT_STATUS_LABELS[s]}</option>)}</Form.Select></Form.Group></Col>
  <Col md={6}><Form.Group controlId="eStart"><Form.Label className="fw-semibold">Starts at</Form.Label><Form.Control name="startsAt" type="datetime-local" defaultValue={toDateTimeLocalValue(shift.startsAt)} required /></Form.Group></Col>
  <Col md={6}><Form.Group controlId="eEnd"><Form.Label className="fw-semibold">Ends at</Form.Label><Form.Control name="endsAt" type="datetime-local" defaultValue={toDateTimeLocalValue(shift.endsAt)} required /></Form.Group></Col>
  <Col xs={12}><Form.Group controlId="eNotes"><Form.Label className="fw-semibold">Notes</Form.Label><Form.Control name="notes" as="textarea" rows={3} defaultValue={shift.notes ?? ""} /></Form.Group></Col>
  <Col xs={12}><Form.Group controlId="eHandover"><Form.Label className="fw-semibold">Handover notes</Form.Label><Form.Control name="handoverNotes" as="textarea" rows={2} defaultValue={shift.handoverNotes ?? ""} /></Form.Group></Col>
  </Row>
</FormModal>); }
type ShiftSwapRequestModalProps = { show: boolean; onHide: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void; isSubmitting: boolean; error?: unknown; shift: StaffShift | null; };
function ShiftSwapRequestModal({ show, onHide, onSubmit, isSubmitting, error, shift }: ShiftSwapRequestModalProps) { if(!shift) return null; return (<FormModal show={show} title="Request shift swap" submitLabel="Submit request" onHide={onHide} onSubmit={onSubmit} isSubmitting={isSubmitting} error={error}>
  <p className="mb-3">Requesting swap for <span className="fw-semibold">{SHIFT_TYPE_LABELS[shift.shiftType]}</span> on {dateFormatter.format(new Date(shift.startsAt))} with {formatTimeRange(shift)}.</p>
    <Form.Group controlId="rNote"><Form.Label className="fw-semibold">Swap note</Form.Label><Form.Control as="textarea" name="note" rows={3} required placeholder="Explain reason & preferred replacement" /></Form.Group>
</FormModal>); }
type ShiftSwapApproveModalProps = { show: boolean; onHide: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void; isSubmitting: boolean; error?: unknown; shift: StaffShift | null; };
function ShiftSwapApproveModal({ show, onHide, onSubmit, isSubmitting, error, shift }: ShiftSwapApproveModalProps){ if(!shift) return null; return (<FormModal show={show} title="Approve shift swap" submitLabel="Approve" onHide={onHide} onSubmit={onSubmit} isSubmitting={isSubmitting} error={error}>
  <p className="mb-2">Approving swap for <span className="fw-semibold">{shift.staffDisplayName}</span> on {dateFormatter.format(new Date(shift.startsAt))}.</p>
  <Row className="g-3">
     <Col md={6}><Form.Group controlId="aTarget"><Form.Label className="fw-semibold">Replacement staff ID</Form.Label><Form.Control name="targetStaffUserId" type="number" min="1" required /></Form.Group></Col>
     <Col xs={12}><Form.Group controlId="aNote"><Form.Label className="fw-semibold">Approval note</Form.Label><Form.Control as="textarea" name="note" rows={2} placeholder="Optional note" /></Form.Group></Col>
     <Col xs={12}><Form.Group controlId="aHandover"><Form.Label className="fw-semibold">Handover notes</Form.Label><Form.Control as="textarea" name="handoverNotes" rows={2} placeholder="Context for replacement" /></Form.Group></Col>
  </Row>
</FormModal>); }

// Helpers
function extractNotes(fd: FormData, key: string){ const v = fd.get(key); if(v==null) return undefined; const t = v.toString().trim(); return t? t : null; }
function localDateTimeToIso(val: string){ const d=new Date(val); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString(); }
function dateOnlyToIso(val: string,end=false){ if(!val)return undefined; const [y,m,d]=val.split('-').map(Number); if(!y||!m||!d)return undefined; const dt=new Date(y,m-1,d,end?23:0,end?59:0,end?59:0,end?999:0); return dt.toISOString(); }
function mapFilters(values: FilterBarValues, activeRole?: string): StaffShiftFilters { const f: StaffShiftFilters = {}; const restrict=!!values.restrictToRole; const dept=(values.departmentId as string)||""; const status=(values.status as string)||""; const role=(values.roleKey as string)||""; const rs=(values.rangeStart as string)||""; const re=(values.rangeEnd as string)||""; if(dept) f.departmentId=dept.trim(); if(status) f.status=status.trim() as ShiftStatus; if(restrict && activeRole) f.roleKey=activeRole; else if(!restrict && role) f.roleKey=role.trim(); const rsi=dateOnlyToIso(rs,false); if(rsi) f.rangeStart=rsi; const rei=dateOnlyToIso(re,true); if(rei) f.rangeEnd=rei; return f; }
function providerLabel(s: StaffShift){ return s.staffDisplayName || `User #${s.staffUserId}`; }

const EMPTY = "No shifts match the current filters. Adjust filters or create a new shift.";

export function SchedulingCalendarPage(){
  const { activeRole } = useRoleContext();
  const rolesQuery = useRoles();
  const deptsQuery = useDepartments();
  const STORAGE_KEY = "scheduling.filters.v1";
  const [filterValues,setFilterValues] = useState<FilterBarValues>(()=>{
    // Attempt load from query first, then localStorage
    const params = new URLSearchParams(window.location.search);
    const fromQuery: Record<string,string> = {};
    ["searchTerm","status","departmentId","roleKey","rangeStart","rangeEnd"].forEach(k=>{
      const v = params.get(k);
      if (v) fromQuery[k] = v;
    });
    if(Object.keys(fromQuery).length){
      return { ...BASE_FILTER_VALUES, ...fromQuery };
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw){
        const parsed = JSON.parse(raw);
        if(parsed && typeof parsed === 'object'){
          return { ...BASE_FILTER_VALUES, ...parsed };
        }
      }
    } catch { /* ignore */ }
    return { ...BASE_FILTER_VALUES };
  });

  // Persist to localStorage & URL when filterValues change
  useEffect(()=>{
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(filterValues)); } catch { /* ignore */ }
    const params = new URLSearchParams();
    Object.entries(filterValues).forEach(([k,v])=>{
      if(typeof v === 'string' && v) params.set(k,v);
    });
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null,'', newUrl);
  },[filterValues]);
  const [modal,setModal] = useState<ModalType>(null);
  const [selected,setSelected] = useState<StaffShift|null>(null);
  const applied = useMemo(()=> mapFilters(filterValues, activeRole), [filterValues, activeRole]);
  const search = (filterValues.searchTerm as string)?.toLowerCase().trim() || "";
  const { data: shifts = [], isLoading, isError, refetch } = useStaffShiftsList(applied);
  const filtered = useMemo(()=> !search ? shifts : shifts.filter(s => [s.staffDisplayName,s.departmentId,s.roleKey,SHIFT_TYPE_LABELS[s.shiftType],s.notes??"",s.handoverNotes??""].filter(Boolean).map(v=>v!.toLowerCase()).some(v=>v.includes(search))), [shifts, search]);
  const createShift = useCreateStaffShift(applied); const updateShift = useUpdateStaffShift(applied); const requestSwap = useRequestShiftSwap(applied); const approveSwap = useApproveShiftSwap(applied);

  // Access control: allow approving only if user has an admin/scheduler style role
  const userCanApprove = useMemo(()=>{
    const role = activeRole?.toLowerCase() || "";
    return ["admin","scheduler","manager"].some(k => role.includes(k));
  },[activeRole]);
  const close = ()=>{ setModal(null); setSelected(null); };
  const onCreate = (e: FormEvent<HTMLFormElement>)=>{ e.preventDefault(); const fd=new FormData(e.currentTarget); const payload: CreateStaffShiftPayload = { staffUserId: Number(fd.get('staffUserId')), roleKey: (fd.get('roleKey')?.toString().trim()|| activeRole || ""), departmentId: fd.get('departmentId')?.toString().trim()||"", shiftType: fd.get('shiftType') as ShiftType, startsAt: localDateTimeToIso(fd.get('startsAt')?.toString()||""), endsAt: localDateTimeToIso(fd.get('endsAt')?.toString()||""), notes: extractNotes(fd,'notes') }; if(!payload.roleKey) return; createShift.mutate(payload,{ onSuccess:()=>{ e.currentTarget.reset(); close(); }}); };
  const onEdit = (e: FormEvent<HTMLFormElement>)=>{ e.preventDefault(); if(!selected) return; const fd=new FormData(e.currentTarget); const payload: UpdateStaffShiftPayload = { staffUserId: Number(fd.get('staffUserId')), roleKey: fd.get('roleKey')?.toString().trim()||undefined, departmentId: fd.get('departmentId')?.toString().trim()||undefined, shiftType: fd.get('shiftType') as ShiftType, status: fd.get('status') as ShiftStatus, startsAt: localDateTimeToIso(fd.get('startsAt')?.toString()||""), endsAt: localDateTimeToIso(fd.get('endsAt')?.toString()||""), notes: extractNotes(fd,'notes'), handoverNotes: extractNotes(fd,'handoverNotes') }; updateShift.mutate({ shiftId: selected.id, payload }, { onSuccess: close }); };
  const onSwapReq = (e: FormEvent<HTMLFormElement>)=>{ e.preventDefault(); if(!selected) return; const fd=new FormData(e.currentTarget); const payload: ShiftSwapRequestPayload = { note: fd.get('note')?.toString().trim()||"" }; requestSwap.mutate({ shiftId: selected.id, payload }, { onSuccess:()=>{ e.currentTarget.reset(); close(); }}); };
  const onSwapApprove = (e: FormEvent<HTMLFormElement>)=>{ e.preventDefault(); if(!selected) return; const fd=new FormData(e.currentTarget); const targetStaffUserId = Number(fd.get('targetStaffUserId')); if(Number.isNaN(targetStaffUserId)) return; const payload: ShiftSwapApprovalPayload = { targetStaffUserId, note: extractNotes(fd,'note'), handoverNotes: extractNotes(fd,'handoverNotes') }; approveSwap.mutate({ shiftId: selected.id, payload }, { onSuccess:()=>{ e.currentTarget.reset(); close(); }}); };
  const open = (m: Exclude<ModalType,null>, s?: StaffShift)=>{ setModal(m); setSelected(s??null); };
  const filterFields: FilterFieldConfig[] = [
    { key: 'searchTerm', type: 'search', placeholder: 'Search staff, dept, or notes…', col: 4 },
    { key: 'status', type: 'select', label: 'Status', placeholder: 'All', col: 2, options: SHIFT_STATUSES.map(s=>({ value: s, label: SHIFT_STATUS_LABELS[s] })) },
    { key: 'departmentId', type: 'text', label: 'Department', col: 2 },
    { key: 'roleKey', type: 'text', label: 'Role key', col: 2 },
    { key: 'rangeStart', type: 'date', label: 'Start', col: 2 },
    { key: 'rangeEnd', type: 'date', label: 'End', col: 2 },
    { key: 'restrictToRole', type: 'toggle', label: `Limit to my role${activeRole ? ` (${activeRole})` : ''}`, description: 'Use your active role automatically', col: 3 }
  ];
  return (<div className="d-flex flex-column gap-3">
    <PageHeader title="Scheduling" subtitle="Coordinate provider availability, procedure rooms, and shared resources." actions={<div className="d-flex gap-2"><Button variant="outline-secondary" onClick={()=>refetch()}>Refresh</Button><Button variant="primary" onClick={()=>open('create')}>Add shift</Button></div>} />
    <Card className="shadow-sm border-0">
      <Card.Body className="d-flex flex-column gap-3">
        <FilterBar fields={filterFields} values={filterValues} onChange={setFilterValues} onReset={()=>setFilterValues({...BASE_FILTER_VALUES})} />
        {isError && <Alert variant="danger" className="mb-0">Unable to load shifts. Try again.</Alert>}
        <div className="table-responsive">
          <Table hover responsive className="align-middle mb-0">
            <thead><tr><th>Staff</th><th>Role</th><th>Department</th><th>Shift</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={6} className="text-center py-4"><Spinner animation="border" role="status" /></td></tr> : !filtered.length ? <tr><td colSpan={6} className="text-center py-4 text-muted">{EMPTY}</td></tr> : filtered.map(s => <tr key={s.id}>
                <td><div className="fw-semibold">{providerLabel(s)}</div><div className="text-muted small">{s.staffUserId}</div></td>
                <td>{s.roleKey}</td>
                <td>{s.departmentId}</td>
                <td><div className="fw-semibold">{SHIFT_TYPE_LABELS[s.shiftType]}</div><div className="text-muted small">{dateFormatter.format(new Date(s.startsAt))} · {formatTimeRange(s)}</div></td>
                <td><Badge bg={statusVariant(s.status)}>{SHIFT_STATUS_LABELS[s.status]}</Badge></td>
                <td className="text-end"><div className="d-flex gap-2 justify-content-end"><Button size="sm" variant="outline-primary" onClick={()=>open('edit', s)}>Edit</Button><Button size="sm" variant="outline-secondary" onClick={()=>open('swap-request', s)}>Request swap</Button>{userCanApprove && <Button size="sm" variant="outline-success" disabled={s.status!== 'SWAP_REQUESTED'} onClick={()=>open('swap-approve', s)}>Approve swap</Button>}</div></td>
              </tr>)}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  <ShiftCreateModal show={modal==='create'} onHide={close} onSubmit={onCreate} isSubmitting={createShift.isPending} error={createShift.isError? createShift.error: undefined} defaultRole={activeRole||''} roles={rolesQuery.data ?? []} departments={deptsQuery.data ?? []} />
  <ShiftEditModal show={modal==='edit'} onHide={close} onSubmit={onEdit} isSubmitting={updateShift.isPending} error={updateShift.isError? updateShift.error: undefined} shift={selected} roles={rolesQuery.data ?? []} departments={deptsQuery.data ?? []} />
    <ShiftSwapRequestModal show={modal==='swap-request'} onHide={close} onSubmit={onSwapReq} isSubmitting={requestSwap.isPending} error={requestSwap.isError? requestSwap.error: undefined} shift={selected} />
    <ShiftSwapApproveModal show={modal==='swap-approve'} onHide={close} onSubmit={onSwapApprove} isSubmitting={approveSwap.isPending} error={approveSwap.isError? approveSwap.error: undefined} shift={selected} />
  </div>);
}
