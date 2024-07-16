import { Router } from 'express';

import PollRoute from './poll.route';
import UserRoute from './user.route';
import CategoryRoute from './category.route';

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
  {
    path: '/user',
    route: UserRoute,
  },
  {
    path: '/category',
    route: CategoryRoute,
  },
];

defaultIRoute.forEach((route: IRoute) => {
  router.use(route.path, route.route);
});

export default router;
