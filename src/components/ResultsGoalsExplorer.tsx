"use client";

import { useMemo, useState } from "react";
import { Layers3, MapPinned, Target, Trees } from "lucide-react";
import { goals } from "@/src/data/project";

export default function ResultsGoalsExplorer() {
  const [activeId, setActiveId] = useState(goals[0]?.id ?? "meta-1");
  const activeGoal = useMemo(() => goals.find((goal) => goal.id === activeId) ?? goals[0], [activeId]);

  if (!activeGoal) return null;

  return (
    <div className="results-goals-explorer">
      <nav className="results-goals-tabs" aria-label="Selecionar meta do Projeto Potengi">
        {goals.map((goal, index) => {
          const active = goal.id === activeGoal.id;
          return (
            <button
              key={goal.id}
              type="button"
              className={active ? "is-active" : undefined}
              aria-pressed={active}
              onClick={() => setActiveId(goal.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{goal.shortTitle}</strong>
            </button>
          );
        })}
      </nav>

      <article className="results-goal-panel">
        <header className="results-goal-header">
          <span className="results-goal-number">{activeGoal.id.replace(/\D+/g, "").padStart(2, "0")}</span>
          <div>
            <p>DETALHAMENTO DA META</p>
            <h3>{activeGoal.title}</h3>
            <strong>{activeGoal.objective}</strong>
          </div>
        </header>

        <div className="results-goal-content">
          <section>
            <h4><Target size={17} aria-hidden="true" /> Ações realizadas</h4>
            <ul>{activeGoal.actions.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>

          <section>
            <h4><Trees size={17} aria-hidden="true" /> Resultados</h4>
            <ul>{activeGoal.results.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>

          <section className="results-goal-territory-products">
            <div>
              <h4><MapPinned size={17} aria-hidden="true" /> Áreas e territórios</h4>
              <ul>{activeGoal.areas.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <h4><Layers3 size={17} aria-hidden="true" /> Produtos</h4>
              <ul>{activeGoal.products.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
