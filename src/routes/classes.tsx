import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Edit2, Trash2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Card, PageHeader, Skeleton, EmptyState } from "@/components/ui-kit";
import { Button, Field, Select, TextInput } from "@/components/form";
import { Modal, ConfirmDialog } from "@/components/Modal";
import { useApiQuery, asList } from "@/lib/hooks";
import { api } from "@/lib/api";

export const Route = createFileRoute("/classes")({
  head: () => ({ meta: [{ title: "Classes — School ERP" }] }),
  component: () => <AppShell><ClassesPage /></AppShell>,
});

type TabKey = "classes" | "sections" | "subjects";

function ClassesPage() {
  const [tab, setTab] = useState<TabKey>("classes");
  return (
    <div>
      <PageHeader title="Classes & Curriculum" description="Manage classes, sections and subjects offered by your school." />

      <div className="inline-flex gap-1 p-1 bg-muted rounded-xl mb-4">
        {(["classes", "sections", "subjects"] as TabKey[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${tab === t ? "bg-card shadow-soft" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "classes" && <CrudTable endpoint="/classes" title="Class" fields={[{ name: "name", label: "Class Name" }, { name: "description", label: "Description" }]} />}
      {tab === "sections" && (
        <CrudTable endpoint="/sections" title="Section"
          fields={[{ name: "name", label: "Section Name" }, { name: "classId", label: "Class", type: "class" }]} />
      )}
      {tab === "subjects" && (
        <CrudTable endpoint="/subjects" title="Subject"
          fields={[{ name: "name", label: "Subject Name" }, { name: "code", label: "Code" }, { name: "classId", label: "Class", type: "class" }]} />
      )}
    </div>
  );
}

function CrudTable({ endpoint, title, fields }: { endpoint: string; title: string; fields: { name: string; label: string; type?: "class" }[] }) {
  const list = useApiQuery<any>(endpoint);
  const classes = useApiQuery<any>("/classes");
  const [modal, setModal] = useState<{ open: boolean; data: any | null }>({ open: false, data: null });
  const [del, setDel] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const empty = Object.fromEntries(fields.map((f) => [f.name, ""]));
  const [form, setForm] = useState<any>(empty);

  const open = (row: any | null) => {
    setForm(row ? { ...empty, ...row } : empty);
    setModal({ open: true, data: row });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      if (modal.data?.id) {
        await api.patch(`${endpoint}/${modal.data.id}`, form);
        toast.success(`${title} updated`);
      } else {
        await api.post(endpoint, form);
        toast.success(`${title} added`);
      }
      setModal({ open: false, data: null });
      list.refetch();
    } catch (e: any) { toast.error(e.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!del) return;
    setDeleting(true);
    try {
      await api.delete(`${endpoint}/${del.id}`);
      toast.success(`${title} deleted`);
      setDel(null); list.refetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setDeleting(false); }
  };

  const rows = asList<any>(list.data);

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="font-semibold">{title}s</div>
        <Button size="sm" onClick={() => open(null)}><Plus className="size-4" /> Add {title}</Button>
      </div>
      {list.loading ? <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div> :
        rows.length === 0 ? <EmptyState icon={GraduationCap} title={`No ${title.toLowerCase()}s yet`} /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left"><tr>
              {fields.map((f) => <th key={f.name} className="px-4 py-3 font-medium text-muted-foreground">{f.label}</th>)}
              <th></th>
            </tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t hover:bg-muted/30">
                  {fields.map((f) => (
                    <td key={f.name} className="px-4 py-3">
                      {f.type === "class" ? (asList<any>(classes.data).find((c) => c.id === r[f.name])?.name || r.class?.name || "—") : (r[f.name] || "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => open(r)} className="size-8 grid place-items-center rounded-lg hover:bg-muted"><Edit2 className="size-4" /></button>
                      <button onClick={() => setDel(r)} className="size-8 grid place-items-center rounded-lg hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal.open} onClose={() => setModal({ open: false, data: null })}
        title={`${modal.data ? "Edit" : "Add"} ${title}`}
        footer={<>
          <Button variant="outline" onClick={() => setModal({ open: false, data: null })}>Cancel</Button>
          <Button onClick={save as any} loading={saving}>{modal.data ? "Save" : "Add"}</Button>
        </>}>
        <form onSubmit={save} className="space-y-4">
          {fields.map((f) => (
            <Field key={f.name} label={f.label}>
              {f.type === "class" ? (
                <Select value={form[f.name] || ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}>
                  <option value="">Select class</option>
                  {asList<any>(classes.data).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              ) : (
                <TextInput value={form[f.name] || ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
              )}
            </Field>
          ))}
        </form>
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={remove} loading={deleting}
        title={`Delete ${title.toLowerCase()}?`} message="This action cannot be undone." />
    </Card>
  );
}
