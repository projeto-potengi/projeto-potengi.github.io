import type { Metadata } from "next";
import DocumentsLibrary from "@/src/components/DocumentsLibrary";
import styles from "@/src/components/DocumentsLibrary.module.css";

export const metadata: Metadata = {
  title: "Documentos | Projeto Potengi",
  description: "Biblioteca institucional do Projeto Potengi."
};

export default function DocumentsPage() {
  return (
    <main className={`page-main ${styles.documentsPage}`}>
      <section className={`${styles.hero} page-hero`}>
        <h1>Documentos</h1>
        <p>Consulte a produção acadêmica e o acervo público institucional do Projeto Potengi.</p>
      </section>

      <DocumentsLibrary />
    </main>
  );
}
