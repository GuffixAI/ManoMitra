// FILE: server/middlewares/sanitize.middleware.js
import sanitizeHtml from "sanitize-html";

// Define a list of keys that should NOT be sanitized.
const EXCLUDED_KEYS = ['password', 'confirmPassword', 'currentPassword'];

const sanitize = (dirty) => {
  // This function strips all HTML.
  return sanitizeHtml(dirty, {
    allowedTags: [],
    allowedAttributes: {},
  });
};

export const sanitizeRequest = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      // Check if the key is in our exclusion list.
      if (typeof req.body[key] === 'string' && !EXCLUDED_KEYS.includes(key)) {
        req.body[key] = sanitize(req.body[key]);
      }
    }
  }
  // We don't typically need to sanitize req.query or req.params in the same way,
  // as they are handled differently by database drivers (e.g., parameter binding in Mongoose).
  next();
};