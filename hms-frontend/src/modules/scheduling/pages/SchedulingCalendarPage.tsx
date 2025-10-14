import { useEffect, useMemo, useState } from "react";
import Swal from 'sweetalert2';
import type { FormEvent } from "react";
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { FilterBar, type FilterBarValues, type FilterFieldConfig } from "../../../components/shared/FilterBar";
import { FormModal } from "../../../components/shared/FormModal";
import { PageHeader } from "../../../components/shared/PageHeader";
import { useRoleContext } from "../../../hooks/useRoleContext";
import { useResolvedPermissions, hasPermission } from "../../../hooks/usePermissions";
import { useAuth } from "../../../hooks/useAuth";
import { SearchableStaffSelect } from "../../../components/shared/SearchableStaffSelect";
import { useRoles, useDepartments } from "../../reference/hooks/useReferenceData";
import type { RoleDefinition, DepartmentDefinition } from "../../../types/reference";
import { useApproveShiftSwap, useCreateStaffShift, useRequestShiftSwap, useStaffShiftsList, useUpdateStaffShift } from "../hooks/useStaffShifts";
import { SHIFT_STATUS_LABELS, type ShiftStatus, type ShiftSwapApprovalPayload, type ShiftSwapRequestPayload, type StaffShift, type StaffShiftFilters } from "../../../types/scheduling";
import { toNairobiIsoString } from "../../../utils/timezone";

import { useShiftTypes } from "../../../hooks/useShiftTypes";
import type { ShiftType as ShiftTypeModel } from "../../../types/shiftType";
import { log } from "console";

type ModalType = "create" | "edit" | "swap-request" | "swap-approve" | null;
const SHIFT_STATUSES: readonly ShiftStatus[] = Object.keys(SHIFT_STATUS_LABELS) as ShiftStatus[];

function getTodayIso() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}
function getTomorrowIso() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  return now.toISOString().slice(0, 10);
}
const BASE_FILTER_VALUES: FilterBarValues = {
  searchTerm: "",
  status: "",
  departmentId: "",
  roleId: "",
  rangeStart: getTodayIso(),
  rangeEnd: getTomorrowIso(),
  restrictToRole: true
};
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
function toDateTimeUtcValue(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // Format as yyyy-MM-ddTHH:mm (UTC, not local)
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}
function formatTimeRange(shift: StaffShift) { return `${timeFormatter.format(new Date(shift.startsAt))} – ${timeFormatter.format(new Date(shift.endsAt))}`; }
function formatTimeRangeWithUtcDate(shift: StaffShift) {
  // Show the date and time as sent from backend (UTC, not converted)
  const pad = (n: number) => n.toString().padStart(2, '0');
  const parse = (iso: string) => {
    const d = new Date(iso);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  };
  return `${parse(shift.startsAt)} – ${parse(shift.endsAt)}`;
}

