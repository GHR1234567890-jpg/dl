export default {
  async fetch(request) {
    const SUPABASE_HOST = 'dscbqcqwxekijrhznqvz.supabase.co';
    const url = new URL(request.url);
    const target = 'https://' + SUPABASE_HOST + url.pathname + url.search;

    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    // 处理 WebSocket 升级请求（联机模式需要）
    const upgrade = request.headers.get('Upgrade');
    if (upgrade && upgrade.toLowerCase() === 'websocket') {
      const wsReq = new Request(wsTarget, request);
      wsReq.headers.set('Host', SUPABASE_HOST);
      return fetch(wsReq);
    }

    // 转发普通 HTTP 请求
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Host', SUPABASE_HOST);
    const resp = await fetch(target, {
      method: request.method,
      headers: newHeaders,
      body: (request.method === 'GET' || request.method === 'HEAD') ? null : request.body,
      redirect: 'manual',
    });

    const outHeaders = new Headers(resp.headers);
    outHeaders.set('Access-Control-Allow-Origin', '*');
    outHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
    outHeaders.set('Access-Control-Allow-Headers', '*');
    return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers: outHeaders });
  }
}
