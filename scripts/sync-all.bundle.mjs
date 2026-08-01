#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// scripts/wb-categories.js
var require_wb_categories = __commonJS({
  "scripts/wb-categories.js"(exports, module) {
    "use strict";
    var CATEGORY_MAP = {
      // Клатчи, сумки через плечо → crossbody
      1: "crossbody",
      // Сумки женские
      7: "crossbody",
      // Клатчи
      25: "crossbody",
      // Сумки-кросс-боди
      // Сумки на плечо
      2: "na-plecho",
      // Сумки на плечо
      // Багеты
      8: "baguette",
      // Сумки-багет
      // Тоуты, шоперы
      3: "tote",
      // Шоперы, сумки для ноутбука
      // Сёдла
      6: "saddle",
      // Сумки-седло
      // Рюкзаки
      5: "backpack"
      // Рюкзаки
    };
    var NAME_FALLBACK = {
      \u043A\u0440\u043E\u0441\u0441: "crossbody",
      \u043A\u043B\u0430\u0442\u0447: "crossbody",
      \u043F\u043B\u0435\u0447: "na-plecho",
      \u0431\u0430\u0433\u0435\u0442: "baguette",
      \u0442\u043E\u0443\u0442: "tote",
      \u0448\u043E\u043F\u0435\u0440: "tote",
      \u0441\u0435\u0434\u043B: "saddle",
      \u0440\u044E\u043A\u0437\u0430\u043A: "backpack"
    };
    var CATEGORY_RU2 = {
      crossbody: "\u0421\u0443\u043C\u043A\u0430 \u043A\u0440\u043E\u0441\u0441-\u0431\u043E\u0434\u0438",
      "na-plecho": "\u0421\u0443\u043C\u043A\u0430 \u043D\u0430 \u043F\u043B\u0435\u0447\u043E",
      baguette: "\u0421\u0443\u043C\u043A\u0430-\u0431\u0430\u0433\u0435\u0442",
      tote: "\u0421\u0443\u043C\u043A\u0430-\u0442\u043E\u0443\u0442",
      saddle: "\u0421\u0443\u043C\u043A\u0430-\u0441\u0435\u0434\u043B\u043E",
      backpack: "\u0421\u0443\u043C\u043A\u0430-\u0440\u044E\u043A\u0437\u0430\u043A"
    };
    function wbToCategory2(subjectId, subjectName, subjId) {
      if (subjId && CATEGORY_MAP[subjId]) {
        return CATEGORY_MAP[subjId];
      }
      if (subjectId && CATEGORY_MAP[subjectId]) {
        return CATEGORY_MAP[subjectId];
      }
      if (subjectName) {
        const lower = subjectName.toLowerCase();
        for (const [keyword, cat] of Object.entries(NAME_FALLBACK)) {
          if (lower.includes(keyword)) return cat;
        }
      }
      return null;
    }
    module.exports = { CATEGORY_MAP, CATEGORY_RU: CATEGORY_RU2, wbToCategory: wbToCategory2 };
  }
});

// scripts/name-generator.js
var require_name_generator = __commonJS({
  "scripts/name-generator.js"(exports, module) {
    "use strict";
    var { CATEGORY_RU: CATEGORY_RU2 } = require_wb_categories();
    function generateName3({ category, composition, wbName }) {
      const cat = category || "crossbody";
      const base = CATEGORY_RU2[cat] || cat;
      const lower = (wbName || "").toLowerCase();
      const isMini = lower.includes("\u043C\u0438\u043D\u0438") || lower.includes("mini");
      let name = isMini ? base + " \u043C\u0438\u043D\u0438" : base;
      if (composition) {
        const comp = composition.toLowerCase().trim();
        if (comp.includes("\u0437\u0430\u043C\u0448\u0430") || comp.includes("\u0437\u0430\u043C\u0448\u0438")) {
          name = name + " \u0438\u0437 \u0437\u0430\u043C\u0448\u0438";
        } else if (comp.includes("\u043A\u043E\u0436\u0430") || comp.includes("\u043A\u043E\u0436\u0438")) {
          name = name + " \u0438\u0437 \u043D\u0430\u0442\u0443\u0440\u0430\u043B\u044C\u043D\u043E\u0439 \u043A\u043E\u0436\u0438";
        } else if (comp === "\u0442\u0435\u043A\u0441\u0442\u0438\u043B\u044C" || comp === "\u043F\u043E\u043B\u0438\u044D\u0441\u0442\u0435\u0440") {
        } else {
          name = name + " \u0438\u0437 " + composition.toLowerCase().trim();
        }
      }
      return name;
    }
    module.exports = { generateName: generateName3 };
  }
});

// node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "node_modules/dotenv/lib/main.js"(exports, module) {
    var fs = __require("fs");
    var path = __require("path");
    var os = __require("os");
    var crypto = __require("crypto");
    var TIPS = [
      "\u25C8 encrypted .env [www.dotenvx.com]",
      "\u25C8 secrets for agents [www.dotenvx.com]",
      "\u2301 auth for agents [www.vestauth.com]",
      "\u2318 custom filepath { path: '/custom/path/.env' }",
      "\u2318 enable debugging { debug: true }",
      "\u2318 override existing { override: true }",
      "\u2318 suppress logs { quiet: true }",
      "\u2318 multiple files { path: ['.env.local', '.env'] }"
    ];
    function _getRandomTip() {
      return TIPS[Math.floor(Math.random() * TIPS.length)];
    }
    function parseBoolean(value) {
      if (typeof value === "string") {
        return !["false", "0", "no", "off", ""].includes(value.toLowerCase());
      }
      return Boolean(value);
    }
    function supportsAnsi() {
      return process.stdout.isTTY;
    }
    function dim(text) {
      return supportsAnsi() ? `\x1B[2m${text}\x1B[0m` : text;
    }
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      options = options || {};
      const vaultPath = _vaultPath(options);
      options.path = vaultPath;
      const result = DotenvModule.configDotenv(options);
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _warn(message) {
      console.error(`\u26A0 ${message}`);
    }
    function _debug(message) {
      console.log(`\u2506 ${message}`);
    }
    function _log(message) {
      console.log(`\u25C7 ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path.resolve(process.cwd(), ".env.vault");
      }
      if (fs.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      const debug = parseBoolean(process.env.DOTENV_CONFIG_DEBUG || options && options.debug);
      const quiet = parseBoolean(process.env.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (debug || !quiet) {
        _log("loading env from encrypted .env.vault");
      }
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      let debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || options && options.debug);
      let quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("no encoding is specified (UTF-8 is used by default)");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path2 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs.readFileSync(path2, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e) {
          if (debug) {
            _debug(`failed to load ${path2} ${e.message}`);
          }
          lastError = e;
        }
      }
      const populated = DotenvModule.populate(processEnv, parsedAll, options);
      debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || debug);
      quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || quiet);
      if (debug || !quiet) {
        const keysCount = Object.keys(populated).length;
        const shortPaths = [];
        for (const filePath of optionPaths) {
          try {
            const relative = path.relative(process.cwd(), filePath);
            shortPaths.push(relative);
          } catch (e) {
            if (debug) {
              _debug(`failed to load ${filePath} ${e.message}`);
            }
            lastError = e;
          }
        }
        _log(`injected env (${keysCount}) from ${shortPaths.join(",")} ${dim(`// tip: ${_getRandomTip()}`)}`);
      }
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`you set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      const populated = {};
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
            populated[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
          populated[key] = parsed[key];
        }
      }
      return populated;
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config,
      decrypt,
      parse,
      populate
    };
    module.exports.configDotenv = DotenvModule.configDotenv;
    module.exports._configVault = DotenvModule._configVault;
    module.exports._parseVault = DotenvModule._parseVault;
    module.exports.config = DotenvModule.config;
    module.exports.decrypt = DotenvModule.decrypt;
    module.exports.parse = DotenvModule.parse;
    module.exports.populate = DotenvModule.populate;
    module.exports = DotenvModule;
  }
});

// scripts/sync-modules/ozon-browser.mjs
function isHeadless() {
  return process.env.OZON_HEADLESS !== "0" && process.env.OZON_HEADLESS !== "false";
}
function getProxyConfig() {
  const server = process.env.OZON_PROXY_SERVER;
  if (!server) return null;
  const cfg = { server };
  if (process.env.OZON_PROXY_USER) {
    cfg.username = process.env.OZON_PROXY_USER;
    cfg.password = process.env.OZON_PROXY_PASS ?? "";
  }
  return cfg;
}
function log(...args) {
  console.error("[OzonBrowser]", ...args);
}
function isBrowserAvailable() {
  if (process.env.VERCEL === "1") {
    log("VERCEL=1 \u2192 \u0431\u0440\u0430\u0443\u0437\u0435\u0440 \u043E\u0442\u043A\u043B\u044E\u0447\u0451\u043D");
    return false;
  }
  if (process.env.NEXT_PHASE === "phase-production-build") {
    log("NEXT_PHASE=build \u2192 \u0431\u0440\u0430\u0443\u0437\u0435\u0440 \u043E\u0442\u043A\u043B\u044E\u0447\u0451\u043D");
    return false;
  }
  return true;
}
async function launch() {
  log("launching Chromium (patchright)\u2026");
  const proxy = getProxyConfig();
  if (proxy) log(`using proxy: ${proxy.server} (user: ${proxy.username ?? "\u2014"})`);
  const { chromium } = await import("patchright");
  browser = await chromium.launch({
    headless: isHeadless(),
    args: LAUNCH_ARGS
  });
  browser.on("disconnected", () => {
    log("browser disconnected \u2014 \u0431\u0443\u0434\u0435\u0442 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0449\u0435\u043D \u043F\u0440\u0438 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u043C \u0437\u0430\u043F\u0440\u043E\u0441\u0435");
    const dead = browser;
    browser = null;
    context = null;
    mainPage = null;
    challenged = false;
    dead?.close().catch(() => {
    });
  });
  const proxyCfg = getProxyConfig();
  context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ...process.env.OZON_UA ? { userAgent: process.env.OZON_UA } : { userAgent: USER_AGENT },
    locale: "ru-RU",
    ...proxyCfg ? { proxy: proxyCfg } : {}
  });
  challenged = false;
}
async function ensureContext() {
  if (!isBrowserAvailable()) {
    throw new Error("patchright/Chromium \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D (Vercel \u0438\u043B\u0438 production build)");
  }
  if (challengeBroken) {
    throw new Error("Variti challenge \u043D\u0435 \u043F\u0440\u043E\u0439\u0434\u0435\u043D \u0440\u0430\u043D\u0435\u0435 \u2014 \u043F\u0440\u043E\u043F\u0443\u0441\u043A \u0444\u0430\u0437\u044B");
  }
  if (context && challenged) return context;
  if (initPromise) {
    await initPromise;
    return context;
  }
  initPromise = (async () => {
    if (!browser || !browser.isConnected()) await launch();
    mainPage = await context.newPage();
    log("passing Variti anti-bot challenge\u2026");
    let navStatus = "\u2014";
    try {
      const resp = await mainPage.goto(HOME, {
        waitUntil: "domcontentloaded",
        timeout: NAV_TIMEOUT_MS
      });
      navStatus = resp?.status() ?? "no-response";
    } catch (err) {
      navStatus = `ERR: ${String(err?.message).slice(0, 80)}`;
    }
    log(`homepage status: ${navStatus}`);
    await mainPage.waitForTimeout(CHALLENGE_WAIT_MS);
    const title = await mainPage.title();
    if (/antibot|ограничен|доступ|соединени|no internet|offline/i.test(title)) {
      challengeBroken = true;
      throw new Error(`Variti challenge \u043D\u0435 \u043F\u0440\u043E\u0439\u0434\u0435\u043D (title: ${title})`);
    }
    challenged = true;
    log("challenge passed:", title.slice(0, 40));
  })();
  try {
    await initPromise;
  } finally {
    initPromise = null;
  }
  return context;
}
async function fetchJson(path, { retries = 1 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      await ensureContext();
      const body = await mainPage.evaluate(
        async (url) => {
          const r = await fetch(url, {
            headers: { accept: "application/json" }
          });
          return { status: r.status, text: await r.text() };
        },
        API + encodeURIComponent(path)
      );
      if (body.status !== 200) {
        if ((body.status === 403 || body.status === 307) && attempt < retries) {
          log(`HTTP ${body.status} (attempt ${attempt + 1}) \u2014 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430`);
          await shutdown();
          continue;
        }
        throw new Error(`Ozon \u0432\u0435\u0440\u043D\u0443\u043B HTTP ${body.status} \u0434\u043B\u044F ${path}`);
      }
      return JSON.parse(body.text);
    } catch (err) {
      if (DEAD.test(String(err?.message)) && attempt < retries) {
        log(`browser disconnected (attempt ${attempt + 1}) \u2014 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A`);
        await shutdown();
        continue;
      }
      throw err;
    }
  }
}
function isEnabled() {
  return isBrowserAvailable();
}
async function shutdown() {
  challenged = false;
  mainPage = null;
  try {
    await context?.close();
  } catch {
  }
  try {
    await browser?.close();
  } catch {
  }
  context = null;
  browser = null;
  log("browser closed");
}
var HOME, API, CHALLENGE_WAIT_MS, NAV_TIMEOUT_MS, LAUNCH_ARGS, USER_AGENT, browser, context, mainPage, initPromise, challenged, challengeBroken, DEAD;
var init_ozon_browser = __esm({
  "scripts/sync-modules/ozon-browser.mjs"() {
    "use strict";
    HOME = "https://www.ozon.ru/";
    API = "https://www.ozon.ru/api/composer-api.bx/page/json/v2?url=";
    CHALLENGE_WAIT_MS = 12e3;
    NAV_TIMEOUT_MS = 9e4;
    LAUNCH_ARGS = [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--mute-audio",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-background-networking"
    ];
    USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    browser = null;
    context = null;
    mainPage = null;
    initPromise = null;
    challenged = false;
    challengeBroken = false;
    DEAD = /Target page, context or browser has been closed|Session closed|Connection closed|browser has been closed/i;
  }
});

