// masks.js
// Máscaras de entrada. Todas limitam o número de dígitos: antes era possível
// continuar digitando indefinidamente depois do formato completo.

/** Mantém apenas dígitos, cortando no máximo informado. */
const digitos = (value, max) =>
  String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, max);

export const maskCPF = (value) => {
  const d = digitos(value, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

export const maskCNPJ = (value) => {
  const d = digitos(value, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

export const maskPhone = (value) => {
  const d = digitos(value, 11);

  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  // 10 dígitos: fixo (4+4). 11 dígitos: celular (5+4).
  const corte = d.length <= 10 ? 6 : 7;
  return `(${d.slice(0, 2)}) ${d.slice(2, corte)}-${d.slice(corte)}`;
};

export const maskCEP = (value) => {
  const d = digitos(value, 8);
  return d.replace(/^(\d{5})(\d)/, "$1-$2");
};

export const maskCurrency = (value) => {
  const v = digitos(value, 15);
  if (v === "") return "";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parseFloat(v) / 100);
};

export const unmaskCurrency = (value) => {
  if (!value) return 0;
  if (typeof value === "number") return value;

  // Remove tudo exceto dígitos e vírgula decimal
  const limpo = String(value).replace(/[^\d,]/g, "");
  return parseFloat(limpo.replace(",", ".")) || 0;
};

/** Só dígitos, para enviar ao servidor sem formatação. */
export const unmask = (value) => String(value ?? "").replace(/\D/g, "");
