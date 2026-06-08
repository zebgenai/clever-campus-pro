import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Printer, Download, BarChart3 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, PageHeader, Skeleton, EmptyState, StatusBadge } from "@/components/ui-kit";
import { Button, Select } from "@/components/form";
import { useApiQuery, asList, asObj } from "@/lib/hooks";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — School ERP" }] }),
  component: () => <AppShell><Reports /></AppShell>,
});

const COLORS = ["oklch(0.55 0.18 258)", "oklch(0.65 0.16 155)", "oklch(0.78 0.15 75)", "oklch(0.65 0.14 230)", "oklch(0.6 0.22 25)"];

function Reports() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const summary = useApiQuery<any>("/reports/dashboard-summary");
  const fee = useApiQuery<any>("/reports/monthly-fee-chart", { month });
  const att = useApiQuery<any>("/reports/attendance-chart", { month });
  const byClass = useApiQuery<any>("/reports/student-count-by-class");
  const exams = useApiQuery<any>("/reports/upcoming-exams");
  const recent = useApiQuery<any>("/reports/recent-admissions");
  const defaulters = useApiQuery<any>("/reports/fee-defaulters");

  const s = asObj<any>(summary.data);

  const feeData = asList<any>(fee.data).map((r) => ({ label: r.month || r.label, value: Number(r.amount ?? r.value ?? 0) }));
  const attData = asList<any>(att.data).map((r) => ({ label: r.date || r.label, value: Number(r.present ?? r.value ?? 0) }));
  const classData = asList<any>(byClass.data).map((r) => ({ name: r.class?.name || r.name || r.className || "?", value: Number(r.count ?? r.total ?? 0) }));

  return (
    <div>
      <PageHeader title="Reports" description="Analytics and insights for your school."
        actions={
          <>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
              className="h-10 px-3 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40" />
            <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" /> Print</Button>
            <Button variant="outline"><Download className="size-4" /> Export</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Students", v: s.totalStudents ?? "—" },
          { label: "Collected", v: s.feesCollected ?? "—" },
          { label: "Pending", v: s.pendingFees ?? "—" },
          { label: "Attendance Rate", v: s.attendanceRate ? `${s.attendanceRate}%` : "—" },
        ].map((c) => (
          <Card key={c.label} hover>
            <div className="text-xs text-muted-foreground">{c.label}</div>
            <div className="text-2xl font-bold mt-1">{summary.loading ? <Skeleton className="h-7 w-16" /> : c.v}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="font-semibold mb-3">Fee Collection Trend</h3>
          <div className="h-64">
            {fee.loading ? <Skeleton className="h-full" /> : feeData.length === 0 ? <EmptyState icon={BarChart3} title="No data" /> : (
              <ResponsiveContainer>
                <AreaChart data={feeData}>
                  <defs><linearGradient id="r1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS[0]} stopOpacity={0.4}/><stop offset="100%" stopColor={COLORS[0]} stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                  <Area type="monotone" dataKey="value" stroke={COLORS[0]} strokeWidth={2} fill="url(#r1)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-3">Attendance</h3>
          <div className="h-64">
            {att.loading ? <Skeleton className="h-full" /> : attData.length === 0 ? <EmptyState icon={BarChart3} title="No data" /> : (
              <ResponsiveContainer>
                <BarChart data={attData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                  <Bar dataKey="value" fill={COLORS[1]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-3">Students by Class</h3>
          <div className="h-64">
            {byClass.loading ? <Skeleton className="h-full" /> : classData.length === 0 ? <EmptyState icon={BarChart3} title="No data" /> : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={classData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50}>
                    {classData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend /><Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-3">Upcoming Exams</h3>
          {exams.loading ? <Skeleton className="h-32" /> :
            asList(exams.data).length === 0 ? <EmptyState icon={BarChart3} title="None scheduled" /> :
            <ul className="divide-y text-sm">
              {asList<any>(exams.data).slice(0, 6).map((e, i) => (
                <li key={e.id || i} className="py-2.5 flex justify-between">
                  <span className="font-medium">{e.name}</span>
                  <span className="text-muted-foreground">{e.startDate?.slice(0, 10) || "—"}</span>
                </li>
              ))}
            </ul>
          }
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-3">Recent Admissions</h3>
          {recent.loading ? <Skeleton className="h-32" /> :
            asList(recent.data).length === 0 ? <EmptyState icon={BarChart3} title="None" /> :
            <ul className="divide-y text-sm">
              {asList<any>(recent.data).slice(0, 8).map((r, i) => (
                <li key={r.id || i} className="py-2.5 flex justify-between">
                  <span className="font-medium">{r.fullName || r.name}</span>
                  <StatusBadge status={r.status || "ACTIVE"} />
                </li>
              ))}
            </ul>
          }
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Fee Defaulters</h3>
          {defaulters.loading ? <Skeleton className="h-32" /> :
            asList(defaulters.data).length === 0 ? <EmptyState icon={BarChart3} title="None" /> :
            <ul className="divide-y text-sm">
              {asList<any>(defaulters.data).slice(0, 8).map((r, i) => (
                <li key={r.id || i} className="py-2.5 flex justify-between">
                  <span className="font-medium">{r.fullName || r.studentName}</span>
                  <span className="text-destructive font-semibold">{r.pending || r.amount}</span>
                </li>
              ))}
            </ul>
          }
        </Card>
      </div>
    </div>
  );
}
