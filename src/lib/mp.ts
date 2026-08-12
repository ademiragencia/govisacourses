import { COURSE_LIVE, COURSE_SELF, type CourseId } from "./config";
import type { StrictAnswers, StrictMeta } from "./strict-qualify";

export const LEAD_STORAGE_KEY = "gv_matricula_lead";

export type StoredLead = StrictAnswers & {
  id: string;
  meta: StrictMeta;
  amount: number;
  courseTitle: string;
};

export function offerFor(modality: CourseId | "") {
  const course = modality === "live" ? COURSE_LIVE : COURSE_SELF;
  return {
    modality: (modality === "live" ? "live" : "self") as CourseId,
    title: `${course.name} — ${course.shortName}`,
    shortName: course.shortName,
    amount: course.price,
    priceLabel: course.priceLabel,
    planLabel: course.planLabel,
  };
}

export function saveLead(lead: StoredLead) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(lead);
  try {
    sessionStorage.setItem(LEAD_STORAGE_KEY, raw);
    localStorage.setItem(LEAD_STORAGE_KEY, raw);
  } catch {
    /* ignore */
  }
}

export function loadLead(): StoredLead | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem(LEAD_STORAGE_KEY) ||
      localStorage.getItem(LEAD_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredLead;
  } catch {
    return null;
  }
}

export function newLeadId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `gv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
