"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Therapy = { id: string; name: string; slug: string };

export function RecommendationForm({
  consultationId,
  therapies,
  initial,
}: {
  consultationId: string;
  therapies: Therapy[];
  initial?: {
    recommended_therapies?: string[] | null;
    recommended_duration?: string | null;
    recommended_price?: number | null;
    recommendation_notes?: string | null;
  };
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(initial?.recommended_therapies ?? []);
  const [duration, setDuration] = useState(initial?.recommended_duration ?? "60 minutes");
  const [price, setPrice] = useState(
    initial?.recommended_price != null ? String(initial.recommended_price) : ""
  );
  const [notes, setNotes] = useState(initial?.recommendation_notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const therapyNames = useMemo(() => new Set(therapies.map((t) => t.name)), [therapies]);

  const toggle = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const markReviewed = async () => {
    setError(null);
    const res = await fetch(`/api/admin/consultations/${consultationId}/review`, {
      method: "PUT",
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok) {
      setError(json.error || "Could not mark as reviewed");
      return;
    }
    router.refresh();
  };

  const sendRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setWhatsappLink(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/consultations/${consultationId}/recommendation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommended_therapies: selected,
          recommended_duration: duration,
          recommended_price: Number(price),
          recommendation_notes: notes || null,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        whatsappLink?: string | null;
      };
      if (!res.ok || !json.ok) {
        setError(json.error || "Could not send recommendation");
        return;
      }
      if (json.whatsappLink) setWhatsappLink(json.whatsappLink);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={sendRecommendation} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Recommendation</h2>
        <p className="mt-1 text-sm text-slate-600">
          Select therapies and send a personalized plan to the client.
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Recommended therapies
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {therapies.map((t) => {
            const checked = selected.includes(t.name);
            return (
              <label
                key={t.id}
                className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-sm ${
                  checked ? "border-emerald-500 bg-emerald-50" : "border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={checked}
                  onChange={() => toggle(t.name)}
                />
                <span>
                  <span className="font-medium text-slate-900">{t.name}</span>
                </span>
              </label>
            );
          })}
        </div>
        {selected.some((s) => !therapyNames.has(s)) && (
          <p className="mt-2 text-xs text-amber-700">
            Some previously recommended therapies are no longer in the active list and were kept.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-slate-700" htmlFor="duration">
            Recommended duration
          </label>
          <input
            id="duration"
            required
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            placeholder="e.g. 60–75 minutes"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-700" htmlFor="price">
            Recommended price (GHS)
          </label>
          <input
            id="price"
            type="number"
            min={1}
            step="1"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-700" htmlFor="notes">
          Recommendation notes
        </label>
        <textarea
          id="notes"
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          placeholder="What to expect, preparation tips, why these therapies fit…"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {whatsappLink && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-sm font-semibold text-emerald-700 hover:underline"
        >
          Open WhatsApp follow-up message →
        </a>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={markReviewed}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Mark as reviewed
        </button>
        <button
          type="submit"
          disabled={loading || selected.length === 0}
          className="rounded-xl bg-[#1e3a5f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#162d49] disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send recommendation to client"}
        </button>
        <button
          type="button"
          onClick={async () => {
            setError(null);
            const res = await fetch(`/api/admin/consultations/${consultationId}/complete`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({}),
            });
            const json = (await res.json()) as { ok?: boolean; error?: string };
            if (!res.ok || !json.ok) {
              setError(json.error || "Could not mark complete");
              return;
            }
            router.refresh();
          }}
          className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
        >
          Mark session completed
        </button>
      </div>
    </form>
  );
}
