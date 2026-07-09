"use client";

import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { updateCustomerProfileFromForm } from "@/app/actions/admin";

export type ClientRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  appointmentCount: number;
  lastVisit: string | null;
  createdAt: string;
};

export function ClientsTable({ clients }: { clients: ClientRow[] }) {
  const columns: DataTableColumn<ClientRow>[] = [
    {
      key: "name",
      header: "Client",
      sortable: true,
      sortValue: (r) => r.name.toLowerCase(),
      render: (r) => (
        <div>
          <p className="font-medium text-slate-900">{r.name || "—"}</p>
          <p className="text-xs text-slate-500">{r.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (r) => <span className="text-slate-600">{r.phone || "—"}</span>,
    },
    {
      key: "appointments",
      header: "Appointments",
      sortable: true,
      sortValue: (r) => r.appointmentCount,
      render: (r) => <span className="font-mono text-slate-700">{r.appointmentCount}</span>,
    },
    {
      key: "lastVisit",
      header: "Last visit",
      sortable: true,
      sortValue: (r) => r.lastVisit ?? "",
      render: (r) => (
        <span className="text-slate-600">{r.lastVisit ? r.lastVisit : "—"}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/follow-up?user=${r.id}`}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Message
          </Link>
          <details className="text-xs">
            <summary className="cursor-pointer font-semibold text-emerald-800">Edit</summary>
            <form action={updateCustomerProfileFromForm} className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <input type="hidden" name="user_id" value={r.id} />
              <input
                name="name"
                defaultValue={r.name}
                placeholder="Name"
                className="w-full rounded border px-2 py-1"
              />
              <input
                name="phone"
                defaultValue={r.phone}
                placeholder="Phone"
                className="w-full rounded border px-2 py-1"
              />
              <button type="submit" className="rounded bg-emerald-700 px-2 py-1 text-white">
                Save
              </button>
            </form>
          </details>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={clients}
      columns={columns}
      searchPlaceholder="Search clients…"
      searchFilter={(row, q) =>
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.phone.toLowerCase().includes(q)
      }
      pageSize={12}
      emptyMessage="No clients registered yet."
    />
  );
}
