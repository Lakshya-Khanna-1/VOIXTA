"use client";

import { useId, useRef, useState } from "react";

function wrapText(context, text, maxWidth) {
  const lines = [];
  let line = "";

  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && context.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  return [...lines, line];
}

async function downloadCard(locale, copy, titleFamily, bodyFamily) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");

  const ink = "#153D32";
  const accent = "#BC3C29";
  const paper = "#F6F1E7";
  const titleFont = `800 76px ${titleFamily}`;
  const stepFont = `600 54px ${bodyFamily}`;

  if (document.fonts) {
    await Promise.allSettled([
      document.fonts.load(titleFont, copy.cardTitle),
      document.fonts.load(stepFont, copy.cardSteps.join(" ")),
    ]);
  }

  context.font = titleFont;
  const titleLines = wrapText(context, copy.cardTitle, 824);
  context.font = stepFont;
  const steps = copy.cardSteps.map((step) => wrapText(context, step, 724));
  const contentHeight =
    230 + titleLines.length * 94 +
    steps.reduce((height, step) => height + step.length * 70 + 50, 0);

  canvas.width = 1080;
  canvas.height = Math.max(1350, contentHeight + 220);
  const top = Math.round((canvas.height - contentHeight) / 2);
  context.fillStyle = paper;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = ink;
  context.lineWidth = 4;
  context.strokeRect(64, top, 952, contentHeight);
  context.textBaseline = "alphabetic";

  context.fillStyle = accent;
  context.fillRect(128, top + 68, 42, 5);
  context.font = `800 35px ${titleFamily}`;
  context.fillStyle = ink;
  context.fillText("Voixta", 190, top + 82);

  let y = top + 180;
  context.font = titleFont;
  for (const line of titleLines) {
    context.fillText(line, 128, y);
    y += 94;
  }

  y -= 32;
  for (const [index, lines] of steps.entries()) {
    context.fillStyle = ink;
    context.fillRect(128, y, 824, 2);
    y += 54;
    context.font = `800 34px ${titleFamily}`;
    context.fillStyle = accent;
    context.fillText(String(index + 1), 128, y);

    context.font = stepFont;
    context.fillStyle = ink;
    for (const line of lines) {
      context.fillText(line, 208, y);
      y += 70;
    }
    y -= 4;
  }

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `voixta-family-card-${locale}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function FamilyCard({ locale, copy }) {
  const titleId = useId();
  const title = useRef(null);
  const steps = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  async function saveCard() {
    setIsSaving(true);
    setSaveFailed(false);
    try {
      await downloadCard(
        locale,
        copy,
        getComputedStyle(title.current).fontFamily,
        getComputedStyle(steps.current).fontFamily,
      );
    } catch {
      setSaveFailed(true);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="family-card-wrap">
      <section className="family-card" aria-labelledby={titleId} lang={locale}>
        <p className="family-card-brand" aria-hidden="true">Voixta</p>
        <h2 className="family-card-title" id={titleId} ref={title}>
          {copy.cardTitle}
        </h2>
        <ol className="family-card-steps" ref={steps} role="list">
          {copy.cardSteps.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </section>
      <button
        type="button"
        className="button button-primary family-card-save"
        onClick={saveCard}
        disabled={isSaving}
        aria-busy={isSaving}
      >
        {copy.saveCard}
      </button>
      <p className="family-card-error" role="status">
        {saveFailed ? copy.saveError : null}
      </p>
    </div>
  );
}
