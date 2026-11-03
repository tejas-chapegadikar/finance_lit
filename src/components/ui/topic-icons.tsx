import { READINESS_AREA_META, type ReadinessAreaValue } from "@/lib/readiness-areas";
import {
  BackpackIcon,
  BankIcon,
  BoltIcon,
  BookIcon,
  BriefcaseIcon,
  CalendarCheckIcon,
  CardIcon,
  CompassIcon,
  FlagIcon,
  FlameIcon,
  GaugeIcon,
  GraduationCapIcon,
  HelpIcon,
  HourglassIcon,
  MedkitIcon,
  PaletteIcon,
  PencilIcon,
  PhoneAlertIcon,
  PhoneIcon,
  ReceiptIcon,
  RefreshIcon,
  ScaleIcon,
  ShieldAlertIcon,
  ShieldIcon,
  ShirtIcon,
  SproutIcon,
  TagIcon,
  TargetIcon,
  TrendingUpIcon,
  TrophyIcon,
  VaultIcon,
  WalletIcon,
} from "./icons";

// The one place that decides which icon stands for a lesson, area, badge,
// reward, scenario or mission. Content rows still carry an emoji (seeded
// data); the interface draws these instead, so every surface uses one
// consistent icon family.

type Icon = (props: { className?: string }) => React.ReactNode;

const AREA: Record<ReadinessAreaValue, Icon> = {
  BUDGETING: WalletIcon,
  DIGITAL_SAFETY: ShieldIcon,
  BANKING: BankIcon,
  CREDIT: CardIcon,
  TAX: ReceiptIcon,
  INVESTING: TrendingUpIcon,
};

const LESSON: Record<string, Icon> = {
  "budgeting-basics": WalletIcon,
  "compound-interest": SproutIcon,
  "saving-vs-spending": ScaleIcon,
  "upi-digital-payments": PhoneIcon,
  "financial-scams": ShieldAlertIcon,
  "bank-accounts": BankIcon,
  "fd-rd": VaultIcon,
  "cibil-score": GaugeIcon,
  "credit-cards-101": CardIcon,
  "first-salary-tax": ReceiptIcon,
  "stocks-mutual-funds-fds": TrendingUpIcon,
  "sip-starting-early": HourglassIcon,
};

const SCENARIO: Record<string, Icon> = {
  "stipend-15000": BackpackIcon,
  "credit-card-bill": CardIcon,
  "upi-request": PhoneAlertIcon,
  "first-salary-slip": BriefcaseIcon,
  "no-cost-emi": TagIcon,
  "emergency-8000": MedkitIcon,
};

const BADGE: Record<string, Icon> = {
  "first-lesson": FlagIcon,
  "budget-beginner": WalletIcon,
  "scam-spotter": ShieldIcon,
  "banking-beginner": BankIcon,
  "credit-ready": CardIcon,
  "tax-smart": ReceiptIcon,
  "quiz-champion": TrophyIcon,
  "seven-day-learner": FlameIcon,
  "thirty-day-learner": CalendarCheckIcon,
  "scenario-solver": CompassIcon,
  "memory-master": RefreshIcon,
  "financial-foundations": GraduationCapIcon,
};

const REWARD: Record<string, Icon> = {
  "title-stipend-saver": WalletIcon,
  "title-scam-buster": ShieldIcon,
  "title-due-date-hero": CalendarCheckIcon,
  "title-salary-smart": BriefcaseIcon,
};

const REWARD_KIND: Record<string, Icon> = {
  avatar: ShirtIcon,
  title: TagIcon,
  theme: PaletteIcon,
  scenario: CompassIcon,
};

const MISSION: Record<string, Icon> = {
  lesson: BookIcon,
  "answer-3": PencilIcon,
  "correct-3": TargetIcon,
  question: HelpIcon,
  scenario: CompassIcon,
  challenge: BoltIcon,
};

type Props = { className?: string };

export function AreaIcon({ area, className }: Props & { area: ReadinessAreaValue }) {
  const Glyph = AREA[area] ?? BookIcon;
  return <Glyph className={className} />;
}

export function LessonIcon({ slug, area, className }: Props & { slug: string; area?: ReadinessAreaValue }) {
  const Glyph = LESSON[slug] ?? (area ? AREA[area] : undefined) ?? BookIcon;
  return <Glyph className={className} />;
}

export function ScenarioIcon({ slug, area, className }: Props & { slug: string; area?: ReadinessAreaValue }) {
  const Glyph = SCENARIO[slug] ?? (area ? AREA[area] : undefined) ?? CompassIcon;
  return <Glyph className={className} />;
}

export function BadgeIcon({ id, className }: Props & { id: string }) {
  const Glyph = BADGE[id] ?? TrophyIcon;
  return <Glyph className={className} />;
}

export function RewardIcon({ id, kind, scenarioSlug, className }: Props & { id: string; kind: string; scenarioSlug?: string }) {
  const Glyph = (scenarioSlug ? SCENARIO[scenarioSlug] : undefined) ?? REWARD[id] ?? REWARD_KIND[kind] ?? TagIcon;
  return <Glyph className={className} />;
}

export function MissionIcon({ id, className }: Props & { id: string }) {
  const Glyph = MISSION[id] ?? TargetIcon;
  return <Glyph className={className} />;
}

const TILE_SIZES = {
  sm: "h-9 w-9 rounded-xl [&>svg]:h-[18px] [&>svg]:w-[18px]",
  md: "h-11 w-11 rounded-xl [&>svg]:h-5 [&>svg]:w-5",
  lg: "h-14 w-14 rounded-2xl [&>svg]:h-7 [&>svg]:w-7",
};

/** An icon on its area's quiet tint — the standard way to show a topic. */
export function IconTile({
  area,
  size = "md",
  muted = false,
  className = "",
  children,
}: {
  area?: ReadinessAreaValue;
  size?: keyof typeof TILE_SIZES;
  /** Locked or not yet available: neutral and dimmed. */
  muted?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const meta = area ? READINESS_AREA_META[area] : undefined;
  const tone = muted ? "bg-slate-100 text-slate-400" : meta ? `${meta.chipBg} ${meta.labelText}` : "bg-slate-100 text-slate-700";
  return (
    <span aria-hidden className={`flex shrink-0 items-center justify-center ${TILE_SIZES[size]} ${tone} ${className}`}>
      {children}
    </span>
  );
}