// scripts/sync-modules/ozon-price.mjs
var ozon_price_exports = {};
__export(ozon_price_exports, {
  getProductPrice: () => getProductPrice,
  getProductsPrices: () => getProductsPrices,
  parsePrices: () => parsePrices
});
function priceToNumber(text) {
  if (text == null) return null;
  const str = String(text);
  const digits = str.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : null;
}
function parsePrices(page) {
  const ws = page?.widgetStates || {};
  if (!ws || typeof ws !== "object") {
    return { cardPrice: null, price: null, oldPrice: null };
  }
  const priceKey = Object.keys(ws).find((k) => String(k).split("-")[0] === "webPrice");
  if (!priceKey) {
    return { cardPrice: null, price: null, oldPrice: null };
  }
  let widget;
  try {
    widget = JSON.parse(ws[priceKey]);
  } catch {
    return { cardPrice: null, price: null, oldPrice: null };
  }
  return {
    cardPrice: priceToNumber(widget.cardPrice),
    price: priceToNumber(widget.price),
    oldPrice: priceToNumber(widget.originalPrice)
  };
}
async function getProductPrice(sku) {
  const path = `/product/${sku}/`;
  const basePage = await fetchJson(path);
  const prices = parsePrices(basePage);
  return { sku: String(sku), ...prices };
}
async function getProductsPrices(skus, { delayMs = 500 } = {}) {
  if (!isEnabled()) {
    console.error("[OzonPrice] Browser disabled \u2014 \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u0430\u0435\u043C \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0435 \u0446\u0435\u043D");
    return [];
  }
  const results = [];
  let hasError = false;
  try {
    for (let i = 0; i < skus.length; i++) {
      const sku = skus[i];
      try {
        const result = await getProductPrice(sku);
        results.push(result);
        if (result.cardPrice != null) {
          console.error(
            `[OzonPrice] ${i + 1}/${skus.length} SKU ${sku}: cardPrice=${result.cardPrice} price=${result.price} oldPrice=${result.oldPrice}`
          );
        } else {
          console.error(`[OzonPrice] ${i + 1}/${skus.length} SKU ${sku}: \u043D\u0435\u0442 \u0446\u0435\u043D (${result.price ?? "\u2014"})`);
        }
      } catch (err) {
        hasError = true;
        console.error(`[OzonPrice] ${i + 1}/${skus.length} SKU ${sku}: \u043E\u0448\u0438\u0431\u043A\u0430 \u2014 ${err.message}`);
      }
      if (i < skus.length - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  } finally {
    await shutdown();
  }
  if (hasError) {
    console.error(`[OzonPrice] \u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043E \u0441 \u043E\u0448\u0438\u0431\u043A\u0430\u043C\u0438: ${results.length}/${skus.length} \u0443\u0441\u043F\u0435\u0448\u043D\u043E`);
  } else {
    console.error(`[OzonPrice] \u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043E: ${results.length}/${skus.length} \u0442\u043E\u0432\u0430\u0440\u043E\u0432`);
  }
  return results;
}
var init_ozon_price = __esm({
  "scripts/sync-modules/ozon-price.mjs"() {
    "use strict";
    init_ozon_browser();
  }
});

// scripts/sync-all.mjs
import { fileURLToPath } from "url";

// scripts/sync-modules/transform.mjs
var import_wb_categories = __toESM(require_wb_categories(), 1);
var GEO_CDN_HOST = "kgd-basket-cdn-01bl.geobasket.ru";
function toBigInt(v) {
  if (v == null) return null;
  return BigInt(v);
}
function getVolPart(article) {
  return {
    vol: Math.floor(article / 1e5),
    part: Math.floor(article / 1e3)
  };
}
function cdnImageUrl(article, index = 1, size = "big") {
  const { vol, part } = getVolPart(article);
  return `https://${GEO_CDN_HOST}/vol${vol}/part${part}/${article}/images/${size}/${index}.webp`;
}
function cdnImageUrls(article, photoCount, max = 30) {
  const urls = [];
  for (let i = 1; i <= photoCount && i <= max; i++) {
    urls.push(cdnImageUrl(article, i));
  }
  return urls;
}
function extractCharByName(card, charName) {
  const groups = card.characteristics || [];
  for (const group of groups) {
    if (group.options && Array.isArray(group.options)) {
      for (const opt of group.options) {
        if (opt.name === charName || opt.name?.toLowerCase() === charName.toLowerCase()) {
          const vals = Array.isArray(opt.value) ? opt.value : [opt.value];
          return vals.filter(Boolean).join(", ") || null;
        }
      }
    }
    if (group.name === charName || group.name?.toLowerCase() === charName.toLowerCase()) {
      const vals = Array.isArray(group.value) ? group.value : [group.value];
      return vals.filter(Boolean).join(", ") || null;
    }
  }
  return null;
}
function extractColorName(card) {
  const colors = card.colors || [];
  if (colors.length > 0) {
    return colors.map((c) => c.name).filter(Boolean).join(", ");
  }
  return extractCharByName(card, "\u0426\u0432\u0435\u0442") || extractCharByName(card, "\u0426\u0432\u0435\u0442 \u0442\u043E\u0432\u0430\u0440\u0430") || null;
}
function extractComposition(card) {
  const comps = card.compositions || [];
  if (comps.length > 0) {
    return comps.map((c) => c.name).filter(Boolean).join("; ");
  }
  return extractCharByName(card, "\u0421\u043E\u0441\u0442\u0430\u0432") || null;
}
function extractDescription(card) {
  if (card.description) return card.description;
  return extractCharByName(card, "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435") || extractCharByName(card, "\u041F\u043E\u043B\u043D\u043E\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435") || "";
}
function extractPhotoCount(card) {
  const media = card.media || {};
  if (media.photo_count) return media.photo_count;
  const photos = card.photos || [];
  if (photos.length > 0) return photos.length;
  return 1;
}
function toGeoUrl(url) {
  if (!url) return null;
  return url.replace(/https:\/\/basket-\d+\.wbbasket\.ru/, `https://${GEO_CDN_HOST}`);
}
function extractImageUrls(card, size = "big") {
  if (!card) return null;
  const media = card.media;
  if (!media) return null;
  if (Array.isArray(media.photo)) {
    const urls = media.photo.map((p) => p && p[size] ? p[size] : null).filter(Boolean);
    if (urls.length > 0) return urls;
  }
  if (Array.isArray(card.photos)) {
    const urls = card.photos.map((p) => p?.url || null).filter(Boolean);
    if (urls.length > 0) return urls;
  }
  return null;
}
var MODEL_CATEGORY_MAP = {
  "\u043A\u0440\u043E\u0441\u0441\u0431\u043E\u0434\u0438": "crossbody",
  "\u043A\u0440\u043E\u0441\u0441-\u0431\u043E\u0434\u0438": "crossbody",
  "\u043A\u0440\u043E\u0441\u0441": "crossbody",
  "\u0431\u0430\u0433\u0435\u0442": "baguette",
  "\u0441\u0435\u0434\u043B\u043E": "saddle",
  "\u0442\u043E\u0443\u0442": "tote",
  "\u0448\u043E\u043F\u043F\u0435\u0440": "tote",
  "\u0448\u043E\u043F\u0435\u0440": "tote",
  "\u043C\u0435\u0448\u043E\u043A": "tote",
  "\u0447\u0435\u0440\u0435\u0437 \u043F\u043B\u0435\u0447\u043E": "na-plecho",
  "\u043D\u0430 \u043F\u043B\u0435\u0447\u043E": "na-plecho",
  "\u0442\u0440\u0430\u043D\u0441\u0444\u043E\u0440\u043C\u0435\u0440": "backpack",
  "\u0440\u044E\u043A\u0437\u0430\u043A": "backpack",
  "\u0434\u0435\u043B\u043E\u0432\u0430\u044F": "crossbody",
  "\u0442\u0430\u043A\u0441": "baguette",
  "\u0441\u0430\u043A\u0432\u043E\u044F\u0436": "baguette",
  "\u043C\u043E\u0434\u043D\u0430\u044F": "crossbody"
};
function resolveModelFromCard(card) {
  const raw = extractCharByName(card, "\u041C\u043E\u0434\u0435\u043B\u044C \u0441\u0443\u043C\u043A\u0438") || "";
  if (!raw) return null;
  const lower = raw.toLowerCase();
  for (const [keyword, cat] of Object.entries(MODEL_CATEGORY_MAP)) {
    if (lower.includes(keyword)) return cat;
  }
  return null;
}
function resolveCategory(card) {
  const fromModel = resolveModelFromCard(card);
  if (fromModel) return fromModel;
  const subjId = card.subjectID || card.subject_id || null;
  const subjName = card.subjectName || card.subject_name || null;
  return (0, import_wb_categories.wbToCategory)(subjId, subjName, subjId);
}
function ozonExtractColor(info, attrs) {
  if (attrs?.attributes) {
    for (const a of attrs.attributes) {
      if (a.attribute_name === "\u0426\u0432\u0435\u0442" || a.attribute_name === "\u0426\u0432\u0435\u0442 \u0442\u043E\u0432\u0430\u0440\u0430") {
        const vals = Array.isArray(a.value) ? a.value : [a.value];
        return vals.filter(Boolean).join(", ");
      }
    }
  }
  if (info?.color_image) {
    if (Array.isArray(info.color_image)) {
      return info.color_image.filter(Boolean).join(", ") || null;
    }
    if (typeof info.color_image === "string") return info.color_image;
  }
  return null;
}
function ozonExtractComposition(attrs) {
  if (!attrs?.attributes) return null;
  for (const a of attrs.attributes) {
    if (a.attribute_name === "\u0421\u043E\u0441\u0442\u0430\u0432" || a.attribute_name === "\u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B") {
      const vals = Array.isArray(a.value) ? a.value : [a.value];
      return vals.filter(Boolean).join(", ");
    }
  }
  return null;
}
function ozonExtractDescription(attrs) {
  if (attrs?.description) return attrs.description;
  return "";
}
function ozonExtractCharacteristics(attrs) {
  if (!attrs?.attributes) return [];
  return attrs.attributes.map((a) => ({
    name: a.attribute_name,
    value: Array.isArray(a.value) ? a.value.join(", ") : String(a.value || "")
  }));
}
function ozonExtractCategory(info, attrs) {
  const text = [
    info?.category,
    info?.name,
    info?.offer_id
  ].filter(Boolean).join(" ").toLowerCase();
  if (text) {
    if (text.includes("\u0448\u043E\u043F\u043F\u0435\u0440") || text.includes("\u0448\u043E\u043F\u0435\u0440") || text.includes("shopp")) return "tote";
    if (text.includes("\u0440\u044E\u043A\u0437\u0430\u043A") || text.includes("backpack") || text.includes("rucksack")) return "backpack";
    if (text.includes("\u0441\u0435\u0434\u043B") || text.includes("\u0441\u0435\u0434\u043B\u043E") || text.includes("saddle") || text.includes("sedlo")) return "saddle";
    if (text.includes("\u0431\u0430\u0433\u0435\u0442") || text.includes("baguette")) return "baguette";
    if (text.includes("\u0447\u0435\u0440\u0435\u0437 \u043F\u043B\u0435\u0447\u043E") || text.includes("na plecho") || text.includes("na-plecho")) return "na-plecho";
    if (text.includes("\u0442\u043E\u0443\u0442") || text.includes("toute") || text.includes("tout ")) return "tote";
  }
  if (attrs?.attributes) {
    const typeAttr = attrs.attributes.find((a) => a.id === 20259);
    if (typeAttr?.values?.length) {
      const vals = typeAttr.values.map((v) => String(v.value).toLowerCase());
      if (vals.some((v) => v === "\u0448\u043E\u043F\u043F\u0435\u0440" || v === "\u0448\u043E\u043F\u0435\u0440")) return "tote";
      if (vals.some((v) => v.includes("\u0440\u044E\u043A\u0437\u0430\u043A"))) return "backpack";
      if (vals.some((v) => v.includes("\u0441\u0435\u0434\u043B"))) return "saddle";
      if (vals.some((v) => v.includes("\u0431\u0430\u0433\u0435\u0442"))) return "baguette";
      if (vals.some((v) => v.includes("\u043D\u0430 \u043F\u043B\u0435\u0447\u043E") || v.includes("\u0442\u043E\u0443\u0442"))) return "na-plecho";
      if (vals.some((v) => v.includes("\u043A\u0440\u043E\u0441\u0441-\u0431\u043E\u0434\u0438") || v.includes("\u043A\u0440\u043E\u0441\u0441\u0431\u043E\u0434\u0438"))) return "crossbody";
      if (vals.some((v) => v.includes("\u043A\u043B\u0430\u0442\u0447"))) return "crossbody";
    }
    const modelAttr = attrs.attributes.find((a) => a.id === 9048);
    if (modelAttr?.values?.length) {
      const modelVals = modelAttr.values.map((v) => String(v.value).toLowerCase());
      if (modelVals.some((v) => v.includes("sedlo") || v.includes("\u0441\u0435\u0434\u043B") || v.includes("saddle"))) return "saddle";
    }
  }
  if (text) {
    if (text.includes("\u043A\u0440\u043E\u0441\u0441") || text.includes("crossbody") || text.includes("\u043A\u043B\u0430\u0442\u0447") || text.includes("clutch")) return "crossbody";
    if (text.includes("\u043F\u043B\u0435\u0447") || text.includes("\u043D\u0430\u043F\u043B\u0435\u0447")) return "na-plecho";
  }
  return null;
}
function makeSlug(s) {
  if (!s) return null;
  return s.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2").toLowerCase().replace(/[/]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

// scripts/sync-modules/merge.mjs
var import_name_generator = __toESM(require_name_generator(), 1);
function mergeProductSources(wbCard, wbPrices, wbRating, ozonInfo, ozonAttrs, ozonRating, db) {
  const data = {};
  const wbPrice = wbPrices?.price ?? db?.wbPrice ?? null;
  const wbOrigPrice = wbPrices?.discountedPrice ?? db?.wbOriginalPrice ?? null;
  const ozonPriceVal = db?.ozonPrice ?? null;
  const ozonOrigPriceVal = db?.ozonOriginalPrice ?? null;
  if (wbPrice !== (db?.wbPrice ?? null)) data.wbPrice = wbPrice;
  if (wbOrigPrice !== (db?.wbOriginalPrice ?? null)) data.wbOriginalPrice = wbOrigPrice;
  if (ozonPriceVal !== (db?.ozonPrice ?? null)) data.ozonPrice = ozonPriceVal;
  if (ozonOrigPriceVal !== (db?.ozonOriginalPrice ?? null)) data.ozonOriginalPrice = ozonOrigPriceVal;
  const prices = [wbPrice, ozonPriceVal].filter((p) => p != null);
  const origPrices = [wbOrigPrice, ozonOrigPriceVal].filter((p) => p != null);
  if (prices.length > 0) {
    const np = Math.min(...prices);
    if (np !== db?.price) data.price = np;
  }
  if (origPrices.length > 0) {
    const np = Math.min(...origPrices);
    if (np !== db?.originalPrice) data.originalPrice = np;
  }
  if (wbPrices?.stock !== void 0) {
    if (wbPrices.stock !== (db?.wbStock ?? null)) data.wbStock = wbPrices.stock;
  }
  if (ozonInfo?.stocks?.stocks) {
    const qty = ozonInfo.stocks.stocks.reduce(
      (s, st) => s + Math.max(0, (st.present || 0) - (st.reserved || 0)),
      0
    );
    if (qty !== (db?.ozonStock ?? null)) data.ozonStock = qty;
  }
  const finalWb = data.wbStock !== void 0 ? data.wbStock : db?.wbStock ?? null;
  const finalOz = data.ozonStock !== void 0 ? data.ozonStock : db?.ozonStock ?? null;
  if (finalWb !== null || finalOz !== null) {
    let newInStock;
    if (finalWb !== null && finalOz !== null) {
      newInStock = finalWb > 0 || finalOz > 0;
    } else if (finalWb !== null) {
      newInStock = finalWb > 0;
    } else {
      newInStock = finalOz > 0;
    }
    if (newInStock !== db?.inStock) data.inStock = newInStock;
  }
  if (wbCard) {
    const photoCount = extractPhotoCount(wbCard);
    const article = wbCard.nmID;
    if (photoCount !== db?.photoCount) data.photoCount = photoCount;
    const realUrls = extractImageUrls(wbCard, "big");
    let newImage, newImages;
    if (realUrls && realUrls.length > 0) {
      newImage = toGeoUrl(realUrls[0]);
      newImages = realUrls.map(toGeoUrl).filter(Boolean);
    } else {
      newImage = cdnImageUrl(article, 1);
      newImages = cdnImageUrls(article, photoCount);
    }
    if (newImage !== db?.image) data.image = newImage;
    if (JSON.stringify(newImages) !== JSON.stringify(db?.images || [])) data.images = newImages;
  } else if (ozonInfo?.images?.length && !db?.wbArticle && !db?.ozonImage) {
    if (ozonInfo.images.length !== db?.photoCount) data.photoCount = ozonInfo.images.length;
    if (ozonInfo.images[0] !== db?.image) data.image = ozonInfo.images[0];
    if (JSON.stringify(ozonInfo.images) !== JSON.stringify(db?.images || [])) data.images = ozonInfo.images;
  }
  if (ozonInfo?.images?.length) {
    const firstOzon = ozonInfo.images[0];
    if (firstOzon !== db?.ozonImage) data.ozonImage = firstOzon;
    const allOzon = ozonInfo.images;
    if (JSON.stringify(allOzon) !== JSON.stringify(db?.ozonImages || [])) data.ozonImages = allOzon;
  }
  const wbCat = wbCard ? resolveCategory(wbCard) : null;
  const ozonCat = ozonInfo ? ozonExtractCategory(ozonInfo, ozonAttrs) : null;
  const newCat = wbCat || (db?.wbArticle && !wbCard ? db?.category || ozonCat : ozonCat) || db?.category || "crossbody";
  if (newCat !== db?.category) data.category = newCat;
  const wbComp = wbCard ? extractComposition(wbCard) : null;
  const ozonComp = ozonInfo ? ozonExtractComposition(ozonAttrs) : null;
  const newComp = wbComp || ozonComp || db?.composition || null;
  if (newComp !== db?.composition) data.composition = newComp;
  const wbColor = wbCard ? extractColorName(wbCard) : null;
  const ozonColor = ozonInfo ? ozonExtractColor(ozonInfo, ozonAttrs) : null;
  const newColor = wbColor || ozonColor || db?.colorName || null;
  if (newColor !== db?.colorName) data.colorName = newColor;
  const wbRatingVal = wbRating?.rating ?? db?.rating ?? null;
  const wbFeedbacks = wbRating?.feedbacks ?? db?.reviewsCount ?? 0;
  const ozonReviewsCount = ozonInfo?.reviews_count != null ? Number(ozonInfo.reviews_count) : 0;
  if (wbRatingVal != null) {
    const totalRC = wbFeedbacks + ozonReviewsCount;
    if (wbRatingVal !== db?.rating) data.rating = Math.round(wbRatingVal * 10) / 10;
    if (totalRC !== (db?.reviewsCount ?? 0)) data.reviewsCount = totalRC;
  } else if (ozonReviewsCount > 0) {
    if (ozonReviewsCount !== (db?.reviewsCount ?? 0)) data.reviewsCount = ozonReviewsCount;
  }
  if (wbCard && db?.nameAutoGenerated !== false) {
    const newName = (0, import_name_generator.generateName)({
      category: data.category || db?.category,
      composition: data.composition || db?.composition || null,
      wbName: wbCard.title || wbCard.imt_name || null
    });
    if (newName !== (db?.name || "")) {
      data.name = newName;
      data.nameAutoGenerated = true;
    }
  }
  if (wbCard && db?.descAutoGenerated !== false) {
    const desc = extractDescription(wbCard) || ozonExtractDescription(ozonAttrs) || "";
    if (desc && desc !== (db?.description || "")) {
      data.description = desc;
      data.descAutoGenerated = true;
    }
  }
  const wbChars = wbCard?.characteristics || [];
  const ozonChars = ozonExtractCharacteristics(ozonAttrs);
  if (wbChars.length > 0 || ozonChars.length > 0) {
    const sortOpts = (a, b) => (a.name || "").localeCompare(b.name || "");
    const merged = [];
    if (wbChars.length > 0) {
      merged.push({
        group_name: "Wildberries",
        options: wbChars.map((c) => ({
          name: c.name || String(c.id || ""),
          value: Array.isArray(c.value) ? c.value.join(", ") : String(c.value || "")
        })).sort(sortOpts)
      });
    }
    if (ozonChars.length > 0) {
      merged.push({
        group_name: "Ozon",
        options: [...ozonChars].sort(sortOpts)
      });
    }
    const dbChars = db?.characteristics || [];
    const mergedGroupNames = new Set(merged.map((g) => g.group_name));
    const otherDbGroups = dbChars.filter((g) => !mergedGroupNames.has(g.group_name)).map((g) => ({
      group_name: g.group_name,
      options: [...g.options || []].sort(sortOpts)
    }));
    const combined = [...merged, ...otherDbGroups];
    const dbEquivalent = combined.map((g) => {
      const dbGroup = dbChars.find((dbg) => dbg.group_name === g.group_name);
      return {
        group_name: g.group_name,
        options: [...dbGroup?.options || []].sort(sortOpts)
      };
    });
    if (JSON.stringify(combined) !== JSON.stringify(dbEquivalent)) {
      data.characteristics = combined;
    }
  }
  return data;
}

// scripts/sync-modules/model-naming.mjs
var CATEGORY_RU = {
  crossbody: "\u041A\u0440\u043E\u0441\u0441-\u0431\u043E\u0434\u0438",
  "na-plecho": "\u041D\u0430 \u043F\u043B\u0435\u0447\u043E",
  tote: "\u0422\u043E\u0443\u0442",
  backpack: "\u0420\u044E\u043A\u0437\u0430\u043A",
  baguette: "\u0411\u0430\u0433\u0435\u0442",
  saddle: "\u0421\u0435\u0434\u043B\u043E"
};
var COLOR_WORDS = [
  "white",
  "black",
  "yellow",
  "blue",
  "green",
  "grey",
  "gray",
  "red",
  "navy",
  "pink",
  "brown",
  "beige",
  "cream",
  "gold",
  "silver",
  "orange",
  "choko",
  "chocolate",
  "choco",
  "shoko",
  "taup",
  "taupe",
  "molochnyj",
  "moloch",
  "molochnyi",
  "karamel",
  "caramel",
  "pesok",
  "cappuc",
  "cappuccino",
  "capuch",
  "limon",
  "bor",
  "new"
];
var COLOR_CODES = ["BL", "GR", "GN", "RD", "YW", "PK"];
function skuBase(sku) {
  return sku.split(/[/\\]/)[0];
}
function findBestPrefix(skus) {
  if (!skus.length) return "";
  const bases = skus.filter(Boolean).map((s) => skuBase(s));
  const n = bases.length;
  if (n === 0) return "";
  if (n === 1) return bases[0];
  const freq = /* @__PURE__ */ new Map();
  for (const b of bases) {
    const lower = b.toLowerCase();
    for (let len = lower.length; len >= 3; len--) {
      const p = lower.slice(0, len);
      freq.set(p, (freq.get(p) || 0) + 1);
    }
  }
  const byCount = /* @__PURE__ */ new Map();
  for (const [prefix, count] of freq) {
    if (count < 2) continue;
    const existing = byCount.get(count);
    if (!existing || prefix.length > existing.length) {
      byCount.set(count, prefix);
    }
  }
  const sorted = [...byCount.entries()].sort((a, b) => {
    if (b[0] !== a[0]) return b[0] - a[0];
    return b[1].length - a[1].length;
  });
  if (sorted.length > 0) {
    const bestLower = sorted[0][1];
    for (const b of bases) {
      if (b.toLowerCase().startsWith(bestLower)) {
        return b.slice(0, bestLower.length);
      }
    }
  }
  return "";
}
function stripSuffix(s) {
  let r = s;
  for (let i = 0; i < 5; i++) {
    let changed = false;
    for (const color of COLOR_WORDS) {
      const re = new RegExp(`[-_/]?${color}$`, "i");
      if (re.test(r)) {
        r = r.replace(re, "");
        changed = true;
        break;
      }
    }
    if (changed) continue;
    for (const code of COLOR_CODES) {
      let re = new RegExp(`[-_/]${code}$`);
      if (re.test(r)) {
        r = r.replace(re, "");
        changed = true;
        break;
      }
      re = new RegExp(`${code}$`);
      if (re.test(r) && r.length > 4) {
        r = r.replace(re, "");
        changed = true;
        break;
      }
    }
    if (changed) continue;
    const matRe = /[-_/](zamsh|leather|кожа|замш|prjag|big|small)$/i;
    if (matRe.test(r)) {
      r = r.replace(matRe, "");
      changed = true;
      continue;
    }
    break;
  }
  return r;
}
function stripSize(s) {
  return s.replace(/[-_/]\d+[-_/]\d+$/, "").replace(/[-_/]\d+$/, "").replace(/\d+$/, "").replace(/[-_/]$/, "");
}
function cleanPrefix(raw) {
  if (!raw || raw.length < 3) return "";
  let s = raw;
  for (let i = 0; i < 3; i++) {
    const prev = s;
    s = stripSuffix(s);
    s = stripSize(s);
    if (s === prev) break;
  }
  s = s.replace(/([a-zа-яё])([A-ZА-ЯЁ])/g, "$1 $2");
  s = s.charAt(0).toUpperCase() + s.slice(1);
  s = s.replace(/[^a-zA-Zа-яА-ЯЁё0-9\s-]/g, "").replace(/\s+/g, " ").trim();
  return s;
}
function deriveFromProducts(productNames, category) {
  const mats = /* @__PURE__ */ new Set();
  for (const n of productNames) {
    if (!n) continue;
    const l = n.toLowerCase();
    if (l.includes("\u0437\u0430\u043C\u0448")) mats.add("\u0437\u0430\u043C\u0448\u0438");
    if (l.includes("\u043A\u043E\u0436")) mats.add("\u043D\u0430\u0442\u0443\u0440\u0430\u043B\u044C\u043D\u043E\u0439 \u043A\u043E\u0436\u0438");
  }
  const cat = CATEGORY_RU[category] || category;
  if (mats.size === 0) return cat;
  if (mats.size === 1) return `${cat} \u0438\u0437 ${[...mats][0]}`;
  return `${cat} (${[...mats].join(", ")})`;
}
function deriveModelName(skus, productNames, category) {
  const rawPrefix = findBestPrefix(skus);
  if (rawPrefix && rawPrefix.length >= 3) {
    const name = cleanPrefix(rawPrefix);
    if (name && name.length >= 2) {
      return name;
    }
  }
  return deriveFromProducts(productNames, category);
}

// scripts/sync-modules/models.mjs
async function syncModels(prisma, wbCards, resolveCategory2, log3, flags2) {
  const imtGroups = /* @__PURE__ */ new Map();
  for (const card of wbCards) {
    const imtId = card.imtID ?? card.imt_id;
    if (!imtId) continue;
    if (!imtGroups.has(imtId)) {
      imtGroups.set(imtId, { nmIDs: /* @__PURE__ */ new Set(), category: resolveCategory2(card) });
    }
    const g = imtGroups.get(imtId);
    g.nmIDs.add(card.nmID);
  }
  if (imtGroups.size === 0) {
    log3.line("  No imtId groups found in WB cards");
    return { created: 0, assigned: 0 };
  }
  const allNmIds = [...new Set([...imtGroups.values()].flatMap((g) => [...g.nmIDs]))];
  const dbProducts = await prisma.product.findMany({
    where: { wbArticle: { in: allNmIds }, archivedAt: null },
    select: { id: true, wbArticle: true, sku: true, name: true, modelId: true }
  });
  const productByArticle = /* @__PURE__ */ new Map();
  for (const p of dbProducts) {
    const art = Number(p.wbArticle);
    if (art) productByArticle.set(art, p);
  }
  let created = 0;
  let assigned = 0;
  let skipped = 0;
  for (const [imtId, group] of imtGroups) {
    const bigIntId = toBigInt(imtId);
    const variantProducts = [...group.nmIDs].map((n) => productByArticle.get(n)).filter(Boolean);
    let model = await prisma.model.findFirst({ where: { imtId: bigIntId } });
    const catCounts = /* @__PURE__ */ new Map();
    for (const p of variantProducts) {
      catCounts.set(p.category, (catCounts.get(p.category) || 0) + 1);
    }
    let majorityCat = group.category || "crossbody";
    let maxCount = 0;
    for (const [cat, count] of catCounts) {
      if (count > maxCount) {
        maxCount = count;
        majorityCat = cat;
      }
    }
    if (model) {
      const skus = variantProducts.map((p) => p.sku).filter(Boolean);
      const names = [...new Set(variantProducts.map((p) => p.name).filter(Boolean))];
      const newName = deriveModelName(skus, names, majorityCat);
      const updates = {};
      if (newName !== model.name) updates.name = newName;
      if (majorityCat !== model.category) updates.category = majorityCat;
      if (Object.keys(updates).length > 0) {
        if (!flags2.dry) {
          await prisma.model.update({ where: { id: model.id }, data: updates });
          if (updates.name) log3.line(`  Renamed: ${model.id} \u2192 "${newName}"`);
          if (updates.category) log3.line(`  Re-categorized: ${model.id} \u2192 "${majorityCat}"`);
        }
      }
    } else {
      if (variantProducts.length < 2) {
        skipped++;
        continue;
      }
      const skus = variantProducts.map((p) => p.sku).filter(Boolean);
      const names = [...new Set(variantProducts.map((p) => p.name).filter(Boolean))];
      const modelName = deriveModelName(skus, names, majorityCat);
      const slug = `model-wb-${imtId}`;
      if (!flags2.dry) {
        model = await prisma.model.create({
          data: {
            id: slug,
            name: modelName,
            slug,
            category: majorityCat,
            description: "",
            imtId: bigIntId
          }
        });
        created++;
        log3.line(`  Created model: ${model.id} ("${modelName}")`);
      } else {
        created++;
        log3.line(`  Would create: ${slug} ("${modelName}")`);
      }
    }
    if (model) {
      for (const p of variantProducts) {
        if (p.modelId !== model.id) {
          if (!flags2.dry) {
            await prisma.product.update({
              where: { id: p.id },
              data: { modelId: model.id }
            });
          }
          assigned++;
          log3.line(`  Assigned ${p.id} \u2192 ${model.id}`);
        }
      }
    }
  }
  if (skipped > 0) {
    log3.line(`  Skipped (single variant): ${skipped} groups`);
  }
  return { created, assigned };
}
async function syncOzonModels(prisma, attrMap, log3) {
  const groups = /* @__PURE__ */ new Map();
  for (const [offerId, attrs] of attrMap) {
    if (!attrs?.attributes) continue;
    const modelAttr = attrs.attributes.find((a) => a.id === 9048);
    if (!modelAttr?.values?.length) continue;
    const vals = modelAttr.values.map((v) => v.value).filter(Boolean);
    if (vals.length === 0) continue;
    const key = vals.join(" ");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(offerId);
  }
  let created = 0;
  let assigned = 0;
  let skipped = 0;
  for (const [, offerIds] of groups) {
    const products = await prisma.product.findMany({
      where: { sku: { in: offerIds } },
      select: { id: true, sku: true, name: true, modelId: true, category: true }
    });
    if (products.length === 0) continue;
    const existingModelId = products.find((p) => p.modelId)?.modelId;
    if (existingModelId) {
      for (const p of products) {
        if (p.modelId !== existingModelId) {
          await prisma.product.update({ where: { id: p.id }, data: { modelId: existingModelId } });
          assigned++;
          log3.line(`  Assigned ${p.id} \u2192 ${existingModelId} (Ozon)`);
        }
      }
    } else {
      if (products.length < 2) {
        skipped++;
        continue;
      }
      const catCounts = /* @__PURE__ */ new Map();
      for (const p of products) catCounts.set(p.category, (catCounts.get(p.category) || 0) + 1);
      let majorityCat = products[0].category || "crossbody";
      let maxCount = 0;
      for (const [cat, c] of catCounts) {
        if (c > maxCount) {
          maxCount = c;
          majorityCat = cat;
        }
      }
      const skus = products.map((p) => p.sku).filter(Boolean);
      const names = [...new Set(products.map((p) => p.name).filter(Boolean))];
      const modelName = deriveModelName(skus, names, majorityCat);
      const slug = "model-ozon-" + modelName.toLowerCase().replace(/[/\s]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
      let model = await prisma.model.findFirst({ where: { slug } });
      if (!model) {
        model = await prisma.model.create({
          data: { id: slug, name: modelName, slug, category: majorityCat, description: "" }
        });
        created++;
        log3.line(`  Created Ozon model: ${model.id} ("${modelName}")`);
      }
      for (const p of products) {
        if (p.modelId !== model.id) {
          await prisma.product.update({ where: { id: p.id }, data: { modelId: model.id } });
          assigned++;
          log3.line(`  Assigned ${p.id} \u2192 ${model.id} (Ozon)`);
        }
      }
    }
  }
  if (skipped > 0) {
    log3.line(`  Skipped Ozon (single variant): ${skipped} groups`);
  }
  return { created, assigned };
}
async function archiveGoneProducts(prisma, dbProducts, wbArticles, ozonItems, trashArticles, wbChecked = true, ozonChecked = true, log3, flags2) {
  const wbSet = new Set(wbArticles);
  const trashSet = new Set(trashArticles);
  const ozonProductIdSet = new Set((ozonItems || []).map((i) => i.productId).filter(Boolean));
  const ozonSkuSet = new Set((ozonItems || []).map((i) => i.productSku).filter(Boolean));
  let archived = 0;
  let markedOutOfStock = 0;
  for (const db of dbProducts) {
    const wbArt = db.wbArticle ? Number(db.wbArticle) : null;
    const ozonArt = db.ozonArticle ? Number(db.ozonArticle) : null;
    if (!ozonChecked && ozonArt) continue;
    if (!wbChecked && wbArt) continue;
    const onWb = wbChecked && wbArt && wbSet.has(wbArt);
    const onOzon = ozonChecked && ozonArt && (ozonSkuSet.has(ozonArt) || ozonProductIdSet.has(ozonArt));
    const inWbTrash = wbArt && trashSet.has(wbArt);
    if (onWb || onOzon) {
      if (db.archivedAt) {
        if (!flags2.dry) {
          await prisma.product.update({
            where: { id: db.id },
            data: { archivedAt: null, inStock: true }
          });
        }
        log3.line(`  Restored: ${db.id} article=${wbArt || ozonArt} ${db.name}`);
      }
      continue;
    }
    if (db.archivedAt) continue;
    if (!flags2.dry) {
      await prisma.product.update({
        where: { id: db.id },
        data: { archivedAt: /* @__PURE__ */ new Date(), inStock: false }
      });
    }
    archived++;
    const reason = inWbTrash ? "WB trash" : "not on marketplace";
    log3.line(`  Archived (${reason}): ${db.id} article=${wbArt || ozonArt} ${db.name}`);
  }
  return { archived, markedOutOfStock };
}

// scripts/sync-all.mjs
var import_name_generator2 = __toESM(require_name_generator(), 1);
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// scripts/sync-modules/wb-cards-v4.mjs
import { gotScraping } from "got-scraping";
var CARD_WB_HOST = "https://card.wb.ru";
var CARD_WB_PATH = "/cards/v4/detail";
var DEST = "-1257786";
var SPP = 30;
var BATCH_SIZE = 15;
var REQUEST_TIMEOUT = 15e3;
var noopLog = {
  write: () => {
  },
  line: () => {
  },
  progress: () => {
  },
  detail: () => {
  }
};
function toRub(kopecks) {
  return kopecks != null ? Math.round(kopecks / 100) : null;
}
function batch(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
async function wbFetchCardsV4(_apiKey, log3 = noopLog, nmIds = []) {
  const cardMap = /* @__PURE__ */ new Map();
  if (nmIds.length === 0) {
    log3.line("  \u041D\u0435\u0442 nmId \u0434\u043B\u044F \u0437\u0430\u043F\u0440\u043E\u0441\u0430");
    return cardMap;
  }
  const batches = batch(nmIds, BATCH_SIZE);
  log3.write(`  card.wb.ru (${batches.length} \u0431\u0430\u0442\u0447\u0435\u0439)`);
  for (let i = 0; i < batches.length; i++) {
    const ids = batches[i];
    const url = `${CARD_WB_HOST}${CARD_WB_PATH}?nm=${ids.join(";")}&appType=1&curr=rub&dest=${DEST}&spp=${SPP}`;
    try {
      const response = await gotScraping({
        url,
        responseType: "json",
        timeout: { request: REQUEST_TIMEOUT },
        retry: { limit: 2 }
      });
      const data = response.body;
      const products = data?.products || [];
      for (const p of products) {
        const size = p.sizes?.[0];
        if (!size?.price?.product || size.price.product <= 0) {
          cardMap.set(p.id, {
            price: null,
            discountedPrice: null,
            stock: 0,
            rating: p.rating || null,
            feedbacks: p.feedbacks || null
          });
          continue;
        }
        cardMap.set(p.id, {
          price: toRub(size.price.product),
          // текущая цена на сайте
          discountedPrice: toRub(size.price.basic),
          // оригинал без скидки
          stock: p.totalQuantity ?? 0,
          // остаток (0 если нет)
          rating: p.rating,
          // звёздный рейтинг
          feedbacks: p.feedbacks ?? 0
          // количество отзывов
        });
      }
      log3.write(` ${cardMap.size}`);
    } catch (err) {
      const status = err.response?.statusCode || "";
      const body = err.response?.body;
      const detail = typeof body === "string" ? body.slice(0, 100) : err.message;
      log3.line(`
  [${i + 1}/${batches.length}] ${status} ${detail}`);
    }
  }
  log3.line(` \u2014 ${cardMap.size} \u0442\u043E\u0432\u0430\u0440\u043E\u0432`);
  return cardMap;
}

// node_modules/ozon-seller-sdk/dist/core/errors.js
var OzonError = class extends Error {
  name;
  requestId;
  timestamp;
  constructor(message, requestId) {
    super(message);
    this.name = this.constructor.name;
    this.requestId = requestId;
    this.timestamp = /* @__PURE__ */ new Date();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var ApiError = class _ApiError extends OzonError {
  status;
  code;
  details;
  headers;
  constructor(message, status, code, details, headers, requestId) {
    super(message, requestId);
    this.status = status;
    this.code = code ?? void 0;
    this.details = details ?? void 0;
    this.headers = headers ?? void 0;
  }
  static fromResponse(response, errorData, requestId) {
    const message = errorData?.message ?? response.statusText ?? "Unknown API error";
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    const status = response.status;
    if (status === 400) {
      return new BadRequestError(message, errorData?.code, errorData?.details, headers, requestId);
    }
    if (status === 401) {
      return new AuthenticationError(message, errorData?.code, errorData?.details, headers, requestId);
    }
    if (status === 403) {
      return new PermissionError(message, errorData?.code, errorData?.details, headers, requestId);
    }
    if (status === 404) {
      return new NotFoundError(message, errorData?.code, errorData?.details, headers, requestId);
    }
    if (status === 422) {
      return new ValidationError(message, errorData?.code, errorData?.details, headers, requestId);
    }
    if (status === 429) {
      return new RateLimitError(message, errorData?.code, errorData?.details, headers, requestId);
    }
    if (status >= 500) {
      return new InternalServerError(message, errorData?.code, errorData?.details, headers, requestId);
    }
    return new _ApiError(message, status, errorData?.code, errorData?.details, headers, requestId);
  }
};
var BadRequestError = class extends ApiError {
  constructor(message, code, details, headers, requestId) {
    super(message, 400, code, details, headers, requestId);
  }
};
var AuthenticationError = class extends ApiError {
  constructor(message, code, details, headers, requestId) {
    super(message, 401, code, details, headers, requestId);
  }
};
var PermissionError = class extends ApiError {
  constructor(message, code, details, headers, requestId) {
    super(message, 403, code, details, headers, requestId);
  }
};
var NotFoundError = class extends ApiError {
  constructor(message, code, details, headers, requestId) {
    super(message, 404, code, details, headers, requestId);
  }
};
var ValidationError = class extends ApiError {
  constructor(message, code, details, headers, requestId) {
    super(message, 422, code, details, headers, requestId);
  }
};
var RateLimitError = class extends ApiError {
  retryAfter;
  constructor(message, code, details, headers, requestId) {
    super(message, 429, code, details, headers, requestId);
    const retryAfterHeader = headers?.["retry-after"] ?? headers?.["Retry-After"];
    if (retryAfterHeader) {
      this.retryAfter = parseInt(retryAfterHeader, 10);
    }
  }
};
var InternalServerError = class extends ApiError {
  constructor(message, code, details, headers, requestId) {
    super(message, 500, code, details, headers, requestId);
  }
};
var ConnectionError = class extends OzonError {
  cause;
  constructor(message, cause, requestId) {
    super(message, requestId);
    this.cause = cause ?? void 0;
  }
};
var TimeoutError = class extends OzonError {
  timeout;
  constructor(message, timeout, requestId) {
    super(message, requestId);
    this.timeout = timeout;
  }
};
var ConfigurationError = class extends OzonError {
  constructor(message) {
    super(message);
  }
};
var isRetryableError = (error) => {
  if (error instanceof RateLimitError)
    return true;
  if (error instanceof InternalServerError)
    return true;
  if (error instanceof ConnectionError)
    return true;
  if (error instanceof TimeoutError)
    return true;
  if (error instanceof ApiError) {
    return error.status === 502 || error.status === 503 || error.status === 504;
  }
  return false;
};
var getRetryDelay = (error, attempt) => {
  if (error instanceof RateLimitError && error.retryAfter) {
    return error.retryAfter * 1e3;
  }
  return Math.min(1e3 * Math.pow(2, attempt), 16e3);
};

// node_modules/ozon-seller-sdk/dist/core/types.js
var Language;
(function(Language2) {
  Language2["RU"] = "ru";
  Language2["EN"] = "en";
})(Language || (Language = {}));
var Currency;
(function(Currency2) {
  Currency2["RUB"] = "RUB";
  Currency2["USD"] = "USD";
  Currency2["EUR"] = "EUR";
})(Currency || (Currency = {}));
var createRequestId = () => `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
var createIdempotencyKey = () => `idem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// node_modules/ozon-seller-sdk/dist/core/http.js
var DEFAULT_BASE_URL = "https://api-seller.ozon.ru";
var DEFAULT_TIMEOUT = 3e4;
var DEFAULT_RETRIES = 3;
var DEFAULT_USER_AGENT = "ozon-seller-sdk/3.0.0";
var HttpClient = class {
  config;
  baseHeaders;
  constructor(config) {
    this.validateConfig(config);
    this.config = {
      ...config,
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
      retries: config.retries ?? DEFAULT_RETRIES,
      userAgent: config.userAgent ?? DEFAULT_USER_AGENT
    };
    this.baseHeaders = {
      "Content-Type": "application/json",
      "User-Agent": this.config.userAgent,
      "Client-Id": this.config.clientId,
      "Api-Key": this.config.apiKey
    };
  }
  /**
   * Make an HTTP request with automatic retry logic
   */
  async request(method, path, data, options = {}) {
    const requestId = createRequestId();
    const url = new URL(path, this.config.baseUrl).toString();
    const requestOptions = {
      timeout: options.timeout ?? this.config.timeout,
      retries: options.retries ?? this.config.retries,
      ...options
    };
    return this.executeWithRetry(() => this.executeRequest(method, url, data, requestOptions, requestId), requestOptions.retries, requestId);
  }
  /**
   * GET request
   */
  async get(path, options) {
    return this.request("GET", path, void 0, options);
  }
  /**
   * POST request
   */
  async post(path, data, options) {
    return this.request("POST", path, data, options);
  }
  /**
   * PUT request
   */
  async put(path, data, options) {
    return this.request("PUT", path, data, options);
  }
  /**
   * DELETE request
   */
  async delete(path, options) {
    return this.request("DELETE", path, void 0, options);
  }
  /**
   * Execute a single HTTP request
   */
  async executeRequest(method, url, data, options, requestId) {
    const headers = {
      ...this.baseHeaders,
      ...options.headers,
      "X-Request-ID": requestId
    };
    if (method === "POST" || method === "PUT" || method === "PATCH") {
      const idempotencyKey = options.idempotencyKey ?? createIdempotencyKey();
      headers["Idempotency-Key"] = idempotencyKey;
    }
    const fetchOptions = {
      method,
      headers,
      signal: options.signal ?? null
    };
    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      fetchOptions.body = JSON.stringify(data);
    }
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new TimeoutError(`Request timeout after ${options.timeout}ms`, options.timeout, requestId));
        }, options.timeout);
      });
      const response = await Promise.race([fetch(url, fetchOptions), timeoutPromise]);
      return this.handleResponse(response, requestId);
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw error;
      }
      throw new ConnectionError(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`, error instanceof Error ? error : void 0, requestId);
    }
  }
  /**
   * Handle HTTP response and parse result
   */
  async handleResponse(response, requestId) {
    let responseData;
    try {
      const text = await response.text();
      responseData = text ? JSON.parse(text) : {};
    } catch (error) {
      throw new ApiError("Invalid JSON response from server", response.status, "INVALID_JSON", void 0, this.extractHeaders(response), requestId);
    }
    if (!response.ok) {
      const errorData = this.extractErrorData(responseData);
      throw ApiError.fromResponse(response, errorData, requestId);
    }
    return responseData;
  }
  /**
   * Execute request with retry logic
   */
  async executeWithRetry(operation, maxRetries, requestId, attempt = 0) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= maxRetries || !isRetryableError(error)) {
        throw error;
      }
      const delay = getRetryDelay(error, attempt);
      if (typeof process !== "undefined" && process.env?.["NODE_ENV"] !== "test") {
        console.warn(`Request ${requestId} failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
      }
      await this.sleep(delay);
      return this.executeWithRetry(operation, maxRetries, requestId, attempt + 1);
    }
  }
  /**
   * Extract error data from response
   */
  extractErrorData(responseData) {
    if (typeof responseData === "object" && responseData !== null) {
      const data = responseData;
      if ("error" in data && typeof data["error"] === "object" && data["error"] !== null) {
        const error = data["error"];
        return {
          code: typeof error["code"] === "string" ? error["code"] : void 0,
          message: typeof error["message"] === "string" ? error["message"] : "Unknown error",
          details: Array.isArray(error["details"]) ? error["details"] : void 0
        };
      }
      if ("message" in data && typeof data["message"] === "string") {
        return {
          message: data["message"],
          code: typeof data["code"] === "string" ? data["code"] : void 0
        };
      }
    }
    return void 0;
  }
  /**
   * Extract headers from response
   */
  extractHeaders(response) {
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }
  /**
   * Sleep utility for retry delays
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * Validate SDK configuration
   */
  validateConfig(config) {
    if (!config.apiKey) {
      throw new ConfigurationError("API key is required");
    }
    if (!config.clientId) {
      throw new ConfigurationError("Client ID is required");
    }
    if (config.timeout !== void 0 && (config.timeout < 1e3 || config.timeout > 3e5)) {
      throw new ConfigurationError("Timeout must be between 1000ms and 300000ms");
    }
    if (config.retries !== void 0 && (config.retries < 0 || config.retries > 10)) {
      throw new ConfigurationError("Retries must be between 0 and 10");
    }
  }
};

