"use client";

import styles from "@/app/resultados/resultados.module.css";

const investments = [
  { meta: "01", title: "Diagnóstico territorial", value: 380000 },
  { meta: "02", title: "Educação ambiental", value: 320000 },
  { meta: "03", title: "Validação em campo", value: 200000 },
  { meta: "04", title: "Recuperação ambiental", value: 1900000 },
  { meta: "05", title: "Monitoramento", value: 60000 },
  { meta: "06", title: "Saneamento", value: 20000 },
  { meta: "07", title: "Comunicação social", value: 120000 }
];

const max = Math.max(...investments.map((item) => item.value));

const formatCompact = (value: number) => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  }
  return `R$ ${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
};

const milestones = [
  { year: "2021", title: "Início da vigência", detail: "29 de dezembro" },
  { year: "2022", title: "Início operacional", detail: "estruturação e levantamentos" },
  { year: "2023–25", title: "Execução das metas", detail: "campo, recuperação e produção técnica" },
  { year: "2026", title: "Conclusão", detail: "encerramento e consolidação dos resultados" }
];

export default function ResultsExecutionSummary() {
  return (
    <div className={styles.executionPanel}>
      <div className={styles.investmentCard}>
        <div className={styles.investmentLead}>
          <span>RECURSOS APLICADOS</span>
          <strong>R$ 3,0 mi</strong>
          <p>
            A recuperação ambiental concentrou a maior parcela dos recursos
            aplicados nas sete metas.
          </p>
        </div>

        <div className={styles.investmentRanking} aria-label="Recursos aplicados por meta">
          {investments.map((item) => (
            <div className={styles.investmentRow} key={item.meta}>
              <b>{item.meta}</b>
              <span>{item.title}</span>
              <div className={styles.investmentTrack} aria-hidden="true">
                <i style={{ width: `${Math.max((item.value / max) * 100, 1.8)}%` }} />
              </div>
              <strong>{formatCompact(item.value)}</strong>
            </div>
          ))}
        </div>

        <small className={styles.investmentSource}>
          Fonte: Relatório de Execução Físico-Financeira do Projeto Potengi — valores aplicados por meta.
        </small>
      </div>

      <div className={styles.projectTimeline}>
        <div className={styles.timelineTitle}>
          <span>VIGÊNCIA DO PROJETO</span>
          <strong>2021 — 2026</strong>
        </div>

        <ol>
          {milestones.map((item, index) => (
            <li
              key={item.year}
              className={index === milestones.length - 1 ? styles.timelineLast : undefined}
            >
              <b>{item.year}</b>
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
