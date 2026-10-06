// Per-lesson icon by topic. Colour-coding comes from the lesson's readiness
// area instead (READINESS_AREA_META), so lessons in one curriculum group match.
const TOPIC_ICONS: Record<string, string> = {
  Budgeting: "💰",
  Saving: "🐷",
  "Digital Payments": "📱",
  Banking: "🏦",
  Credit: "💳",
  Taxes: "🧾",
  Investing: "📈",
  Insurance: "🛡️",
  "Scam Awareness": "🚨",
};

export function getTopicIcon(topic: string): string {
  return TOPIC_ICONS[topic] ?? "🎯";
}
