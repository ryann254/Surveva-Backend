import { Router } from 'express';

import PollRoute from './poll.route';

interface IRoute {
  path: string;
  route: Router;
}

const router = Router();

const defaultIRoute: IRoute[] = [
  {
    path: '/poll',
    route: PollRoute,
  },
];

defaultIRoute.forEach((route: IRoute) => {
  router.use(route.path, route.route);
});

export default router;
