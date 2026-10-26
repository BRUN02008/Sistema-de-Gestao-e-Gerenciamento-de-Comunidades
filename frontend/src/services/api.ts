const API_URL = 'https://gestao-comunidades-api.onrender.com/api';

async function renovarToken(): Promise<string | null> {
  const refresh = sessionStorage.getItem('sisgest_refresh');

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

    sessionStorage.setItem(
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


async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  tentarRenovar = true
): Promise<T> {

  const token = sessionStorage.getItem(
    'sisgest_access'
  );

  const headers = new Headers(
    options.headers
  );

  /*
   * ============================================================
   * CONTENT-TYPE
   * ============================================================
   *
   * Se o body for FormData, NÃO definimos Content-Type.
   *
   * O navegador precisa definir automaticamente:
   *
   * multipart/form-data; boundary=...
   *
   * Caso contrário, usamos JSON normalmente.
   */

  if (!(options.body instanceof FormData)) {
    headers.set(
      'Content-Type',
      'application/json'
    );
  } else {
    headers.delete('Content-Type');
  }


  /*
   * ============================================================
   * AUTENTICAÇÃO
   * ============================================================
   */

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

      headers.set(
        'Authorization',
        `Bearer ${novoToken}`
      );

      response = await fetch(
        `${API_URL}${endpoint}`,
        {
          ...options,
          headers,
        }
      );

    } else {

      sessionStorage.removeItem(
        'sisgest_access'
      );

      sessionStorage.removeItem(
        'sisgest_refresh'
      );

      sessionStorage.removeItem(
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

  let data: unknown;

  try {
    data = text ? JSON.parse(text) : null;
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

    let mensagem =
      'Erro ao comunicar com o servidor.';

    if (
      typeof data === 'object' &&
      data !== null
    ) {

      const erro = data as {
        detail?: string;
        error?: string;
      };

      mensagem =
        erro.detail ||
        erro.error ||
        JSON.stringify(data);

    } else if (
      typeof data === 'string'
    ) {

      mensagem = data;
    }

    throw new Error(mensagem);
  }

  return data as T;
}

async function obterArquivoDocumento(documentId: string): Promise<{ blob: Blob; filename: string }> {
  const url = `${API_URL}/documentos/${encodeURIComponent(documentId)}/arquivo/`;
  let token = sessionStorage.getItem('sisgest_access');
  const request = () => fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  let response = await request();
  if (response.status === 401) {
    token = await renovarToken();
    if (token) response = await request();
  }
  if (!response.ok) {
    let detail = '';
    try {
      const error = await response.json() as { detail?: string };
      detail = error.detail ?? '';
    } catch { /* Resposta sem JSON. */ }
    throw new Error(detail || (response.status === 404 ? 'O arquivo deste documento não foi encontrado.' : 'Não foi possível acessar o documento. Verifique seu acesso e tente novamente.'));
  }

  const disposition = response.headers.get('Content-Disposition') ?? '';
  const encodedName = /filename\*=UTF-8''([^;]+)/i.exec(disposition)?.[1];
  const regularName = /filename="?([^";]+)"?/i.exec(disposition)?.[1];
  let responseName = regularName;
  if (encodedName) {
    try { responseName = decodeURIComponent(encodedName); } catch { responseName = encodedName; }
  }
  return { blob: await response.blob(), filename: responseName || 'documento' };
}

async function baixarDocumento(documentId: string, fallbackName: string): Promise<void> {
  const { blob, filename } = await obterArquivoDocumento(documentId);
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename === 'documento' ? fallbackName || filename : filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}


/*
 * ============================================================
 * API
 * ============================================================
 */

export const api = {

  getDocumentBlob: obterArquivoDocumento,
  download: baixarDocumento,

  get: (
    endpoint: string
  ) =>
    apiFetch(endpoint),


  post: (
    endpoint: string,
    body: unknown | FormData
  ) =>
    apiFetch(
      endpoint,
      {
        method: 'POST',

        body:
          body instanceof FormData
            ? body
            : JSON.stringify(body),
      }
    ),


  put: (
    endpoint: string,
    body: unknown | FormData
  ) =>
    apiFetch(
      endpoint,
      {
        method: 'PUT',

        body:
          body instanceof FormData
            ? body
            : JSON.stringify(body),
      }
    ),


  patch: (
    endpoint: string,
    body: unknown | FormData
  ) =>
    apiFetch(
      endpoint,
      {
        method: 'PATCH',

        body:
          body instanceof FormData
            ? body
            : JSON.stringify(body),
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
