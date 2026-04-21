/**
 * Cloudflare Pages Function — GitHub OAuth callback
 * Route: /api/callback
 *
 * Exchanges the OAuth code for an access token and passes it back to
 * the Decap CMS window via postMessage.
 */
export async function onRequestGet(context) {
  const { env, request } = context;

  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Missing OAuth code parameter.", { status: 400 });
  }

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return new Response("GitHub OAuth environment variables are not set.", {
      status: 500,
    });
  }

  // Exchange code for access token
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    }
  );

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return new Response(
      `GitHub OAuth error: ${tokenData.error_description || tokenData.error}`,
      { status: 400 }
    );
  }

  // Return an HTML page that posts the token back to the Decap CMS opener window
  // Pattern matches the standard Decap CMS OAuth callback (ref: i40west/netlify-cms-cloudflare-pages)
  const token = tokenData.access_token;

  const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>Authenticating…</title></head>
  <body>
    <p>Authentication successful. You can close this window.</p>
    <script>
      const receiveMessage = (message) => {
        window.opener.postMessage(
          'authorization:github:success:{"token":"${token}","provider":"github"}',
          message.origin
        );
        window.removeEventListener("message", receiveMessage, false);
      };
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "*");
    </script>
  </body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
