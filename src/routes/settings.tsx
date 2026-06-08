import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save, School } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Card, PageHeader } from "@/components/ui-kit";
import { Button, Field, TextInput, Textarea } from "@/components/form";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — School ERP" }] }),
  component: () => <AppShell><Settings /></AppShell>,
});

function Settings() {
  const { user } = useAuth();
  const [f, setF] = useState({
    schoolName: user?.school?.name || user?.schoolName || "",
    address: "", phone: "", email: "", themeColor: "#6366f1", academicSession: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
  });
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success("Settings saved"); }, 600);
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your school profile and preferences." />

      <form onSubmit={save} className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">School Profile</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><Field label="School Name"><TextInput value={f.schoolName} onChange={(e) => setF({ ...f, schoolName: e.target.value })} /></Field></div>
            <Field label="Email"><TextInput type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
            <Field label="Phone"><TextInput value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Address"><Textarea value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></Field></div>
            <Field label="Academic Session"><TextInput value={f.academicSession} onChange={(e) => setF({ ...f, academicSession: e.target.value })} /></Field>
            <Field label="Theme Color">
              <div className="flex items-center gap-3">
                <input type="color" value={f.themeColor} onChange={(e) => setF({ ...f, themeColor: e.target.value })}
                  className="size-10 rounded-lg border cursor-pointer bg-card" />
                <TextInput value={f.themeColor} onChange={(e) => setF({ ...f, themeColor: e.target.value })} />
              </div>
            </Field>
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="submit" loading={saving}><Save className="size-4" /> Save Changes</Button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Logo</h3>
          <div className="aspect-square rounded-2xl border-2 border-dashed grid place-items-center bg-muted/30">
            <div className="text-center">
              <div className="size-16 mx-auto rounded-2xl bg-gradient-primary grid place-items-center mb-2">
                <School className="size-8 text-primary-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Upload logo (coming soon)</p>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
