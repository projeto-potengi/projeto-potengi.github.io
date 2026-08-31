import type { CSSProperties } from "react";
import { formatCurrency, projectInvestmentByGoal } from "@/src/data/project";

const maxInvestment = Math.max(...projectInvestmentByGoal.map((item) => item.value));

const compactCurrency = (value: number) => {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mi`;
  }
  return `R$ ${(value / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
};

export default function ResultsInvestmentChart() {
  return (
    <div className="results-investment-chart" role="img" aria-label="Recursos aplicados por meta do Projeto Potengi">
      {projectInvestmentByGoal.map((item, index) => {
        const percentage = maxInvestment > 0 ? (item.value / maxInvestment) * 100 : 0;
        return (
          <div className="results-investment-row" key={item.id} title={`${item.label}: ${formatCurrency(item.value)}`}>
            <div className="results-investment-label">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.shortTitle}</strong>
              <b>{compactCurrency(item.value)}</b>
            </div>
            <div className="results-investment-track" aria-hidden="true">
              <i style={{ "--investment-width": `${Math.max(2.5, percentage)}%` } as CSSProperties} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
