export function formatGefDate(date: {
  year: number;
  month: number;
  day: number;
}): string {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

export function formatGefTime(time: {
  hour: number;
  minute: number;
  second?: number;
}): string {
  const parts = [
    String(time.hour).padStart(2, "0"),
    String(time.minute).padStart(2, "0"),
  ];
  if (time.second !== undefined) {
    parts.push(String(time.second).padStart(2, "0"));
  }
  return parts.join(":");
}
