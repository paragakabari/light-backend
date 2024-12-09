const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const productRoute = require('./product.route');
const cartRoute = require('./cart.route');
const contactRoute = require('./contact.route');
const categoryRoute = require('./category.route');
const branchRoute = require('./branch.route');
const accessRoute = require('./access.route');
const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/products',
    route: productRoute,
  },
  {
    path: '/carts',
    route: cartRoute,
  },
  {
    path:'/contact',
    route:contactRoute
  },
  {
    path: '/categories',
    route: categoryRoute,
  },
  {
    path: '/branches',
    route: branchRoute,
  },
  {
    path: '/access',
    route: accessRoute,
  }
];


defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});


module.exports = router;
