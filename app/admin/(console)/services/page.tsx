import Link from "next/link";
import {
  deleteServiceFromForm,
  toggleServiceActiveFromForm,
  upsertServiceFromForm,
} from "@/app/actions/admin-crud";
import { AdminHeader } from "@/components/admin/admin-header";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", user!.id)
    .single();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div>
      <AdminHeader
        title="Services"
        subtitle="Manage therapy offerings, pricing, duration, and visibility on the storefront."
        displayName={profile?.name ?? ""}
        userEmail={user?.email ?? ""}
      />

      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">Add new service</h2>
        <form action={upsertServiceFromForm} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input
            name="name"
            required
            placeholder="Service name"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            name="slug"
            placeholder="URL slug (optional)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            name="price"
            type="number"
            min={0}
            step="0.01"
            required
            placeholder="Price (GHS)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            name="duration_minutes"
            type="number"
            min={15}
            required
            placeholder="Duration (minutes)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            name="image"
            placeholder="Image URL"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
          />
          <textarea
            name="description"
            required
            rows={3}
            placeholder="Description"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="is_active" defaultChecked className="rounded" />
            Active on storefront
          </label>
          <button
            type="submit"
            className="rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#162d49] sm:col-span-2 sm:w-fit"
          >
            Create service
          </button>
        </form>
      </section>

      <div className="space-y-4">
        {(services ?? []).map((s) => (
          <article
            key={s.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900">{s.name}</h3>
                <p className="text-xs text-slate-500">
                  GHS {Number(s.price).toFixed(0)} · {s.duration_minutes} min
                  {s.slug ? ` · /services/${s.slug}` : ""}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  s.is_active !== false
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {s.is_active !== false ? "Active" : "Hidden"}
              </span>
            </div>

            <form action={upsertServiceFromForm} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="id" value={s.id} />
              <input name="name" defaultValue={s.name} className="rounded-lg border px-3 py-2 text-sm" />
              <input name="slug" defaultValue={s.slug ?? ""} className="rounded-lg border px-3 py-2 text-sm" />
              <input
                name="price"
                type="number"
                defaultValue={s.price}
                className="rounded-lg border px-3 py-2 text-sm"
              />
              <input
                name="duration_minutes"
                type="number"
                defaultValue={s.duration_minutes}
                className="rounded-lg border px-3 py-2 text-sm"
              />
              <input
                name="image"
                defaultValue={s.image ?? ""}
                className="rounded-lg border px-3 py-2 text-sm sm:col-span-2"
              />
              <textarea
                name="description"
                defaultValue={s.description}
                rows={2}
                className="rounded-lg border px-3 py-2 text-sm sm:col-span-2"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={s.is_active !== false}
                />
                Active
              </label>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white"
                >
                  Save changes
                </button>
              </div>
            </form>

            <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
              <form action={toggleServiceActiveFromForm}>
                <input type="hidden" name="id" value={s.id} />
                <input
                  type="hidden"
                  name="is_active"
                  value={s.is_active !== false ? "false" : "true"}
                />
                <button
                  type="submit"
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                >
                  {s.is_active !== false ? "Hide" : "Show"} on storefront
                </button>
              </form>
              {s.slug ? (
                <Link
                  href={`/services/${s.slug}`}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                >
                  View public page
                </Link>
              ) : null}
              <form action={deleteServiceFromForm}>
                <input type="hidden" name="id" value={s.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600"
                >
                  Delete
                </button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
