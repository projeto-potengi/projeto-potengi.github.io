"use client";

import { Accessibility, Check, Link2, Minus, Plus, RotateCcw, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./header-utilities.module.css";

type FontSize = "small" | "default" | "large";

type Preferences = {
  fontSize: FontSize;
  highContrast: boolean;
  highlightLinks: boolean;
  reduceMotion: boolean;
};

const STORAGE_KEY = "potengi-accessibility-v1";

const defaults: Preferences = {
  fontSize: "default",
  highContrast: false,
  highlightLinks: false,
  reduceMotion: false
};

function applyPreferences(preferences: Preferences) {
  const root = document.documentElement;

  root.dataset.fontSize = preferences.fontSize;
  root.dataset.contrast = preferences.highContrast ? "high" : "default";
  root.dataset.highlightLinks = preferences.highlightLinks ? "true" : "false";
  root.dataset.reduceMotion = preferences.reduceMotion ? "true" : "false";
}

function loadPreferences(): Preferences {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export default function AccessibilityMenu({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [preferences, setPreferences] = useState<Preferences>(defaults);

  useEffect(() => {
    const stored = loadPreferences();
    setPreferences(stored);
    applyPreferences(stored);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const update = (next: Preferences) => {
    setPreferences(next);
    applyPreferences(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const fontOrder: FontSize[] = ["small", "default", "large"];

  const changeFont = (direction: -1 | 1) => {
    const current = fontOrder.indexOf(preferences.fontSize);
    const nextIndex = Math.min(fontOrder.length - 1, Math.max(0, current + direction));
    update({ ...preferences, fontSize: fontOrder[nextIndex] });
  };

  const reset = () => {
    update(defaults);
  };

  if (!open) return null;

  return (
    <section
      className={styles.accessibilityPanel}
      role="dialog"
      aria-label="Preferências de acessibilidade"
    >
      <header>
        <div>
          <Accessibility size={19} aria-hidden="true" />
          <div>
            <span>ACESSIBILIDADE</span>
            <strong>Preferências de leitura</strong>
          </div>
        </div>

        <button
          className={styles.iconButton}
          type="button"
          onClick={onClose}
          aria-label="Fechar acessibilidade"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className={styles.accessibilityGroup}>
        <span>Tamanho do texto</span>
        <div className={styles.fontControls}>
          <button
            type="button"
            onClick={() => changeFont(-1)}
            disabled={preferences.fontSize === "small"}
            aria-label="Diminuir tamanho do texto"
          >
            <Minus size={16} aria-hidden="true" />
            A
          </button>

          <button
            type="button"
            className={styles.fontReset}
            onClick={() => update({ ...preferences, fontSize: "default" })}
            aria-pressed={preferences.fontSize === "default"}
          >
            A
          </button>

          <button
            type="button"
            onClick={() => changeFont(1)}
            disabled={preferences.fontSize === "large"}
            aria-label="Aumentar tamanho do texto"
          >
            A
            <Plus size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={styles.accessibilityOptions}>
        <button
          type="button"
          aria-pressed={preferences.highContrast}
          onClick={() =>
            update({ ...preferences, highContrast: !preferences.highContrast })
          }
        >
          <Sparkles size={17} aria-hidden="true" />
          <span>
            <strong>Contraste reforçado</strong>
            <small>Eleva a separação entre texto e fundo.</small>
          </span>
          {preferences.highContrast ? <Check size={17} aria-hidden="true" /> : null}
        </button>

        <button
          type="button"
          aria-pressed={preferences.highlightLinks}
          onClick={() =>
            update({ ...preferences, highlightLinks: !preferences.highlightLinks })
          }
        >
          <Link2 size={17} aria-hidden="true" />
          <span>
            <strong>Destacar links</strong>
            <small>Sublinha os links presentes nas páginas.</small>
          </span>
          {preferences.highlightLinks ? <Check size={17} aria-hidden="true" /> : null}
        </button>

        <button
          type="button"
          aria-pressed={preferences.reduceMotion}
          onClick={() =>
            update({ ...preferences, reduceMotion: !preferences.reduceMotion })
          }
        >
          <span className={styles.motionGlyph} aria-hidden="true">↝</span>
          <span>
            <strong>Reduzir movimento</strong>
            <small>Minimiza animações e transições do portal.</small>
          </span>
          {preferences.reduceMotion ? <Check size={17} aria-hidden="true" /> : null}
        </button>
      </div>

      <button className={styles.resetPreferences} type="button" onClick={reset}>
        <RotateCcw size={15} aria-hidden="true" />
        Restaurar padrão
      </button>

      <small className={styles.preferenceNote}>
        Preferências salvas neste navegador.
      </small>
    </section>
  );
}
