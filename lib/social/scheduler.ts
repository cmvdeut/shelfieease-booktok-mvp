/**
 * Schedule slot logic (Blotato-style useNextFreeSlot).
 * dayOfWeek: 0 = Sunday … 6 = Saturday (JS Date.getDay()).
 */

export type ScheduleSlotLike = {
  id: string;
  dayOfWeek: number;
  hour: number;
  minute: number;
  timezone: string;
  platforms: string[];
  enabled: boolean;
};

export type OccupiedSlot = {
  scheduledAt: Date;
  platform: string;
};

function parsePlatforms(platformsJson: string | string[]): string[] {
  if (Array.isArray(platformsJson)) return platformsJson;
  try {
    const p = JSON.parse(platformsJson) as string[];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

/** Next UTC Date for slot in Europe/Amsterdam (simplified: treat wall clock as local offset via formatter) */
export function slotToDate(
  dayOfWeek: number,
  hour: number,
  minute: number,
  after: Date = new Date()
): Date {
  const result = new Date(after);
  result.setSeconds(0, 0);
  const currentDow = result.getDay();
  let daysAhead = (dayOfWeek - currentDow + 7) % 7;
  const candidate = new Date(result);
  candidate.setDate(candidate.getDate() + daysAhead);
  candidate.setHours(hour, minute, 0, 0);
  if (candidate <= after) {
    candidate.setDate(candidate.getDate() + 7);
  }
  return candidate;
}

export function findNextFreeSlot(
  slots: ScheduleSlotLike[],
  platform: string,
  occupied: OccupiedSlot[],
  after: Date = new Date()
): Date | null {
  const enabled = slots.filter((s) => s.enabled);
  const matching = enabled.filter((s) => {
    const plats = parsePlatforms(s.platforms as unknown as string);
    return plats.includes(platform);
  });
  if (matching.length === 0) return null;

  const candidates: Date[] = [];
  for (const slot of matching) {
    for (let week = 0; week < 8; week++) {
      const base = new Date(after);
      base.setDate(base.getDate() + week * 7);
      const d = slotToDate(slot.dayOfWeek, slot.hour, slot.minute, base);
      if (d > after) candidates.push(d);
    }
  }

  candidates.sort((a, b) => a.getTime() - b.getTime());

  for (const candidate of candidates) {
    const clash = occupied.some(
      (o) =>
        o.platform === platform &&
        Math.abs(o.scheduledAt.getTime() - candidate.getTime()) < 60 * 60 * 1000
    );
    if (!clash) return candidate;
  }
  return null;
}

export function defaultSlots(): Omit<ScheduleSlotLike, "id">[] {
  return [
    {
      dayOfWeek: 0,
      hour: 19,
      minute: 30,
      timezone: "Europe/Amsterdam",
      platforms: ["instagram", "tiktok"],
      enabled: true,
    },
    {
      dayOfWeek: 2,
      hour: 11,
      minute: 30,
      timezone: "Europe/Amsterdam",
      platforms: ["instagram"],
      enabled: true,
    },
    {
      dayOfWeek: 4,
      hour: 19,
      minute: 30,
      timezone: "Europe/Amsterdam",
      platforms: ["instagram", "tiktok"],
      enabled: true,
    },
  ];
}
