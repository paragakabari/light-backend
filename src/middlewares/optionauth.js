const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate111'));
  }
  req.user = user;

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

const oauth = (...requiredRights) => async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err || !user) {
          // If there's an error or no user, resolve the promise but don't block access
          req.user = null;  // No user is authenticated
          return resolve();  // Continue the request
        }
  
        req.user = user;  // Attach the authenticated user to the request object
        resolve();
      })(req, res, next);
    })
      .then(() => next())
     
  };

module.exports = oauth;
