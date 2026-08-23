"use client";

import { useState } from "react";
import AskQuestionModal from "@/components/ui/ask-question-modal";
import styles from "./ask-question-cta.module.css";

/** Кнопка «Задать вопрос» + модалка для статических страниц (без товара). */
export default function AskQuestionButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={styles.askBtn} onClick={() => setOpen(true)}>
        Задать вопрос
      </button>
      <AskQuestionModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
