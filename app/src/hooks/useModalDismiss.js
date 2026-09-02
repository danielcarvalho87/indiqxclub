// useModalDismiss.js
// Fecha modais com ESC e com clique fora, e trava o scroll do fundo.
// Localização: src/hooks/useModalDismiss.js

import { useEffect, useRef } from "react";

/**
 * @param {boolean} isOpen  se o modal está aberto
 * @param {() => void} onClose  callback de fechamento
 * @returns {{ backdropRef: React.RefObject, onBackdropClick: Function }}
 */
export function useModalDismiss(isOpen, onClose) {
  const backdropRef = useRef(null);
  // Guarda onde o mousedown começou: arrastar de dentro para fora do modal
  // não deve fechá-lo (acontece ao selecionar texto de um campo).
  const pressStartedOnBackdrop = useRef(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Impede o scroll da página atrás do modal
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflowAnterior;
    };
  }, [isOpen, onClose]);

  const onBackdropMouseDown = (event) => {
    pressStartedOnBackdrop.current = event.target === backdropRef.current;
  };

  const onBackdropClick = (event) => {
    if (event.target === backdropRef.current && pressStartedOnBackdrop.current) {
      onClose();
    }
    pressStartedOnBackdrop.current = false;
  };

  return { backdropRef, onBackdropMouseDown, onBackdropClick };
}
