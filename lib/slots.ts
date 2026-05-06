import { BOOKING } from "@/lib/constants";
import { format, parse } from "date-fns";

export function generateDaySlots(): string[] {
  const slots: string[] = [];
  const end = BOOKING.dayEndHour * 60;
  let cur = BOOKING.dayStartHour * 60;
  while (cur + BOOKING.slotMinutes <= end) {
    const hour = Math.floor(cur / 60);
    const minute = cur % 60;
    slots.push(
      `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
    );
    cur += BOOKING.slotMinutes;
  }
  return slots;
}

export function formatSlotLabel(time: string): string {
  const d = parse(time, "HH:mm", new Date());
  return format(d, "h:mm a");
}
