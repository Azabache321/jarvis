import { createHash, timingSafeEqual } from 'node:crypto';

const ACCESS_HASH = 'e7003517f04f8ed93c6b610b5ee3697a1bf9d648b5cc0d8fd6d63c63d1b74618';
const MODEL_PATTERN = /^(gpt-(4o|4\.1|5|6)|o[134])(?:[.-]|$)/;
const EXCLUDED = /audio|realtime|image|search|transcribe|tts|codex|pro|deep-research/;
const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
const error = (message, status) => json({ error: { message } }, status);
let cachedModels;
let cachedAt = 0;
export default async function handler(request) {
  const path = new URL(request.url).pathname;
  if (path === '/health') return json({ status: 'ok', mode: 'openai-chat' });
  const token = (request.headers.get('authorization') || '').replace(/^Bearer /, '');
  const digest = createHash('sha256').update(token).digest();
  if (!timingSafeEqual(digest, Buffer.from(ACCESS_HASH, 'hex'))) {
    return error('Unlock Jarvis in Settings → Connection → API key with your Jarvis access token.', 401);
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key) return error('OPENAI_API_KEY is missing from Netlify production Functions environment.', 503);
  const upstreamHeaders = { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
  try {
    async function models() {
      if (cachedModels && Date.now() - cachedAt < 60000) return cachedModels;
      const response = await fetch('https://api.openai.com/v1/models', { headers: upstreamHeaders, signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw Object.assign(new Error(response.status === 401 ? 'OpenAI rejected the saved API key.' : 'OpenAI model discovery failed (' + response.status + '). Check API project access.'), { status: response.status });
      const data = await response.json();
      cachedModels = (data.data || []).filter(m => MODEL_PATTERN.test(m.id) && !EXCLUDED.test(m.id)).map(m => ({ ...m, owned_by: 'openai' })).sort((a,b) => a.id.localeCompare(b.id));
      cachedAt = Date.now();
      return cachedModels;
    }
    if (request.method === 'GET' && path === '/v1/models') return json({ object: 'list', data: await models() });
    if (request.method === 'GET' && path === '/v1/info') return json({ engine: 'OpenAI via Netlify', model: 'Select an OpenAI model', agent: null });
    if (request.method === 'POST' && path === '/v1/chat/completions') {
      const raw = await request.text();
      if (raw.length > 64000) return error('Conversation is too long. Start a new chat.', 413);
      let body; try { body = JSON.parse(raw); } catch { return error('Invalid JSON.', 400); }
      if (!(await models()).some(m => m.id === body.model)) return error('Select an available OpenAI chat model.', 400);
      if (!Array.isArray(body.messages) || !body.messages.length || body.messages.length > 80 ||
          body.messages.some(m => !['user','assistant','system'].includes(m.role) || typeof m.content !== 'string')) return error('Invalid chat messages.', 400);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: upstreamHeaders,
        body: JSON.stringify({ model: body.model, messages: body.messages.map(({role,content}) => ({role,content})), stream: true, stream_options: { include_usage: true }, max_completion_tokens: Math.min(Math.max(Number(body.max_tokens) || 2048, 16), 4096) }),
        signal: AbortSignal.timeout(55000),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const code = data.error?.code;
        const message = response.status === 401 ? 'OpenAI rejected the saved API key.' :
          code === 'insufficient_quota' ? 'OpenAI API quota is exhausted. Add API billing credits to your OpenAI project.' :
          response.status === 429 ? String(data.error?.message || 'OpenAI rate limit reached. Please retry shortly.').replaceAll(key, '[redacted]') :
          'OpenAI could not complete this request (' + response.status + '). Try another model.';
        return error(message, response.status);
      }
      return new Response(response.body, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' } });
    }
    return error('This feature requires the full OpenJarvis Python backend. This deployment supports OpenAI chat and model selection.', 501);
  } catch (e) {
    return error(e.status ? e.message : 'OpenAI connection timed out or failed. Please retry.', e.status || 502);
  }
}
export const config = { path: ['/v1/*', '/api/*', '/health'] };
