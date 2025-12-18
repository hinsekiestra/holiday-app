function clean(s) {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

export function parseVacations(apiJson) {
  const vacations = apiJson?.content?.[0]?.vacations ?? [];
  const out = [];

  for (const v of vacations) {
    const name = clean(v.type);
    const compulsory = String(v.compulsorydates).toLowerCase() === "true";

    for (const r of v.regions ?? []) {
      const regionRaw = clean(r.region).toLowerCase();
      const start = new Date(r.startdate);
      const end = new Date(r.enddate);

      if (regionRaw.includes("heel")) {
        ["noord", "midden", "zuid"].forEach((reg) => {
          out.push({ name, region: reg, start, end, compulsory });
        });
      } else {
        if (["noord", "midden", "zuid"].includes(regionRaw)) {
          out.push({ name, region: regionRaw, start, end, compulsory });
        }
      }
    }
  }

  out.sort((a, b) => a.start.getTime() - b.start.getTime());
  return out;
}
