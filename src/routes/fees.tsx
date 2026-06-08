import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Receipt, Wallet, TrendingUp, AlertCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Card, PageHeader, Skeleton, EmptyState, StatusBadge } from "@/components/ui-kit";
import { Button, Field, Select, TextInput } from "@/components/form";
import { Modal, ConfirmDialog } from "@/components/Modal";
import { useApiQuery, asList, asObj } from "@/lib/hooks";
import { api } from "@/lib/api";

export const Route = createFileRoute("/fees")({
  head: () => ({ meta: [{ title: "Fees — School ERP" }] }),
  component: () => <AppShell><FeesPage /></AppShell>,
});

function FeesPage() {
  const [tab, setTab] = useState<"invoices" | "structures" | "defaulters">("invoices");
  const summary = useApiQuery<any>("/fees/reports/summary");
  const s = asObj<any>(summary.data);

  return (
    <div>
      <PageHeader title="Fees" description="Track invoices, payments, and fee structures." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Collected", v: s.collected, icon: TrendingUp, color: "text-emerald-600 bg-emerald-500/10" },
          { label: "Pending", v: s.pending, icon: Wallet, color: "text-amber-600 bg-amber-500/10" },
          { label: "Invoices", v: s.totalInvoices, icon: FileText, color: "text-blue-600 bg-blue-500/10" },
          { label: "Defaulters", v: s.defaulters, icon: AlertCircle, color: "text-rose-600 bg-rose-500/10" },
        ].map((c) => (
          <Card key={c.label} hover>
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-xl grid place-items-center ${c.color}`}><c.icon className="size-5" /></div>
              <div>
                <div className="text-xs text-muted-foreground">{c.label}</div>
                <div className="text-xl font-bold">{summary.loading ? "…" : (c.v ?? "—")}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="inline-flex gap-1 p-1 bg-muted rounded-xl mb-4">
        {(["invoices", "structures", "defaulters"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${tab === t ? "bg-card shadow-soft" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>

      {tab === "invoices" && <InvoicesTab />}
      {tab === "structures" && <StructuresTab />}
      {tab === "defaulters" && <DefaultersTab />}
    </div>
  );
}

function InvoicesTab() {
  const list = useApiQuery<any>("/fees/invoices");
  const [status, setStatus] = useState("");
  const [genOpen, setGenOpen] = useState(false);
  const [pay, setPay] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  const rows = asList<any>(list.data).filter((i) => !status || i.status === status);

  const generate = async (month: string) => {
    setBusy(true);
    try {
      await api.post("/fees/invoices/bulk", { month });
      toast.success("Monthly invoices generated");
      setGenOpen(false); list.refetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const recordPay = async (form: any) => {
    setBusy(true);
    try {
      await api.post("/fees/payments", { invoiceId: pay.id, amount: Number(form.amount), method: form.method, note: form.note });
      toast.success("Payment recorded");
      setPay(null); list.refetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 justify-between p-4 border-b">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-xs">
          <option value="">All statuses</option>
          <option value="PAID">Paid</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PARTIAL">Partial</option>
        </Select>
        <Button onClick={() => setGenOpen(true)}><Plus className="size-4" /> Generate Monthly Invoices</Button>
      </div>

      {list.loading ? <div className="p-6 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div> :
        rows.length === 0 ? <EmptyState icon={Receipt} title="No invoices" /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left"><tr>
              <th className="px-4 py-3 font-medium text-muted-foreground">Invoice</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Student</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Month</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Amount</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Paid</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3"></th>
            </tr></thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{i.invoiceNo || i.id?.slice(0, 8)}</td>
                  <td className="px-4 py-3 font-medium">{i.student?.fullName || i.studentName}</td>
                  <td className="px-4 py-3">{i.month}</td>
                  <td className="px-4 py-3">{i.amount}</td>
                  <td className="px-4 py-3">{i.paid ?? 0}</td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {i.status !== "PAID" && <Button size="sm" variant="outline" onClick={() => setPay(i)}>Record Payment</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <GenerateModal open={genOpen} onClose={() => setGenOpen(false)} onGenerate={generate} loading={busy} />
      {pay && <PaymentModal invoice={pay} onClose={() => setPay(null)} onSave={recordPay} loading={busy} />}
    </Card>
  );
}

function GenerateModal({ open, onClose, onGenerate, loading }: any) {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  return (
    <Modal open={open} onClose={onClose} title="Generate Monthly Invoices"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={loading} onClick={() => onGenerate(month)}>Generate</Button></>}>
      <Field label="Month"><TextInput type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></Field>
      <p className="text-xs text-muted-foreground mt-3">This will generate fee invoices for all active students for the selected month.</p>
    </Modal>
  );
}

function PaymentModal({ invoice, onClose, onSave, loading }: any) {
  const [form, setForm] = useState({ amount: invoice.amount - (invoice.paid || 0), method: "CASH", note: "" });
  return (
    <Modal open onClose={onClose} title={`Record Payment · ${invoice.student?.fullName || ""}`}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={loading} onClick={() => onSave(form)}>Save Payment</Button></>}>
      <div className="rounded-xl border bg-muted/30 p-4 mb-4">
        <div className="text-xs text-muted-foreground">Receipt preview</div>
        <div className="font-semibold mt-1">{invoice.student?.fullName}</div>
        <div className="text-sm text-muted-foreground">Invoice {invoice.invoiceNo || invoice.id} · {invoice.month}</div>
        <div className="mt-2 flex justify-between text-sm"><span>Total</span><span>{invoice.amount}</span></div>
        <div className="flex justify-between text-sm"><span>Paid</span><span>{invoice.paid ?? 0}</span></div>
        <div className="flex justify-between font-semibold mt-1"><span>Due</span><span>{invoice.amount - (invoice.paid || 0)}</span></div>
      </div>
      <div className="space-y-3">
        <Field label="Amount"><TextInput type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></Field>
        <Field label="Method">
          <Select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
            <option value="CASH">Cash</option><option value="BANK">Bank</option><option value="CARD">Card</option><option value="ONLINE">Online</option>
          </Select>
        </Field>
        <Field label="Note"><TextInput value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

function StructuresTab() {
  const list = useApiQuery<any>("/fees/structures");
  const classes = useApiQuery<any>("/classes");
  const [modal, setModal] = useState<{ open: boolean; data: any | null }>({ open: false, data: null });
  const [del, setDel] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<any>({ name: "", classId: "", amount: 0 });

  const open = (r: any | null) => { setForm(r || { name: "", classId: "", amount: 0 }); setModal({ open: true, data: r }); };

  const save = async () => {
    setBusy(true);
    try {
      if (modal.data?.id) await api.patch(`/fees/structures/${modal.data.id}`, form);
      else await api.post("/fees/structures", form);
      toast.success("Saved"); setModal({ open: false, data: null }); list.refetch();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await api.delete(`/fees/structures/${del.id}`); toast.success("Deleted"); setDel(null); list.refetch(); }
    catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const rows = asList<any>(list.data);
  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="font-semibold">Fee Structures</div>
        <Button size="sm" onClick={() => open(null)}><Plus className="size-4" /> Add Structure</Button>
      </div>
      {list.loading ? <div className="p-6 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div> :
        rows.length === 0 ? <EmptyState icon={Receipt} title="No fee structures" /> : (
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left"><tr>
            <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Class</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Amount</th>
            <th></th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3">{r.class?.name || asList<any>(classes.data).find((c) => c.id === r.classId)?.name || "—"}</td>
                <td className="px-4 py-3">{r.amount}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => open(r)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => setDel(r)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={modal.open} onClose={() => setModal({ open: false, data: null })} title={`${modal.data ? "Edit" : "Add"} Fee Structure`}
        footer={<><Button variant="outline" onClick={() => setModal({ open: false, data: null })}>Cancel</Button><Button onClick={save} loading={busy}>Save</Button></>}>
        <div className="space-y-3">
          <Field label="Name"><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Class">
            <Select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}>
              <option value="">Select class</option>
              {asList<any>(classes.data).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Amount"><TextInput type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></Field>
        </div>
      </Modal>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={remove} loading={busy} title="Delete structure?" message="This cannot be undone." />
    </Card>
  );
}

function DefaultersTab() {
  const list = useApiQuery<any>("/fees/reports/defaulters");
  const rows = asList<any>(list.data);
  return (
    <Card className="p-0 overflow-hidden">
      {list.loading ? <div className="p-6 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div> :
        rows.length === 0 ? <EmptyState icon={Wallet} title="No defaulters" description="All fees are up to date." /> : (
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left"><tr>
            <th className="px-4 py-3 font-medium text-muted-foreground">Student</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Class</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Pending</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Phone</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id || i} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{r.fullName || r.studentName}</td>
                <td className="px-4 py-3">{r.class?.name || r.className || "—"}</td>
                <td className="px-4 py-3 text-destructive font-semibold">{r.pending || r.amount}</td>
                <td className="px-4 py-3">{r.guardianPhone || "—"}</td>
                <td className="px-4 py-3 text-right"><StatusBadge status="UNPAID" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
