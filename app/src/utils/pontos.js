// pontos.js
// Regras de pontuação e comissão em um único lugar.
// A fórmula estava duplicada em Dashboard, MeusGanhos e Relatorios — três
// cópias que podiam divergir a cada ajuste.
// Localização: src/utils/pontos.js

/** Valores usados quando a empresa ainda não tem configuração salva. */
export const CONFIG_PADRAO = {
  pontosPorNovoUsuario: 1,
  pontosPorReal: 1,
  comissaoPorVenda: 5,
};

/**
 * Normaliza a configuração vinda da API, que pode chegar em camelCase
 * (entidade TypeORM) ou snake_case (consultas legadas).
 */
export function normalizarConfiguracao(config) {
  if (!config) return { ...CONFIG_PADRAO };

  const numero = (valor, padrao) => {
    const n = Number(valor);
    return Number.isFinite(n) ? n : padrao;
  };

  return {
    pontosPorNovoUsuario: numero(
      config.pontosPorNovoUsuario ?? config.pontos_por_novo_usuario,
      CONFIG_PADRAO.pontosPorNovoUsuario,
    ),
    pontosPorReal: numero(
      config.pontosPorReal ?? config.pontos_por_real,
      CONFIG_PADRAO.pontosPorReal,
    ),
    comissaoPorVenda: numero(
      config.comissaoPorVenda ?? config.comissao_por_venda,
      CONFIG_PADRAO.comissaoPorVenda,
    ),
  };
}

export const STATUS_FECHADO = "Contrato fechado";
export const STATUS_PERDIDO = "Contrato perdido";

export function isContratoFechado(cliente) {
  return cliente?.status === STATUS_FECHADO;
}

/**
 * Data em que o contrato foi fechado.
 * `data_fechamento` é gravada pelo servidor na transição de status; os
 * fallbacks cobrem registros anteriores à migration.
 */
export function dataDeFechamento(cliente) {
  const bruta =
    cliente?.data_fechamento || cliente?.updated_at || cliente?.created_at;
  return bruta ? new Date(bruta) : null;
}

export function mesmoMes(data, referencia = new Date()) {
  if (!data || Number.isNaN(data.getTime())) return false;
  return (
    data.getMonth() === referencia.getMonth() &&
    data.getFullYear() === referencia.getFullYear()
  );
}

export function faturamentoDe(clientes) {
  return clientes
    .filter(isContratoFechado)
    .reduce((total, c) => total + Number(c.valor_contrato || 0), 0);
}

/**
 * Pontuação de um conjunto de clientes.
 *
 * pontos = (nº de indicações × pontosPorNovoUsuario)
 *        + (faturamento fechado × pontosPorReal)
 */
export function calcularPontos(clientes, config) {
  const { pontosPorNovoUsuario, pontosPorReal } = normalizarConfiguracao(config);

  const pontosPorIndicacao = clientes.length * pontosPorNovoUsuario;
  const pontosPorFaturamento = Math.floor(
    faturamentoDe(clientes) * pontosPorReal,
  );

  return pontosPorIndicacao + pontosPorFaturamento;
}

export function calcularComissao(faturamento, config) {
  const { comissaoPorVenda } = normalizarConfiguracao(config);
  return faturamento * (comissaoPorVenda / 100);
}

/** Id do parceiro dono do cliente, seja embutido na relação ou solto. */
export function corretorIdDe(cliente) {
  return cliente?.corretor?.id ?? cliente?.corretor_id ?? null;
}

export function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor) || 0);
}

export function formatarPontos(valor) {
  return new Intl.NumberFormat("pt-BR").format(Number(valor) || 0);
}
