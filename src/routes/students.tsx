import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Edit2, Trash2, Users, Eye } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Card, PageHeader, Skeleton, EmptyState, ErrorState, StatusBadge } from "@/components/ui-kit";
import { Button, Field, Select, TextInput, Textarea } from "@/components/form";
import { Modal, ConfirmDialog } from "@/components/Modal";
import { useApiQuery, asList } from "@/lib/hooks";
import { api } from "@/lib/api";

export const Route = createFileRoute("/students")({
  head: () => ({ meta: [{ title: "Students — School ERP" }] }),
  component: () => <AppShell><Students /></AppShell>,
});

const empty = {
  admissionNo: "", admissionDate: "", fullName: "", fatherName: "",
  guardianPhone: "", whatsappNumber: "", gender: "MALE", dateOfBirth: "",
  address: "", classId: "", sectionId: "", monthlyFee: 0, status: "ACTIVE",
};

function Students() {
  const list = useApiQuery<any>("/students");
  const classes = useApiQuery<any>("/classes");
  const sections = useApiQuery<any>("/sections");

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [modal, setModal] = useState<{ open: boolean; data: any | null }>({ open: false, data: null });
  const [view, setView] = useState<any | null>(null);
  const [del, setDel] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const students = useMemo(() => {
    const all = asList<any>(list.data);
    return all.filter((s) => {
      const t = `${s.fullName || ""} ${s.admissionNo || ""} ${s.fatherName || ""}`.toLowerCase();
      if (search && !t.includes(search.toLowerCase())) return false;
      if (classFilter && String(s.classId || s.class?.id) !== classFilter) return false;
      if (sectionFilter && String(s.sectionId || s.section?.id) !== sectionFilter) return false;
      return true;
    });
  }, [list.data, search, classFilter, sectionFilter]);

  const save = async (form: any) => {
    setSaving(true);
    try {
      const payload = { ...form, monthlyFee: Number(form.monthlyFee) || 0 };
      if (modal.data?.id) {
        await api.patch(`/students/${modal.data.id}`, payload);
        toast.success("Student updated");
      } else {
        await api.post("/students", payload);
        toast.success("Student added");
      }
      setModal({ open: false, data: null });
      list.refetch();
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally { setSaving(false); }
  };

  const remove = async () => {
    if (!del) return;
    setDeleting(true);
    try {
      await api.delete(`/students/${del.id}`);
      toast.success("Student deleted");
      setDel(null);
      list.refetch();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    } finally { setDeleting(false); }
  };

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage admissions, profiles, and student records."
        actions={
          <Button onClick={() => setModal({ open: true, data: null })}>
            <Plus className="size-4" /> Add Student
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="grid sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <TextInput placeholder="Search by name, admission no…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <option value="">All Classes</option>
            {asList<any>(classes.data).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
            <option value="">All Sections</option>
            {asList<any>(sections.data).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        {list.loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : list.error ? (
          <ErrorState message={list.error} onRetry={list.refetch} />
        ) : students.length === 0 ? (
          <EmptyState icon={Users} title="No students yet" description="Add your first student to get started."
            action={<Button onClick={() => setModal({ open: true, data: null })}><Plus className="size-4" /> Add Student</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Adm No</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Father</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Class</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Phone</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Fee</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-t hover:bg-muted/30 transition">
                    <td className="px-4 py-3 font-mono text-xs">{s.admissionNo}</td>
                    <td className="px-4 py-3 font-medium">{s.fullName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.fatherName}</td>
                    <td className="px-4 py-3">{s.class?.name || "—"} {s.section?.name ? `· ${s.section.name}` : ""}</td>
                    <td className="px-4 py-3">{s.guardianPhone}</td>
                    <td className="px-4 py-3">{s.monthlyFee}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setView(s)} className="size-8 grid place-items-center rounded-lg hover:bg-muted"><Eye className="size-4" /></button>
                        <button onClick={() => setModal({ open: true, data: s })} className="size-8 grid place-items-center rounded-lg hover:bg-muted"><Edit2 className="size-4" /></button>
                        <button onClick={() => setDel(s)} className="size-8 grid place-items-center rounded-lg hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modal.open && (
        <StudentForm
          initial={modal.data || empty}
          classes={asList(classes.data)}
          sections={asList(sections.data)}
          onClose={() => setModal({ open: false, data: null })}
          onSave={save}
          saving={saving}
          isEdit={!!modal.data}
        />
      )}

      <Modal open={!!view} onClose={() => setView(null)} title={view?.fullName || "Student"} size="lg">
        {view && (
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <Info label="Admission No" value={view.admissionNo} />
            <Info label="Admission Date" value={view.admissionDate} />
            <Info label="Father" value={view.fatherName} />
            <Info label="Gender" value={view.gender} />
            <Info label="DOB" value={view.dateOfBirth} />
            <Info label="Phone" value={view.guardianPhone} />
            <Info label="WhatsApp" value={view.whatsappNumber} />
            <Info label="Class / Section" value={`${view.class?.name || "—"} / ${view.section?.name || "—"}`} />
            <Info label="Monthly Fee" value={view.monthlyFee} />
            <Info label="Status" value={view.status} />
            <div className="sm:col-span-2"><Info label="Address" value={view.address} /></div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!del} onClose={() => setDel(null)} onConfirm={remove} loading={deleting}
        title="Delete student?" message={`This will remove ${del?.fullName}. This action cannot be undone.`}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium mt-0.5">{value || "—"}</div>
    </div>
  );
}

function StudentForm({
  initial, classes, sections, onClose, onSave, saving, isEdit,
}: any) {
  const [f, setF] = useState<any>({ ...empty, ...initial });
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.fullName?.trim()) return toast.error("Full name is required");
    if (!f.admissionNo?.trim()) return toast.error("Admission no is required");
    onSave(f);
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? "Edit Student" : "Add Student"} size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={saving}>{isEdit ? "Save changes" : "Add Student"}</Button>
        </>
      }>
      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
        <Field label="Admission No"><TextInput value={f.admissionNo} onChange={(e) => set("admissionNo", e.target.value)} /></Field>
        <Field label="Admission Date"><TextInput type="date" value={f.admissionDate?.slice(0, 10) || ""} onChange={(e) => set("admissionDate", e.target.value)} /></Field>
        <Field label="Full Name"><TextInput value={f.fullName} onChange={(e) => set("fullName", e.target.value)} /></Field>
        <Field label="Father Name"><TextInput value={f.fatherName} onChange={(e) => set("fatherName", e.target.value)} /></Field>
        <Field label="Guardian Phone"><TextInput value={f.guardianPhone} onChange={(e) => set("guardianPhone", e.target.value)} /></Field>
        <Field label="WhatsApp Number"><TextInput value={f.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} /></Field>
        <Field label="Gender">
          <Select value={f.gender} onChange={(e) => set("gender", e.target.value)}>
            <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
          </Select>
        </Field>
        <Field label="Date of Birth"><TextInput type="date" value={f.dateOfBirth?.slice(0, 10) || ""} onChange={(e) => set("dateOfBirth", e.target.value)} /></Field>
        <Field label="Class">
          <Select value={f.classId || ""} onChange={(e) => set("classId", e.target.value)}>
            <option value="">Select class</option>
            {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Section">
          <Select value={f.sectionId || ""} onChange={(e) => set("sectionId", e.target.value)}>
            <option value="">Select section</option>
            {sections.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Monthly Fee"><TextInput type="number" value={f.monthlyFee} onChange={(e) => set("monthlyFee", e.target.value)} /></Field>
        <Field label="Status">
          <Select value={f.status} onChange={(e) => set("status", e.target.value)}>
            <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
          </Select>
        </Field>
        <div className="sm:col-span-2"><Field label="Address"><Textarea value={f.address} onChange={(e) => set("address", e.target.value)} /></Field></div>
      </form>
    </Modal>
  );
}
