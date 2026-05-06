"use client";

import { sendClientFollowUp } from "@/app/actions/admin";
import { useState, useTransition } from "react";

export type ClientRow = { id: string; name: string; email: string; phone: string | null };

export function FollowUpForm({ clients }: { clients: ClientRow[] }) {
  const [target, setTarget] = useState(clients[0]?.id ?? "");
  const [channel, setChannel] = useState<"whatsapp" | "email">("whatsapp");
  const [message, setMessage] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = () => {
    setInfo(null);
    if (!target || !message.trim()) {
      setInfo("Choose a client and write a message.");
      return;
    }
    start(async () => {
      const res = await sendClientFollowUp({
        target_user_id: target,
        channel,
        message: message.trim(),
      });
      if (!res.ok) {
        setInfo(res.error);
        return;
      }
      if (res.whatsappUrl) {
        window.open(res.whatsappUrl, "_blank");
        setInfo("WhatsApp opened in a new tab. The follow-up was logged.");
      } else {
        setInfo("Follow-up logged. Email sends when Resend is configured.");
      }
      setMessage("");
    });
  };

  if (!clients.length) {
    return <p className="text-sm text-[var(--muted)]">No clients yet.</p>;
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-[var(--text)]">Follow-up</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Send a personal check-in. WhatsApp opens with your message prefilled; emails use Resend
          when API keys are present.
        </p>
      </div>
      <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <div>
          <label className="text-xs font-medium text-[var(--text)]">Client</label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.email} ({c.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--text)]">Channel</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as "whatsapp" | "email")}
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--text)]">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            placeholder="Hello! Checking in after your visit..."
          />
        </div>
        {info && <p className="text-sm text-[var(--primary)]">{info}</p>}
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="w-full rounded-full bg-[var(--secondary)] py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send follow-up"}
        </button>
      </div>
    </div>
  );
}
