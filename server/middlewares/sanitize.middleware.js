import sanitizeHtml from "sanitize-html";

// On-demand sanitizer for specific fields:
export const sanitizeBodyField = (field) => (req, res, next) => {
  if (req.body?.[field]) {
    req.body[field] = sanitizeHtml(req.body[field], { allowedTags: [], allowedAttributes: {} });
  }
  next();
};
