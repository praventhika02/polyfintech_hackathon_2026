import type { LucideIcon } from "lucide-react";
import { AnimatedMetricValue } from "@/components/dashboard/AnimatedMetricValue";

export function SignalCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "neutral"
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone?: "neutral" | "positive" | "warning" | "danger";
}) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-icon">
        <Icon size={19} />
      </div>
      <span>{label}</span>
      <AnimatedMetricValue value={value} />
      <p>{detail}</p>
    </article>
  );
}
