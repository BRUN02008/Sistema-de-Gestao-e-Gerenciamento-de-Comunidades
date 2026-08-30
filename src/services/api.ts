const API_URL = 'http://127.0.0.1:8000/api';

async function renovarToken(): Promise<string | null> {
  const refresh = localStorage.getItem('sisgest_refresh');

  if (!refresh) {
    return null;
  }

  try {
    const response = await fetch(
      `${API_URL}/auth/token/refresh/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.access) {
      console.error(
        'Não foi possível renovar o token:',
        data
      );

      return null;
    }

    localStorage.setItem(
      'sisgest_access',
      data.access
    );

    console.log(
      'ACCESS TOKEN RENOVADO COM SUCESSO'
    );

    return data.access;

  } catch (error) {
    console.error(
      'Erro ao renovar token:',
      error
    );

    return null;
  }
}


async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  tentarRenovar = true
) {
  let token = localStorage.getItem(
    'sisgest_access'
  );

  const headers = new Headers(
    options.headers
  );

  headers.set(
    'Content-Type',
    'application/json'
  );

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`
    );
  }

  let response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );


  /*
   * ============================================================
   * TOKEN EXPIRADO
   * ============================================================
   */

  if (
    response.status === 401 &&
    tentarRenovar
  ) {

    console.log(
      'Access token expirado. Tentando renovar...'
    );

    const novoToken =
      await renovarToken();

    if (novoToken) {

      /*
       * Atualiza o Authorization
       * com o novo token.
       */

      headers.set(
        'Authorization',
        `Bearer ${novoToken}`
      );

      /*
       * Repete a requisição original.
       */

      response = await fetch(
        `${API_URL}${endpoint}`,
        {
          ...options,
          headers,
        }
      );

    } else {

      /*
       * O refresh também não funcionou.
       * Nesse caso a sessão realmente terminou.
       */

      localStorage.removeItem(
        'sisgest_access'
      );

      localStorage.removeItem(
        'sisgest_refresh'
      );

      localStorage.removeItem(
        'sisgest_user'
      );
    }
  }


  /*
   * ============================================================
   * PROCESSAMENTO DA RESPOSTA
   * ============================================================
   */

  const text = await response.text();

  let data: any = null;

  try {
    data = text
      ? JSON.parse(text)
      : null;
  } catch {
    data = text;
  }


  /*
   * ============================================================
   * ERROS
   * ============================================================
   */

  if (!response.ok) {

    console.error(
      'ERRO COMPLETO DA API:',
      data
    );

    throw new Error(
      data?.detail ||
      data?.error ||
      (
        typeof data === 'object'
          ? JSON.stringify(data)
          : data
      ) ||
      'Erro ao comunicar com o servidor.'
    );
  }

  return data;
}


/*
 * ============================================================
 * API
 * ============================================================
 */

export const api = {

  get: (
    endpoint: string
  ) =>
    apiFetch(endpoint),

  post: (
    endpoint: string,
    body: unknown
  ) =>
    apiFetch(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    ),

  put: (
    endpoint: string,
    body: unknown
  ) =>
    apiFetch(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      }
    ),

  patch: (
    endpoint: string,
    body: unknown
  ) =>
    apiFetch(
      endpoint,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      }
    ),

  delete: (
    endpoint: string
  ) =>
    apiFetch(
      endpoint,
      {
        method: 'DELETE',
      }
    ),
};