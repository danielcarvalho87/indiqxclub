export const maskCPF = (value) => {
  if (!value) return "";
  return value
    .replace(/\D/g, "") // Remove tudo o que não é dígito
    .replace(/(\d{3})(\d)/, "$1.$2") // Coloca um ponto entre o terceiro e o quarto dígitos
    .replace(/(\d{3})(\d)/, "$1.$2") // Coloca um ponto entre o terceiro e o quarto dígitos de novo (para o segundo bloco)
    .replace(/(\d{3})(\d{1,2})/, "$1-$2") // Coloca um hífen entre o terceiro e o quarto dígitos
    .replace(/(-\d{2})\d+?$/, "$1"); // Captura 2 números seguidos de um traço e não deixa ser digitado mais nada
};

export const maskPhone = (value) => {
  if (!value) return "";
  value = value.replace(/\D/g, ""); // Remove tudo o que não é dígito
  value = value.replace(/^(\d{2})(\d)/g, "($1) $2"); // Coloca parênteses em volta dos dois primeiros dígitos
  value = value.replace(/(\d)(\d{4})$/, "$1-$2"); // Coloca hífen entre o quarto e o quinto dígitos
  return value;
};

export const maskCEP = (value) => {
  if (!value) return "";
  value = value.replace(/\D/g, ""); // Remove tudo o que não é dígito
  value = value.replace(/^(\d{5})(\d)/, "$1-$2"); // Coloca hífen entre o quinto e o sexto dígitos
  return value;
};

export const maskCurrency = (value) => {
  if (!value) return "";
  // Remove everything that is not a digit
  let v = value.toString().replace(/\D/g, "");

  // If empty after removing non-digits, return empty
  if (v === "") return "";

  // Parse to float and divide by 100 to get decimals
  const numberValue = parseFloat(v) / 100;

  // Format to BRL
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numberValue);
};

export const unmaskCurrency = (value) => {
  if (!value) return 0;
  if (typeof value === "number") return value;

  // Remove everything except digits and comma
  const cleanValue = value.replace(/[^\d,]/g, "");
  // Replace comma with dot for parseFloat
  const floatValue = cleanValue.replace(",", ".");

  return parseFloat(floatValue) || 0;
};
