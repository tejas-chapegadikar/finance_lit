type TopicStyle = { icon: string; chipBg: string; chipText: string; labelText: string };

const TOPIC_STYLES: Record<string, TopicStyle> = {
  Budgeting: { icon: "💰", chipBg: "bg-emerald-100", chipText: "text-emerald-600", labelText: "text-emerald-600" },
  Saving: { icon: "🐷", chipBg: "bg-teal-100", chipText: "text-teal-600", labelText: "text-teal-600" },
  "Digital Payments": { icon: "📱", chipBg: "bg-sky-100", chipText: "text-sky-600", labelText: "text-sky-600" },
  Banking: { icon: "🏦", chipBg: "bg-indigo-100", chipText: "text-indigo-600", labelText: "text-indigo-600" },
  Credit: { icon: "💳", chipBg: "bg-violet-100", chipText: "text-violet-600", labelText: "text-violet-600" },
  Taxes: { icon: "🧾", chipBg: "bg-amber-100", chipText: "text-amber-600", labelText: "text-amber-600" },
  Investing: { icon: "📈", chipBg: "bg-blue-100", chipText: "text-blue-600", labelText: "text-blue-600" },
  Insurance: { icon: "🛡️", chipBg: "bg-cyan-100", chipText: "text-cyan-600", labelText: "text-cyan-600" },
  "Scam Awareness": { icon: "🚨", chipBg: "bg-rose-100", chipText: "text-rose-600", labelText: "text-rose-600" },
};

const DEFAULT_STYLE: TopicStyle = {
  icon: "🎯",
  chipBg: "bg-violet-100",
  chipText: "text-violet-600",
  labelText: "text-violet-600",
};

export function getTopicStyle(topic: string): TopicStyle {
  return TOPIC_STYLES[topic] ?? DEFAULT_STYLE;
}
