import morgan from "morgan";
import fs from "fs";
import path from "path";

// Custom token for request body (for POST/PUT requests)
morgan.token("body", (req) => {
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    return JSON.stringify(req.body);
  }
  return "";
});

// Custom token for response time in milliseconds
morgan.token("response-time-ms", (req, res) => {
  if (!res._header || !req._startAt) return "";
  const diff = process.hrtime(req._startAt);
  const ms = Math.round((diff[0] * 1e3 + diff[1] * 1e-6) * 100) / 100;
  return `${ms}ms`;
});

// Custom token for user info
morgan.token("user", (req) => {
  if (req.user) {
    return `${req.user.id}(${req.user.role})`;
  }
  return "anonymous";
});

// Custom token for IP address
morgan.token("ip", (req) => {
  return req.ip || req.connection.remoteAddress || req.headers["x-forwarded-for"] || "unknown";
});

// Custom token for user agent
morgan.token("user-agent", (req) => {
  return req.get("User-Agent") || "unknown";
});

// Custom token for referrer
morgan.token("referrer", (req) => {
  return req.get("Referrer") || "direct";
});

// Custom token for request size
morgan.token("req-size", (req) => {
  const size = req.get("Content-Length");
  return size ? `${size}B` : "unknown";
});

// Custom token for response size
morgan.token("res-size", (req, res) => {
  const size = res.get("Content-Length");
  return size ? `${size}B` : "unknown";
});

// Custom token for status with color
morgan.token("status-colored", (req, res) => {
  const status = res.statusCode;
  let color = "\x1b[0m"; // Reset
  
  if (status >= 500) color = "\x1b[31m"; // Red
  else if (status >= 400) color = "\x1b[33m"; // Yellow
  else if (status >= 300) color = "\x1b[36m"; // Cyan
  else if (status >= 200) color = "\x1b[32m"; // Green
  
  return `${color}${status}\x1b[0m`;
});

// Development format (colored, detailed)
const devFormat = ":method :url :status-colored :response-time-ms - :user - :ip - :user-agent";

// Production format (minimal, structured)
const prodFormat = JSON.stringify({
  timestamp: ":date[iso]",
  method: ":method",
  url: ":url",
  status: ":status",
  responseTime: ":response-time-ms",
  user: ":user",
  ip: ":ip",
  userAgent: ":user-agent",
  referrer: ":referrer",
  reqSize: ":req-size",
  resSize: ":res-size"
});

// Error format (detailed for debugging)
const errorFormat = JSON.stringify({
  timestamp: ":date[iso]",
  method: ":method",
  url: ":url",
  status: ":status",
  responseTime: ":response-time-ms",
  user: ":user",
  ip: ":ip",
  userAgent: ":user-agent",
  body: ":body",
  error: true
});

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create write streams for different log types
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, "access.log"),
  { flags: "a" }
);

const errorLogStream = fs.createWriteStream(
  path.join(logsDir, "error.log"),
  { flags: "a" }
);

const combinedLogStream = fs.createWriteStream(
  path.join(logsDir, "combined.log"),
  { flags: "a" }
);

// Skip logging for health checks and static files
const skipLogging = (req, res) => {
  return req.url === "/health" || 
         req.url.startsWith("/static/") || 
         req.url.startsWith("/favicon.ico");
};

// Development logging middleware
export const devLogging = morgan(devFormat, {
  skip: skipLogging,
  stream: process.stdout
});

// Production logging middleware
export const prodLogging = morgan(prodFormat, {
  skip: skipLogging,
  stream: accessLogStream
});

// Error logging middleware (only for error responses)
export const errorLogging = morgan(errorFormat, {
  skip: (req, res) => skipLogging(req, res) || res.statusCode < 400,
  stream: errorLogStream
});

// Combined logging middleware (all requests)
export const combinedLogging = morgan("combined", {
  skip: skipLogging,
  stream: combinedLogStream
});

// Request timing middleware
export const requestTiming = (req, res, next) => {
  req._startAt = process.hrtime();
  next();
};

// Request ID middleware
export const requestId = (req, res, next) => {
  req.id = req.headers["x-request-id"] || 
           req.headers["x-correlation-id"] || 
           `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  res.setHeader("x-request-id", req.id);
  next();
};

// Request context middleware
export const requestContext = (req, res, next) => {
  req.context = {
    id: req.id,
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress || req.headers["x-forwarded-for"],
    userAgent: req.get("User-Agent"),
    referrer: req.get("Referrer"),
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    query: req.query,
    body: req.method !== "GET" ? req.body : undefined,
    headers: {
      "content-type": req.get("Content-Type"),
      "accept": req.get("Accept"),
      "authorization": req.get("Authorization") ? "Bearer ***" : undefined
    }
  };
  
  next();
};

// Response logging middleware
export const responseLogging = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log response details
    const responseInfo = {
      requestId: req.id,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: req._startAt ? 
        Math.round((process.hrtime(req._startAt)[0] * 1e3 + process.hrtime(req._startAt)[1] * 1e-6) * 100) / 100 : 
        undefined,
      user: req.user ? `${req.user.id}(${req.user.role})` : "anonymous",
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      responseSize: data ? Buffer.byteLength(data, "utf8") : 0
    };
    
    // Log to appropriate stream based on status code
    if (res.statusCode >= 400) {
      console.error("Response Error:", responseInfo);
      errorLogStream.write(JSON.stringify(responseInfo) + "\n");
    } else {
      console.log("Response:", responseInfo);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Performance monitoring middleware
export const performanceMonitoring = (req, res, next) => {
  const start = process.hrtime();
  
  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      console.warn(`Slow request detected: ${req.method} ${req.originalUrl} took ${duration.toFixed(2)}ms`);
    }
    
    // Log performance metrics
    const metrics = {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: duration.toFixed(2),
      timestamp: new Date().toISOString()
    };
    
    // You could send these metrics to a monitoring service
    // For now, just log them
    console.log("Performance:", metrics);
  });
  
  next();
};

// Security logging middleware
export const securityLogging = (req, res, next) => {
  // Log potentially suspicious requests
  const suspiciousPatterns = [
    /\.\.\//, // Directory traversal
    /<script/i, // XSS attempts
    /union\s+select/i, // SQL injection
    /eval\s*\(/i, // Code injection
    /javascript:/i // JavaScript protocol
  ];
  
  const url = req.originalUrl.toLowerCase();
  const body = JSON.stringify(req.body).toLowerCase();
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(body)) {
      const securityEvent = {
        type: "suspicious_request",
        timestamp: new Date().toISOString(),
        requestId: req.id,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        pattern: pattern.source
      };
      
      console.error("Security Event:", securityEvent);
      
      // Write to security log
      const securityLogStream = fs.createWriteStream(
        path.join(logsDir, "security.log"),
        { flags: "a" }
      );
      securityLogStream.write(JSON.stringify(securityEvent) + "\n");
      securityLogStream.end();
      
      break;
    }
  }
  
  next();
};

// Export default logging configuration
export const loggingMiddleware = (req, res, next) => {
  // Apply all logging middleware
  requestId(req, res, () => {
    requestTiming(req, res, () => {
      requestContext(req, res, () => {
        responseLogging(req, res, () => {
          performanceMonitoring(req, res, () => {
            securityLogging(req, res, next);
          });
        });
      });
    });
  });
};

// Export individual middleware for selective use
export default {
  devLogging,
  prodLogging,
  errorLogging,
  combinedLogging,
  requestId,
  requestTiming,
  requestContext,
  responseLogging,
  performanceMonitoring,
  securityLogging,
  loggingMiddleware
};
