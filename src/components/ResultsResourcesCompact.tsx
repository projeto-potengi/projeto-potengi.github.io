"use client";

import styles from "@/app/resultados/resultados.module.css";

const investments = [
  { meta: "01", title: "Diagnóstico", value: 380000 },
  { meta: "02", title: "Educação ambiental", value: 320000 },
  { meta: "03", title: "Validação", value: 200000 },
  { meta: "04", title: "Recuperação", value: 1900000 },
  { meta: "05", title: "Monitoramento", value: 60000 },
  { meta: "06", title: "Saneamento", value: 20000 },
  { meta: "07", title: "Comunicação", value: 120000 }
];

const max = Math.max(...investments.map((item) => item.value));

const formatCompact = (value: number) => {
  if (value >= 1000000) return `R$ ${(value / 1000000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  return `R$ ${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
};

const timeline = [
  { year: "2021", label: "início da vigência" },
  { year: "2022", label: "estruturação e levantamentos" },
  { year: "2023–25", label: "execução das metas e ações de campo" },
  { year: "2026", label: "encerramento e consolidação" }
];

export default function ResultsResourcesCompact() {
  return (
    <div className={styles.sideStack}>
      <article className={styles.resourceCard}>
        <header className={styles.resourceHeader}>
          <div>
            <span>Recursos aplicados</span>
            <h3>Distribuição por meta</h3>
          </div>
          <strong>R$ 3,0 milhões</strong>
        </header>

        <div className={styles.bars}>
          {investments.map((item) => (
            <div className={styles.barRow} key={item.meta}>
              <div className={styles.barLabel}>
                <b>{item.meta}</b>
                <span>{item.title}</span>
                <strong>{formatCompact(item.value)}</strong>
              </div>
              <div className={styles.barTrack}>
                <i style={{ width: `${Math.max((item.value / max) * 100, 2.4)}%` }} />
              </div>
            </div>
          ))}
        </div>

        <small className={styles.sourceNote}>
          Fonte: Relatório de Execução Físico-Financeira do Projeto Potengi.
        </small>
      </article>

      <article className={styles.timelineCard}>
        <div className={styles.timelineHeader}>
          <span>Vigência do projeto</span>
          <strong>2021 — 2026</strong>
        </div>

        <ol className={styles.timeline}>
          {timeline.map((item, index) => (
            <li key={item.year} className={index === timeline.length - 1 ? styles.timelineFinal : undefined}>
              <b>{item.year}</b>
              <span>{item.label}</span>
            </li>
          ))}
        </ol>
      </article>
    </div>
  );
}
