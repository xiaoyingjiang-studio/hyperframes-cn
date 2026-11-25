import config from '../.cache/edge-site.json' with { type: 'json' };
import { routeRequest } from './routing.mjs';

export default {
  fetch(request, env) {
    return routeRequest(request, env, config);
  },
};
