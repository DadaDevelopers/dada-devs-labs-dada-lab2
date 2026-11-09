import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_REQUEST_HEADERS = [
  'accept',
  'authorization',
  'content-type',
] as const;

const FORWARDED_RESPONSE_HEADERS = [
  'cache-control',
  'content-disposition',
  'content-type',
] as const;

const proxyRequest = async (
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) => {
  const apiBaseUrl = process.env.CHAMAVAULT_API_BASE_URL?.replace(/\/$/, '');
  if (!apiBaseUrl) {
    return Response.json(
      { message: 'The ChamaVault API is not configured.' },
      { status: 500 }
    );
  }

  const { path } = await context.params;
  const upstreamUrl = new URL(`${apiBaseUrl}/${path.map(encodeURIComponent).join('/')}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.append(key, value);
  });

  // The wallet provider is a private backend credential. Client-supplied
  // provider values are discarded and the server injects the configured one
  // only for GET /wallets/{ownerReference}.
  upstreamUrl.searchParams.delete('provider');
  const isOwnerWalletList =
    request.method === 'GET' && path.length === 2 && path[0] === 'wallets';
  if (isOwnerWalletList) {
    const walletProvider = process.env.CHAMAVAULT_WALLET_PROVIDER;
    if (!walletProvider) {
      return Response.json(
        { message: 'The wallet provider is not configured.' },
        { status: 500 }
      );
    }
    upstreamUrl.searchParams.set('provider', walletProvider);
  }

  const headers = new Headers();
  ALLOWED_REQUEST_HEADERS.forEach(header => {
    const value = request.headers.get(header);
    if (value) headers.set(header, value);
  });

  const hasBody = !['GET', 'HEAD'].includes(request.method);

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
      redirect: 'manual',
    });

    const responseHeaders = new Headers();
    FORWARDED_RESPONSE_HEADERS.forEach(header => {
      const value = upstreamResponse.headers.get(header);
      if (value) responseHeaders.set(header, value);
    });

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      { message: 'Unable to connect to the ChamaVault service.' },
      { status: 502 }
    );
  }
};

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
