"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { goals } from "@/src/data/project";
import styles from "@/app/resultados/resultados.module.css";

export default function ResultsGoalsCompact() {
  const [activeId, setActiveId] = useState(goals[0]?.id ?? "meta-1");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && goals.some((goal) => goal.id === hash)) {
      setActiveId(hash);
    }
  }, []);

  const activeGoal = useMemo(
    () => goals.find((goal) => goal.id === activeId) ?? goals[0],
    [activeId]
  );

  if (!activeGoal) return null;

  const activeIndex = goals.findIndex((goal) => goal.id === activeGoal.id);

  const selectGoal = (goalId: string) => {
    setActiveId(goalId);
    window.history.replaceState(null, "", `#${goalId}`);
  };

  return (
    <div className={styles.goalsExplorer}>
      <div className={styles.goalTabs} role="tablist" aria-label="Selecionar meta">
        {goals.map((goal, index) => {
          const active = goal.id === activeGoal.id;
          return (
            <button
              key={goal.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={active ? styles.goalTabActive : undefined}
              onClick={() => selectGoal(goal.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{goal.shortTitle}</strong>
            </button>
          );
        })}
      </div>

      <article
        id={activeGoal.id}
        className={styles.goalDetail}
        aria-labelledby={`${activeGoal.id}-title`}
      >
        <div className={styles.goalIdentity}>
          <div className={styles.goalNumber}>
            {String(activeIndex + 1).padStart(2, "0")}
          </div>

          <span className={styles.goalStatus}>
            <CheckCircle2 size={15} aria-hidden="true" />
            Meta concluída
          </span>

          <h3 id={`${activeGoal.id}-title`}>{activeGoal.title}</h3>
          <p>{activeGoal.objective}</p>
        </div>

        <div className={styles.goalEditorial}>
          <div className={styles.goalPrimaryGrid}>
            <section>
              <span className={styles.detailLabel}>O QUE FOI REALIZADO</span>
              <ul>
                {activeGoal.actions.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>

            <section>
              <span className={styles.detailLabel}>RESULTADOS ALCANÇADOS</span>
              <ul>
                {activeGoal.results.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>
          </div>

          <div className={styles.goalMetadata}>
            <section>
              <span className={styles.detailLabel}>ÁREAS E TERRITÓRIOS</span>
              <div className={styles.inlineTerms}>
                {activeGoal.areas.map((item) => <span key={item}>{item}</span>)}
              </div>
            </section>

            <section>
              <span className={styles.detailLabel}>PRINCIPAIS PRODUTOS</span>
              <div className={styles.inlineProducts}>
                {activeGoal.products.map((item) => <span key={item}>{item}</span>)}
              </div>
            </section>
          </div>
        </div>
      </article>
    </div>
  );
}
