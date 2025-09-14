// FILE: server/middlewares/sanitize.middleware.js
import sanitizeHtml from "sanitize-html";

const sanitize = (dirty) => {
  // This function remains the same. It strips all HTML.
  return sanitizeHtml(dirty, {
    allowedTags: [],
    allowedAttributes: {},
  });
};

export const sanitizeRequest = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string' && !key.toLowerCase().includes('password')) {
        req.body[key] = sanitize(req.body[key]);
      }
    }
  }
  next();
};