const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Normalize role variants so authorization works regardless of
 * how the role was stored (e.g. 'group_leader' vs 'groupleader').
 */
function normalizeRole(role) {
  if (!role) return role;
  const map = {
    'groupleader': 'groupleader',
    'group_leader': 'groupleader',
    'official-member': 'official_member',
    'official_member': 'official_member',
    'special-advisor': 'special_advisor',
    'special_advisor': 'special_advisor',
    'meeting-organizer': 'meeting_organizer',
    'meeting_organizer': 'meeting_organizer',
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

      // Normalize role on the request object for consistent authorization
      req.user.role = normalizeRole(req.user.role);

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
 * super_admin and admin bypass all restrictions.
 * Normalizes role variants before comparison.
 */
const authorize = (...roles) => {
  // Normalize all provided roles for comparison
  const normalizedAllowed = roles.map(normalizeRole);

  return (req, res, next) => {
    const userRole = normalizeRole(req.user?.role);

    // super_admin and admin bypass all role checks
    if (userRole === 'super_admin' || userRole === 'admin') return next();

    if (!normalizedAllowed.includes(userRole)) {
      res.status(403);
      throw new Error(
        `Access denied. Role "${req.user.role}" is not authorized for this action.`
      );
    }
    next();
  };
};

module.exports = { protect, authorize, normalizeRole };
