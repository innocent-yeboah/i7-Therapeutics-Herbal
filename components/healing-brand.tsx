import Image from "next/image";
import { BRAND } from "@/lib/constants";

type HealingBrandProps = {
  compact?: boolean;
  inverse?: boolean;
};

/**
 * Presents the i7 identity consistently so every visit feels trusted,
 * welcoming, and connected to the care clients receive in person.
 */
export function HealingBrand({
  compact = false,
  inverse = false,
}: HealingBrandProps) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span
        className={`flex shrink-0 items-center justify-center rounded-xl ${
          inverse ? "bg-white" : "bg-[#eef7ef]"
        } ${compact ? "h-10 w-10" : "h-11 w-11"}`}
      >
        <Image
          src="/brand/i7-therapeutics-mark.png"
          alt=""
          width={32}
          height={48}
          priority
          className={compact ? "h-8 w-auto" : "h-9 w-auto"}
        />
      </span>
      <span className="min-w-0">
        <span
          className={`block truncate font-serif font-semibold leading-tight ${
            inverse ? "text-white" : "text-[var(--primary)]"
          } ${compact ? "text-base sm:text-lg" : "text-lg sm:text-xl"}`}
        >
          {BRAND.name}
        </span>
        {!compact && (
          <span
            className={`hidden text-xs sm:block ${
              inverse ? "text-white/75" : "text-[var(--muted)]"
            }`}
          >
            {BRAND.tagline}
          </span>
        )}
      </span>
    </span>
  );
}
