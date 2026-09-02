// useDebounce.js
// Atrasa a propagação de um valor. Usado na busca das listagens para não
// disparar uma requisição a cada tecla.

import { useEffect, useState } from "react";

export function useDebounce(value, delay = 400) {
  const [valorAtrasado, setValorAtrasado] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setValorAtrasado(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return valorAtrasado;
}
