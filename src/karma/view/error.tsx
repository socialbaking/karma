import { FastifyReply, FastifyRequest } from "fastify";
import { renderToStaticMarkup } from "react-dom/server";
import KarmaServer from "../react/server";
import { getOrigin } from "../listen/config";
import { getMaybeUser, getUser, isAnonymous } from "../authentication";
import { isHTMLResponse } from "../listen/authentication";
import {getView} from "./views";

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

  const { DEFAULT_TIMEZONE = "Pacific/Auckland" } = process.env;
  const origin = getOrigin()

  const html = renderToStaticMarkup(
    <KarmaServer
      view={getView("/error")}
      isFragment={isFragment}
      isAnonymous={anonymous}
      url={new URL(request.url, origin).toString()}
      error={error}
      products={[]}
      organisations={[]}
      partners={[]}
      categories={[]}
      metrics={[]}
      user={user}
      origin={origin}
      timezone={DEFAULT_TIMEZONE}
      isAuthenticatedTrusted={!!process.env.AUTHENTICATED_IS_TRUSTED}
    />
  );

  response.header("Cache-Control", "No-Store");
  response.header("Content-Type", "text/html; charset=utf-8");
  response.header("Cross-Origin-Embedder-Policy", "unsafe-none");
  response.send(html);
}
