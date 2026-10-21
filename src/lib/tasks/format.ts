const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// "2026-10-21" → "10月21日(水)"（今年でなければ年も付ける）
export function formatDueDate(dueDate: string, today = new Date()) {
  const [y, m, d] = dueDate.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const year = y === today.getFullYear() ? "" : `${y}年`;
  return `${year}${m}月${d}日(${weekday})`;
}
