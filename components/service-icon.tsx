import type { ComingSoonOffering, ServiceIconType } from "@/lib/services";

type IconProps = { className?: string };

function MassageIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12c0-2 1.5-4 4-4s4 2 4 4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 16c2-3 4-4 6-4s4 1 6 4" />
      <circle cx="9" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <path strokeLinecap="round" d="M4 20h16" />
    </svg>
  );
}

function CuppingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 14a4 4 0 0 1 8 0v2a4 4 0 0 1-8 0v-2z" />
      <path strokeLinecap="round" d="M12 6v4" />
      <ellipse cx="12" cy="5" rx="3" ry="1.5" />
    </svg>
  );
}

function SportsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <circle cx="12" cy="5" r="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v4M8 14l-2 5M16 14l2 5M10 11h4" />
      <path strokeLinecap="round" d="M7 18h10" />
    </svg>
  );
}

function RecoveryIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-6-4.5-6-9a6 6 0 1 1 12 0c0 4.5-6 9-6 9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2 2" />
    </svg>
  );
}

function LymphaticIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-2 4-6 5-6 9a6 6 0 0 0 12 0c0-4-4-5-6-9z" />
      <path strokeLinecap="round" d="M12 14v4" />
    </svg>
  );
}

function MeridianIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path strokeLinecap="round" d="M4 12c2-4 4-4 6 0s4 4 6 0 4-4 4 0" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function NmtIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 8c2 2 4 2 6 0s4-2 6 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 14c2-2 4-2 6 0s4 2 6 0" />
      <path strokeLinecap="round" d="M4 20h16" />
    </svg>
  );
}

function HerbalOilIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-3 4-6 6-6 10a6 6 0 0 0 12 0c0-4-3-6-6-10z" />
      <path strokeLinecap="round" d="M9 18h6" />
    </svg>
  );
}

function TeaIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 8h10v6a4 4 0 0 1-4 4H8a2 2 0 0 1-2-2V8z" />
      <path strokeLinecap="round" d="M16 10h2a2 2 0 0 1 0 4h-2M6 4c0 2 2 2 2 2" />
    </svg>
  );
}

function OilBottleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <rect x="8" y="10" width="8" height="10" rx="2" />
      <path strokeLinecap="round" d="M10 10V7a2 2 0 0 1 4 0v3" />
      <path strokeLinecap="round" d="M10 14h4" />
    </svg>
  );
}

function MeditationIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <circle cx="12" cy="6" r="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 20c2-4 4-6 6-6s4 2 6 6" />
      <path strokeLinecap="round" d="M8 12h8" />
    </svg>
  );
}

function SelfHealingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <path strokeLinecap="round" d="M12 8v8M8 12h8" />
    </svg>
  );
}

import type { ComponentType } from "react";

const SERVICE_ICONS: Record<ServiceIconType, ComponentType<IconProps>> = {
  massage: MassageIcon,
  cupping: CuppingIcon,
  "sports-injury": SportsIcon,
  "stroke-recovery": RecoveryIcon,
  lymphatic: LymphaticIcon,
  meridian: MeridianIcon,
  nmt: NmtIcon,
  "herbal-oil": HerbalOilIcon,
};

const COMING_SOON_ICONS: Record<ComingSoonOffering["icon"], ComponentType<IconProps>> = {
  tea: TeaIcon,
  oil: OilBottleIcon,
  meditation: MeditationIcon,
  "self-healing": SelfHealingIcon,
};

export function ServiceIcon({ type, className = "h-6 w-6" }: { type: ServiceIconType; className?: string }) {
  const Icon = SERVICE_ICONS[type];
  return <Icon className={className} />;
}

export function ComingSoonIcon({
  type,
  className = "h-6 w-6",
}: {
  type: ComingSoonOffering["icon"];
  className?: string;
}) {
  const Icon = COMING_SOON_ICONS[type];
  return <Icon className={className} />;
}
