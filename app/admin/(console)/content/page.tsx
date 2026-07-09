import {
  saveSiteContentFromForm,
  setTestimonialApprovedFromForm,
} from "@/app/actions/admin-crud";
import { AdminHeader } from "@/components/admin/admin-header";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminContentPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", user!.id)
    .single();

  const [{ data: testimonials }, { data: siteContent }] = await Promise.all([
    supabase.from("testimonials").select("*").order("created_at", { ascending: false }),
    supabase.from("site_content").select("*"),
  ]);

  const aboutRow = siteContent?.find((r) => r.key === "about");
  const aboutValue = (aboutRow?.value as { about?: string; tagline?: string }) ?? {};

  return (
    <div>
      <AdminHeader
        title="Content"
        subtitle="Manage about copy, testimonials, and storefront messaging."
        displayName={profile?.name ?? ""}
        userEmail={user?.email ?? ""}
      />

      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">About & tagline</h2>
        <p className="mt-1 text-sm text-slate-500">Updates the about page hero content.</p>
        <form action={saveSiteContentFromForm} className="mt-4 space-y-4">
          <input type="hidden" name="key" value="about" />
          <div>
            <label className="text-xs font-semibold text-slate-600">Tagline</label>
            <input
              name="tagline"
              defaultValue={aboutValue.tagline ?? ""}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">About text</label>
            <textarea
              name="about"
              rows={5}
              defaultValue={aboutValue.about ?? ""}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className="rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white">
            Save content
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">Testimonials</h2>
        <p className="mt-1 text-sm text-slate-500">Approve or hide client reviews on the homepage.</p>
        <div className="mt-6 space-y-4">
          {(testimonials ?? []).length === 0 && (
            <p className="text-sm text-slate-500">No testimonials submitted yet.</p>
          )}
          {(testimonials ?? []).map((t) => (
            <article key={t.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">{t.client_name}</p>
                  <p className="text-xs text-amber-600">{"★".repeat(t.rating)}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    t.approved ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {t.approved ? "Published" : "Pending"}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">&ldquo;{t.content}&rdquo;</p>
              <form action={setTestimonialApprovedFromForm} className="mt-3">
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="approved" value={t.approved ? "false" : "true"} />
                <button
                  type="submit"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold"
                >
                  {t.approved ? "Unpublish" : "Approve & publish"}
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
