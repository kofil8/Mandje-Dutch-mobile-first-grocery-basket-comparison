"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { parseShoppingList } from "../../map-data";
import { findRecognisedSpans } from "./recognize";

type Props = {
  value: string;
  error: string;
  onChange: (value: string) => void;
};

const sampleList =
  "1 liter halfvolle melk\n6 eieren\nbiologische spinazie\nbrood";

const MAX_TEXTAREA_HEIGHT = 320;
const HIGHLIGHT_DEBOUNCE = 160;

function autoGrow(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(
    textarea.scrollHeight,
    MAX_TEXTAREA_HEIGHT,
  )}px`;
}

export default function ShoppingListInput({ value, error, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);
  const parsedItems = parseShoppingList(value);
  // Debounced so the underline layer stays cheap while typing fast.
  const [highlightValue, setHighlightValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setHighlightValue(value),
      HIGHLIGHT_DEBOUNCE,
    );
    return () => window.clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    autoGrow(textareaRef.current);
  }, [value]);

  const highlighted = useMemo(() => {
    const spans = findRecognisedSpans(highlightValue);
    if (!spans.length) return highlightValue;

    const nodes: ReactNode[] = [];
    let cursor = 0;

    spans.forEach((span, index) => {
      if (span.start > cursor) {
        nodes.push(highlightValue.slice(cursor, span.start));
      }
      nodes.push(
        <span key={`recognised-${index}`}>
          {highlightValue.slice(span.start, span.end)}
        </span>,
      );
      cursor = span.end;
    });

    if (cursor < highlightValue.length) {
      nodes.push(highlightValue.slice(cursor));
    }

    return nodes;
  }, [highlightValue]);

  return (
    <section className="input-card list-card">
      <div className="section-title-row">
        <span className="section-number">01</span>
        <div>
          <h2>Wat staat er op je lijstje?</h2>
          <p>Druk op Enter of gebruik een komma om producten te splitsen.</p>
        </div>
      </div>
      <label className="visually-hidden" htmlFor="shopping-list">
        Je boodschappenlijstje
      </label>
      <div className="list-textarea-shell">
        <textarea
          ref={textareaRef}
          id="shopping-list"
          name="shoppingList"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            autoGrow(event.target);
          }}
          onScroll={(event) => {
            if (highlighterRef.current) {
              highlighterRef.current.scrollTop = event.currentTarget.scrollTop;
            }
          }}
          placeholder="Plak hier je boodschappenlijstje (bijv. 1 liter halfvolle melk, 6 eieren, biologische spinazie)…"
          rows={5}
          maxLength={1000}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "list-error" : "list-hint"}
        />
        <div className="list-highlighter" ref={highlighterRef} aria-hidden="true">
          {highlighted}
          {highlightValue.endsWith("\n") ? "\u200b" : null}
        </div>
      </div>
      <div className="textarea-meta">
        {error ? (
          <span className="field-error" id="list-error" role="alert">
            {error}
          </span>
        ) : (
          <span className="field-hint" id="list-hint">
            {parsedItems.length} producten · {value.length}/1000 tekens
          </span>
        )}
        <button
          className="sample-list-button"
          type="button"
          onClick={() => onChange(sampleList)}
        >
          Voorbeeldlijst
        </button>
      </div>
      {parsedItems.length > 0 && (
        <div className="parsed-items" aria-live="polite">
          <span className="parsed-items-label">Herkende producten</span>
          <ul aria-label="Herkende producten">
            {parsedItems.map((item, index) => (
              <li key={`${index}-${item}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
