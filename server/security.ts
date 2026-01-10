import { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { body, param, query, validationResult } from "express-validator";

export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://maps.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.exchangerate-api.com", "https://api.open-meteo.com", "https://overpass-api.de", "https://maps.googleapis.com", "https://openrouter.ai"],
      frameSrc: ["'self'", "https://www.google.com", "https://maps.google.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

export const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many chat requests, please wait a moment before sending another message" },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Too many API requests, please slow down" },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LEGACY_SESSION_REGEX = /^[a-zA-Z0-9_-]{1,100}$/;
const VALID_CITIES = ["Tokyo", "Osaka", "Kyoto", "Hokkaido", "Fukuoka", "Okinawa", "Nagoya", "Hiroshima", "Nara", "Yokohama"];
const VALID_CITIES_LOWER = VALID_CITIES.map(c => c.toLowerCase());

export const validateSessionId = (sessionId: string): boolean => {
  return UUID_REGEX.test(sessionId) || LEGACY_SESSION_REGEX.test(sessionId);
};

export const sanitizeString = (input: string, maxLength: number = 2000): string => {
  if (typeof input !== "string") return "";
  return input
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "")
    .trim();
};

export const validateCity = (city: string): boolean => {
  return VALID_CITIES.includes(city) || VALID_CITIES_LOWER.includes(city.toLowerCase());
};

export const normalizeCity = (city: string): string => {
  const lowerCity = city.toLowerCase();
  const idx = VALID_CITIES_LOWER.indexOf(lowerCity);
  return idx >= 0 ? VALID_CITIES[idx] : city;
};

export const chatValidation = [
  body("sessionId")
    .isString()
    .custom((value) => {
      if (!validateSessionId(value)) {
        throw new Error("Invalid session ID format");
      }
      return true;
    }),
  body("messages")
    .isArray({ min: 1, max: 50 })
    .withMessage("Messages must be an array with 1-50 items"),
  body("messages.*.role")
    .isIn(["user", "assistant"])
    .withMessage("Message role must be user or assistant"),
  body("messages.*.content")
    .isString()
    .isLength({ min: 1, max: 4000 })
    .withMessage("Message content must be 1-4000 characters"),
];

export const cityParamValidation = [
  param("city")
    .isString()
    .customSanitizer((value) => normalizeCity(value))
    .custom((value) => {
      if (!validateCity(value)) {
        throw new Error("Invalid city");
      }
      return true;
    }),
];

export const placeDetailsValidation = [
  query("name")
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage("Name is required and must be under 200 characters"),
  query("lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  query("lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
];

export const mapsEmbedValidation = [
  query("lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  query("lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  query("name")
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage("Name must be under 200 characters"),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map(e => ({
        field: (e as any).path || (e as any).param,
        message: e.msg
      }))
    });
  }
  next();
};

export const corsHeaders = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    "http://localhost:5000",
    "https://localhost:5000",
    process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null,
    process.env.REPL_SLUG && process.env.REPL_OWNER
      ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
      : null,
  ].filter(Boolean) as string[];

  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  } else if (!origin) {
    res.header("Access-Control-Allow-Origin", allowedOrigins[0] || "*");
  }
  
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Max-Age", "86400");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  
  next();
};

export const requestSizeLimiter = (maxSize: string = "100kb") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers["content-length"] || "0", 10);
    const maxBytes = parseSize(maxSize);
    
    if (contentLength > maxBytes) {
      return res.status(413).json({ error: "Request entity too large" });
    }
    next();
  };
};

function parseSize(size: string): number {
  const match = size.match(/^(\d+)(kb|mb)?$/i);
  if (!match) return 102400;
  
  const num = parseInt(match[1], 10);
  const unit = (match[2] || "").toLowerCase();
  
  switch (unit) {
    case "kb":
      return num * 1024;
    case "mb":
      return num * 1024 * 1024;
    default:
      return num;
  }
}

const MALICIOUS_USER_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /nessus/i,
  /openvas/i,
  /nmap/i,
  /burpsuite/i,
  /acunetix/i,
  /w3af/i,
  /skipfish/i,
  /havij/i,
];

