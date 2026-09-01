import type { Metadata } from "next";
import Image from "next/image";
import { Instagram } from "lucide-react";
import ProjectTerritoryJourneyV6 from "@/src/components/ProjectTerritoryJourneyV6";
import ProjectLeadership from "@/src/components/ProjectLeadership";
import ProjectInstitutionsCarousel from "@/src/components/ProjectInstitutionsCarousel";
import styles from "./projeto-multiescala.module.css";

export const metadata: Metadata = {
  title: "Projeto | Projeto Potengi",
  description: "Contexto, objetivo, metodologia, território, instituições e trajetória do Projeto Potengi."
};

const methodology = [
  {
    step: "01",
    title: "Diagnosticar",
    text: "Caracterizar a bacia e organizar a leitura socioeconômica e ambiental."
  },
  {
    step: "02",
    title: "Priorizar",
    text: "Identificar áreas vulneráveis e orientar espacialmente as ações."
  },
  {
    step: "03",
    title: "Validar",
    text: "Conferir em campo as áreas críticas indicadas pelo diagnóstico."
  },
  {
    step: "04",
    title: "Intervir",
    text: "Executar ações de recuperação nas áreas selecionadas."
  },
  {
    step: "05",
    title: "Monitorar",
    text: "Definir o acompanhamento da evolução das áreas recuperadas."
  }
];

const milestones = [
  {
    year: "2021",
    title: "Início da vigência",
    text: "29 de dezembro de 2021"
  },
  {
    year: "2022",
    title: "Início operacional",
    text: "Estruturação e desenvolvimento dos levantamentos"
  },
  {
    year: "2023–2025",
    title: "Execução",
    text: "Diagnósticos, validações em campo, recuperação e produção técnica"
  },
  {
    year: "2026",
    title: "Conclusão",
    text: "Encerramento da vigência e consolidação pública dos resultados"
  }
];

export default function ProjetoPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="project-title">
        <div className={styles.heroNarrative}>
          <p className={styles.kicker}>PROJETO</p>
          <h1 id="project-title">
            Recuperação ambiental na Bacia do Rio Potengi
          </h1>
          <p className={styles.lead}>
            Pesquisa para desenvolvimento de ações de recuperação ambiental de áreas
            de recarga da Bacia Hidrográfica do Rio Potengi.
          </p>
        </div>

        <aside className={styles.heroDossier} aria-label="Informações do Projeto Potengi">
          <div className={styles.dossierMark} aria-hidden="true">
            <span>RIO</span>
            <strong>POTENGI</strong>
          </div>

          <p>
            Pesquisa aplicada à recuperação ambiental com a bacia hidrográfica
            como unidade territorial de referência.
          </p>

          <dl>
            <div>
              <dt>Instrumento</dt>
              <dd>TED nº 23/2021/MDR</dd>
            </div>
            <div>
              <dt>Vigência</dt>
              <dd>29/12/2021 — 30/04/2026</dd>
            </div>
            <div>
              <dt>Unidade territorial</dt>
              <dd>Bacia Hidrográfica do Rio Potengi</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className={styles.core} aria-labelledby="core-title">
        <div className={styles.coreStatement}>
          <p className={styles.kicker}>O PROJETO POTENGI</p>
          <h2 id="core-title">Conhecimento aplicado à recuperação da bacia</h2>

          <div className={styles.objective}>
            <span>OBJETIVO GERAL</span>
            <p>
              Recuperar nascentes e áreas degradadas da Bacia Hidrográfica do Rio
              Potengi visando à melhoria da disponibilidade hídrica, integrando
              diagnóstico ambiental, validação de campo, intervenção e comunicação social.
            </p>
          </div>
        </div>

        <div className={styles.methodology} aria-label="Síntese metodológica">
          <header>
            <span>COMO O TRABALHO FOI ORGANIZADO</span>
            <p>
              Cinco movimentos conectam leitura territorial, definição de prioridades,
              trabalho de campo e acompanhamento das intervenções.
            </p>
          </header>

          <ol>
            {methodology.map((item) => (
              <li key={item.step}>
                <b>{item.step}</b>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.territory} aria-labelledby="territory-title">
        <header className={styles.territoryHeader}>
          <p className={styles.kicker}>TERRITÓRIO DE ATUAÇÃO</p>
          <h2 id="territory-title">Do Brasil à Bacia do Rio Potengi</h2>
          <p>
            Uma aproximação progressiva situa o Projeto Potengi no país, no Nordeste,
            no Rio Grande do Norte e, por fim, em sua unidade territorial de referência.
          </p>
        </header>

        <ProjectTerritoryJourneyV6 />
      </section>

      <ProjectLeadership />

      <ProjectInstitutionsCarousel />

      <section className={styles.trajectory} aria-labelledby="trajectory-title">
        <header>
          <p className={styles.kicker}>TRAJETÓRIA DO PROJETO</p>
          <h2 id="trajectory-title">Quatro momentos de uma mesma pesquisa</h2>
        </header>

        <ol className={styles.yearLedger}>
          {milestones.map((item) => (
            <li key={item.year}>
              <b>{item.year}</b>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </li>
          ))}
        </ol>
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
          Créditos: Projeto Potengi/UFRN/Funpec; registros, documentos e bases
          geoespaciais do projeto.
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
