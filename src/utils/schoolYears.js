import { schoolYearExists } from "../api/holidays";

export async function getValidSchoolYears() {
  const now = new Date();
  const y = now.getFullYear();

  const start = y - 2;
  const end = y + 8;

  const candidates = [];
  for (let yr = start; yr <= end; yr++) {
    candidates.push(`${yr}-${yr + 1}`);
  }

  const valid = [];
  for (const sy of candidates) {
    const ok = await schoolYearExists(sy);
    if (ok) valid.push(sy);
  }

  return valid.length ? valid : [`${y}-${y + 1}`];
}
