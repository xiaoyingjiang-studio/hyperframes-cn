export async function routeRequest(request, env, config) {
  const url = new URL(request.url);
  if (config.indexable && config.oldHost && url.hostname === config.oldHost) {
    const target = new URL(config.site);
    target.pathname = url.pathname;
    target.search = url.search;
    return Response.redirect(target.href, 301);
  }
  return env.ASSETS.fetch(request);
}
