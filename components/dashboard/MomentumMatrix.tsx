import type { MomentumClass } from "@/lib/esg/types";

const quadrants: { title: MomentumClass; copy: string }[] = [
  { title: "Hidden Winner", copy: "Lower current ESG, positive forward momentum" },
  { title: "Future Leader", copy: "High current ESG, still improving" },
  { title: "Value Trap", copy: "Low current ESG, momentum deteriorating" },
  { title: "Overrated Leader", copy: "High current ESG, forward signals weakening" }
];

export function MomentumMatrix({ active }: { active: MomentumClass }) {
  return (
    <section className="matrix-grid" aria-label="ESG momentum matrix">
      {quadrants.map((quadrant) => (
        <div className={`matrix-cell ${active === quadrant.title ? "active" : ""}`} key={quadrant.title}>
          <strong>{quadrant.title}</strong>
          <span>{quadrant.copy}</span>
        </div>
      ))}
    </section>
  );
}
