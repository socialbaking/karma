import { FastifyReply, FastifyRequest } from "fastify";
import { renderToStaticMarkup } from "react-dom/server";
import KarmaServer from "../react/server";
import { getOrigin } from "../listen/config";
import { getMaybeUser, getUser, isAnonymous } from "../authentication";
import { isHTMLResponse } from "../listen/authentication";

export function errorHandler(
  error: Error,
  request: FastifyRequest,
  response: FastifyReply
) {
  if (!isHTMLResponse(request)) {
    return response.send(error);
  }

  const { pathname } = new URL(request.url, getOrigin());
  const isFragment = pathname.endsWith("/fragment");
  const anonymous = isAnonymous();
  const user = getMaybeUser();

  console.error(error);

  const html = renderToStaticMarkup(
    <KarmaServer
      isFragment={isFragment}
      isAnonymous={anonymous}
      url="/error"
      error={error}
      products={[]}
      organisations={[]}
      partners={[]}
      categories={[]}
      metrics={[]}
      user={user}
      isAuthenticatedTrusted={!!process.env.AUTHENTICATED_IS_TRUSTED}
    />
  );

  response.header("Cache-Control", "No-Store");
  response.header("Content-Type", "text/html; charset=utf-8");
  response.header("Cross-Origin-Embedder-Policy", "unsafe-none");
  response.send(html);
}