// node_modules/ozon-seller-sdk/dist/core/auth.js
var AuthManager = class {
  credentials;
  constructor(credentials) {
    this.validateCredentials(credentials);
    this.credentials = credentials;
  }
  /**
   * Get authentication headers for API requests
   */
  getAuthHeaders() {
    return {
      "Client-Id": this.credentials.clientId,
      "Api-Key": this.credentials.apiKey
    };
  }
  /**
   * Validate API credentials format
   */
  validateCredentials(credentials) {
    if (!credentials.apiKey || credentials.apiKey.trim().length === 0) {
      throw new ConfigurationError("API key is required and cannot be empty");
    }
    if (!credentials.clientId || credentials.clientId.trim().length === 0) {
      throw new ConfigurationError("Client ID is required and cannot be empty");
    }
    if (credentials.clientId.length < 1) {
      throw new ConfigurationError("Client ID must be a non-empty string");
    }
    if (credentials.apiKey.length < 20) {
      throw new ConfigurationError("API key appears to be too short");
    }
  }
  /**
   * Check if credentials are valid (basic format check)
   */
  isValid() {
    try {
      this.validateCredentials(this.credentials);
      return true;
    } catch {
      return false;
    }
  }
  /**
   * Get masked credentials for logging (security)
   */
  getMaskedCredentials() {
    return {
      clientId: `*****${this.credentials.clientId.substring(this.credentials.clientId.length - 2)}*****`,
      apiKey: `*****${this.credentials.apiKey.substring(this.credentials.apiKey.length - 4)}*****`
    };
  }
};

