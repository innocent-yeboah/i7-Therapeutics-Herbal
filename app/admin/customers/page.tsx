import { updateCustomerProfileFromForm } from "@/app/actions/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("users")
    .select("id, name, email, phone, is_admin, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">
          Customer database
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Update display name and phone for any profile so bookings, SMS, and email stay accurate. Login
          email is managed in Supabase Auth; contact support to change a customer&apos;s sign-in email.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 lg:px-6">Role</th>
                <th className="px-4 py-3 lg:px-6">Profile &amp; contact</th>
                <th className="min-w-[280px] px-4 py-3 lg:px-6">Edit (admin)</th>
                <th className="hidden px-4 py-3 lg:table-cell lg:px-6">Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(rows ?? []).map((c) => (
                <tr key={c.id} className="align-top hover:bg-slate-50/50">
                  <td className="px-4 py-4 lg:px-6">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        c.is_admin
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {c.is_admin ? "Admin" : "Client"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-800 lg:px-6">
                    <p className="font-medium text-slate-900">{c.name || "—"}</p>
                    <p className="text-xs text-slate-500">{c.email}</p>
                    <p className="text-xs text-slate-500">{c.phone || "—"}</p>
                  </td>
                  <td className="px-4 py-4 lg:px-6">
                    <form action={updateCustomerProfileFromForm} className="flex max-w-md flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
                      <input type="hidden" name="user_id" value={c.id} />
                      <div className="min-w-0 flex-1">
                        <label className="sr-only" htmlFor={`name-${c.id}`}>
                          Name
                        </label>
                        <input
                          id={`name-${c.id}`}
                          name="name"
                          defaultValue={c.name}
                          placeholder="Full name"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
                        />
                      </div>
                      <div className="min-w-0 flex-1 sm:max-w-[11rem]">
                        <label className="sr-only" htmlFor={`phone-${c.id}`}>
                          Phone
                        </label>
                        <input
                          id={`phone-${c.id}`}
                          name="phone"
                          defaultValue={c.phone}
                          placeholder="Phone"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
                        />
                      </div>
                      <button
                        type="submit"
                        className="rounded-lg bg-[#1e3a5f] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#162d49]"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="hidden px-4 py-4 text-xs text-slate-500 lg:table-cell lg:px-6">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
