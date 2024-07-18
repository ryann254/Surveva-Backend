import { Router } from 'express';

import PollRoute from './poll.routes';
import UserRoute from './user.routes';
import CategoryRoute from './category.routes';
import AuthRoute from './auth.routes';

interface IRoute {
  path: string;
  route: Router;
}

const router = Router();

const defaultIRoute: IRoute[] = [
  {
    path: '/auth',
    route: AuthRoute,
  },
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
