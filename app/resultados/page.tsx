import type { Metadata } from "next";
import Image from "next/image";
import { Instagram } from "lucide-react";
import ResultsTerritoryMap from "@/src/components/ResultsTerritoryMap";
import ResultsExecutionSummary from "@/src/components/ResultsExecutionSummary";
import ResultsGoalsCompact from "@/src/components/ResultsGoalsCompact";
import { recoveryTotalHectares } from "@/src/data/project";
import styles from "./resultados.module.css";

export const metadata: Metadata = {
  title: "Resultados | Projeto Potengi",
  description: "Síntese executiva dos resultados consolidados do Projeto Potengi."
};

const formatHectares = (value: number) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const indicators = [
  { value: "7", label: "metas concluídas" },
  { value: "25", label: "municípios na Meta 6" },
  { value: "4", label: "áreas de recuperação" },
  { value: `${formatHectares(recoveryTotalHectares)} ha`, label: "recuperação ambiental" },
  { value: "R$ 3,0 mi", label: "recursos aplicados" }
];

export default function ResultsPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="results-title">
        <p className={styles.kicker}>RESULTADOS</p>
        <h1 id="results-title">Resultados do Projeto Potengi</h1>
        <p className={styles.lead}>
          Síntese executiva das sete metas concluídas, do território de atuação e dos
          resultados consolidados na Bacia Hidrográfica do Rio Potengi.
        </p>

        <div className={styles.metaLine} aria-label="Informações institucionais do projeto">
          <span><b>Instrumento</b> TED nº 23/2021/MDR</span>
          <i aria-hidden="true" />
          <span><b>Vigência</b> 29/12/2021 — 30/04/2026</span>
          <i aria-hidden="true" />
          <span><b>Situação</b> sete metas concluídas</span>
        </div>
      </section>

      <section className={styles.metrics} aria-label="Indicadores principais">
        {indicators.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <section className={styles.territorySection} aria-labelledby="territory-title">
        <header className={styles.sectionHeader}>
          <div>
            <p className={styles.kicker}>PANORAMA TERRITORIAL</p>
            <h2 id="territory-title">Resultados no território</h2>
          </div>
          <p>
            Alterne entre a visão geral, os 25 municípios abrangidos pela Meta 6
            e as quatro áreas de intervenção associadas à recuperação ambiental.
          </p>
        </header>

        <ResultsTerritoryMap />
      </section>

      <section className={styles.executionSection} aria-labelledby="execution-title">
        <header className={styles.sectionHeader}>
          <div>
            <p className={styles.kicker}>SÍNTESE DE EXECUÇÃO</p>
            <h2 id="execution-title">Recursos e ciclo do projeto</h2>
          </div>
          <p>
            Distribuição dos recursos aplicados nas sete metas e os principais
            marcos da vigência entre 2021 e 2026.
          </p>
        </header>

        <ResultsExecutionSummary />
      </section>

      <section className={styles.goalsSection} aria-labelledby="goals-title">
        <header className={styles.sectionHeader}>
          <div>
            <p className={styles.kicker}>SETE METAS</p>
            <h2 id="goals-title">Do diagnóstico à comunicação dos resultados</h2>
          </div>
          <p>
            Selecione uma meta para consultar objetivo, ações realizadas,
            resultados, territórios e principais produtos.
          </p>
        </header>

        <ResultsGoalsCompact />
      </section>

      <footer className="rpf-footer">
        <div className="rpf-footer-project">
          <Image
            className="rpf-footer-project-mark"
            src="/brand/projeto-potengi-logo.png"
            alt="Projeto Potengi"
            width={74}
            height={88}
          />
          <div>
            <strong>Projeto Potengi</strong>
            <span>Portal público de resultados do Projeto Potengi.</span>
          </div>
        </div>
        <p className="rpf-footer-credits">
          Créditos: Projeto Potengi/UFRN/Funpec; registros, documentos e bases geoespaciais do projeto.
        </p>
        <div className="rpf-footer-meta">
          <a
            className="rpf-footer-instagram"
            href="https://www.instagram.com/projetopotengiufrn/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram do Projeto Potengi"
          >
            <Instagram size={21} strokeWidth={2} aria-hidden="true" />
            <span>@projetopotengiufrn</span>
          </a>
          <small>Portal Projeto Potengi · 2026</small>
        </div>
      </footer>
    </main>
  );
}