const ATTACK_PATTERNS = [
  { pattern: /\.\.\//i, type: "Path Traversal" },
  { pattern: /\.\.%2[fF]/i, type: "Path Traversal Encoded" },
  { pattern: /\.\.\\+/i, type: "Path Traversal Backslash" },
  { pattern: /\/etc\/(passwd|shadow|hosts|group|sudoers|ssh)/i, type: "Sensitive File Access" },
  { pattern: /\/proc\/(self|version|cmdline|environ)/i, type: "Proc Access" },
  { pattern: /\/var\/log\//i, type: "Log File Access" },
  { pattern: /\/windows\/system32/i, type: "Windows System Access" },
  
  { pattern: /<script[^>]*>/i, type: "XSS Script Tag" },
  { pattern: /<\/script>/i, type: "XSS Script Close Tag" },
  { pattern: /javascript\s*:/i, type: "XSS JavaScript URI" },
  { pattern: /vbscript\s*:/i, type: "XSS VBScript URI" },
  { pattern: /on\w+\s*=/i, type: "XSS Event Handler" },
  { pattern: /data:\s*text\/html/i, type: "XSS Data URI" },
  { pattern: /<iframe/i, type: "XSS Iframe" },
  { pattern: /<object/i, type: "XSS Object" },
  { pattern: /<embed/i, type: "XSS Embed" },
  { pattern: /<svg[^>]*onload/i, type: "XSS SVG Onload" },
  { pattern: /expression\s*\(/i, type: "XSS Expression" },
  
  { pattern: /union[\s\/\*]+select/i, type: "SQL Injection" },
  { pattern: /un[\*\/]+ion[\s\/\*]+sel[\*\/]+ect/i, type: "SQL Injection Obfuscated" },
  { pattern: /select[\s\/\*]+.*[\s\/\*]+from/i, type: "SQL Injection" },
  { pattern: /drop[\s\/\*]+table/i, type: "SQL Injection" },
  { pattern: /insert[\s\/\*]+into/i, type: "SQL Injection" },
  { pattern: /delete[\s\/\*]+from/i, type: "SQL Injection" },
  { pattern: /update[\s\/\*]+.*[\s\/\*]+set/i, type: "SQL Injection" },
  { pattern: /;\s*--/i, type: "SQL Comment Injection" },
  { pattern: /'\s*(or|and)\s*['"]?\s*\d+\s*[=<>]/i, type: "SQL Injection Boolean" },
  { pattern: /'\s*(or|and)\s*['"]?\w+['"]?\s*=/i, type: "SQL Injection Boolean" },
  { pattern: /exec\s*\(/i, type: "SQL Exec" },
  { pattern: /xp_cmdshell/i, type: "SQL Command Shell" },
  { pattern: /benchmark\s*\(/i, type: "SQL Timing Attack" },
  { pattern: /sleep\s*\(/i, type: "SQL Timing Attack" },
  { pattern: /waitfor[\s\/\*]+delay/i, type: "SQL Timing Attack" },
  { pattern: /load_file\s*\(/i, type: "SQL File Access" },
  { pattern: /into[\s\/\*]+(out|dump)file/i, type: "SQL File Write" },
  
  { pattern: /[;&|]\s*(cat|ls|pwd|whoami|id|uname|curl|wget|nc|bash|sh|python|perl|ruby|php|node)/i, type: "Command Injection" },
  { pattern: /\|\s*(cat|ls|pwd|whoami|id|uname|curl|wget|nc|bash|sh|python|perl|ruby|php|node|rm|mv|cp)/i, type: "Command Injection" },
  { pattern: /[;&|]\s*rm\s/i, type: "Command Injection Delete" },
  { pattern: /[;&|]\s*chmod\s/i, type: "Command Injection Permissions" },
  { pattern: /[;&|]\s*chown\s/i, type: "Command Injection Ownership" },
  { pattern: /\$\{IFS\}/i, type: "Command Injection IFS" },
  { pattern: /`[^`]+`/, type: "Command Injection Backticks" },
  { pattern: /\$\([^)]+\)/, type: "Command Injection Subshell" },
  { pattern: />\s*\/\w+/i, type: "Command Injection Redirect" },
  { pattern: /\/bin\/(bash|sh|zsh|csh)/i, type: "Shell Invocation" },
  { pattern: /\/usr\/bin\/(python|perl|ruby|php|node)/i, type: "Interpreter Invocation" },
  
  { pattern: /\$\{jndi:/i, type: "Log4Shell JNDI" },
  { pattern: /\$\{\$\{/i, type: "Log4Shell Nested" },
  { pattern: /\$\{env:/i, type: "Log4Shell Env" },
  { pattern: /\$\{lower:/i, type: "Log4Shell Lookup" },
  { pattern: /\$\{upper:/i, type: "Log4Shell Lookup" },
  
  { pattern: /<!ENTITY/i, type: "XXE Entity" },
  { pattern: /<!DOCTYPE[^>]*SYSTEM/i, type: "XXE External DTD" },
  { pattern: /<!DOCTYPE[^>]*PUBLIC/i, type: "XXE Public DTD" },
  { pattern: /SYSTEM\s*["']file:/i, type: "XXE File Protocol" },
  { pattern: /SYSTEM\s*["']http:/i, type: "XXE HTTP Protocol" },
  
  { pattern: /\.(php[3-8]?|phtml|phar|jsp|jspx|asp|aspx|asa|asax|cer|exe|dll|sh|bash|bat|cmd|ps1|vbs|py|pl|rb|cgi)\b/i, type: "Malicious File Extension" },
  
  { pattern: /\x00/i, type: "Null Byte Injection" },
  { pattern: /%00/i, type: "Null Byte Encoded" },
  
  { pattern: /\{\{.*\}\}/i, type: "Template Injection" },
  { pattern: /\$\{\{.*\}\}/i, type: "Template Injection Expression" },
];

export const maliciousUserAgentBlocker = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers["user-agent"] || "";
  
  for (const pattern of MALICIOUS_USER_AGENTS) {
    if (pattern.test(userAgent)) {
      console.warn(`[SECURITY] Blocked malicious scanner: ${userAgent} from ${req.ip}`);
      return res.status(403).json({ error: "Access denied" });
    }
  }
  
  next();
};

export const attackPatternBlocker = (req: Request, res: Response, next: NextFunction) => {
  const checkValue = (value: string): { blocked: boolean; type: string } => {
    for (const { pattern, type } of ATTACK_PATTERNS) {
      if (pattern.test(value)) {
        return { blocked: true, type };
      }
    }
    return { blocked: false, type: "" };
  };

  const checkObject = (obj: any): { blocked: boolean; type: string } => {
    if (typeof obj === "string") return checkValue(obj);
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const result = checkObject(item);
        if (result.blocked) return result;
      }
    }
    if (typeof obj === "object" && obj !== null) {
      for (const val of Object.values(obj)) {
        const result = checkObject(val);
        if (result.blocked) return result;
      }
    }
    return { blocked: false, type: "" };
  };

  const bodyCheck = checkObject(req.body);
  const queryCheck = checkObject(req.query);
  const paramsCheck = checkObject(req.params);
  
  let urlCheck = checkValue(req.url);
  if (!urlCheck.blocked) {
    try {
      urlCheck = checkValue(decodeURIComponent(req.url));
    } catch (e) {
      urlCheck = { blocked: true, type: "Malformed URL Encoding" };
    }
  }
  if (!urlCheck.blocked && req.originalUrl !== req.url) {
    urlCheck = checkValue(req.originalUrl);
  }
  if (!urlCheck.blocked && req.path) {
    urlCheck = checkValue(req.path);
  }

  const result = bodyCheck.blocked ? bodyCheck : 
                 queryCheck.blocked ? queryCheck : 
                 paramsCheck.blocked ? paramsCheck :
                 urlCheck.blocked ? urlCheck : { blocked: false, type: "" };

  if (result.blocked) {
    console.warn(`[SECURITY] Blocked ${result.type} attack from ${req.ip}: ${req.method} ${req.path}`);
    return res.status(400).json({ error: "Request blocked due to suspicious content" });
  }

  next();
};

export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /\.\.\//,
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /union\s+select/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
  ];

  const checkValue = (value: string): boolean => {
    return suspiciousPatterns.some(pattern => pattern.test(value));
  };

  const checkObject = (obj: any): boolean => {
    if (typeof obj === "string") return checkValue(obj);
    if (Array.isArray(obj)) return obj.some(item => checkObject(item));
    if (typeof obj === "object" && obj !== null) {
      return Object.values(obj).some(val => checkObject(val));
    }
    return false;
  };

  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    console.warn(`[SECURITY] Suspicious request detected from ${req.ip}: ${req.method} ${req.path}`);
  }

  next();
};
