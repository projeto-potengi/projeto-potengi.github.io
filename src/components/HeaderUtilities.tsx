"use client";

import { Accessibility, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import AccessibilityMenu from "@/src/components/AccessibilityMenu";
import GlobalSearchDialog from "@/src/components/GlobalSearchDialog";
import styles from "./header-utilities.module.css";

export default function HeaderUtilities() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const accessWrapRef = useRef<HTMLDivElement>(null);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    if (!accessibilityOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!accessWrapRef.current?.contains(event.target as Node)) {
        setAccessibilityOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [accessibilityOpen]);

  return (
    <>
      <div className={styles.utilities}>
        <button
          className={styles.searchTrigger}
          type="button"
          onClick={() => {
            setAccessibilityOpen(false);
            setSearchOpen(true);
          }}
          aria-label="Buscar no Projeto Potengi"
        >
          <Search size={17} aria-hidden="true" />
          <span>Buscar</span>
        </button>

        <div className={styles.accessibilityWrap} ref={accessWrapRef}>
          <button
            className={styles.accessibilityTrigger}
            type="button"
            onClick={() => {
              setSearchOpen(false);
              setAccessibilityOpen((current) => !current);
            }}
            aria-label="Abrir preferências de acessibilidade"
            title="Acessibilidade"
            aria-expanded={accessibilityOpen}
          >
            <Accessibility size={20} aria-hidden="true" />
            <span className={styles.desktopSrOnly}>Acessibilidade</span>
          </button>

          <AccessibilityMenu
            open={accessibilityOpen}
            onClose={() => setAccessibilityOpen(false)}
          />
        </div>
      </div>

      <GlobalSearchDialog open={searchOpen} onClose={closeSearch} />
    </>
  );
}
