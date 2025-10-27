// js/api.js
// Ajuste para a URL da sua API Django (sem barra final)
const API_URL = 'http://127.0.0.1:8000/xlsxconversor'; // <-- ajuste aqui

/**
 * apiRequest
 * Faz requisições à API. Suporta JSON e FormData (upload com progresso).
 *
 * @param {string} endpoint - Ex: '/login/' ou '/envio/'
 * @param {string} method - 'GET' | 'POST' | ...
 * @param {Object|FormData|null} body - Payload. Use FormData para upload de arquivos.
 * @param {boolean} isForm - true se estiver enviando FormData (não define Content-Type)
 * @param {function(number):void|null} onProgress - callback(pct) para uploads (0-100)
 * @returns {Promise<any>} - resultado parseado (JSON ou texto)
 */
async function apiRequest(endpoint, method = 'GET', body = null, isForm = false, onProgress = null) {
  const token = localStorage.getItem('token') || null;
  const url = `${API_URL}${endpoint}`;

  // Se for upload com progresso e FormData: usa XMLHttpRequest para poder reportar progresso
  if (isForm && body instanceof FormData && typeof onProgress === 'function') {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);

      // Cabeçalhos (não setar Content-Type para FormData)
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          try { onProgress(pct); } catch (err) { /* não interrompe */ }
        }
      };

      xhr.onload = () => {
        const ct = xhr.getResponseHeader('Content-Type') || '';
        const text = xhr.responseText;
        if (xhr.status >= 200 && xhr.status < 300) {
          if (ct.includes('application/json')) {
            try { resolve(JSON.parse(text)); } catch (err) { resolve(text); }
          } else {
            resolve(text);
          }
        } else {
          // tenta extrair json / texto de erro
          try {
            const parsed = JSON.parse(text || '{}');
            reject(parsed);
          } catch (err) {
            reject({ status: xhr.status, detail: text });
          }
        }
      };

      xhr.onerror = () => reject({ detail: 'Erro de rede' });
      xhr.ontimeout = () => reject({ detail: 'Tempo esgotado' });

      xhr.send(body);
    });
  }

  // Caso normal — usa fetch
  const headers = {};

  if (!isForm) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };

  if (body) {
    options.body = isForm ? body : JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    const text = await res.text().catch(() => null);

    if (!res.ok) {
      // tenta retornar JSON ao invés de lançar erro crú
      try {
        const parsed = contentType.includes('application/json') ? JSON.parse(text || '{}') : { detail: text || `HTTP ${res.status}` };
        return parsed; // para compatibilidade com o restante do código que espera objeto de erro
      } catch (err) {
        return { detail: text || `HTTP ${res.status}` };
      }
    }

    // sucesso
    if (contentType.includes('application/json')) {
      try { return JSON.parse(text || '{}'); } catch (err) { return text; }
    }
    return text;
  } catch (err) {
    // erro de rede
    return { detail: err.message || 'Erro de requisição' };
  }
}

/**
 * Helper: montar query params (opcional)
 * Exemplo: buildQuery({ a:1, b: 'x y' }) -> "?a=1&b=x%20y"
 */
function buildQuery(params) {
  if (!params) return '';
  const entries = Object.entries(params).filter(([k, v]) => v !== undefined && v !== null);
  if (!entries.length) return '';
  return '?' + entries.map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(String(v))).join('&');
}

// Exporta para uso global (scripts antigos do projeto usam apiRequest diretamente)
window.apiRequest = apiRequest;
window.API_URL = API_URL;
window.buildQuery = buildQuery;