// Modal components
type ShiftCreateModalProps = { show: boolean; onHide: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void; isSubmitting: boolean; error?: unknown; defaultRole: number; roles: RoleDefinition[]; departments: DepartmentDefinition[]; shiftTypes: ShiftTypeModel[]; shiftTypesError: unknown };
function ShiftCreateModal({ show, onHide, onSubmit, isSubmitting, error, defaultRole, roles, departments, shiftTypes, shiftTypesError }: ShiftCreateModalProps) {
  const [staffUserId, setStaffUserId] = useState<number | undefined>(undefined);
  const [selectedShiftType, setSelectedShiftType] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  // When shift type changes, auto-fill start/end times with today's date and shift type times
  useEffect(() => {
    if (!selectedShiftType) return;
    const shiftTypeObj = (Array.isArray(shiftTypes) ? shiftTypes : []).find(t => t.id.toString() === selectedShiftType);
    if (!shiftTypeObj) return;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    // Compose local datetime string: yyyy-MM-ddTHH:mm
    const startsAt = `${yyyy}-${mm}-${dd}T${shiftTypeObj.startTime.slice(0,5)}`;
    const endsAt = `${yyyy}-${mm}-${dd}T${shiftTypeObj.endTime.slice(0,5)}`;
    setStartTime(startsAt);
    setEndTime(endsAt);
  }, [selectedShiftType, shiftTypes]);

  return (
    <FormModal show={show} title="Create shift" submitLabel="Create shift" onHide={onHide} onSubmit={onSubmit} isSubmitting={isSubmitting} error={error} size="lg">
      <Row className="g-3">
        <Col md={6}>
          <Form.Group controlId="cStaff">
            <Form.Label className="fw-semibold">Staff user</Form.Label>
            <SearchableStaffSelect value={staffUserId} onChange={setStaffUserId} required name="staffUserId" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="cRole">
            <Form.Label className="fw-semibold">Role</Form.Label>
            <Form.Select name="roleId" defaultValue={defaultRole?.toString() || ""}>{roles.filter(r => r && (typeof r.id !== 'undefined' || typeof (r as any).roleKey !== 'undefined')).map(r=> {
              const id = typeof r.id !== 'undefined' && r.id !== null ? r.id : ((r as any).roleKey ?? '');
              return <option key={id} value={id.toString()}>{r.displayName}</option>;
            })}</Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="cDept">
            <Form.Label className="fw-semibold">Department</Form.Label>
            <Form.Select name="departmentId" required defaultValue="">
              <option value="" disabled>Select…</option>
              {departments.filter(d => d && (typeof d.id !== 'undefined' || typeof (d as any).departmentId !== 'undefined')).map(d=> {
                const id = typeof d.id !== 'undefined' && d.id !== null ? d.id : ((d as any).departmentId ?? '');
                return <option key={id} value={id.toString()}>{d.displayName}</option>;
              })}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="cType">
            <Form.Label className="fw-semibold">Shift type</Form.Label>
            <Form.Select
              name="shiftType"
              required={false}
              disabled={!!shiftTypesError || !Array.isArray(shiftTypes) || shiftTypes.length === 0}
              value={selectedShiftType}
              onChange={e => setSelectedShiftType(e.target.value)}
            >
              <option value="" disabled>Select…</option>
              {(Array.isArray(shiftTypes) ? shiftTypes : [])
                .filter(t => t && typeof t.id !== 'undefined' && t.id !== null && t.name && t.startTime && t.endTime)
                .map((t: ShiftTypeModel) => (
                  <option key={t.id} value={t.id.toString()}>
                    {t.name} ({t.startTime}–{t.endTime})
                  </option>
                ))}
            </Form.Select>
            {(Array.isArray(shiftTypes) && shiftTypes.length === 0) && !shiftTypesError && <div className="small text-muted">Loading shift types…</div>}
            {typeof shiftTypesError !== 'undefined' && shiftTypesError !== null && (
              <div className="small text-danger">
                {`Failed to load shift types: ${typeof shiftTypesError === 'string' ? shiftTypesError : shiftTypesError instanceof Error ? shiftTypesError.message : 'Unknown error'}`}
              </div>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="cStart">
            <Form.Label className="fw-semibold">Starts at</Form.Label>
            <Form.Control name="startsAt" type="datetime-local" required value={startTime} onChange={e => setStartTime(e.target.value)} />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="cEnd">
            <Form.Label className="fw-semibold">Ends at</Form.Label>
            <Form.Control name="endsAt" type="datetime-local" required value={endTime} onChange={e => setEndTime(e.target.value)} />
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group controlId="cNotes">
            <Form.Label className="fw-semibold">Notes</Form.Label>
            <Form.Control name="notes" as="textarea" rows={3} placeholder="Optional" />
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group controlId="cRecurring">
            <Form.Check
              type="checkbox"
              name="isRecurring"
              label="Recurring shift (automatically creates next day's shift when completed)"
              className="fw-semibold"
            />
          </Form.Group>
        </Col>
      </Row>
    </FormModal>
  );
}
type ShiftEditModalProps = { show: boolean; onHide: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void; isSubmitting: boolean; error?: unknown; shift: StaffShift | null; roles: RoleDefinition[]; departments: DepartmentDefinition[]; shiftTypes: ShiftTypeModel[]; shiftTypesError: unknown; canManageShifts: boolean };

function ShiftEditModal({ show, onHide, onSubmit, isSubmitting, error, shift, roles, departments, shiftTypes, shiftTypesError, canManageShifts }: ShiftEditModalProps) {
  const [editStaffUserId, setEditStaffUserId] = useState<number | undefined>(shift?.staffUserId);
  const [selectedShiftType, setSelectedShiftType] = useState<string>(shift?.shiftType?.toString() || "");
  const [startTime, setStartTime] = useState<string>(shift ? toDateTimeUtcValue(shift.startsAt) : "");
  const [endTime, setEndTime] = useState<string>(shift ? toDateTimeUtcValue(shift.endsAt) : "");

  // Reset field values when the modal opens or the shift changes
  useEffect(() => {
    if (shift) {
      setEditStaffUserId(shift.staffUserId);
      setSelectedShiftType(shift.shiftType?.toString() || "");
      setStartTime(toDateTimeUtcValue(shift.startsAt));
      setEndTime(toDateTimeUtcValue(shift.endsAt));
    }
  }, [shift, show]);

  // Extract date from shift.startsAt (yyyy-MM-dd)
  const getShiftDate = () => {
    if (!shift?.startsAt) return "";
    const d = new Date(shift.startsAt);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Determine if fields should be disabled after check-in
  const isCheckedIn = !!(shift && ["CHECKED_IN", "IN_PROGRESS", "COMPLETED"].includes(shift.status));

  useEffect(() => {
    if (!selectedShiftType || !shift) return;
    const shiftTypeObj = shiftTypes.find(t => t.id.toString() === selectedShiftType);
    if (!shiftTypeObj) return;
    const date = getShiftDate();
    if (!date) return;
    const startsAt = `${date}T${shiftTypeObj.startTime.slice(0,5)}`;
    const endsAt = `${date}T${shiftTypeObj.endTime.slice(0,5)}`;
    setStartTime(startsAt);
    setEndTime(endsAt);
  }, [selectedShiftType, shiftTypes, shift]);

  return (
    <FormModal show={show} title="Update shift" submitLabel="Save changes" onHide={onHide} onSubmit={onSubmit} isSubmitting={isSubmitting} error={error} size="lg">
      {shift ? (
        <Row className="g-3">
          <Col md={6}>
            <Form.Group controlId="eStaff">
              <Form.Label className="fw-semibold">Staff User</Form.Label>
              <SearchableStaffSelect value={editStaffUserId} onChange={setEditStaffUserId} required disabled={isCheckedIn || true} name="staffUserId" />
              <input type="hidden" name="staffUserId" value={editStaffUserId ?? ''} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="eType">
              <Form.Label className="fw-semibold">Shift type</Form.Label>
              <Form.Select
                name="shiftType"
                required={false}
                disabled={isCheckedIn || !!shiftTypesError || shiftTypes.length === 0 || !canManageShifts}
                value={selectedShiftType}
                onChange={e => setSelectedShiftType(e.target.value)}
              >
                <option value="" disabled>Select…</option>
                {shiftTypes.map((t: ShiftTypeModel) => (
                  <option key={t.id} value={t.id.toString()}>
                    {t.name} ({t.startTime}–{t.endTime})
                  </option>
                ))}
              </Form.Select>
              <input type="hidden" name="shiftType" value={selectedShiftType} />
              {shiftTypes.length === 0 && !shiftTypesError && <div className="small text-muted">Loading shift types…</div>}
              {typeof shiftTypesError !== 'undefined' && shiftTypesError !== null && (
                <div className="small text-danger">
                  {`Failed to load shift types: ${typeof shiftTypesError === 'string' ? shiftTypesError : shiftTypesError instanceof Error ? shiftTypesError.message : 'Unknown error'}`}
                </div>
              )}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="eStatus">
              <Form.Label className="fw-semibold">Status</Form.Label>
              <Form.Select name="status" defaultValue={shift.status} required disabled={!!isCheckedIn}>{SHIFT_STATUSES.map(s=> <option key={s} value={s}>{SHIFT_STATUS_LABELS[s]}</option>)}</Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="eRole">
              <Form.Label className="fw-semibold">Role</Form.Label>
              <Form.Select disabled={isCheckedIn || !canManageShifts} name="roleId" defaultValue={shift.roleId?.toString()}>{roles.map(r=> <option key={r.id} value={r.id.toString()}>{r.displayName}</option>)}</Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="eDept">
              <Form.Label className="fw-semibold">Department</Form.Label>
              <Form.Select disabled={isCheckedIn || !canManageShifts} name="departmentId" defaultValue={shift.departmentId?.toString()}>{departments.map(d=> <option key={d.id} value={d.id.toString()}>{d.displayName}</option>)}</Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="eStart">
              <Form.Label className="fw-semibold">Starts at</Form.Label>
              <Form.Control disabled={isCheckedIn || !canManageShifts} name="startsAt" type="datetime-local" required value={startTime} onChange={e => setStartTime(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="eEnd">
              <Form.Label className="fw-semibold">Ends at</Form.Label>
              <Form.Control disabled={!canManageShifts && !isCheckedIn} name="endsAt" type="datetime-local" required value={endTime} onChange={e => setEndTime(e.target.value)} />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group controlId="eNotes">
              <Form.Label className="fw-semibold">Notes</Form.Label>
              <Form.Control name="notes" as="textarea" rows={3} defaultValue={shift.notes ?? ""} disabled={false} />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group controlId="eHandover">
              <Form.Label className="fw-semibold">Handover notes</Form.Label>
              <Form.Control name="handoverNotes" as="textarea" rows={2} defaultValue={shift.handoverNotes ?? ""} />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group controlId="eRecurring">
              <Form.Check
                type="checkbox"
                name="isRecurring"
                label="Recurring shift (automatically creates next day's shift when completed)"
                defaultChecked={shift.isRecurring}
                disabled={!canManageShifts}
                className="fw-semibold"
              />
            </Form.Group>
          </Col>
        </Row>
      ) : (
        <div className="text-muted">No shift selected.</div>
      )}
    </FormModal>
  );
}
type ShiftSwapRequestModalProps = { show: boolean; onHide: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void; isSubmitting: boolean; error?: unknown; shift: StaffShift | null; };
function ShiftSwapRequestModal({ show, onHide, onSubmit, isSubmitting, error, shift }: ShiftSwapRequestModalProps) {
  return (
    <FormModal show={show} title="Request shift swap" submitLabel="Submit request" onHide={onHide} onSubmit={onSubmit} isSubmitting={isSubmitting} error={error}>
      {shift ? (
        <Form.Group controlId="rNote"><Form.Label className="fw-semibold">Swap note</Form.Label><Form.Control as="textarea" name="note" rows={3} required placeholder="Explain reason & preferred replacement" /></Form.Group>
      ) : (
        <div className="text-muted">No shift selected.</div>
      )}
    </FormModal>
  );
}
type ShiftSwapApproveModalProps = { show: boolean; onHide: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void; isSubmitting: boolean; error?: unknown; shift: StaffShift | null; };
function ShiftSwapApproveModal({ show, onHide, onSubmit, isSubmitting, error, shift }: ShiftSwapApproveModalProps) {
  return (
    <FormModal show={show} title="Approve shift swap" submitLabel="Approve" onHide={onHide} onSubmit={onSubmit} isSubmitting={isSubmitting} error={error}>
      {shift ? (
        <>
          <p className="mb-2">Approving swap for <span className="fw-semibold">{shift.staffDisplayName}</span> on {dateFormatter.format(new Date(shift.startsAt))}.</p>
          <Row className="g-3">
            <Col md={6}><Form.Group controlId="aTarget"><Form.Label className="fw-semibold">Replacement staff ID</Form.Label><Form.Control name="targetStaffUserId" type="number" min="1" required /></Form.Group></Col>
            <Col xs={12}><Form.Group controlId="aNote"><Form.Label className="fw-semibold">Approval note</Form.Label><Form.Control as="textarea" name="note" rows={2} placeholder="Optional note" /></Form.Group></Col>
            <Col xs={12}><Form.Group controlId="aHandover"><Form.Label className="fw-semibold">Handover notes</Form.Label><Form.Control as="textarea" name="handoverNotes" rows={2} placeholder="Context for replacement" /></Form.Group></Col>
          </Row>
        </>
      ) : (
        <div className="text-muted">No shift selected.</div>
      )}
    </FormModal>
  );
}

// Helpers
function extractNotes(fd: FormData, key: string){ const v = fd.get(key); if(v==null) return undefined; const t = v.toString().trim(); return t? t : null; }
function localDateTimeToIso(val: string){
  if (!val) return "";
  const d = new Date(val);
  return toNairobiIsoString(d);
}
function dateOnlyToIso(val: string,end=false){
  if(!val) return undefined;
  const [y,m,d] = val.split('-').map(Number);
  if(!y||!m||!d) return undefined;
  const dt = new Date(y, m-1, d, end?23:0, end?59:0, end?59:0, end?999:0);
  return toNairobiIsoString(dt);
}
function mapFilters(values: FilterBarValues, activeRole?: number | string, rolesList?: RoleDefinition[]): StaffShiftFilters {
  const f: StaffShiftFilters = {};
  const restrict = !!values.restrictToRole;
  const dept = values.departmentId ? Number(values.departmentId) : undefined;
  const status = (values.status as string) || "";
  const role = values.roleId ? Number(values.roleId) : undefined;
  const shiftType = values.shiftType ? Number(values.shiftType) : undefined;
  const rs = (values.rangeStart as string) || "";
  const re = (values.rangeEnd as string) || "";
  if (dept) f.departmentId = dept;
  if (status) f.status = status.trim() as ShiftStatus;
  if (shiftType !== undefined && !isNaN(shiftType)) f.shiftType = shiftType;
  if (restrict && activeRole && rolesList && typeof activeRole === 'string') {
    const found = rolesList.find(r => r.roleKey === activeRole || r.id.toString() === activeRole);
    if (found) f.roleId = found.id;
  } else if (restrict && activeRole && typeof activeRole === 'number') {
    f.roleId = activeRole;
  } else if (!restrict) {
    // Only set roleId if user has explicitly selected a role
    if (role) f.roleId = role;
    // If no role selected, do not set roleId (return all roles)
  }
  const rsi = dateOnlyToIso(rs, false);
  if (rsi) f.rangeStart = rsi;
  const rei = dateOnlyToIso(re, true);
  if (rei) f.rangeEnd = rei;
  return f;
}
function providerLabel(s: StaffShift){ return s.staffDisplayName || `User #${s.staffUserId}`; }

const EMPTY = "No shifts match the current filters. Adjust filters or create a new shift.";

export function SchedulingCalendarPage(){
  const { activeRole } = useRoleContext();
  const rolesQuery = useRoles();
  const deptsQuery = useDepartments();
  const { shiftTypes, loading: shiftTypesLoading, error: shiftTypesError } = useShiftTypes();
  
  // Helper to get shift type object by id
  // Fix: handle id as string or number, fallback for shiftType lookup
  const getShiftType = (id: number | string) => {
    if (id == null) return undefined;
    // Try both number and string comparison for robustness
    return shiftTypes.find(t => t.id === id || t.id === Number(id) || t.id.toString() === id.toString());
  };
  const STORAGE_KEY = "scheduling.filters.v1";
  const [filterValues,setFilterValues] = useState<FilterBarValues>(()=>{
    // Attempt load from query first, then localStorage
    const params = new URLSearchParams(window.location.search);
    const fromQuery: Record<string,string> = {};
  ["searchTerm","status","departmentId","roleId","rangeStart","rangeEnd"].forEach(k=>{
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
  // Permissions and user context
  const { permissions } = useResolvedPermissions();
  const { user } = useAuth();
  const canManageShifts = hasPermission(permissions, "MANAGE_SHIFTS");
  const applied = useMemo(()=> mapFilters(filterValues, activeRole, rolesQuery.data), [filterValues, activeRole, rolesQuery.data]);
  const search = (filterValues.searchTerm as string)?.toLowerCase().trim() || "";
  const { data: shifts = [], isLoading, isError, refetch } = useStaffShiftsList(applied);
  const filtered = useMemo(()=> !search ? shifts : shifts.filter(s => [s.staffDisplayName,s.departmentId,s.roleId,getShiftType(s.shiftType)?.name || s.shiftType,s.notes??"",s.handoverNotes??""].filter(Boolean).map(v=>String(v).toLowerCase()).some(v=>v.includes(search))), [shifts, search, shiftTypes]);
  const createShift = useCreateStaffShift(applied); const updateShift = useUpdateStaffShift(applied); const requestSwap = useRequestShiftSwap(applied); const approveSwap = useApproveShiftSwap(applied);

  // Access control: allow approving only if user has an admin/scheduler style role
  const userCanApprove = useMemo(()=>{
    const roleStr = typeof activeRole === 'string' ? activeRole : String(activeRole);
    const role = roleStr?.toLowerCase() || "";
    return ["admin","scheduler","manager"].some(k => role.includes(k));
  },[activeRole]);
  const close = ()=>{ setModal(null); setSelected(null); };
  const onCreate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      staffUserId: Number(fd.get('staffUserId')),
      roleId: Number(fd.get('roleId')),
      departmentId: Number(fd.get('departmentId')),
      shiftTypeId: Number(fd.get('shiftType')),
      startsAt: localDateTimeToIso(fd.get('startsAt')?.toString() || ""),
      endsAt: localDateTimeToIso(fd.get('endsAt')?.toString() || ""),
      notes: extractNotes(fd, 'notes'),
      isRecurring: fd.get('isRecurring') === 'on'
    };
    createShift.mutate(payload as any, { onSuccess: () => {
      if (e.currentTarget && typeof e.currentTarget.reset === 'function') {
        e.currentTarget.reset();
      }
      close();
      Swal.fire({
        icon: 'success',
        title: 'Shift created',
        text: 'The shift was created successfully.',
        timer: 1800,
        showConfirmButton: false
      });
    }});
  };

  // const { permissions } = useResolvedPermissions();
  const onEdit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected) return;
    const fd = new FormData(e.currentTarget);
    // Always use staffUserId from the form
    const staffId = fd.get('staffUserId') ? Number(fd.get('staffUserId')) : undefined;
    const payload = {
      staffUserId: staffId,
      roleId: fd.get('roleId') ? Number(fd.get('roleId')) : undefined,
      departmentId: fd.get('departmentId') ? Number(fd.get('departmentId')) : undefined,
      shiftTypeId: fd.get('shiftType') ? Number(fd.get('shiftType')) : undefined,
      status: fd.get('status') as ShiftStatus,
      startsAt: localDateTimeToIso(fd.get('startsAt')?.toString() || ""),
      endsAt: localDateTimeToIso(fd.get('endsAt')?.toString() || ""),
      notes: extractNotes(fd, 'notes'),
      handoverNotes: extractNotes(fd, 'handoverNotes'),
      isRecurring: fd.get('isRecurring') === 'on'
    };
    const useOwnerEndpoint = !hasPermission(permissions, 'MANAGE_SHIFTS');
    updateShift.mutate({ shiftId: selected.id, payload: payload as any, useOwnerEndpoint }, { onSuccess: close });
  };

  const onSwapReq = (e: FormEvent<HTMLFormElement>)=>{ e.preventDefault(); if(!selected) return; const fd=new FormData(e.currentTarget); const payload: ShiftSwapRequestPayload = { note: fd.get('note')?.toString().trim()||"" }; requestSwap.mutate({ shiftId: selected.id, payload }, { onSuccess:()=>{ e.currentTarget.reset(); close(); }}); };
  const onSwapApprove = (e: FormEvent<HTMLFormElement>)=>{ e.preventDefault(); if(!selected) return; const fd=new FormData(e.currentTarget); const targetStaffUserId = Number(fd.get('targetStaffUserId')); if(Number.isNaN(targetStaffUserId)) return; const payload: ShiftSwapApprovalPayload = { targetStaffUserId, note: extractNotes(fd,'note'), handoverNotes: extractNotes(fd,'handoverNotes') }; approveSwap.mutate({ shiftId: selected.id, payload }, { onSuccess:()=>{ e.currentTarget.reset(); close(); }}); };
  const open = (m: Exclude<ModalType,null>, s?: StaffShift)=>{ setModal(m); setSelected(s??null); };
  const filterFields: FilterFieldConfig[] = [
    { key: 'searchTerm', type: 'search', placeholder: 'Search staff, dept, or notes…', col: 4 },
    { key: 'status', type: 'select', label: 'Status', placeholder: 'All', col: 2, options: SHIFT_STATUSES.map(s=>({ value: s, label: SHIFT_STATUS_LABELS[s] })) },
    { key: 'shiftType', type: 'select', label: 'Shift Type', placeholder: 'All', col: 2, options: (shiftTypes ?? []).filter(t => t && typeof t.id === 'number').map(t => ({ value: t.id.toString(), label: t && t.name && t.startTime && t.endTime ? `${t.name} (${t.startTime}–${t.endTime})` : '' })) },
    { key: 'departmentId', type: 'select', label: 'Department', placeholder: 'All', col: 2, options: (deptsQuery.data ?? [])
      .map(d => {
        const id = typeof d.id === 'number' ? d.id : (typeof (d as any).departmentId === 'number' ? (d as any).departmentId : undefined);
        return id !== undefined ? { value: id.toString(), label: d.displayName ?? '' } : null;
      })
      .filter((x): x is { value: string; label: string } => x !== null) },
    { key: 'roleId', type: 'select', label: 'Role', placeholder: 'All', col: 2, options: (rolesQuery.data ?? [])
      .map(r => {
        const id = typeof r.id === 'number' ? r.id : (typeof (r as any).roleKey === 'number' ? (r as any).roleKey : undefined);
        return id !== undefined ? { value: id.toString(), label: r.displayName ?? '' } : null;
      })
      .filter((x): x is { value: string; label: string } => x !== null) },
    { key: 'rangeStart', type: 'date', label: 'Start', col: 2 },
    { key: 'rangeEnd', type: 'date', label: 'End', col: 2 },
    { key: 'restrictToRole', type: 'toggle', label: `Limit to my role${activeRole ? ` (${activeRole})` : ''}`, description: 'Use your active role automatically', col: 3 }
  ];
  return (<div className="d-flex flex-column gap-3">
    <PageHeader title="Scheduling" subtitle="Coordinate provider availability, procedure rooms, and shared resources."
      actions={<div className="d-flex gap-2">
        <Button variant="outline-secondary" onClick={()=>refetch()}>Refresh</Button>
        {canManageShifts && <Button variant="primary" onClick={()=>open('create')}>Add shift</Button>}
      </div>} />
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
                <td>{s.roleName}</td>
                <td>{s.departmentName}</td>
                <td>
                  <div className="fw-semibold">{formatTimeRangeWithUtcDate(s)}</div>
                  {s.isRecurring && (
                    <div className="text-info small">
                      <i className="bi bi-arrow-repeat me-1"></i>Recurring
                    </div>
                  )}
                </td>
                <td><Badge bg={statusVariant(s.status)}>{SHIFT_STATUS_LABELS[s.status]}</Badge></td>
                <td className="text-end">
                  <div className="d-flex gap-2 justify-content-end">
                    {(canManageShifts || (user && user.id === s.staffUserId)) && (
                      <Button size="sm" variant="outline-primary" onClick={()=>open('edit', s)}>Edit</Button>
                    )}
                    {(canManageShifts || (user && user.id === s.staffUserId)) && (
                    <Button size="sm" variant="outline-secondary" onClick={()=>open('swap-request', s)}>Request swap</Button>
                    )}
                    {userCanApprove && <Button size="sm" variant="outline-success" disabled={s.status!== 'SWAP_REQUESTED'} onClick={()=>open('swap-approve', s)}>Approve swap</Button>}
                  </div>
                </td>
              </tr>)}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  <ShiftCreateModal show={modal==='create'} onHide={close} onSubmit={onCreate} isSubmitting={createShift.isPending} error={createShift.isError? createShift.error: undefined} defaultRole={typeof activeRole === 'number' ? activeRole : 0} roles={rolesQuery.data ?? []} departments={deptsQuery.data ?? []} shiftTypes={shiftTypes} shiftTypesError={shiftTypesError} />
  <ShiftEditModal canManageShifts={canManageShifts} show={modal==='edit'} onHide={close} onSubmit={onEdit} isSubmitting={updateShift.isPending} error={updateShift.isError? updateShift.error: undefined} shift={selected} roles={rolesQuery.data ?? []} departments={deptsQuery.data ?? []} shiftTypes={shiftTypes} shiftTypesError={shiftTypesError} />
    <ShiftSwapRequestModal show={modal==='swap-request'} onHide={close} onSubmit={onSwapReq} isSubmitting={requestSwap.isPending} error={requestSwap.isError? requestSwap.error: undefined} shift={selected} />
    <ShiftSwapApproveModal show={modal==='swap-approve'} onHide={close} onSubmit={onSwapApprove} isSubmitting={approveSwap.isPending} error={approveSwap.isError? approveSwap.error: undefined} shift={selected} />
  </div>);
}