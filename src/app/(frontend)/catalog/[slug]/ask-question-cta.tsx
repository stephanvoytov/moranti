"use client";

import { useState } from "react";
import AskQuestionModal from "@/components/ui/ask-question-modal";
import styles from "./ask-question-cta.module.css";

interface AskQuestionCtaProps {
  productSlug: string;
  productName: string;
}

/** Кнопка «Задать вопрос» + модалка. Slug подставляется в письмо автоматически. */
export default function AskQuestionCta({
  productSlug,
  productName,
}: AskQuestionCtaProps) {
  const [open, setOpen] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState("");

  const handleOpen = () => {
    // Предзаполняем вежливым шаблоном со ссылкой на товар
    setInitialQuestion(
      `Здравствуйте! У меня вопрос по товару ${window.location.origin}/catalog/${productSlug}`,
    );
    setOpen(true);
  };

  return (
    <>
      <button type="button" className={styles.askBtn} onClick={handleOpen}>
        Задать вопрос
      </button>
      <AskQuestionModal
        open={open}
        onClose={() => setOpen(false)}
        productSlug={productSlug}
        productName={productName}
        initialQuestion={initialQuestion}
      />
    </>
  );
}
