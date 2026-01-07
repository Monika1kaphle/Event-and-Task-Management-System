function authorizeRoles(...allowed) {
  return (req, res, next) => {
    const role = req.user && req.user.role;
    if (!role) return res.status(401).json({ error: 'Unauthorized' });
    if (!allowed.includes(role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

module.exports = { authorizeRoles };
