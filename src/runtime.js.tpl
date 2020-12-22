import {
  isInIcestark,
  getMountNode,
  getBasename,
} from '@ice/stark-app';

export function modifyClientRenderOpts(oldOpts) {
  if (isInIcestark()) {
    oldOpts.rootElement = getMountNode();
  }
  return oldOpts;
}

let basename = getBasename().replace(/\/$/, '');
const modifyRoute = routes => {
  return routes.map(route => {
    if (route.path.startsWith('/')) {
      route.path = `${basename}${route.path}`;
    }
    if (route.routes) {
      route.routes = modifyRoute(route.routes);
    }
    return route;
  });
};

export function patchRoutes({ routes }) {
  modifyRoute(routes);
}