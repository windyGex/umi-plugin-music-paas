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

const modifyRoute = routes => {
  return routes.map(route => {
    if (route.path.startsWith('/')) {
      route.path = `${getBasename()}${route.path.replace(/^\//, '')}`;
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