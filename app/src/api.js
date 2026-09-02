export const API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3011"
    : "https://api-indiqx-8ce7388cc7bf.herokuapp.com");

export function TOKEN_POST(body) {
  return {
    url: API_URL + "/login",
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  };
}

export function GET_USER(token) {
  return {
    url: API_URL + "/auth",
    options: {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  };
}

export function GET_USERS(token) {
  return {
    url: API_URL + "/user",
    options: {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  };
}

export function POST_USER(body, token) {
  return {
    url: API_URL + "/user",
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    },
  };
}

export function PUT_USER(id, body, token) {
  return {
    url: API_URL + `/user/${id}`,
    options: {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    },
  };
}

export function DELETE_USER(id, token) {
  return {
    url: API_URL + `/user/${id}`,
    options: {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  };
}

/** Monta a query string de paginacao/busca ignorando valores vazios. */
function queryPaginacao({ page, limit, search } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (search && search.trim()) params.set("search", search.trim());
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Lista paginada de clientes.
 * Retorna { data, total, page, limit, totalPages } — diferente de
 * GET_CLIENTES, que continua devolvendo o array completo para as telas
 * que agregam sobre toda a base (dashboard, relatorios, meus ganhos).
 */
export function GET_CLIENTES_PAGINADO(params, token) {
  return {
    url: API_URL + "/clientes" + queryPaginacao(params),
    options: {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  };
}

/** Lista paginada de usuarios. Mesma forma de resposta de GET_CLIENTES_PAGINADO. */
export function GET_USERS_PAGINADO(params, token) {
  return {
    url: API_URL + "/user" + queryPaginacao(params),
    options: {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  };
}

export function GET_CLIENTES(token) {
  return {
    url: API_URL + "/clientes",
    options: {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  };
}

export function POST_CLIENTE(body, token) {
  return {
    url: API_URL + "/clientes",
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    },
  };
}

export function GET_CONFIGURACOES(masterId, token) {
  return {
    url: API_URL + `/configuracoes/master/${masterId}`,
    options: {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  };
}

/** Dados publicos de exibicao da empresa (tela de cadastro de parceiro). */
export function GET_CONFIGURACAO_PUBLICA(masterId) {
  return {
    url: API_URL + `/configuracoes/publica/${masterId}`,
    options: { method: "GET" },
  };
}

export function POST_CONFIGURACAO(body, token) {
  return {
    url: API_URL + "/configuracoes",
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    },
  };
}

export function PUT_CONFIGURACAO(id, body, token) {
  return {
    url: API_URL + `/configuracoes/${id}`,
    options: {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    },
  };
}

export function PUT_CLIENTE(id, body, token) {
  return {
    url: API_URL + `/clientes/${id}`,
    options: {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    },
  };
}

export function DELETE_CLIENTE(id, token) {
  return {
    url: API_URL + `/clientes/${id}`,
    options: {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  };
}

export function GET_BONIFICACOES(token) {
  return {
    url: API_URL + "/bonificacoes",
    options: {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  };
}

export function POST_BONIFICACAO(body, token) {
  return {
    url: API_URL + "/bonificacoes",
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    },
  };
}

export function PUT_BONIFICACAO(id, body, token) {
  return {
    url: API_URL + `/bonificacoes/${id}`,
    options: {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    },
  };
}

export function DELETE_BONIFICACAO(id, token) {
  return {
    url: API_URL + `/bonificacoes/${id}`,
    options: {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  };
}
