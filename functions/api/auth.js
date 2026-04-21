/**
 * Cloudflare Pages Function — GitHub OAuth initiation
 * Route: /api/auth
 *
 * Required environment variables (set in Cloudflare Pages dashboard):
 *   GITHUB_CLIENT_ID      — from your GitHub OAuth App
 *   GITHUB_CLIENT_SECRET  — from your GitHub OAuth App
 */
export async function onRequestGet(context) {
  const { env, request } = context;

  if (!env.GITHUB_CLIENT_ID) {
    return new Response("GITHUB_CLIENT_ID environment variable is not set.", {
      status: 500,
    });
  }

  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;

  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    scope: "repo,user",
    redirect_uri: `${origin}/api/callback`,
  });

  return Response.redirect(
    `https://github.com/login/oauth/authorize?${params}`,
    302
  );
}
