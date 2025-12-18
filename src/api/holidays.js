const BASE =
  "https://opendata.rijksoverheid.nl/v1/sources/rijksoverheid/infotypes/schoolholidays/schoolyear";

export async function fetchSchoolHolidays(schoolYear) {
  const url = `${BASE}/${schoolYear}?output=json`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API fetch failed (${res.status})`);
  }
  return await res.json();
}

export async function schoolYearExists(schoolYear) {
  try {
    const json = await fetchSchoolHolidays(schoolYear);
    const vacations = json?.content?.[0]?.vacations;
    return Array.isArray(vacations) && vacations.length > 0;
  } catch {
    return false;
  }
}
