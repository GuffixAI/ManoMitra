// role.middleware.js
export const requireRole = (roles) => (req, res, next) => {
  if (!req.user?.role || !roles.includes(req.user.role)) {
    return res.status(403).json({ success:false, message:"Forbidden: insufficient role" });
  }
  next();
};