// node_modules/ozon-seller-sdk/dist/categories/product/index.js
var ProductApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Перенести товар в архив */
  async archive(request, options) {
    return this.httpClient.request("POST", "/v1/product/archive", request, options);
  }
  /** Разархивировать товары */
  async unarchive(request, options) {
    return this.httpClient.request("POST", "/v1/product/unarchive", request, options);
  }
  /** Список товаров */
  async getList(request, options) {
    return this.httpClient.request("POST", "/v3/product/list", request, options);
  }
  /** Обновить атрибуты товаров */
  async updateAttributes(request, options) {
    return this.httpClient.request("POST", "/v1/product/attributes/update", request, options);
  }
  /** Создать товар по SKU */
  async importBySku(request, options) {
    return this.httpClient.request("POST", "/v1/product/import-by-sku", request, options);
  }
  /** Получить статус импорта товара */
  async getImportInfo(request, options) {
    return this.httpClient.request("POST", "/v1/product/import/info", request, options);
  }
  /** Получить информацию о товаре */
  async getInfo(request, options) {
    return this.httpClient.request("POST", "/v2/product/info", request, options);
  }
  /** Получить остатки товаров */
  async getStocks(request, options) {
    return this.httpClient.request("POST", "/v3/product/info/stocks", request, options);
  }
  /** Получить информацию о цене товара (v5) */
  async getPrices(request, options) {
    return this.httpClient.request("POST", "/v5/product/info/prices", request, options);
  }
  /** Получить атрибуты товаров */
  async getAttributes(request, options) {
    return this.httpClient.request("POST", "/v4/product/info/attributes", request, options);
  }
  /** Получить типы сертификатов */
  async getCertificateTypes(options) {
    return this.httpClient.request("POST", "/v1/product/certificate-types", {}, options);
  }
  /** Узнать информацию об уценке и основном товаре по SKU уценённого товара */
  async getDiscountedInfo(request, options) {
    return this.httpClient.request("POST", "/v1/product/info/discounted", request, options);
  }
  /** Получить описание товара */
  async getProductDescription(request, options) {
    return this.httpClient.request("POST", "/v1/product/info/description", request, options);
  }
  /** Получить количество подписавшихся на товар */
  async getProductSubscription(request, options) {
    return this.httpClient.request("POST", "/v1/product/info/subscription", request, options);
  }
  /** Импорт изображений товара */
  async importPictures(request, options) {
    return this.httpClient.request("POST", "/v1/product/pictures/import", request, options);
  }
  /** Получить изображения товаров */
  async getPictures(request, options) {
    return this.httpClient.request("POST", "/v2/product/pictures/info", request, options);
  }
  /** Получить контент-рейтинг товаров по SKU */
  async getProductRating(request, options) {
    return this.httpClient.request("POST", "/v1/product/rating-by-sku", request, options);
  }
  /** Получить связанные SKU */
  async getRelatedSKU(request, options) {
    return this.httpClient.request("POST", "/v1/product/related-sku/get", request, options);
  }
  /** Обновить артикулы товаров */
  async updateOfferID(request, options) {
    return this.httpClient.request("POST", "/v1/product/update/offer-id", request, options);
  }
  /** Удалить товары без SKU */
  async deleteProducts(request, options) {
    return this.httpClient.request("POST", "/v2/products/delete", request, options);
  }
  /** Создать или обновить товар */
  async importProducts(request, options) {
    return this.httpClient.request("POST", "/v3/product/import", request, options);
  }
  /** Получить информацию о товарах v3 */
  async getProductInfoListV3(request, options) {
    return this.httpClient.request("POST", "/v3/product/info/list", request, options);
  }
  /** Получить список товаров v3 */
  async getListV3(request, options) {
    return this.httpClient.request("POST", "/v3/product/list", request, options);
  }
  /** Получить лимиты на ассортимент */
  async getUploadQuota(request, options) {
    return this.httpClient.request("POST", "/v4/product/info/limit", request, options);
  }
  /** Получить описание товара */
  async getDescription(request, options) {
    return this.httpClient.request("POST", "/v1/product/info/description", request, options);
  }
  /** Количество подписавшихся на товар пользователей */
  async getSubscription(request, options) {
    return this.httpClient.request("POST", "/v1/product/info/subscription", request, options);
  }
  /** Получить информацию о товарах с неверным весом или размером */
  async getWrongVolumeProducts(request, options) {
    return this.httpClient.request("POST", "/v1/product/info/wrong-volume", request, options);
  }
  /** Получить информацию о зоне размещения товаров */
  async getPlacementZoneInfo(request, options) {
    return this.httpClient.request("POST", "/v1/product/placement-zone/info", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/analytics/index.js
var AnalyticsApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Получить аналитику по среднему времени доставки */
  async getAverageDeliveryTime(request, options) {
    return this.httpClient.request("POST", "/v1/analytics/average-delivery-time", request, options);
  }
  /** Получить детальную аналитику по среднему времени доставки */
  async getAverageDeliveryTimeDetails(request, options) {
    return this.httpClient.request("POST", "/v1/analytics/average-delivery-time/details", request, options);
  }
  /** Получить общую аналитику по среднему времени доставки */
  async getAverageDeliveryTimeSummary(options) {
    return this.httpClient.request("POST", "/v1/analytics/average-delivery-time/summary", {}, options);
  }
  /** Оборачиваемость товара */
  async getStocksTurnover(request, options) {
    return this.httpClient.request("POST", "/v1/analytics/turnover/stocks", request, options);
  }
  /** Отчёт по остаткам и товарам */
  async getStockOnWarehouses(request, options) {
    return this.httpClient.request("POST", "/v2/analytics/stock_on_warehouses", request, options);
  }
  /** Получить аналитику по остаткам */
  async getAnalyticsStocks(request, options) {
    return this.httpClient.request("POST", "/v1/analytics/stocks", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/finance/index.js
var FinanceApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Отчёт о компенсациях */
  async createCompensationReport(request, options) {
    return this.httpClient.request("POST", "/v1/finance/compensation", request, options);
  }
  /** Отчёт о декомпенсациях */
  async createDecompensationReport(request, options) {
    return this.httpClient.request("POST", "/v1/finance/decompensation", request, options);
  }
  /** Реестр продаж юридическим лицам */
  async createDocumentB2BSalesReport(request, options) {
    return this.httpClient.request("POST", "/v1/finance/document-b2b-sales", request, options);
  }
  /** Реестр продаж юридическим лицам в JSON */
  async createDocumentB2BSalesJSONReport(request, options) {
    return this.httpClient.request("POST", "/v1/finance/document-b2b-sales/json", request, options);
  }
  /** Отчёт о взаиморасчётах */
  async createMutualSettlementReport(request, options) {
    return this.httpClient.request("POST", "/v1/finance/mutual-settlement", request, options);
  }
  /** Отчёт о выкупленных товарах */
  async getProductsBuyout(request, options) {
    return this.httpClient.request("POST", "/v1/finance/products/buyout", request, options);
  }
  /** Отчёт о реализации товаров (позаказный) */
  async getRealizationReportPosting(request, options) {
    return this.httpClient.request("POST", "/v1/finance/realization/posting", request, options);
  }
  /** Отчёт о реализации товаров v2 */
  async getRealizationReportV2(request, options) {
    return this.httpClient.request("POST", "/v2/finance/realization", request, options);
  }
  /** Список транзакций v3 */
  async getTransactionList(request, options) {
    return this.httpClient.request("POST", "/v3/finance/transaction/list", request, options);
  }
  /** Итоги по транзакциям v3 */
  async getTransactionTotals(request, options) {
    return this.httpClient.request("POST", "/v3/finance/transaction/totals", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/pricing-strategy/index.js
var PricingStrategyApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Список конкурентов */
  async getCompetitors(request, options) {
    return this.httpClient.request("POST", "/v1/pricing-strategy/competitors/list", request, options);
  }
  /** Создать стратегию */
  async createStrategy(request, options) {
    return this.httpClient.request("POST", "/v1/pricing-strategy/create", request, options);
  }
  /** Удалить стратегию */
  async deleteStrategy(request, options) {
    return this.httpClient.request("POST", "/v1/pricing-strategy/delete", request, options);
  }
  /** Информация о стратегии */
  async getStrategyInfo(request, options) {
    return this.httpClient.request("POST", "/v1/pricing-strategy/info", request, options);
  }
  /** Список стратегий */
  async getStrategiesList(request, options) {
    return this.httpClient.request("POST", "/v1/pricing-strategy/list", request, options);
  }
  /** Цена товара у конкурента */
  async getStrategyItemInfo(request, options) {
    return this.httpClient.request("POST", "/v1/pricing-strategy/product/info", request, options);
  }
  /** Добавить товары в стратегию */
  async addItemsToStrategy(request, options) {
    return this.httpClient.request("POST", "/v1/pricing-strategy/products/add", request, options);
  }
  /** Удалить товары из стратегии */
  async removeItemsFromStrategy(request, options) {
    return this.httpClient.request("POST", "/v1/pricing-strategy/products/delete", request, options);
  }
  /** Список товаров в стратегии */
  async getStrategyItems(request, options) {
    return this.httpClient.request("POST", "/v1/pricing-strategy/products/list", request, options);
  }
  /** Изменить статус стратегии */
  async updateStrategyStatus(request, options) {
    return this.httpClient.request("POST", "/v1/pricing-strategy/status", request, options);
  }
  /** Список идентификаторов стратегий */
  async getStrategyIDsByItemIDs(request, options) {
    return this.httpClient.request("POST", "/v1/pricing-strategy/strategy-ids-by-product-ids", request, options);
  }
  /** Обновить стратегию */
  async updateStrategy(request, options) {
    return this.httpClient.request("POST", "/v1/pricing-strategy/update", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/returns/index.js
var ReturnsApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Информация о возвратах FBO и FBS */
  async getList(request, options) {
    return this.httpClient.request("POST", "/v1/returns/list", request, options);
  }
  /** Получить историю настроек утилизации */
  async getUtilizationHistory(request, options) {
    return this.httpClient.request("POST", "/v1/returns/settings/utilization/history", request, options);
  }
  /** Получить информацию о настройках утилизации */
  async getUtilizationInfo(request, options) {
    return this.httpClient.request("POST", "/v1/returns/settings/utilization/info", request, options);
  }
  /** Обновить настройки утилизации */
  async updateUtilization(request, options) {
    return this.httpClient.request("POST", "/v1/returns/settings/utilization/update", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/return/index.js
var ReturnApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Получить значение штрихкода для возвратных отгрузок */
  async getGiveoutBarcode(options) {
    return this.httpClient.request("POST", "/v1/return/giveout/barcode", {}, options);
  }
  /** Сгенерировать новый штрихкод */
  async resetGiveoutBarcode(options) {
    return this.httpClient.request("POST", "/v1/return/giveout/barcode-reset", {}, options);
  }
  /** Получить штрихкод в формате PDF */
  async getGiveoutPDF(options) {
    return this.httpClient.request("POST", "/v1/return/giveout/get-pdf", {}, options);
  }
  /** Получить штрихкод в формате PNG */
  async getGiveoutPNG(options) {
    return this.httpClient.request("POST", "/v1/return/giveout/get-png", {}, options);
  }
  /** Информация о возвратной отгрузке */
  async getGiveoutInfo(request, options) {
    return this.httpClient.request("POST", "/v1/return/giveout/info", request, options);
  }
  /** Проверить возможность получения возвратных отгрузок по штрихкоду */
  async isGiveoutEnabled(options) {
    return this.httpClient.request("POST", "/v1/return/giveout/is-enabled", {}, options);
  }
  /** Список возвратных отгрузок */
  async getGiveoutList(request, options) {
    return this.httpClient.request("POST", "/v1/return/giveout/list", request, options);
  }
  /** Количество возвратов FBS */
  async getReturnsCompanyFbsInfo(request, options) {
    return this.httpClient.request("POST", "/v1/returns/company/fbs/info", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/quants/index.js
var QuantsApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Информация об эконом-товаре */
  async getInfo(request, options) {
    return this.httpClient.request("POST", "/v1/product/quant/info", request, options);
  }
  /** Список эконом-товаров */
  async getList(request, options) {
    return this.httpClient.request("POST", "/v1/product/quant/list", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/review/index.js
var ReviewApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Изменить статус отзывов */
  async changeStatus(request, options) {
    return this.httpClient.request("POST", "/v1/review/change-status", request, options);
  }
  /** Оставить комментарий на отзыв */
  async createComment(request, options) {
    return this.httpClient.request("POST", "/v1/review/comment/create", request, options);
  }
  /** Удалить комментарий на отзыв */
  async deleteComment(request, options) {
    return this.httpClient.request("POST", "/v1/review/comment/delete", request, options);
  }
  /** Список комментариев на отзыв */
  async getCommentList(request, options) {
    return this.httpClient.request("POST", "/v1/review/comment/list", request, options);
  }
  /** Количество отзывов по статусам */
  async getCount(request, options) {
    return this.httpClient.request("POST", "/v1/review/count", request, options);
  }
  /** Получить информацию об отзыве */
  async getInfo(request, options) {
    return this.httpClient.request("POST", "/v1/review/info", request, options);
  }
  /** Получить список отзывов */
  async getList(request, options) {
    return this.httpClient.request("POST", "/v1/review/list", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/chat/index.js
var ChatApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Создать новый чат */
  async startChat(request, options) {
    return this.httpClient.request("POST", "/v1/chat/start", request, options);
  }
  /** Отправить сообщение */
  async sendMessage(request, options) {
    return this.httpClient.request("POST", "/v1/chat/send/message", request, options);
  }
  /** Отправить файл */
  async sendFile(request, options) {
    return this.httpClient.request("POST", "/v1/chat/send/file", request, options);
  }
  /** Отметить сообщения как прочитанные */
  async markAsRead(request, options) {
    return this.httpClient.request("POST", "/v2/chat/read", request, options);
  }
  async getChatHistoryV2(request, options) {
    return this.httpClient.request("POST", "/v2/chat/history", request, options);
  }
  /** История чата */
  async getChatHistoryV3(request, options) {
    return this.httpClient.request("POST", "/v3/chat/history", request, options);
  }
  /** Список чатов */
  async getChatListV2(request, options) {
    return this.httpClient.request("POST", "/v2/chat/list", request, options);
  }
  /** Список чатов */
  async getChatListV3(request, options) {
    return this.httpClient.request("POST", "/v3/chat/list", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/questions-answers/index.js
var QuestionsAnswersApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Создать ответ на вопрос */
  async createAnswer(request, options) {
    return this.httpClient.request("POST", "/v1/question/answer/create", request, options);
  }
  /** Удалить ответ на вопрос */
  async deleteAnswer(request, options) {
    return this.httpClient.request("POST", "/v1/question/answer/delete", request, options);
  }
  /** Список ответов на вопрос */
  async getAnswerList(request, options) {
    return this.httpClient.request("POST", "/v1/question/answer/list", request, options);
  }
  /** Изменить статус вопросов */
  async changeQuestionStatus(request, options) {
    return this.httpClient.request("POST", "/v1/question/change-status", request, options);
  }
  /** Количество вопросов по статусам */
  async getQuestionCount(request, options) {
    return this.httpClient.request("POST", "/v1/question/count", request, options);
  }
  /** Информация о вопросе */
  async getQuestionInfo(request, options) {
    return this.httpClient.request("POST", "/v1/question/info", request, options);
  }
  /** Список вопросов */
  async getQuestionList(request, options) {
    return this.httpClient.request("POST", "/v1/question/list", request, options);
  }
  /** Товары с наибольшим количеством вопросов */
  async getTopQuestionedProducts(request, options) {
    return this.httpClient.request("POST", "/v1/question/top-sku", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/brand/index.js
var BrandApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Список сертифицируемых брендов */
  async getCertificationList(request, options) {
    return this.httpClient.request("POST", "/v1/brand/company-certification/list", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/certification/index.js
var CertificationApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Список сертификатов */
  async getCertificateList(request, options) {
    return this.httpClient.request("POST", "/v1/product/certificate/list", request, options);
  }
  /** Привязать сертификат к товару */
  async bindCertificate(request, options) {
    return this.httpClient.request("POST", "/v1/product/certificate/bind", request, options);
  }
  /** Добавить сертификаты для товаров */
  async createCertificate(request, options) {
    return this.httpClient.request("POST", "/v1/product/certificate/create", request, options);
  }
  /** Удалить сертификат */
  async deleteCertificates(request, options) {
    return this.httpClient.request("POST", "/v1/product/certificate/delete", request, options);
  }
  /** Информация о сертификате */
  async getCertificateInfo(request, options) {
    return this.httpClient.request("POST", "/v1/product/certificate/info", request, options);
  }
  /** Список товаров, привязанных к сертификату */
  async getCertificateProductsList(request, options) {
    return this.httpClient.request("POST", "/v1/product/certificate/products/list", request, options);
  }
  /** Список возможных статусов товаров */
  async getProductStatusList(request, options) {
    return this.httpClient.request("POST", "/v1/product/certificate/product_status/list", request, options);
  }
  /** Возможные причины отклонения сертификата */
  async getRejectionReasons(request, options) {
    return this.httpClient.request("POST", "/v1/product/certificate/rejection_reasons/list", request, options);
  }
  /** Возможные статусы сертификатов */
  async getCertificateStatuses(request, options) {
    return this.httpClient.request("POST", "/v1/product/certificate/status/list", request, options);
  }
  /** Справочник типов документов */
  async getCertificateTypes(options) {
    return this.httpClient.request("GET", "/v1/product/certificate/types", void 0, options);
  }
  /** Отвязать товар от сертификата */
  async unbindCertificate(request, options) {
    return this.httpClient.request("POST", "/v1/product/certificate/unbind", request, options);
  }
  /** Получить список сертифицируемых категорий (v1 - устарел) */
  async getProductCertificationList(request, options) {
    return this.httpClient.request("POST", "/v1/product/certification/list", request, options);
  }
  /** Список типов соответствия требованиям (версия 1) */
  async getCertificateAccordanceTypesV1(options) {
    return this.httpClient.request("GET", "/v1/product/certificate/accordance-types", void 0, options);
  }
  /** Список типов соответствия требованиям (версия 2) */
  async getCertificateAccordanceTypesV2(options) {
    return this.httpClient.request("GET", "/v2/product/certificate/accordance-types/list", void 0, options);
  }
  /** Список сертифицируемых категорий */
  async getProductCertificationListV2(request, options) {
    return this.httpClient.request("POST", "/v2/product/certification/list", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/fbs/index.js
var FbsApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Причины отмены отправления */
  async getCancelReasons(request, options) {
    return this.httpClient.request("POST", "/v1/posting/fbs/cancel-reason", request, options);
  }
  /** Причины отмены отправлений */
  async getCancelReasonsList(options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/cancel-reason/list", {}, options);
  }
  /** Создать задание на выгрузку этикеток (v1 - устарел) */
  async createLabelBatch(request, options) {
    return this.httpClient.request("POST", "/v1/posting/fbs/package-label/create", request, options);
  }
  /** Создать задание на формирование этикеток */
  async createLabelBatchV2(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/package-label/create", request, options);
  }
  /** Получить файл с этикетками */
  async getLabelBatch(request, options) {
    return this.httpClient.request("POST", "/v1/posting/fbs/package-label/get", request, options);
  }
  /** Напечатать этикетку */
  async packageLabel(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/package-label", request, options);
  }
  /** Проверить код курьера */
  async verifyPickupCode(request, options) {
    return this.httpClient.request("POST", "/v1/posting/fbs/pick-up-code/verify", request, options);
  }
  /** Получить ограничения пункта приёма */
  async getRestrictions(request, options) {
    return this.httpClient.request("POST", "/v1/posting/fbs/restrictions", request, options);
  }
  /** Открыть спор по отправлению */
  async moveToArbitration(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/arbitration", request, options);
  }
  /** Передать отправление к отгрузке */
  async moveToAwaitingDelivery(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/awaiting-delivery", request, options);
  }
  /** Отменить отправление */
  async cancelPosting(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/cancel", request, options);
  }
  /** Получить информацию об отправлении по штрихкоду */
  async getPostingByBarcode(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/get-by-barcode", request, options);
  }
  /** Отменить отправку некоторых товаров в отправлении */
  async cancelProducts(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/product/cancel", request, options);
  }
  async changeProducts(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/product/change", request, options);
  }
  /** Список доступных стран-изготовителей */
  async getProductCountriesList(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/product/country/list", request, options);
  }
  /** Добавить информацию о стране-изготовителе товара */
  async setProductCountry(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/product/country/set", request, options);
  }
  /** Получить информацию об отправлении по идентификатору */
  async getPostingV3(request, options) {
    return this.httpClient.request("POST", "/v3/posting/fbs/get", request, options);
  }
  /** Список отправлений */
  async getPostingListV3(request, options) {
    return this.httpClient.request("POST", "/v3/posting/fbs/list", request, options);
  }
  /** Список необработанных отправлений */
  async getUnfulfilledListV3(request, options) {
    return this.httpClient.request("POST", "/v3/posting/fbs/unfulfilled/list", request, options);
  }
  /** Указать количество коробок для многокоробочных отправлений */
  async setMultiBoxQtyV3(request, options) {
    return this.httpClient.request("POST", "/v3/posting/multiboxqty/set", request, options);
  }
  /** Таможенные декларации ETGB */
  async getEtgb(request, options) {
    return this.httpClient.request("POST", "/v1/posting/global/etgb", request, options);
  }
  /** Список неоплаченных товаров, заказанных юридическими лицами */
  async getUnpaidLegalProductList(request, options) {
    return this.httpClient.request("POST", "/v1/posting/unpaid-legal/product/list", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/delivery-fbs/index.js
var DeliveryFbsApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Подтверждение отгрузки */
  async approveCarriage(request, options) {
    return this.httpClient.request("POST", "/v1/carriage/approve", request, options);
  }
  /** Удаление отгрузки */
  async cancelCarriage(request, options) {
    return this.httpClient.request("POST", "/v1/carriage/cancel", request, options);
  }
  /** Создание отгрузки */
  async createCarriage(request, options) {
    return this.httpClient.request("POST", "/v1/carriage/create", request, options);
  }
  /** Список методов доставки и отгрузок */
  async getCarriageDeliveryList(request, options) {
    return this.httpClient.request("POST", "/v1/carriage/delivery/list", request, options);
  }
  /** Информация о перевозке */
  async getCarriage(request, options) {
    return this.httpClient.request("POST", "/v1/carriage/get", request, options);
  }
  /** Изменение состава отгрузки */
  async setPostings(request, options) {
    return this.httpClient.request("POST", "/v1/carriage/set-postings", request, options);
  }
  /** Список доступных перевозок */
  async getCarriageAvailableList(request, options) {
    return this.httpClient.request("POST", "/v1/posting/carriage-available/list", request, options);
  }
  /** Разделить заказ на отправления без сборки */
  async splitPosting(request, options) {
    return this.httpClient.request("POST", "/v1/posting/fbs/split", request, options);
  }
  /** Статус отгрузки и документов */
  async checkActStatus(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/act/check-status", request, options);
  }
  /** Подтвердить отгрузку и создать документы */
  async createAct(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/act/create", request, options);
  }
  /** Штрихкод для отгрузки отправления */
  async getBarcode(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/act/get-barcode", request, options);
  }
  /** Значение штрихкода для отгрузки отправления */
  async getBarcodeText(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/act/get-barcode/text", request, options);
  }
  /** Этикетки для грузового места */
  async getContainerLabels(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/act/get-container-labels", request, options);
  }
  /** Получить PDF c документами */
  async getAct(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/act/get-pdf", request, options);
  }
  /** Список отправлений в акте */
  async getActPostings(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/act/get-postings", request, options);
  }
  /** Список актов по отгрузкам */
  async getActList(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/act/list", request, options);
  }
  /** Статус формирования накладной */
  async checkDigitalActStatus(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/digital/act/check-status", request, options);
  }
  /** Получить лист отгрузки по перевозке */
  async getDigitalAct(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbs/digital/act/get-pdf", request, options);
  }
  /** Список отправлений для сборки перевозки */
  async getAssemblyCarriagePostingList(request, options) {
    return this.httpClient.request("POST", "/v1/assembly/carriage/posting/list", request, options);
  }
  /** Список товаров для сборки перевозки */
  async getAssemblyCarriageProductList(request, options) {
    return this.httpClient.request("POST", "/v1/assembly/carriage/product/list", request, options);
  }
  /** Список отправлений для сборки FBS */
  async getAssemblyFbsPostingList(request, options) {
    return this.httpClient.request("POST", "/v1/assembly/fbs/posting/list", request, options);
  }
  /** Список товаров для сборки FBS */
  async getAssemblyFbsProductList(request, options) {
    return this.httpClient.request("POST", "/v1/assembly/fbs/product/list", request, options);
  }
  /** Получить статус ЭТТН перевозки */
  async getCarriageEttnStatus(request, options) {
    return this.httpClient.request("POST", "/v1/carriage/ettn/status", request, options);
  }
  /** Список методов доставки и отгрузок (v2) */
  async getCarriageDeliveryListV2(request, options) {
    return this.httpClient.request("POST", "/v2/carriage/delivery/list", request, options);
  }
  /** Получить прослеживаемый атрибут товара FBS */
  async getProductTraceableAttribute(request, options) {
    return this.httpClient.request("POST", "/v1/posting/fbs/product/traceable/attribute", request, options);
  }
  /** Разделить прослеживаемый заказ на отправления */
  async splitTraceablePosting(request, options) {
    return this.httpClient.request("POST", "/v1/posting/fbs/traceable/split", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/delivery-rfbs/index.js
var DeliveryRfbsApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Уточнить дату отгрузки отправления */
  async setCutoff(request, options) {
    return this.httpClient.request("POST", "/v1/posting/cutoff/set", request, options);
  }
  /** Доступные даты для переноса доставки */
  async getTimeslotChangeRestrictions(request, options) {
    return this.httpClient.request("POST", "/v1/posting/fbs/timeslot/change-restrictions", request, options);
  }
  /** Перенести дату доставки */
  async setTimeslot(request, options) {
    return this.httpClient.request("POST", "/v1/posting/fbs/timeslot/set", request, options);
  }
  /** Изменить статус на "Доставлено" */
  async setDelivered(request, options) {
    return this.httpClient.request("POST", "/v2/fbs/posting/delivered", request, options);
  }
  /** Изменить статус на "Доставляется" */
  async setDelivering(request, options) {
    return this.httpClient.request("POST", "/v2/fbs/posting/delivering", request, options);
  }
  /** Изменить статус на "Последняя миля" */
  async setLastMile(request, options) {
    return this.httpClient.request("POST", "/v2/fbs/posting/last-mile", request, options);
  }
  async setSentBySeller(request, options) {
    return this.httpClient.request("POST", "/v2/fbs/posting/sent-by-seller", request, options);
  }
  /** Добавить трек-номера */
  async setTrackingNumbers(request, options) {
    return this.httpClient.request("POST", "/v2/fbs/posting/tracking-number/set", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/fbo/index.js
var FboApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Получить список причин отмены отправлений FBO */
  async getCancelReasons(request, options) {
    return this.httpClient.request("POST", "/v1/posting/fbo/cancel-reason/list", request, options);
  }
  /** Загруженность складов Ozon */
  async getWarehouseAvailability(request, options) {
    return this.httpClient.request("GET", "/v1/supplier/available_warehouses", request, options);
  }
  /** Состав поставки или заявки на поставку */
  async getSupplyOrderBundle(request, options) {
    return this.httpClient.request("POST", "/v1/supply-order/bundle", request, options);
  }
  /** Указать данные о водителе и автомобиле */
  async createSupplyOrderPass(request, options) {
    return this.httpClient.request("POST", "/v1/supply-order/pass/create", request, options);
  }
  /** Статус ввода данных о водителе и автомобиле */
  async getSupplyOrderPassStatus(request, options) {
    return this.httpClient.request("POST", "/v1/supply-order/pass/status", request, options);
  }
  /** Количество заявок по статусам */
  async getSupplyOrderStatusCounter(request, options) {
    return this.httpClient.request("POST", "/v1/supply-order/status/counter", request, options);
  }
  /** Интервалы поставки */
  async getSupplyOrderTimeslots(request, options) {
    return this.httpClient.request("POST", "/v1/supply-order/timeslot/get", request, options);
  }
  /** Статус интервала поставки */
  async getSupplyOrderTimeslotStatus(request, options) {
    return this.httpClient.request("POST", "/v1/supply-order/timeslot/status", request, options);
  }
  /** Обновить интервал поставки */
  async updateSupplyOrderTimeslot(request, options) {
    return this.httpClient.request("POST", "/v1/supply-order/timeslot/update", request, options);
  }
  /** Информация об отправлении */
  async getPosting(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbo/get", request, options);
  }
  /** Список отправлений */
  async getPostingsList(request, options) {
    return this.httpClient.request("POST", "/v2/posting/fbo/list", request, options);
  }
  async getSupplyOrder(request, options) {
    return this.httpClient.request("POST", "/v2/supply-order/get", request, options);
  }
  async getSupplyOrdersList(request, options) {
    return this.httpClient.request("POST", "/v2/supply-order/list", request, options);
  }
  /** Получить подробную информацию о заявке на поставку */
  async getSupplyOrderDetails(request, options) {
    return this.httpClient.request("POST", "/v1/supply-order/details", request, options);
  }
  /** Информация о заявке на поставку */
  async getSupplyOrderV3(request, options) {
    return this.httpClient.request("POST", "/v3/supply-order/get", request, options);
  }
  /** Список заявок на поставку на склад Ozon */
  async getSupplyOrdersListV3(request, options) {
    return this.httpClient.request("POST", "/v3/supply-order/list", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/fbs-rfbs-marks/index.js
var FbsRfbsMarksApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Обновить данные экземпляров */
  async updateProductExemplar(request, options) {
    return this.httpClient.request("POST", "/v1/fbs/posting/product/exemplar/update", request, options);
  }
  async setProductExemplarV4(request, options) {
    return this.httpClient.request("POST", "/v4/fbs/posting/product/exemplar/set", request, options);
  }
  async getProductExemplarStatusV4(request, options) {
    return this.httpClient.request("POST", "/v4/fbs/posting/product/exemplar/status", request, options);
  }
  async validateProductExemplarV4(request, options) {
    return this.httpClient.request("POST", "/v4/fbs/posting/product/exemplar/validate", request, options);
  }
  /** Собрать заказ (версия 4) */
  async shipPostingV4(request, options) {
    return this.httpClient.request("POST", "/v4/posting/fbs/ship", request, options);
  }
  /** Частичная сборка отправления (версия 4) */
  async shipPostingPackageV4(request, options) {
    return this.httpClient.request("POST", "/v4/posting/fbs/ship/package", request, options);
  }
  async createOrGetProductExemplarV5(request, options) {
    return this.httpClient.request("POST", "/v5/fbs/posting/product/exemplar/create-or-get", request, options);
  }
  async setProductExemplarV5(request, options) {
    return this.httpClient.request("POST", "/v5/fbs/posting/product/exemplar/set", request, options);
  }
  /** Получить статус добавления экземпляров */
  async getProductExemplarStatusV5(request, options) {
    return this.httpClient.request("POST", "/v5/fbs/posting/product/exemplar/status", request, options);
  }
  /** Валидация кодов маркировки */
  async validateProductExemplarV5(request, options) {
    return this.httpClient.request("POST", "/v5/fbs/posting/product/exemplar/validate", request, options);
  }
  /** Получить данные созданных экземпляров */
  async createOrGetProductExemplarV6(request, options) {
    return this.httpClient.request("POST", "/v6/fbs/posting/product/exemplar/create-or-get", request, options);
  }
  /** Проверить и сохранить данные экземпляров */
  async setProductExemplarV6(request, options) {
    return this.httpClient.request("POST", "/v6/fbs/posting/product/exemplar/set", request, options);
  }
  /** Получить статус загрузки кодов маркировки */
  async getPostingCodesUploadStatus(request, options) {
    return this.httpClient.request("POST", "/v1/posting/fbs/rfbs/upload-marking-codes/status", request, options);
  }
  /** Проверить коды маркировки отправления */
  async validatePostingCodes(request, options) {
    return this.httpClient.request("POST", "/v1/posting/fbs/rfbs/validate-marking-codes", request, options);
  }
  async getPostingCodesValidateStatus(request, options) {
    return this.httpClient.request("POST", "/v1/posting/fbs/rfbs/validate-marking-codes/status", request, options);
  }
  async getPostingCodesInfo(request, options) {
    return this.httpClient.request("POST", "/v1/posting/fbs/rfbs/marking-codes/info", request, options);
  }
  async getPostingList(request, options) {
    return this.httpClient.request("POST", "/v1/posting/fbs/rfbs/list", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/rfbs-returns/index.js
var RfbsReturnsApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Передать доступные действия для rFBS возвратов */
  async setAction(request, options) {
    return this.httpClient.request("POST", "/v1/returns/rfbs/action/set", request, options);
  }
  /** Вернуть часть стоимости товара */
  async compensate(request, options) {
    return this.httpClient.request("POST", "/v2/returns/rfbs/compensate", request, options);
  }
  /** Информация о заявке на возврат */
  async getReturn(request, options) {
    return this.httpClient.request("POST", "/v2/returns/rfbs/get", request, options);
  }
  /** Список заявок на возврат */
  async getReturnsList(request, options) {
    return this.httpClient.request("POST", "/v2/returns/rfbs/list", request, options);
  }
  /** Подтвердить получение товара на проверку */
  async receiveReturn(request, options) {
    return this.httpClient.request("POST", "/v2/returns/rfbs/receive-return", request, options);
  }
  /** Отклонить заявку на возврат */
  async reject(request, options) {
    return this.httpClient.request("POST", "/v2/returns/rfbs/reject", request, options);
  }
  /** Вернуть деньги покупателю */
  async returnMoney(request, options) {
    return this.httpClient.request("POST", "/v2/returns/rfbs/return-money", request, options);
  }
  /** Одобрить заявку на возврат */
  async verify(request, options) {
    return this.httpClient.request("POST", "/v2/returns/rfbs/verify", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/supplier/index.js
var SupplierApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Удалить ссылку на счёт-фактуру */
  async deleteInvoice(request, options) {
    return this.httpClient.request("POST", "/v1/invoice/delete", request, options);
  }
  /** Загрузить файл счёт-фактуры */
  async uploadInvoiceFile(request, options) {
    return this.httpClient.request("POST", "/v1/invoice/file/upload", request, options);
  }
  /** Создать или изменить счёт-фактуру */
  async createOrUpdateInvoice(request, options) {
    return this.httpClient.request("POST", "/v2/invoice/create-or-update", request, options);
  }
  /** Получить информацию о счёте-фактуре */
  async getInvoice(request, options) {
    return this.httpClient.request("POST", "/v2/invoice/get", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/warehouse/index.js
var WarehouseApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Список методов доставки склада */
  async getDeliveryMethods(request, options) {
    return this.httpClient.request("POST", "/v1/delivery-method/list", request, options);
  }
  /** Список складов */
  async getWarehousesList(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/list", request, options);
  }
  /** Перенести склад в архив */
  async archiveWarehouse(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/archive", request, options);
  }
  /** Перенести склад из архива */
  async unarchiveWarehouse(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/unarchive", request, options);
  }
  /** Получить список товаров с ограничениями по доставке */
  async getInvalidProducts(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/invalid-products/get", request, options);
  }
  /** Получить статус операции */
  async getOperationStatus(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/operation/status", request, options);
  }
  /** Получить информацию по возвратным настройкам rFBS и rFBS Express */
  async getDeliveryMethodReturnSettings(request, options) {
    return this.httpClient.request("POST", "/v1/delivery-method/return/settings/get", request, options);
  }
  /** Получить список складов с ограниченными для доставки товарами */
  async getWarehousesWithInvalidProducts(options) {
    return this.httpClient.request("POST", "/v1/warehouse/warehouses-with-invalid-products", {}, options);
  }
  /** Список методов доставки realFBS-склада (v2) */
  async getDeliveryMethodsV2(request, options) {
    return this.httpClient.request("POST", "/v2/delivery-method/list", request, options);
  }
  /** Список складов (v2) */
  async getWarehousesListV2(request, options) {
    return this.httpClient.request("POST", "/v2/warehouse/list", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/fbo-supply-request/index.js
var FboSupplyRequestApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Сгенерировать этикетки для грузомест */
  async createCargoLabels(request, options) {
    return this.httpClient.request("POST", "/v1/cargoes-label/create", request, options);
  }
  /** Получить идентификатор этикетки для грузомест */
  async getCargoLabels(request, options) {
    return this.httpClient.request("POST", "/v1/cargoes-label/get", request, options);
  }
  /** Установка грузомест */
  async createCargoes(request, options) {
    return this.httpClient.request("POST", "/v1/cargoes/create", request, options);
  }
  /** Получить информацию по установке грузомест */
  async getCargoesCreateInfo(request, options) {
    return this.httpClient.request("POST", "/v1/cargoes/create/info", request, options);
  }
  /** Удалить грузоместо в заявке на поставку */
  async deleteCargoes(request, options) {
    return this.httpClient.request("POST", "/v1/cargoes/delete", request, options);
  }
  /** Информация о статусе удаления грузоместа */
  async getCargoesDeleteStatus(request, options) {
    return this.httpClient.request("POST", "/v1/cargoes/delete/status", request, options);
  }
  /** Чек-лист по установке грузомест FBO */
  async getCargoRules(request, options) {
    return this.httpClient.request("POST", "/v1/cargoes/rules/get", request, options);
  }
  /** Информация о кластерах и их складах */
  async getClusterList(request, options) {
    return this.httpClient.request("POST", "/v1/cluster/list", request, options);
  }
  /** Поиск точек для отгрузки поставки */
  async getWarehouseFboList(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/fbo/list", request, options);
  }
  /** Создать черновик заявки на поставку */
  async createDraft(request, options) {
    return this.httpClient.request("POST", "/v1/draft/create", request, options);
  }
  /** Информация о черновике заявки на поставку */
  async getDraftInfo(request, options) {
    return this.httpClient.request("POST", "/v1/draft/create/info", request, options);
  }
  /** Доступные таймслоты */
  async getTimeslotInfo(request, options) {
    return this.httpClient.request("POST", "/v1/draft/timeslot/info", request, options);
  }
  /** Создать заявку на поставку по черновику */
  async createSupplyOrderFromDraft(request, options) {
    return this.httpClient.request("POST", "/v1/draft/supply/create", request, options);
  }
  /** Информация о создании заявки на поставку */
  async getSupplyOrderCreateStatus(request, options) {
    return this.httpClient.request("POST", "/v1/draft/supply/create/status", request, options);
  }
  /** Отменить заявку на поставку */
  async cancelSupplyOrder(request, options) {
    return this.httpClient.request("POST", "/v1/supply-order/cancel", request, options);
  }
  /** Получить статус отмены заявки на поставку */
  async getSupplyOrderCancelStatus(request, options) {
    return this.httpClient.request("POST", "/v1/supply-order/cancel/status", request, options);
  }
  /** Редактирование товарного состава */
  async updateSupplyOrderContent(request, options) {
    return this.httpClient.request("POST", "/v1/supply-order/content/update", request, options);
  }
  /** Информация о статусе редактирования товарного состава */
  async getSupplyOrderContentUpdateStatus(request, options) {
    return this.httpClient.request("POST", "/v1/supply-order/content/update/status", request, options);
  }
  /** Проверить новый товарный состав */
  async validateSupplyOrderContent(request, options) {
    return this.httpClient.request("POST", "/v1/supply-order/content/update/validation", request, options);
  }
  /** Получить информацию о грузоместах */
  async getCargoes(request, options) {
    return this.httpClient.request("POST", "/v1/cargoes/get", request, options);
  }
  /** Получить информацию о грузоместах */
  async createCrossdockDraft(request, options) {
    return this.httpClient.request("POST", "/v1/draft/crossdock/create", request, options);
  }
  /** Создать черновик заявки на прямую поставку */
  async createDirectDraft(request, options) {
    return this.httpClient.request("POST", "/v1/draft/direct/create", request, options);
  }
  /** Создать черновик заявки на поставку для нескольких кластеров */
  async createMultiClusterDraft(request, options) {
    return this.httpClient.request("POST", "/v1/draft/multi-cluster/create", request, options);
  }
  /** Получить список складов продавца */
  async getWarehouseFboSellerList(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/fbo/seller/list", request, options);
  }
  /** Получить информацию по установке грузомест (v2) */
  async getCargoesCreateInfoV2(request, options) {
    return this.httpClient.request("POST", "/v2/cargoes/create/info", request, options);
  }
  /** Получить информацию о черновике заявки на поставку (v2) */
  async getDraftInfoV2(request, options) {
    return this.httpClient.request("POST", "/v2/draft/create/info", request, options);
  }
  /** Создать заявку на поставку по черновику (v2) */
  async createSupplyOrderFromDraftV2(request, options) {
    return this.httpClient.request("POST", "/v2/draft/supply/create", request, options);
  }
  /** Получить информацию о создании заявки на поставку (v2) */
  async getSupplyOrderCreateStatusV2(request, options) {
    return this.httpClient.request("POST", "/v2/draft/supply/create/status", request, options);
  }
  /** Получить список доступных таймслотов (v2) */
  async getTimeslotInfoV2(request, options) {
    return this.httpClient.request("POST", "/v2/draft/timeslot/info", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/report/index.js
var ReportApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Финансовый отчёт */
  async getFinanceCashFlowStatement(request, options) {
    return this.httpClient.request("POST", "/v1/finance/cash-flow-statement/list", request, options);
  }
  /** Отчёт об уценённых товарах */
  async createDiscountedReport(request, options) {
    return this.httpClient.request("POST", "/v1/report/discounted/create", request, options);
  }
  /** Информация об отчёте */
  async getReportInfo(request, options) {
    return this.httpClient.request("POST", "/v1/report/info", request, options);
  }
  /** Список отчётов */
  async getReportList(request, options) {
    return this.httpClient.request("POST", "/v1/report/list", request, options);
  }
  /** Отчёт об отправлениях */
  async createPostingsReport(request, options) {
    return this.httpClient.request("POST", "/v1/report/postings/create", request, options);
  }
  /** Отчёт по товарам */
  async createProductsReport(request, options) {
    return this.httpClient.request("POST", "/v1/report/products/create", request, options);
  }
  /** Отчёт об остатках на FBS-складе */
  async createStockByWarehouseReport(request, options) {
    return this.httpClient.request("POST", "/v1/report/warehouse/stock", request, options);
  }
  /** Отчёт о возвратах */
  async createReturnsReport(request, options) {
    return this.httpClient.request("POST", "/v2/report/returns/create", request, options);
  }
  /** Отчёт о продажах маркированных товаров */
  async createMarkedProductsSalesReport(request, options) {
    return this.httpClient.request("POST", "/v1/report/marked-products-sales/create", request, options);
  }
  /** Отчёт о стоимости размещения по товарам */
  async createPlacementByProductsReport(request, options) {
    return this.httpClient.request("POST", "/v1/report/placement/by-products/create", request, options);
  }
  /** Отчёт о стоимости размещения по поставкам */
  async createPlacementBySuppliesReport(request, options) {
    return this.httpClient.request("POST", "/v1/report/placement/by-supplies/create", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/premium/index.js
var PremiumApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Данные аналитики */
  async getAnalyticsData(request, options) {
    return this.httpClient.request("POST", "/v1/analytics/data", request, options);
  }
  /** Получить информацию о запросах моих товаров */
  async getProductQueries(request, options) {
    return this.httpClient.request("POST", "/v1/analytics/product-queries", request, options);
  }
  /** Получить детализацию запросов по товару */
  async getProductQueriesDetails(request, options) {
    return this.httpClient.request("POST", "/v1/analytics/product-queries/details", request, options);
  }
  /** Отправить сообщение */
  async sendChatMessage(request, options) {
    return this.httpClient.request("POST", "/v1/chat/send/message", request, options);
  }
  /** Создать новый чат */
  async startChat(request, options) {
    return this.httpClient.request("POST", "/v1/chat/start", request, options);
  }
  /** Отчёт о реализации товаров за день */
  async getRealizationByDay(request, options) {
    return this.httpClient.request("POST", "/v1/finance/realization/by-day", request, options);
  }
  /** Отметить сообщения как прочитанные */
  async markChatAsRead(request, options) {
    return this.httpClient.request("POST", "/v2/chat/read", request, options);
  }
  /** История чата */
  async getChatHistory(request, options) {
    return this.httpClient.request("POST", "/v3/chat/history", request, options);
  }
  /** Подробная информация о ценах товаров (Premium Pro) */
  async getProductPricesDetails(request, options) {
    return this.httpClient.request("POST", "/v1/product/prices/details", request, options);
  }
  /** Поисковые запросы по тексту (Premium Pro) */
  async searchQueriesText(request, options) {
    return this.httpClient.request("POST", "/v1/search-queries/text", request, options);
  }
  /** Популярные поисковые запросы (Premium Pro) */
  async searchQueriesTop(request, options) {
    return this.httpClient.request("POST", "/v1/search-queries/top", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/prices-stocks/index.js
var PricesStocksApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Получить статус установленного таймера */
  async getActionTimerStatus(request, options) {
    return this.httpClient.request("POST", "/v1/product/action/timer/status", request, options);
  }
  /** Обновление таймера актуальности минимальной цены */
  async updateActionTimer(request, options) {
    return this.httpClient.request("POST", "/v1/product/action/timer/update", request, options);
  }
  /** Обновить цену */
  async updatePrices(request, options) {
    return this.httpClient.request("POST", "/v1/product/import/prices", request, options);
  }
  /** Узнать информацию об уценке и основном товаре по SKU уценённого товара */
  async getDiscountedProductInfo(request, options) {
    return this.httpClient.request("POST", "/v1/product/info/discounted", request, options);
  }
  /** Информация об остатках на складах продавца (FBS и rFBS) */
  async getStocksByWarehouseFbs(request, options) {
    return this.httpClient.request("POST", "/v1/product/info/stocks-by-warehouse/fbs", request, options);
  }
  /** Установить скидку на уценённый товар */
  async updateDiscountedProductDiscount(request, options) {
    return this.httpClient.request("POST", "/v1/product/update/discount", request, options);
  }
  /** Обновить количество товаров на складах */
  async updateStocks(request, options) {
    return this.httpClient.request("POST", "/v2/products/stocks", request, options);
  }
  /** Информация о количестве товаров */
  async getStocks(request, options) {
    return this.httpClient.request("POST", "/v4/product/info/stocks", request, options);
  }
  /** Получить информацию о цене товара */
  async getPrices(request, options) {
    return this.httpClient.request("POST", "/v5/product/info/prices", request, options);
  }
  /** Информация об остатках на складах Ozon (FBO) */
  async getWarehouseStocks(request, options) {
    return this.httpClient.request("POST", "/v1/product/info/warehouse/stocks", request, options);
  }
  /** Информация об остатках на складах продавца v2 (FBS и rFBS) */
  async getStocksByWarehouseFbsV2(request, options) {
    return this.httpClient.request("POST", "/v2/product/info/stocks-by-warehouse/fbs", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/beta-method/index.js
var BetaMethodApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Получить аналитику по среднему времени доставки */
  async getAverageDeliveryTime(request, options) {
    return this.httpClient.request("POST", "/v1/analytics/average-delivery-time", request, options);
  }
  /** Получить детальную аналитику по среднему времени доставки */
  async getAverageDeliveryTimeDetails(request, options) {
    return this.httpClient.request("POST", "/v1/analytics/average-delivery-time/details", request, options);
  }
  /** Получить общую аналитику по среднему времени доставки */
  async getAverageDeliveryTimeSummary(options) {
    return this.httpClient.request("POST", "/v1/analytics/average-delivery-time/summary", {}, options);
  }
  /** Управление остатками */
  async getManageStocks(request, options) {
    return this.httpClient.request("POST", "/v1/analytics/manage/stocks", request, options);
  }
  /** Получить аналитику по остаткам */
  async getAnalyticsStocks(request, options) {
    return this.httpClient.request("POST", "/v1/analytics/stocks", request, options);
  }
  /** Список товаров с некорректными ОВХ */
  async getProductsWithWrongVolume(request, options) {
    return this.httpClient.request("POST", "/v1/product/info/wrong-volume", request, options);
  }
  /** Отчёт по вывозу и утилизации со стока FBO */
  async getRemovalFromStockReport(request, options) {
    return this.httpClient.request("POST", "/v1/removal/from-stock/list", request, options);
  }
  /** Отчёт по вывозу и утилизации с поставки FBO */
  async getRemovalFromSupplyReport(request, options) {
    return this.httpClient.request("POST", "/v1/removal/from-supply/list", request, options);
  }
  /** Получить список ролей и методов по API-ключу */
  async getRolesByToken(options) {
    return this.httpClient.request("POST", "/v1/roles", {}, options);
  }
  /** Получить акт о расхождениях по отгрузке FBS */
  async getCarriageActDiscrepancyPdf(request, options) {
    return this.httpClient.request("POST", "/v1/carriage/act-discrepancy/pdf", request, options);
  }
  /** Получить отчёт о балансе */
  async getFinanceBalance(request, options) {
    return this.httpClient.request("POST", "/v1/finance/balance", request, options);
  }
  /** Получить информацию о скидке от количества */
  async getStairwayDiscount(request, options) {
    return this.httpClient.request("POST", "/v1/product/stairway-discount/by-quantity/get", request, options);
  }
  /** Управлять скидкой от количества */
  async setStairwayDiscount(request, options) {
    return this.httpClient.request("POST", "/v1/product/stairway-discount/by-quantity/set", request, options);
  }
  /** Получить список заявок на скидку */
  async getDiscountTaskListV2(request, options) {
    return this.httpClient.request("POST", "/v2/actions/discounts-task/list", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/promos/index.js
var PromosApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Список акций */
  async getActions(options) {
    return this.httpClient.request("GET", "/v1/actions", void 0, options);
  }
  /** Список доступных для акции товаров */
  async getCandidates(request, options) {
    return this.httpClient.request("POST", "/v1/actions/candidates", request, options);
  }
  /** Список участвующих в акции товаров */
  async getParticipatingProducts(request, options) {
    return this.httpClient.request("POST", "/v1/actions/products", request, options);
  }
  /** Список заявок на скидку */
  async getDiscountTasks(request, options) {
    return this.httpClient.request("POST", "/v1/actions/discounts-task/list", request, options);
  }
  /** Согласовать заявку на скидку */
  async approveDiscountTasks(request, options) {
    return this.httpClient.request("POST", "/v1/actions/discounts-task/approve", request, options);
  }
  /** Отклонить заявку на скидку */
  async declineDiscountTasks(request, options) {
    return this.httpClient.request("POST", "/v1/actions/discounts-task/decline", request, options);
  }
  /** Добавить товар в акцию */
  async activateProducts(request, options) {
    return this.httpClient.request("POST", "/v1/actions/products/activate", request, options);
  }
  /** Удалить товары из акции */
  async deactivateProducts(request, options) {
    return this.httpClient.request("POST", "/v1/actions/products/deactivate", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/pass/index.js
var PassApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Создать пропуск */
  async createCarriagePass(request, options) {
    return this.httpClient.request("POST", "/v1/carriage/pass/create", request, options);
  }
  /** Удалить пропуск */
  async deleteCarriagePass(request, options) {
    return this.httpClient.request("POST", "/v1/carriage/pass/delete", request, options);
  }
  /** Обновить пропуск */
  async updateCarriagePass(request, options) {
    return this.httpClient.request("POST", "/v1/carriage/pass/update", request, options);
  }
  /** Список пропусков */
  async getPassList(request, options) {
    return this.httpClient.request("POST", "/v1/pass/list", request, options);
  }
  /** Создать пропуск для возврата */
  async createReturnPass(request, options) {
    return this.httpClient.request("POST", "/v1/return/pass/create", request, options);
  }
  /** Удалить пропуск для возврата */
  async deleteReturnPass(request, options) {
    return this.httpClient.request("POST", "/v1/return/pass/delete", request, options);
  }
  /** Обновить пропуск для возврата */
  async updateReturnPass(request, options) {
    return this.httpClient.request("POST", "/v1/return/pass/update", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/cancellation/index.js
var CancellationApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  async getConditionalCancellationList(request, options) {
    return this.httpClient.request("POST", "/v1/conditional-cancellation/list", request, options);
  }
  async getConditionalCancellation(request, options) {
    return this.httpClient.request("POST", "/v1/conditional-cancellation/get", request, options);
  }
  async approveConditionalCancellation(request, options) {
    return this.httpClient.request("POST", "/v1/conditional-cancellation/approve", request, options);
  }
  async rejectConditionalCancellation(request, options) {
    return this.httpClient.request("POST", "/v1/conditional-cancellation/reject", request, options);
  }
  /** Получить список заявок на отмену rFBS */
  async getConditionalCancellationListV2(request, options) {
    return this.httpClient.request("POST", "/v2/conditional-cancellation/list", request, options);
  }
  /** Подтвердить заявку на отмену rFBS */
  async approveConditionalCancellationV2(request, options) {
    return this.httpClient.request("POST", "/v2/conditional-cancellation/approve", request, options);
  }
  /** Отклонить заявку на отмену rFBS */
  async rejectConditionalCancellationV2(request, options) {
    return this.httpClient.request("POST", "/v2/conditional-cancellation/reject", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/category/index.js
var CategoryApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Дерево категорий и типов товаров */
  async getCategoryTree(request, options) {
    return this.httpClient.request("POST", "/v1/description-category/tree", request, options);
  }
  /** Список характеристик категории */
  async getCategoryAttributes(request, options) {
    return this.httpClient.request("POST", "/v1/description-category/attribute", request, options);
  }
  /** Справочник значений характеристики */
  async getCategoryAttributeValues(request, options) {
    return this.httpClient.request("POST", "/v1/description-category/attribute/values", request, options);
  }
  /** Поиск по справочным значениям характеристики */
  async searchCategoryAttributeValues(request, options) {
    return this.httpClient.request("POST", "/v1/description-category/attribute/values/search", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/digital/index.js
var DigitalApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Получить список отправлений */
  async getDigitalPostingsList(request, options) {
    return this.httpClient.request("POST", "/v1/posting/digital/list", request, options);
  }
  /** Загрузить коды цифровых товаров для отправления */
  async uploadDigitalCodes(request, options) {
    return this.httpClient.request("POST", "/v1/posting/digital/codes/upload", request, options);
  }
  /** Обновить количество цифровых товаров */
  async updateDigitalStocks(request, options) {
    return this.httpClient.request("POST", "/v1/product/digital/stocks/import", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/barcode/index.js
var BarcodeApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Привязать штрихкод к товару */
  async addBarcodes(request, options) {
    return this.httpClient.request("POST", "/v1/barcode/add", request, options);
  }
  /** Создать штрихкод для товара */
  async generateBarcodes(request, options) {
    return this.httpClient.request("POST", "/v1/barcode/generate", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/polygon/index.js
var PolygonApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Создайте полигон доставки */
  async createDeliveryPolygon(request, options) {
    return this.httpClient.request("POST", "/v1/polygon/create", request, options);
  }
  /** Свяжите метод доставки с полигоном доставки */
  async bindPolygonToDeliveryMethod(request, options) {
    return this.httpClient.request("POST", "/v1/polygon/bind", request, options);
  }
  /** Удалить полигон из области доставки */
  async deletePolygon(request, options) {
    return this.httpClient.request("POST", "/v1/polygon/delete", request, options);
  }
  /** Получить список установленных полигонов на метод доставки */
  async listPolygons(request, options) {
    return this.httpClient.request("POST", "/v1/polygon/list", request, options);
  }
  /** Обновить координаты полигона доставки */
  async updatePolygonCoordinates(request, options) {
    return this.httpClient.request("POST", "/v1/polygon/time/coordinates/update", request, options);
  }
  /** Установить новое время доставки в полигоне */
  async setPolygonTime(request, options) {
    return this.httpClient.request("POST", "/v1/polygon/time/set", request, options);
  }
  /** Связать метод доставки с полигоном (v2) */
  async bindPolygonV2(request, options) {
    return this.httpClient.request("POST", "/v2/polygon/bind", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/seller-rating/index.js
var SellerRatingApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Получить информацию о текущих рейтингах продавца */
  async getCurrentRatings(options) {
    return this.httpClient.request("POST", "/v1/rating/summary", {}, options);
  }
  /** Получить информацию о рейтингах продавца за период */
  async getRatingHistory(request, options) {
    return this.httpClient.request("POST", "/v1/rating/history", request, options);
  }
  /** Получить индекс ошибок FBS и rFBS */
  async getFBSRatingIndexInfo(options) {
    return this.httpClient.request("POST", "/v1/rating/index/fbs/info", {}, options);
  }
  /** Список отправлений, которые повлияли на индекс ошибок FBS и rFBS */
  async getFBSRatingIndexPostings(request, options) {
    return this.httpClient.request("POST", "/v1/rating/index/fbs/posting/list", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/api-key/index.js
var ApiKeyApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Получить список ролей и методов по API-ключу */
  async getRolesByToken(request, options) {
    return this.httpClient.request("POST", "/v1/roles", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/cancel-reason/index.js
var CancelReasonApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Причины отмены отправлений */
  async list(options) {
    return this.httpClient.request("POST", "/v1/cancel-reason/list", {}, options);
  }
  /** Причины отмены заказа */
  async listByOrder(request, options) {
    return this.httpClient.request("POST", "/v1/cancel-reason/list-by-order", request, options);
  }
  /** Причины отмены отправления */
  async listByPosting(request, options) {
    return this.httpClient.request("POST", "/v1/cancel-reason/list-by-posting", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/delivery-api/index.js
var DeliveryApiApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Проверить доступность доставки для покупателя */
  async check(request, options) {
    return this.httpClient.request("POST", "/v1/delivery/check", request, options);
  }
  /** Отрисовать точки на карте */
  async map(request, options) {
    return this.httpClient.request("POST", "/v1/delivery/map", request, options);
  }
  /** Получить информацию о точке самовывоза */
  async pointInfo(request, options) {
    return this.httpClient.request("POST", "/v1/delivery/point/info", request, options);
  }
  /** Получить список точек самовывоза */
  async pointList(request, options) {
    return this.httpClient.request("POST", "/v1/delivery/point/list", request, options);
  }
  /** Получить доступные варианты доставки */
  async checkout(request, options) {
    return this.httpClient.request("POST", "/v2/delivery/checkout", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/delivery-fbp/index.js
var DeliveryFbpApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Сгенерировать акт приёмки */
  async createAct(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/act-from/create", request, options);
  }
  /** Получить статус генерации акта приёмки */
  async checkActState(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/act-from/get", request, options);
  }
  /** Сгенерировать транспортную накладную */
  async createConsignmentNote(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/act-to/create", request, options);
  }
  /** Получить статус генерации транспортной накладной */
  async checkConsignmentNoteState(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/act-to/get", request, options);
  }
  /** Получить информацию о завершённой поставке */
  async archiveGet(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/archive/get", request, options);
  }
  /** Получить список завершённых поставок */
  async archiveList(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/archive/list", request, options);
  }
  /** Создать задание на генерацию этикеток */
  async createLabel(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/label/create", request, options);
  }
  /** Получить статус задания на генерацию этикеток */
  async getLabel(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/label/get", request, options);
  }
  /** Получить информацию о конкретной поставке */
  async orderGet(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/order/get", request, options);
  }
  /** Получить список поставок */
  async orderList(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/order/list", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/delivery-fbp-draft/index.js
var DeliveryFbpDraftApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Получить информацию о черновике поставки */
  async get(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/get", request, options);
  }
  /** Список черновиков поставки */
  async list(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/list", request, options);
  }
  /** Получить список партнёрских складов */
  async warehouseList(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/warehouse/list", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/draft-direct-fbp/index.js
var DraftDirectFbpApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Создать черновик заявки на поставку без указания способа доставки */
  async create(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/direct/create", request, options);
  }
  /** Удалить черновик заявки на поставку */
  async delete(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/direct/delete", request, options);
  }
  /** Проверить список товаров для склада партнёра */
  async productValidate(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/direct/product/validate", request, options);
  }
  /** Перевести черновик в действующую поставку */
  async registrate(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/direct/registrate", request, options);
  }
  /** Создать черновик с доставкой силами продавца */
  async sellerDlvCreate(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/direct/seller-dlv/create", request, options);
  }
  /** Обновить информацию о доставке силами продавца в черновике */
  async sellerDlvEdit(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/direct/seller-dlv/edit", request, options);
  }
  /** Отредактировать таймслот в черновике */
  async timeslotEdit(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/direct/timeslot/edit", request, options);
  }
  /** Получить список таймслотов для прямой поставки */
  async timeslotGet(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/direct/timeslot/get", request, options);
  }
  /** Создать черновик заявки на доставку сторонней транспортной компанией */
  async tplDlvCreate(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/direct/tpl-dlv/create", request, options);
  }
  /** Редактировать черновик поставки со способом доставки сторонней транспортной компанией */
  async tplDlvEdit(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/direct/tpl-dlv/edit", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/draft-dropoff-fbp/index.js
var DraftDropoffFbpApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Создать черновик для доставки в drop-off пункт */
  async create(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/drop-off/create", request, options);
  }
  /** Удалить черновик для доставки в drop-off пункт */
  async delete(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/drop-off/delete", request, options);
  }
  /** Отредактировать детали доставки для drop-off черновика */
  async dlvEdit(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/drop-off/dlv/edit", request, options);
  }
  /** Получить список drop-off пунктов в провинции */
  async pointList(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/drop-off/point/list", request, options);
  }
  /** Получить расписание работы drop-off пункта */
  async pointTimetable(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/drop-off/point/timetable", request, options);
  }
  /** Проверить список товаров, которые склад партнёра может принять */
  async productValidate(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/drop-off/product/validate", request, options);
  }
  /** Получить список провинций */
  async provinceList(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/drop-off/province/list", request, options);
  }
  /** Перевести черновик в действующую поставку */
  async registrate(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/drop-off/registrate", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/draft-pickup-fbp/index.js
var DraftPickupFbpApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Создать черновик заявки на pick-up поставку */
  async create(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/pick-up/create", request, options);
  }
  /** Отменить черновик заявки на pick-up поставку */
  async delete(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/pick-up/delete", request, options);
  }
  /** Изменить черновик заявки на pick-up поставку */
  async dlvEdit(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/pick-up/dlv/edit", request, options);
  }
  /** Провалидировать список товаров для pick-up поставки */
  async productValidate(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/pick-up/product/validate", request, options);
  }
  /** Перевести черновик в действующую поставку */
  async registrate(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/draft/pick-up/registrate", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/fbo-posting/index.js
var FboPostingApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Отменить отправление из заказа */
  async cancel(request, options) {
    return this.httpClient.request("POST", "/v1/posting/cancel", request, options);
  }
  /** Проверить статус отмены отправления */
  async cancelStatus(request, options) {
    return this.httpClient.request("POST", "/v1/posting/cancel/status", request, options);
  }
  /** Получить маркировки экземпляров из отправления */
  async marks(request, options) {
    return this.httpClient.request("POST", "/v1/posting/marks", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/fbs-warehouse-setup/index.js
var FbsWarehouseSetupApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Создать склад */
  async create(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/fbs/create", request, options);
  }
  /** Получить список drop-off пунктов для создания склада */
  async createDropOffList(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/fbs/create/drop-off/list", request, options);
  }
  /** Получить список таймслотов для создания склада с отгрузкой drop-off */
  async createDropOffTimeslotList(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/fbs/create/drop-off/timeslot/list", request, options);
  }
  /** Получить список таймслотов для создания склада с отгрузкой pick-up */
  async createPickUpTimeslotList(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/fbs/create/pick-up/timeslot/list", request, options);
  }
  /** Получить список пунктов возврата для создания склада */
  async createReturnPointList(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/fbs/create/return-point/list", request, options);
  }
  /** Обновить первую милю */
  async firstMileUpdate(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/fbs/first-mile/update", request, options);
  }
  /** Отменить вызов курьера на забор отгрузки pick-up */
  async pickupCourierCancel(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/fbs/pickup/courier/cancel", request, options);
  }
  /** Создать вызов курьера на забор отгрузки pick-up */
  async pickupCourierCreate(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/fbs/pickup/courier/create", request, options);
  }
  /** Получить историю отгрузок курьерам */
  async pickupHistoryList(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/fbs/pickup/history/list", request, options);
  }
  /** Получить список складов для планирования отгрузок курьеру */
  async pickupPlanningList(options) {
    return this.httpClient.request("POST", "/v1/warehouse/fbs/pickup/planning/list", {}, options);
  }
  /** Проверить необходимость установки возвратной мили на склад */
  async returnMileCheck(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/fbs/return-mile/check", request, options);
  }
  /** Получить информацию о возвратной миле */
  async returnMileInfo(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/fbs/return-mile/info", request, options);
  }
  /** Обновить склад */
  async update(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/fbs/update", request, options);
  }
  /** Получить список drop-off пунктов для изменения информации склада */
  async updateDropOffList(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/fbs/update/drop-off/list", request, options);
  }
  /** Получить список таймслотов для обновления склада с отгрузкой drop-off */
  async updateDropOffTimeslotList(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/fbs/update/drop-off/timeslot/list", request, options);
  }
  /** Получить список таймслотов для обновления склада с отгрузкой pick-up */
  async updatePickUpTimeslotList(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/fbs/update/pick-up/timeslot/list", request, options);
  }
  /** Получить список пунктов возврата для обновления склада */
  async updateReturnPointList(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/fbs/update/return-point/list", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/order-api/index.js
var OrderApiApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Отменить заказ */
  async cancel(request, options) {
    return this.httpClient.request("POST", "/v1/order/cancel", request, options);
  }
  /** Проверить возможность отмены заказа */
  async cancelCheck(request, options) {
    return this.httpClient.request("POST", "/v1/order/cancel/check", request, options);
  }
  /** Получить статус отмены заказа */
  async cancelStatus(request, options) {
    return this.httpClient.request("POST", "/v1/order/cancel/status", request, options);
  }
  /** Создать заказ */
  async create(request, options) {
    return this.httpClient.request("POST", "/v2/order/create", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/order-direct-fbp/index.js
var OrderDirectFbpApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Отменить поставку */
  async cancel(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/order/direct/cancel", request, options);
  }
  /** Обновить информацию о доставке силами продавца */
  async sellerDlvEdit(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/order/direct/seller-dlv/edit", request, options);
  }
  /** Отредактировать таймслот в заявке на поставку */
  async timeslotEdit(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/order/direct/timeslot/edit", request, options);
  }
  /** Получить список таймслотов для поставки */
  async timeslotList(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/order/direct/timeslot/list", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/order-dropoff-fbp/index.js
var OrderDropOffFbpApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Отменить поставку drop-off */
  async cancel(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/order/drop-off/cancel", request, options);
  }
  /** Отредактировать информацию о поставке на drop-off пункт */
  async editDelivery(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/order/drop-off/dlv/edit", request, options);
  }
  /** Получить график работы drop-off пункта */
  async getTimetable(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/order/drop-off/timetable", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/order-pickup-fbp/index.js
var OrderPickUpFbpApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Отменить pick-up поставку */
  async cancel(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/order/pick-up/cancel", request, options);
  }
  /** Изменить данные о точке забора */
  async editDelivery(request, options) {
    return this.httpClient.request("POST", "/v1/fbp/order/pick-up/dlv/edit", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/receipt/index.js
var ReceiptApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Получить чек в формате PDF */
  async getReceipt(request, options) {
    return this.httpClient.request("POST", "/v1/receipts/get", request, options);
  }
  /** Получить список чеков продавца */
  async getSellerList(request, options) {
    return this.httpClient.request("POST", "/v1/receipts/seller/list", request, options);
  }
  /** Загрузить чек */
  async upload(request, options) {
    return this.httpClient.request("POST", "/v1/receipts/upload", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/rfbs-warehouse-setup/index.js
var RfbsWarehouseSetupApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Создать склад с методом доставки «Партнёры Ozon» */
  async aggregatorCreate(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/erfbs/aggregator/create", request, options);
  }
  /** Обновить метод доставки «Партнёры Ozon» */
  async aggregatorDeliveryMethodUpdate(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/erfbs/aggregator/delivery-method/update", request, options);
  }
  /** Создать склад с методом доставки «Вы или сторонняя служба» */
  async nonIntegratedCreate(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/erfbs/non-integrated/create", request, options);
  }
  /** Обновить метод доставки «Вы или сторонняя служба» */
  async nonIntegratedDeliveryMethodUpdate(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/erfbs/non-integrated/delivery-method/update", request, options);
  }
  /** Обновить склад */
  async update(request, options) {
    return this.httpClient.request("POST", "/v1/warehouse/erfbs/update", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/seller-actions/index.js
var SellerActionsApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Перенести акцию в архив */
  async archive(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/archive", request, options);
  }
  /** Перенести акцию в архив */
  async changeActivity(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/change-activity", request, options);
  }
  /** Включить или выключить акцию */
  async createDiscount(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/create/discount", request, options);
  }
  /** Создать акцию с механикой «Скидка от суммы заказа» */
  async createDiscountWithCondition(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/create/discount-with-condition", request, options);
  }
  /** Создать акцию с механикой «Беспроцентная рассрочка» */
  async createInstallment(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/create/installment", request, options);
  }
  /** Создать акцию с механикой «Многоуровневая скидка от суммы» */
  async createMultiLevelDiscount(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/create/multi-level-discount", request, options);
  }
  /** Создать акцию с механикой «Повышенная скидка с Ozon Картой» */
  async createOzonCardDiscount(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/create/ozon-card-discount", request, options);
  }
  /** Создать акцию с механикой «Скидка по промокоду» */
  async createVoucher(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/create/voucher", request, options);
  }
  /** Создать акцию с механикой «Скидка по промокоду» */
  async list(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/list", request, options);
  }
  /** Получить список акций */
  async productsAdd(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/products/add", request, options);
  }
  /** Добавить товары в акцию */
  async productsCandidates(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/products/candidates", request, options);
  }
  /** Удалить товары из акции */
  async productsDelete(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/products/delete", request, options);
  }
  /** Удалить товары из акции */
  async productsList(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/products/list", request, options);
  }
  /** Получить список участвующих в акции товаров */
  async updateDiscount(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/update/discount", request, options);
  }
  /** Обновить акцию с механикой «Скидка» */
  async updateDiscountWithCondition(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/update/discount-with-condition", request, options);
  }
  /** Обновить акцию с механикой «Беспроцентная рассрочка» */
  async updateInstallment(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/update/installment", request, options);
  }
  /** Обновить акцию с механикой «Многоуровневая скидка от суммы» */
  async updateMultiLevelDiscount(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/update/multi-level-discount", request, options);
  }
  /** Обновить акцию с механикой «Повышенная скидка с Ozon Картой» */
  async updateOzonCardDiscount(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/update/ozon-card-discount", request, options);
  }
  /** Обновить акцию с механикой «Скидка по промокоду» */
  async updateVoucher(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/update/voucher", request, options);
  }
  /** Обновить акцию с механикой «Скидка по промокоду» */
  async voucherGet(request, options) {
    return this.httpClient.request("POST", "/v1/seller-actions/voucher/get", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/categories/seller-info/index.js
var SellerInfoApi = class {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Информация о кабинете продавца */
  async getInfo(request, options) {
    return this.httpClient.request("POST", "/v1/seller/info", request, options);
  }
  /** Информация о кабинете продавца */
  async getOzonLogisticsInfo(request, options) {
    return this.httpClient.request("POST", "/v1/seller/ozon-logistics/info", request, options);
  }
};

// node_modules/ozon-seller-sdk/dist/core/client.js
var OzonSellerApiClient = class _OzonSellerApiClient {
  httpClient;
  authManager;
  config;
  // API category modules
  product;
  finance;
  analytics;
  pricingStrategy;
  returns;
  return;
  quants;
  review;
  chat;
  questionsAnswers;
  brand;
  certification;
  fbs;
  deliveryFbs;
  deliveryRfbs;
  fbo;
  fbsRfbsMarks;
  rfbsReturns;
  supplier;
  warehouse;
  fboSupplyRequest;
  // Story 1.7 API categories
  report;
  premium;
  pricesStocks;
  betaMethod;
  promos;
  pass;
  cancellation;
  category;
  digital;
  barcode;
  polygon;
  sellerRating;
  // New API categories
  apiKey;
  cancelReason;
  deliveryApi;
  deliveryFbp;
  deliveryFbpDraft;
  draftDirectFbp;
  draftDropoffFbp;
  draftPickupFbp;
  fboPosting;
  fbsWarehouseSetup;
  orderApi;
  orderDirectFbp;
  orderDropoffFbp;
  orderPickupFbp;
  receipt;
  rfbsWarehouseSetup;
  sellerActions;
  sellerInfo;
  constructor(config) {
    this.validateConfig(config);
    this.config = config;
    this.authManager = new AuthManager({
      apiKey: config.apiKey,
      clientId: config.clientId
    });
    this.httpClient = new HttpClient(config);
    this.product = new ProductApi(this.httpClient);
    this.finance = new FinanceApi(this.httpClient);
    this.analytics = new AnalyticsApi(this.httpClient);
    this.pricingStrategy = new PricingStrategyApi(this.httpClient);
    this.returns = new ReturnsApi(this.httpClient);
    this.return = new ReturnApi(this.httpClient);
    this.quants = new QuantsApi(this.httpClient);
    this.review = new ReviewApi(this.httpClient);
    this.chat = new ChatApi(this.httpClient);
    this.questionsAnswers = new QuestionsAnswersApi(this.httpClient);
    this.brand = new BrandApi(this.httpClient);
    this.certification = new CertificationApi(this.httpClient);
    this.fbs = new FbsApi(this.httpClient);
    this.deliveryFbs = new DeliveryFbsApi(this.httpClient);
    this.deliveryRfbs = new DeliveryRfbsApi(this.httpClient);
    this.fbo = new FboApi(this.httpClient);
    this.fbsRfbsMarks = new FbsRfbsMarksApi(this.httpClient);
    this.rfbsReturns = new RfbsReturnsApi(this.httpClient);
    this.supplier = new SupplierApi(this.httpClient);
    this.warehouse = new WarehouseApi(this.httpClient);
    this.fboSupplyRequest = new FboSupplyRequestApi(this.httpClient);
    this.report = new ReportApi(this.httpClient);
    this.premium = new PremiumApi(this.httpClient);
    this.pricesStocks = new PricesStocksApi(this.httpClient);
    this.betaMethod = new BetaMethodApi(this.httpClient);
    this.promos = new PromosApi(this.httpClient);
    this.pass = new PassApi(this.httpClient);
    this.cancellation = new CancellationApi(this.httpClient);
    this.category = new CategoryApi(this.httpClient);
    this.digital = new DigitalApi(this.httpClient);
    this.barcode = new BarcodeApi(this.httpClient);
    this.polygon = new PolygonApi(this.httpClient);
    this.sellerRating = new SellerRatingApi(this.httpClient);
    this.apiKey = new ApiKeyApi(this.httpClient);
    this.cancelReason = new CancelReasonApi(this.httpClient);
    this.deliveryApi = new DeliveryApiApi(this.httpClient);
    this.deliveryFbp = new DeliveryFbpApi(this.httpClient);
    this.deliveryFbpDraft = new DeliveryFbpDraftApi(this.httpClient);
    this.draftDirectFbp = new DraftDirectFbpApi(this.httpClient);
    this.draftDropoffFbp = new DraftDropoffFbpApi(this.httpClient);
    this.draftPickupFbp = new DraftPickupFbpApi(this.httpClient);
    this.fboPosting = new FboPostingApi(this.httpClient);
    this.fbsWarehouseSetup = new FbsWarehouseSetupApi(this.httpClient);
    this.orderApi = new OrderApiApi(this.httpClient);
    this.orderDirectFbp = new OrderDirectFbpApi(this.httpClient);
    this.orderDropoffFbp = new OrderDropOffFbpApi(this.httpClient);
    this.orderPickupFbp = new OrderPickUpFbpApi(this.httpClient);
    this.receipt = new ReceiptApi(this.httpClient);
    this.rfbsWarehouseSetup = new RfbsWarehouseSetupApi(this.httpClient);
    this.sellerActions = new SellerActionsApi(this.httpClient);
    this.sellerInfo = new SellerInfoApi(this.httpClient);
  }
  /**
   * Create a new SDK instance with configuration
   */
  static create(config) {
    return new _OzonSellerApiClient(config);
  }
  /**
   * Test API connectivity and authentication
   */
  async testConnection() {
    try {
      await this.httpClient.get("/v1/seller/info");
      return {
        success: true,
        message: "Connection successful"
      };
    } catch (error) {
      let errorMessage = "Unknown connection error";
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = String(error.message);
      }
      return {
        success: false,
        message: errorMessage
      };
    }
  }
  /**
   * Get current authentication status
   */
  getAuthStatus() {
    return {
      isValid: this.authManager.isValid(),
      maskedCredentials: this.authManager.getMaskedCredentials()
    };
  }
  /**
   * Make a raw API request (for advanced usage)
   */
  async rawRequest(method, path, data, options) {
    switch (method) {
      case "GET":
        return this.httpClient.get(path, options);
      case "POST":
        return this.httpClient.post(path, data ?? {}, options);
      case "PUT":
        return this.httpClient.put(path, data ?? {}, options);
      case "DELETE":
        return this.httpClient.delete(path, options);
      default:
        throw new ConfigurationError(`Unsupported HTTP method: ${method}`);
    }
  }
  /**
   * Get SDK version and configuration info
   */
  getInfo() {
    return {
      version: "3.0.0",
      baseUrl: this.config.baseUrl ?? "https://api-seller.ozon.ru",
      userAgent: this.config.userAgent ?? "ozon-seller-sdk/3.0.0",
      timeout: this.config.timeout ?? 3e4,
      retries: this.config.retries ?? 3
    };
  }
  /**
   * Validate SDK configuration
   */
  validateConfig(config) {
    if (!config) {
      throw new ConfigurationError("Configuration is required");
    }
    if (!config.apiKey) {
      throw new ConfigurationError("API key is required");
    }
    if (!config.clientId) {
      throw new ConfigurationError("Client ID is required");
    }
    if (config.baseUrl && !this.isValidUrl(config.baseUrl)) {
      throw new ConfigurationError("Base URL must be a valid URL");
    }
    if (config.timeout !== void 0 && (config.timeout < 1e3 || config.timeout > 3e5)) {
      throw new ConfigurationError("Timeout must be between 1000ms and 300000ms");
    }
    if (config.retries !== void 0 && (config.retries < 0 || config.retries > 10)) {
      throw new ConfigurationError("Retries must be between 0 and 10");
    }
  }
  /**
   * Validate URL format
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

// node_modules/ozon-seller-sdk/dist/types/common/base.js
var ReturnStatus;
(function(ReturnStatus2) {
  ReturnStatus2["NEW"] = "NEW";
  ReturnStatus2["PROCESSING"] = "PROCESSING";
  ReturnStatus2["RETURNED"] = "RETURNED";
  ReturnStatus2["DECLINED"] = "DECLINED";
  ReturnStatus2["COMPLETED"] = "COMPLETED";
})(ReturnStatus || (ReturnStatus = {}));
var GiveoutStatus;
(function(GiveoutStatus2) {
  GiveoutStatus2["ACTIVE"] = "ACTIVE";
  GiveoutStatus2["INACTIVE"] = "INACTIVE";
  GiveoutStatus2["PENDING"] = "PENDING";
  GiveoutStatus2["COMPLETED"] = "COMPLETED";
})(GiveoutStatus || (GiveoutStatus = {}));
var ProductVisibilityState;
(function(ProductVisibilityState2) {
  ProductVisibilityState2["ALL"] = "ALL";
  ProductVisibilityState2["VISIBLE"] = "VISIBLE";
  ProductVisibilityState2["INVISIBLE"] = "INVISIBLE";
  ProductVisibilityState2["EMPTY_STOCK"] = "EMPTY_STOCK";
  ProductVisibilityState2["NOT_MODERATED"] = "NOT_MODERATED";
  ProductVisibilityState2["MODERATED"] = "MODERATED";
  ProductVisibilityState2["DISABLED"] = "DISABLED";
  ProductVisibilityState2["STATE_FAILED"] = "STATE_FAILED";
  ProductVisibilityState2["READY_TO_SUPPLY"] = "READY_TO_SUPPLY";
  ProductVisibilityState2["VALIDATION_STATE_PENDING"] = "VALIDATION_STATE_PENDING";
  ProductVisibilityState2["VALIDATION_STATE_FAIL"] = "VALIDATION_STATE_FAIL";
  ProductVisibilityState2["VALIDATION_STATE_SUCCESS"] = "VALIDATION_STATE_SUCCESS";
  ProductVisibilityState2["TO_SUPPLY"] = "TO_SUPPLY";
  ProductVisibilityState2["IN_SALE"] = "IN_SALE";
  ProductVisibilityState2["REMOVED_FROM_SALE"] = "REMOVED_FROM_SALE";
  ProductVisibilityState2["OVERPRICED"] = "OVERPRICED";
  ProductVisibilityState2["CRITICALLY_OVERPRICED"] = "CRITICALLY_OVERPRICED";
  ProductVisibilityState2["EMPTY_BARCODE"] = "EMPTY_BARCODE";
  ProductVisibilityState2["BARCODE_EXISTS"] = "BARCODE_EXISTS";
  ProductVisibilityState2["QUARANTINE"] = "QUARANTINE";
  ProductVisibilityState2["ARCHIVED"] = "ARCHIVED";
  ProductVisibilityState2["OVERPRICED_WITH_STOCK"] = "OVERPRICED_WITH_STOCK";
  ProductVisibilityState2["PARTIAL_APPROVED"] = "PARTIAL_APPROVED";
})(ProductVisibilityState || (ProductVisibilityState = {}));
var ProductStatus;
(function(ProductStatus2) {
  ProductStatus2["CREATED"] = "CREATED";
  ProductStatus2["MODERATED"] = "MODERATED";
  ProductStatus2["DECLINED"] = "DECLINED";
  ProductStatus2["PUBLISHED"] = "PUBLISHED";
  ProductStatus2["ARCHIVED"] = "ARCHIVED";
})(ProductStatus || (ProductStatus = {}));
var VisibilityStatus;
(function(VisibilityStatus2) {
  VisibilityStatus2["ALL"] = "ALL";
  VisibilityStatus2["VISIBLE"] = "VISIBLE";
  VisibilityStatus2["INVISIBLE"] = "INVISIBLE";
  VisibilityStatus2["EMPTY_STOCK"] = "EMPTY_STOCK";
  VisibilityStatus2["NOT_MODERATED"] = "NOT_MODERATED";
  VisibilityStatus2["MODERATED"] = "MODERATED";
  VisibilityStatus2["DISABLED"] = "DISABLED";
  VisibilityStatus2["STATE_FAILED"] = "STATE_FAILED";
})(VisibilityStatus || (VisibilityStatus = {}));

// scripts/sync-modules/ozon.mjs
var BATCH_SIZE2 = 100;
var REQUEST_DELAY = 100;
var cachedClient = null;
var cachedClientId = null;
var cachedApiKey = null;
function getClient(clientId, apiKey) {
  if (cachedClient && cachedClientId === clientId && cachedApiKey === apiKey) {
    return cachedClient;
  }
  cachedClient = new OzonSellerApiClient({ clientId, apiKey });
  cachedClientId = clientId;
  cachedApiKey = apiKey;
  return cachedClient;
}
async function ozonFetchAllProducts(clientId, apiKey, log3) {
  const api = getClient(clientId, apiKey);
  log3.write("  Fetching Ozon product list:");
  let lastId = null;
  const allItems = [];
  while (true) {
    const body = { filter: { visibility: "ALL" }, limit: 1e3 };
    if (lastId) body.last_id = lastId;
    const data = await api.product.getList(body);
    const items = data?.result?.items || [];
    for (const item of items) {
      allItems.push({
        offerId: String(item.offer_id || ""),
        productId: Number(item.product_id || 0),
        productSku: Number(item.sku) || 0
      });
    }
    log3.write(` ${allItems.length}`);
    lastId = data?.result?.last_id;
    if (!lastId || items.length < 1e3) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  log3.line(` \u2014 ${allItems.length} products`);
  return allItems;
}
async function ozonFetchProductInfo(clientId, apiKey, offerIds, log3) {
  if (offerIds.length === 0) return /* @__PURE__ */ new Map();
  const api = getClient(clientId, apiKey);
  const results = [];
  for (let i = 0; i < offerIds.length; i += BATCH_SIZE2) {
    const chunk = offerIds.slice(i, i + BATCH_SIZE2);
    const data = await api.product.getProductInfoListV3({
      offer_id: chunk,
      visibility: "ALL"
    });
    results.push(...data.items || []);
    await new Promise((r) => setTimeout(r, REQUEST_DELAY));
  }
  const infoMap = /* @__PURE__ */ new Map();
  for (const item of results) infoMap.set(String(item.offer_id), item);
  log3.line(`  Info: ${infoMap.size} products`);
  return infoMap;
}
async function ozonFetchProductAttributes(clientId, apiKey, offerIds, log3) {
  if (offerIds.length === 0) return /* @__PURE__ */ new Map();
  const api = getClient(clientId, apiKey);
  const results = [];
  for (let i = 0; i < offerIds.length; i += BATCH_SIZE2) {
    const chunk = offerIds.slice(i, i + BATCH_SIZE2);
    const data = await api.product.getAttributes({
      filter: { offer_id: chunk },
      limit: BATCH_SIZE2
    });
    results.push(...data.result || []);
    await new Promise((r) => setTimeout(r, REQUEST_DELAY));
  }
  const attrMap = /* @__PURE__ */ new Map();
  for (const item of results) attrMap.set(String(item.offer_id), item);
  log3.line(`  Attributes: ${attrMap.size} products`);
  return attrMap;
}

// scripts/sync-all.mjs
try {
  const { default: dotenv } = await Promise.resolve().then(() => __toESM(require_main(), 1));
  dotenv.config({ path: ".env" });
  dotenv.config({ path: ".env.local" });
} catch {
}
var WB_CONTENT_API = "https://content-api.wildberries.ru";
var ITEMS_PER_WB_CARDS = 100;
var FETCH_TIMEOUT = 3e4;
var flags = {
  dry: process.argv.includes("--dry"),
  wbOnly: process.argv.includes("--wb-only"),
  ozonOnly: process.argv.includes("--ozon-only"),
  fromPhase: null
};
var fromIdx = process.argv.indexOf("--from-phase");
if (fromIdx !== -1 && fromIdx + 1 < process.argv.length) {
  flags.fromPhase = process.argv[fromIdx + 1];
}
var PHASES = [
  "wb-cards",
  "wb-cards-v4",
  // card.wb.ru — цены + стоки + рейтинг
  "wb-process",
  "ozon-list",
  "ozon-info",
  "ozon-attrs",
  "ozon-process",
  "ozon-prices",
  "wb-models",
  "ozon-models",
  "archive"
];
function shouldRun(phase) {
  if (!flags.fromPhase) return true;
  const idx = PHASES.indexOf(phase);
  const fromIdx2 = PHASES.indexOf(flags.fromPhase);
  if (fromIdx2 === -1) return true;
  return idx >= fromIdx2;
}
var FIELD_LABELS = {
  price: "\u0446\u0435\u043D\u0430",
  originalPrice: "\u0446\u0435\u043D\u0430 \u0431\u0435\u0437 \u0441\u043A\u0438\u0434\u043A\u0438",
  wbPrice: "\u0446\u0435\u043D\u0430 WB",
  wbOriginalPrice: "\u0446\u0435\u043D\u0430 WB \u0431\u0435\u0437 \u0441\u043A\u0438\u0434\u043A\u0438",
  ozonPrice: "\u0446\u0435\u043D\u0430 Ozon",
  ozonOriginalPrice: "\u0446\u0435\u043D\u0430 Ozon \u0431\u0435\u0437 \u0441\u043A\u0438\u0434\u043A\u0438",
  wbStock: "\u0441\u0442\u043E\u043A WB",
  ozonStock: "\u0441\u0442\u043E\u043A Ozon",
  inStock: "\u043D\u0430\u043B\u0438\u0447\u0438\u0435",
  rating: "\u0440\u0435\u0439\u0442\u0438\u043D\u0433",
  reviewsCount: "\u043E\u0442\u0437\u044B\u0432\u044B",
  salesCount: "\u043F\u0440\u043E\u0434\u0430\u0436\u0438",
  image: "\u0433\u043B\u0430\u0432\u043D\u043E\u0435 \u0444\u043E\u0442\u043E",
  images: "\u0444\u043E\u0442\u043E",
  photoCount: "\u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0444\u043E\u0442\u043E",
  composition: "\u0441\u043E\u0441\u0442\u0430\u0432",
  colorName: "\u0446\u0432\u0435\u0442",
  name: "\u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435",
  nameAutoGenerated: "\u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 (\u0430\u0432\u0442\u043E)",
  category: "\u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F",
  description: "\u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435",
  descAutoGenerated: "\u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 (\u0430\u0432\u0442\u043E)",
  characteristics: "\u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438",
  wbArticle: "\u0430\u0440\u0442\u0438\u043A\u0443\u043B WB",
  ozonArticle: "\u0430\u0440\u0442\u0438\u043A\u0443\u043B Ozon"
};
function fmtPrice(n) {
  if (n == null) return "\u2014";
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " \u20BD";
}
function formatChanges(db, updates) {
  const changes = [];
  for (const [key, newVal] of Object.entries(updates)) {
    const label = FIELD_LABELS[key] || key;
    const oldVal = db?.[key];
    if (typeof newVal === "number" && typeof oldVal === "number") {
      if (key === "price" || key === "originalPrice" || key === "wbPrice" || key === "wbOriginalPrice" || key === "ozonPrice" || key === "ozonOriginalPrice") {
        changes.push(`${label}: ${fmtPrice(oldVal)} \u2192 ${fmtPrice(newVal)}`);
      } else {
        changes.push(`${label}: ${oldVal} \u2192 ${newVal}`);
      }
    } else if (typeof newVal === "boolean" && typeof oldVal === "boolean") {
      const yesno = (v) => v ? "\u0435\u0441\u0442\u044C" : "\u043D\u0435\u0442";
      if (oldVal !== newVal) changes.push(`${label}: ${yesno(oldVal)} \u2192 ${yesno(newVal)}`);
    } else if (key === "images" && Array.isArray(newVal)) {
      changes.push(`${label}: ${oldVal?.length || 0} \u2192 ${newVal.length} \u0448\u0442`);
    } else if (typeof newVal === "string") {
      if (newVal.length > 50 || key === "image" || key === "description") {
        changes.push(`${label}: \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E`);
      } else if (oldVal !== newVal) {
        changes.push(`${label}: \xAB${oldVal || "\u2014"}\xBB \u2192 \xAB${newVal}\xBB`);
      }
    } else if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
      changes.push(`${label}: \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E`);
    }
  }
  return changes;
}
var log2 = {
  lines: [],
  write(msg) {
    process.stdout.write(msg);
    this.lines.push(msg);
  },
  line(msg) {
    console.log(msg);
    this.lines.push(msg + "\n");
  },
  progress(phase, current, total) {
    const msg = JSON.stringify({ type: "progress", phase, current, total });
    console.log(`[PROGRESS] ${msg}`);
    this.lines.push(msg + "\n");
  },
  detail(action, productId, name, changes) {
    const msg = JSON.stringify({ type: "detail", action, product: productId, name, changes });
    console.log(`[DETAIL] ${msg}`);
    this.lines.push(msg + "\n");
  }
};
async function wbFetch(baseUrl, path, options = {}, attempt = 1) {
  const headers = {
    Authorization: options.apiKey,
    "Content-Type": "application/json",
    ...options.headers || {}
  };
  const url = baseUrl + path;
  const resp = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : void 0,
    signal: AbortSignal.timeout(FETCH_TIMEOUT)
  });
  if (resp.status === 429 && attempt <= 3) {
    const retryAfter = parseInt(resp.headers.get("Retry-After") || "1", 10);
    const delay = Math.min(retryAfter * 1e3, 3e4);
    log2.line(`  429 (\u043F\u043E\u043F\u044B\u0442\u043A\u0430 ${attempt}): \u043F\u043E\u0432\u0442\u043E\u0440 \u0447\u0435\u0440\u0435\u0437 ${delay}\u043C\u0441`);
    await new Promise((r) => setTimeout(r, delay));
    return wbFetch(baseUrl, path, options, attempt + 1);
  }
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`WB API ${resp.status} \u2014 ${url}
${text.slice(0, 300)}`);
  }
  return resp.json();
}
async function wbFetchAllCards(apiKey, trash = false) {
  const endpoint = trash ? "/content/v2/get/cards/trash" : "/content/v2/get/cards/list";
  const allCards = [];
  let cursor = { limit: ITEMS_PER_WB_CARDS };
  let total = Infinity;
  log2.write(`  \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 ${trash ? "\u0443\u0434\u0430\u043B\u0451\u043D\u043D\u044B\u0445" : "\u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445"} \u043A\u0430\u0440\u0442\u043E\u0447\u0435\u043A:`);
  while (allCards.length < total) {
    const body = {
      settings: { cursor, filter: { withPhoto: -1 } }
    };
    const data = await wbFetch(WB_CONTENT_API, endpoint, { method: "POST", apiKey, body });
    const cards = data.cards || [];
    allCards.push(...cards);
    total = data.cursor?.total ?? allCards.length;
    log2.write(` ${allCards.length}/${total}`);
    if (data.cursor && cards.length === ITEMS_PER_WB_CARDS) {
      cursor = data.cursor;
      await new Promise((r) => setTimeout(r, 200));
    } else {
      break;
    }
  }
  log2.line(` \u2014 ${allCards.length} \u043A\u0430\u0440\u0442\u043E\u0447\u0435\u043A`);
  return allCards;
}
async function getExistingProducts(prisma) {
  const all = await prisma.product.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      sku: true,
      category: true,
      description: true,
      image: true,
      images: true,
      ozonImage: true,
      ozonImages: true,
      price: true,
      originalPrice: true,
      wbArticle: true,
      ozonArticle: true,
      wbPrice: true,
      wbOriginalPrice: true,
      ozonPrice: true,
      ozonOriginalPrice: true,
      wbStock: true,
      ozonStock: true,
      inStock: true,
      photoCount: true,
      rating: true,
      reviewsCount: true,
      colorName: true,
      composition: true,
      characteristics: true,
      nameAutoGenerated: true,
      descAutoGenerated: true,
      wbCreatedAt: true,
      wbUpdatedAt: true,
      archivedAt: true,
      modelId: true
    }
  });
  return {
    byWbArticle: new Map(all.filter((p) => p.wbArticle).map((p) => [Number(p.wbArticle), p])),
    byOzonArticle: new Map(all.filter((p) => p.ozonArticle).map((p) => [Number(p.ozonArticle), p])),
    byId: new Map(all.map((p) => [p.id, p])),
    bySku: new Map(all.filter((p) => p.sku).map((p) => [p.sku, p])),
    all
  };
}
async function generateId(prisma) {
  const last = await prisma.product.findFirst({
    orderBy: { id: "desc" },
    select: { id: true }
  });
  const num = last ? parseInt(last.id.replace("mor-", ""), 10) + 1 : 1;
  return "mor-" + String(num).padStart(3, "0");
}
async function createProduct(prisma, data) {
  if (flags.dry) return `mor-000`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = await generateId(prisma);
    const sku = data.sku || null;
    const slug = sku ? makeSlug(sku) : id;
    try {
      await prisma.product.create({
        data: {
          id,
          slug,
          sku,
          name: data.name || "",
          price: data.price || 0,
          originalPrice: data.originalPrice || 0,
          currency: "\u20BD",
          category: data.category || "crossbody",
          description: data.description || "",
          image: data.image || "",
          images: data.images || [],
          wbArticle: toBigInt(data.wbArticle),
          ozonArticle: toBigInt(data.ozonArticle),
          wbPrice: data.wbPrice ?? null,
          wbOriginalPrice: data.wbOriginalPrice ?? null,
          ozonPrice: data.ozonPrice ?? null,
          ozonOriginalPrice: data.ozonOriginalPrice ?? null,
          rating: data.rating ?? null,
          reviewsCount: data.reviewsCount ?? null,
          colorName: data.colorName ?? null,
          composition: data.composition ?? null,
          inStock: data.inStock ?? true,
          photoCount: data.photoCount || 1,
          characteristics: data.characteristics ?? null,
          nameAutoGenerated: data.nameAutoGenerated ?? true,
          descAutoGenerated: data.descAutoGenerated ?? true,
          wbCreatedAt: data.wbCreatedAt ?? null,
          wbUpdatedAt: data.wbUpdatedAt ?? null,
          archivedAt: data.archivedAt ?? null
        }
      });
      return id;
    } catch (err) {
      const code = err?.code;
      if (code === "P2002" && attempt < 2) continue;
      throw err;
    }
  }
}
async function updateProduct(prisma, id, data) {
  const updateData = {};
  const fields = [
    "name",
    "price",
    "originalPrice",
    "wbPrice",
    "wbOriginalPrice",
    "ozonPrice",
    "ozonOriginalPrice",
    "category",
    "description",
    "image",
    "images",
    "rating",
    "reviewsCount",
    "colorName",
    "composition",
    "inStock",
    "photoCount",
    "wbStock",
    "ozonStock",
    "ozonImage",
    "ozonImages",
    "characteristics",
    "nameAutoGenerated",
    "descAutoGenerated",
    "wbCreatedAt",
    "wbUpdatedAt",
    "archivedAt",
    "sku",
    "ozonArticle"
  ];
  for (const f of fields) {
    if (data[f] !== void 0) updateData[f] = data[f];
  }
  if (Object.keys(updateData).length === 0) return false;
  if (!flags.dry) {
    await prisma.product.update({ where: { id }, data: updateData });
  }
  return true;
}
async function main() {
  const startTime = Date.now();
  log2.line("=== \u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u044F \u0437\u0430\u043F\u0443\u0449\u0435\u043D\u0430 ===\n");
  if (flags.dry) log2.line("  [DRY RUN \u2014 \u0431\u0435\u0437 \u0437\u0430\u043F\u0438\u0441\u0438 \u0432 \u0411\u0414]\n");
  if (flags.fromPhase) log2.line(`  \u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0435\u043D\u0438\u0435 \u0441 \u0444\u0430\u0437\u044B: ${flags.fromPhase}
`);
  const wbApiKey = process.env.WB_API_KEY;
  const ozonClientId = process.env.OZON_CLIENT_ID;
  const ozonApiKey = process.env.OZON_API_KEY;
  if (!wbApiKey && !flags.ozonOnly) {
    console.error("ERROR: WB_API_KEY \u043D\u0435 \u0437\u0430\u0434\u0430\u043D.");
    console.error("  \u041B\u043E\u043A\u0430\u043B\u044C\u043D\u043E: \u0434\u043E\u0431\u0430\u0432\u044C WB_API_KEY=... \u0432 .env.local");
    console.error("  Vercel:   \u0434\u043E\u0431\u0430\u0432\u044C WB_API_KEY \u0432 Settings \u2192 Environment Variables");
    process.exit(1);
  }
  if ((!ozonClientId || !ozonApiKey) && !flags.wbOnly) {
    console.error("ERROR: OZON_CLIENT_ID \u0438 OZON_API_KEY \u043D\u0435 \u0437\u0430\u0434\u0430\u043D\u044B.");
    console.error("  \u041B\u043E\u043A\u0430\u043B\u044C\u043D\u043E: \u0434\u043E\u0431\u0430\u0432\u044C \u0432 .env.local");
    console.error("  Vercel:   \u0434\u043E\u0431\u0430\u0432\u044C \u0432 Settings \u2192 Environment Variables");
    process.exit(1);
  }
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || "" })
  });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  async function prismaRetry(fn) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await fn();
      } catch (e) {
        if (attempt < 3) {
          console.log(`  \u041F\u043E\u0432\u0442\u043E\u0440 \u0411\u0414 ${attempt}/3 \u0447\u0435\u0440\u0435\u0437 ${attempt}\u0441...`);
          await sleep(attempt * 1e3);
        } else {
          throw e;
        }
      }
    }
  }
  try {
    log2.line("\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u0438\u0437 \u0411\u0414...");
    const existing = await prismaRetry(() => getExistingProducts(prisma));
    log2.line(`  ${existing.all.length} \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u0432 \u0411\u0414
`);
    const stats = {
      wbCreated: 0,
      wbUpdated: 0,
      wbSkipped: 0,
      ozonCreated: 0,
      ozonUpdated: 0,
      ozonSkipped: 0,
      archived: 0,
      outOfStock: 0,
      errors: 0
    };
    let wbArticles = [];
    let ozonItems = [];
    let trashArticles = [];
    let wbCards = [];
    let wbTrashCards = [];
    let wbCardV4Map = /* @__PURE__ */ new Map();
    let infoMap, attrMap;
    if (!flags.ozonOnly) {
      if (shouldRun("wb-cards")) {
        log2.progress("wb-cards", 0, 1);
        log2.line("[1/2] \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043A\u0430\u0440\u0442\u043E\u0447\u0435\u043A WB (\u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0435)...");
        wbCards = await wbFetchAllCards(wbApiKey, false);
        wbArticles = wbCards.map((c) => c.nmID);
        log2.line(`  ${wbCards.length} \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u043A\u0430\u0440\u0442\u043E\u0447\u0435\u043A
`);
        log2.progress("wb-cards", 1, 1);
        log2.progress("wb-trash", 0, 1);
        log2.line("[2/2] \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043A\u0430\u0440\u0442\u043E\u0447\u0435\u043A WB (\u043A\u043E\u0440\u0437\u0438\u043D\u0430)...");
        wbTrashCards = await wbFetchAllCards(wbApiKey, true);
        trashArticles = wbTrashCards.map((c) => c.nmID);
        log2.line(`  ${wbTrashCards.length} \u043A\u0430\u0440\u0442\u043E\u0447\u0435\u043A \u0432 \u043A\u043E\u0440\u0437\u0438\u043D\u0435
`);
        log2.progress("wb-trash", 1, 1);
      }
      if (shouldRun("wb-cards-v4") && wbArticles?.length > 0) {
        log2.progress("wb-cards-v4", 0, 1);
        log2.line("\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0446\u0435\u043D/\u0441\u0442\u043E\u043A\u043E\u0432/\u0440\u0435\u0439\u0442\u0438\u043D\u0433\u0430 \u0447\u0435\u0440\u0435\u0437 card.wb.ru...");
        wbCardV4Map = await wbFetchCardsV4(null, log2, wbArticles);
        log2.progress("wb-cards-v4", 1, 1);
      }
      if (shouldRun("wb-process")) {
        const wbVendorToNm = /* @__PURE__ */ new Map();
        for (const card of wbCards) {
          const vc = card.vendorCode?.trim();
          if (vc) wbVendorToNm.set(vc, card.nmID);
        }
        log2.line("\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u043A\u0430\u0440\u0442\u043E\u0447\u0435\u043A WB...");
        log2.progress("wb-process", 0, wbCards.length);
        for (let i = 0; i < wbCards.length; i++) {
          const card = wbCards[i];
          const article = card.nmID;
          const vendorCode = (card.vendorCode || "").trim();
          let db = vendorCode ? existing.bySku.get(vendorCode) : null;
          if (!db) db = existing.byWbArticle.get(article);
          const v4 = wbCardV4Map.get(article) || null;
          const wbPrices = v4 ? {
            price: v4.price,
            discountedPrice: v4.discountedPrice,
            stock: v4.stock
          } : null;
          const wbRating = v4?.rating != null ? { rating: v4.rating, feedbacks: v4.feedbacks ?? card.feedbacks ?? 0 } : card.rating != null ? { rating: card.rating, feedbacks: card.feedbacks ?? 0 } : null;
          if (db) {
            const ensureFields = {};
            if (article && !db.wbArticle) ensureFields.wbArticle = toBigInt(article);
            const updates = mergeProductSources(card, wbPrices, wbRating, null, null, null, db);
            const allUpdates = { ...ensureFields, ...updates };
            if (Object.keys(allUpdates).length > 0) {
              const ok = await updateProduct(prisma, db.id, allUpdates);
              if (ok) {
                stats.wbUpdated++;
                const changes = formatChanges(db, allUpdates);
                log2.line(`  ${db.id} wb-${article} \xAB${db.name}\xBB: ${changes.join(", ")}`);
                log2.detail("updated", db.id, db.name, changes);
              }
            } else {
              stats.wbSkipped++;
            }
          } else {
            const updates = mergeProductSources(card, wbPrices, wbRating, null, null, null, null);
            const id = await createProduct(prisma, {
              ...updates,
              sku: vendorCode || null,
              wbArticle: article,
              name: updates.name || (0, import_name_generator2.generateName)({
                category: updates.category || resolveCategory(card),
                wbName: card.title || card.imt_name || null
              }),
              description: updates.description || extractDescription(card),
              image: updates.image || cdnImageUrl(article, 1),
              images: updates.images || cdnImageUrls(article, extractPhotoCount(card)),
              photoCount: updates.photoCount || extractPhotoCount(card),
              wbCreatedAt: card.createdAt ? new Date(card.createdAt) : null,
              wbUpdatedAt: card.updatedAt ? new Date(card.updatedAt) : null
            });
            log2.line(`  \u0421\u043E\u0437\u0434\u0430\u043D: ${id} (sku=${vendorCode}), \u0430\u0440\u0442\u0438\u043A\u0443\u043B WB: ${article}`);
            log2.detail("created", id, updates.name || card.title || "", []);
            stats.wbCreated++;
          }
          if ((i + 1) % 10 === 0 || i === wbCards.length - 1) {
            log2.progress("wb-process", i + 1, wbCards.length);
          }
        }
        log2.line(`  WB: ${stats.wbCreated} \u0441\u043E\u0437\u0434\u0430\u043D\u043E, ${stats.wbUpdated} \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E
`);
      }
    }
    if (!flags.wbOnly) {
      if (shouldRun("ozon-list")) {
        log2.progress("ozon-list", 0, 1);
        log2.line("[Ozon] \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0441\u043F\u0438\u0441\u043A\u0430 \u0442\u043E\u0432\u0430\u0440\u043E\u0432...");
        ozonItems = await ozonFetchAllProducts(ozonClientId, ozonApiKey, log2);
        log2.line(`  ${ozonItems.length} \u0442\u043E\u0432\u0430\u0440\u043E\u0432 Ozon
`);
        log2.progress("ozon-list", 1, 1);
      }
      const offerIdList = ozonItems.map((i) => i.offerId).filter(Boolean);
      if (shouldRun("ozon-info") || shouldRun("ozon-attrs")) {
        log2.line("[Ozon] \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0434\u0435\u0442\u0430\u043B\u0435\u0439 \u0442\u043E\u0432\u0430\u0440\u043E\u0432 (\u043F\u0430\u0440\u0430\u043B\u043B\u0435\u043B\u044C\u043D\u043E)...");
        const fetches = [];
        if (shouldRun("ozon-info")) {
          log2.progress("ozon-info", 0, 1);
          fetches.push(
            ozonFetchProductInfo(ozonClientId, ozonApiKey, offerIdList, log2).then((r) => {
              infoMap = r;
              log2.progress("ozon-info", 1, 1);
              return r;
            })
          );
        }
        if (shouldRun("ozon-attrs")) {
          log2.progress("ozon-attrs", 0, 1);
          fetches.push(
            ozonFetchProductAttributes(ozonClientId, ozonApiKey, offerIdList, log2).then((r) => {
              attrMap = r;
              log2.progress("ozon-attrs", 1, 1);
              return r;
            })
          );
        }
        await Promise.all(fetches);
        log2.line("");
      }
      if (shouldRun("ozon-process")) {
        log2.line("\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0442\u043E\u0432\u0430\u0440\u043E\u0432 Ozon...");
        const ozonLocks = /* @__PURE__ */ new Map();
        for (const p of existing.all) {
          if (p.ozonArticle) ozonLocks.set(Number(p.ozonArticle), p.id);
        }
        const skippedOzonFixes = [];
        const totalOzonItems = ozonItems.filter((i) => i.offerId || i.productId).length;
        log2.progress("ozon-process", 0, totalOzonItems);
        let ozonProcessed = 0;
        for (const { offerId, productId, productSku } of ozonItems) {
          if (!offerId && !productId) continue;
          const info = infoMap?.get(offerId);
          const attrs = attrMap?.get(offerId);
          const publicSku = productSku || info?.sources?.[0]?.sku || 0;
          let db = offerId ? existing.bySku.get(offerId) : null;
          if (!db && publicSku) db = existing.byOzonArticle.get(Number(publicSku));
          if (!db) db = existing.byOzonArticle.get(productId);
          if (!info) continue;
          if (db) {
            const ensureFields = {};
            if (publicSku && (!db.ozonArticle || Number(db.ozonArticle) !== Number(publicSku))) {
              const newVal = Number(publicSku);
              const oldVal = db.ozonArticle ? Number(db.ozonArticle) : 0;
              if (oldVal !== newVal) {
                if (oldVal) ozonLocks.delete(oldVal);
                if (ozonLocks.has(newVal)) {
                  skippedOzonFixes.push({ db, newVal, oldVal });
                } else {
                  ozonLocks.set(newVal, db.id);
                  ensureFields.ozonArticle = toBigInt(newVal);
                }
              }
            }
            const updates = mergeProductSources(null, null, null, info, attrs, null, db);
            const allUpdates = { ...ensureFields, ...updates };
            if (Object.keys(allUpdates).length > 0) {
              const ok = await updateProduct(prisma, db.id, allUpdates);
              if (ok) {
                stats.ozonUpdated++;
                const changes = formatChanges(db, allUpdates);
                log2.line(`  ${db.id} offer-${offerId} \xAB${db.name}\xBB: ${changes.join(", ")}`);
                log2.detail("updated", db.id, db.name, changes);
              }
            } else {
              stats.ozonSkipped++;
            }
          } else {
            const ozonCat = ozonExtractCategory(info, attrs);
            const ozonComp = ozonExtractComposition(attrs);
            const id = await createProduct(prisma, {
              sku: offerId || null,
              name: info.name || "",
              price: 0,
              originalPrice: 0,
              ozonPrice: null,
              ozonOriginalPrice: null,
              category: ozonCat || "crossbody",
              description: ozonExtractDescription(attrs),
              image: info.images?.[0] || "",
              images: info.images || [],
              ozonImage: info.images?.[0] || null,
              ozonImages: info.images || [],
              ozonArticle: publicSku || productId,
              photoCount: info.images?.length || 1,
              colorName: ozonExtractColor(info, attrs),
              composition: ozonComp,
              rating: null,
              inStock: info.stocks?.stocks?.some(
                (s) => (s.present || 0) - (s.reserved || 0) > 0
              ) ?? true,
              nameAutoGenerated: true,
              descAutoGenerated: true
            });
            log2.line(`  \u0421\u043E\u0437\u0434\u0430\u043D (Ozon): ${id} (offer=${offerId}), \u0430\u0440\u0442\u0438\u043A\u0443\u043B Ozon: ${publicSku || productId}`);
            log2.detail("created", id, info.name || "", []);
            stats.ozonCreated++;
          }
          ozonProcessed++;
          if (ozonProcessed % 10 === 0 || ozonProcessed === totalOzonItems) {
            log2.progress("ozon-process", ozonProcessed, totalOzonItems);
          }
        }
        if (skippedOzonFixes.length > 0) {
          log2.line(`  \u0412\u0442\u043E\u0440\u043E\u0439 \u043F\u0440\u043E\u0445\u043E\u0434: \u043F\u043E\u0432\u0442\u043E\u0440 \u0434\u043B\u044F ${skippedOzonFixes.length} \u043F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u043D\u044B\u0445 ozonArticle...`);
          for (const { db, newVal, oldVal } of skippedOzonFixes) {
            if (ozonLocks.has(newVal)) {
              log2.line(`    \u0412\u0441\u0451 \u0435\u0449\u0451 \u043F\u0440\u043E\u043F\u0443\u0449\u0435\u043D ${db.id}: ${newVal} \u0437\u0430\u043D\u044F\u0442 ${ozonLocks.get(newVal)}`);
            } else {
              ozonLocks.set(newVal, db.id);
              const ok = await updateProduct(prisma, db.id, { ozonArticle: toBigInt(newVal) });
              if (ok) {
                log2.line(`    \u0418\u0441\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 ozonArticle \u0434\u043B\u044F ${db.id}: ${oldVal} \u2192 ${newVal} (2-\u0439 \u043F\u0440\u043E\u0445\u043E\u0434)`);
                stats.ozonUpdated++;
              }
            }
          }
        }
        log2.line(`  Ozon: ${stats.ozonUpdated} \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E
`);
      }
    }
    if (shouldRun("ozon-prices") && !flags.wbOnly) {
      log2.progress("ozon-prices", 0, 1);
      const ozonSkuList = existing.all.filter((p) => p.ozonArticle).map((p) => Number(p.ozonArticle)).filter((n) => n > 0);
      if (ozonSkuList.length > 0) {
        log2.line(
          `[Ozon Prices] \u041F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0435 \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u0445 \u0446\u0435\u043D \u0434\u043B\u044F ${ozonSkuList.length} \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u0447\u0435\u0440\u0435\u0437 headless \u0431\u0440\u0430\u0443\u0437\u0435\u0440...`
        );
        try {
          const { getProductsPrices: getProductsPrices2 } = await Promise.resolve().then(() => (init_ozon_price(), ozon_price_exports));
          const prices = await getProductsPrices2(ozonSkuList);
          let updated = 0;
          for (const { sku, cardPrice, price, oldPrice } of prices) {
            const numSku = Number(sku);
            const db = existing.byOzonArticle.get(numSku);
            if (!db) continue;
            const effectivePrice = cardPrice ?? price;
            if (effectivePrice == null) continue;
            const updates = {};
            const changes = [];
            if (effectivePrice !== db.ozonPrice) {
              updates.ozonPrice = effectivePrice;
              changes.push(
                `ozonPrice ${fmtPrice(db.ozonPrice)} \u2192 ${fmtPrice(effectivePrice)}`
              );
            }
            if (oldPrice != null && oldPrice !== db.ozonOriginalPrice) {
              updates.ozonOriginalPrice = oldPrice;
              changes.push(
                `ozonOriginalPrice ${fmtPrice(db.ozonOriginalPrice)} \u2192 ${fmtPrice(oldPrice)}`
              );
            }
            const wbP = db.wbPrice ?? null;
            const allPrices = [wbP, effectivePrice].filter((p) => p != null);
            if (allPrices.length > 0) {
              const newPrice = Math.min(...allPrices);
              if (newPrice !== db.price) {
                updates.price = newPrice;
                changes.push(
                  `price ${fmtPrice(db.price)} \u2192 ${fmtPrice(newPrice)}`
                );
              }
            }
            const origPrice = oldPrice ?? db.ozonOriginalPrice ?? null;
            const wbOrigP = db.wbOriginalPrice ?? null;
            const allOrigPrices = [wbOrigP, origPrice].filter((p) => p != null);
            if (allOrigPrices.length > 0) {
              const newOrigPrice = Math.min(...allOrigPrices);
              if (newOrigPrice !== db.originalPrice) {
                updates.originalPrice = newOrigPrice;
                changes.push(
                  `originalPrice ${fmtPrice(db.originalPrice)} \u2192 ${fmtPrice(newOrigPrice)}`
                );
              }
            }
            if (Object.keys(updates).length > 0) {
              const ok = await updateProduct(prisma, db.id, updates);
              if (ok) {
                updated++;
                log2.line(`  ${db.id} ozon-${sku} \xAB${db.name}\xBB: ${changes.join(", ")}`);
                log2.detail("updated", db.id, db.name, formatChanges(db, updates));
              }
            }
          }
          const skipped2 = prices.length - updated;
          log2.line(`  Ozon Prices: ${updated} \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E` + (skipped2 > 0 ? `, ${skipped2} \u0431\u0435\u0437 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0439` : ""));
        } catch (err) {
          if (err.message?.includes("\u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D") || err.message?.includes("Chromium")) {
            log2.line("  [Ozon Prices] \u041F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u043E \u2014 \u043D\u0435\u0442 Chromium (Vercel / \u0441\u0431\u043E\u0440\u043A\u0430)");
          } else {
            log2.line(`  [Ozon Prices] \u041E\u0448\u0438\u0431\u043A\u0430: ${err.message}`);
            stats.errors++;
          }
        }
      } else {
        log2.line("[Ozon Prices] \u041D\u0435\u0442 \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u0441 ozonArticle");
      }
      log2.progress("ozon-prices", 1, 1);
    }
    if (shouldRun("ozon-models") && !flags.wbOnly) {
      log2.progress("ozon-models", 0, 1);
      const ozonModelResult = await syncOzonModels(prisma, attrMap || /* @__PURE__ */ new Map(), log2);
      if (ozonModelResult.created > 0 || ozonModelResult.assigned > 0) {
        log2.line(`  \u041C\u043E\u0434\u0435\u043B\u0438 Ozon: ${ozonModelResult.created} \u0441\u043E\u0437\u0434\u0430\u043D\u043E, ${ozonModelResult.assigned} \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D\u043E`);
      }
      log2.progress("ozon-models", 1, 1);
    }
    if (shouldRun("wb-models") && !flags.ozonOnly && wbCards.length > 0) {
      log2.progress("wb-models", 0, 1);
      log2.line("\u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u044F \u043C\u043E\u0434\u0435\u043B\u0435\u0439 \u0438\u0437 WB imtId...");
      const modelResult = await syncModels(prisma, wbCards, resolveCategory, log2, flags);
      log2.line(`  \u041C\u043E\u0434\u0435\u043B\u0438 WB: ${modelResult.created} \u0441\u043E\u0437\u0434\u0430\u043D\u043E, ${modelResult.assigned} \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D\u043E
`);
      log2.progress("wb-models", 1, 1);
    }
    if (shouldRun("archive")) {
      log2.progress("archive", 0, 1);
      log2.line("\u0410\u0440\u0445\u0438\u0432\u0430\u0446\u0438\u044F \u0443\u0434\u0430\u043B\u0451\u043D\u043D\u044B\u0445 \u0442\u043E\u0432\u0430\u0440\u043E\u0432...");
      const archiveResult = await archiveGoneProducts(
        prisma,
        existing.all,
        wbArticles,
        ozonItems,
        trashArticles,
        !flags.ozonOnly,
        !flags.wbOnly,
        log2,
        flags
      );
      stats.archived = archiveResult.archived;
      stats.outOfStock = archiveResult.markedOutOfStock;
      log2.progress("archive", 1, 1);
    }
    log2.progress("done", 1, 1);
    const duration = ((Date.now() - startTime) / 1e3).toFixed(1);
    log2.line("\n=== \u0418\u0422\u041E\u0413 ===");
    log2.line(`  WB \u0441\u043E\u0437\u0434\u0430\u043D\u043E:              ${stats.wbCreated}`);
    log2.line(`  WB \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E:            ${stats.wbUpdated}`);
    log2.line(`  WB \u043F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u043E:            ${stats.wbSkipped}`);
    log2.line(`  WB card.wb.ru:           ${wbCardV4Map.size} \u0442\u043E\u0432\u0430\u0440\u043E\u0432`);
    log2.line(`  Ozon \u0441\u043E\u0437\u0434\u0430\u043D\u043E:            ${stats.ozonCreated}`);
    log2.line(`  Ozon \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E:          ${stats.ozonUpdated}`);
    log2.line(`  Ozon \u043F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u043E:          ${stats.ozonSkipped}`);
    log2.line(`  \u0410\u0440\u0445\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D\u043E:            ${stats.archived}`);
    log2.line(`  \u041D\u0435\u0442 \u0432 \u043D\u0430\u043B\u0438\u0447\u0438\u0438:           ${stats.outOfStock}`);
    log2.line(`  \u041E\u0448\u0438\u0431\u043E\u043A:                  ${stats.errors}`);
    log2.line(`  \u0414\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C:            ${duration}\u0441`);
    log2.line(`  \u0420\u0435\u0436\u0438\u043C:                   ${flags.dry ? "DRY (\u0431\u0435\u0437 \u0437\u0430\u043F\u0438\u0441\u0438)" : "live"}`);
    const skipped = stats.wbSkipped + stats.ozonSkipped;
    const summary = {
      created: stats.wbCreated + stats.ozonCreated,
      updated: stats.wbUpdated + stats.ozonUpdated,
      skipped,
      archived: stats.archived,
      outOfStock: stats.outOfStock,
      errors: stats.errors,
      total: stats.wbCreated + stats.ozonCreated + stats.wbUpdated + stats.ozonUpdated + skipped,
      duration: parseFloat(duration)
    };
    console.log(JSON.stringify(summary));
  } catch (err) {
    console.error("\nFATAL:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
async function runWbSync() {
  Object.assign(flags, { wbOnly: true, ozonOnly: false, dry: false, fromPhase: null });
  if (!process.env.WB_API_KEY) throw new Error("WB_API_KEY \u043D\u0435 \u0437\u0430\u0434\u0430\u043D");
  await main();
}
async function runOzonSync() {
  Object.assign(flags, { wbOnly: false, ozonOnly: true, dry: false, fromPhase: null });
  if (!process.env.OZON_CLIENT_ID || !process.env.OZON_API_KEY) throw new Error("OZON_CLIENT_ID/OZON_API_KEY \u043D\u0435 \u0437\u0430\u0434\u0430\u043D\u044B");
  await main();
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
export {
  runOzonSync,
  runWbSync
};
