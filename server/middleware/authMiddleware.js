const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Normalize role variants so authorization works regardless of
 * how the role was stored (e.g. 'group_leader' vs 'groupleader').
 */
function normalizeRole(role) {
  if (!role) return role;
  const map = {
    'group_leader': 'group_leader',
    'special_advicer': 'special_advicer',
    'official_member': 'official_member',
  };
  return map[role] || role;
}

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      // Update lastSeen asynchronously to not block request
      User.findByIdAndUpdate(req.user._id, { lastSeen: new Date() }).catch(err => console.error('LastSeen update failed', err));

      next();
    } catch (error) {
      console.error('[AUTH]', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

/**
 * Authorize based on roles. Accepts multiple role arguments.
 * super_admin bypasses all restrictions.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    // super_admin bypasses all role checks
    if (userRole === 'super_admin') return next();

    if (!roles.includes(userRole)) {
      res.status(403);
      throw new Error(
        `Access denied. Role "${req.user.role}" is not authorized for this action.`
      );
    }
    next();
  };
};

module.exports = { protect, authorize, normalizeRole };
