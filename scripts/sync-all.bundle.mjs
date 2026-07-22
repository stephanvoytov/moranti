#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b2) => (typeof require !== "undefined" ? require : a)[b2]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
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
    var CATEGORY_RU3 = {
      crossbody: "\u0421\u0443\u043C\u043A\u0430 \u043A\u0440\u043E\u0441\u0441-\u0431\u043E\u0434\u0438",
      "na-plecho": "\u0421\u0443\u043C\u043A\u0430 \u043D\u0430 \u043F\u043B\u0435\u0447\u043E",
      baguette: "\u0421\u0443\u043C\u043A\u0430-\u0431\u0430\u0433\u0435\u0442",
      tote: "\u0421\u0443\u043C\u043A\u0430-\u0442\u043E\u0443\u0442",
      saddle: "\u0421\u0443\u043C\u043A\u0430-\u0441\u0435\u0434\u043B\u043E",
      backpack: "\u0421\u0443\u043C\u043A\u0430-\u0440\u044E\u043A\u0437\u0430\u043A"
    };
    function wbToCategory3(subjectId, subjectName, subjId) {
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
    module.exports = { CATEGORY_MAP, CATEGORY_RU: CATEGORY_RU3, wbToCategory: wbToCategory3 };
  }
});

// scripts/name-generator.js
var require_name_generator = __commonJS({
  "scripts/name-generator.js"(exports, module) {
    "use strict";
    var { CATEGORY_RU: CATEGORY_RU3 } = require_wb_categories();
    function generateName3({ category, composition, wbName }) {
      const cat = category || "crossbody";
      const base = CATEGORY_RU3[cat] || cat;
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
    var fs2 = __require("fs");
    var path = __require("path");
    var os2 = __require("os");
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
            if (fs2.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path.resolve(process.cwd(), ".env.vault");
      }
      if (fs2.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path.join(os2.homedir(), envPath.slice(1)) : envPath;
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
          const parsed = DotenvModule.parse(fs2.readFileSync(path2, { encoding }));
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

// scripts/sync-all.mjs
import { fileURLToPath } from "url";

// scripts/sync-modules/transform.mjs
var import_wb_categories = __toESM(require_wb_categories(), 1);
var GEO_CDN_HOST = "kgd-basket-cdn-01bl.geobasket.ru";
function toBigInt(v2) {
  if (v2 == null) return null;
  return BigInt(v2);
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
    return colors.map((c2) => c2.name).filter(Boolean).join(", ");
  }
  return extractCharByName(card, "\u0426\u0432\u0435\u0442") || extractCharByName(card, "\u0426\u0432\u0435\u0442 \u0442\u043E\u0432\u0430\u0440\u0430") || null;
}
function extractComposition(card) {
  const comps = card.compositions || [];
  if (comps.length > 0) {
    return comps.map((c2) => c2.name).filter(Boolean).join("; ");
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
      const vals = typeAttr.values.map((v2) => String(v2.value).toLowerCase());
      if (vals.some((v2) => v2 === "\u0448\u043E\u043F\u043F\u0435\u0440" || v2 === "\u0448\u043E\u043F\u0435\u0440")) return "tote";
      if (vals.some((v2) => v2.includes("\u0440\u044E\u043A\u0437\u0430\u043A"))) return "backpack";
      if (vals.some((v2) => v2.includes("\u0441\u0435\u0434\u043B"))) return "saddle";
      if (vals.some((v2) => v2.includes("\u0431\u0430\u0433\u0435\u0442"))) return "baguette";
      if (vals.some((v2) => v2.includes("\u043D\u0430 \u043F\u043B\u0435\u0447\u043E") || v2.includes("\u0442\u043E\u0443\u0442"))) return "na-plecho";
      if (vals.some((v2) => v2.includes("\u043A\u0440\u043E\u0441\u0441-\u0431\u043E\u0434\u0438") || v2.includes("\u043A\u0440\u043E\u0441\u0441\u0431\u043E\u0434\u0438"))) return "crossbody";
      if (vals.some((v2) => v2.includes("\u043A\u043B\u0430\u0442\u0447"))) return "crossbody";
    }
    const modelAttr = attrs.attributes.find((a) => a.id === 9048);
    if (modelAttr?.values?.length) {
      const modelVals = modelAttr.values.map((v2) => String(v2.value).toLowerCase());
      if (modelVals.some((v2) => v2.includes("sedlo") || v2.includes("\u0441\u0435\u0434\u043B") || v2.includes("saddle"))) return "saddle";
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
  const wbPrice = wbPrices?.discountedPrice ?? db?.wbPrice ?? null;
  const wbOrigPrice = wbPrices?.price ?? db?.wbOriginalPrice ?? null;
  const ozonPriceVal = ozonInfo?.price != null ? Number(ozonInfo.price) : db?.ozonPrice ?? null;
  const ozonOrigPriceVal = ozonInfo?.old_price != null ? Number(ozonInfo.old_price) : db?.ozonOriginalPrice ?? null;
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
      (s, st2) => s + Math.max(0, (st2.present || 0) - (st2.reserved || 0)),
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
    const sortOpts = (a, b2) => (a.name || "").localeCompare(b2.name || "");
    const merged = [];
    if (wbChars.length > 0) {
      merged.push({
        group_name: "Wildberries",
        options: wbChars.map((c2) => ({
          name: c2.name || String(c2.id || ""),
          value: Array.isArray(c2.value) ? c2.value.join(", ") : String(c2.value || "")
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
  for (const b2 of bases) {
    const lower = b2.toLowerCase();
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
  const sorted = [...byCount.entries()].sort((a, b2) => {
    if (b2[0] !== a[0]) return b2[0] - a[0];
    return b2[1].length - a[1].length;
  });
  if (sorted.length > 0) {
    const bestLower = sorted[0][1];
    for (const b2 of bases) {
      if (b2.toLowerCase().startsWith(bestLower)) {
        return b2.slice(0, bestLower.length);
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
      const re2 = new RegExp(`[-_/]?${color}$`, "i");
      if (re2.test(r)) {
        r = r.replace(re2, "");
        changed = true;
        break;
      }
    }
    if (changed) continue;
    for (const code of COLOR_CODES) {
      let re2 = new RegExp(`[-_/]${code}$`);
      if (re2.test(r)) {
        r = r.replace(re2, "");
        changed = true;
        break;
      }
      re2 = new RegExp(`${code}$`);
      if (re2.test(r) && r.length > 4) {
        r = r.replace(re2, "");
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
async function syncModels(prisma, wbCards, resolveCategory2, log2, flags2) {
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
    log2.line("  No imtId groups found in WB cards");
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
          if (updates.name) log2.line(`  Renamed: ${model.id} \u2192 "${newName}"`);
          if (updates.category) log2.line(`  Re-categorized: ${model.id} \u2192 "${majorityCat}"`);
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
        log2.line(`  Created model: ${model.id} ("${modelName}")`);
      } else {
        created++;
        log2.line(`  Would create: ${slug} ("${modelName}")`);
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
          log2.line(`  Assigned ${p.id} \u2192 ${model.id}`);
        }
      }
    }
  }
  if (skipped > 0) {
    log2.line(`  Skipped (single variant): ${skipped} groups`);
  }
  return { created, assigned };
}
async function syncOzonModels(prisma, attrMap, log2) {
  const groups = /* @__PURE__ */ new Map();
  for (const [offerId, attrs] of attrMap) {
    if (!attrs?.attributes) continue;
    const modelAttr = attrs.attributes.find((a) => a.id === 9048);
    if (!modelAttr?.values?.length) continue;
    const vals = modelAttr.values.map((v2) => v2.value).filter(Boolean);
    if (vals.length === 0) continue;
    const key = vals.join(" ");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(offerId);
  }
  let created = 0;
  let assigned = 0;
  let skipped = 0;
  for (const [ozonModelName, offerIds] of groups) {
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
          log2.line(`  Assigned ${p.id} \u2192 ${existingModelId} (Ozon)`);
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
      for (const [cat, c2] of catCounts) {
        if (c2 > maxCount) {
          maxCount = c2;
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
        log2.line(`  Created Ozon model: ${model.id} ("${modelName}")`);
      }
      for (const p of products) {
        if (p.modelId !== model.id) {
          await prisma.product.update({ where: { id: p.id }, data: { modelId: model.id } });
          assigned++;
          log2.line(`  Assigned ${p.id} \u2192 ${model.id} (Ozon)`);
        }
      }
    }
  }
  if (skipped > 0) {
    log2.line(`  Skipped Ozon (single variant): ${skipped} groups`);
  }
  return { created, assigned };
}
async function archiveGoneProducts(prisma, dbProducts, wbArticles, ozonItems, trashArticles, wbChecked = true, ozonChecked = true, log2, flags2) {
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
        log2.line(`  Restored: ${db.id} article=${wbArt || ozonArt} ${db.name}`);
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
    log2.line(`  Archived (${reason}): ${db.id} article=${wbArt || ozonArt} ${db.name}`);
  }
  return { archived, markedOutOfStock };
}

// scripts/sync-all.mjs
var import_wb_categories2 = __toESM(require_wb_categories(), 1);
var import_name_generator2 = __toESM(require_name_generator(), 1);
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// scripts/sync-modules/analytics.mjs
var WB_ANALYTICS_API = "https://seller-analytics-api.wildberries.ru";
var FETCH_TIMEOUT = 3e4;
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
async function wbFetchAnalytics(nmIDs, apiKey, log2 = noopLog) {
  if (!nmIDs || nmIDs.length === 0 || !apiKey) return /* @__PURE__ */ new Map();
  const analyticsMap = /* @__PURE__ */ new Map();
  log2.write(`  Fetching WB analytics for ${nmIDs.length} cards:`);
  const BATCH = 50;
  const now = /* @__PURE__ */ new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
  const periodStart = thirtyDaysAgo.toISOString().split("T")[0];
  const periodEnd = now.toISOString().split("T")[0];
  for (let i = 0; i < nmIDs.length; i += BATCH) {
    const chunk = nmIDs.slice(i, i + BATCH);
    const body = {
      currentPeriod: { start: periodStart, end: periodEnd },
      nmIds: chunk,
      orderBy: { field: "openCount", mode: "desc" },
      limit: BATCH,
      offset: 0,
      isNotIncludeNMsWithoutSales: false
    };
    try {
      const resp = await fetch(`${WB_ANALYTICS_API}/api/analytics/v1/item-rating`, {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(FETCH_TIMEOUT)
      });
      if (resp.status === 429) {
        log2.write(" 429 (rate limit, waiting 30s)");
        await new Promise((r) => setTimeout(r, 3e4));
        i -= BATCH;
        continue;
      }
      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        log2.line(`
  Analytics API ${resp.status}: ${text.slice(0, 200)}`);
        continue;
      }
      const data = await resp.json();
      const cards = data?.data?.cards || [];
      for (const item of cards) {
        const nmId = item.nmId;
        if (nmId) {
          analyticsMap.set(nmId, {
            productRating: item.feedbackRating?.current ?? null,
            feedbackRating: item.feedbackRating ?? null,
            feedbackCount: item.feedbackCount?.current ?? null,
            pinnedFeedback: item.pinnedFeedback ?? false
          });
        }
      }
      log2.write(` ${analyticsMap.size}`);
    } catch (err) {
      log2.line(`
  Analytics API error: ${err.message}`);
    }
    if (i + BATCH < nmIDs.length) {
      await new Promise((r) => setTimeout(r, 25e3));
    }
  }
  log2.line(` \u2014 ${analyticsMap.size} products`);
  return analyticsMap;
}

// node_modules/daytona-wildberries-typescript-sdk/dist/esm/index.js
function ot(r, e) {
  return function() {
    return r.apply(e, arguments);
  };
}
var { toString: It } = Object.prototype;
var { getPrototypeOf: qe } = Object;
var { iterator: de, toStringTag: ct } = Symbol;
var pe = /* @__PURE__ */ ((r) => (e) => {
  const t = It.call(e);
  return r[t] || (r[t] = t.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null));
var O = (r) => (r = r.toLowerCase(), (e) => pe(e) === r);
var me = (r) => (e) => typeof e === r;
var { isArray: J } = Array;
var z = me("undefined");
function Z(r) {
  return r !== null && !z(r) && r.constructor !== null && !z(r.constructor) && K(r.constructor.isBuffer) && r.constructor.isBuffer(r);
}
var ut = O("ArrayBuffer");
function Ft(r) {
  let e;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? e = ArrayBuffer.isView(r) : e = r && r.buffer && ut(r.buffer), e;
}
var xt = me("string");
var K = me("function");
var lt = me("number");
var ee = (r) => r !== null && typeof r == "object";
var Nt = (r) => r === true || r === false;
var oe = (r) => {
  if (pe(r) !== "object")
    return false;
  const e = qe(r);
  return (e === null || e === Object.prototype || Object.getPrototypeOf(e) === null) && !(ct in r) && !(de in r);
};
var Ut = (r) => {
  if (!ee(r) || Z(r))
    return false;
  try {
    return Object.keys(r).length === 0 && Object.getPrototypeOf(r) === Object.prototype;
  } catch {
    return false;
  }
};
var _t = O("Date");
var $t = O("File");
var jt = O("Blob");
var Gt = O("FileList");
var Wt = (r) => ee(r) && K(r.pipe);
var Ht = (r) => {
  let e;
  return r && (typeof FormData == "function" && r instanceof FormData || K(r.append) && ((e = pe(r)) === "formdata" || // detect form-data instance
  e === "object" && K(r.toString) && r.toString() === "[object FormData]"));
};
var Vt = O("URLSearchParams");
var [zt, Jt, Xt, Qt] = ["ReadableStream", "Request", "Response", "Headers"].map(O);
var Yt = (r) => r.trim ? r.trim() : r.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function te(r, e, { allOwnKeys: t = false } = {}) {
  if (r === null || typeof r > "u")
    return;
  let s, i;
  if (typeof r != "object" && (r = [r]), J(r))
    for (s = 0, i = r.length; s < i; s++)
      e.call(null, r[s], s, r);
  else {
    if (Z(r))
      return;
    const a = t ? Object.getOwnPropertyNames(r) : Object.keys(r), n = a.length;
    let o;
    for (s = 0; s < n; s++)
      o = a[s], e.call(null, r[o], o, r);
  }
}
function dt(r, e) {
  if (Z(r))
    return null;
  e = e.toLowerCase();
  const t = Object.keys(r);
  let s = t.length, i;
  for (; s-- > 0; )
    if (i = t[s], e === i.toLowerCase())
      return i;
  return null;
}
var $ = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global;
var pt = (r) => !z(r) && r !== $;
function we() {
  const { caseless: r, skipUndefined: e } = pt(this) && this || {}, t = {}, s = (i, a) => {
    const n = r && dt(t, a) || a;
    oe(t[n]) && oe(i) ? t[n] = we(t[n], i) : oe(i) ? t[n] = we({}, i) : J(i) ? t[n] = i.slice() : (!e || !z(i)) && (t[n] = i);
  };
  for (let i = 0, a = arguments.length; i < a; i++)
    arguments[i] && te(arguments[i], s);
  return t;
}
var Zt = (r, e, t, { allOwnKeys: s } = {}) => (te(e, (i, a) => {
  t && K(i) ? r[a] = ot(i, t) : r[a] = i;
}, { allOwnKeys: s }), r);
var er = (r) => (r.charCodeAt(0) === 65279 && (r = r.slice(1)), r);
var tr = (r, e, t, s) => {
  r.prototype = Object.create(e.prototype, s), r.prototype.constructor = r, Object.defineProperty(r, "super", {
    value: e.prototype
  }), t && Object.assign(r.prototype, t);
};
var rr = (r, e, t, s) => {
  let i, a, n;
  const o = {};
  if (e = e || {}, r == null) return e;
  do {
    for (i = Object.getOwnPropertyNames(r), a = i.length; a-- > 0; )
      n = i[a], (!s || s(n, r, e)) && !o[n] && (e[n] = r[n], o[n] = true);
    r = t !== false && qe(r);
  } while (r && (!t || t(r, e)) && r !== Object.prototype);
  return e;
};
var sr = (r, e, t) => {
  r = String(r), (t === void 0 || t > r.length) && (t = r.length), t -= e.length;
  const s = r.indexOf(e, t);
  return s !== -1 && s === t;
};
var ir = (r) => {
  if (!r) return null;
  if (J(r)) return r;
  let e = r.length;
  if (!lt(e)) return null;
  const t = new Array(e);
  for (; e-- > 0; )
    t[e] = r[e];
  return t;
};
var ar = /* @__PURE__ */ ((r) => (e) => r && e instanceof r)(typeof Uint8Array < "u" && qe(Uint8Array));
var nr = (r, e) => {
  const s = (r && r[de]).call(r);
  let i;
  for (; (i = s.next()) && !i.done; ) {
    const a = i.value;
    e.call(r, a[0], a[1]);
  }
};
var or = (r, e) => {
  let t;
  const s = [];
  for (; (t = r.exec(e)) !== null; )
    s.push(t);
  return s;
};
var cr = O("HTMLFormElement");
var ur = (r) => r.toLowerCase().replace(
  /[-_\s]([a-z\d])(\w*)/g,
  function(t, s, i) {
    return s.toUpperCase() + i;
  }
);
var Ue = (({ hasOwnProperty: r }) => (e, t) => r.call(e, t))(Object.prototype);
var lr = O("RegExp");
var mt = (r, e) => {
  const t = Object.getOwnPropertyDescriptors(r), s = {};
  te(t, (i, a) => {
    let n;
    (n = e(i, a, r)) !== false && (s[a] = n || i);
  }), Object.defineProperties(r, s);
};
var dr = (r) => {
  mt(r, (e, t) => {
    if (K(r) && ["arguments", "caller", "callee"].indexOf(t) !== -1)
      return false;
    const s = r[t];
    if (K(s)) {
      if (e.enumerable = false, "writable" in e) {
        e.writable = false;
        return;
      }
      e.set || (e.set = () => {
        throw Error("Can not rewrite read-only method '" + t + "'");
      });
    }
  });
};
var pr = (r, e) => {
  const t = {}, s = (i) => {
    i.forEach((a) => {
      t[a] = true;
    });
  };
  return J(r) ? s(r) : s(String(r).split(e)), t;
};
var mr = () => {
};
var yr = (r, e) => r != null && Number.isFinite(r = +r) ? r : e;
function fr(r) {
  return !!(r && K(r.append) && r[ct] === "FormData" && r[de]);
}
var hr = (r) => {
  const e = new Array(10), t = (s, i) => {
    if (ee(s)) {
      if (e.indexOf(s) >= 0)
        return;
      if (Z(s))
        return s;
      if (!("toJSON" in s)) {
        e[i] = s;
        const a = J(s) ? [] : {};
        return te(s, (n, o) => {
          const u = t(n, i + 1);
          !z(u) && (a[o] = u);
        }), e[i] = void 0, a;
      }
    }
    return s;
  };
  return t(r, 0);
};
var gr = O("AsyncFunction");
var br = (r) => r && (ee(r) || K(r)) && K(r.then) && K(r.catch);
var yt = ((r, e) => r ? setImmediate : e ? ((t, s) => ($.addEventListener("message", ({ source: i, data: a }) => {
  i === $ && a === t && s.length && s.shift()();
}, false), (i) => {
  s.push(i), $.postMessage(t, "*");
}))(`axios@${Math.random()}`, []) : (t) => setTimeout(t))(
  typeof setImmediate == "function",
  K($.postMessage)
);
var vr = typeof queueMicrotask < "u" ? queueMicrotask.bind($) : typeof process < "u" && process.nextTick || yt;
var Sr = (r) => r != null && K(r[de]);
var c = {
  isArray: J,
  isArrayBuffer: ut,
  isBuffer: Z,
  isFormData: Ht,
  isArrayBufferView: Ft,
  isString: xt,
  isNumber: lt,
  isBoolean: Nt,
  isObject: ee,
  isPlainObject: oe,
  isEmptyObject: Ut,
  isReadableStream: zt,
  isRequest: Jt,
  isResponse: Xt,
  isHeaders: Qt,
  isUndefined: z,
  isDate: _t,
  isFile: $t,
  isBlob: jt,
  isRegExp: lr,
  isFunction: K,
  isStream: Wt,
  isURLSearchParams: Vt,
  isTypedArray: ar,
  isFileList: Gt,
  forEach: te,
  merge: we,
  extend: Zt,
  trim: Yt,
  stripBOM: er,
  inherits: tr,
  toFlatObject: rr,
  kindOf: pe,
  kindOfTest: O,
  endsWith: sr,
  toArray: ir,
  forEachEntry: nr,
  matchAll: or,
  isHTMLForm: cr,
  hasOwnProperty: Ue,
  hasOwnProp: Ue,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors: mt,
  freezeMethods: dr,
  toObjectSet: pr,
  toCamelCase: ur,
  noop: mr,
  toFiniteNumber: yr,
  findKey: dt,
  global: $,
  isContextDefined: pt,
  isSpecCompliantForm: fr,
  toJSONObject: hr,
  isAsyncFn: gr,
  isThenable: br,
  setImmediate: yt,
  asap: vr,
  isIterable: Sr
};
function v(r, e, t, s, i) {
  Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = r, this.name = "AxiosError", e && (this.code = e), t && (this.config = t), s && (this.request = s), i && (this.response = i, this.status = i.status ? i.status : null);
}
c.inherits(v, Error, {
  toJSON: function() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: c.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
});
var ft = v.prototype;
var ht = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
  // eslint-disable-next-line func-names
].forEach((r) => {
  ht[r] = { value: r };
});
Object.defineProperties(v, ht);
Object.defineProperty(ft, "isAxiosError", { value: true });
v.from = (r, e, t, s, i, a) => {
  const n = Object.create(ft);
  c.toFlatObject(r, n, function(p) {
    return p !== Error.prototype;
  }, (l) => l !== "isAxiosError");
  const o = r && r.message ? r.message : "Error", u = e == null && r ? r.code : e;
  return v.call(n, o, u, t, s, i), r && n.cause == null && Object.defineProperty(n, "cause", { value: r, configurable: true }), n.name = r && r.name || "Error", a && Object.assign(n, a), n;
};
var Lr = null;
function ke(r) {
  return c.isPlainObject(r) || c.isArray(r);
}
function gt(r) {
  return c.endsWith(r, "[]") ? r.slice(0, -2) : r;
}
function _e(r, e, t) {
  return r ? r.concat(e).map(function(i, a) {
    return i = gt(i), !t && a ? "[" + i + "]" : i;
  }).join(t ? "." : "") : e;
}
function wr(r) {
  return c.isArray(r) && !r.some(ke);
}
var kr = c.toFlatObject(c, {}, null, function(e) {
  return /^is[A-Z]/.test(e);
});
function ye(r, e, t) {
  if (!c.isObject(r))
    throw new TypeError("target must be an object");
  e = e || new FormData(), t = c.toFlatObject(t, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function(h, y) {
    return !c.isUndefined(y[h]);
  });
  const s = t.metaTokens, i = t.visitor || p, a = t.dots, n = t.indexes, u = (t.Blob || typeof Blob < "u" && Blob) && c.isSpecCompliantForm(e);
  if (!c.isFunction(i))
    throw new TypeError("visitor must be a function");
  function l(d) {
    if (d === null) return "";
    if (c.isDate(d))
      return d.toISOString();
    if (c.isBoolean(d))
      return d.toString();
    if (!u && c.isBlob(d))
      throw new v("Blob is not supported. Use a Buffer instead.");
    return c.isArrayBuffer(d) || c.isTypedArray(d) ? u && typeof Blob == "function" ? new Blob([d]) : Buffer.from(d) : d;
  }
  function p(d, h, y) {
    let S = d;
    if (d && !y && typeof d == "object") {
      if (c.endsWith(h, "{}"))
        h = s ? h : h.slice(0, -2), d = JSON.stringify(d);
      else if (c.isArray(d) && wr(d) || (c.isFileList(d) || c.endsWith(h, "[]")) && (S = c.toArray(d)))
        return h = gt(h), S.forEach(function(w, C) {
          !(c.isUndefined(w) || w === null) && e.append(
            // eslint-disable-next-line no-nested-ternary
            n === true ? _e([h], C, a) : n === null ? h : h + "[]",
            l(w)
          );
        }), false;
    }
    return ke(d) ? true : (e.append(_e(y, h, a), l(d)), false);
  }
  const f = [], m = Object.assign(kr, {
    defaultVisitor: p,
    convertValue: l,
    isVisitable: ke
  });
  function g(d, h) {
    if (!c.isUndefined(d)) {
      if (f.indexOf(d) !== -1)
        throw Error("Circular reference detected in " + h.join("."));
      f.push(d), c.forEach(d, function(S, L) {
        (!(c.isUndefined(S) || S === null) && i.call(
          e,
          S,
          c.isString(L) ? L.trim() : L,
          h,
          m
        )) === true && g(S, h ? h.concat(L) : [L]);
      }), f.pop();
    }
  }
  if (!c.isObject(r))
    throw new TypeError("data must be an object");
  return g(r), e;
}
function $e(r) {
  const e = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(r).replace(/[!'()~]|%20|%00/g, function(s) {
    return e[s];
  });
}
function Re(r, e) {
  this._pairs = [], r && ye(r, this, e);
}
var bt = Re.prototype;
bt.append = function(e, t) {
  this._pairs.push([e, t]);
};
bt.toString = function(e) {
  const t = e ? function(s) {
    return e.call(this, s, $e);
  } : $e;
  return this._pairs.map(function(i) {
    return t(i[0]) + "=" + t(i[1]);
  }, "").join("&");
};
function Mr(r) {
  return encodeURIComponent(r).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function vt(r, e, t) {
  if (!e)
    return r;
  const s = t && t.encode || Mr;
  c.isFunction(t) && (t = {
    serialize: t
  });
  const i = t && t.serialize;
  let a;
  if (i ? a = i(e, t) : a = c.isURLSearchParams(e) ? e.toString() : new Re(e, t).toString(s), a) {
    const n = r.indexOf("#");
    n !== -1 && (r = r.slice(0, n)), r += (r.indexOf("?") === -1 ? "?" : "&") + a;
  }
  return r;
}
var je = class {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(e, t, s) {
    return this.handlers.push({
      fulfilled: e,
      rejected: t,
      synchronous: s ? s.synchronous : false,
      runWhen: s ? s.runWhen : null
    }), this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
   */
  eject(e) {
    this.handlers[e] && (this.handlers[e] = null);
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    this.handlers && (this.handlers = []);
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(e) {
    c.forEach(this.handlers, function(s) {
      s !== null && e(s);
    });
  }
};
var St = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};
var Pr = typeof URLSearchParams < "u" ? URLSearchParams : Re;
var Cr = typeof FormData < "u" ? FormData : null;
var Kr = typeof Blob < "u" ? Blob : null;
var Ar = {
  isBrowser: true,
  classes: {
    URLSearchParams: Pr,
    FormData: Cr,
    Blob: Kr
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
};
var Be = typeof window < "u" && typeof document < "u";
var Me = typeof navigator == "object" && navigator || void 0;
var qr = Be && (!Me || ["ReactNative", "NativeScript", "NS"].indexOf(Me.product) < 0);
var Rr = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function";
var Br = Be && window.location.href || "http://localhost";
var Tr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: Be,
  hasStandardBrowserEnv: qr,
  hasStandardBrowserWebWorkerEnv: Rr,
  navigator: Me,
  origin: Br
}, Symbol.toStringTag, { value: "Module" }));
var P = {
  ...Tr,
  ...Ar
};
function Or(r, e) {
  return ye(r, new P.classes.URLSearchParams(), {
    visitor: function(t, s, i, a) {
      return P.isNode && c.isBuffer(t) ? (this.append(s, t.toString("base64")), false) : a.defaultVisitor.apply(this, arguments);
    },
    ...e
  });
}
function Er(r) {
  return c.matchAll(/\w+|\[(\w*)]/g, r).map((e) => e[0] === "[]" ? "" : e[1] || e[0]);
}
function Dr(r) {
  const e = {}, t = Object.keys(r);
  let s;
  const i = t.length;
  let a;
  for (s = 0; s < i; s++)
    a = t[s], e[a] = r[a];
  return e;
}
function Lt(r) {
  function e(t, s, i, a) {
    let n = t[a++];
    if (n === "__proto__") return true;
    const o = Number.isFinite(+n), u = a >= t.length;
    return n = !n && c.isArray(i) ? i.length : n, u ? (c.hasOwnProp(i, n) ? i[n] = [i[n], s] : i[n] = s, !o) : ((!i[n] || !c.isObject(i[n])) && (i[n] = []), e(t, s, i[n], a) && c.isArray(i[n]) && (i[n] = Dr(i[n])), !o);
  }
  if (c.isFormData(r) && c.isFunction(r.entries)) {
    const t = {};
    return c.forEachEntry(r, (s, i) => {
      e(Er(s), i, t, 0);
    }), t;
  }
  return null;
}
function Ir(r, e, t) {
  if (c.isString(r))
    try {
      return (e || JSON.parse)(r), c.trim(r);
    } catch (s) {
      if (s.name !== "SyntaxError")
        throw s;
    }
  return (t || JSON.stringify)(r);
}
var re = {
  transitional: St,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function(e, t) {
    const s = t.getContentType() || "", i = s.indexOf("application/json") > -1, a = c.isObject(e);
    if (a && c.isHTMLForm(e) && (e = new FormData(e)), c.isFormData(e))
      return i ? JSON.stringify(Lt(e)) : e;
    if (c.isArrayBuffer(e) || c.isBuffer(e) || c.isStream(e) || c.isFile(e) || c.isBlob(e) || c.isReadableStream(e))
      return e;
    if (c.isArrayBufferView(e))
      return e.buffer;
    if (c.isURLSearchParams(e))
      return t.setContentType("application/x-www-form-urlencoded;charset=utf-8", false), e.toString();
    let o;
    if (a) {
      if (s.indexOf("application/x-www-form-urlencoded") > -1)
        return Or(e, this.formSerializer).toString();
      if ((o = c.isFileList(e)) || s.indexOf("multipart/form-data") > -1) {
        const u = this.env && this.env.FormData;
        return ye(
          o ? { "files[]": e } : e,
          u && new u(),
          this.formSerializer
        );
      }
    }
    return a || i ? (t.setContentType("application/json", false), Ir(e)) : e;
  }],
  transformResponse: [function(e) {
    const t = this.transitional || re.transitional, s = t && t.forcedJSONParsing, i = this.responseType === "json";
    if (c.isResponse(e) || c.isReadableStream(e))
      return e;
    if (e && c.isString(e) && (s && !this.responseType || i)) {
      const n = !(t && t.silentJSONParsing) && i;
      try {
        return JSON.parse(e, this.parseReviver);
      } catch (o) {
        if (n)
          throw o.name === "SyntaxError" ? v.from(o, v.ERR_BAD_RESPONSE, this, null, this.response) : o;
      }
    }
    return e;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: P.classes.FormData,
    Blob: P.classes.Blob
  },
  validateStatus: function(e) {
    return e >= 200 && e < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
c.forEach(["delete", "get", "head", "post", "put", "patch"], (r) => {
  re.headers[r] = {};
});
var Fr = c.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]);
var xr = (r) => {
  const e = {};
  let t, s, i;
  return r && r.split(`
`).forEach(function(n) {
    i = n.indexOf(":"), t = n.substring(0, i).trim().toLowerCase(), s = n.substring(i + 1).trim(), !(!t || e[t] && Fr[t]) && (t === "set-cookie" ? e[t] ? e[t].push(s) : e[t] = [s] : e[t] = e[t] ? e[t] + ", " + s : s);
  }), e;
};
var Ge = /* @__PURE__ */ Symbol("internals");
function Y(r) {
  return r && String(r).trim().toLowerCase();
}
function ce(r) {
  return r === false || r == null ? r : c.isArray(r) ? r.map(ce) : String(r);
}
function Nr(r) {
  const e = /* @__PURE__ */ Object.create(null), t = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let s;
  for (; s = t.exec(r); )
    e[s[1]] = s[2];
  return e;
}
var Ur = (r) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(r.trim());
function ve(r, e, t, s, i) {
  if (c.isFunction(s))
    return s.call(this, e, t);
  if (i && (e = t), !!c.isString(e)) {
    if (c.isString(s))
      return e.indexOf(s) !== -1;
    if (c.isRegExp(s))
      return s.test(e);
  }
}
function _r(r) {
  return r.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (e, t, s) => t.toUpperCase() + s);
}
function $r(r, e) {
  const t = c.toCamelCase(" " + e);
  ["get", "set", "has"].forEach((s) => {
    Object.defineProperty(r, s + t, {
      value: function(i, a, n) {
        return this[s].call(this, e, i, a, n);
      },
      configurable: true
    });
  });
}
var A = class {
  constructor(e) {
    e && this.set(e);
  }
  set(e, t, s) {
    const i = this;
    function a(o, u, l) {
      const p = Y(u);
      if (!p)
        throw new Error("header name must be a non-empty string");
      const f = c.findKey(i, p);
      (!f || i[f] === void 0 || l === true || l === void 0 && i[f] !== false) && (i[f || u] = ce(o));
    }
    const n = (o, u) => c.forEach(o, (l, p) => a(l, p, u));
    if (c.isPlainObject(e) || e instanceof this.constructor)
      n(e, t);
    else if (c.isString(e) && (e = e.trim()) && !Ur(e))
      n(xr(e), t);
    else if (c.isObject(e) && c.isIterable(e)) {
      let o = {}, u, l;
      for (const p of e) {
        if (!c.isArray(p))
          throw TypeError("Object iterator must return a key-value pair");
        o[l = p[0]] = (u = o[l]) ? c.isArray(u) ? [...u, p[1]] : [u, p[1]] : p[1];
      }
      n(o, t);
    } else
      e != null && a(t, e, s);
    return this;
  }
  get(e, t) {
    if (e = Y(e), e) {
      const s = c.findKey(this, e);
      if (s) {
        const i = this[s];
        if (!t)
          return i;
        if (t === true)
          return Nr(i);
        if (c.isFunction(t))
          return t.call(this, i, s);
        if (c.isRegExp(t))
          return t.exec(i);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(e, t) {
    if (e = Y(e), e) {
      const s = c.findKey(this, e);
      return !!(s && this[s] !== void 0 && (!t || ve(this, this[s], s, t)));
    }
    return false;
  }
  delete(e, t) {
    const s = this;
    let i = false;
    function a(n) {
      if (n = Y(n), n) {
        const o = c.findKey(s, n);
        o && (!t || ve(s, s[o], o, t)) && (delete s[o], i = true);
      }
    }
    return c.isArray(e) ? e.forEach(a) : a(e), i;
  }
  clear(e) {
    const t = Object.keys(this);
    let s = t.length, i = false;
    for (; s--; ) {
      const a = t[s];
      (!e || ve(this, this[a], a, e, true)) && (delete this[a], i = true);
    }
    return i;
  }
  normalize(e) {
    const t = this, s = {};
    return c.forEach(this, (i, a) => {
      const n = c.findKey(s, a);
      if (n) {
        t[n] = ce(i), delete t[a];
        return;
      }
      const o = e ? _r(a) : String(a).trim();
      o !== a && delete t[a], t[o] = ce(i), s[o] = true;
    }), this;
  }
  concat(...e) {
    return this.constructor.concat(this, ...e);
  }
  toJSON(e) {
    const t = /* @__PURE__ */ Object.create(null);
    return c.forEach(this, (s, i) => {
      s != null && s !== false && (t[i] = e && c.isArray(s) ? s.join(", ") : s);
    }), t;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([e, t]) => e + ": " + t).join(`
`);
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(e) {
    return e instanceof this ? e : new this(e);
  }
  static concat(e, ...t) {
    const s = new this(e);
    return t.forEach((i) => s.set(i)), s;
  }
  static accessor(e) {
    const s = (this[Ge] = this[Ge] = {
      accessors: {}
    }).accessors, i = this.prototype;
    function a(n) {
      const o = Y(n);
      s[o] || ($r(i, n), s[o] = true);
    }
    return c.isArray(e) ? e.forEach(a) : a(e), this;
  }
};
A.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
c.reduceDescriptors(A.prototype, ({ value: r }, e) => {
  let t = e[0].toUpperCase() + e.slice(1);
  return {
    get: () => r,
    set(s) {
      this[t] = s;
    }
  };
});
c.freezeMethods(A);
function Se(r, e) {
  const t = this || re, s = e || t, i = A.from(s.headers);
  let a = s.data;
  return c.forEach(r, function(o) {
    a = o.call(t, a, i.normalize(), e ? e.status : void 0);
  }), i.normalize(), a;
}
function wt(r) {
  return !!(r && r.__CANCEL__);
}
function X(r, e, t) {
  v.call(this, r ?? "canceled", v.ERR_CANCELED, e, t), this.name = "CanceledError";
}
c.inherits(X, v, {
  __CANCEL__: true
});
function kt(r, e, t) {
  const s = t.config.validateStatus;
  !t.status || !s || s(t.status) ? r(t) : e(new v(
    "Request failed with status code " + t.status,
    [v.ERR_BAD_REQUEST, v.ERR_BAD_RESPONSE][Math.floor(t.status / 100) - 4],
    t.config,
    t.request,
    t
  ));
}
function jr(r) {
  const e = /^([-+\w]{1,25})(:?\/\/|:)/.exec(r);
  return e && e[1] || "";
}
function Gr(r, e) {
  r = r || 10;
  const t = new Array(r), s = new Array(r);
  let i = 0, a = 0, n;
  return e = e !== void 0 ? e : 1e3, function(u) {
    const l = Date.now(), p = s[a];
    n || (n = l), t[i] = u, s[i] = l;
    let f = a, m = 0;
    for (; f !== i; )
      m += t[f++], f = f % r;
    if (i = (i + 1) % r, i === a && (a = (a + 1) % r), l - n < e)
      return;
    const g = p && l - p;
    return g ? Math.round(m * 1e3 / g) : void 0;
  };
}
function Wr(r, e) {
  let t = 0, s = 1e3 / e, i, a;
  const n = (l, p = Date.now()) => {
    t = p, i = null, a && (clearTimeout(a), a = null), r(...l);
  };
  return [(...l) => {
    const p = Date.now(), f = p - t;
    f >= s ? n(l, p) : (i = l, a || (a = setTimeout(() => {
      a = null, n(i);
    }, s - f)));
  }, () => i && n(i)];
}
var le = (r, e, t = 3) => {
  let s = 0;
  const i = Gr(50, 250);
  return Wr((a) => {
    const n = a.loaded, o = a.lengthComputable ? a.total : void 0, u = n - s, l = i(u), p = n <= o;
    s = n;
    const f = {
      loaded: n,
      total: o,
      progress: o ? n / o : void 0,
      bytes: u,
      rate: l || void 0,
      estimated: l && o && p ? (o - n) / l : void 0,
      event: a,
      lengthComputable: o != null,
      [e ? "download" : "upload"]: true
    };
    r(f);
  }, t);
};
var We = (r, e) => {
  const t = r != null;
  return [(s) => e[0]({
    lengthComputable: t,
    total: r,
    loaded: s
  }), e[1]];
};
var He = (r) => (...e) => c.asap(() => r(...e));
var Hr = P.hasStandardBrowserEnv ? /* @__PURE__ */ ((r, e) => (t) => (t = new URL(t, P.origin), r.protocol === t.protocol && r.host === t.host && (e || r.port === t.port)))(
  new URL(P.origin),
  P.navigator && /(msie|trident)/i.test(P.navigator.userAgent)
) : () => true;
var Vr = P.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(r, e, t, s, i, a) {
      const n = [r + "=" + encodeURIComponent(e)];
      c.isNumber(t) && n.push("expires=" + new Date(t).toGMTString()), c.isString(s) && n.push("path=" + s), c.isString(i) && n.push("domain=" + i), a === true && n.push("secure"), document.cookie = n.join("; ");
    },
    read(r) {
      const e = document.cookie.match(new RegExp("(^|;\\s*)(" + r + ")=([^;]*)"));
      return e ? decodeURIComponent(e[3]) : null;
    },
    remove(r) {
      this.write(r, "", Date.now() - 864e5);
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);
function zr(r) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(r);
}
function Jr(r, e) {
  return e ? r.replace(/\/?\/$/, "") + "/" + e.replace(/^\/+/, "") : r;
}
function Mt(r, e, t) {
  let s = !zr(e);
  return r && (s || t == false) ? Jr(r, e) : e;
}
var Ve = (r) => r instanceof A ? { ...r } : r;
function G(r, e) {
  e = e || {};
  const t = {};
  function s(l, p, f, m) {
    return c.isPlainObject(l) && c.isPlainObject(p) ? c.merge.call({ caseless: m }, l, p) : c.isPlainObject(p) ? c.merge({}, p) : c.isArray(p) ? p.slice() : p;
  }
  function i(l, p, f, m) {
    if (c.isUndefined(p)) {
      if (!c.isUndefined(l))
        return s(void 0, l, f, m);
    } else return s(l, p, f, m);
  }
  function a(l, p) {
    if (!c.isUndefined(p))
      return s(void 0, p);
  }
  function n(l, p) {
    if (c.isUndefined(p)) {
      if (!c.isUndefined(l))
        return s(void 0, l);
    } else return s(void 0, p);
  }
  function o(l, p, f) {
    if (f in e)
      return s(l, p);
    if (f in r)
      return s(void 0, l);
  }
  const u = {
    url: a,
    method: a,
    data: a,
    baseURL: n,
    transformRequest: n,
    transformResponse: n,
    paramsSerializer: n,
    timeout: n,
    timeoutMessage: n,
    withCredentials: n,
    withXSRFToken: n,
    adapter: n,
    responseType: n,
    xsrfCookieName: n,
    xsrfHeaderName: n,
    onUploadProgress: n,
    onDownloadProgress: n,
    decompress: n,
    maxContentLength: n,
    maxBodyLength: n,
    beforeRedirect: n,
    transport: n,
    httpAgent: n,
    httpsAgent: n,
    cancelToken: n,
    socketPath: n,
    responseEncoding: n,
    validateStatus: o,
    headers: (l, p, f) => i(Ve(l), Ve(p), f, true)
  };
  return c.forEach(Object.keys({ ...r, ...e }), function(p) {
    const f = u[p] || i, m = f(r[p], e[p], p);
    c.isUndefined(m) && f !== o || (t[p] = m);
  }), t;
}
var Pt = (r) => {
  const e = G({}, r);
  let { data: t, withXSRFToken: s, xsrfHeaderName: i, xsrfCookieName: a, headers: n, auth: o } = e;
  if (e.headers = n = A.from(n), e.url = vt(Mt(e.baseURL, e.url, e.allowAbsoluteUrls), r.params, r.paramsSerializer), o && n.set(
    "Authorization",
    "Basic " + btoa((o.username || "") + ":" + (o.password ? unescape(encodeURIComponent(o.password)) : ""))
  ), c.isFormData(t)) {
    if (P.hasStandardBrowserEnv || P.hasStandardBrowserWebWorkerEnv)
      n.setContentType(void 0);
    else if (c.isFunction(t.getHeaders)) {
      const u = t.getHeaders(), l = ["content-type", "content-length"];
      Object.entries(u).forEach(([p, f]) => {
        l.includes(p.toLowerCase()) && n.set(p, f);
      });
    }
  }
  if (P.hasStandardBrowserEnv && (s && c.isFunction(s) && (s = s(e)), s || s !== false && Hr(e.url))) {
    const u = i && a && Vr.read(a);
    u && n.set(i, u);
  }
  return e;
};
var Xr = typeof XMLHttpRequest < "u";
var Qr = Xr && function(r) {
  return new Promise(function(t, s) {
    const i = Pt(r);
    let a = i.data;
    const n = A.from(i.headers).normalize();
    let { responseType: o, onUploadProgress: u, onDownloadProgress: l } = i, p, f, m, g, d;
    function h() {
      g && g(), d && d(), i.cancelToken && i.cancelToken.unsubscribe(p), i.signal && i.signal.removeEventListener("abort", p);
    }
    let y = new XMLHttpRequest();
    y.open(i.method.toUpperCase(), i.url, true), y.timeout = i.timeout;
    function S() {
      if (!y)
        return;
      const w = A.from(
        "getAllResponseHeaders" in y && y.getAllResponseHeaders()
      ), T = {
        data: !o || o === "text" || o === "json" ? y.responseText : y.response,
        status: y.status,
        statusText: y.statusText,
        headers: w,
        config: r,
        request: y
      };
      kt(function(B) {
        t(B), h();
      }, function(B) {
        s(B), h();
      }, T), y = null;
    }
    "onloadend" in y ? y.onloadend = S : y.onreadystatechange = function() {
      !y || y.readyState !== 4 || y.status === 0 && !(y.responseURL && y.responseURL.indexOf("file:") === 0) || setTimeout(S);
    }, y.onabort = function() {
      y && (s(new v("Request aborted", v.ECONNABORTED, r, y)), y = null);
    }, y.onerror = function(C) {
      const T = C && C.message ? C.message : "Network Error", U = new v(T, v.ERR_NETWORK, r, y);
      U.event = C || null, s(U), y = null;
    }, y.ontimeout = function() {
      let C = i.timeout ? "timeout of " + i.timeout + "ms exceeded" : "timeout exceeded";
      const T = i.transitional || St;
      i.timeoutErrorMessage && (C = i.timeoutErrorMessage), s(new v(
        C,
        T.clarifyTimeoutError ? v.ETIMEDOUT : v.ECONNABORTED,
        r,
        y
      )), y = null;
    }, a === void 0 && n.setContentType(null), "setRequestHeader" in y && c.forEach(n.toJSON(), function(C, T) {
      y.setRequestHeader(T, C);
    }), c.isUndefined(i.withCredentials) || (y.withCredentials = !!i.withCredentials), o && o !== "json" && (y.responseType = i.responseType), l && ([m, d] = le(l, true), y.addEventListener("progress", m)), u && y.upload && ([f, g] = le(u), y.upload.addEventListener("progress", f), y.upload.addEventListener("loadend", g)), (i.cancelToken || i.signal) && (p = (w) => {
      y && (s(!w || w.type ? new X(null, r, y) : w), y.abort(), y = null);
    }, i.cancelToken && i.cancelToken.subscribe(p), i.signal && (i.signal.aborted ? p() : i.signal.addEventListener("abort", p)));
    const L = jr(i.url);
    if (L && P.protocols.indexOf(L) === -1) {
      s(new v("Unsupported protocol " + L + ":", v.ERR_BAD_REQUEST, r));
      return;
    }
    y.send(a || null);
  });
};
var Yr = (r, e) => {
  const { length: t } = r = r ? r.filter(Boolean) : [];
  if (e || t) {
    let s = new AbortController(), i;
    const a = function(l) {
      if (!i) {
        i = true, o();
        const p = l instanceof Error ? l : this.reason;
        s.abort(p instanceof v ? p : new X(p instanceof Error ? p.message : p));
      }
    };
    let n = e && setTimeout(() => {
      n = null, a(new v(`timeout ${e} of ms exceeded`, v.ETIMEDOUT));
    }, e);
    const o = () => {
      r && (n && clearTimeout(n), n = null, r.forEach((l) => {
        l.unsubscribe ? l.unsubscribe(a) : l.removeEventListener("abort", a);
      }), r = null);
    };
    r.forEach((l) => l.addEventListener("abort", a));
    const { signal: u } = s;
    return u.unsubscribe = () => c.asap(o), u;
  }
};
var Zr = function* (r, e) {
  let t = r.byteLength;
  if (t < e) {
    yield r;
    return;
  }
  let s = 0, i;
  for (; s < t; )
    i = s + e, yield r.slice(s, i), s = i;
};
var es = async function* (r, e) {
  for await (const t of ts(r))
    yield* Zr(t, e);
};
var ts = async function* (r) {
  if (r[Symbol.asyncIterator]) {
    yield* r;
    return;
  }
  const e = r.getReader();
  try {
    for (; ; ) {
      const { done: t, value: s } = await e.read();
      if (t)
        break;
      yield s;
    }
  } finally {
    await e.cancel();
  }
};
var ze = (r, e, t, s) => {
  const i = es(r, e);
  let a = 0, n, o = (u) => {
    n || (n = true, s && s(u));
  };
  return new ReadableStream({
    async pull(u) {
      try {
        const { done: l, value: p } = await i.next();
        if (l) {
          o(), u.close();
          return;
        }
        let f = p.byteLength;
        if (t) {
          let m = a += f;
          t(m);
        }
        u.enqueue(new Uint8Array(p));
      } catch (l) {
        throw o(l), l;
      }
    },
    cancel(u) {
      return o(u), i.return();
    }
  }, {
    highWaterMark: 2
  });
};
var Je = 64 * 1024;
var { isFunction: ne } = c;
var rs = (({ Request: r, Response: e }) => ({
  Request: r,
  Response: e
}))(c.global);
var {
  ReadableStream: Xe,
  TextEncoder: Qe
} = c.global;
var Ye = (r, ...e) => {
  try {
    return !!r(...e);
  } catch {
    return false;
  }
};
var ss = (r) => {
  r = c.merge.call({
    skipUndefined: true
  }, rs, r);
  const { fetch: e, Request: t, Response: s } = r, i = e ? ne(e) : typeof fetch == "function", a = ne(t), n = ne(s);
  if (!i)
    return false;
  const o = i && ne(Xe), u = i && (typeof Qe == "function" ? /* @__PURE__ */ ((d) => (h) => d.encode(h))(new Qe()) : async (d) => new Uint8Array(await new t(d).arrayBuffer())), l = a && o && Ye(() => {
    let d = false;
    const h = new t(P.origin, {
      body: new Xe(),
      method: "POST",
      get duplex() {
        return d = true, "half";
      }
    }).headers.has("Content-Type");
    return d && !h;
  }), p = n && o && Ye(() => c.isReadableStream(new s("").body)), f = {
    stream: p && ((d) => d.body)
  };
  i && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((d) => {
    !f[d] && (f[d] = (h, y) => {
      let S = h && h[d];
      if (S)
        return S.call(h);
      throw new v(`Response type '${d}' is not supported`, v.ERR_NOT_SUPPORT, y);
    });
  });
  const m = async (d) => {
    if (d == null)
      return 0;
    if (c.isBlob(d))
      return d.size;
    if (c.isSpecCompliantForm(d))
      return (await new t(P.origin, {
        method: "POST",
        body: d
      }).arrayBuffer()).byteLength;
    if (c.isArrayBufferView(d) || c.isArrayBuffer(d))
      return d.byteLength;
    if (c.isURLSearchParams(d) && (d = d + ""), c.isString(d))
      return (await u(d)).byteLength;
  }, g = async (d, h) => {
    const y = c.toFiniteNumber(d.getContentLength());
    return y ?? m(h);
  };
  return async (d) => {
    let {
      url: h,
      method: y,
      data: S,
      signal: L,
      cancelToken: w,
      timeout: C,
      onDownloadProgress: T,
      onUploadProgress: U,
      responseType: B,
      headers: ge,
      withCredentials: se = "same-origin",
      fetchOptions: Ee
    } = Pt(d), De = e || fetch;
    B = B ? (B + "").toLowerCase() : "text";
    let ie = Yr([L, w && w.toAbortSignal()], C), Q = null;
    const _ = ie && ie.unsubscribe && (() => {
      ie.unsubscribe();
    });
    let Ie;
    try {
      if (U && l && y !== "get" && y !== "head" && (Ie = await g(ge, S)) !== 0) {
        let F = new t(h, {
          method: "POST",
          body: S,
          duplex: "half"
        }), H;
        if (c.isFormData(S) && (H = F.headers.get("content-type")) && ge.setContentType(H), F.body) {
          const [be, ae] = We(
            Ie,
            le(He(U))
          );
          S = ze(F.body, Je, be, ae);
        }
      }
      c.isString(se) || (se = se ? "include" : "omit");
      const E = a && "credentials" in t.prototype, Fe = {
        ...Ee,
        signal: ie,
        method: y.toUpperCase(),
        headers: ge.normalize().toJSON(),
        body: S,
        duplex: "half",
        credentials: E ? se : void 0
      };
      Q = a && new t(h, Fe);
      let I = await (a ? De(Q, Ee) : De(h, Fe));
      const xe = p && (B === "stream" || B === "response");
      if (p && (T || xe && _)) {
        const F = {};
        ["status", "statusText", "headers"].forEach((Ne) => {
          F[Ne] = I[Ne];
        });
        const H = c.toFiniteNumber(I.headers.get("content-length")), [be, ae] = T && We(
          H,
          le(He(T), true)
        ) || [];
        I = new s(
          ze(I.body, Je, be, () => {
            ae && ae(), _ && _();
          }),
          F
        );
      }
      B = B || "text";
      let Dt = await f[c.findKey(f, B) || "text"](I, d);
      return !xe && _ && _(), await new Promise((F, H) => {
        kt(F, H, {
          data: Dt,
          headers: A.from(I.headers),
          status: I.status,
          statusText: I.statusText,
          config: d,
          request: Q
        });
      });
    } catch (E) {
      throw _ && _(), E && E.name === "TypeError" && /Load failed|fetch/i.test(E.message) ? Object.assign(
        new v("Network Error", v.ERR_NETWORK, d, Q),
        {
          cause: E.cause || E
        }
      ) : v.from(E, E && E.code, d, Q);
    }
  };
};
var is = /* @__PURE__ */ new Map();
var Ct = (r) => {
  let e = r ? r.env : {};
  const { fetch: t, Request: s, Response: i } = e, a = [
    s,
    i,
    t
  ];
  let n = a.length, o = n, u, l, p = is;
  for (; o--; )
    u = a[o], l = p.get(u), l === void 0 && p.set(u, l = o ? /* @__PURE__ */ new Map() : ss(e)), p = l;
  return l;
};
Ct();
var Pe = {
  http: Lr,
  xhr: Qr,
  fetch: {
    get: Ct
  }
};
c.forEach(Pe, (r, e) => {
  if (r) {
    try {
      Object.defineProperty(r, "name", { value: e });
    } catch {
    }
    Object.defineProperty(r, "adapterName", { value: e });
  }
});
var Ze = (r) => `- ${r}`;
var as = (r) => c.isFunction(r) || r === null || r === false;
var Kt = {
  getAdapter: (r, e) => {
    r = c.isArray(r) ? r : [r];
    const { length: t } = r;
    let s, i;
    const a = {};
    for (let n = 0; n < t; n++) {
      s = r[n];
      let o;
      if (i = s, !as(s) && (i = Pe[(o = String(s)).toLowerCase()], i === void 0))
        throw new v(`Unknown adapter '${o}'`);
      if (i && (c.isFunction(i) || (i = i.get(e))))
        break;
      a[o || "#" + n] = i;
    }
    if (!i) {
      const n = Object.entries(a).map(
        ([u, l]) => `adapter ${u} ` + (l === false ? "is not supported by the environment" : "is not available in the build")
      );
      let o = t ? n.length > 1 ? `since :
` + n.map(Ze).join(`
`) : " " + Ze(n[0]) : "as no adapter specified";
      throw new v(
        "There is no suitable adapter to dispatch the request " + o,
        "ERR_NOT_SUPPORT"
      );
    }
    return i;
  },
  adapters: Pe
};
function Le(r) {
  if (r.cancelToken && r.cancelToken.throwIfRequested(), r.signal && r.signal.aborted)
    throw new X(null, r);
}
function et(r) {
  return Le(r), r.headers = A.from(r.headers), r.data = Se.call(
    r,
    r.transformRequest
  ), ["post", "put", "patch"].indexOf(r.method) !== -1 && r.headers.setContentType("application/x-www-form-urlencoded", false), Kt.getAdapter(r.adapter || re.adapter, r)(r).then(function(s) {
    return Le(r), s.data = Se.call(
      r,
      r.transformResponse,
      s
    ), s.headers = A.from(s.headers), s;
  }, function(s) {
    return wt(s) || (Le(r), s && s.response && (s.response.data = Se.call(
      r,
      r.transformResponse,
      s.response
    ), s.response.headers = A.from(s.response.headers))), Promise.reject(s);
  });
}
var At = "1.12.2";
var fe = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((r, e) => {
  fe[r] = function(s) {
    return typeof s === r || "a" + (e < 1 ? "n " : " ") + r;
  };
});
var tt = {};
fe.transitional = function(e, t, s) {
  function i(a, n) {
    return "[Axios v" + At + "] Transitional option '" + a + "'" + n + (s ? ". " + s : "");
  }
  return (a, n, o) => {
    if (e === false)
      throw new v(
        i(n, " has been removed" + (t ? " in " + t : "")),
        v.ERR_DEPRECATED
      );
    return t && !tt[n] && (tt[n] = true, console.warn(
      i(
        n,
        " has been deprecated since v" + t + " and will be removed in the near future"
      )
    )), e ? e(a, n, o) : true;
  };
};
fe.spelling = function(e) {
  return (t, s) => (console.warn(`${s} is likely a misspelling of ${e}`), true);
};
function ns(r, e, t) {
  if (typeof r != "object")
    throw new v("options must be an object", v.ERR_BAD_OPTION_VALUE);
  const s = Object.keys(r);
  let i = s.length;
  for (; i-- > 0; ) {
    const a = s[i], n = e[a];
    if (n) {
      const o = r[a], u = o === void 0 || n(o, a, r);
      if (u !== true)
        throw new v("option " + a + " must be " + u, v.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (t !== true)
      throw new v("Unknown option " + a, v.ERR_BAD_OPTION);
  }
}
var ue = {
  assertOptions: ns,
  validators: fe
};
var D = ue.validators;
var j = class {
  constructor(e) {
    this.defaults = e || {}, this.interceptors = {
      request: new je(),
      response: new je()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(e, t) {
    try {
      return await this._request(e, t);
    } catch (s) {
      if (s instanceof Error) {
        let i = {};
        Error.captureStackTrace ? Error.captureStackTrace(i) : i = new Error();
        const a = i.stack ? i.stack.replace(/^.+\n/, "") : "";
        try {
          s.stack ? a && !String(s.stack).endsWith(a.replace(/^.+\n.+\n/, "")) && (s.stack += `
` + a) : s.stack = a;
        } catch {
        }
      }
      throw s;
    }
  }
  _request(e, t) {
    typeof e == "string" ? (t = t || {}, t.url = e) : t = e || {}, t = G(this.defaults, t);
    const { transitional: s, paramsSerializer: i, headers: a } = t;
    s !== void 0 && ue.assertOptions(s, {
      silentJSONParsing: D.transitional(D.boolean),
      forcedJSONParsing: D.transitional(D.boolean),
      clarifyTimeoutError: D.transitional(D.boolean)
    }, false), i != null && (c.isFunction(i) ? t.paramsSerializer = {
      serialize: i
    } : ue.assertOptions(i, {
      encode: D.function,
      serialize: D.function
    }, true)), t.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? t.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : t.allowAbsoluteUrls = true), ue.assertOptions(t, {
      baseUrl: D.spelling("baseURL"),
      withXsrfToken: D.spelling("withXSRFToken")
    }, true), t.method = (t.method || this.defaults.method || "get").toLowerCase();
    let n = a && c.merge(
      a.common,
      a[t.method]
    );
    a && c.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (d) => {
        delete a[d];
      }
    ), t.headers = A.concat(n, a);
    const o = [];
    let u = true;
    this.interceptors.request.forEach(function(h) {
      typeof h.runWhen == "function" && h.runWhen(t) === false || (u = u && h.synchronous, o.unshift(h.fulfilled, h.rejected));
    });
    const l = [];
    this.interceptors.response.forEach(function(h) {
      l.push(h.fulfilled, h.rejected);
    });
    let p, f = 0, m;
    if (!u) {
      const d = [et.bind(this), void 0];
      for (d.unshift(...o), d.push(...l), m = d.length, p = Promise.resolve(t); f < m; )
        p = p.then(d[f++], d[f++]);
      return p;
    }
    m = o.length;
    let g = t;
    for (; f < m; ) {
      const d = o[f++], h = o[f++];
      try {
        g = d(g);
      } catch (y) {
        h.call(this, y);
        break;
      }
    }
    try {
      p = et.call(this, g);
    } catch (d) {
      return Promise.reject(d);
    }
    for (f = 0, m = l.length; f < m; )
      p = p.then(l[f++], l[f++]);
    return p;
  }
  getUri(e) {
    e = G(this.defaults, e);
    const t = Mt(e.baseURL, e.url, e.allowAbsoluteUrls);
    return vt(t, e.params, e.paramsSerializer);
  }
};
c.forEach(["delete", "get", "head", "options"], function(e) {
  j.prototype[e] = function(t, s) {
    return this.request(G(s || {}, {
      method: e,
      url: t,
      data: (s || {}).data
    }));
  };
});
c.forEach(["post", "put", "patch"], function(e) {
  function t(s) {
    return function(a, n, o) {
      return this.request(G(o || {}, {
        method: e,
        headers: s ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: a,
        data: n
      }));
    };
  }
  j.prototype[e] = t(), j.prototype[e + "Form"] = t(true);
});
var os = class qt {
  constructor(e) {
    if (typeof e != "function")
      throw new TypeError("executor must be a function.");
    let t;
    this.promise = new Promise(function(a) {
      t = a;
    });
    const s = this;
    this.promise.then((i) => {
      if (!s._listeners) return;
      let a = s._listeners.length;
      for (; a-- > 0; )
        s._listeners[a](i);
      s._listeners = null;
    }), this.promise.then = (i) => {
      let a;
      const n = new Promise((o) => {
        s.subscribe(o), a = o;
      }).then(i);
      return n.cancel = function() {
        s.unsubscribe(a);
      }, n;
    }, e(function(a, n, o) {
      s.reason || (s.reason = new X(a, n, o), t(s.reason));
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason)
      throw this.reason;
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(e) {
    if (this.reason) {
      e(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(e) : this._listeners = [e];
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(e) {
    if (!this._listeners)
      return;
    const t = this._listeners.indexOf(e);
    t !== -1 && this._listeners.splice(t, 1);
  }
  toAbortSignal() {
    const e = new AbortController(), t = (s) => {
      e.abort(s);
    };
    return this.subscribe(t), e.signal.unsubscribe = () => this.unsubscribe(t), e.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let e;
    return {
      token: new qt(function(i) {
        e = i;
      }),
      cancel: e
    };
  }
};
function cs(r) {
  return function(t) {
    return r.apply(null, t);
  };
}
function us(r) {
  return c.isObject(r) && r.isAxiosError === true;
}
var Ce = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511
};
Object.entries(Ce).forEach(([r, e]) => {
  Ce[e] = r;
});
function Rt(r) {
  const e = new j(r), t = ot(j.prototype.request, e);
  return c.extend(t, j.prototype, e, { allOwnKeys: true }), c.extend(t, e, null, { allOwnKeys: true }), t.create = function(i) {
    return Rt(G(r, i));
  }, t;
}
var k = Rt(re);
k.Axios = j;
k.CanceledError = X;
k.CancelToken = os;
k.isCancel = wt;
k.VERSION = At;
k.toFormData = ye;
k.AxiosError = v;
k.Cancel = k.CanceledError;
k.all = function(e) {
  return Promise.all(e);
};
k.spread = cs;
k.isAxiosError = us;
k.mergeConfig = G;
k.AxiosHeaders = A;
k.formToJSON = (r) => Lt(c.isHTMLForm(r) ? new FormData(r) : r);
k.getAdapter = Kt.getAdapter;
k.HttpStatusCode = Ce;
k.default = k;
var {
  Axios: vi,
  AxiosError: Si,
  CanceledError: Li,
  isCancel: wi,
  CancelToken: ki,
  VERSION: Mi,
  all: Pi,
  Cancel: Ci,
  isAxiosError: Ki,
  spread: Ai,
  toFormData: qi,
  AxiosHeaders: Ri,
  HttpStatusCode: Bi,
  formToJSON: Ti,
  getAdapter: Oi,
  mergeConfig: Ei
} = k;
var R = class extends Error {
  /**
   * Creates a new WBAPIError
   *
   * @param message - Error message describing what went wrong
   * @param statusCode - HTTP status code if applicable
   * @param response - API response body if available
   * @param requestId - Correlation ID for debugging
   * @param origin - Origin service identifier from RFC 7807 responses
   * @param timestamp - ISO 8601 timestamp from RFC 7807 responses
   */
  constructor(e, t, s, i, a, n) {
    super(e), this.name = this.constructor.name;
    const o = Error.captureStackTrace;
    o && o(this, this.constructor), this.statusCode = t, this.response = s, this.requestId = i, this.origin = a, this.timestamp = n;
  }
  /**
   * Returns a human-readable error message with recovery guidance.
   *
   * Override this method in subclasses to provide specific recovery steps.
   *
   * @returns User-friendly error message with actionable guidance
   *
   * @example
   * ```typescript
   * try {
   *   await sdk.products.createProduct(data);
   * } catch (error) {
   *   if (error instanceof WBAPIError) {
   *     // Show user-friendly message
   *     alert(error.getUserMessage());
   *
   *     // Log technical details for debugging
   *     console.error('Technical details:', {
   *       statusCode: error.statusCode,
   *       requestId: error.requestId
   *     });
   *   }
   * }
   * ```
   */
  getUserMessage() {
    let e = this.message;
    return this.statusCode !== void 0 && (e += ` (Status: ${this.statusCode.toString()})`), this.requestId && (e += ` [Request ID: ${this.requestId}]`), this.origin && (e += ` [Origin: ${this.origin}]`), e;
  }
  /**
   * Custom JSON serialization to preserve all error properties.
   *
   * By default, Error objects don't serialize the `message` property
   * when using JSON.stringify(). This method ensures all important
   * properties are included in the JSON output.
   *
   * @returns Object representation of the error for JSON serialization
   *
   * @example
   * ```typescript
   * const error = new WBAPIError('Test error', 400, { detail: 'info' }, 'req-123');
   * const json = JSON.stringify(error);
   * // { "name": "WBAPIError", "message": "Test error", "statusCode": 400, ... }
   * ```
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      response: this.response,
      requestId: this.requestId,
      origin: this.origin,
      timestamp: this.timestamp
    };
  }
};
var Te = class extends R {
  /**
   * Creates an authentication error
   *
   * @param message - Error message (defaults to standard authentication failure message)
   * @param statusCode - HTTP status code (401 or 403)
   * @param response - API response body if available
   * @param requestId - Correlation ID for debugging
   * @param origin - Origin service identifier from RFC 7807 responses
   * @param timestamp - ISO 8601 timestamp from RFC 7807 responses
   */
  constructor(e = "Authentication failed. Please verify your API key is valid and has the required permissions.", t = 401, s, i, a, n) {
    super(e, t, s, i, a, n), this.name = "AuthenticationError";
  }
  /**
   * Returns user-friendly error message with API key troubleshooting guidance
   *
   * @returns Error message with actionable recovery steps
   */
  getUserMessage() {
    const e = super.getUserMessage(), t = [
      `

To resolve this issue:`,
      "1. Verify your API key is valid and correctly formatted",
      "2. Check that your API key has the required permissions for this operation",
      "3. Ensure the Authorization header is properly set",
      "4. Confirm your API key has not been revoked or expired"
    ].join(`
`);
    return e + t;
  }
};
var Bt = class extends R {
  /**
   * Creates a rate limit error
   *
   * @param message - Error message (defaults to standard rate limit message)
   * @param retryAfter - Milliseconds until retry is allowed
   * @param response - API response body if available
   * @param requestId - Correlation ID for debugging
   * @param origin - Origin service identifier from RFC 7807 responses
   * @param timestamp - ISO 8601 timestamp from RFC 7807 responses
   */
  constructor(e = "Rate limit exceeded. The SDK will automatically retry this request.", t, s, i, a, n) {
    super(e, 429, s, i, a, n), this.name = "RateLimitError", this.retryAfter = t;
  }
  /**
   * Returns user-friendly error message with retry timing information
   *
   * @returns Error message with retry delay and automatic handling notice
   */
  getUserMessage() {
    const e = super.getUserMessage(), s = [
      `

Retry after: ${(this.retryAfter / 1e3).toFixed(1)} seconds`,
      `
The SDK will automatically retry this request.`,
      `
If rate limiting occurs frequently, consider:`,
      "1. Implementing request batching to reduce API call frequency",
      "2. Caching responses when appropriate",
      "3. Reviewing your application's API usage patterns"
    ].join(`
`);
    return e + s;
  }
  /**
   * Custom JSON serialization to preserve retryAfter property
   *
   * @returns Object representation including retryAfter timing
   */
  toJSON() {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode ?? 429,
      retryAfter: this.retryAfter
    };
  }
};
var b = class extends R {
  /**
   * Creates a validation error
   *
   * @param message - Error message (defaults to standard validation failure message)
   * @param fieldErrors - Optional map of field names to error messages
   * @param statusCode - HTTP status code (400 or 422)
   * @param response - API response body if available
   * @param requestId - Correlation ID for debugging
   */
  constructor(e = "Validation failed. Please check the request data and try again.", t, s = 400, i, a) {
    super(e, s, i, a), this.name = "ValidationError", this.fieldErrors = t;
  }
  /**
   * Returns user-friendly error message with field-level validation details
   *
   * @returns Error message with specific field errors and resolution guidance
   */
  getUserMessage() {
    const e = super.getUserMessage();
    if (this.fieldErrors && Object.keys(this.fieldErrors).length > 0) {
      const i = [
        `

Field validation errors:`,
        Object.entries(this.fieldErrors).map(([a, n]) => `  - ${a}: ${n}`).join(`
`),
        `
Please correct the above fields and try again.`
      ].join(`
`);
      return e + i;
    }
    const t = [
      `

To resolve this issue:`,
      "1. Ensure all required fields are provided",
      "2. Verify that field values meet the API specifications",
      "3. Check that data types and formats are correct",
      "4. Review the API documentation for field requirements"
    ].join(`
`);
    return e + t;
  }
  /**
   * Custom JSON serialization to preserve fieldErrors property
   *
   * @returns Object representation including field-level error details
   */
  toJSON() {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode ?? 400,
      fieldErrors: this.fieldErrors
    };
  }
};
var V = class extends R {
  /**
   * Creates a network error
   *
   * @param message - Error message describing the network failure
   * @param isTimeout - Whether this error was caused by a timeout
   * @param statusCode - HTTP status code (0 for network failures, 5xx for server errors)
   * @param cause - Original error from the HTTP client
   * @param response - API response body if available
   * @param requestId - Correlation ID for debugging
   */
  constructor(e, t = false, s, i, a, n) {
    super(e, s, a, n), this.name = "NetworkError", this.isTimeout = t, this.cause = i;
  }
  /**
   * Returns user-friendly error message with retry information and troubleshooting guidance
   *
   * @returns Error message with network-specific recovery steps
   */
  getUserMessage() {
    const e = super.getUserMessage();
    let t;
    return this.isTimeout ? t = [
      `

This request timed out after 30 seconds.`,
      "The SDK automatically retried this request 3 times.",
      `
To resolve timeout issues:`,
      "1. Check if the Wildberries API is experiencing high latency",
      "2. Consider increasing the timeout configuration",
      "3. Verify your network connection is stable",
      "4. Try again later if the API is overloaded"
    ].join(`
`) : this.statusCode && this.statusCode >= 500 ? t = [
      `

The Wildberries API server encountered an error.`,
      "The SDK automatically retried this request 3 times.",
      `
To resolve server errors:`,
      "1. Wait a few moments and try again",
      "2. Check the Wildberries API status page for known issues",
      "3. If the problem persists, contact Wildberries API support"
    ].join(`
`) : t = [
      `

Network connection failed.`,
      "The SDK automatically retried this request 3 times.",
      `
To resolve connection issues:`,
      "1. Check your internet connection",
      "2. Verify network firewalls allow HTTPS connections",
      "3. Ensure DNS resolution is working properly",
      "4. Try again when network connectivity is restored"
    ].join(`
`), e + t;
  }
  /**
   * Custom JSON serialization to preserve isTimeout property
   *
   * Note: The `cause` property is not serialized as Error objects
   * don't serialize well. Check the cause property directly if needed.
   *
   * @returns Object representation including timeout flag and status
   */
  toJSON() {
    return {
      ...super.toJSON(),
      isTimeout: this.isTimeout
    };
  }
};
var Oe = class extends R {
  /**
   * Creates a MetaValidationFailError
   *
   * @param message - Human-readable error message from the API response
   * @param code - WB error code string (e.g. `'MetaValidationFail'`). Defaults to 'Unknown' when WB omits the code field.
   * @param metaDetails - Array of individual validation failures
   * @param response - Raw API response body
   * @param requestId - Correlation ID for debugging and tracing
   * @param origin - Origin service identifier from RFC 7807 problem+json responses
   * @param timestamp - ISO 8601 timestamp from RFC 7807 problem+json responses
   */
  constructor(e, t, s, i, a, n, o) {
    super(e, 409, i, a, n, o), this.name = "MetaValidationFailError", this.code = t, this.metaDetails = [...s];
  }
  /**
   * Returns a user-friendly error message listing the failing marking codes.
   *
   * @returns Error message with metaDetails summary and recovery guidance
   */
  getUserMessage() {
    const e = super.getUserMessage(), t = this.metaDetails.filter((a) => a.decision === "invalid"), s = this.metaDetails.filter((a) => a.decision === "required"), i = [e];
    return t.length > 0 && i.push(
      `

Invalid marking codes (${t.length.toString()}):`,
      ...t.map((a) => `  - ${a.key}: "${a.value}"`)
    ), s.length > 0 && i.push(
      `

Missing required marking codes (${s.length.toString()}):`,
      ...s.map((a) => `  - ${a.key}`)
    ), i.push(
      `

Recovery steps:`,
      "1. Use sdk.ordersFBS.getOrdersMetaBulk() to pre-flight check marking codes before deliver",
      "2. Ensure marking codes include GS separators (ASCII 0x1D) and crypto-tail in full",
      "3. Fix the flagged assembly tasks, then retry updateSuppliesDeliver()",
      `
\u26A0\uFE0F Each 409 response counts as 10 requests against the rate-limit budget.`
    ), i.join(`
`);
  }
  /**
   * Custom JSON serialization to include metaDetails and code properties
   *
   * @returns Object representation including metaDetails and code
   */
  toJSON() {
    return {
      ...super.toJSON(),
      code: this.code,
      metaDetails: this.metaDetails
    };
  }
};
var ls = class {
  /**
   * Creates a new token bucket with the specified rate limit configuration.
   *
   * @param config - Rate limit configuration for this bucket
   */
  constructor(e) {
    this.capacity = e.burstLimit ?? e.requestsPerMinute, this.tokens = this.capacity, this.refillRate = e.requestsPerMinute / 6e4, this.lastRefill = Date.now(), this.queue = [];
  }
  /**
   * Refills tokens based on elapsed time since last refill.
   *
   * Tokens are added at the configured `refillRate` but never exceed `capacity`.
   * This method is called before each token consumption attempt.
   *
   * @example
   * // If refillRate is 0.0001 tokens/ms and 10000ms have elapsed:
   * // tokensToAdd = 10000 * 0.0001 = 1 token
   * // tokens = Math.min(capacity, currentTokens + 1)
   */
  refill() {
    const e = Date.now(), s = (e - this.lastRefill) * this.refillRate;
    this.tokens = Math.min(this.capacity, this.tokens + s), this.lastRefill = e;
  }
  /**
   * Attempts to consume a token for a request.
   *
   * If tokens are available, consumes one immediately and resolves.
   * If no tokens are available, queues the request and returns a Promise
   * that will resolve when a token becomes available.
   *
   * Queued requests are processed in FIFO order.
   *
   * @returns Promise that resolves when a token has been consumed
   *
   * @example
   * ```typescript
   * const bucket = new TokenBucket({ requestsPerMinute: 6, burstLimit: 1 });
   *
   * // First request: immediate (token available)
   * await bucket.consume(); // Resolves immediately
   *
   * // Second request: queued (no tokens)
   * await bucket.consume(); // Waits ~10 seconds for token refill
   * ```
   */
  async consume() {
    if (this.refill(), this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }
    return new Promise((e) => {
      this.queue.push(e), this.scheduleNextRelease();
    });
  }
  /**
   * Schedules the release of the next queued request when a token becomes available.
   *
   * Calculates the time until the next token will be available based on `refillRate`,
   * then uses setTimeout to process the next queued request at that time.
   *
   * This method is called automatically when a request is queued.
   *
   * @private
   */
  scheduleNextRelease() {
    if (this.queue.length === 0) return;
    const e = 1 / this.refillRate;
    setTimeout(() => {
      if (this.refill(), this.tokens >= 1 && this.queue.length > 0) {
        this.tokens -= 1;
        const t = this.queue.shift();
        t && t(), this.queue.length > 0 && this.scheduleNextRelease();
      }
    }, e);
  }
  /**
   * Get the current number of available tokens after refilling.
   *
   * This method triggers a refill and returns the current token count.
   * Useful for monitoring and debugging.
   *
   * @returns Current number of available tokens
   * @internal
   */
  getAvailableTokens() {
    return this.refill(), this.tokens;
  }
};
var ds = class {
  /**
   * Creates a new RateLimiter instance.
   *
   * @param config - Optional initial rate limit configuration.
   *                 Can be empty and configured dynamically via configure().
   *                 Defaults to empty object (no limits).
   *
   * @example
   * ```typescript
   * // With predefined limits
   * const limiter = new RateLimiter({
   *   'api.operation': { requestsPerMinute: 10 }
   * });
   *
   * // Empty (configure later)
   * const limiter = new RateLimiter();
   * ```
   */
  constructor(e) {
    this.buckets = /* @__PURE__ */ new Map(), this.config = e ?? {};
  }
  /**
   * Waits for a rate limit slot to become available for the specified endpoint.
   *
   * This method should be called before making an API request to ensure
   * the request doesn't exceed the endpoint's rate limit.
   *
   * Behavior:
   * - If no rate limit is configured for the endpoint key, returns immediately (unlimited)
   * - If tokens are available, consumes one and returns immediately
   * - If no tokens available, queues the request and waits until a token is available
   * - Queued requests are processed in FIFO order
   *
   * @param key - Endpoint identifier (e.g., 'products.create', 'orders.list')
   * @returns Promise that resolves when a rate limit slot is available
   *
   * @example
   * ```typescript
   * const limiter = new RateLimiter({
   *   'products.create': { requestsPerMinute: 6, burstLimit: 1 }
   * });
   *
   * // First request: immediate (token available)
   * await limiter.waitForSlot('products.create');
   * console.log('Request 1 can proceed');
   *
   * // Second request: queued (no tokens, waits ~10 seconds)
   * await limiter.waitForSlot('products.create');
   * console.log('Request 2 can proceed');
   *
   * // Unlimited endpoint: always immediate
   * await limiter.waitForSlot('general.ping');
   * console.log('Unlimited request proceeds immediately');
   * ```
   *
   * @example
   * ```typescript
   * // Multiple concurrent requests are queued in FIFO order
   * const promises = [
   *   limiter.waitForSlot('api.operation'),
   *   limiter.waitForSlot('api.operation'),
   *   limiter.waitForSlot('api.operation')
   * ];
   *
   * // First request proceeds immediately (token available)
   * // Second and third queue and wait in order
   * await Promise.all(promises);
   * ```
   */
  async waitForSlot(e) {
    const t = this.getOrCreateBucket(e);
    t && await t.consume();
  }
  /**
   * Gets or creates a token bucket for the specified endpoint.
   *
   * Buckets are created lazily on first access and reused for subsequent requests.
   * If no rate limit is configured for the endpoint, returns null (unlimited).
   *
   * @param key - Endpoint identifier
   * @returns TokenBucket instance or null if unlimited
   * @private
   */
  getOrCreateBucket(e) {
    if (this.buckets.has(e))
      return this.buckets.get(e) ?? null;
    if (!(e in this.config))
      return null;
    const t = this.config[e], s = new ls(t);
    return this.buckets.set(e, s), s;
  }
  /**
   * Dynamically configure or update rate limit for an endpoint.
   *
   * If a bucket already exists for this endpoint, it will be reset
   * with the new configuration. Existing queued requests will continue
   * with the old bucket until completed.
   *
   * @param key - Endpoint identifier
   * @param config - Rate limit configuration
   *
   * @example
   * ```typescript
   * const limiter = new RateLimiter();
   *
   * // Add rate limit for endpoint
   * limiter.configure('products.create', {
   *   requestsPerMinute: 6,
   *   intervalSeconds: 10,
   *   burstLimit: 1
   * });
   *
   * // Update existing rate limit
   * limiter.configure('products.create', {
   *   requestsPerMinute: 10  // Increase limit
   * });
   * ```
   */
  configure(e, t) {
    this.config[e] = t, this.buckets.delete(e);
  }
  /**
   * Get the current rate limit configuration for an endpoint.
   *
   * @param key - Endpoint identifier
   * @returns Rate limit configuration or undefined if no limit configured
   *
   * @example
   * ```typescript
   * const config = limiter.getConfiguration('products.create');
   * if (config) {
   *   console.log(`Limit: ${config.requestsPerMinute} req/min`);
   * }
   * ```
   */
  getConfiguration(e) {
    return e in this.config ? this.config[e] : void 0;
  }
  /**
   * Check if a request can proceed immediately without queueing.
   *
   * This is a non-blocking check useful for monitoring or debugging.
   * Does NOT consume a token.
   *
   * @param key - Endpoint identifier
   * @returns true if request can proceed immediately, false if would queue
   *
   * @example
   * ```typescript
   * if (limiter.canProceed('products.create')) {
   *   console.log('Request will execute immediately');
   * } else {
   *   console.log('Request will be queued');
   * }
   *
   * // Still need to call waitForSlot before making request
   * await limiter.waitForSlot('products.create');
   * ```
   */
  canProceed(e) {
    const t = this.getOrCreateBucket(e);
    return t ? t.getAvailableTokens() >= 1 : true;
  }
  /**
   * Get the number of tokens currently available for an endpoint.
   *
   * This is a monitoring/debugging method. The value can change rapidly
   * as tokens are consumed and refilled.
   *
   * @param key - Endpoint identifier
   * @returns Number of available tokens, or Infinity if unlimited
   *
   * @example
   * ```typescript
   * const remaining = limiter.getRemainingTokens('products.create');
   * console.log(`${remaining} requests can execute immediately`);
   * ```
   */
  getRemainingTokens(e) {
    const t = this.getOrCreateBucket(e);
    return t ? t.getAvailableTokens() : 1 / 0;
  }
  /**
   * Reset rate limiting state for an endpoint or all endpoints.
   *
   * Clears token buckets and queued requests. Use with caution as
   * queued requests will never resolve (they'll hang indefinitely).
   *
   * This is primarily a testing utility.
   *
   * @param key - Optional endpoint identifier. If omitted, resets all endpoints.
   *
   * @example
   * ```typescript
   * // Reset specific endpoint
   * limiter.reset('products.create');
   *
   * // Reset all endpoints
   * limiter.reset();
   * ```
   */
  reset(e) {
    e ? this.buckets.delete(e) : this.buckets.clear();
  }
};
var W = {
  // ============================================================================
  // General Module (from 01-general.yaml)
  // ============================================================================
  /**
   * Ping - connectivity check
   * x-readonly-method: true, x-category: all
   */
  "general.ping": {
    readonly: true,
    category: "all",
    rateLimitKey: "general.ping"
  },
  /**
   * Get news - portal seller news
   * x-readonly-method: true, x-category: commonapi
   */
  "general.news": {
    readonly: true,
    category: "commonapi",
    rateLimitKey: "general.communicationsNews"
  },
  /**
   * Get seller info - seller name and profile ID
   * x-readonly-method: true, x-category: commonapi
   */
  "general.sellerInfo": {
    readonly: true,
    category: "commonapi",
    rateLimitKey: "general.sellerInfo"
  },
  // ============================================================================
  // Products Module - Categories, Subjects, Characteristics (from 02-products.yaml)
  // ============================================================================
  /**
   * Get parent categories
   * x-readonly-method: true, x-category: content
   */
  "products.getParentAll": {
    readonly: true,
    category: "content",
    rateLimitKey: "products.contentObjectParentAll"
  },
  /**
   * Get all subjects (categories with items)
   * x-readonly-method: true, x-category: content
   */
  "products.getObjectAll": {
    readonly: true,
    category: "content",
    rateLimitKey: "products.contentObjectAll"
  },
  /**
   * Get subject characteristics
   * x-readonly-method: true, x-category: content
   */
  "products.getObjectCharc": {
    readonly: true,
    category: "content",
    rateLimitKey: "products.contentObjectCharcs"
  },
  /**
   * Get color directory
   * x-readonly-method: true, x-category: content
   */
  "products.getDirectoryColors": {
    readonly: true,
    category: "content",
    rateLimitKey: "products.contentDirectoryColors"
  },
  /**
   * Get gender/kind directory
   * x-readonly-method: true, x-category: content
   */
  "products.getDirectoryKinds": {
    readonly: true,
    category: "content",
    rateLimitKey: "products.contentDirectoryKinds"
  },
  /**
   * Get countries directory
   * x-readonly-method: true, x-category: content
   */
  "products.getDirectoryCountries": {
    readonly: true,
    category: "content",
    rateLimitKey: "products.contentDirectoryCountries"
  },
  /**
   * Get seasons directory
   * x-readonly-method: true, x-category: content
   */
  "products.getDirectorySeasons": {
    readonly: true,
    category: "content",
    rateLimitKey: "products.contentDirectorySeasons"
  },
  /**
   * Get VAT rates directory
   * x-readonly-method: true, x-category: content
   */
  "products.getDirectoryVat": {
    readonly: true,
    category: "content",
    rateLimitKey: "products.contentDirectoryVat"
  },
  /**
   * Get TNVED codes directory
   * x-readonly-method: true, x-category: content
   */
  "products.getDirectoryTnved": {
    readonly: true,
    category: "content",
    rateLimitKey: "products.contentDirectoryTnved"
  },
  /**
   * Get brands by subject
   * x-readonly-method: true, x-category: content
   */
  "products.getBrands": {
    readonly: true,
    category: "content",
    rateLimitKey: "products.brands"
  },
  // ============================================================================
  // Products Module - Tags (Labels)
  // ============================================================================
  /**
   * Get content tags list
   * x-readonly-method: true, x-category: content
   */
  "products.getContentTags": {
    readonly: true,
    category: "content",
    rateLimitKey: "products.contentTags"
  },
  /**
   * Create content tag
   * x-readonly-method: false, x-category: content
   */
  "products.createContentTag": {
    readonly: false,
    category: "content",
    rateLimitKey: "products.postContentTag"
  },
  /**
   * Update content tag
   * x-readonly-method: false, x-category: content
   */
  "products.updateContentTag": {
    readonly: false,
    category: "content",
    rateLimitKey: "products.patchContentTag"
  },
  /**
   * Delete content tag
   * x-readonly-method: false, x-category: content
   */
  "products.deleteContentTag": {
    readonly: false,
    category: "content",
    rateLimitKey: "products.deleteContentTag"
  },
  /**
   * Link tags to nomenclature
   * x-readonly-method: false, x-category: content
   */
  "products.createNomenclatureLink": {
    readonly: false,
    category: "content",
    rateLimitKey: "products.postContentTagNomenclatureLink"
  },
  // ============================================================================
  // Products Module - Product Cards
  // ============================================================================
  /**
   * Get product cards list
   * x-readonly-method: true, x-category: content
   */
  "products.getCardsList": {
    readonly: true,
    category: "content",
    rateLimitKey: "products.postContentGetCardsList"
  },
  /**
   * Get error list for failed card creation
   * x-readonly-method: true, x-category: content
   */
  "products.createErrorList": {
    readonly: true,
    category: "content",
    rateLimitKey: "products.postContentCardsErrorList"
  },
  /**
   * Update product cards
   * x-readonly-method: false, x-category: content
   */
  "products.createCardsUpdate": {
    readonly: false,
    category: "content",
    rateLimitKey: "products.postContentCardsUpdate"
  },
  /**
   * Merge/split product cards by imtID
   * x-readonly-method: false, x-category: content
   */
  "products.createCardsMovenm": {
    readonly: false,
    category: "content",
    rateLimitKey: "products.postContentCardsMoveNm"
  },
  /**
   * Move cards to trash
   * x-readonly-method: false, x-category: content
   */
  "products.createDeleteTrash": {
    readonly: false,
    category: "content",
    rateLimitKey: "products.postContentCardsDeleteTrash"
  },
  /**
   * Recover cards from trash
   * x-readonly-method: false, x-category: content
   */
  "products.createCardsRecover": {
    readonly: false,
    category: "content",
    rateLimitKey: "products.postContentCardsRecover"
  },
  /**
   * Get trashed cards list
   * x-readonly-method: true, x-category: content
   */
  "products.getTrashedCards": {
    readonly: true,
    category: "content",
    rateLimitKey: "products.postContentGetCardsTrash"
  },
  /**
   * Get card creation limits
   * x-readonly-method: true, x-category: content
   */
  "products.getCardsLimits": {
    readonly: true,
    category: "content",
    rateLimitKey: "products.contentCardsLimits"
  },
  /**
   * Generate barcodes
   * x-readonly-method: false, x-category: content
   */
  "products.createContentBarcode": {
    readonly: false,
    category: "content",
    rateLimitKey: "products.postContentBarcodes"
  },
  /**
   * Create product cards (upload)
   * x-readonly-method: false, x-category: content
   */
  "products.createCardsUpload": {
    readonly: false,
    category: "content",
    rateLimitKey: "products.postContentCardsUpload"
  },
  /**
   * Create cards and join to existing imtID
   * x-readonly-method: false, x-category: content
   */
  "products.createUploadAdd": {
    readonly: false,
    category: "content",
    rateLimitKey: "products.postContentCardsUploadAdd"
  },
  // ============================================================================
  // Products Module - Media
  // ============================================================================
  /**
   * Upload media file
   * x-readonly-method: false, x-category: content
   */
  "products.createMediaFile": {
    readonly: false,
    category: "content",
    rateLimitKey: "products.postContentMediaFile"
  },
  /**
   * Upload media by URLs
   * x-readonly-method: false, x-category: content
   */
  "products.createMediaSave": {
    readonly: false,
    category: "content",
    rateLimitKey: "products.postContentMediaSave"
  },
  // ============================================================================
  // Products Module - Prices and Discounts
  // ============================================================================
  /**
   * Set prices and discounts
   * x-readonly-method: false, x-category: discountsandprices
   */
  "products.createUploadTask": {
    readonly: false,
    category: "discountsandprices",
    rateLimitKey: "products.postUploadTask"
  },
  /**
   * Set prices per size
   * x-readonly-method: false, x-category: discountsandprices
   */
  "products.createTaskSize": {
    readonly: false,
    category: "discountsandprices",
    rateLimitKey: "products.postUploadTaskSize"
  },
  /**
   * Set WB Club discounts
   * x-readonly-method: false, x-category: discountsandprices
   */
  "products.createTaskClubDiscount": {
    readonly: false,
    category: "discountsandprices",
    rateLimitKey: "products.postUploadTaskClubDiscount"
  },
  /**
   * Get processed upload status (history tasks)
   * x-readonly-method: true, x-category: discountsandprices
   */
  "products.getHistoryTasks": {
    readonly: true,
    category: "discountsandprices",
    rateLimitKey: "products.historyTasks"
  },
  /**
   * Get processed upload details (goods history)
   * x-readonly-method: true, x-category: discountsandprices
   */
  "products.getGoodsTask": {
    readonly: true,
    category: "discountsandprices",
    rateLimitKey: "products.historyGoodsTask"
  },
  /**
   * Get pending upload status (buffer tasks)
   * x-readonly-method: true, x-category: discountsandprices
   */
  "products.getBufferTasks": {
    readonly: true,
    category: "discountsandprices",
    rateLimitKey: "products.bufferTasks"
  },
  /**
   * Get pending upload details (buffer goods)
   * x-readonly-method: true, x-category: discountsandprices
   */
  "products.getBufferGoodsTask": {
    readonly: true,
    category: "discountsandprices",
    rateLimitKey: "products.bufferGoodsTask"
  },
  /**
   * Get goods with prices (filter)
   * x-readonly-method: true, x-category: discountsandprices
   */
  "products.getGoodsFilter": {
    readonly: true,
    category: "discountsandprices",
    rateLimitKey: "products.listGoodsFilter"
  },
  /**
   * Get goods with prices by nmIDs
   * x-readonly-method: false, x-category: discountsandprices
   * Note: POST method but conceptually a read operation
   */
  "products.createGoodsFilter": {
    readonly: false,
    category: "discountsandprices",
    rateLimitKey: "products.postListGoodsFilter"
  },
  /**
   * Get size prices for a product
   * x-readonly-method: true, x-category: discountsandprices
   */
  "products.getSizeNm": {
    readonly: true,
    category: "discountsandprices",
    rateLimitKey: "products.listGoodsSizeNm"
  },
  /**
   * Get quarantined goods
   * x-readonly-method: true, x-category: discountsandprices
   */
  "products.getQuarantineGoods": {
    readonly: true,
    category: "discountsandprices",
    rateLimitKey: "products.quarantineGoods"
  },
  // ============================================================================
  // Products Module - Stocks (Marketplace)
  // ============================================================================
  /**
   * Get stocks for a warehouse
   * x-readonly-method: false, x-category: marketplace
   * Note: POST method but conceptually a read operation
   */
  "products.getStocks": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "products.postStocks"
  },
  /**
   * Update stocks for a warehouse
   * x-readonly-method: false, x-category: marketplace
   */
  "products.updateStock": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "products.putStocks"
  },
  /**
   * Delete stocks for a warehouse
   * x-readonly-method: false, x-category: marketplace
   */
  "products.deleteStock": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "products.deleteStocks"
  },
  // ============================================================================
  // Products Module - Warehouses (Marketplace)
  // ============================================================================
  /**
   * Get WB offices/warehouses
   * x-readonly-method: true, x-category: marketplace
   */
  "products.offices": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "products.offices"
  },
  /**
   * Get seller warehouses
   * x-readonly-method: true, x-category: marketplace
   */
  "products.warehouses": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "products.warehouses"
  },
  /**
   * Create seller warehouse
   * x-readonly-method: false, x-category: marketplace
   */
  "products.createWarehouse": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "products.postWarehouses"
  },
  /**
   * Update seller warehouse
   * x-readonly-method: false, x-category: marketplace
   */
  "products.updateWarehouse": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "products.putWarehouses"
  },
  /**
   * Delete seller warehouse
   * x-readonly-method: false, x-category: marketplace
   */
  "products.deleteWarehouse": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "products.deleteWarehouses"
  },
  /**
   * Get warehouse contacts
   * x-readonly-method: true, x-category: marketplace
   */
  "products.getWarehousesContact": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "products.dbwWarehousesContacts"
  },
  /**
   * Update warehouse contacts
   * x-readonly-method: false, x-category: marketplace
   */
  "products.updateWarehousesContact": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "products.putDbwWarehousesContacts"
  },
  // ============================================================================
  // User Management Module (from 01-general.yaml)
  // ============================================================================
  /**
   * Create user invitation
   * x-readonly-method: false, x-category: usermanagement
   */
  "userManagement.createInvite": {
    readonly: false,
    category: "usermanagement",
    rateLimitKey: "userManagement.createInvite"
  },
  /**
   * Get users list
   * x-readonly-method: true, x-category: usermanagement
   */
  "userManagement.getUsers": {
    readonly: true,
    category: "usermanagement",
    rateLimitKey: "userManagement.getUsers"
  },
  /**
   * Update user access
   * x-readonly-method: false, x-category: usermanagement
   */
  "userManagement.updateUserAccess": {
    readonly: false,
    category: "usermanagement",
    rateLimitKey: "userManagement.updateUserAccess"
  },
  /**
   * Delete user
   * x-readonly-method: false, x-category: usermanagement
   */
  "userManagement.deleteUser": {
    readonly: false,
    category: "usermanagement",
    rateLimitKey: "userManagement.deleteUser"
  },
  // ============================================================================
  // Orders FBS Module (from 03-orders-fbs.yaml)
  // ============================================================================
  // Passes (Пропуска FBS)
  /**
   * Get list of warehouses that require a pass
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.getPassesOffices": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.passesOffices"
  },
  /**
   * Get list of seller passes
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.passes": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.passes"
  },
  /**
   * Create a seller pass
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersFBS.createPass": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-fbs.postPasses"
  },
  /**
   * Update a seller pass
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersFBS.updatePass": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-fbs.putPasses"
  },
  /**
   * Delete a seller pass
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersFBS.deletePass": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-fbs.deletePasses"
  },
  // Assembly Tasks (Сборочные задания FBS)
  /**
   * Get list of new assembly tasks
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.getOrdersNew": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.ordersNew"
  },
  /**
   * Get assembly tasks information
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.orders": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.orders"
  },
  /**
   * Get assembly task statuses (deprecated)
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.createOrdersStatu": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.postOrdersStatus"
  },
  /**
   * Get assembly task statuses (new replacement method)
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.getOrderStatuses": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.postOrdersStatus"
  },
  /**
   * Get all assembly tasks requiring reshipment
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.getOrdersReshipment": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.suppliesOrdersReshipment"
  },
  /**
   * Cancel an assembly task
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersFBS.updateOrdersCancel": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-fbs.patchOrdersCancel"
  },
  /**
   * Get assembly task stickers
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.createOrdersSticker": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.postOrdersStickers"
  },
  /**
   * Get cross-border assembly task stickers
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.createStickersCrossBorder": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.postOrdersStickersCrossBorder"
  },
  /**
   * Get cross-border sticker links (deprecated)
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.createOrdersExternalSticker": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.postFilesOrdersExternalStickers"
  },
  /**
   * Get cross-border assembly task status history
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.createStatusHistory": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.postOrdersStatusHistory"
  },
  /**
   * Get orders with client information (Turkey cross-border)
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.createOrdersClient": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.postOrdersClient"
  },
  // Metadata (Метаданные FBS)
  /**
   * Get metadata for multiple assembly tasks (bulk)
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.getOrdersMetaBulk": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.postMarketplaceOrdersMeta"
  },
  /**
   * Get metadata for an assembly task (deprecated)
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.getOrdersMeta": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.postMarketplaceOrdersMeta"
  },
  /**
   * Delete assembly task metadata
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersFBS.deleteOrdersMeta": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-fbs.deleteOrdersMeta"
  },
  /**
   * Attach marking codes (SGTIN) to an assembly task
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersFBS.updateMetaSgtin": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-fbs.putOrdersMetaSgtin"
  },
  /**
   * Attach UIN to an assembly task
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersFBS.updateMetaUin": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-fbs.putOrdersMetaUin"
  },
  /**
   * Attach IMEI to an assembly task
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersFBS.updateMetaImei": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-fbs.putOrdersMetaImei"
  },
  /**
   * Attach GTIN to an assembly task
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersFBS.updateMetaGtin": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-fbs.putOrdersMetaGtin"
  },
  /**
   * Attach expiration date to an assembly task
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersFBS.updateMetaExpiration": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-fbs.putOrdersMetaExpiration"
  },
  /**
   * Attach customs declaration number to an assembly task
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersFBS.setCustomsDeclaration": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-fbs.putOrdersMetaCustomsDeclaration"
  },
  // Supplies (Поставки FBS)
  /**
   * Get list of supplies
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.supplies": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.supplies"
  },
  /**
   * Create a new supply
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersFBS.createSupply": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-fbs.postSupplies"
  },
  /**
   * Add an assembly task to a supply (deprecated)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersFBS.updateSuppliesOrder": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-fbs.patchSuppliesOrders"
  },
  /**
   * Add multiple assembly tasks to a supply (bulk)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersFBS.addOrdersToSupply": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-fbs.patchMarketplaceSuppliesOrders"
  },
  /**
   * Get supply information
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.getSupply": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.getSupply"
  },
  /**
   * Delete a supply
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersFBS.deleteSupply": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-fbs.deleteSupplies"
  },
  /**
   * Get assembly tasks in a supply (deprecated)
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.getSuppliesOrder": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.suppliesOrders"
  },
  /**
   * Get assembly task IDs in a supply
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.getSupplyOrderIds": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.getMarketplaceSuppliesOrderIds"
  },
  /**
   * Transfer supply to delivery
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersFBS.updateSuppliesDeliver": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-fbs.patchSuppliesDeliver"
  },
  /**
   * Get supply QR code
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.getSuppliesBarcode": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.suppliesBarcode"
  },
  /**
   * Get list of supply boxes (trbx)
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.getSuppliesTrbx": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.suppliesTrbx"
  },
  /**
   * Add boxes to a supply
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersFBS.createSuppliesTrbx": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-fbs.postSuppliesTrbx"
  },
  /**
   * Delete boxes from a supply
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersFBS.deleteSuppliesTrbx": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-fbs.deleteSuppliesTrbx"
  },
  /**
   * Get supply box stickers
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersFBS.createTrbxSticker": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-fbs.postSuppliesTrbxStickers"
  },
  // ============================================================================
  // Orders DBS Module (from 04-orders-dbs.yaml)
  // ============================================================================
  // Assembly Tasks (Сборочные задания DBS)
  /**
   * Get list of new DBS assembly tasks
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersDBS.getNewOrders": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-dbs.getNewOrders"
  },
  /**
   * Get completed DBS orders with pagination and date filtering
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersDBS.getOrders": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-dbs.getOrders"
  },
  /**
   * Get paid delivery group information
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersDBS.getGroupsInfo": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-dbs.getGroupsInfo"
  },
  /**
   * Get customer contact information for DBS orders
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersDBS.getClientInfo": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-dbs.getClientInfo"
  },
  /**
   * Get B2B buyer information for DBS orders
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersDBS.getB2BInfo": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-dbs.getB2BInfo"
  },
  /**
   * Get delivery dates for DBS orders
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersDBS.getDeliveryDates": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-dbs.getDeliveryDates"
  },
  // Metadata (Метаданные DBS)
  /**
   * Get order metadata (deprecated)
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersDBS.getMeta": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-dbs.getMeta"
  },
  /**
   * Get metadata for multiple orders (bulk)
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersDBS.getMetaBulk": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-dbs.getMetaBulk"
  },
  /**
   * Delete specific metadata from an order (deprecated)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.deleteMeta": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.deleteMeta"
  },
  /**
   * Delete metadata for multiple orders (bulk)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.deleteMetaBulk": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.deleteMetaBulk"
  },
  /**
   * Set SGTIN marking codes for an order (deprecated)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.setSgtin": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.setMeta"
  },
  /**
   * Set SGTIN codes for multiple orders (bulk)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.setSgtinBulk": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.setSgtinBulk"
  },
  /**
   * Set UIN code for an order (deprecated)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.setUin": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.setMeta"
  },
  /**
   * Set UIN codes for multiple orders (bulk)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.setUinBulk": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.setUinBulk"
  },
  /**
   * Set IMEI code for an order (deprecated)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.setImei": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.setMeta"
  },
  /**
   * Set IMEI codes for multiple orders (bulk)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.setImeiBulk": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.setImeiBulk"
  },
  /**
   * Set GTIN code for an order (deprecated)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.setGtin": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.setMeta"
  },
  /**
   * Set GTIN codes for multiple orders (bulk)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.setGtinBulk": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.setGtinBulk"
  },
  /**
   * Set customs declaration for an order (deprecated)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.setCustomsDeclaration": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.setMeta"
  },
  /**
   * Set customs declaration for multiple orders (bulk)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.setCustomsDeclarationBulk": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.setCustomsDeclarationBulk"
  },
  // Status Management
  /**
   * Get order statuses (deprecated)
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersDBS.getStatuses": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-dbs.getStatuses"
  },
  /**
   * Get order statuses (bulk)
   * x-readonly-method: true, x-category: marketplace
   */
  "ordersDBS.getStatusesBulk": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "orders-dbs.getStatusesBulk"
  },
  /**
   * Confirm order (deprecated)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.confirm": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.confirm"
  },
  /**
   * Confirm orders (bulk)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.confirmBulk": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.confirmBulk"
  },
  /**
   * Deliver order (deprecated)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.deliver": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.deliver"
  },
  /**
   * Deliver orders (bulk)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.deliverBulk": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.deliverBulk"
  },
  /**
   * Receive order (deprecated)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.receive": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.receive"
  },
  /**
   * Receive orders (bulk)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.receiveBulk": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.receiveBulk"
  },
  /**
   * Reject order (deprecated)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.reject": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.reject"
  },
  /**
   * Reject orders (bulk)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.rejectBulk": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.rejectBulk"
  },
  /**
   * Cancel order (deprecated)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.cancel": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.cancel"
  },
  /**
   * Cancel orders (bulk)
   * x-readonly-method: false, x-category: marketplace
   */
  "ordersDBS.cancelBulk": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "orders-dbs.cancelBulk"
  },
  // ============================================================================
  // Orders FBW Module (from 07-orders-fbw.yaml)
  // ============================================================================
  /**
   * Get acceptance coefficients (deprecated - moved to tariffs module)
   * x-readonly-method: true, x-category: supplies
   */
  "ordersFBW.getAcceptanceCoefficients": {
    readonly: true,
    category: "supplies",
    rateLimitKey: "orders-fbw.acceptanceCoefficients"
  },
  /**
   * Get acceptance options
   * x-readonly-method: true, x-category: supplies
   */
  "ordersFBW.createAcceptanceOption": {
    readonly: true,
    category: "supplies",
    rateLimitKey: "orders-fbw.postAcceptanceOptions"
  },
  /**
   * Get list of warehouses
   * x-readonly-method: true, x-category: supplies
   */
  "ordersFBW.warehouses": {
    readonly: true,
    category: "supplies",
    rateLimitKey: "orders-fbw.warehouses"
  },
  /**
   * Get transit tariffs
   * x-readonly-method: true, x-category: supplies
   */
  "ordersFBW.transitTariffs": {
    readonly: true,
    category: "supplies",
    rateLimitKey: "orders-fbw.transitTariffs"
  },
  /**
   * Get list of supplies
   * x-readonly-method: true, x-category: supplies
   */
  "ordersFBW.listSupplies": {
    readonly: true,
    category: "supplies",
    rateLimitKey: "orders-fbw.postSupplies"
  },
  /**
   * Get list of supplies (deprecated alias)
   * x-readonly-method: true, x-category: supplies
   */
  "ordersFBW.createSupply": {
    readonly: true,
    category: "supplies",
    rateLimitKey: "orders-fbw.postSupplies"
  },
  /**
   * Get supply details
   * x-readonly-method: true, x-category: supplies
   */
  "ordersFBW.getSupply": {
    readonly: true,
    category: "supplies",
    rateLimitKey: "orders-fbw.supplies"
  },
  /**
   * Get supply goods
   * x-readonly-method: true, x-category: supplies
   */
  "ordersFBW.getSuppliesGood": {
    readonly: true,
    category: "supplies",
    rateLimitKey: "orders-fbw.suppliesGoods"
  },
  /**
   * Get supply package info
   * x-readonly-method: true, x-category: supplies
   */
  "ordersFBW.getSuppliesPackage": {
    readonly: true,
    category: "supplies",
    rateLimitKey: "orders-fbw.suppliesPackage"
  },
  // ============================================================================
  // Promotion Module (from 08-promotion/*.yaml)
  // ============================================================================
  // --- Campaigns (kampanii.yaml) ---
  /**
   * Get campaign count by status
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getPromotionCount": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.advPromotionCount"
  },
  /**
   * Get campaign information (POST for filtering)
   * x-readonly-method: true, x-category: advert
   */
  "promotion.createPromotionAdvert": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.postAdvPromotionAdverts"
  },
  /**
   * Get manual bid campaigns (V0)
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getAuctionAdverts": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.advAuctionAdverts"
  },
  /**
   * Get campaigns V2 (replacement for deprecated endpoints)
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getAdvertsV2": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.advertsV2"
  },
  // --- Campaign Creation (sozdanie-kampaniy.yaml) ---
  /**
   * Get configuration values
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getAdvConfig": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.advConfig"
  },
  /**
   * Get minimum bids for product cards (V0)
   * x-readonly-method: true, x-category: advert
   */
  "promotion.createBidsMin": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.postAdvBidsMin"
  },
  /**
   * Get minimum bids for product cards (V1)
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getBidsMinV2": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.bidsMinV1"
  },
  /**
   * Create unified bid campaign (V1)
   * x-readonly-method: false, x-category: advert
   */
  "promotion.createAdvSaveAd": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.postAdvSaveAd"
  },
  /**
   * Create campaign (V2)
   * x-readonly-method: false, x-category: advert
   */
  "promotion.createSeacatSaveAd": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.postAdvSeacatSaveAd"
  },
  /**
   * Get subjects for campaigns
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getSupplierSubjects": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.advSupplierSubjects"
  },
  /**
   * Get product cards for campaigns
   * x-readonly-method: true, x-category: advert
   */
  "promotion.createSupplierNm": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.postAdvSupplierNms"
  },
  // --- Campaign Management (upravlenie-kampaniyami.yaml) ---
  /**
   * Delete campaign
   * x-readonly-method: false, x-category: advert
   */
  "promotion.getAdvDelete": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.advDelete"
  },
  /**
   * Rename campaign
   * x-readonly-method: false, x-category: advert
   */
  "promotion.createAdvRename": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.postAdvRename"
  },
  /**
   * Start campaign
   * x-readonly-method: false, x-category: advert
   */
  "promotion.getAdvStart": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.advStart"
  },
  /**
   * Pause campaign
   * x-readonly-method: false, x-category: advert
   */
  "promotion.getAdvPause": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.advPause"
  },
  /**
   * Stop campaign
   * x-readonly-method: false, x-category: advert
   */
  "promotion.getAdvStop": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.advStop"
  },
  /**
   * Update bids (V0)
   * x-readonly-method: false, x-category: advert
   */
  "promotion.updateAdvBid": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.patchAdvBids"
  },
  /**
   * Update bids (V1)
   * x-readonly-method: false, x-category: advert
   */
  "promotion.updateBidsV2": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.bidsV1"
  },
  /**
   * Update placement for manual bid campaigns
   * x-readonly-method: false, x-category: advert
   */
  "promotion.updateAuctionPlacement": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.putAdvAuctionPlacements"
  },
  /**
   * Update auction bids
   * x-readonly-method: false, x-category: advert
   */
  "promotion.updateAuctionBid": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.patchAdvAuctionBids"
  },
  /**
   * Update product list in campaigns
   * x-readonly-method: false, x-category: advert
   */
  "promotion.updateAuctionNm": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.patchAdvAuctionNms"
  },
  // --- Finances (finansy.yaml) ---
  /**
   * Get promotion balance
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getAdvBalance": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.advBalance"
  },
  /**
   * Get campaign budget
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getAdvBudget": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.advBudget"
  },
  /**
   * Deposit campaign budget
   * x-readonly-method: false, x-category: advert
   */
  "promotion.createBudgetDeposit": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.postAdvBudgetDeposit"
  },
  /**
   * Get expense history
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getAdvUpd": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.advUpd"
  },
  /**
   * Get payment history
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getAdvPayments": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.advPayments"
  },
  // --- Campaign Parameters (parametry-kampaniy.yaml) ---
  /**
   * Set fixed phrase activity
   * x-readonly-method: false, x-category: advert
   */
  "promotion.getSearchSetPlus": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.advSearchSetPlus"
  },
  /**
   * Set/remove fixed phrases
   * x-readonly-method: false, x-category: advert
   */
  "promotion.createSearchSetPlu": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.postAdvSearchSetPlus"
  },
  /**
   * Set/remove minus-phrases for search campaigns
   * x-readonly-method: false, x-category: advert
   */
  "promotion.createSearchSetExcluded": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.postAdvSearchSetExcluded"
  },
  /**
   * Set/remove minus-phrases for auto campaigns
   * x-readonly-method: false, x-category: advert
   */
  "promotion.createAutoSetExcluded": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.postAdvAutoSetExcluded"
  },
  /**
   * Get product list for auto campaign
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getAutoGetnmtoadd": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.advAutoGetnmtoadd"
  },
  /**
   * Update product list in auto campaign
   * x-readonly-method: false, x-category: advert
   */
  "promotion.createAutoUpdatenm": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.postAdvAutoUpdatenm"
  },
  // --- Media Campaigns (media.yaml) ---
  /**
   * Get media campaign count
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getAdvCount": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.advCount"
  },
  /**
   * Get media campaigns list
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getAdvAdverts": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.advAdverts"
  },
  /**
   * Get media campaign info
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getAdvAdvert": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.advAdvert"
  },
  // --- Statistics (statistika.yaml) ---
  /**
   * Get campaign full stats (V2)
   * x-readonly-method: true, x-category: advert
   */
  "promotion.createAdvFullstat": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.postAdvFullstats"
  },
  /**
   * Get campaign full stats (V3)
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getAdvFullstats": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.advFullstats"
  },
  /**
   * Get auto campaign stat words
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getAutoStatWords": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.advAutoStatWords"
  },
  /**
   * Get stat words for manual bid campaigns
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getStatWords": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.advStatWords"
  },
  /**
   * Get keyword statistics
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getStatsKeywords": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.advStatsKeywords"
  },
  /**
   * Get media campaign statistics
   * x-readonly-method: true, x-category: advert
   */
  "promotion.createAdvStat": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.postAdvStats"
  },
  // --- Calendar Promotions (kalendar-aktsiy.yaml) ---
  /**
   * Get promotions list
   * x-readonly-method: true, x-category: discountsandprices
   */
  "promotion.getCalendarPromotions": {
    readonly: true,
    category: "discountsandprices",
    rateLimitKey: "promotion.calendarPromotions"
  },
  /**
   * Get promotion details
   * x-readonly-method: true, x-category: discountsandprices
   */
  "promotion.getPromotionsDetails": {
    readonly: true,
    category: "discountsandprices",
    rateLimitKey: "promotion.calendarPromotionsDetails"
  },
  /**
   * Get nomenclatures for promotion
   * x-readonly-method: true, x-category: discountsandprices
   */
  "promotion.getPromotionsNomenclatures": {
    readonly: true,
    category: "discountsandprices",
    rateLimitKey: "promotion.calendarPromotionsNomenclatures"
  },
  /**
   * Add product to promotion
   * x-readonly-method: false, x-category: discountsandprices
   */
  "promotion.createPromotionsUpload": {
    readonly: false,
    category: "discountsandprices",
    rateLimitKey: "promotion.postCalendarPromotionsUpload"
  },
  // --- Search Clusters (poiskovye-klastery.yaml) ---
  /**
   * Get normquery statistics
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getNormqueryStats": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.normqueryStats"
  },
  /**
   * Get normquery bids
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getNormqueryBids": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.normqueryGetBids"
  },
  /**
   * Set normquery bids
   * x-readonly-method: false, x-category: advert
   */
  "promotion.setNormqueryBids": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.normquerySetBids"
  },
  /**
   * Delete normquery bids
   * x-readonly-method: false, x-category: advert
   */
  "promotion.deleteNormqueryBids": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.normqueryDeleteBids"
  },
  /**
   * Get normquery minus-phrases
   * x-readonly-method: true, x-category: advert
   */
  "promotion.getNormqueryMinus": {
    readonly: true,
    category: "advert",
    rateLimitKey: "promotion.normqueryGetMinus"
  },
  /**
   * Set normquery minus-phrases
   * x-readonly-method: false, x-category: advert
   */
  "promotion.setNormqueryMinus": {
    readonly: false,
    category: "advert",
    rateLimitKey: "promotion.normquerySetMinus"
  },
  // ============================================================================
  // Communications Module (from 09-communications/*.yaml)
  // ============================================================================
  // --- Questions (voprosy.yaml) ---
  /**
   * Check for new feedbacks and questions
   * x-readonly-method: true, x-category: questionsandfeedback
   */
  "communications.newFeedbacksQuestions": {
    readonly: true,
    category: "questionsandfeedback",
    rateLimitKey: "communications.newFeedbacksQuestions"
  },
  /**
   * Get unanswered questions count
   * x-readonly-method: true, x-category: questionsandfeedback
   */
  "communications.getQuestionsCountUnanswered": {
    readonly: true,
    category: "questionsandfeedback",
    rateLimitKey: "communications.questionsCountUnanswered"
  },
  /**
   * Get questions count
   * x-readonly-method: true, x-category: questionsandfeedback
   */
  "communications.getQuestionsCount": {
    readonly: true,
    category: "questionsandfeedback",
    rateLimitKey: "communications.questionsCount"
  },
  /**
   * Get questions list
   * x-readonly-method: true, x-category: questionsandfeedback
   */
  "communications.questions": {
    readonly: true,
    category: "questionsandfeedback",
    rateLimitKey: "communications.questions"
  },
  /**
   * Update question (answer, mark viewed, etc.)
   * x-readonly-method: false, x-category: questionsandfeedback
   */
  "communications.updateQuestion": {
    readonly: false,
    category: "questionsandfeedback",
    rateLimitKey: "communications.patchQuestions"
  },
  /**
   * Get question by ID
   * x-readonly-method: true, x-category: questionsandfeedback
   */
  "communications.question": {
    readonly: true,
    category: "questionsandfeedback",
    rateLimitKey: "communications.question"
  },
  // --- Feedbacks/Reviews (otzyvy.yaml) ---
  /**
   * Get unanswered feedbacks count
   * x-readonly-method: true, x-category: questionsandfeedback
   */
  "communications.getFeedbacksCountUnanswered": {
    readonly: true,
    category: "questionsandfeedback",
    rateLimitKey: "communications.feedbacksCountUnanswered"
  },
  /**
   * Get feedbacks count
   * x-readonly-method: true, x-category: questionsandfeedback
   */
  "communications.getFeedbacksCount": {
    readonly: true,
    category: "questionsandfeedback",
    rateLimitKey: "communications.feedbacksCount"
  },
  /**
   * Get feedbacks list
   * x-readonly-method: true, x-category: questionsandfeedback
   */
  "communications.feedbacks": {
    readonly: true,
    category: "questionsandfeedback",
    rateLimitKey: "communications.feedbacks"
  },
  /**
   * Get supplier valuations (complaint reasons)
   * x-readonly-method: true, x-category: questionsandfeedback
   */
  "communications.supplierValuations": {
    readonly: true,
    category: "questionsandfeedback",
    rateLimitKey: "communications.supplierValuations"
  },
  /**
   * Report feedback/product issue
   * x-readonly-method: false, x-category: questionsandfeedback
   */
  "communications.createFeedbacksAction": {
    readonly: false,
    category: "questionsandfeedback",
    rateLimitKey: "communications.postFeedbacksActions"
  },
  /**
   * Answer feedback
   * x-readonly-method: false, x-category: questionsandfeedback
   */
  "communications.createFeedbacksAnswer": {
    readonly: false,
    category: "questionsandfeedback",
    rateLimitKey: "communications.postFeedbacksAnswer"
  },
  /**
   * Update feedback answer
   * x-readonly-method: false, x-category: questionsandfeedback
   */
  "communications.updateFeedbacksAnswer": {
    readonly: false,
    category: "questionsandfeedback",
    rateLimitKey: "communications.patchFeedbacksAnswer"
  },
  /**
   * Request product return by feedback ID
   * x-readonly-method: false, x-category: questionsandfeedback
   */
  "communications.createOrderReturn": {
    readonly: false,
    category: "questionsandfeedback",
    rateLimitKey: "communications.postFeedbacksOrderReturn"
  },
  /**
   * Get feedback by ID
   * x-readonly-method: true, x-category: questionsandfeedback
   */
  "communications.feedback": {
    readonly: true,
    category: "questionsandfeedback",
    rateLimitKey: "communications.feedback"
  },
  /**
   * Get archived feedbacks
   * x-readonly-method: true, x-category: questionsandfeedback
   */
  "communications.getFeedbacksArchive": {
    readonly: true,
    category: "questionsandfeedback",
    rateLimitKey: "communications.feedbacksArchive"
  },
  // --- Templates (removed from API but kept for compatibility) ---
  /**
   * Get response templates
   * x-readonly-method: true, x-category: questionsandfeedback
   */
  "communications.templates": {
    readonly: true,
    category: "questionsandfeedback",
    rateLimitKey: "communications.templates"
  },
  /**
   * Create response template
   * x-readonly-method: false, x-category: questionsandfeedback
   */
  "communications.createTemplate": {
    readonly: false,
    category: "questionsandfeedback",
    rateLimitKey: "communications.postTemplates"
  },
  /**
   * Update response template
   * x-readonly-method: false, x-category: questionsandfeedback
   */
  "communications.updateTemplate": {
    readonly: false,
    category: "questionsandfeedback",
    rateLimitKey: "communications.patchTemplates"
  },
  /**
   * Delete response template
   * x-readonly-method: false, x-category: questionsandfeedback
   */
  "communications.deleteTemplate": {
    readonly: false,
    category: "questionsandfeedback",
    rateLimitKey: "communications.deleteTemplates"
  },
  // --- Buyer Chat (chat-s-pokupatelyami.yaml) ---
  /**
   * Get seller chats list
   * x-readonly-method: true, x-category: buyerchat
   */
  "communications.getSellerChats": {
    readonly: true,
    category: "buyerchat",
    rateLimitKey: "communications.sellerChats"
  },
  /**
   * Get chat events
   * x-readonly-method: true, x-category: buyerchat
   */
  "communications.getSellerEvents": {
    readonly: true,
    category: "buyerchat",
    rateLimitKey: "communications.sellerEvents"
  },
  /**
   * Send message to buyer
   * x-readonly-method: false, x-category: buyerchat
   */
  "communications.createSellerMessage": {
    readonly: false,
    category: "buyerchat",
    rateLimitKey: "communications.postSellerMessage"
  },
  /**
   * Download file from message
   * x-readonly-method: true, x-category: buyerchat
   */
  "communications.getSellerDownload": {
    readonly: true,
    category: "buyerchat",
    rateLimitKey: "communications.sellerDownload"
  },
  // --- Returns (vozvraty-pokupatelyami.yaml) ---
  /**
   * Get buyer return claims
   * x-readonly-method: true, x-category: returns
   */
  "communications.claims": {
    readonly: true,
    category: "returns",
    rateLimitKey: "communications.claims"
  },
  /**
   * Respond to buyer claim
   * x-readonly-method: false, x-category: returns
   */
  "communications.updateClaim": {
    readonly: false,
    category: "returns",
    rateLimitKey: "communications.patchClaim"
  },
  // --- Pinned Reviews (zakreplyonnye-otzyvy.yaml) ---
  /**
   * Get pinned feedbacks count
   * x-readonly-method: true, x-category: questionsandfeedback
   */
  "communications.getPinnedFeedbacksCount": {
    readonly: true,
    category: "questionsandfeedback",
    rateLimitKey: "communications.getPinnedFeedbacksCount"
  },
  /**
   * Get pinned feedbacks limits
   * x-readonly-method: true, x-category: questionsandfeedback
   */
  "communications.getPinnedFeedbacksLimits": {
    readonly: true,
    category: "questionsandfeedback",
    rateLimitKey: "communications.getPinnedFeedbacksLimits"
  },
  /**
   * Get pinned feedbacks list
   * x-readonly-method: true, x-category: questionsandfeedback
   */
  "communications.getPinnedFeedbacks": {
    readonly: true,
    category: "questionsandfeedback",
    rateLimitKey: "communications.getPinnedFeedbacks"
  },
  /**
   * Pin feedback to product
   * x-readonly-method: false, x-category: questionsandfeedback
   */
  "communications.pinFeedback": {
    readonly: false,
    category: "questionsandfeedback",
    rateLimitKey: "communications.pinFeedback"
  },
  /**
   * Unpin feedback from product
   * x-readonly-method: false, x-category: questionsandfeedback
   */
  "communications.unpinFeedback": {
    readonly: false,
    category: "questionsandfeedback",
    rateLimitKey: "communications.unpinFeedback"
  },
  // ============================================================================
  // Tariffs Module (from 10-tariffs/*.yaml)
  // ============================================================================
  /**
   * Get commission by category
   * x-readonly-method: true, x-category: commonapi
   */
  "tariffs.getTariffsCommission": {
    readonly: true,
    category: "commonapi",
    rateLimitKey: "tariffs.tariffsCommission"
  },
  /**
   * Get box tariffs
   * x-readonly-method: true, x-category: commonapi
   */
  "tariffs.getTariffsBox": {
    readonly: true,
    category: "commonapi",
    rateLimitKey: "tariffs.tariffsBox"
  },
  /**
   * Get pallet tariffs
   * x-readonly-method: true, x-category: commonapi
   */
  "tariffs.getTariffsPallet": {
    readonly: true,
    category: "commonapi",
    rateLimitKey: "tariffs.tariffsPallet"
  },
  /**
   * Get return tariffs
   * x-readonly-method: true, x-category: commonapi
   */
  "tariffs.getTariffsReturn": {
    readonly: true,
    category: "commonapi",
    rateLimitKey: "tariffs.tariffsReturn"
  },
  /**
   * Get supply/acceptance coefficients
   * x-readonly-method: true, x-category: commonapi
   */
  "tariffs.getAcceptanceCoefficients": {
    readonly: true,
    category: "commonapi",
    rateLimitKey: "tariffs.acceptanceCoefficients"
  },
  // ============================================================================
  // Analytics Module Operations
  // From: wildberries_api_doc/11-analytics.yaml
  // ============================================================================
  /**
   * Create NM report detail
   * x-readonly-method: false, x-category: contentanalytics
   */
  "analytics.createNmReportDetail": {
    readonly: false,
    category: "contentanalytics",
    rateLimitKey: "analytics.createNmReportDetail"
  },
  /**
   * Create detail history
   * x-readonly-method: false, x-category: contentanalytics
   */
  "analytics.createDetailHistory": {
    readonly: false,
    category: "contentanalytics",
    rateLimitKey: "analytics.createDetailHistory"
  },
  /**
   * Create grouped history
   * x-readonly-method: false, x-category: contentanalytics
   */
  "analytics.createGroupedHistory": {
    readonly: false,
    category: "contentanalytics",
    rateLimitKey: "analytics.createGroupedHistory"
  },
  /**
   * Get sales funnel products
   * x-readonly-method: true, x-category: contentanalytics
   */
  "analytics.getSalesFunnelProducts": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "analytics.getSalesFunnelProducts"
  },
  /**
   * Get sales funnel products history
   * x-readonly-method: true, x-category: contentanalytics
   */
  "analytics.getSalesFunnelProductsHistory": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "analytics.getSalesFunnelProductsHistory"
  },
  /**
   * Get sales funnel grouped history
   * x-readonly-method: true, x-category: contentanalytics
   */
  "analytics.getSalesFunnelGroupedHistory": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "analytics.getSalesFunnelGroupedHistory"
  },
  /**
   * Get NM report downloads
   * x-readonly-method: true, x-category: contentanalytics
   */
  "analytics.getNmReportDownloads": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "analytics.getNmReportDownloads"
  },
  /**
   * Create NM report download
   * x-readonly-method: false, x-category: contentanalytics
   */
  "analytics.createNmReportDownload": {
    readonly: false,
    category: "contentanalytics",
    rateLimitKey: "analytics.createNmReportDownload"
  },
  /**
   * Create downloads retry
   * x-readonly-method: false, x-category: contentanalytics
   */
  "analytics.createDownloadsRetry": {
    readonly: false,
    category: "contentanalytics",
    rateLimitKey: "analytics.createDownloadsRetry"
  },
  /**
   * Get downloads file
   * x-readonly-method: true, x-category: contentanalytics
   */
  "analytics.getDownloadsFile": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "analytics.getDownloadsFile"
  },
  /**
   * Create search report
   * x-readonly-method: false, x-category: contentanalytics
   */
  "analytics.createSearchReportReport": {
    readonly: false,
    category: "contentanalytics",
    rateLimitKey: "analytics.createSearchReportReport"
  },
  /**
   * Create table group
   * x-readonly-method: false, x-category: contentanalytics
   */
  "analytics.createTableGroup": {
    readonly: false,
    category: "contentanalytics",
    rateLimitKey: "analytics.createTableGroup"
  },
  /**
   * Create table detail
   * x-readonly-method: false, x-category: contentanalytics
   */
  "analytics.createTableDetail": {
    readonly: false,
    category: "contentanalytics",
    rateLimitKey: "analytics.createTableDetail"
  },
  /**
   * Create product search text
   * x-readonly-method: false, x-category: contentanalytics
   */
  "analytics.createProductSearchText": {
    readonly: false,
    category: "contentanalytics",
    rateLimitKey: "analytics.createProductSearchText"
  },
  /**
   * Create product order
   * x-readonly-method: false, x-category: contentanalytics
   */
  "analytics.createProductOrder": {
    readonly: false,
    category: "contentanalytics",
    rateLimitKey: "analytics.createProductOrder"
  },
  /**
   * Create products group
   * x-readonly-method: false, x-category: contentanalytics
   */
  "analytics.createProductsGroup": {
    readonly: false,
    category: "contentanalytics",
    rateLimitKey: "analytics.createProductsGroup"
  },
  /**
   * Create products product
   * x-readonly-method: false, x-category: contentanalytics
   */
  "analytics.createProductsProduct": {
    readonly: false,
    category: "contentanalytics",
    rateLimitKey: "analytics.createProductsProduct"
  },
  /**
   * Create products size
   * x-readonly-method: false, x-category: contentanalytics
   */
  "analytics.createProductsSize": {
    readonly: false,
    category: "contentanalytics",
    rateLimitKey: "analytics.createProductsSize"
  },
  /**
   * Create stocks report office
   * x-readonly-method: false, x-category: contentanalytics
   */
  "analytics.createStocksReportOffice": {
    readonly: false,
    category: "contentanalytics",
    rateLimitKey: "analytics.createStocksReportOffice"
  },
  // ============================================================================
  // Reports Module Operations
  // From: wildberries_api_doc/12-reports.yaml
  // ============================================================================
  /**
   * Get supplier incomes
   * x-readonly-method: true, x-category: statistics
   */
  "reports.getSupplierIncomes": {
    readonly: true,
    category: "statistics",
    rateLimitKey: "reports.supplierIncomes"
  },
  /**
   * Get supplier stocks
   * x-readonly-method: true, x-category: statistics
   */
  "reports.getSupplierStocks": {
    readonly: true,
    category: "statistics",
    rateLimitKey: "reports.supplierStocks"
  },
  /**
   * Get supplier orders
   * x-readonly-method: true, x-category: statistics
   */
  "reports.getSupplierOrders": {
    readonly: true,
    category: "statistics",
    rateLimitKey: "reports.supplierOrders"
  },
  /**
   * Get supplier sales
   * x-readonly-method: true, x-category: statistics
   */
  "reports.getSupplierSales": {
    readonly: true,
    category: "statistics",
    rateLimitKey: "reports.supplierSales"
  },
  /**
   * Create analytics excise report
   * x-readonly-method: false, x-category: contentanalytics
   */
  "reports.createAnalyticsExciseReport": {
    readonly: false,
    category: "contentanalytics",
    rateLimitKey: "reports.createAnalyticsExciseReport"
  },
  /**
   * Create warehouse remains report
   * x-readonly-method: false, x-category: contentanalytics
   */
  "reports.warehouseRemains": {
    readonly: false,
    category: "contentanalytics",
    rateLimitKey: "reports.warehouseRemains"
  },
  /**
   * Get warehouse remains task status
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getWarehouseRemainsTaskStatus": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.getWarehouseRemainsTaskStatus"
  },
  /**
   * Download warehouse remains report
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.downloadWarehouseRemainsReport": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.downloadWarehouseRemainsReport"
  },
  /**
   * Get analytics antifraud details
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getAnalyticsAntifraudDetails": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.getAnalyticsAntifraudDetails"
  },
  /**
   * Get analytics goods labeling
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getAnalyticsGoodsLabeling": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.getAnalyticsGoodsLabeling"
  },
  /**
   * Get acceptance report
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.acceptanceReport": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.acceptanceReport"
  },
  /**
   * Get paid storage report
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.paidStorage": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.paidStorage"
  },
  /**
   * Get analytics region sale
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getAnalyticsRegionSale": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.getAnalyticsRegionSale"
  },
  /**
   * Get brand share brands
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getBrandShareBrands": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.getBrandShareBrands"
  },
  /**
   * Get banned products blocked
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getBannedProductsBlocked": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.getBannedProductsBlocked"
  },
  /**
   * Get measurement penalties
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getMeasurementPenalties": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.getMeasurementPenalties"
  },
  /**
   * Get warehouse measurements V2
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getWarehouseMeasurementsV2": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.getWarehouseMeasurementsV2"
  },
  /**
   * Get deductions
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getDeductions": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.getDeductions"
  },
  /**
   * Get warehouse remains task status (deprecated alias)
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getTasksStatu": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.getWarehouseRemainsTaskStatus"
  },
  /**
   * Download warehouse remains report (deprecated alias)
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getTasksDownload": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.downloadWarehouseRemainsReport"
  },
  /**
   * Get analytics warehouse measurements (deprecated)
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getAnalyticsWarehouseMeasurements": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.getAnalyticsWarehouseMeasurements"
  },
  /**
   * Get analytics incorrect attachments
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getAnalyticsIncorrectAttachments": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.getAnalyticsIncorrectAttachments"
  },
  /**
   * Get analytics characteristics change
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getAnalyticsCharacteristicsChange": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.getAnalyticsCharacteristicsChange"
  },
  /**
   * Get acceptance report task status
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getAcceptanceReportTaskStatus": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.getAcceptanceReportTaskStatus"
  },
  /**
   * Download acceptance report
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.downloadAcceptanceReport": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.downloadAcceptanceReport"
  },
  /**
   * Get paid storage task status
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getPaidStorageTaskStatus": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.getPaidStorageTaskStatus"
  },
  /**
   * Download paid storage report
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.downloadPaidStorageReport": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.downloadPaidStorageReport"
  },
  /**
   * Get brand share parent subjects
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getBrandShareParentSubjects": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.getBrandShareParentSubjects"
  },
  /**
   * Get analytics brand share
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getAnalyticsBrandShare": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.getAnalyticsBrandShare"
  },
  /**
   * Get banned products shadowed
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getBannedProductsShadowed": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.getBannedProductsShadowed"
  },
  /**
   * Get analytics goods return
   * x-readonly-method: true, x-category: contentanalytics
   */
  "reports.getAnalyticsGoodsReturn": {
    readonly: true,
    category: "contentanalytics",
    rateLimitKey: "reports.getAnalyticsGoodsReturn"
  },
  // ============================================================================
  // Finances Module Operations
  // From: wildberries_api_doc/13-finances.yaml
  // ============================================================================
  /**
   * Get account balance
   * x-readonly-method: true, x-category: finance
   */
  "finances.getAccountBalance": {
    readonly: true,
    category: "finance",
    rateLimitKey: "finances.accountBalance"
  },
  /**
   * Get supplier report detail by period
   * x-readonly-method: true, x-category: statistics
   */
  "finances.getSupplierReportDetailByPeriod": {
    readonly: true,
    category: "statistics",
    rateLimitKey: "finances.supplierReportDetailByPeriod"
  },
  /**
   * Get documents categories
   * x-readonly-method: true, x-category: documents
   */
  "finances.getDocumentsCategories": {
    readonly: true,
    category: "documents",
    rateLimitKey: "finances.documentsCategories"
  },
  /**
   * Get documents list
   * x-readonly-method: true, x-category: documents
   */
  "finances.getDocumentsList": {
    readonly: true,
    category: "documents",
    rateLimitKey: "finances.documentsList"
  },
  /**
   * Get documents download
   * x-readonly-method: true, x-category: documents
   */
  "finances.getDocumentsDownload": {
    readonly: true,
    category: "documents",
    rateLimitKey: "finances.documentsDownload"
  },
  /**
   * Create download all documents
   * x-readonly-method: false, x-category: documents
   */
  "finances.createDownloadAll": {
    readonly: false,
    category: "documents",
    rateLimitKey: "finances.createDownloadAll"
  },
  // ============================================================================
  // In-Store Pickup Module Operations
  // From: wildberries_api_doc/06-in-store-pickup.yaml
  // ============================================================================
  /**
   * Get new orders for pickup
   * x-readonly-method: true, x-category: marketplace
   */
  "inStorePickup.getOrdersNew": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "in-store-pickup.ordersNew"
  },
  /**
   * Confirm orders
   * x-readonly-method: false, x-category: marketplace
   */
  "inStorePickup.updateOrdersConfirm": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "in-store-pickup.ordersConfirm"
  },
  /**
   * Prepare orders
   * x-readonly-method: false, x-category: marketplace
   */
  "inStorePickup.updateOrdersPrepare": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "in-store-pickup.ordersPrepare"
  },
  /**
   * Create order client notification
   * x-readonly-method: false, x-category: marketplace
   */
  "inStorePickup.createOrdersClient": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "in-store-pickup.ordersClient"
  },
  /**
   * Create client identity verification
   * x-readonly-method: false, x-category: marketplace
   */
  "inStorePickup.createClientIdentity": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "in-store-pickup.clientIdentity"
  },
  /**
   * Receive orders
   * x-readonly-method: false, x-category: marketplace
   */
  "inStorePickup.updateOrdersReceive": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "in-store-pickup.ordersReceive"
  },
  /**
   * Reject orders
   * x-readonly-method: false, x-category: marketplace
   */
  "inStorePickup.updateOrdersReject": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "in-store-pickup.ordersReject"
  },
  /**
   * Get order status
   * x-readonly-method: false, x-category: marketplace
   */
  "inStorePickup.createOrdersStatus": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "in-store-pickup.ordersStatus"
  },
  /**
   * Get click & collect orders
   * x-readonly-method: true, x-category: marketplace
   */
  "inStorePickup.getClickCollectOrders": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "in-store-pickup.clickCollectOrders"
  },
  /**
   * Cancel orders
   * x-readonly-method: false, x-category: marketplace
   */
  "inStorePickup.updateOrdersCancel": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "in-store-pickup.ordersCancel"
  },
  /**
   * Get orders meta
   * x-readonly-method: true, x-category: marketplace
   */
  "inStorePickup.getOrdersMeta": {
    readonly: true,
    category: "marketplace",
    rateLimitKey: "in-store-pickup.ordersMeta"
  },
  /**
   * Delete orders meta
   * x-readonly-method: false, x-category: marketplace
   */
  "inStorePickup.deleteOrdersMeta": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "in-store-pickup.deleteOrdersMeta"
  },
  /**
   * Update meta SGTIN
   * x-readonly-method: false, x-category: marketplace
   */
  "inStorePickup.updateMetaSgtin": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "in-store-pickup.metaSgtin"
  },
  /**
   * Update meta UIN
   * x-readonly-method: false, x-category: marketplace
   */
  "inStorePickup.updateMetaUin": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "in-store-pickup.metaUin"
  },
  /**
   * Update meta IMEI
   * x-readonly-method: false, x-category: marketplace
   */
  "inStorePickup.updateMetaImei": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "in-store-pickup.metaImei"
  },
  /**
   * Update meta GTIN
   * x-readonly-method: false, x-category: marketplace
   */
  "inStorePickup.updateMetaGtin": {
    readonly: false,
    category: "marketplace",
    rateLimitKey: "in-store-pickup.metaGtin"
  }
};
function ps(r) {
  const e = W[r];
  return e ? e.readonly : false;
}
var ms = class {
  /**
   * Creates a new RetryHandler instance
   *
   * @param config - Optional retry configuration (uses defaults if not provided)
   * @param logLevel - Log level to control retry log verbosity (inherits from SDKConfig)
   *
   * @example
   * ```typescript
   * // Use defaults (3 retries, 1s delay, exponential backoff)
   * const handler = new RetryHandler();
   *
   * // Custom configuration
   * const handler = new RetryHandler({
   *   maxRetries: 5,
   *   retryDelay: 500,
   *   exponentialBackoff: true
   * });
   * ```
   */
  constructor(e, t) {
    this.config = {
      maxRetries: (e == null ? void 0 : e.maxRetries) ?? 3,
      retryDelay: (e == null ? void 0 : e.retryDelay) ?? 1e3,
      exponentialBackoff: (e == null ? void 0 : e.exponentialBackoff) ?? true
    }, this.logLevel = t ?? "warn";
  }
  /**
   * Executes an async operation with automatic retry on transient failures
   *
   * Wraps the provided operation and automatically retries on failures that
   * are likely to be transient (network errors, server errors, rate limits).
   *
   * **Retry Behavior:**
   * - Retries on: NetworkError (5xx, timeout, no status), RateLimitError (429)
   * - NO retry on: AuthenticationError, ValidationError, other 4xx errors
   * - Uses exponential backoff with jitter (if configured)
   * - Preserves and re-throws final error after max retries exhausted
   *
   * @typeParam T - The return type of the operation
   * @param operation - Async function to execute (and retry on failure)
   * @param operationName - Description of operation for logging (optional)
   * @returns The result of the successful operation
   * @throws The final error if all retry attempts are exhausted
   *
   * @example
   * ```typescript
   * // Basic usage
   * const data = await handler.executeWithRetry(
   *   async () => await api.getData(),
   *   'getData'
   * );
   *
   * // With arrow function
   * const result = await handler.executeWithRetry(
   *   () => fetch('https://api.example.com/data').then(r => r.json()),
   *   'fetch data'
   * );
   *
   * // With readonly-aware retry (recommended for SDK operations)
   * const products = await handler.executeWithRetry(
   *   () => api.getProducts(),
   *   'getProducts',
   *   { operationKey: 'products.getCardsList' }
   * );
   *
   * // Force retry for write operation (use with caution)
   * const created = await handler.executeWithRetry(
   *   () => api.createProduct(data),
   *   'createProduct',
   *   { operationKey: 'products.createCardsUpload', forceRetry: true }
   * );
   * ```
   */
  async executeWithRetry(e, t = "operation", s) {
    let i;
    for (let a = 0; a <= this.config.maxRetries; a++)
      try {
        const n = await e();
        return a > 0 && this.log("info", `Operation succeeded after ${String(a)} retries`, {
          operationName: t
        }), n;
      } catch (n) {
        if (i = n, !this.shouldRetry(n, a, s))
          throw a > 0 && this.log(
            "warn",
            `All retries exhausted for ${t} after ${String(a)} attempts`,
            {
              operationName: t,
              attempts: a,
              maxRetries: this.config.maxRetries,
              finalError: n instanceof Error ? n.message : String(n)
            }
          ), n;
        const o = this.calculateDelay(a);
        this.log(
          "info",
          `Retrying ${t} (attempt ${String(a + 1)}/${String(this.config.maxRetries)}, waiting ${String(Math.round(o))}ms)`,
          {
            operationName: t,
            attempt: a + 1,
            maxRetries: this.config.maxRetries,
            delay: Math.round(o)
          }
        ), this.log("debug", `Retry context for ${t}`, {
          operationName: t,
          attempt: a + 1,
          maxRetries: this.config.maxRetries,
          delay: Math.round(o),
          errorMessage: n instanceof Error ? n.message : String(n),
          errorType: n instanceof Error ? n.constructor.name : typeof n,
          statusCode: n instanceof V ? n.statusCode : void 0,
          isTimeout: n instanceof V ? n.isTimeout : void 0
        }), await this.sleep(o);
      }
    throw this.log("warn", `Max retries exhausted for ${t}`, {
      maxRetries: this.config.maxRetries
    }), i || new Error("Unexpected: No error captured after retry exhaustion");
  }
  /**
   * Determines if an error should be retried
   *
   * Classifies errors into retryable (transient) and non-retryable (permanent).
   *
   * **Retryable Errors:**
   * - NetworkError with 5xx status (500-599)
   * - NetworkError with timeout flag
   * - NetworkError with no status (network failure)
   * - RateLimitError (429)
   *
   * **Non-Retryable Errors:**
   * - AuthenticationError (401, 403) - invalid credentials won't fix with retry
   * - ValidationError (400, 422) - bad request data won't fix with retry
   * - Other 4xx errors - client errors are permanent failures
   * - Write operations (unless forceRetry is true) - may cause duplicate data
   *
   * @param error - The error to classify
   * @param attempt - Current attempt number (0-indexed)
   * @param options - Optional retry options with operation metadata
   * @returns true if error should be retried, false otherwise
   *
   * @private
   */
  shouldRetry(e, t, s) {
    if (t >= this.config.maxRetries || e instanceof Te || e instanceof Oe || e instanceof b)
      return false;
    if (s != null && s.operationKey) {
      const i = ps(s.operationKey);
      if (!i && !s.forceRetry)
        return this.log("info", `Skipping retry for write operation: ${s.operationKey}`, {
          operationKey: s.operationKey,
          readonly: i,
          forceRetry: s.forceRetry ?? false
        }), false;
    }
    if (e instanceof Bt)
      return true;
    if (e instanceof V) {
      const i = e.statusCode;
      return !!(!i || i === 0 || i >= 500 && i < 600 || e.isTimeout);
    }
    return false;
  }
  /**
   * Calculates the delay before the next retry attempt
   *
   * **Exponential Backoff (when enabled):**
   * - Formula: `delay = retryDelay * 2^attempt * jitter`
   * - Example: 1s → 2s → 4s → 8s (with default 1000ms retryDelay)
   *
   * **Linear Backoff (when disabled):**
   * - Formula: `delay = retryDelay * jitter`
   * - Example: 1s → 1s → 1s → 1s (constant delay)
   *
   * **Jitter:**
   * - Adds random ±10% variation to prevent thundering herd
   * - Multiple clients won't retry simultaneously after service recovery
   *
   * **Max Cap:**
   * - Delays are capped at 30 seconds to prevent excessive waits
   *
   * @param attempt - Current attempt number (0-indexed)
   * @returns Delay in milliseconds before next retry
   *
   * @example
   * ```typescript
   * // With exponentialBackoff: true, retryDelay: 1000
   * calculateDelay(0) // ~1000ms (1s * 2^0 * jitter)
   * calculateDelay(1) // ~2000ms (1s * 2^1 * jitter)
   * calculateDelay(2) // ~4000ms (1s * 2^2 * jitter)
   *
   * // With exponentialBackoff: false, retryDelay: 1000
   * calculateDelay(0) // ~1000ms
   * calculateDelay(1) // ~1000ms
   * calculateDelay(2) // ~1000ms
   * ```
   *
   * @private
   */
  calculateDelay(e) {
    let t;
    this.config.exponentialBackoff ? t = this.config.retryDelay * Math.pow(2, e) : t = this.config.retryDelay;
    const s = 1 + (Math.random() * 0.2 - 0.1);
    return t = t * s, Math.min(t, 3e4);
  }
  /**
   * Sleeps for the specified number of milliseconds
   *
   * @param ms - Milliseconds to sleep
   * @returns Promise that resolves after the delay
   *
   * @private
   */
  async sleep(e) {
    return new Promise((t) => setTimeout(t, e));
  }
  /**
   * Logs retry-related messages respecting SDK logLevel configuration
   *
   * Uses structured JSON logging format consistent with BaseClient.
   * Only emits logs when the message level meets or exceeds the configured threshold.
   *
   * @param level - Log level for this message
   * @param message - Human-readable log message
   * @param meta - Optional structured metadata to include
   *
   * @private
   */
  log(e, t, s) {
    const i = { debug: 0, info: 1, warn: 2, error: 3 };
    if (i[e] < i[this.logLevel]) return;
    ({
      // eslint-disable-next-line no-console
      debug: console.debug,
      // eslint-disable-next-line no-console
      info: console.info,
      // eslint-disable-next-line no-console
      warn: console.warn,
      // eslint-disable-next-line no-console
      error: console.error
    })[e](
      JSON.stringify({
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        level: e,
        service: "RetryHandler",
        message: t,
        ...s ?? {}
      })
    );
  }
};
var ys = {
  "general.ping": {
    requestsPerMinute: 6,
    intervalSeconds: 10,
    burstLimit: 3
  },
  "general.communicationsNews": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 10
  },
  "general.sellerInfo": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 10
  },
  "general.createInvite": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 5
  },
  "general.getUsers": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 5
  },
  "general.updateUserAccess": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 5
  },
  "general.deleteUser": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 10
  },
  // GET /api/common/v1/subscriptions — Jam subscription details
  "general.getJamSubscription": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 10
  },
  // GET /api/common/v1/rating — seller rating and review count
  "general.getSellerRating": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  }
};
var fs = {
  // === Content Standard Tier: 100 req/min, 600ms interval, burst 5 ===
  "products.contentObjectParentAll": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.contentObjectAll": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.contentObjectCharcs": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.contentDirectoryColors": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.contentDirectoryKinds": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.contentDirectoryCountries": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.contentDirectorySeasons": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.contentDirectoryVat": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.contentDirectoryTnved": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.contentTags": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.postContentTag": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.patchContentTag": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.deleteContentTag": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.postContentTagNomenclatureLink": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  // === Brands Tier: 1 req/sec (60 req/min), 1s interval, burst 5 ===
  "products.brands": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 5
  },
  "products.postContentGetCardsList": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  // === Content Exceptions Tier: 10 req/min, 6s interval, burst 5 ===
  "products.postContentCardsErrorList": {
    requestsPerMinute: 10,
    intervalSeconds: 6,
    burstLimit: 5
  },
  "products.postContentCardsUpdate": {
    requestsPerMinute: 10,
    intervalSeconds: 6,
    burstLimit: 5
  },
  "products.postContentCardsMoveNm": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.postContentCardsDeleteTrash": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.postContentCardsRecover": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.postContentCardsDelete": {
    // Sandbox-only at v3.13.1 release; rate limits assumed parity with
    // products.postContentCardsRecover (sibling operation). Re-check after WB
    // production release per WL-5 in `backlog/watch-list.md`.
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.postContentGetCardsTrash": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.contentCardsLimits": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.postContentBarcodes": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.postContentCardsUpload": {
    requestsPerMinute: 10,
    intervalSeconds: 6,
    burstLimit: 5
  },
  "products.postContentCardsUploadAdd": {
    requestsPerMinute: 10,
    intervalSeconds: 6,
    burstLimit: 5
  },
  "products.postContentMediaFile": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.postContentMediaSave": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  // === Prices & Discounts Tier ===
  // API enforces: 10 requests per 6-second window, 600ms minimum interval, burst 5
  // RateLimiter equivalent: 100 req/min (10/6s = 100/60s)
  // Server: https://discounts-prices-api.wildberries.ru
  "products.postUploadTask": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.postUploadTaskSize": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.postUploadTaskClubDiscount": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.historyTasks": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.historyGoodsTask": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.bufferTasks": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.bufferGoodsTask": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.listGoodsFilter": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.postListGoodsFilter": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.listGoodsSizeNm": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "products.quarantineGoods": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  // === Marketplace Tier (Stocks & Warehouses): 300 req/min, 200ms interval, burst 20 ===
  /** POST /api/v3/stocks/{warehouseId} — 409 response counts as 10 requests against rate limit */
  "products.postStocks": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  /** PUT /api/v3/stocks/{warehouseId} — 409 response counts as 10 requests against rate limit */
  "products.putStocks": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  /** DELETE /api/v3/stocks/{warehouseId} — 409 response counts as 10 requests against rate limit */
  "products.deleteStocks": {
    requestsPerMinute: 10,
    intervalSeconds: 6,
    burstLimit: 2,
    penaltyMultiplier: 10
  },
  "products.offices": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "products.warehouses": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "products.postWarehouses": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "products.putWarehouses": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "products.deleteWarehouses": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "products.dbwWarehousesContacts": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "products.putDbwWarehousesContacts": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  }
};
var hs = {
  // === Tier 1: General FBS — 300 req/min, 200ms interval, burst 20 (409 = 10 requests) ===
  "orders-fbs.ordersNew": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.orders": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.postOrdersStatus": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.suppliesOrdersReshipment": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.postOrdersStickers": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.postOrdersStickersCrossBorder": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.postOrdersStatusHistory": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.postOrdersClient": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.ordersMeta": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.deleteOrdersMeta": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.supplies": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.postSupplies": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.getSupply": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.deleteSupplies": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.suppliesOrders": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.patchSuppliesDeliver": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.suppliesBarcode": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.suppliesTrbx": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.postSuppliesTrbx": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.deleteSuppliesTrbx": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.postSuppliesTrbxStickers": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.passesOffices": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.passes": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.putPasses": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.deletePasses": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.patchSuppliesOrders": {
    requestsPerMinute: 1e3,
    intervalSeconds: 0.06,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  /** @deprecated Endpoint removed from API */
  "orders-fbs.postFilesOrdersExternalStickers": {
    requestsPerMinute: 10,
    intervalSeconds: 6,
    burstLimit: 5,
    penaltyMultiplier: 10
  },
  /** PATCH /api/marketplace/v3/supplies/{supplyId}/orders — Add assembly tasks to supply (bulk) */
  "orders-fbs.patchMarketplaceSuppliesOrders": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  /** GET /api/marketplace/v3/supplies/{supplyId}/order-ids — Get supply order IDs */
  "orders-fbs.getMarketplaceSuppliesOrderIds": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  // === Tier 2: Cancel Order — 100 req/min, 600ms interval, burst 20 (409 = 10 requests) ===
  "orders-fbs.patchOrdersCancel": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  // === Tier 3: Meta Attachment — 1000 req/min, 60ms interval, burst 20 (409 = 10 requests) ===
  "orders-fbs.putOrdersMetaSgtin": {
    requestsPerMinute: 1e3,
    intervalSeconds: 0.06,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.putOrdersMetaUin": {
    requestsPerMinute: 1e3,
    intervalSeconds: 0.06,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.putOrdersMetaImei": {
    requestsPerMinute: 1e3,
    intervalSeconds: 0.06,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.putOrdersMetaGtin": {
    requestsPerMinute: 1e3,
    intervalSeconds: 0.06,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.putOrdersMetaExpiration": {
    requestsPerMinute: 1e3,
    intervalSeconds: 0.06,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "orders-fbs.putOrdersMetaCustomsDeclaration": {
    requestsPerMinute: 1e3,
    intervalSeconds: 0.06,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  /** POST /api/marketplace/v3/orders/meta — Get metadata for assembly tasks (bulk)
   * Same rate limit group as GET/DELETE metadata operations */
  "orders-fbs.postMarketplaceOrdersMeta": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  // === Tier 4: Create Pass — 1 req/10min (409 = 10 requests) ===
  "orders-fbs.postPasses": {
    requestsPerMinute: 0.1,
    intervalSeconds: 600,
    burstLimit: 1,
    penaltyMultiplier: 10
  }
};
var gs = {
  "orders-fbw.acceptanceCoefficients": {
    requestsPerMinute: 6,
    intervalSeconds: 10,
    burstLimit: 6
  },
  "orders-fbw.postAcceptanceOptions": {
    requestsPerMinute: 6,
    intervalSeconds: 10,
    burstLimit: 6
  },
  "orders-fbw.warehouses": {
    requestsPerMinute: 6,
    intervalSeconds: 10,
    burstLimit: 6
  },
  "orders-fbw.transitTariffs": {
    requestsPerMinute: 6,
    intervalSeconds: 10,
    burstLimit: 10
  },
  "orders-fbw.postSupplies": {
    requestsPerMinute: 30,
    intervalSeconds: 2,
    burstLimit: 10
  },
  "orders-fbw.supplies": {
    requestsPerMinute: 30,
    intervalSeconds: 2,
    burstLimit: 10
  },
  "orders-fbw.suppliesGoods": {
    requestsPerMinute: 30,
    intervalSeconds: 2,
    burstLimit: 10
  },
  "orders-fbw.suppliesPackage": {
    requestsPerMinute: 30,
    intervalSeconds: 2,
    burstLimit: 10
  },
  // POST /api/marketplace/v3/dbw/orders/client — buyer info for DBW orders
  // Note: 409 response counts as 10 requests (penaltyMultiplier)
  "orders-fbw.getClientInfo": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  // DBW bulk endpoints — defaults inherited from `orders-fbw.getClientInfo` (the existing DBW
  // endpoint), NOT from DBS bulk endpoints (which use 60/1/10). These are best-effort estimates
  // pending the WB swagger update by task-15.5; regenerate this section when canonical limits
  // are published.
  // 409 response counts as 10 requests (penaltyMultiplier)
  "orders-fbw.deleteMetaBulkDBW": {
    requestsPerMinute: 150,
    intervalSeconds: 0.4,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  // 409 response counts as 10 requests (penaltyMultiplier)
  "orders-fbw.setSgtinBulkDBW": {
    requestsPerMinute: 500,
    intervalSeconds: 0.12,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  // 409 response counts as 10 requests (penaltyMultiplier)
  "orders-fbw.deliverBulkDBW": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  // POST /api/marketplace/v3/dbw/orders/meta/details — pre-flight metadata validation
  // 409 response counts as 10 requests (penaltyMultiplier — same as deliverBulk DBW)
  "orders-fbw.checkMetaValidationDBW": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  }
};
var bs = {
  // ============================================================================
  // T1: Assembly Read (300 req/min, 200ms interval, burst 20)
  // Core read operations, status queries, B2B info
  // ============================================================================
  /** Get new DBS orders awaiting delivery */
  "orders-dbs.getNewOrders": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  /** Get completed DBS orders with pagination */
  "orders-dbs.getOrders": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  /** Get customer contact information */
  "orders-dbs.getClientInfo": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  /** Get status info for multiple orders (bulk) */
  "orders-dbs.getStatusesBulk": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  /** Get order statuses (legacy, deprecated 13.04.2026) */
  "orders-dbs.getStatuses": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  /** Get B2B buyer information */
  "orders-dbs.getB2BInfo": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  // ============================================================================
  // T2: Status Write (60 req/min, 1s interval, burst 10)
  // Bulk and legacy status mutation operations
  // ============================================================================
  /** Confirm multiple orders (bulk) */
  "orders-dbs.confirmBulk": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 10,
    penaltyMultiplier: 10
  },
  /** Mark multiple orders as delivered (bulk) */
  "orders-dbs.deliverBulk": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 10,
    penaltyMultiplier: 10
  },
  /** Complete handover for multiple orders (bulk) */
  "orders-dbs.receiveBulk": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 10,
    penaltyMultiplier: 10
  },
  /** Reject multiple orders (bulk) */
  "orders-dbs.rejectBulk": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 10,
    penaltyMultiplier: 10
  },
  /** Cancel multiple orders (bulk) */
  "orders-dbs.cancelBulk": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 10,
    penaltyMultiplier: 10
  },
  /** Confirm single order (legacy, deprecated 13.04.2026) */
  "orders-dbs.confirm": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 10,
    penaltyMultiplier: 10
  },
  /** Mark single order as delivered (legacy, deprecated 13.04.2026) */
  "orders-dbs.deliver": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 10,
    penaltyMultiplier: 10
  },
  /** Complete handover for single order (legacy, deprecated 13.04.2026) */
  "orders-dbs.receive": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 10,
    penaltyMultiplier: 10
  },
  /** Reject single order (legacy, deprecated 13.04.2026) */
  "orders-dbs.reject": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 10,
    penaltyMultiplier: 10
  },
  /** Cancel single order (legacy, deprecated 13.04.2026) */
  "orders-dbs.cancel": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 10,
    penaltyMultiplier: 10
  },
  // ============================================================================
  // T3: Meta Read/Delete (150 req/min, 400ms interval, burst 20)
  // Metadata retrieval and deletion operations
  // ============================================================================
  /** Get order metadata */
  "orders-dbs.getMeta": {
    requestsPerMinute: 150,
    intervalSeconds: 0.4,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  /** Delete order metadata */
  "orders-dbs.deleteMeta": {
    requestsPerMinute: 150,
    intervalSeconds: 0.4,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  // ============================================================================
  // T4: Meta Set (500 req/min, 120ms interval, burst 20)
  // Shared key for all metadata set operations:
  //   setSgtin, setUin, setImei, setGtin, setCustomsDeclaration
  // ============================================================================
  /** Set order metadata (shared key for sgtin, uin, imei, gtin, customs declaration) */
  "orders-dbs.setMeta": {
    requestsPerMinute: 500,
    intervalSeconds: 0.12,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  // ============================================================================
  // T5: New Info Endpoints (300 req/min, 200ms interval, burst 20) - Story 26.1
  // ============================================================================
  /** Get paid delivery groups info */
  "orders-dbs.getGroupsInfo": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  /** Get delivery dates for orders */
  "orders-dbs.getDeliveryDates": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  // ============================================================================
  // T6: Bulk Metadata Read/Delete (150 req/min, 400ms interval, burst 20) - Story 26.2
  // ============================================================================
  /** Get metadata bulk */
  "orders-dbs.getMetaBulk": {
    requestsPerMinute: 150,
    intervalSeconds: 0.4,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  /** Delete metadata bulk */
  "orders-dbs.deleteMetaBulk": {
    requestsPerMinute: 150,
    intervalSeconds: 0.4,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  // ============================================================================
  // T7: Bulk Metadata Set (500 req/min, 120ms interval, burst 20) - Story 26.2
  // ============================================================================
  /** Set SGTIN bulk */
  "orders-dbs.setSgtinBulk": {
    requestsPerMinute: 500,
    intervalSeconds: 0.12,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  /** Set UIN bulk */
  "orders-dbs.setUinBulk": {
    requestsPerMinute: 500,
    intervalSeconds: 0.12,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  /** Set IMEI bulk */
  "orders-dbs.setImeiBulk": {
    requestsPerMinute: 500,
    intervalSeconds: 0.12,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  /** Set GTIN bulk */
  "orders-dbs.setGtinBulk": {
    requestsPerMinute: 500,
    intervalSeconds: 0.12,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  /** Set customs declaration bulk */
  "orders-dbs.setCustomsDeclarationBulk": {
    requestsPerMinute: 500,
    intervalSeconds: 0.12,
    burstLimit: 20,
    penaltyMultiplier: 10
  }
};
var vs = {
  "userManagement.createInvite": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 5
  },
  "userManagement.getUsers": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 5
  },
  "userManagement.updateAccess": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 5
  },
  "userManagement.deleteUser": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 10
  }
};
var Ss = {
  "finances.accountBalance": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  },
  "finances.supplierReportDetailByPeriod": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  },
  "finances.documentsCategories": {
    requestsPerMinute: 6,
    intervalSeconds: 10,
    burstLimit: 5
  },
  "finances.documentsList": {
    requestsPerMinute: 6,
    intervalSeconds: 10,
    burstLimit: 5
  },
  "finances.documentsDownload": {
    requestsPerMinute: 6,
    intervalSeconds: 10,
    burstLimit: 5
  },
  "finances.createDownloadAll": {
    requestsPerMinute: 1,
    intervalSeconds: 300,
    burstLimit: 5
  },
  // v1 Sales Reports (since v3.7.0) — 1 req/min per WB spec
  "finances.salesReportsList": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  },
  "finances.salesReportsDetailed": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  },
  "finances.salesReportsDetailedByReportId": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  },
  // v1 Acquiring Reports (since v3.7.0) — RU-only, 1 req/min per WB spec
  "finances.acquiringReportsList": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  },
  "finances.acquiringReportsDetailed": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  },
  "finances.acquiringReportsDetailedByReportId": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  }
};
var Ls = {
  "promotion.advPromotionCount": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 5
  },
  "promotion.postAdvPromotionAdverts": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 5
  },
  "promotion.advAuctionAdverts": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 5
  },
  "promotion.advConfig": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  },
  "promotion.postAdvBidsMin": {
    requestsPerMinute: 20,
    intervalSeconds: 3,
    burstLimit: 5
  },
  "promotion.postAdvSaveAd": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 5
  },
  "promotion.postAdvSeacatSaveAd": {
    requestsPerMinute: 5,
    intervalSeconds: 12,
    burstLimit: 5
  },
  "promotion.advSupplierSubjects": {
    requestsPerMinute: 5,
    intervalSeconds: 12,
    burstLimit: 5
  },
  "promotion.postAdvSupplierNms": {
    requestsPerMinute: 5,
    intervalSeconds: 12,
    burstLimit: 5
  },
  "promotion.advDelete": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 5
  },
  "promotion.postAdvRename": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 5
  },
  "promotion.advStart": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 5
  },
  "promotion.advPause": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 5
  },
  "promotion.advStop": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 5
  },
  "promotion.patchAdvBids": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 5
  },
  "promotion.putAdvAuctionPlacements": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 1
  },
  "promotion.patchAdvAuctionBids": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 5
  },
  // GET /api/advert/v0/bids/recommendations — recommended bids for product cards and search clusters (cpm only)
  "promotion.getBidsRecommendations": {
    requestsPerMinute: 5,
    intervalSeconds: 12,
    burstLimit: 5
  },
  "promotion.advBalance": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 5
  },
  "promotion.advBudget": {
    requestsPerMinute: 240,
    intervalSeconds: 0.25,
    burstLimit: 4
  },
  "promotion.postAdvBudgetDeposit": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 5
  },
  "promotion.advUpd": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 5
  },
  "promotion.advPayments": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 5
  },
  "promotion.advSearchSetPlus": {
    requestsPerMinute: 10,
    intervalSeconds: 6,
    burstLimit: 5
  },
  "promotion.postAdvSearchSetPlus": {
    requestsPerMinute: 10,
    intervalSeconds: 6,
    burstLimit: 5
  },
  "promotion.postAdvSearchSetExcluded": {
    requestsPerMinute: 120,
    intervalSeconds: 0.5,
    burstLimit: 2
  },
  "promotion.postAdvAutoSetExcluded": {
    requestsPerMinute: 10,
    intervalSeconds: 6,
    burstLimit: 5
  },
  "promotion.advAutoGetnmtoadd": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 5
  },
  "promotion.postAdvAutoUpdatenm": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 5
  },
  "promotion.patchAdvAuctionNms": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 1
  },
  "promotion.advCount": {
    requestsPerMinute: 600,
    intervalSeconds: 0.1,
    burstLimit: 10
  },
  "promotion.advAdverts": {
    requestsPerMinute: 600,
    intervalSeconds: 0.1,
    burstLimit: 10
  },
  "promotion.advAdvert": {
    requestsPerMinute: 600,
    intervalSeconds: 0.1,
    burstLimit: 10
  },
  "promotion.postAdvFullstats": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 5
  },
  "promotion.advFullstats": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 1
  },
  "promotion.advAutoStatWords": {
    requestsPerMinute: 240,
    intervalSeconds: 0.25,
    burstLimit: 4
  },
  "promotion.advStatWords": {
    requestsPerMinute: 240,
    intervalSeconds: 0.25,
    burstLimit: 4
  },
  "promotion.advStatsKeywords": {
    requestsPerMinute: 240,
    intervalSeconds: 0.25,
    burstLimit: 4
  },
  "promotion.postAdvStats": {
    requestsPerMinute: 600,
    intervalSeconds: 0.1,
    burstLimit: 10
  },
  "promotion.calendarPromotions": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "promotion.calendarPromotionsDetails": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "promotion.calendarPromotionsNomenclatures": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  "promotion.postCalendarPromotionsUpload": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 5
  },
  // ============================================================================
  // Search Clusters (NormQuery) Rate Limits - NEW in Feb 2026
  // ============================================================================
  /** POST /adv/v0/normquery/stats - Get search cluster statistics */
  "promotion.normqueryStats": {
    requestsPerMinute: 10,
    intervalSeconds: 6,
    burstLimit: 20
  },
  /** POST /adv/v0/normquery/get-bids - Get current bids for clusters */
  "promotion.normqueryGetBids": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 10
  },
  /** POST /adv/v0/normquery/bids - Set bids for clusters */
  "promotion.normquerySetBids": {
    requestsPerMinute: 120,
    intervalSeconds: 0.5,
    burstLimit: 4
  },
  /** DELETE /adv/v0/normquery/bids - Delete cluster bids */
  "promotion.normqueryDeleteBids": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 10
  },
  /** POST /adv/v0/normquery/get-minus - Get minus-phrases */
  "promotion.normqueryGetMinus": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 10
  },
  /** POST /adv/v0/normquery/set-minus - Set minus-phrases */
  "promotion.normquerySetMinus": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 10
  },
  // ============================================================================
  // V2 Replacement Endpoints Rate Limits - NEW in Feb 2026
  // ============================================================================
  /** GET /api/advert/v2/adverts - Get adverts (replaces deprecated v1) */
  "promotion.advertsV2": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 5
  },
  /** POST /api/advert/v1/bids/min - Get min bids (new API path) */
  "promotion.bidsMinV1": {
    requestsPerMinute: 20,
    intervalSeconds: 3,
    burstLimit: 5
  },
  /** PATCH /api/advert/v1/bids - Update bids (new API path) */
  "promotion.bidsV1": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 10
  },
  // ============================================================================
  // Campaign Management Rate Limits - NEW
  // ============================================================================
  /** GET /adv/v1/promotion/count - Get campaign count and list */
  "promotion.getCampaignCount": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 5
  },
  /** POST /adv/v2/seacat/save-ad - Create campaign */
  "promotion.createCampaign": {
    requestsPerMinute: 5,
    intervalSeconds: 12,
    burstLimit: 5
  },
  /** GET /adv/v1/supplier/subjects - Get supplier subjects */
  "promotion.getSupplierSubjects": {
    requestsPerMinute: 5,
    intervalSeconds: 12,
    burstLimit: 5
  },
  /** POST /adv/v2/supplier/nms - Get supplier product cards */
  "promotion.getSupplierNms": {
    requestsPerMinute: 5,
    intervalSeconds: 12,
    burstLimit: 5
  },
  /** GET /adv/v0/start - Start campaign */
  "promotion.startCampaign": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 5
  },
  /** GET /adv/v0/pause - Pause campaign */
  "promotion.pauseCampaign": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 5
  },
  // ============================================================================
  // New Methods Rate Limits - Feb 2026
  // ============================================================================
  /** PATCH /api/advert/v1/bids - Update bids with bid_kopecks */
  "promotion.updateBids": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 10
  },
  /** PATCH /adv/v0/auction/nms - Add/remove products from campaigns */
  "promotion.updateCampaignProducts": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 1
  },
  // ============================================================================
  // Aliases for New Method Names (task-54, task-55)
  // ============================================================================
  /** POST /adv/v0/normquery/get-minus - Alias for getMinusPhrases() */
  "promotion.getMinusPhrases": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 10
  },
  /** POST /adv/v0/normquery/set-minus - Alias for setMinusPhrases() */
  "promotion.setMinusPhrases": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 10
  },
  /** POST /adv/v0/normquery/stats - Alias for getSearchClusterStats() */
  "promotion.getSearchClusterStats": {
    requestsPerMinute: 10,
    intervalSeconds: 6,
    burstLimit: 20
  }
};
var ws = {
  "tariffs.tariffsCommission": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 2
  },
  "tariffs.tariffsBox": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 5
  },
  "tariffs.tariffsPallet": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 5
  },
  "tariffs.tariffsReturn": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 5
  },
  "tariffs.acceptanceCoefficients": {
    requestsPerMinute: 6,
    intervalSeconds: 10,
    burstLimit: 6
  }
};
var ks = {
  "in-store-pickup.clickCollectOrdersNew": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "in-store-pickup.patchClickCollectOrdersConfirm": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "in-store-pickup.patchClickCollectOrdersPrepare": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "in-store-pickup.postClickCollectOrdersClient": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "in-store-pickup.postClickCollectOrdersClientIdentity": {
    requestsPerMinute: 30,
    intervalSeconds: 2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "in-store-pickup.patchClickCollectOrdersReceive": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "in-store-pickup.patchClickCollectOrdersReject": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "in-store-pickup.postClickCollectOrdersStatus": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "in-store-pickup.clickCollectOrders": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "in-store-pickup.patchClickCollectOrdersCancel": {
    requestsPerMinute: 100,
    intervalSeconds: 0.6,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "in-store-pickup.clickCollectOrdersMeta": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "in-store-pickup.deleteClickCollectOrdersMeta": {
    requestsPerMinute: 300,
    intervalSeconds: 0.2,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "in-store-pickup.putClickCollectOrdersMetaSgtin": {
    requestsPerMinute: 1e3,
    intervalSeconds: 0.06,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "in-store-pickup.putClickCollectOrdersMetaUin": {
    requestsPerMinute: 1e3,
    intervalSeconds: 0.06,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "in-store-pickup.putClickCollectOrdersMetaImei": {
    requestsPerMinute: 1e3,
    intervalSeconds: 0.06,
    burstLimit: 20,
    penaltyMultiplier: 10
  },
  "in-store-pickup.putClickCollectOrdersMetaGtin": {
    requestsPerMinute: 1e3,
    intervalSeconds: 0.06,
    burstLimit: 20,
    penaltyMultiplier: 10
  }
};
var Ms = {
  /**
   * @deprecated v2 endpoint is dead (404). Wrapper delegates to postSalesFunnelProducts.
   */
  "analytics.postNmReportDetail": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 3
  },
  /**
   * @deprecated v2 endpoint is dead (404). Wrapper delegates to postSalesFunnelProductsHistory.
   */
  "analytics.postNmReportDetailHistory": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 3
  },
  /**
   * @deprecated v2 endpoint is dead (404). Wrapper delegates to postSalesFunnelGroupedHistory.
   */
  "analytics.postNmReportGroupedHistory": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 3
  },
  "analytics.nmReportDownloads": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 3
  },
  "analytics.postNmReportDownloads": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 3
  },
  "analytics.postNmReportDownloadsRetry": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 3
  },
  "analytics.nmReportDownloadsFile": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 3
  },
  "analytics.postSearchReportReport": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 3
  },
  "analytics.postSearchReportTableGroups": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 3
  },
  "analytics.postSearchReportTableDetails": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 3
  },
  "analytics.postSearchReportProductSearchTexts": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 3
  },
  "analytics.postSearchReportProductOrders": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 3
  },
  "analytics.postStocksReportProductsGroups": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 3
  },
  "analytics.postStocksReportProductsProducts": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 3
  },
  "analytics.postStocksReportProductsSizes": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 3
  },
  "analytics.postStocksReportOffices": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 3
  },
  // v1 WB Warehouses Inventory (new endpoint, replaces deprecated /api/v1/supplier/stocks)
  "analytics.postStocksReportWbWarehouses": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 1
  },
  // v3 Sales Funnel endpoints
  "analytics.postSalesFunnelProducts": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 3
  },
  "analytics.postSalesFunnelProductsHistory": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 3
  },
  "analytics.postSalesFunnelGroupedHistory": {
    requestsPerMinute: 3,
    intervalSeconds: 20,
    burstLimit: 3
  }
};
var Ps = {
  "reports.supplierIncomes": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  },
  "reports.supplierStocks": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  },
  "reports.supplierOrders": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  },
  "reports.supplierSales": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  },
  "reports.postAnalyticsExciseReport": {
    requestsPerMinute: 0,
    intervalSeconds: 1800,
    burstLimit: 10
  },
  "reports.warehouse_remains": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 5
  },
  "reports.warehouse_remainsTasksStatus": {
    requestsPerMinute: 12,
    intervalSeconds: 5,
    burstLimit: 5
  },
  "reports.warehouse_remainsTasksDownload": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  },
  "reports.analyticsWarehouseMeasurements": {
    requestsPerMinute: 5,
    intervalSeconds: 12,
    burstLimit: 1
  },
  "reports.analyticsAntifraudDetails": {
    requestsPerMinute: 0,
    intervalSeconds: 600,
    burstLimit: 10
  },
  "reports.analyticsIncorrectAttachments": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 10
  },
  "reports.analyticsGoodsLabeling": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 10
  },
  // @deprecated - endpoint removed from swagger, kept for backward compatibility
  "reports.analyticsCharacteristicsChange": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 10
  },
  "reports.acceptance_report": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  },
  "reports.acceptance_reportTasksStatus": {
    requestsPerMinute: 12,
    intervalSeconds: 5,
    burstLimit: 1
  },
  "reports.acceptance_reportTasksDownload": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  },
  "reports.paid_storage": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 5
  },
  "reports.paid_storageTasksStatus": {
    requestsPerMinute: 12,
    intervalSeconds: 5,
    burstLimit: 5
  },
  "reports.paid_storageTasksDownload": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  },
  "reports.analyticsRegionSale": {
    requestsPerMinute: 6,
    intervalSeconds: 10,
    burstLimit: 5
  },
  "reports.analyticsBrandShareBrands": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 10
  },
  "reports.analyticsBrandShareParentSubjects": {
    requestsPerMinute: 12,
    intervalSeconds: 5,
    burstLimit: 20
  },
  "reports.analyticsBrandShare": {
    requestsPerMinute: 12,
    intervalSeconds: 5,
    burstLimit: 20
  },
  "reports.analyticsBannedProductsBlocked": {
    requestsPerMinute: 6,
    intervalSeconds: 10,
    burstLimit: 6
  },
  "reports.analyticsBannedProductsShadowed": {
    requestsPerMinute: 6,
    intervalSeconds: 10,
    burstLimit: 6
  },
  "reports.analyticsGoodsReturn": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 10
  },
  // EPIC 44: New endpoints
  "reports.measurementPenalties": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  },
  "reports.warehouseMeasurementsV2": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  },
  "reports.deductions": {
    requestsPerMinute: 1,
    intervalSeconds: 60,
    burstLimit: 1
  }
};
var Cs = {
  "communications.newFeedbacksQuestions": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.questionsCountUnanswered": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.questionsCount": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.questions": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.patchQuestions": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.question": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.feedbacksCountUnanswered": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.feedbacksCount": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.feedbacks": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.supplierValuations": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.postFeedbacksActions": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.postFeedbacksAnswer": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.patchFeedbacksAnswer": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.postFeedbacksOrderReturn": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.feedback": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.feedbacksArchive": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.templates": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.postTemplates": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.patchTemplates": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.deleteTemplates": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.sellerChats": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 10
  },
  "communications.sellerEvents": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 10
  },
  "communications.postSellerMessage": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 10
  },
  "communications.sellerDownload": {
    requestsPerMinute: 60,
    intervalSeconds: 1,
    burstLimit: 10
  },
  "communications.claims": {
    requestsPerMinute: 20,
    intervalSeconds: 3,
    burstLimit: 10
  },
  "communications.patchClaim": {
    requestsPerMinute: 20,
    intervalSeconds: 3,
    burstLimit: 10
  },
  "communications.getPinnedFeedbacksCount": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.getPinnedFeedbacksLimits": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.getPinnedFeedbacks": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.pinFeedback": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  },
  "communications.unpinFeedback": {
    requestsPerMinute: 180,
    intervalSeconds: 0.333,
    burstLimit: 6
  }
};
var rt = {
  ...ys,
  ...fs,
  ...hs,
  ...gs,
  ...bs,
  ...vs,
  ...Ss,
  ...Ls,
  ...ws,
  ...ks,
  ...Ms,
  ...Ps,
  ...Cs
};
var Ks = {
  general: 1e-3,
  // ~1/24h vs 1/min
  products: 0.01,
  // ~1-10/hour vs 100/min
  "orders-fbs": 3e-3,
  // ~10-50/hour vs 300/min
  "orders-dbw": 3e-3,
  "orders-dbs": 3e-3,
  "click-collect": 3e-3,
  "in-store-pickup": 3e-3,
  "orders-fbw": 0.01,
  promotion: 0.02,
  // ~1-5/hour vs 5/min
  communications: 0.05,
  tariffs: 0.01,
  analytics: 0.05,
  // ~1-10/hour vs 3/min
  reports: 0.01,
  documents: 0.01,
  finances: 0.01,
  "user-management": 0.01
};
var As = 0.01;
function qs(r) {
  const e = {};
  for (const [t, s] of Object.entries(r)) {
    const i = t.split(".")[0], a = Ks[i] ?? As;
    e[t] = {
      ...s,
      requestsPerMinute: Math.max(1, Math.ceil(s.requestsPerMinute * a)),
      burstLimit: 1
    };
  }
  return e;
}
var Rs = class {
  /**
   * Creates a new BaseClient instance
   *
   * @param config - SDK configuration object
   *
   * @throws {Error} If apiKey is not provided or invalid
   *
   * @example
   * ```typescript
   * const client = new BaseClient({
   *   apiKey: process.env.WB_API_KEY || '',
   *   timeout: 60000,
   *   logLevel: 'info'
   * });
   * ```
   */
  constructor(e) {
    this.apiKey = e.apiKey, this.logLevel = e.logLevel ?? "warn", this.axios = k.create({
      timeout: e.timeout ?? 3e4,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "WildberriesSDK/0.1.0"
      }
    }), this.setupRequestInterceptor();
    const t = e.tokenType ?? "personal", s = t === "basic" || t === "test" ? qs(rt) : rt;
    this.rateLimiter = new ds(s), this.retryHandler = new ms(e.retryConfig, this.logLevel);
  }
  /**
   * Make a GET request with automatic retry on transient failures
   *
   * Automatically retries on network errors, 5xx server errors, and 429 rate limits.
   * Does NOT retry on authentication errors (401/403) or validation errors (400/422).
   *
   * @typeParam T - Expected response type
   * @param url - Full URL for the request
   * @param options - Optional request options
   * @returns Promise resolving to typed response data
   *
   * @throws {AuthenticationError} On 401/403 responses
   * @throws {RateLimitError} On 429 responses (after retries exhausted)
   * @throws {ValidationError} On 400/422 responses
   * @throws {NetworkError} On network failures or 5xx responses (after retries exhausted)
   *
   * @example
   * ```typescript
   * interface Product {
   *   id: string;
   *   name: string;
   * }
   *
   * const product = await client.get<Product>(
   *   'https://content-api.wildberries.ru/api/v1/products/123'
   * );
   * console.log(product.name);
   * ```
   */
  async get(e, t) {
    return this.retryHandler.executeWithRetry(async () => {
      t != null && t.rateLimitKey && await this.rateLimiter.waitForSlot(t.rateLimitKey);
      try {
        this.log("debug", "GET request", { url: e });
        const s = await this.axios.get(e, {
          headers: t == null ? void 0 : t.headers,
          params: t == null ? void 0 : t.params,
          responseType: t == null ? void 0 : t.responseType,
          ...(t == null ? void 0 : t.timeout) !== void 0 && { timeout: t.timeout }
        });
        return this.log("debug", "GET response", {
          url: e,
          status: s.status
        }), s.data;
      } catch (s) {
        this.transformError(s);
      }
    }, `GET ${e}`);
  }
  /**
   * Make a POST request with automatic retry on transient failures
   *
   * Automatically retries on network errors, 5xx server errors, and 429 rate limits.
   * Does NOT retry on authentication errors (401/403) or validation errors (400/422).
   *
   * @typeParam T - Expected response type
   * @param url - Full URL for the request
   * @param data - Request body data
   * @param options - Optional request options
   * @returns Promise resolving to typed response data
   *
   * @throws {AuthenticationError} On 401/403 responses
   * @throws {RateLimitError} On 429 responses (after retries exhausted)
   * @throws {ValidationError} On 400/422 responses
   * @throws {NetworkError} On network failures or 5xx responses (after retries exhausted)
   *
   * @example
   * ```typescript
   * interface CreateProductRequest {
   *   brandName: string;
   *   title: string;
   * }
   *
   * interface CreateProductResponse {
   *   id: string;
   * }
   *
   * const result = await client.post<CreateProductResponse>(
   *   'https://content-api.wildberries.ru/api/v1/products',
   *   { brandName: 'MyBrand', title: 'New Product' }
   * );
   * ```
   */
  async post(e, t, s) {
    return this.retryHandler.executeWithRetry(async () => {
      s != null && s.rateLimitKey && await this.rateLimiter.waitForSlot(s.rateLimitKey);
      try {
        this.log("debug", "POST request", { url: e });
        const i = await this.axios.post(e, t, {
          headers: s == null ? void 0 : s.headers,
          params: s == null ? void 0 : s.params,
          ...(s == null ? void 0 : s.timeout) !== void 0 && { timeout: s.timeout }
        });
        return this.log("debug", "POST response", {
          url: e,
          status: i.status
        }), i.data;
      } catch (i) {
        this.transformError(i);
      }
    }, `POST ${e}`);
  }
  /**
   * Make a PUT request with automatic retry on transient failures
   *
   * Automatically retries on network errors, 5xx server errors, and 429 rate limits.
   * Does NOT retry on authentication errors (401/403) or validation errors (400/422).
   *
   * @typeParam T - Expected response type
   * @param url - Full URL for the request
   * @param data - Request body data
   * @param options - Optional request options
   * @returns Promise resolving to typed response data
   *
   * @throws {AuthenticationError} On 401/403 responses
   * @throws {RateLimitError} On 429 responses (after retries exhausted)
   * @throws {ValidationError} On 400/422 responses
   * @throws {NetworkError} On network failures or 5xx responses (after retries exhausted)
   *
   * @example
   * ```typescript
   * const updated = await client.put<ProductResponse>(
   *   'https://content-api.wildberries.ru/api/v1/products/123',
   *   { title: 'Updated Title' }
   * );
   * ```
   */
  async put(e, t, s) {
    return this.retryHandler.executeWithRetry(async () => {
      s != null && s.rateLimitKey && await this.rateLimiter.waitForSlot(s.rateLimitKey);
      try {
        this.log("debug", "PUT request", { url: e });
        const i = await this.axios.put(e, t, {
          headers: s == null ? void 0 : s.headers,
          params: s == null ? void 0 : s.params,
          ...(s == null ? void 0 : s.timeout) !== void 0 && { timeout: s.timeout }
        });
        return this.log("debug", "PUT response", {
          url: e,
          status: i.status
        }), i.data;
      } catch (i) {
        this.transformError(i);
      }
    }, `PUT ${e}`);
  }
  /**
   * Make a PATCH request with automatic retry on transient failures
   *
   * Automatically retries on network errors, 5xx server errors, and 429 rate limits.
   * Does NOT retry on authentication errors (401/403) or validation errors (400/422).
   *
   * @typeParam T - Expected response type
   * @param url - Full URL for the request
   * @param data - Request body data
   * @param options - Optional request options
   * @returns Promise resolving to typed response data
   *
   * @throws {AuthenticationError} On 401/403 responses
   * @throws {RateLimitError} On 429 responses (after retries exhausted)
   * @throws {ValidationError} On 400/422 responses
   * @throws {NetworkError} On network failures or 5xx responses (after retries exhausted)
   *
   * @example
   * ```typescript
   * const patched = await client.patch<ProductResponse>(
   *   'https://content-api.wildberries.ru/api/v1/products/123',
   *   { stock: 100 }
   * );
   * ```
   */
  async patch(e, t, s) {
    return this.retryHandler.executeWithRetry(async () => {
      s != null && s.rateLimitKey && await this.rateLimiter.waitForSlot(s.rateLimitKey);
      try {
        this.log("debug", "PATCH request", { url: e });
        const i = await this.axios.patch(e, t, {
          headers: s == null ? void 0 : s.headers,
          params: s == null ? void 0 : s.params,
          ...(s == null ? void 0 : s.timeout) !== void 0 && { timeout: s.timeout }
        });
        return this.log("debug", "PATCH response", {
          url: e,
          status: i.status
        }), i.data;
      } catch (i) {
        this.transformError(i);
      }
    }, `PATCH ${e}`);
  }
  /**
   * Make a DELETE request with automatic retry on transient failures
   *
   * Automatically retries on network errors, 5xx server errors, and 429 rate limits.
   * Does NOT retry on authentication errors (401/403) or validation errors (400/422).
   *
   * @typeParam T - Expected response type
   * @param url - Full URL for the request
   * @param data - Optional request body data (RFC 7231 allows DELETE with body)
   * @param options - Optional request options
   * @returns Promise resolving to typed response data
   *
   * @throws {AuthenticationError} On 401/403 responses
   * @throws {RateLimitError} On 429 responses (after retries exhausted)
   * @throws {ValidationError} On 400/422 responses
   * @throws {NetworkError} On network failures or 5xx responses (after retries exhausted)
   *
   * @example
   * ```typescript
   * // DELETE without body
   * await client.delete<void>(
   *   'https://content-api.wildberries.ru/api/v1/products/123'
   * );
   *
   * // DELETE with body (RFC 7231 allows this)
   * await client.delete<void>(
   *   'https://marketplace-api.wildberries.ru/api/v3/stocks/123',
   *   { skus: ['SKU123', 'SKU456'] }
   * );
   * ```
   */
  async delete(e, t, s) {
    return this.retryHandler.executeWithRetry(async () => {
      s != null && s.rateLimitKey && await this.rateLimiter.waitForSlot(s.rateLimitKey);
      try {
        this.log("debug", "DELETE request", { url: e, hasBody: !!t });
        const i = await this.axios.delete(e, {
          headers: s == null ? void 0 : s.headers,
          params: s == null ? void 0 : s.params,
          data: t,
          ...(s == null ? void 0 : s.timeout) !== void 0 && { timeout: s.timeout }
        });
        return this.log("debug", "DELETE response", {
          url: e,
          status: i.status
        }), i.data;
      } catch (i) {
        this.transformError(i);
      }
    }, `DELETE ${e}`);
  }
  /**
   * Set up Axios request interceptor for authentication
   *
   * Automatically injects the Authorization header on all requests
   * and logs request details in debug mode.
   *
   * @private
   */
  setupRequestInterceptor() {
    this.axios.interceptors.request.use((e) => {
      var t;
      return e.headers.Authorization = `Bearer ${this.apiKey}`, this.logLevel === "debug" && this.log("debug", "HTTP Request Interceptor", {
        method: (t = e.method) == null ? void 0 : t.toUpperCase(),
        url: e.url,
        headers: this.sanitizeHeaders(e.headers)
      }), e;
    });
  }
  /**
   * Transform Axios errors to typed SDK errors
   *
   * Maps HTTP status codes and network errors to appropriate error classes:
   * - 401/403 → AuthenticationError
   * - 429 → RateLimitError
   * - 400/422 → ValidationError
   * - 5xx → NetworkError
   * - Network failures → NetworkError
   * - All other 4xx (including **409**) → generic `WBAPIError` fallback
   *
   * **IMPORTANT — application-level error codes inside 200 OK bodies (since v3.10.2):**
   *
   * Several WB endpoints return HTTP 200 with an **application-level** error code
   * embedded in the response body (most notably `code: 409` with `detail: 'MetaValidationFail'`
   * for `ordersDBS.deliverBulk()` and `ordersFBW.deliverBulk()`). Because these arrive
   * as HTTP 200 the BaseClient does NOT throw — the body is returned to the caller intact.
   *
   * Consumers must inspect the per-order shape, not catch a thrown error. Canonical paths:
   * - `result.results[].errors[].code === 409`
   * - `result.results[].errors[].detail === 'MetaValidationFail'`
   * - `result.results[].errors[].metaDetails[]` (per-order SGTIN/IMEI/UIN validation status)
   *
   * Endpoint-level JSDoc on `deliverBulk()` and `checkMetaValidation()` documents this
   * pattern explicitly. Do NOT add `@throws` annotations referencing this 409 pattern
   * (it does not throw); use prose instead.
   *
   * If you change BaseClient to throw on HTTP 409, update every `deliverBulk()` JSDoc and
   * the corresponding error-path tests across `orders-dbs` and `orders-fbw` modules in lockstep.
   *
   * @param error - Error from Axios request
   * @throws Typed SDK error
   *
   * @private
   */
  transformError(e) {
    var l, p, f;
    if (!k.isAxiosError(e))
      throw this.log("error", "Unknown error occurred", { error: e }), new V("Unknown error occurred", false, 0, e);
    const t = e;
    if (!t.response) {
      const m = t.code === "ECONNABORTED" || t.code === "ETIMEDOUT";
      if (m) {
        const g = ((l = t.config) == null ? void 0 : l.url) ?? "unknown", d = ((p = t.config) == null ? void 0 : p.timeout) ?? "unknown";
        this.log("warn", `Request timed out: ${g} after ${String(d)}ms`, {
          url: g,
          timeout: d,
          code: t.code
        });
      } else
        this.log("error", "Network error", {
          code: t.code,
          message: t.message
        });
      throw new V(
        m ? "Request timed out" : "Network error occurred",
        m,
        0,
        t
      );
    }
    const s = t.response.status, i = t.response.data;
    this.log("warn", "HTTP error response", {
      status: s,
      url: (f = t.config) == null ? void 0 : f.url
    });
    const a = t.response.headers["content-type"], o = (typeof a == "string" ? a : "").includes("application/problem+json"), u = this.extractProblemJsonFields(i, o);
    if (s === 401 || s === 403) {
      const m = u.detail ?? u.title ?? "Authentication failed. Please verify your API key.";
      throw new Te(
        m,
        s,
        i,
        u.requestId,
        u.origin,
        u.timestamp
      );
    }
    if (s === 429) {
      const m = this.parseRetryAfter(
        t.response.headers["retry-after"]
      ), g = u.detail ?? u.title ?? `Rate limit exceeded. Retry after ${m.toString()}ms`;
      throw new Bt(
        g,
        m,
        i,
        u.requestId,
        u.origin,
        u.timestamp
      );
    }
    if (s === 409 && i != null && typeof i == "object" && Array.isArray(i.metaDetails)) {
      const m = i, g = typeof m.message == "string" ? m.message : u.detail ?? u.title ?? "Meta validation failed", d = typeof m.code == "string" ? m.code : "Unknown", h = m.metaDetails;
      throw new Oe(
        g,
        d,
        h,
        i,
        u.requestId,
        u.origin,
        u.timestamp
      );
    }
    if (s === 400 || s === 422) {
      const m = this.extractFieldErrors(i), g = u.detail ?? u.title ?? "Validation failed";
      throw new b(g, m, s, i, u.requestId);
    }
    throw s >= 500 ? new V(`Server error: ${s.toString()}`, false, s, t) : new R(
      `HTTP error ${s.toString()}`,
      s,
      i,
      u.requestId,
      u.origin,
      u.timestamp
    );
  }
  /**
   * Parse Retry-After header to milliseconds
   *
   * @param header - Retry-After header value (in seconds)
   * @returns Retry delay in milliseconds
   *
   * @private
   */
  parseRetryAfter(e) {
    if (!e) return 5e3;
    const t = parseInt(e, 10);
    return isNaN(t) ? 5e3 : t * 1e3;
  }
  /**
   * Extract RFC 7807 problem+json fields from response data.
   *
   * Handles both `application/problem+json` and `application/json` responses
   * that contain RFC 7807-shaped bodies (with title, detail, etc.).
   *
   * @param responseData - API response body
   * @param isProblemJson - Whether the Content-Type is application/problem+json
   * @returns Extracted problem fields with string-safe values
   *
   * @private
   */
  extractProblemJsonFields(e, t) {
    const s = {};
    if (!e || typeof e != "object")
      return s;
    const i = e, a = typeof i.title == "string" || typeof i.detail == "string";
    return !t && !a ? s : {
      title: typeof i.title == "string" ? i.title : void 0,
      detail: typeof i.detail == "string" ? i.detail : void 0,
      code: typeof i.code == "string" ? i.code : void 0,
      requestId: typeof i.requestId == "string" ? i.requestId : void 0,
      origin: typeof i.origin == "string" ? i.origin : void 0,
      status: typeof i.status == "number" ? i.status : void 0,
      statusText: typeof i.statusText == "string" ? i.statusText : void 0,
      timestamp: typeof i.timestamp == "string" ? i.timestamp : void 0
    };
  }
  /**
   * Extract field-level validation errors from API response
   *
   * @param responseData - API response data
   * @returns Field errors map or undefined
   *
   * @private
   */
  extractFieldErrors(e) {
    if (e && typeof e == "object" && "errors" in e && e.errors && typeof e.errors == "object")
      return e.errors;
  }
  /**
   * Log message with structured format and sanitization
   *
   * Only logs if message level meets or exceeds configured logLevel.
   * Automatically sanitizes sensitive information (API keys, PII).
   *
   * @param level - Log level
   * @param message - Log message
   * @param meta - Optional metadata
   *
   * @private
   */
  log(e, t, s) {
    const i = { debug: 0, info: 1, warn: 2, error: 3 }, a = i[this.logLevel];
    if (i[e] < a) return;
    const o = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level: e,
      service: "WildberriesSDK",
      message: t,
      meta: this.sanitizeMeta(s)
    };
    ({
      // eslint-disable-next-line no-console
      debug: console.debug,
      // eslint-disable-next-line no-console
      info: console.info,
      // eslint-disable-next-line no-console
      warn: console.warn,
      // eslint-disable-next-line no-console
      error: console.error
    })[e](JSON.stringify(o));
  }
  /**
   * Sanitize metadata to remove sensitive information
   *
   * @param meta - Raw metadata object
   * @returns Sanitized metadata
   *
   * @private
   */
  sanitizeMeta(e) {
    if (e)
      try {
        const t = JSON.parse(JSON.stringify(e));
        if (t && typeof t == "object" && "headers" in t && t.headers && typeof t.headers == "object") {
          const s = t.headers;
          "Authorization" in s && (s.Authorization = "Bearer ***");
        }
        return t;
      } catch {
        return;
      }
  }
  /**
   * Sanitize headers for logging
   *
   * @param headers - Request headers
   * @returns Sanitized headers
   *
   * @private
   */
  sanitizeHeaders(e) {
    const t = { ...e };
    return t.Authorization && (t.Authorization = "Bearer ***"), t;
  }
};
var Bs = class {
  constructor(e) {
    this.client = e;
  }
  /**
   * Проверка подключения к WB API
   *
   * Метод проверяет три вещи:
   * 1. Запрос доходит до WB API
   * 2. Валидность токена (не истёк, не отозван)
   * 3. Совпадение категории токена и сервиса
   *
   * Метод НЕ предназначен для проверки доступности конкретного сервиса.
   * Для каждой категории API используется свой домен:
   *
   * | Категория | Домен |
   * | --- | --- |
   * | Контент | content-api.wildberries.ru |
   * | Маркетплейс | marketplace-api.wildberries.ru |
   * | Статистика | statistics-api.wildberries.ru |
   * | Аналитика | seller-analytics-api.wildberries.ru |
   * | Рекомендации | recommend-api.wildberries.ru |
   * | Вопросы и отзывы | feedbacks-api.wildberries.ru |
   * | Цены и скидки | discounts-prices-api.wildberries.ru |
   * | Продвижение | advert-api.wildberries.ru |
   * | Чат с покупателями | buyer-chat-api.wildberries.ru |
   * | Тарифы | common-api.wildberries.ru |
   * | Общее | common-api.wildberries.ru |
   * | Возвраты покупателям | returns-api.wildberries.ru |
   * | Документы | document-api.wildberries.ru |
   * | Финансы | finance-api.wildberries.ru |
   *
   * Rate limit: Максимум 3 запроса за 30 секунд (6 req/min, 10s interval, burst 3)
   *
   * @readonly
   * @returns Ответ с временной меткой и статусом подключения
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/api-information#tag/Proverka-podklyucheniya-k-WB-API}
   * @example
   * ```typescript
   * const result = await sdk.general.ping();
   * console.log(result.Status); // 'OK'
   * ```
   */
  async ping() {
    return this.client.get("https://common-api.wildberries.ru/ping", {
      rateLimitKey: "general.ping"
    });
  }
  /**
   * Получение новостей портала продавцов
   *
   * Возвращает список новостей портала продавцов Wildberries.
   * В запросе необходимо указать один из параметров: `from` (дата) или `fromID` (ID новости).
   * Максимум 100 новостей за один запрос.
   *
   * Rate limit:
   * | Период | Лимит | Интервал | Всплеск |
   * | --- | --- | --- | --- |
   * | 1 мин | 1 запрос | 1 мин | 10 запросов |
   *
   * @readonly
   * @param [options] - Параметры запроса
   * @param [options.from] - Дата, от которой необходимо выдать новости (формат: YYYY-MM-DD)
   * @param [options.fromID] - ID новости, начиная с которой нужно получить список
   * @returns Список новостей
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/api-information#tag/API-novostej}
   * @example
   * ```typescript
   * const result = await sdk.general.news({ from: '2024-01-01' });
   * for (const item of result.data) {
   *   console.log(item.header, item.date);
   * }
   * ```
   */
  async news(e) {
    return this.client.get(
      "https://common-api.wildberries.ru/api/communications/v2/news",
      {
        params: e ? { ...e } : void 0,
        rateLimitKey: "general.communicationsNews"
      }
    );
  }
  /**
   * Получение информации о продавце
   *
   * Возвращает наименование продавца и уникальный ID профиля продавца.
   * Для запроса подойдёт любой токен, кроме тестового контура.
   *
   * Rate limit:
   * | Период | Лимит | Интервал | Всплеск |
   * | --- | --- | --- | --- |
   * | 1 мин | 1 запрос | 1 мин | 10 запросов |
   *
   * @readonly
   * @returns Информация о продавце (наименование, ID профиля, торговая марка)
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/api-information#tag/Informaciya-o-prodavce}
   * @example
   * ```typescript
   * const seller = await sdk.general.sellerInfo();
   * console.log(seller.name, seller.sid);
   * ```
   */
  async sellerInfo() {
    return this.client.get(
      "https://common-api.wildberries.ru/api/v1/seller-info",
      {
        rateLimitKey: "general.sellerInfo"
      }
    );
  }
  /**
   * Создание приглашения для нового пользователя
   *
   * Метод создаёт приглашение для нового пользователя с настройкой доступов к разделам профиля продавца.
   * Приглашение действительно в течение ограниченного времени, указанного в ответе.
   *
   * **Авторизация:** Требуется Персональный токен (категория: Пользователи) от активного владельца профиля.
   * Доступно для всех стран продавцов.
   *
   * Rate limit:
   * | Период | Лимит | Интервал | Всплеск |
   * | --- | --- | --- | --- |
   * | 1 сек | 1 запрос | 1 сек | 5 запросов |
   *
   * @param data - Данные для создания приглашения
   * @returns Информация о созданном приглашении
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/api-information#tag/Upravlenie-polzovatelyami-prodavca}
   * @example
   * ```typescript
   * const result = await sdk.general.createInvite({
   *   invite: { phoneNumber: '79999999999', position: 'Менеджер' },
   *   access: [
   *     { code: 'balance', disabled: false },
   *     { code: 'finance', disabled: true }
   *   ]
   * });
   * console.log(result.inviteUrl);
   * ```
   */
  async createInvite(e) {
    return this.client.post(
      "https://user-management-api.wildberries.ru/api/v1/invite",
      e,
      { rateLimitKey: "general.createInvite" }
    );
  }
  /**
   * Получение списка пользователей продавца
   *
   * Возвращает список пользователей профиля продавца с их правами доступа.
   * Можно фильтровать по активным пользователям или только приглашённым.
   *
   * **Авторизация:** Требуется Персональный токен (категория: Пользователи) от активного владельца профиля.
   * Доступно для всех стран продавцов.
   *
   * Rate limit:
   * | Период | Лимит | Интервал | Всплеск |
   * | --- | --- | --- | --- |
   * | 1 сек | 1 запрос | 1 сек | 5 запросов |
   *
   * @readonly
   * @param [params] - Параметры запроса
   * @param [params.limit] - Количество пользователей в ответе (макс. 100, по умолчанию 100)
   * @param [params.offset] - Количество элементов для пропуска (по умолчанию 0)
   * @param [params.isInviteOnly] - true - только приглашённые, false - только активные
   * @returns Список пользователей с общим количеством
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/api-information#tag/Upravlenie-polzovatelyami-prodavca}
   * @example
   * ```typescript
   * const result = await sdk.general.getUsers({ limit: 50 });
   * console.log(`Total users: ${result.total}`);
   * for (const user of result.users) {
   *   console.log(user.firstName, user.email);
   * }
   * ```
   */
  async getUsers(e) {
    return this.client.get(
      "https://user-management-api.wildberries.ru/api/v1/users",
      {
        params: e ? { ...e } : void 0,
        rateLimitKey: "general.getUsers"
      }
    );
  }
  /**
   * Изменение доступов пользователей
   *
   * Обновляет права доступа для одного или нескольких пользователей профиля продавца.
   * Можно изменить доступ к различным разделам: баланс, финансы, документы и др.
   *
   * **Авторизация:** Требуется Персональный токен (категория: Пользователи) от активного владельца профиля.
   * Доступно для всех стран продавцов.
   *
   * Rate limit:
   * | Период | Лимит | Интервал | Всплеск |
   * | --- | --- | --- | --- |
   * | 1 сек | 1 запрос | 1 сек | 5 запросов |
   *
   * @param data - Данные для обновления доступов
   * @returns void
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/api-information#tag/Upravlenie-polzovatelyami-prodavca}
   * @example
   * ```typescript
   * await sdk.general.updateUserAccess({
   *   usersAccesses: [
   *     {
   *       userId: 12345,
   *       access: [
   *         { code: 'balance', disabled: true },
   *         { code: 'finance', disabled: false }
   *       ]
   *     }
   *   ]
   * });
   * ```
   */
  async updateUserAccess(e) {
    await this.client.put(
      "https://user-management-api.wildberries.ru/api/v1/users/access",
      e,
      { rateLimitKey: "general.updateUserAccess" }
    );
  }
  /**
   * Удаление пользователя
   *
   * Удаляет пользователя из профиля продавца по его ID.
   * Удалённый пользователь теряет доступ ко всем разделам профиля.
   *
   * **Авторизация:** Требуется Персональный токен (категория: Пользователи) от активного владельца профиля.
   * Доступно для всех стран продавцов.
   *
   * Rate limit:
   * | Период | Лимит | Интервал | Всплеск |
   * | --- | --- | --- | --- |
   * | 1 сек | 1 запрос | 1 сек | 10 запросов |
   *
   * @param deletedUserID - ID пользователя для удаления
   * @returns void
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/api-information#tag/Upravlenie-polzovatelyami-prodavca}
   * @example
   * ```typescript
   * await sdk.general.deleteUser(12345);
   * ```
   */
  async deleteUser(e) {
    await this.client.delete(
      "https://user-management-api.wildberries.ru/api/v1/user",
      {},
      {
        params: { deletedUserID: e },
        rateLimitKey: "general.deleteUser"
      }
    );
  }
  /**
   * Определение тарифа подписки Джем (Jam) через пробные запросы
   *
   * @deprecated Используйте {@link getJamSubscription} вместо этого метода.
   * Прямой API `GET /api/common/v1/subscriptions` не требует nmIds и не тратит квоту аналитики.
   * Этот probe-метод сохранён как fallback для случаев, когда нет Сервисного токена.
   *
   * Определяет тариф через пробные запросы к аналитическому эндпоинту
   * поисковых запросов товара (`/api/v2/search-report/product/search-texts`),
   * используя разные значения `limit`:
   *
   * 1. Запрос с `limit: 31` (выше лимита стандартного тарифа = 30)
   *    - **200** → тариф «Продвинутый» (advanced)
   *    - **400** → не продвинутый → продолжаем
   * 2. Запрос с `limit: 1`
   *    - **200** → тариф «Стандартный» (standard)
   *    - **400** → подписка Джем отсутствует (none)
   *
   * Ошибки аутентификации, превышения лимитов и сетевые ошибки не перехватываются
   * и пробрасываются вызывающему коду.
   *
   * Rate limit: Uses the same quota as `analytics.createProductSearchText`
   * (3 requests/minute, 20-second interval, burst 3).
   * Each call makes 1–2 probe requests.
   *
   * @param params - Parameters containing nmIds for the probe
   * @param params.nmIds - One or more WB article IDs to use in the probe
   * @returns Jam subscription status with detected tier and metadata
   * @throws {ValidationError} When nmIds array is empty
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {NetworkError} When network request fails or times out
   *
   * @example
   * ```typescript
   * const status = await sdk.general.getJamSubscriptionStatus({ nmIds: [12345678] });
   *
   * switch (status.tier) {
   *   case 'advanced':
   *     console.log('Advanced Jam — limit up to 50');
   *     break;
   *   case 'standard':
   *     console.log('Standard Jam — limit up to 30');
   *     break;
   *   case 'none':
   *     console.log('No Jam subscription');
   *     break;
   * }
   * ```
   */
  async getJamSubscriptionStatus(e) {
    if (e.nmIds.length === 0)
      throw new b("nmIds must be a non-empty array");
    const t = "https://seller-analytics-api.wildberries.ru/api/v2/search-report/product/search-texts", s = "analytics.postSearchReportProductSearchTexts", a = new Date(Date.now() - 864e5).toISOString().slice(0, 10), n = (u) => ({
      currentPeriod: { start: a, end: a },
      nmIds: e.nmIds,
      topOrderBy: "openCard",
      orderBy: { field: "avgPosition", mode: "asc" },
      limit: u
    });
    let o = 0;
    try {
      return o++, await this.client.post(t, n(31), { rateLimitKey: s }), this.buildResult("advanced", o);
    } catch (u) {
      if (!(u instanceof b))
        throw u;
    }
    try {
      return o++, await this.client.post(t, n(1), { rateLimitKey: s }), this.buildResult("standard", o);
    } catch (u) {
      if (!(u instanceof b))
        throw u;
      return this.buildResult("none", o);
    }
  }
  /** Build a JamSubscriptionStatus result */
  buildResult(e, t) {
    return {
      tier: e,
      checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
      probeCallsMade: t
    };
  }
  /**
   * Получение информации о подписке Джем (Jam)
   *
   * Возвращает подробную информацию о подписке Джем продавца:
   * даты активации и окончания, уровень подписки, способ оформления и статус.
   *
   * Если продавец никогда не подключал подписку, возвращается пустой объект (200).
   *
   * **Авторизация:** Сервисный токен любой категории.
   *
   * Rate limit: 1 request per minute, 1 min interval, burst 10
   *
   * @returns Jam subscription details (empty object if never subscribed)
   * @throws {AuthenticationError} When API key is invalid or not a Service token (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {NetworkError} When network request fails or times out
   * @since 3.5.0
   * @see {@link https://dev.wildberries.ru/docs/openapi/api-information#tag/Informaciya-o-prodavce/operation/getCommonV1Subscriptions}
   * @example
   * ```typescript
   * const jam = await sdk.general.getJamSubscription();
   * if (jam.state === 'active') {
   *   console.log(`Jam ${jam.level} active until ${jam.till}`);
   *   console.log(`Source: ${jam.activationSource}, since: ${jam.since}`);
   * } else if (jam.state) {
   *   console.log(`Jam inactive (state: ${jam.state})`);
   * } else {
   *   console.log('Never subscribed to Jam');
   * }
   * ```
   */
  async getJamSubscription() {
    return this.client.get(
      "https://common-api.wildberries.ru/api/common/v1/subscriptions",
      { rateLimitKey: "general.getJamSubscription" }
    );
  }
  /**
   * Получить рейтинг продавца и количество отзывов
   *
   * Возвращает пользовательский рейтинг продавца и общее количество отзывов.
   *
   * **Авторизация:** Сервисный токен категории **Вопросы и отзывы**.
   *
   * Rate limit: 1 request per minute, 1 min interval, burst 1
   *
   * @returns Seller rating and review count
   * @throws {AuthenticationError} When API key is invalid or wrong token category (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {NetworkError} When network request fails or times out
   * @since 3.5.0
   * @see {@link https://dev.wildberries.ru/docs/openapi/api-information#tag/Informaciya-o-prodavce/operation/getCommonV1Rating}
   * @example
   * ```typescript
   * const rating = await sdk.general.getSellerRating();
   * console.log(`Rating: ${rating.valuation} (${rating.feedbackCount} reviews)`);
   * ```
   */
  async getSellerRating() {
    return this.client.get(
      "https://common-api.wildberries.ru/api/common/v1/rating",
      { rateLimitKey: "general.getSellerRating" }
    );
  }
};
var Ke = /* @__PURE__ */ new Set();
function q(r, e) {
  Ke.has(r) || (Ke.add(r), console.warn(e));
}
function st(r, e) {
  const t = Array.isArray(r.skus) && r.skus.length > 0, s = Array.isArray(r.chrtIds) && r.chrtIds.length > 0, i = Array.isArray(r.chrtIds) && r.chrtIds.length === 0;
  if (t && !s) {
    if (q(
      `products.${e}:legacy-skus-call`,
      `products.${e}: the \`skus\` parameter is deprecated. WB API will reject requests with \`skus\` after 2026-05-20 13:00 MSK with HTTP 400. Migrate to \`chrtIds\` (size IDs from POST /content/v2/get/cards/list). See docs/guides/stocks-sku-to-chrtid-migration.md.`
    ), i) {
      const { chrtIds: a, ...n } = r;
      return n;
    }
    return r;
  }
  if (t && s) {
    q(
      `products.${e}:mixed-skus-and-chrtIds`,
      `products.${e}: both \`skus\` and \`chrtIds\` provided. The SDK is sending ONLY \`chrtIds\` to WB (\`skus\` will be stripped); WB API will reject \`skus\` after 2026-05-20 13:00 MSK with HTTP 400. Remove \`skus\` from your request to avoid this warning. See docs/guides/stocks-sku-to-chrtid-migration.md.`
    );
    const { skus: a, ...n } = r;
    return n;
  }
  return r;
}
function Ts(r) {
  if (!r || !Array.isArray(r.stocks) || r.stocks.length === 0) return r;
  let e = false, t = false;
  for (const s of r.stocks) {
    const i = s.sku != null, a = s.chrtId != null;
    if (i && !a ? e = true : i && a && (t = true), e && t) break;
  }
  return e && q(
    "products.updateStock:legacy-sku-call",
    "products.updateStock: stock items with `sku` (no `chrtId`) are deprecated. WB API will reject items with `sku` after 2026-05-20 13:00 MSK with HTTP 400. Migrate each item to `chrtId` (size ID from POST /content/v2/get/cards/list). See docs/guides/stocks-sku-to-chrtid-migration.md."
  ), t ? (q(
    "products.updateStock:mixed-sku-and-chrtId",
    "products.updateStock: some items have BOTH `sku` and `chrtId`. The SDK is sending ONLY `chrtId` per item to WB (`sku` will be stripped from those items); WB API will reject `sku` after 2026-05-20 13:00 MSK with HTTP 400. Remove `sku` from items that already have `chrtId` to avoid this warning. See docs/guides/stocks-sku-to-chrtid-migration.md."
  ), {
    stocks: r.stocks.map((s) => {
      if (s.chrtId != null && s.sku != null) {
        const { sku: i, ...a } = s;
        return a;
      }
      return s;
    })
  }) : r;
}
var Os = class {
  constructor(e) {
    this.client = e;
  }
  /**
   * Родительские категории товаров
   *
   * Returns parent category names and IDs for product card creation (e.g., Electronics, Household chemicals).
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @param [options] - Query parameters
   * @param [options.locale] - Language locale (e.g., 'ru', 'en')
   * @returns Parent categories list
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.getParentAll({ locale: 'ru' });
   * console.log(result.data); // Parent categories array
   * ```
   */
  async getParentAll(e) {
    return this.client.get(
      "https://content-api.wildberries.ru/content/v2/object/parent/all",
      {
        params: e,
        rateLimitKey: "products.contentObjectParentAll"
      }
    );
  }
  /**
   * Список предметов
   *
   * Returns parent category names and their subjects with IDs (e.g., category "Toys" contains "Kaleidoscopes", "Dolls", "Balls").
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @param [options] - Query parameters
   * @param [options.locale] - Language locale (e.g., 'ru', 'en')
   * @param [options.name] - Subject name filter
   * @param [options.limit] - Number of items to return
   * @param [options.offset] - Items offset
   * @param [options.parentID] - Parent category ID filter
   * @returns List of subjects with their parent categories
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.getObjectAll({ parentID: 306, locale: 'ru', limit: 50 });
   * console.log(result.data); // [{ subjectID, parentID, subjectName, parentName }]
   * ```
   */
  async getObjectAll(e) {
    return this.client.get("https://content-api.wildberries.ru/content/v2/object/all", {
      params: e,
      rateLimitKey: "products.contentObjectAll"
    });
  }
  /**
   * Характеристики предмета
   *
   * Returns characteristic parameters for a subject: names, data types, units of measure, etc.
   * Use separate methods for Color, Gender, Country, Season, VAT, and TNVED values.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @param subjectId - ID предмета
   * @param [options] - Query parameters
   * @param [options.locale] - Language locale (e.g., 'ru', 'en')
   * @returns Subject characteristics list
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.getObjectCharc(105, { locale: 'ru' });
   * console.log(result.data); // [{ charcID, name, required, unitName, charcType }]
   * ```
   */
  async getObjectCharc(e, t) {
    return this.client.get(`https://content-api.wildberries.ru/content/v2/object/charcs/${e}`, {
      params: t,
      rateLimitKey: "products.contentObjectCharcs"
    });
  }
  /**
   * Цвет
   *
   * Returns possible values for the "Color" product characteristic.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @param [options] - Query parameters
   * @param [options.locale] - Language locale (e.g., 'ru', 'en')
   * @returns Available color values
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.getDirectoryColors({ locale: 'ru' });
   * console.log(result.data); // Available color values
   * ```
   */
  async getDirectoryColors(e) {
    return this.client.get(
      "https://content-api.wildberries.ru/content/v2/directory/colors",
      {
        params: e,
        rateLimitKey: "products.contentDirectoryColors"
      }
    );
  }
  /**
   * Пол
   *
   * Returns possible values for the "Gender" product characteristic.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @param [options] - Query parameters
   * @param [options.locale] - Language locale (e.g., 'ru', 'en')
   * @returns Available gender values
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.getDirectoryKinds({ locale: 'ru' });
   * console.log(result.data); // ['Мужской', 'Женский', 'Унисекс']
   * ```
   */
  async getDirectoryKinds(e) {
    return this.client.get("https://content-api.wildberries.ru/content/v2/directory/kinds", {
      params: e,
      rateLimitKey: "products.contentDirectoryKinds"
    });
  }
  /**
   * Страна производства
   *
   * Returns possible values for the "Country of manufacture" product characteristic.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @param [options] - Query parameters
   * @param [options.locale] - Language locale (e.g., 'ru', 'en')
   * @returns Available country values
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.getDirectoryCountries({ locale: 'ru' });
   * console.log(result.data); // Available country values
   * ```
   */
  async getDirectoryCountries(e) {
    return this.client.get(
      "https://content-api.wildberries.ru/content/v2/directory/countries",
      {
        params: e,
        rateLimitKey: "products.contentDirectoryCountries"
      }
    );
  }
  /**
   * Сезон
   *
   * Returns possible values for the "Season" product characteristic.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @param [options] - Query parameters
   * @param [options.locale] - Language locale (e.g., 'ru', 'en')
   * @returns Available season values
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.getDirectorySeasons({ locale: 'ru' });
   * console.log(result.data); // ['Лето', 'Зима', 'Демисезон', 'Всесезон']
   * ```
   */
  async getDirectorySeasons(e) {
    return this.client.get("https://content-api.wildberries.ru/content/v2/directory/seasons", {
      params: e,
      rateLimitKey: "products.contentDirectorySeasons"
    });
  }
  /**
   * Ставка НДС
   *
   * Returns possible values for the "VAT rate" product characteristic.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @param [options] - Query parameters
   * @param [options.locale] - Language locale (e.g., 'ru', 'en')
   * @returns Available VAT rate values
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.getDirectoryVat({ locale: 'ru' });
   * console.log(result.data); // Available VAT rate values
   * ```
   */
  async getDirectoryVat(e) {
    return this.client.get("https://content-api.wildberries.ru/content/v2/directory/vat", {
      params: e,
      rateLimitKey: "products.contentDirectoryVat"
    });
  }
  /**
   * ТНВЭД-код
   *
   * Returns list of TNVED codes by subject ID and optional code fragment search.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @param [options] - Query parameters
   * @param options.subjectID - Subject ID (required)
   * @param [options.search] - TNVED code fragment to search
   * @param [options.locale] - Language locale (e.g., 'ru', 'en')
   * @returns TNVED codes with KIZ marking flag
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.getDirectoryTnved({ subjectID: 105, search: 6403 });
   * console.log(result.data); // [{ tnved: '6403919100', isKiz: true }]
   * ```
   */
  async getDirectoryTnved(e) {
    return this.client.get("https://content-api.wildberries.ru/content/v2/directory/tnved", {
      params: e,
      rateLimitKey: "products.contentDirectoryTnved"
    });
  }
  /**
   * Бренды
   *
   * Метод возвращает список брендов по ID предмета.
   * Используйте курсорную пагинацию с параметром `next` для получения всех результатов.
   *
   * Rate limit: 1 запрос в секунду, всплеск 5
   *
   * @readonly
   * @param subjectId - ID предмета
   * @param [next] - Курсор пагинации из предыдущего ответа
   * @returns Пагинированный список брендов с общим количеством
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Kategorii-predmety-i-harakteristiki}
   * @example
   * ```typescript
   * // Получить первую страницу брендов для предмета 1234
   * const result = await sdk.products.getBrands(1234);
   * console.log(`Всего брендов: ${result.total}`);
   *
   * // Пагинация по всем брендам
   * let next: number | undefined;
   * do {
   *   const page = await sdk.products.getBrands(1234, next);
   *   page.brands.forEach(b => console.log(b.name));
   *   next = page.next;
   * } while (next);
   * ```
   */
  async getBrands(e, t) {
    return this.client.get(
      "https://content-api.wildberries.ru/api/content/v1/brands",
      {
        params: { subjectId: e, ...t !== void 0 && { next: t } },
        rateLimitKey: "products.brands"
      }
    );
  }
  /**
   * Список ярлыков
   *
   * Returns all seller tags for grouping and filtering products.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @returns Seller tags list
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.getContentTags();
   * console.log(result.data); // Seller tags array
   * ```
   */
  async getContentTags() {
    return this.client.get(
      "https://content-api.wildberries.ru/content/v2/tags",
      {
        rateLimitKey: "products.contentTags"
      }
    );
  }
  /**
   * Создание ярлыка
   *
   * Creates a seller tag. Max 15 tags per seller, max 15 characters per tag name.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @param data - Tag creation data
   * @param [data.color] - Tag color
   * @param [data.name] - Tag name (max 15 characters)
   * @returns Creation result
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.createContentTag({ color: '#ff0000', name: 'Sale' });
   * console.log(result);
   * ```
   */
  async createContentTag(e) {
    return this.client.post(
      "https://content-api.wildberries.ru/content/v2/tag",
      e,
      { rateLimitKey: "products.postContentTag" }
    );
  }
  /**
   * Изменение ярлыка
   *
   * Replaces tag data: name and color.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @param id - Числовой ID ярлыка
   * @param data - Tag update data
   * @param [data.color] - New tag color
   * @param [data.name] - New tag name
   * @returns Update result
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.updateContentTag(42, { color: '#00ff00', name: 'New Arrivals' });
   * console.log(result);
   * ```
   */
  async updateContentTag(e, t) {
    return this.client.patch(
      `https://content-api.wildberries.ru/content/v2/tag/${e}`,
      t,
      { rateLimitKey: "products.patchContentTag" }
    );
  }
  /**
   * Удаление ярлыка
   *
   * Deletes a tag from the seller's tag list.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @param id - Числовой ID ярлыка
   * @returns Deletion result
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.deleteContentTag(42);
   * console.log(result);
   * ```
   */
  async deleteContentTag(e) {
    return this.client.delete(
      `https://content-api.wildberries.ru/content/v2/tag/${e}`,
      void 0,
      { rateLimitKey: "products.deleteContentTag" }
    );
  }
  /**
   * Управление ярлыками в карточке товара
   *
   * Adds or removes tags from a product card. Max 15 tags per card.
   * Removing a tag from a card does not delete it from the seller's tag list.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @param data - Tag link data
   * @param [data.nmID] - Product card nomenclature ID
   * @param [data.tagsIDs] - Array of tag IDs to link/unlink
   * @returns Link result
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.createNomenclatureLink({ nmID: 12345678, tagsIDs: [1, 2, 3] });
   * console.log(result);
   * ```
   */
  async createNomenclatureLink(e) {
    return this.client.post(
      "https://content-api.wildberries.ru/content/v2/tag/nomenclature/link",
      e,
      { rateLimitKey: "products.postContentTagNomenclatureLink" }
    );
  }
  /**
   * Список карточек товаров
   *
   * Returns a paginated list of product cards. Trashed cards are excluded; use getTrashedCards() instead.
   * Use cursor-based pagination with updatedAt and nmID from the response cursor to fetch more than 100 cards.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * ⚠️ **Deadline 2026-06-16**: WB changes the `withPhoto` filter schema.
   * `withPhoto: 0` (or missing) currently means "only no-photo cards" but will mean
   * "ALL cards" after the deadline. A new value `withPhoto: 2` will mean "only no-photo
   * cards" (replacing the old `0` semantic). If your code passes `withPhoto: 0` to
   * filter for no-photo cards, you MUST migrate to `withPhoto: 2` (or
   * `WITH_PHOTO_FILTER.NO_PHOTO`) before 2026-06-16. See
   * `docs/guides/withphoto-semantic-migration.md` for the full migration matrix.
   *
   * @param data - Request body with settings, filters, and cursor
   * @param [options] - Query parameters
   * @param [options.locale] - Language locale (e.g., 'ru', 'en')
   * @returns Product cards with pagination cursor
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.getCardsList({
   *   settings: {
   *     cursor: { limit: 100 },
   *     filter: { withPhoto: WITH_PHOTO_FILTER.ALL },
   *   },
   * }, { locale: 'ru' });
   * console.log(result.cards); // Product cards array
   * console.log(result.cursor?.total); // Total count
   * ```
   */
  async getCardsList(e, t) {
    var i, a, n, o;
    ((a = (i = e.settings) == null ? void 0 : i.filter) == null ? void 0 : a.withPhoto) === 0 && q(
      "products.getCardsList:legacy-withphoto-zero",
      'products.getCardsList: `withPhoto: 0` will change semantics on 2026-06-16. Today it means "only cards without photo"; after the deadline it will mean "ALL cards" (any photo state). If you want "no photo only", migrate to `WITH_PHOTO_FILTER.NO_PHOTO` (= 2). If you want "all cards", use `WITH_PHOTO_FILTER.ALL` (= -1) for clarity. See docs/guides/withphoto-semantic-migration.md.'
    );
    const s = 100;
    if ((o = (n = e.settings) == null ? void 0 : n.cursor) != null && o.limit) {
      const u = e.settings.cursor.limit;
      if (u > s)
        throw new Error(
          `Invalid cursor limit: ${u}. Maximum allowed is ${s} cards per request. Use pagination to fetch all cards. See: https://salacoste.github.io/daytona-wildberries-typescript-sdk/guides/working-with-product-cards#pagination-limit-restrictions`
        );
      if (u <= 0)
        throw new Error(
          `Invalid cursor limit: ${u}. Limit must be a positive integer (recommended: ${s}).`
        );
    }
    return this.client.post("https://content-api.wildberries.ru/content/v2/get/cards/list", e, {
      params: t,
      rateLimitKey: "products.postContentGetCardsList"
    });
  }
  /**
   * Список несозданных карточек товаров с ошибками
   *
   * Returns product cards (drafts) that failed during creation or editing, with error descriptions.
   * Data is returned in batches. Use cursor pagination with updatedAt and batchUUID.
   *
   * Rate limit: 10 req/min, 6s interval, burst 5
   *
   * @param data - Request body with cursor and order settings
   * @param [options] - Query parameters
   * @param [options.locale] - Language locale (e.g., 'ru', 'en')
   * @returns Error list with pagination
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.createErrorList(
   *   { cursor: { limit: 100 }, order: { ascending: true } },
   *   { locale: 'ru' }
   * );
   * console.log(result);
   * ```
   */
  async createErrorList(e, t) {
    return this.client.post(
      "https://content-api.wildberries.ru/content/v2/cards/error/list",
      e,
      { params: t, rateLimitKey: "products.postContentCardsErrorList" }
    );
  }
  /**
   * Редактирование карточек товаров
   *
   * Updates product cards. Card is fully overwritten, so all parameters must be sent including unchanged ones.
   * Cannot edit barcodes, photos, video, or tags. Max 3000 cards per request, 10 MB max.
   * Dimensions in cm, weight in kg.
   *
   * Rate limit: 10 req/min, 6s interval, burst 5
   *
   * @param [data] - Array of product cards to update
   * @returns Update result
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.createCardsUpdate([{
   *   nmID: 12345678,
   *   vendorCode: 'ART-001',
   *   title: 'Updated Product',
   *   sizes: [{ techSize: '42', skus: ['1234567890123'] }],
   *   characteristics: [{ id: 1, value: 'Blue' }],
   * }]);
   * console.log(result);
   * ```
   */
  async createCardsUpdate(e) {
    return this.client.post(
      "https://content-api.wildberries.ru/content/v2/cards/update",
      e,
      { rateLimitKey: "products.postContentCardsUpdate" }
    );
  }
  /**
   * Объединение и разъединение карточек товаров
   *
   * Merges or splits product cards by imtID. With imtID: merge (max 30 cards, same subject only).
   * Without imtID: split (new imtID generated). Max request size 10 MB.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @param [data] - Merge/split request (with or without imtID)
   * @returns Operation result
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * // Merge cards under a single imtID
   * const result = await sdk.products.createCardsMovenm({
   *   imtID: 98765,
   *   nmIDs: [12345678, 12345679],
   * });
   * console.log(result);
   * ```
   */
  async createCardsMovenm(e) {
    return this.client.post(
      "https://content-api.wildberries.ru/content/v2/cards/moveNm",
      e,
      { rateLimitKey: "products.postContentCardsMoveNm" }
    );
  }
  /**
   * Перенос карточек товаров в корзину
   *
   * Moves product cards to trash. Cards are not deleted and can be recovered.
   * Cards get a new imtID after trashing. Auto-deleted after 30 days.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @param data - Request body with nmIDs to trash
   * @param [data.nmIDs] - Array of product card IDs to move to trash
   * @returns Trash operation result
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.createDeleteTrash({ nmIDs: [12345678, 12345679] });
   * console.log(result);
   * ```
   */
  async createDeleteTrash(e) {
    return this.client.post("https://content-api.wildberries.ru/content/v2/cards/delete/trash", e, {
      rateLimitKey: "products.postContentCardsDeleteTrash"
    });
  }
  /**
   * Восстановление карточек товаров из корзины
   *
   * Restores product cards from trash. Card retains the imtID assigned when it was trashed.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @param data - Request body with nmIDs to recover
   * @param [data.nmIDs] - Array of product card IDs to restore
   * @returns Recovery result
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.createCardsRecover({ nmIDs: [12345678] });
   * console.log(result);
   * ```
   */
  async createCardsRecover(e) {
    return this.client.post("https://content-api.wildberries.ru/content/v2/cards/recover", e, {
      rateLimitKey: "products.postContentCardsRecover"
    });
  }
  /**
   * Окончательно удалить карточки товаров из корзины
   *
   * Permanently delete product cards from trash (irreversible). Frees up limit slots
   * immediately, bypassing the 30-day auto-cleanup. Complement to `createDeleteTrash()`
   * (soft, move to trash) — call this when you want to recover limit slots NOW.
   *
   * **Sandbox-only at v3.13.1 release (2026-05-15)**: WB announced this endpoint in the
   * Sandbox environment. Production availability is tracked via WL-5 in
   * `backlog/watch-list.md`. When WB confirms production release, this JSDoc marker
   * will drop in a patch release.
   *
   * Workflow:
   * ```
   * createDeleteTrash → cards → trash (soft, 30d auto-cleanup)
   *        │
   *        ├── createCardsRecover → restore
   *        ├── wait 30d            → auto-cleanup
   *        └── deleteCardsFromTrash → hard delete NOW (this method)
   * ```
   *
   * Rate limit: matches `createCardsRecover` sibling (server-side enforced)
   *
   * @param data - Request body with nmIDs to permanently delete from trash
   * @param [data.nmIDs] - Array of product card IDs currently in trash
   * @returns Standard content-api envelope (error flag, errorText, additionalErrors)
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/docs/openapi-other/sandbox-environment} (search for `cards/delete` under Работа с товарами section)
   * @see {@link ProductsModule.createDeleteTrash} — move TO trash (soft)
   * @see {@link ProductsModule.createCardsRecover} — restore from trash
   * @see {@link ProductsModule.getCardsLimits} — pre-flight limit check
   * @since 3.13.1
   * @example
   * ```typescript
   * // Free up limit slots immediately by permanently deleting trashed cards
   * const limits = await sdk.products.getCardsLimits();
   * // Treat undefined freeLimits as "no slots free" (WB may omit when zero)
   * if (limits.data && !limits.data.freeLimits) {
   *   // No free slots — clear old trash to make room
   *   const trashed = await sdk.products.getTrashedCards({
   *     settings: { cursor: { limit: 100 } },
   *   });
   *   const oldIds = trashed.cards
   *     ?.filter((c) => c.nmID !== undefined)
   *     .map((c) => c.nmID as number) ?? [];
   *
   *   if (oldIds.length > 0) {
   *     const result = await sdk.products.deleteCardsFromTrash({ nmIDs: oldIds });
   *     if (result.error) {
   *       console.error('Delete failed:', result.errorText);
   *     }
   *   }
   * }
   * ```
   */
  async deleteCardsFromTrash(e) {
    return this.client.post(
      "https://content-api.wildberries.ru/content/v1/cards/delete",
      e,
      { rateLimitKey: "products.postContentCardsDelete" }
    );
  }
  /**
   * Список карточек товаров в корзине
   *
   * Returns trashed product cards with cursor-based pagination (trashedAt + nmID).
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @param data - Request body with settings, cursor, and filter
   * @param [options] - Query parameters
   * @param [options.locale] - Language locale ('ru', 'en', 'zh')
   * @returns Trashed product cards with pagination cursor
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.getTrashedCards({
   *   settings: { cursor: { limit: 100 }, filter: { textSearch: 'shoes' } },
   * }, { locale: 'ru' });
   * console.log(result.cards); // Trashed cards array
   * ```
   */
  async getTrashedCards(e, t) {
    return this.client.post("https://content-api.wildberries.ru/content/v2/get/cards/trash", e, {
      params: t,
      rateLimitKey: "products.postContentGetCardsTrash"
    });
  }
  /**
   * Лимиты карточек товаров
   *
   * Returns free and paid limits for product card creation.
   * Available cards = (freeLimits + paidLimits) - created cards count.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @returns Card creation limits
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.getCardsLimits();
   * console.log(result.data); // { freeLimits: 1000, paidLimits: 500 }
   * ```
   */
  async getCardsLimits() {
    return this.client.get("https://content-api.wildberries.ru/content/v2/cards/limits", {
      rateLimitKey: "products.contentCardsLimits"
    });
  }
  /**
   * Генерация баркодов
   *
   * Generates unique barcodes for product card size creation. Use when you don't have your own barcodes.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @param data - Request body
   * @param [data.count] - Number of barcodes to generate
   * @returns Generated barcodes array
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.createContentBarcode({ count: 5 });
   * console.log(result.data); // ['1234567890123', '1234567890124', ...]
   * ```
   */
  async createContentBarcode(e) {
    return this.client.post("https://content-api.wildberries.ru/content/v2/barcodes", e, {
      rateLimitKey: "products.postContentBarcodes"
    });
  }
  /**
   * Создание карточек товаров
   *
   * Creates product cards asynchronously. Max 100 merged cards (imtID) with 30 cards each per request, 10 MB max.
   * Dimensions in cm, weight in kg. Check error list if 200 response but some cards were not created.
   *
   * Rate limit: 10 req/min, 6s interval, burst 5
   *
   * @param [data] - Array of product card groups to create
   * @returns Creation result
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.createCardsUpload([{
   *   subjectID: 105,
   *   variants: [{
   *     vendorCode: 'ART-001',
   *     brand: 'MyBrand',
   *     title: 'Product Name',
   *     sizes: [{ techSize: '42', skus: ['1234567890123'] }],
   *     characteristics: [{ id: 1, value: 'Blue' }],
   *   }],
   * }]);
   * console.log(result);
   * ```
   */
  async createCardsUpload(e) {
    return this.client.post(
      "https://content-api.wildberries.ru/content/v2/cards/upload",
      e,
      { rateLimitKey: "products.postContentCardsUpload" }
    );
  }
  /**
   * Создание карточек товаров с присоединением
   *
   * Creates new product cards and joins them to existing cards by imtID. Async processing, 10 MB max.
   * Dimensions in cm, weight in kg.
   *
   * Rate limit: 10 req/min, 6s interval, burst 5
   *
   * @param [data] - Cards to create and join to existing imtID
   * @returns Creation result
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.createUploadAdd({
   *   imtID: 98765,
   *   cardsToAdd: [{
   *     vendorCode: 'ART-002',
   *     sizes: [{ techSize: '44', skus: ['1234567890124'] }],
   *     characteristics: [{ id: 1, value: 'Red' }],
   *   }],
   * });
   * console.log(result);
   * ```
   */
  async createUploadAdd(e) {
    return this.client.post(
      "https://content-api.wildberries.ru/content/v2/cards/upload/add",
      e,
      { rateLimitKey: "products.postContentCardsUploadAdd" }
    );
  }
  /**
   * Загрузить медиафайл
   *
   * Uploads a single media file to a product card. Images: max 30 per card, min 700x900px, max 32MB,
   * formats JPG/PNG/BMP/GIF/WebP. Video: max 1 per card, max 50MB, formats MOV/MP4.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @returns Upload result
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.createMediaFile();
   * console.log(result);
   * ```
   */
  async createMediaFile() {
    return this.client.post("https://content-api.wildberries.ru/content/v3/media/file", void 0, {
      rateLimitKey: "products.postContentMediaFile"
    });
  }
  /**
   * Загрузить медиафайлы по ссылкам
   *
   * Uploads media files to a product card via URLs. New files fully replace old ones.
   * Links must be direct file URLs (no auth required). If any file fails validation, none are uploaded.
   *
   * Rate limit: 100 req/min, 600ms interval, burst 5
   *
   * @param data - Request body
   * @param [data.nmId] - Product card nomenclature ID
   * @param [data.data] - Array of direct file URLs
   * @returns Upload result
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products}
   * @example
   * ```typescript
   * const result = await sdk.products.createMediaSave({
   *   nmId: 12345678,
   *   data: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
   * });
   * console.log(result);
   * ```
   */
  async createMediaSave(e) {
    return this.client.post("https://content-api.wildberries.ru/content/v3/media/save", e, {
      rateLimitKey: "products.postContentMediaSave"
    });
  }
  /**
   * Установить цены и скидки
   *
   * Sets prices and discounts for products. Use createTaskSize() for per-size pricing.
   * Track upload status via getHistoryTasks() and getGoodsTask().
   *
   * Rate limit: 10 req/6s, 600ms interval, burst 5
   *
   * @param data - Goods pricing data
   * @returns Upload task response
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Ceny-i-skidki}
   * @example
   * ```typescript
   * const result = await sdk.products.createUploadTask({
   *   data: [{ nmID: 12345678, price: 1500, discount: 10 }],
   * });
   * console.log(result);
   * ```
   */
  async createUploadTask(e) {
    return this.client.post(
      "https://discounts-prices-api.wildberries.ru/api/v2/upload/task",
      e,
      { rateLimitKey: "products.postUploadTask" }
    );
  }
  /**
   * Установить цены для размеров
   *
   * Sets prices per size for eligible products (editableSizePrice: true).
   * Use createUploadTask() for product-level pricing.
   *
   * Rate limit: 10 req/6s, 600ms interval, burst 5
   *
   * @param data - Size pricing data
   * @returns Upload task response
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Ceny-i-skidki}
   * @example
   * ```typescript
   * const result = await sdk.products.createTaskSize({
   *   data: [{ nmID: 12345678, sizeID: 100, price: 2000 }],
   * });
   * console.log(result);
   * ```
   */
  async createTaskSize(e) {
    return this.client.post(
      "https://discounts-prices-api.wildberries.ru/api/v2/upload/task/size",
      e,
      { rateLimitKey: "products.postUploadTaskSize" }
    );
  }
  /**
   * Установить скидки WB Клуба
   *
   * Sets WB Club subscription discounts for products.
   *
   * Rate limit: 10 req/6s, 600ms interval, burst 5
   *
   * @param data - Club discount data
   * @returns Upload task response
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Ceny-i-skidki}
   * @example
   * ```typescript
   * const result = await sdk.products.createTaskClubDiscount({
   *   data: [{ nmID: 12345678, clubDiscount: 15 }],
   * });
   * console.log(result);
   * ```
   */
  async createTaskClubDiscount(e) {
    return this.client.post(
      "https://discounts-prices-api.wildberries.ru/api/v2/upload/task/club-discount",
      e,
      { rateLimitKey: "products.postUploadTaskClubDiscount" }
    );
  }
  /**
   * Состояние обработанной загрузки
   *
   * Returns processed upload status for prices, size prices, and WB Club discounts.
   *
   * Rate limit: 10 req/6s, 600ms interval, burst 5
   *
   * @param [options] - Query parameters
   * @param options.uploadID - Upload task ID to check
   * @returns Task history with status
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Ceny-i-skidki}
   * @example
   * ```typescript
   * const result = await sdk.products.getHistoryTasks({ uploadID: 12345 });
   * console.log(result);
   * ```
   */
  async getHistoryTasks(e) {
    return this.client.get(
      "https://discounts-prices-api.wildberries.ru/api/v2/history/tasks",
      { params: e, rateLimitKey: "products.historyTasks" }
    );
  }
  /**
   * Детализация обработанной загрузки
   *
   * Returns per-item details and errors from a processed price/discount upload.
   *
   * Rate limit: 10 req/6s, 600ms interval, burst 5
   *
   * @param [options] - Query parameters
   * @param options.limit - Number of items to return
   * @param [options.offset] - Items offset
   * @param options.uploadID - Upload task ID
   * @returns Goods history with errors
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Ceny-i-skidki}
   * @example
   * ```typescript
   * const result = await sdk.products.getGoodsTask({ limit: 100, uploadID: 12345 });
   * console.log(result);
   * ```
   */
  async getGoodsTask(e) {
    return this.client.get(
      "https://discounts-prices-api.wildberries.ru/api/v2/history/goods/task",
      { params: e, rateLimitKey: "products.historyGoodsTask" }
    );
  }
  /**
   * Состояние необработанной загрузки
   *
   * Returns pending upload status (promo calendar discounts not yet applied).
   *
   * Rate limit: 10 req/6s, 600ms interval, burst 5
   *
   * @param [options] - Query parameters
   * @param options.uploadID - Upload task ID to check
   * @returns Buffer task status
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Ceny-i-skidki}
   * @example
   * ```typescript
   * const result = await sdk.products.getBufferTasks({ uploadID: 12345 });
   * console.log(result);
   * ```
   */
  async getBufferTasks(e) {
    return this.client.get(
      "https://discounts-prices-api.wildberries.ru/api/v2/buffer/tasks",
      { params: e, rateLimitKey: "products.bufferTasks" }
    );
  }
  /**
   * Детализация необработанной загрузки
   *
   * Returns per-item details and errors from a pending (promo calendar) discount upload.
   *
   * Rate limit: 10 req/6s, 600ms interval, burst 5
   *
   * @param [options] - Query parameters
   * @param options.limit - Number of items to return
   * @param [options.offset] - Items offset
   * @param options.uploadID - Upload task ID
   * @returns Buffer goods with errors
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Ceny-i-skidki}
   * @example
   * ```typescript
   * const result = await sdk.products.getBufferGoodsTask({ limit: 100, uploadID: 12345 });
   * console.log(result);
   * ```
   */
  async getBufferGoodsTask(e) {
    return this.client.get(
      "https://discounts-prices-api.wildberries.ru/api/v2/buffer/goods/task",
      { params: e, rateLimitKey: "products.bufferGoodsTask" }
    );
  }
  /**
   * Получить товары с ценами
   *
   * Returns product pricing info: prices, currency, discounts, WB Club discounts.
   * Use limit/offset pagination for all products, or filterNmID for a single article.
   *
   * Rate limit: 10 req/6s, 600ms interval, burst 5
   *
   * @param [options] - Query parameters
   * @param options.limit - Number of items to return (max 1000)
   * @param [options.offset] - Items offset for pagination
   * @param [options.filterNmID] - Filter by single article ID
   * @returns Goods with pricing information
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Ceny-i-skidki}
   * @example
   * ```typescript
   * const result = await sdk.products.getGoodsFilter({ limit: 1000, offset: 0 });
   * console.log(result);
   * ```
   */
  async getGoodsFilter(e) {
    return this.client.get(
      "https://discounts-prices-api.wildberries.ru/api/v2/list/goods/filter",
      { params: e, rateLimitKey: "products.listGoodsFilter" }
    );
  }
  /**
   * Получить товары с ценами по артикулам
   *
   * Returns pricing info for multiple products by article IDs.
   *
   * Rate limit: 10 req/6s, 600ms interval, burst 5
   *
   * @param data - Request body with article IDs
   * @param data.nmIDs - Array of article IDs to fetch pricing for
   * @returns Goods with pricing information filtered by nmIDs
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Ceny-i-skidki}
   * @example
   * ```typescript
   * const result = await sdk.products.createGoodsFilter({ nmIDs: [12345678, 87654321] });
   * console.log(result);
   * ```
   */
  async createGoodsFilter(e) {
    return this.client.post(
      "https://discounts-prices-api.wildberries.ru/api/v2/list/goods/filter",
      e,
      { rateLimitKey: "products.postListGoodsFilter" }
    );
  }
  /**
   * Получить размеры товара с ценами
   *
   * Returns per-size pricing info for a single product (only for categories with editableSizePrice: true).
   *
   * Rate limit: 10 req/6s, 600ms interval, burst 5
   *
   * @param [options] - Query parameters
   * @param options.limit - Number of items to return
   * @param [options.offset] - Items offset
   * @param options.nmID - Product article ID
   * @returns Size-level pricing data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Ceny-i-skidki}
   * @example
   * ```typescript
   * const result = await sdk.products.getSizeNm({ limit: 100, nmID: 12345678 });
   * console.log(result);
   * ```
   */
  async getSizeNm(e) {
    return this.client.get(
      "https://discounts-prices-api.wildberries.ru/api/v2/list/goods/size/nm",
      { params: e, rateLimitKey: "products.listGoodsSizeNm" }
    );
  }
  /**
   * Получить товары в карантине
   *
   * Returns quarantined products (price dropped 3x or more). Quarantine does not apply to per-size pricing.
   * Products sell at old price while quarantined. Remove via API or seller dashboard.
   *
   * Rate limit: 10 req/6s, 600ms interval, burst 5
   *
   * @param [options] - Query parameters
   * @param options.limit - Number of items to return
   * @param [options.offset] - Items offset
   * @returns Quarantined goods list
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Ceny-i-skidki}
   * @example
   * ```typescript
   * const result = await sdk.products.getQuarantineGoods({ limit: 100, offset: 0 });
   * console.log(result);
   * ```
   */
  async getQuarantineGoods(e) {
    return this.client.get(
      "https://discounts-prices-api.wildberries.ru/api/v2/quarantine/goods",
      { params: e, rateLimitKey: "products.quarantineGoods" }
    );
  }
  /**
   * Получить остатки товаров
   *
   * Returns stock amounts for products at a seller's warehouse. A 409 response counts as 10 requests.
   *
   * **Migration deadline 2026-05-20 13:00 MSK**: Wildberries is phasing out the `skus`
   * parameter on this endpoint in favor of `chrtIds`. Pass `chrtIds` for all new code.
   * After the deadline, WB returns HTTP 400 if `skus` is sent.
   *
   * Rate limit: 300 req/min, 200ms interval, burst 20
   *
   * @param warehouseId - ID склада продавца
   * @param data - Request body — see {@link StocksRequest}. Pass `chrtIds` (preferred since
   *   v3.12.0) or `skus` (deprecated; rejected by WB API after 2026-05-20).
   * @returns Stock amounts. See {@link GetStocksResponse}.
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Ostatki-na-skladah-prodavca}
   * @example New v3.12.0+ pattern (preferred — required after 2026-05-20):
   * ```typescript
   * const result = await sdk.products.getStocks(12345, { chrtIds: [12345678, 12345679] });
   * console.log(result.stocks); // [{ chrtId: 12345678, amount: 50 }, ...]
   * ```
   *
   * @example Legacy pattern (deprecated since v3.12.0, breaks after 2026-05-20):
   * ```typescript
   * // Will emit a console.warn (since v3.12.0) and return HTTP 400 from WB after 2026-05-20
   * const result = await sdk.products.getStocks(12345, { skus: ['1234567890123'] });
   * ```
   */
  async getStocks(e, t) {
    const s = st(t, "getStocks");
    return this.client.post(
      `https://marketplace-api.wildberries.ru/api/v3/stocks/${e}`,
      s,
      { rateLimitKey: "products.postStocks" }
    );
  }
  /**
   * Обновить остатки товаров
   *
   * Updates stock amounts for products at a seller's warehouse. Parameter names are not validated;
   * incorrect names return 204 but do not update stocks. A 409 response counts as 10 requests.
   *
   * **Migration deadline 2026-05-20 13:00 MSK**: Wildberries is phasing out the `sku` field
   * in stock items in favor of `chrtId`. Use `chrtId` per item for all new code.
   * After the deadline, WB returns HTTP 400 if `sku` is sent.
   *
   * Rate limit: 300 req/min, 200ms interval, burst 20
   *
   * @param warehouseId - ID склада продавца
   * @param data - Request body — see {@link UpdateStockRequest}. Use `chrtId` per stock item
   *   (preferred since v3.12.0) or `sku` (deprecated; rejected by WB API after 2026-05-20).
   * @returns void on success (204)
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Ostatki-na-skladah-prodavca}
   * @example New v3.12.0+ pattern (preferred — required after 2026-05-20):
   * ```typescript
   * await sdk.products.updateStock(12345, {
   *   stocks: [{ chrtId: 12345678, amount: 100 }],
   * });
   * ```
   *
   * @example Legacy pattern (deprecated since v3.12.0, breaks after 2026-05-20):
   * ```typescript
   * // Will emit a console.warn (since v3.12.0) and return HTTP 400 from WB after 2026-05-20
   * await sdk.products.updateStock(12345, {
   *   stocks: [{ sku: '1234567890123', amount: 100 }],
   * });
   * ```
   */
  // TODO(v4.0.0): tighten to `data: UpdateStockRequest` (required). Current optional
  // signature preserves pre-v3.12.0 public API. task-16.2 explicitly chose warn-only
  // semantics (AC-5 "no throw") instead of fail-fast empty-body validation.
  async updateStock(e, t) {
    const s = Ts(t);
    return this.client.put(
      `https://marketplace-api.wildberries.ru/api/v3/stocks/${e}`,
      s,
      { rateLimitKey: "products.putStocks" }
    );
  }
  /**
   * Удалить остатки товаров
   *
   * Irreversibly deletes stock records. Must re-upload stocks to resume sales.
   * A 409 response counts as 10 requests.
   *
   * **Migration deadline 2026-05-20 13:00 MSK**: Wildberries is phasing out the `skus`
   * parameter on this endpoint in favor of `chrtIds`. Pass `chrtIds` for all new code.
   * After the deadline, WB returns HTTP 400 if `skus` is sent.
   *
   * Rate limit: 300 req/min, 200ms interval, burst 20
   *
   * @param warehouseId - ID склада продавца
   * @param data - Request body — see {@link StocksRequest}. Pass `chrtIds` (preferred since
   *   v3.12.0) or `skus` (deprecated; rejected by WB API after 2026-05-20).
   * @returns void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Ostatki-na-skladah-prodavca}
   * @example New v3.12.0+ pattern (preferred — required after 2026-05-20):
   * ```typescript
   * await sdk.products.deleteStock(12345, { chrtIds: [12345678, 12345679] });
   * ```
   *
   * @example Legacy pattern (deprecated since v3.12.0, breaks after 2026-05-20):
   * ```typescript
   * // Will emit a console.warn (since v3.12.0) and return HTTP 400 from WB after 2026-05-20
   * await sdk.products.deleteStock(12345, { skus: ['1234567890123'] });
   * ```
   */
  async deleteStock(e, t) {
    const s = st(t, "deleteStock");
    return this.client.delete(
      `https://marketplace-api.wildberries.ru/api/v3/stocks/${e}`,
      s,
      { rateLimitKey: "products.deleteStocks" }
    );
  }
  /**
   * Получить список складов WB
   *
   * Returns all WB warehouses for binding to seller warehouses (FBS model).
   *
   * Rate limit: 300 req/min, 200ms interval, burst 20
   *
   * @returns Array of WB office/warehouse locations
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Sklady-prodavca}
   * @example
   * ```typescript
   * const result = await sdk.products.offices();
   * console.log(result); // [{ id: 1, name: 'Коледино', ... }]
   * ```
   */
  async offices() {
    return this.client.get("https://marketplace-api.wildberries.ru/api/v3/offices", {
      rateLimitKey: "products.offices"
    });
  }
  /**
   * Получить список складов продавца
   *
   * Returns all seller warehouses. Use warehouse IDs to manage stock.
   *
   * Rate limit: 300 req/min, 200ms interval, burst 20
   *
   * @returns Array of seller warehouses
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Sklady-prodavca}
   * @example
   * ```typescript
   * const result = await sdk.products.warehouses();
   * console.log(result); // [{ id: 12345, name: 'Main Warehouse', officeId: 1 }]
   * ```
   */
  async warehouses() {
    return this.client.get(
      "https://marketplace-api.wildberries.ru/api/v3/warehouses",
      { rateLimitKey: "products.warehouses" }
    );
  }
  /**
   * Создать склад продавца
   *
   * Creates a seller warehouse bound to a WB office for FBS fulfillment.
   * Cannot bind a WB warehouse that is already in use.
   *
   * Rate limit: 300 req/min, 200ms interval, burst 20
   *
   * @param data - Warehouse creation data
   * @param data.name - Warehouse name
   * @param data.officeId - WB office ID to bind
   * @returns Created warehouse with ID
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Sklady-prodavca}
   * @example
   * ```typescript
   * const result = await sdk.products.createWarehouse({ name: 'Main Warehouse', officeId: 1 });
   * console.log(result.id); // New warehouse ID
   * ```
   */
  async createWarehouse(e) {
    return this.client.post(
      "https://marketplace-api.wildberries.ru/api/v3/warehouses",
      e,
      { rateLimitKey: "products.postWarehouses" }
    );
  }
  /**
   * Обновить склад продавца
   *
   * Updates seller warehouse data. WB office binding can be changed once per day.
   * Cannot bind a WB warehouse that is already in use.
   *
   * Rate limit: 300 req/min, 200ms interval, burst 20
   *
   * @param warehouseId - ID склада продавца
   * @param data - Warehouse update data
   * @param data.name - Updated warehouse name
   * @param data.officeId - Updated WB office ID
   * @returns void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Sklady-prodavca}
   * @example
   * ```typescript
   * await sdk.products.updateWarehouse(12345, { name: 'Updated Warehouse', officeId: 2 });
   * ```
   */
  async updateWarehouse(e, t) {
    return this.client.put(
      `https://marketplace-api.wildberries.ru/api/v3/warehouses/${e}`,
      t,
      { rateLimitKey: "products.putWarehouses" }
    );
  }
  /**
   * Удалить склад продавца
   *
   * Deletes a seller warehouse from the list.
   *
   * Rate limit: 300 req/min, 200ms interval, burst 20
   *
   * @param warehouseId - ID склада продавца
   * @returns void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Sklady-prodavca}
   * @example
   * ```typescript
   * await sdk.products.deleteWarehouse(12345);
   * ```
   */
  async deleteWarehouse(e) {
    return this.client.delete(
      `https://marketplace-api.wildberries.ru/api/v3/warehouses/${e}`,
      void 0,
      { rateLimitKey: "products.deleteWarehouses" }
    );
  }
  /**
   * Список контактов
   *
   * Returns contacts linked to a seller warehouse. Only for warehouses with delivery type 3 (DBW - WB courier).
   *
   * Rate limit: 300 req/min, 200ms interval, burst 20
   *
   * @param warehouseId - ID склада продавца
   * @returns Warehouse contacts list
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Sklady-prodavca}
   * @example
   * ```typescript
   * const result = await sdk.products.getWarehousesContact(12345);
   * console.log(result.contacts); // [{ phone: '+79001234567', comment: 'Main' }]
   * ```
   */
  async getWarehousesContact(e) {
    return this.client.get(
      `https://marketplace-api.wildberries.ru/api/v3/dbw/warehouses/${e}/contacts`,
      { rateLimitKey: "products.dbwWarehousesContacts" }
    );
  }
  /**
   * Обновить список контактов
   *
   * Overwrites the contact list for a seller warehouse (DBW delivery type 3 only).
   * Send ALL contacts including unchanged ones. Max 5 contacts. Send empty array to delete all.
   *
   * Rate limit: 300 req/min, 200ms interval, burst 20
   *
   * @param warehouseId - ID склада продавца
   * @param data - Contact list data (overwrites existing)
   * @returns void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/work-with-products#tag/Sklady-prodavca}
   * @example
   * ```typescript
   * await sdk.products.updateWarehousesContact(12345, {
   *   contacts: [{ phone: '+79001234567', comment: 'Main contact' }],
   * });
   * ```
   */
  async updateWarehousesContact(e, t) {
    return this.client.put(
      `https://marketplace-api.wildberries.ru/api/v3/dbw/warehouses/${e}/contacts`,
      t,
      { rateLimitKey: "products.putDbwWarehousesContacts" }
    );
  }
};
var Es = class {
  constructor(e) {
    this.client = e;
  }
  /**
   * Get list of warehouses that require a pass
   *
   * Returns a list of warehouses for binding to a seller pass. The data returned by this method may change.
   * It is recommended to periodically synchronize the list.
   *
   * @returns Promise resolving to an array of pass offices
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Propuska-FBS/paths/~1api~1v3~1passes~1offices/get}
   *
   * @example
   * ```typescript
   * const offices = await sdk.ordersFBS.getPassesOffices();
   * console.log(offices);
   * ```
   */
  async getPassesOffices() {
    return this.client.get(
      "https://marketplace-api.wildberries.ru/api/v3/passes/offices",
      { rateLimitKey: "orders-fbs.passesOffices" }
    );
  }
  /**
   * Get list of seller passes
   *
   * Returns a list of all created seller passes.
   *
   * @returns Promise resolving to an array of passes
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Propuska-FBS/paths/~1api~1v3~1passes/get}
   *
   * @example
   * ```typescript
   * const passes = await sdk.ordersFBS.passes();
   * console.log(passes);
   * ```
   */
  async passes() {
    return this.client.get("https://marketplace-api.wildberries.ru/api/v3/passes", {
      rateLimitKey: "orders-fbs.passes"
    });
  }
  /**
   * Create a seller pass
   *
   * Creates a seller pass bound to a WB warehouse. The pass is valid for 48 hours from creation.
   *
   * @param data - Pass data (full name length must be 6-100 characters, car number allows only letters and digits)
   * @returns Promise resolving to the created pass ID
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Propuska-FBS/paths/~1api~1v3~1passes/post}
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersFBS.createPass({
   *   firstName: 'Ivan',
   *   lastName: 'Petrov',
   *   carModel: 'GAZelle',
   *   carNumber: 'A123BC77',
   *   officeId: 1,
   * });
   * console.log(result.id);
   * ```
   */
  async createPass(e) {
    return this.client.post(
      "https://marketplace-api.wildberries.ru/api/v3/passes",
      e,
      { rateLimitKey: "orders-fbs.postPasses" }
    );
  }
  /**
   * Update a seller pass
   *
   * Updates seller pass data, including the bound WB warehouse.
   *
   * @param passId - ID of the pass to update
   * @param data - Updated pass data (full name length must be 6-100 characters, car number allows only letters and digits)
   * @returns Promise resolving to void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Propuska-FBS/paths/~1api~1v3~1passes~1%7BpassId%7D/put}
   *
   * @example
   * ```typescript
   * await sdk.ordersFBS.updatePass(12345, {
   *   firstName: 'Ivan',
   *   lastName: 'Petrov',
   *   carModel: 'GAZelle',
   *   carNumber: 'A123BC77',
   *   officeId: 2,
   * });
   * ```
   */
  async updatePass(e, t) {
    return this.client.put(`https://marketplace-api.wildberries.ru/api/v3/passes/${e}`, t, {
      rateLimitKey: "orders-fbs.putPasses"
    });
  }
  /**
   * Delete a seller pass
   *
   * Removes a seller pass from the list.
   *
   * @param passId - ID of the pass to delete
   * @returns Promise resolving to void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Propuska-FBS/paths/~1api~1v3~1passes~1%7BpassId%7D/delete}
   *
   * @example
   * ```typescript
   * await sdk.ordersFBS.deletePass(12345);
   * ```
   */
  async deletePass(e) {
    return this.client.delete(`https://marketplace-api.wildberries.ru/api/v3/passes/${e}`, {
      rateLimitKey: "orders-fbs.deletePasses"
    });
  }
  /**
   * Get list of new assembly tasks
   *
   * Returns a list of all new assembly tasks available for the seller at the time of request.
   *
   * @returns Promise resolving to new orders response
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Sborochnye-zadaniya-FBS/paths/~1api~1v3~1orders~1new/get}
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersFBS.getOrdersNew();
   * console.log(result.orders);
   * ```
   */
  async getOrdersNew() {
    return this.client.get(
      "https://marketplace-api.wildberries.ru/api/v3/orders/new",
      { rateLimitKey: "orders-fbs.ordersNew" }
    );
  }
  /**
   * Get assembly tasks information
   *
   * Returns assembly task information without their current status.
   * Data can be retrieved for a given period, up to 30 calendar days per request.
   *
   * @param options - Query parameters for pagination and date filtering
   * @returns Promise resolving to orders with pagination cursor
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Sborochnye-zadaniya-FBS/paths/~1api~1v3~1orders/get}
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersFBS.orders({ limit: 100, next: 0 });
   * console.log(result.orders);
   * ```
   */
  async orders(e) {
    return this.client.get("https://marketplace-api.wildberries.ru/api/v3/orders", {
      params: e,
      rateLimitKey: "orders-fbs.orders"
    });
  }
  /**
   * Get all assembly tasks requiring reshipment
   *
   * Returns all assembly tasks that require reshipment. Reshipment is needed when a supply was scanned
   * at the reception point but still has unscanned items. These tasks can be moved to another active supply.
   *
   * @returns Promise resolving to reshipment orders response
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Sborochnye-zadaniya-FBS/paths/~1api~1v3~1supplies~1orders~1reshipment/get}
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersFBS.getOrdersReshipment();
   * console.log(result);
   * ```
   */
  async getOrdersReshipment() {
    return this.client.get(
      "https://marketplace-api.wildberries.ru/api/v3/supplies/orders/reshipment",
      { rateLimitKey: "orders-fbs.suppliesOrdersReshipment" }
    );
  }
  /**
   * Cancel an assembly task
   *
   * Cancels an assembly task and sets its status to `cancel` (cancelled by seller).
   *
   * @param orderId - ID of the assembly task to cancel
   * @returns Promise resolving to void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Sborochnye-zadaniya-FBS/paths/~1api~1v3~1orders~1%7BorderId%7D~1cancel/patch}
   *
   * @example
   * ```typescript
   * await sdk.ordersFBS.updateOrdersCancel(123456);
   * ```
   */
  async updateOrdersCancel(e) {
    return this.client.patch(
      `https://marketplace-api.wildberries.ru/api/v3/orders/${e}/cancel`,
      void 0,
      { rateLimitKey: "orders-fbs.patchOrdersCancel" }
    );
  }
  /**
   * Get assembly task stickers
   *
   * Returns stickers for assembly tasks in SVG, ZPLV, ZPLH, or PNG format.
   * Maximum 100 stickers per request. Only available for tasks with status `confirm`.
   *
   * @param options - Sticker format and size options
   * @param data - Request body containing order IDs
   * @returns Promise resolving to stickers response
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Sborochnye-zadaniya-FBS/paths/~1api~1v3~1orders~1stickers/post}
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersFBS.createOrdersSticker(
   *   { type: 'png', width: 58, height: 40 },
   *   { orders: [123, 456] },
   * );
   * console.log(result.stickers);
   * ```
   */
  async createOrdersSticker(e, t) {
    return this.client.post(
      "https://marketplace-api.wildberries.ru/api/v3/orders/stickers",
      t,
      { params: e, rateLimitKey: "orders-fbs.postOrdersStickers" }
    );
  }
  /**
   * Delete assembly task metadata
   *
   * Deletes a metadata value for the given key. Only one key can be passed per request.
   * Supported keys: imei, uin, gtin, sgtin.
   *
   * @param orderId - ID of the assembly task
   * @param options - Query parameters specifying which metadata key to delete
   * @returns Promise resolving to void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Metadannye-FBS/paths/~1api~1v3~1orders~1%7BorderId%7D~1meta/delete}
   *
   * @example
   * ```typescript
   * await sdk.ordersFBS.deleteOrdersMeta(123456, { key: 'imei' });
   * ```
   */
  async deleteOrdersMeta(e, t) {
    return this.client.delete(
      `https://marketplace-api.wildberries.ru/api/v3/orders/${e}/meta`,
      { params: t, rateLimitKey: "orders-fbs.deleteOrdersMeta" }
    );
  }
  /**
   * Attach marking codes (SGTIN) to an assembly task
   *
   * Attaches product marking codes to an assembly task. Only available when the task metadata
   * includes the `sgtin` field and the task is in `confirm` status.
   *
   * @param orderId - ID of the assembly task
   * @param data - Request body containing SGTIN marking codes
   * @returns Promise resolving to void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Metadannye-FBS/paths/~1api~1v3~1orders~1%7BorderId%7D~1meta~1sgtin/put}
   *
   * @example
   * ```typescript
   * await sdk.ordersFBS.updateMetaSgtin(123456, { sgtins: ['01046009544741002'] });
   * ```
   */
  async updateMetaSgtin(e, t) {
    return this.client.put(
      `https://marketplace-api.wildberries.ru/api/v3/orders/${e}/meta/sgtin`,
      t,
      { rateLimitKey: "orders-fbs.putOrdersMetaSgtin" }
    );
  }
  /**
   * Attach UIN to an assembly task
   *
   * Updates the unique identification number (UIN) in the assembly task metadata.
   * Each task can have only one UIN. Only available for orders delivered by WB in `confirm` status.
   *
   * @param orderId - ID of the assembly task
   * @param data - Request body containing the UIN value
   * @returns Promise resolving to void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Metadannye-FBS/paths/~1api~1v3~1orders~1%7BorderId%7D~1meta~1uin/put}
   *
   * @example
   * ```typescript
   * await sdk.ordersFBS.updateMetaUin(123456, { uin: 'UIN123456789' });
   * ```
   */
  async updateMetaUin(e, t) {
    return this.client.put(
      `https://marketplace-api.wildberries.ru/api/v3/orders/${e}/meta/uin`,
      t,
      { rateLimitKey: "orders-fbs.putOrdersMetaUin" }
    );
  }
  /**
   * Attach IMEI to an assembly task
   *
   * Updates the IMEI in the assembly task metadata. Each task can have only one IMEI.
   * If a device has two IMEIs, only provide the primary one. Only available for orders in `confirm` status.
   *
   * @param orderId - ID of the assembly task
   * @param data - Request body containing the IMEI value
   * @returns Promise resolving to void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Metadannye-FBS/paths/~1api~1v3~1orders~1%7BorderId%7D~1meta~1imei/put}
   *
   * @example
   * ```typescript
   * await sdk.ordersFBS.updateMetaImei(123456, { imei: '354567890123456' });
   * ```
   */
  async updateMetaImei(e, t) {
    return this.client.put(
      `https://marketplace-api.wildberries.ru/api/v3/orders/${e}/meta/imei`,
      t,
      { rateLimitKey: "orders-fbs.putOrdersMetaImei" }
    );
  }
  /**
   * Attach GTIN to an assembly task
   *
   * Updates the GTIN (unique product ID for Belarus) in the assembly task metadata.
   * Each task can have only one GTIN. Only available for orders delivered by WB in `confirm` status.
   *
   * @param orderId - ID of the assembly task
   * @param data - Request body containing the GTIN value
   * @returns Promise resolving to void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Metadannye-FBS/paths/~1api~1v3~1orders~1%7BorderId%7D~1meta~1gtin/put}
   *
   * @example
   * ```typescript
   * await sdk.ordersFBS.updateMetaGtin(123456, { gtin: '4600000000001' });
   * ```
   */
  async updateMetaGtin(e, t) {
    return this.client.put(
      `https://marketplace-api.wildberries.ru/api/v3/orders/${e}/meta/gtin`,
      t,
      { rateLimitKey: "orders-fbs.putOrdersMetaGtin" }
    );
  }
  /**
   * Attach expiration date to an assembly task
   *
   * Sets the product expiration date for an assembly task. Only available for orders delivered
   * by WB in `confirm` status. To change the date, send a new request. Expiration cannot be removed once set.
   *
   * @param orderId - ID of the assembly task
   * @param data - Request body containing the expiration date
   * @returns Promise resolving to void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Metadannye-FBS/paths/~1api~1v3~1orders~1%7BorderId%7D~1meta~1expiration/put}
   *
   * @example
   * ```typescript
   * await sdk.ordersFBS.updateMetaExpiration(123456, { expiration: '2025-12-31' });
   * ```
   */
  async updateMetaExpiration(e, t) {
    return this.client.put(
      `https://marketplace-api.wildberries.ru/api/v3/orders/${e}/meta/expiration`,
      t,
      { rateLimitKey: "orders-fbs.putOrdersMetaExpiration" }
    );
  }
  /**
   * Attach customs declaration number to an assembly task
   *
   * Updates the customs declaration number in the assembly task metadata.
   * Each task can have only one customs declaration number. Check if the task supports it
   * by verifying `customsDeclaration` is in the `requiredMeta` field of new orders.
   *
   * @param orderId - ID of the assembly task
   * @param data - Request body containing the customs declaration number
   * @returns Promise resolving to void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Metadannye-FBS/paths/~1api~1v3~1orders~1%7BorderId%7D~1meta~1customs-declaration/put}
   *
   * @example
   * ```typescript
   * await sdk.ordersFBS.setCustomsDeclaration(123456, {
   *   customsDeclaration: '10129050/010120/0001234',
   * });
   * ```
   */
  async setCustomsDeclaration(e, t) {
    return this.client.put(
      `https://marketplace-api.wildberries.ru/api/marketplace/v3/orders/${e}/meta/customs-declaration`,
      t,
      { rateLimitKey: "orders-fbs.putOrdersMetaCustomsDeclaration" }
    );
  }
  /**
   * Get cross-border assembly task stickers
   *
   * Returns stickers for cross-border assembly tasks in PDF format.
   * Maximum 100 stickers per request. Only available for tasks with status `confirm`.
   *
   * @param data - Request body containing order IDs
   * @returns Promise resolving to cross-border stickers response
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Sborochnye-zadaniya-FBS/paths/~1api~1v3~1orders~1stickers~1cross-border/post}
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersFBS.createStickersCrossBorder({ orders: [123, 456] });
   * console.log(result.stickers);
   * ```
   */
  async createStickersCrossBorder(e) {
    return this.client.post(
      "https://marketplace-api.wildberries.ru/api/v3/orders/stickers/cross-border",
      e,
      { rateLimitKey: "orders-fbs.postOrdersStickersCrossBorder" }
    );
  }
  /**
   * Get cross-border assembly task status history
   *
   * Returns the status history for cross-border assembly tasks.
   *
   * @param data - Request body containing order IDs
   * @returns Promise resolving to status history response
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Sborochnye-zadaniya-FBS/paths/~1api~1v3~1orders~1status~1history/post}
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersFBS.createStatusHistory({ orders: [123, 456] });
   * console.log(result.orders);
   * ```
   */
  async createStatusHistory(e) {
    return this.client.post(
      "https://marketplace-api.wildberries.ru/api/v3/orders/status/history",
      e,
      { rateLimitKey: "orders-fbs.postOrdersStatusHistory" }
    );
  }
  /**
   * Get orders with client information (Turkey cross-border)
   *
   * Returns buyer information by assembly task ID. Only available for cross-border orders from Turkey.
   *
   * @param data - Request body containing order IDs
   * @returns Promise resolving to client info response
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Sborochnye-zadaniya-FBS/paths/~1api~1v3~1orders~1client/post}
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersFBS.createOrdersClient({ orders: [123456] });
   * console.log(result);
   * ```
   */
  async createOrdersClient(e) {
    return this.client.post(
      "https://marketplace-api.wildberries.ru/api/v3/orders/client",
      e,
      { rateLimitKey: "orders-fbs.postOrdersClient" }
    );
  }
  /**
   * Get list of supplies
   *
   * Returns a paginated list of supplies.
   *
   * @param options - Query parameters for pagination
   * @returns Promise resolving to supplies list with pagination cursor
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Postavki-FBS/paths/~1api~1v3~1supplies/get}
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersFBS.supplies({ limit: 100, next: 0 });
   * console.log(result.supplies);
   * ```
   */
  async supplies(e) {
    return this.client.get(
      "https://marketplace-api.wildberries.ru/api/v3/supplies",
      { params: e, rateLimitKey: "orders-fbs.supplies" }
    );
  }
  /**
   * Create a new supply
   *
   * Creates a new supply for FBS assembly tasks. A new supply acquires the cargo type
   * of the first order added to it. Only orders of the same cargo type can be in one supply.
   *
   * @param data - Request body containing the supply name
   * @returns Promise resolving to the created supply ID
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Postavki-FBS/paths/~1api~1v3~1supplies/post}
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersFBS.createSupply({ name: 'Supply 2025-01' });
   * console.log(result.id);
   * ```
   */
  async createSupply(e) {
    return this.client.post(
      "https://marketplace-api.wildberries.ru/api/v3/supplies",
      e,
      { rateLimitKey: "orders-fbs.postSupplies" }
    );
  }
  /**
   * Get supply information
   *
   * Returns detailed information about a supply.
   *
   * @param supplyId - ID of the supply
   * @returns Promise resolving to supply details
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Postavki-FBS/paths/~1api~1v3~1supplies~1%7BsupplyId%7D/get}
   *
   * @example
   * ```typescript
   * const supply = await sdk.ordersFBS.getSupply('WB-GI-1234');
   * console.log(supply);
   * ```
   */
  async getSupply(e) {
    return this.client.get(
      `https://marketplace-api.wildberries.ru/api/v3/supplies/${e}`,
      { rateLimitKey: "orders-fbs.getSupply" }
    );
  }
  /**
   * Delete a supply
   *
   * Deletes a supply if it is active and has no assembly tasks assigned.
   *
   * @param supplyId - ID of the supply to delete
   * @returns Promise resolving to void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Postavki-FBS/paths/~1api~1v3~1supplies~1%7BsupplyId%7D/delete}
   *
   * @example
   * ```typescript
   * await sdk.ordersFBS.deleteSupply('WB-GI-1234');
   * ```
   */
  async deleteSupply(e) {
    return this.client.delete(
      `https://marketplace-api.wildberries.ru/api/v3/supplies/${e}`,
      {
        rateLimitKey: "orders-fbs.deleteSupplies"
      }
    );
  }
  /**
   * Transfer supply to delivery
   *
   * Closes a supply and sets all assembly tasks in it to `complete` status.
   * After closing, no new tasks can be added. The supply must have at least one task.
   *
   * **⚠️ Deadline 2026-06-03 — B2C marking codes (Честный Знак).** WB will validate B2C
   * marking codes server-side from this date. Codes must be passed in full with GS
   * separators (ASCII 0x1D) and crypto-tail (код проверки подлинности). Invalid codes
   * → HTTP 409 with diagnostic `metaDetails[]` (typed as `MetaValidationFailError`).
   *
   * **Important: Metadata validation.** Returns 409 if order metadata is invalid:
   * - IMEI validation (enforced since March 31, 2026)
   * - UIN validation (enforced since April 7, 2026)
   * - Marking code for B2B orders (enforced since April 9, 2026)
   * - Marking code for B2C orders via Честный Знак (enforced from June 3, 2026)
   *
   * Check `metaDetails` via `getOrdersMetaBulk()` before calling deliver.
   * Each metaDetail has `key`, `value`, and `decision` (filled/optional/required/invalid).
   *
   * **Rate limit penalty**: each 409 response counts as 10 requests against the
   * FBS supply/order rate-limit budget. Use pre-flight validation to avoid burning budget.
   *
   * @param supplyId - ID of the supply to deliver
   * @returns Promise resolving to void on success
   * @throws {MetaValidationFailError} 409 — Metadata validation failed (thrown as MetaValidationFailError exposes
   *   `metaDetails[]` with per-code diagnostics). Falls back to {@link WBAPIError} for 409s
   *   without `metaDetails` (e.g. supply has zero orders).
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/docs/openapi/orders-fbs#tag/Postavki-FBS}
   * @see [Migration guide](../../../docs/guides/fbs-marking-code-validation.md)
   *
   * @example
   * ```typescript
   * import { WildberriesSDK, MetaValidationFailError } from 'daytona-wildberries-typescript-sdk';
   *
   * // Pattern A: pre-flight via getOrdersMetaBulk (cheap, no 10x penalty)
   * const meta = await sdk.ordersFBS.getOrdersMetaBulk({ orders: [12345] }); // example order ID
   * const invalid = meta.orders?.[0]?.metaDetails?.filter(d => d.decision === 'required' || d.decision === 'invalid');
   * if (invalid?.length) {
   *   console.log('Fix metadata first:', invalid.map(d => d.key));
   * } else {
   *   await sdk.ordersFBS.updateSuppliesDeliver('WB-GI-1234');
   * }
   * ```
   *
   * @example
   * ```typescript
   * import { WildberriesSDK, MetaValidationFailError } from 'daytona-wildberries-typescript-sdk';
   *
   * // Pattern B: typed catch
   * try {
   *   await sdk.ordersFBS.updateSuppliesDeliver('WB-GI-1234');
   * } catch (err) {
   *   if (err instanceof MetaValidationFailError) {
   *     err.metaDetails.forEach(d => console.log(d.key, d.value, d.decision));
   *   }
   *   throw err;
   * }
   * ```
   */
  async updateSuppliesDeliver(e) {
    return this.client.patch(
      `https://marketplace-api.wildberries.ru/api/v3/supplies/${e}/deliver`,
      void 0,
      { rateLimitKey: "orders-fbs.patchSuppliesDeliver" }
    );
  }
  /**
   * Get supply QR code
   *
   * Returns the supply QR code in SVG, ZPLV, ZPLH, or PNG format (580x400 px).
   * Only available after the supply has been transferred to delivery.
   *
   * @param supplyId - ID of the supply
   * @param options - Sticker format options
   * @returns Promise resolving to barcode and file data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Postavki-FBS/paths/~1api~1v3~1supplies~1%7BsupplyId%7D~1barcode/get}
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersFBS.getSuppliesBarcode('WB-GI-1234', { type: 'png' });
   * console.log(result.barcode);
   * ```
   */
  async getSuppliesBarcode(e, t) {
    return this.client.get(
      `https://marketplace-api.wildberries.ru/api/v3/supplies/${e}/barcode`,
      { params: t, rateLimitKey: "orders-fbs.suppliesBarcode" }
    );
  }
  /**
   * Get list of supply boxes (trbx)
   *
   * Returns the list of boxes for a supply.
   *
   * @param supplyId - ID of the supply
   * @returns Promise resolving to boxes list
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Postavki-FBS/paths/~1api~1v3~1supplies~1%7BsupplyId%7D~1trbx/get}
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersFBS.getSuppliesTrbx('WB-GI-1234');
   * console.log(result.trbxes);
   * ```
   */
  async getSuppliesTrbx(e) {
    return this.client.get(
      `https://marketplace-api.wildberries.ru/api/v3/supplies/${e}/trbx`,
      { rateLimitKey: "orders-fbs.suppliesTrbx" }
    );
  }
  /**
   * Add boxes to a supply
   *
   * Adds the required number of boxes to a supply. Only for supplies shipped to pickup points (PVZ).
   * Can only be added to an open supply.
   *
   * @param supplyId - ID of the supply
   * @param data - Request body containing the number of boxes to add
   * @returns Promise resolving to created box IDs
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Postavki-FBS/paths/~1api~1v3~1supplies~1%7BsupplyId%7D~1trbx/post}
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersFBS.createSuppliesTrbx('WB-GI-1234', { amount: 5 });
   * console.log(result.trbxIds);
   * ```
   */
  async createSuppliesTrbx(e, t) {
    return this.client.post(
      `https://marketplace-api.wildberries.ru/api/v3/supplies/${e}/trbx`,
      t,
      { rateLimitKey: "orders-fbs.postSuppliesTrbx" }
    );
  }
  /**
   * Delete boxes from a supply
   *
   * Removes boxes from a supply. Can only delete while the supply is being assembled.
   *
   * @param supplyId - ID of the supply
   * @param data - Request body containing box IDs to delete
   * @returns Promise resolving to void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Postavki-FBS/paths/~1api~1v3~1supplies~1%7BsupplyId%7D~1trbx/delete}
   *
   * @example
   * ```typescript
   * await sdk.ordersFBS.deleteSuppliesTrbx('WB-GI-1234', { trbxIds: ['trbx-1', 'trbx-2'] });
   * ```
   */
  async deleteSuppliesTrbx(e, t) {
    return this.client.delete(
      `https://marketplace-api.wildberries.ru/api/v3/supplies/${e}/trbx`,
      t,
      { rateLimitKey: "orders-fbs.deleteSuppliesTrbx" }
    );
  }
  /**
   * Get supply box stickers
   *
   * Returns QR stickers for boxes in SVG, ZPLV, ZPLH, or PNG format (580x400 px).
   *
   * @param supplyId - ID of the supply
   * @param options - Sticker format options
   * @param data - Request body containing box IDs
   * @returns Promise resolving to box stickers
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Postavki-FBS/paths/~1api~1v3~1supplies~1%7BsupplyId%7D~1trbx~1stickers/post}
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersFBS.createTrbxSticker(
   *   'WB-GI-1234',
   *   { type: 'png' },
   *   { trbxIds: ['trbx-1', 'trbx-2'] },
   * );
   * console.log(result.stickers);
   * ```
   */
  async createTrbxSticker(e, t, s) {
    return this.client.post(
      `https://marketplace-api.wildberries.ru/api/v3/supplies/${e}/trbx/stickers`,
      s,
      { params: t, rateLimitKey: "orders-fbs.postSuppliesTrbxStickers" }
    );
  }
  // ============================================================================
  // New bulk/replacement methods
  // ============================================================================
  /**
   * Get assembly task statuses
   *
   * Returns statuses of assembly tasks by their IDs.
   * Replacement for the deprecated createOrdersStatus method with a corrected name.
   *
   * @param data - Request body containing order IDs
   * @returns Promise resolving to order statuses
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Sborochnye-zadaniya-FBS/paths/~1api~1v3~1orders~1status/post}
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersFBS.getOrderStatuses({ orders: [123, 456] });
   * console.log(result);
   * ```
   */
  async getOrderStatuses(e) {
    return this.client.post(
      "https://marketplace-api.wildberries.ru/api/v3/orders/status",
      e,
      { rateLimitKey: "orders-fbs.postOrdersStatus" }
    );
  }
  /**
   * Get metadata for multiple assembly tasks
   *
   * Returns metadata for multiple assembly tasks (up to 100).
   *
   * @param data - Request body containing order IDs (max 100)
   * @returns Promise resolving to metadata for the requested orders
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Metadannye-FBS/paths/~1api~1marketplace~1v3~1orders~1meta/post}
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersFBS.getOrdersMetaBulk({ orders: [123, 456] });
   * console.log(result);
   * ```
   */
  async getOrdersMetaBulk(e) {
    return this.client.post(
      "https://marketplace-api.wildberries.ru/api/marketplace/v3/orders/meta",
      e,
      { rateLimitKey: "orders-fbs.postMarketplaceOrdersMeta" }
    );
  }
  /**
   * Add multiple assembly tasks to a supply (bulk)
   *
   * Adds multiple assembly tasks to a supply in a single request.
   *
   * @param supplyId - ID of the supply
   * @param data - Request body containing order IDs to add
   * @returns Promise resolving to void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Postavki-FBS/paths/~1api~1marketplace~1v3~1supplies~1%7BsupplyId%7D~1orders/patch}
   *
   * @example
   * ```typescript
   * await sdk.ordersFBS.addOrdersToSupply('WB-GI-1234', { orders: [123, 456] });
   * ```
   */
  async addOrdersToSupply(e, t) {
    return this.client.patch(
      `https://marketplace-api.wildberries.ru/api/marketplace/v3/supplies/${e}/orders`,
      t,
      { rateLimitKey: "orders-fbs.patchMarketplaceSuppliesOrders" }
    );
  }
  /**
   * Get assembly task IDs in a supply
   *
   * Returns a list of assembly task IDs assigned to a supply.
   *
   * @param supplyId - ID of the supply
   * @returns Promise resolving to order IDs in the supply
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://openapi.wildberries.ru/#tag/Postavki-FBS/paths/~1api~1marketplace~1v3~1supplies~1%7BsupplyId%7D~1order-ids/get}
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersFBS.getSupplyOrderIds('WB-GI-1234');
   * console.log(result);
   * ```
   */
  async getSupplyOrderIds(e) {
    return this.client.get(
      `https://marketplace-api.wildberries.ru/api/marketplace/v3/supplies/${e}/order-ids`,
      { rateLimitKey: "orders-fbs.getMarketplaceSuppliesOrderIds" }
    );
  }
};
var Ds = class {
  constructor(e) {
    this.client = e;
  }
  /**
   * Опции приёмки
   *
   * Метод возвращает информацию о том, какие склады и типы упаковки доступны для поставки. Список складов определяется по баркоду и количеству товара. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 6 запросов | 10 секунд | 6 запросов | </div>
   *
   * @param data - Request body data
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.ordersFBW.createAcceptanceOption([{ barcode: '1234567891234', quantity: 10 }]);
  console.log(result);
   */
  async createAcceptanceOption(e, t) {
    return this.client.post(
      "https://supplies-api.wildberries.ru/api/v1/acceptance/options",
      e,
      { params: t, rateLimitKey: "orders-fbw.postAcceptanceOptions" }
    );
  }
  /**
   * Список складов
   *
   * Метод возвращает список складов WB. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 6 запросов | 10 секунд | 6 запросов | </div>
   *
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.ordersFBW.warehouses();
  console.log(result);
   */
  async warehouses() {
    return this.client.get(
      "https://supplies-api.wildberries.ru/api/v1/warehouses",
      { rateLimitKey: "orders-fbw.warehouses" }
    );
  }
  /**
   * Транзитные направления
   *
   * Метод возвращает информацию о доступных транзитных направлениях. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 6 запросов | 10 секунд | 10 запросов | </div>
   *
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.ordersFBW.transitTariffs();
  console.log(result);
   */
  async transitTariffs() {
    return this.client.get(
      "https://supplies-api.wildberries.ru/api/v1/transit-tariffs",
      { rateLimitKey: "orders-fbw.transitTariffs" }
    );
  }
  /**
   * Список поставок
   *
   * Метод возвращает список поставок, по умолчанию — последние 1000 поставок. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 30 запросов | 2 секунды | 10 запросов | </div>
   *
   * @param data - Request body data
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.ordersFBW.listSupplies({});
  console.log(result);
   */
  async listSupplies(e, t) {
    return this.client.post(
      "https://supplies-api.wildberries.ru/api/v1/supplies",
      e,
      { params: t, rateLimitKey: "orders-fbw.postSupplies" }
    );
  }
  /**
   * Детали поставки
   *
   * Метод возвращает детали поставки по ID. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 30 запросов | 2 секунды | 10 запросов | </div>
   *
   * @param ID - ID поставки или заказа
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.ordersFBW.getSupply(12345);
  console.log(result);
   */
  async getSupply(e, t) {
    return this.client.get(
      `https://supplies-api.wildberries.ru/api/v1/supplies/${e}`,
      { params: t, rateLimitKey: "orders-fbw.supplies" }
    );
  }
  /**
   * Товары поставки
   *
   * Метод возвращает информацию о товарах в поставке. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 30 запросов | 2 секунды | 10 запросов | </div>
   *
   * @param ID - ID поставки или заказа
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.ordersFBW.getSuppliesGood(12345);
  console.log(result);
   */
  async getSuppliesGood(e, t) {
    return this.client.get(
      `https://supplies-api.wildberries.ru/api/v1/supplies/${e}/goods`,
      { params: t, rateLimitKey: "orders-fbw.suppliesGoods" }
    );
  }
  /**
   * Упаковка поставки
   *
   * Метод возвращает информацию об упаковке поставки. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 30 запросов | 2 секунды | 10 запросов | </div>
   *
   * @param ID - ID поставки
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.ordersFBW.getSuppliesPackage(12345);
  console.log(result);
   */
  async getSuppliesPackage(e) {
    return this.client.get(
      `https://supplies-api.wildberries.ru/api/v1/supplies/${e}/package`,
      { rateLimitKey: "orders-fbw.suppliesPackage" }
    );
  }
  /**
   * Получение информации о покупателе для заказов DBW
   *
   * Возвращает данные покупателя (имя, телефон, код) по ID заказов модели DBW.
   *
   * **Важно:** Этот метод использует домен `marketplace-api.wildberries.ru`,
   * а не `supplies-api.wildberries.ru` как остальные методы FBW.
   *
   * Rate limit: 300 requests per minute, 200ms interval, burst 20.
   * Один запрос с кодом 409 считается за 10 запросов.
   *
   * @param orderIds - Array of assembly order IDs (no documented max limit)
   * @returns Buyer information for each order
   * @throws {ValidationError} When orderIds array is empty
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {NetworkError} When network request fails or times out
   * @since 3.4.0
   * @see {@link https://dev.wildberries.ru/docs/openapi/orders-dbw#tag/Sborochnye-zadaniya-DBW}
   * @example
   * ```typescript
   * const result = await sdk.ordersFBW.getClientInfo([987654321, 123456789]);
   * for (const order of result.orders ?? []) {
   *   console.log(`Order ${order.orderID}: ${order.firstName}, phone: +${order.phoneCode}${order.phone}`);
   * }
   * ```
   */
  async getClientInfo(e) {
    if (e.length === 0)
      throw new b("orderIds array cannot be empty");
    return this.client.post(
      "https://marketplace-api.wildberries.ru/api/marketplace/v3/dbw/orders/client",
      { orders: e },
      { rateLimitKey: "orders-fbw.getClientInfo" }
    );
  }
  /**
   * Удалить маркировочные метаданные у нескольких заказов DBW (массовая операция).
   *
   * Bulk-delete marking metadata (IMEI/UIN/GTIN/SGTIN/customsDeclaration) from up to
   * N DBW orders in a single request. Mirrors the DBS `deleteMetaBulk` method.
   *
   * Rate limit: 150 requests/min, 400ms interval, burst 20.
   * (Default mirrors DBS sibling — WB has not yet published explicit DBW limits.
   * Will be updated via task-15.5 once WB publishes 07-orders-fbw.yaml.)
   *
   * @param request - Orders array and metadata key to delete
   * @returns Per-order deletion results
   * @throws {ValidationError} When orders array is empty
   * @throws {ValidationError} When request body is malformed
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {NetworkError} When network request fails or times out
   * @since 3.11.0
   * @see {@link https://dev.wildberries.ru/openapi/orders-dbw}
   * @example
   * ```typescript
   * const result = await sdk.ordersFBW.deleteMetaBulk({ orders: [123456], key: 'imei' });
   * for (const order of result.orders) {
   *   console.log(`Order ${order.orderId}: ${order.success ? 'deleted' : order.error}`);
   * }
   * ```
   */
  async deleteMetaBulk(e) {
    if (e.orders.length === 0)
      throw new b("orders array cannot be empty");
    return this.client.post(
      "https://marketplace-api.wildberries.ru/api/marketplace/v3/dbw/orders/meta/delete",
      e,
      { rateLimitKey: "orders-fbw.deleteMetaBulkDBW" }
    );
  }
  /**
   * Задать SGTIN-коды для нескольких заказов DBW (массовая операция).
   *
   * Bulk-assign SGTIN (Serial Global Trade Item Number) codes to up to N DBW orders
   * in a single request. Mirrors the DBS `setSgtinBulk` method.
   *
   * Rate limit: 500 requests/min, 120ms interval, burst 20.
   * (Default mirrors DBS sibling — WB has not yet published explicit DBW limits.
   * Will be updated via task-15.5 once WB publishes 07-orders-fbw.yaml.)
   *
   * @param request - Per-order SGTIN assignments
   * @returns Per-order set results; `errors[]` present when some orders fail
   * @throws {ValidationError} When orders array is empty
   * @throws {ValidationError} When request body is malformed
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {NetworkError} When network request fails or times out
   * @since 3.11.0
   * @see {@link https://dev.wildberries.ru/openapi/orders-dbw}
   * @example
   * ```typescript
   * const result = await sdk.ordersFBW.setSgtinBulk({
   *   orders: [{ orderId: 123456, sgtins: ['1234567890123456'] }],
   * });
   * if (result.errors?.length) {
   *   console.log('Some orders failed:', result.errors);
   * }
   * ```
   */
  async setSgtinBulk(e) {
    if (e.orders.length === 0)
      throw new b("orders array cannot be empty");
    return this.client.post(
      "https://marketplace-api.wildberries.ru/api/marketplace/v3/dbw/orders/meta/sgtin",
      e,
      { rateLimitKey: "orders-fbw.setSgtinBulkDBW" }
    );
  }
  /**
   * Передать несколько заказов DBW в доставку (массовая операция).
   *
   * Mark up to 1000 DBW orders as "delivered" (handed to carrier) in a single request.
   * Mirrors the DBS `deliverBulk` method. WB disables the legacy single-order DBW
   * deliver endpoint on 2026-06-05 — use this method instead.
   *
   * **Important:** Orders requiring IMEI/SGTIN must have metadata attached before calling
   * this method. If metadata is missing, WB returns 409 `MetaValidationFail`.
   *
   * Rate limit: 300 requests/min, 200ms interval, burst 20.
   * (Default mirrors DBS sibling — WB has not yet published explicit DBW limits.
   * Will be updated via task-15.5 once WB publishes 07-orders-fbw.yaml.)
   *
   * @param orderIds - Array of order IDs to mark as delivered (1–1000 items)
   * @returns Per-order delivery status results. When WB returns application-level 409
   *   MetaValidationFail, it surfaces in `result.results[].errors[]` with `code === 409`
   *   and `detail === 'MetaValidationFail'`; check `result.results[].errors[].metaDetails[]`
   *   per-order before retrying. (since 3.11.0 — WB API 2026-05-06)
   * @throws {ValidationError} When orderIds is empty or exceeds 1000 items
   * @throws {WBAPIError} 409 — ImeiIsNotFilled: mandatory IMEI not attached to order
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {NetworkError} When network request fails or times out
   * @since 3.11.0
   * @see {@link https://dev.wildberries.ru/openapi/orders-dbw}
   * @example
   * ```typescript
   * // Mark multiple DBW orders as handed to carrier
   * const result = await sdk.ordersFBW.deliverBulk([123456, 234567, 345678]);
   *
   * for (const order of result.results ?? []) {
   *   if (order.isError) {
   *     console.log(`Order ${order.orderId} failed:`, order.errors);
   *   } else {
   *     console.log(`Order ${order.orderId} marked as delivered`);
   *   }
   * }
   * ```
   */
  async deliverBulk(e) {
    if (e.length === 0)
      throw new b("orderIds array cannot be empty");
    if (e.length > 1e3)
      throw new b("orderIds array cannot exceed 1000 items");
    return this.client.post(
      "https://marketplace-api.wildberries.ru/api/marketplace/v3/dbw/orders/status/deliver",
      { orders: e },
      { rateLimitKey: "orders-fbw.deliverBulkDBW" }
    );
  }
  /**
   * Проверить метаданные маркировки DBW-заказов перед передачей в доставку (предварительная валидация).
   *
   * Pre-flight metadata validator for DBW orders. Returns the same `metaDetails[]` shape
   * that WB returns inside the 409 `MetaValidationFail` body of `deliverBulk()`, but as a
   * 200 OK response — without consuming a deliver-bulk quota attempt.
   *
   * **This method does NOT change order state.** It is a read-only pre-flight check.
   * Use it before `deliverBulk()` to identify orders with invalid marking metadata
   * (SGTIN/IMEI/UIN/etc.) so they can be fixed in advance, avoiding the guess-and-retry
   * loop of: call `deliverBulk()` → catch 409 → read `metaDetails[]` → fix → retry.
   *
   * Rate limit: 300 requests/min, 200ms interval, burst 20.
   * (Default mirrors `deliverBulk` DBW — WB has not yet published explicit limits.
   * Will be updated via task-15.5 once WB publishes 07-orders-fbw.yaml.)
   *
   * @param request - Request containing array of DBW order IDs to validate (1–1000 items)
   * @returns Per-order metadata validation results in `metaDetails[]`
   * @throws {ValidationError} When `orders` array is empty
   * @throws {ValidationError} When `orders` array exceeds 1000 items
   * @throws {ValidationError} When request body is malformed (4xx propagation)
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {NetworkError} When network request fails or times out
   * @since 3.11.0
   * @see {@link https://dev.wildberries.ru/openapi/orders-dbw}
   * @example
   * ```typescript
   * // Pre-flight pattern: validate → fix → deliver
   * const validation = await sdk.ordersFBW.checkMetaValidation({
   *   orders: [123456, 234567, 345678],
   * });
   *
   * const invalidOrders = validation.metaDetails.filter(d => d.status === 'invalid');
   * if (invalidOrders.length > 0) {
   *   console.log('Orders with invalid metadata:', invalidOrders);
   *   // Fix metadata for invalid orders first (narrow orderId: number | undefined → number):
   *   const fixable = invalidOrders.filter(
   *     (o): o is typeof o & { orderId: number } => o.orderId !== undefined
   *   );
   *   await sdk.ordersFBW.setSgtinBulk({
   *     orders: fixable.map(o => ({ orderId: o.orderId, sgtins: ['correct-sgtin'] })),
   *   });
   * }
   *
   * // Now safe to deliver — no 409 MetaValidationFail expected
   * const result = await sdk.ordersFBW.deliverBulk([123456, 234567, 345678]);
   * ```
   */
  async checkMetaValidation(e) {
    if (e.orders.length === 0)
      throw new b("orders array cannot be empty");
    if (e.orders.length > 1e3)
      throw new b("orders array cannot exceed 1000 items");
    return this.client.post(
      "https://marketplace-api.wildberries.ru/api/marketplace/v3/dbw/orders/meta/details",
      { orders: e.orders },
      { rateLimitKey: "orders-fbw.checkMetaValidationDBW" }
    );
  }
};
var Is = class {
  constructor(e) {
    this.client = e;
  }
  /**
   * Получить баланс продавца
   *
   * Метод возвращает данные виджета баланса на [главной странице](https://seller.wildberries.ru) портала продавцов. <br><br> <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 1 запрос | 1 минута | 1 запрос | </div>
   *
   * @returns Account balance data including currency, current balance, and available withdrawal amount
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/financial-reports-and-accounting#tag/Balans}
   * @example
   * ```typescript
   * const result = await sdk.finances.getAccountBalance();
   * console.log(result);
   * ```
   */
  async getAccountBalance() {
    return this.client.get(
      "https://finance-api.wildberries.ru/api/v1/account/balance",
      { rateLimitKey: "finances.accountBalance" }
    );
  }
  /**
   * Отчёт о продажах по реализации (v5, **deprecated**)
   *
   * @deprecated **This method will be disabled by Wildberries on 2026-07-15.**
   * Migrate to {@link getSalesReportsDetailed} (v1) before that date.
   *
   * **Key migration differences (v5 → v1)**:
   * - HTTP method: GET → POST
   * - Field names: `snake_case` → `camelCase` (e.g., `ppvz_for_pay` → `forPay`)
   * - Money amounts: `number` → `string` (use `parseMoneyAmount()` helper)
   * - Domain: `statistics-api.wildberries.ru` → `finance-api.wildberries.ru`
   * - New `fields[]` parameter for selective field loading
   *
   * See the [migration guide](https://salacoste.github.io/daytona-wildberries-typescript-sdk/guides/migration-finance-reports-v5-to-v1)
   * for complete field mapping and code examples.
   *
   * Метод возвращает детализации к [отчётам реализации](https://seller.wildberries.ru/suppliers-mutual-settlements). <br><br> Данные доступны с 29 января 2024 года. <div class="description_important"> Вы можете выгрузить данные в <a href="https://dev.wildberries.ru/ru/cases/1">Google Таблицы</a> </div> <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 1 запрос | 1 минута | 1 запрос | </div>
   *
   * @param options - Query parameters including required dateFrom and dateTo
   * @returns Array of detailed report items for the specified period
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/financial-reports-and-accounting#tag/Finansovye-otchyoty}
   * @example
   * ```typescript
   * // DEPRECATED — migrate to getSalesReportsDetailed() before 2026-07-15
   * const result = await sdk.finances.getSupplierReportDetailByPeriod({
   *   dateFrom: '2024-01-01',
   *   dateTo: '2024-01-31',
   *   period: 'weekly',
   * });
   * console.log(result);
   * ```
   */
  async getSupplierReportDetailByPeriod(e) {
    return q(
      "FinancesModule.getSupplierReportDetailByPeriod",
      "[DEPRECATED] getSupplierReportDetailByPeriod() is deprecated and will be removed after 2026-07-15. Migrate to getSalesReportsDetailed(). See migration guide: https://salacoste.github.io/daytona-wildberries-typescript-sdk/guides/migration-finance-reports-v5-to-v1"
    ), this.client.get(
      "https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod",
      { params: e, rateLimitKey: "finances.supplierReportDetailByPeriod" }
    );
  }
  /**
   * Категории документов
   *
   * Метод возвращает категории документов для получения [списка документов продавца](/openapi/financial-reports-and-accounting#tag/Dokumenty/paths/~1api~1v1~1documents~1list/get). <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 10 секунд | 1 запрос | 10 секунд | 5 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns List of document categories available for the seller
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/financial-reports-and-accounting#tag/Dokumenty}
   * @example
   * ```typescript
   * const result = await sdk.finances.getDocumentsCategories({ locale: 'ru' });
   * console.log(result);
   * ```
   */
  async getDocumentsCategories(e) {
    return this.client.get(
      "https://documents-api.wildberries.ru/api/v1/documents/categories",
      { params: e, rateLimitKey: "finances.documentsCategories" }
    );
  }
  /**
   * Список документов
   *
   * Метод возвращает список документов продавца. Вы можете получить [один](/openapi/financial-reports-and-accounting#tag/Dokumenty/paths/~1api~1v1~1documents~1download/get) или [несколько](/openapi/financial-reports-and-accounting#tag/Dokumenty/paths/~1api~1v1~1documents~1download~1all/post) документов из полученного списка. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 10 секунд | 1 запрос | 10 секунд | 5 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Paginated list of seller documents with metadata
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @remarks The `sort` and `order` parameters work together — specifying `order` without `sort` has no effect. The `beginTime` and `endTime` parameters define a date range and should be used as a pair.
   * @see {@link https://dev.wildberries.ru/openapi/financial-reports-and-accounting#tag/Dokumenty}
   * @example
   * ```typescript
   * const result = await sdk.finances.getDocumentsList({
   *   locale: 'ru',
   *   sort: 'date',
   *   order: 'desc',
   * });
   * console.log(result);
   * ```
   */
  async getDocumentsList(e) {
    return this.client.get("https://documents-api.wildberries.ru/api/v1/documents/list", {
      params: e,
      rateLimitKey: "finances.documentsList"
    });
  }
  /**
   * Получить документ
   *
   * Метод загружает один документ из [списка документов продавца](/openapi/financial-reports-and-accounting#tag/Dokumenty/paths/~1api~1v1~1documents~1list/get). <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 10 секунд | 1 запрос | 10 секунд | 5 запросов | </div>
   *
   * @param options - Query parameters including required serviceName and extension
   * @returns Document file data for the requested document
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/financial-reports-and-accounting#tag/Dokumenty}
   * @example
   * ```typescript
   * const result = await sdk.finances.getDocumentsDownload({
   *   serviceName: 'act',
   *   extension: 'pdf',
   * });
   * console.log(result);
   * ```
   */
  async getDocumentsDownload(e) {
    return this.client.get(
      "https://documents-api.wildberries.ru/api/v1/documents/download",
      { params: e, rateLimitKey: "finances.documentsDownload" }
    );
  }
  /**
   * Получить документы
   *
   * Метод загружает несколько документов из [списка документов продавца](/openapi/financial-reports-and-accounting#tag/Dokumenty/paths/~1api~1v1~1documents~1list/get). <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 5 минут | 1 запрос | 5 минут | 5 запросов | </div>
   *
   * @param [data] - Request body data
   * @returns Download details for the requested batch of documents
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/financial-reports-and-accounting#tag/Dokumenty}
   * @example
   * ```typescript
   * const result = await sdk.finances.createDownloadAll({
   *   serviceNames: ['act', 'invoice'],
   * });
   * console.log(result);
   * ```
   */
  async createDownloadAll(e) {
    return this.client.post(
      "https://documents-api.wildberries.ru/api/v1/documents/download/all",
      e,
      { rateLimitKey: "finances.createDownloadAll" }
    );
  }
  // ==========================================================================
  // v1 Sales Reports (since v3.7.0)
  // Replaces deprecated GET /api/v5/supplier/reportDetailByPeriod (disabled 2026-07-15)
  // All money amounts are string (not number) — use parseMoneyAmount() helper for math.
  // ==========================================================================
  /**
   * Список отчётов реализации (v1)
   *
   * Returns list of sales reports by report format. Data available from 2025-01-01.
   *
   * **Available token types**: Personal, Service (NOT Basic or Test)
   *
   * Rate limit: 1 req/min, 1 minute interval, burst 1
   *
   * @param data - Request body with dateFrom, dateTo, limit, offset, period
   * @returns Array of SalesReportListItem (money sums as string — use parseMoneyAmount helper)
   * @throws {AuthenticationError} When token type is Basic or Test — this endpoint requires Personal or Service token (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/docs/openapi/financial-reports-and-accounting#tag/Finansovye-otchyoty/operation/postV1SalesReportsList}
   * @since v3.7.0
   * @example
   * ```typescript
   * import { parseMoneyAmount } from 'daytona-wildberries-typescript-sdk';
   *
   * const reports = await sdk.finances.getSalesReportsList({
   *   dateFrom: '2026-03-17',
   *   dateTo: '2026-03-20',
   *   period: 'weekly',
   * });
   * console.log(parseMoneyAmount(reports[0].forPaySum));
   * ```
   */
  async getSalesReportsList(e) {
    return this.client.post(
      "https://finance-api.wildberries.ru/api/finance/v1/sales-reports/list",
      e,
      { rateLimitKey: "finances.salesReportsList" }
    );
  }
  /**
   * Детализации к отчётам реализации за период (v1)
   *
   * Returns detailed rows for sales reports within a date range. Replaces the deprecated v5 method.
   * Data available from 2024-01-29. Supports selective field loading via `fields` parameter.
   *
   * **Available token types**: Personal, Service (NOT Basic or Test)
   *
   * Rate limit: 1 req/min, 1 minute interval, burst 1
   *
   * @param data - Request body with dateFrom, dateTo, limit, rrdId, period, fields
   * @returns Array of SalesReportDetailedItem (~70 fields, money amounts as string — use parseMoneyAmount)
   * @throws {AuthenticationError} When token type is Basic or Test — this endpoint requires Personal or Service token (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/docs/openapi/financial-reports-and-accounting#tag/Finansovye-otchyoty/operation/postV1SalesReportsDetailed}
   * @since v3.7.0
   * @example
   * ```typescript
   * import { parseMoneyAmount } from 'daytona-wildberries-typescript-sdk';
   *
   * const rows = await sdk.finances.getSalesReportsDetailed({
   *   dateFrom: '2026-03-17',
   *   dateTo: '2026-03-20',
   *   limit: 100000,
   *   rrdId: 0,
   *   fields: ['rrdId', 'nmId', 'forPay'],  // Optional: load only specific fields
   * });
   * const totalPayout = rows.reduce((sum, r) => sum + parseMoneyAmount(r.forPay), 0);
   * ```
   */
  async getSalesReportsDetailed(e) {
    return this.client.post(
      "https://finance-api.wildberries.ru/api/finance/v1/sales-reports/detailed",
      e,
      { rateLimitKey: "finances.salesReportsDetailed" }
    );
  }
  /**
   * Детализации к отчётам реализации по ID отчёта (v1)
   *
   * Returns detailed rows for a specific report by its ID. Data available from 2025-01-01.
   *
   * **BigInt precision note**: For daily reports, `reportId` may exceed `Number.MAX_SAFE_INTEGER` (2^53).
   * If you obtained the ID from `getSalesReportsList()` response (which returns `number`),
   * standard JSON parsing may already have truncated precision. For precision-safe handling,
   * fetch the ID via a custom BigInt-aware parser and pass it as `bigint` or `string`.
   *
   * **Available token types**: Personal, Service (NOT Basic or Test)
   *
   * Rate limit: 1 req/min, 1 minute interval, burst 1
   *
   * @param reportId - Report ID (number for typical use, bigint/string for BigInt precision on daily reports)
   * @param data - Request body with optional limit, rrdId, fields
   * @returns Array of SalesReportDetailedItem
   * @throws {AuthenticationError} When token type is Basic or Test — this endpoint requires Personal or Service token (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/docs/openapi/financial-reports-and-accounting#tag/Finansovye-otchyoty/operation/postV1SalesReportsDetailedReportId}
   * @since v3.7.0
   * @example
   * ```typescript
   * // Typical weekly report usage:
   * const rows = await sdk.finances.getSalesReportsDetailedByReportId(307401554);
   *
   * // Daily report with BigInt precision:
   * const rows = await sdk.finances.getSalesReportsDetailedByReportId('9007199254740993', {
   *   fields: ['rrdId', 'nmId', 'retailAmount'],
   * });
   * ```
   */
  async getSalesReportsDetailedByReportId(e, t = {}) {
    return this.client.post(
      `https://finance-api.wildberries.ru/api/finance/v1/sales-reports/detailed/${String(e)}`,
      t,
      { rateLimitKey: "finances.salesReportsDetailedByReportId" }
    );
  }
  // ==========================================================================
  // v1 Acquiring Reports (since v3.7.0) — payment acquisition costs (эквайринг)
  // Available ONLY for Russian sellers. Personal/Service tokens only.
  // ==========================================================================
  /**
   * Список отчётов об издержках на приём платежей (v1)
   *
   * Returns list of acquiring reports. **Available only to Russian sellers.**
   *
   * **Available token types**: Personal, Service (NOT Basic or Test)
   *
   * Rate limit: 1 req/min, 1 minute interval, burst 1
   *
   * @param data - Request body with dateFrom, dateTo, limit, offset
   * @returns Array of AcquiringReportListItem (money sums as string — use parseMoneyAmount helper)
   * @throws {AuthenticationError} When token type is Basic or Test — this endpoint requires Personal or Service token
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/docs/openapi/financial-reports-and-accounting#tag/Finansovye-otchyoty/operation/postV1AcquiringList}
   * @since v3.7.0
   * @example
   * ```typescript
   * import { parseMoneyAmount } from 'daytona-wildberries-typescript-sdk';
   *
   * const reports = await sdk.finances.getAcquiringReportsList({
   *   dateFrom: '2026-03-17',
   *   dateTo: '2026-03-20',
   * });
   * const totalFees = reports.reduce(
   *   (sum, r) => sum + parseMoneyAmount(r.acquiringFeeSum), 0
   * );
   * ```
   */
  async getAcquiringReportsList(e) {
    return this.client.post(
      "https://finance-api.wildberries.ru/api/finance/v1/acquiring/list",
      e,
      { rateLimitKey: "finances.acquiringReportsList" }
    );
  }
  /**
   * Детализации к отчётам об издержках на приём платежей за период (v1)
   *
   * Returns detailed rows for acquiring reports within a date range.
   * **Available only to Russian sellers.** Supports selective field loading via `fields` parameter.
   *
   * **Available token types**: Personal, Service (NOT Basic or Test)
   *
   * Rate limit: 1 req/min, 1 minute interval, burst 1
   *
   * @param data - Request body with dateFrom, dateTo, limit, rrdId, fields
   * @returns Array of AcquiringReportDetailedItem (money amounts as string — use parseMoneyAmount)
   * @throws {AuthenticationError} When token type is Basic or Test — this endpoint requires Personal or Service token
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/docs/openapi/financial-reports-and-accounting#tag/Finansovye-otchyoty/operation/postV1AcquiringDetailed}
   * @since v3.7.0
   * @example
   * ```typescript
   * import { parseMoneyAmount } from 'daytona-wildberries-typescript-sdk';
   *
   * const rows = await sdk.finances.getAcquiringReportsDetailed({
   *   dateFrom: '2026-03-17',
   *   dateTo: '2026-03-20',
   *   limit: 100000,
   *   rrdId: 0,
   *   fields: ['rrdId', 'acquiringBank', 'acquiringFee'],
   * });
   * const totalFees = rows.reduce(
   *   (sum, r) => sum + parseMoneyAmount(r.acquiringFee), 0
   * );
   * ```
   */
  async getAcquiringReportsDetailed(e) {
    return this.client.post(
      "https://finance-api.wildberries.ru/api/finance/v1/acquiring/detailed",
      e,
      { rateLimitKey: "finances.acquiringReportsDetailed" }
    );
  }
  /**
   * Детализации к отчётам об издержках на приём платежей по ID отчёта (v1)
   *
   * Returns detailed rows for a specific acquiring report by ID.
   * **Available only to Russian sellers.**
   *
   * **BigInt precision note**: For daily reports, `reportId` may exceed `Number.MAX_SAFE_INTEGER`.
   * Pass as `bigint` or `string` for precision-safe handling.
   *
   * **Available token types**: Personal, Service (NOT Basic or Test)
   *
   * Rate limit: 1 req/min, 1 minute interval, burst 1
   *
   * @param reportId - Report ID (number/bigint/string)
   * @param data - Request body with optional limit, rrdId, fields
   * @returns Array of AcquiringReportDetailedItem
   * @throws {AuthenticationError} When token type is Basic or Test — this endpoint requires Personal or Service token
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/docs/openapi/financial-reports-and-accounting#tag/Finansovye-otchyoty/operation/postV1AcquiringDetailedReportId}
   * @since v3.7.0
   * @example
   * ```typescript
   * import { parseMoneyAmount } from 'daytona-wildberries-typescript-sdk';
   *
   * // Typical number reportId
   * const rows = await sdk.finances.getAcquiringReportsDetailedByReportId(307401554);
   *
   * // BigInt precision for daily reports — pass as string or bigint
   * const rows = await sdk.finances.getAcquiringReportsDetailedByReportId(
   *   '9007199254740993',
   *   { fields: ['rrdId', 'acquiringFee'] }
   * );
   * ```
   */
  async getAcquiringReportsDetailedByReportId(e, t = {}) {
    return this.client.post(
      `https://finance-api.wildberries.ru/api/finance/v1/acquiring/detailed/${String(e)}`,
      t,
      { rateLimitKey: "finances.acquiringReportsDetailedByReportId" }
    );
  }
};
var Fs = class {
  constructor(e) {
    this.client = e;
  }
  /**
   * Получить список отчётов
   *
   * Метод возвращает список отчётов с расширенной аналитикой продавца. Ответ содержит ID созданных отчётов и статусы генерации.
   *
   * Rate limit: 3 requests/minute, 20-second interval, burst 3
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/seller-analytics#tag/Analitika-prodavca-CSV}
   * @example
   * const result = await sdk.analytics.getNmReportDownloads({});
   * console.log(result);
   */
  async getNmReportDownloads(e) {
    return this.client.get(
      "https://seller-analytics-api.wildberries.ru/api/v2/nm-report/downloads",
      { params: e, rateLimitKey: "analytics.nmReportDownloads" }
    );
  }
  /**
   * Создать отчёт
   *
   * Метод создаёт задание на генерацию отчёта с расширенной аналитикой продавца.
   * Вы можете создать CSV-версии отчётов по воронке продаж или параметрам поиска с группировкой по артикулам WB, предметам, брендам и ярлыкам.
   * В отчётах по воронке продаж можно группировать данные по дням, неделям или месяцам.
   * Параметры `includeSubstitutedSKUs` и `includeSearchTexts` не могут одновременно иметь значение `false`.
   *
   * Rate limit: 3 requests/minute, 20-second interval, burst 3
   *
   * @remarks Daily limit: 20 reports per day per seller account.
   * @param [data] - Request body data
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/seller-analytics#tag/Analitika-prodavca-CSV}
   * @example
   * const result = await sdk.analytics.createNmReportDownload({});
   * console.log(result);
   */
  async createNmReportDownload(e) {
    return this.client.post(
      "https://seller-analytics-api.wildberries.ru/api/v2/nm-report/downloads",
      e,
      { rateLimitKey: "analytics.postNmReportDownloads" }
    );
  }
  /**
   * Сгенерировать отчёт повторно
   *
   * Метод создает повторное задание на генерацию отчёта с расширенной аналитикой продавца.
   * Необходимо, если при генерации отчёта вы получили статус `FAILED`.
   *
   * Rate limit: 3 requests/minute, 20-second interval, burst 3
   *
   * @param data - Request body data
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/seller-analytics#tag/Analitika-prodavca-CSV}
   * @example
   * const result = await sdk.analytics.createDownloadsRetry({});
   * console.log(result);
   */
  async createDownloadsRetry(e) {
    return this.client.post(
      "https://seller-analytics-api.wildberries.ru/api/v2/nm-report/downloads/retry",
      e,
      { rateLimitKey: "analytics.postNmReportDownloadsRetry" }
    );
  }
  /**
   * Получить отчёт
   *
   * Метод возвращает отчёт с расширенной аналитикой продавца по ID задания на генерацию.
   * Можно получить отчёт, который сгенерирован за последние 48 часов.
   * Отчёт будет загружен внутри архива ZIP в формате CSV.
   *
   * Rate limit: 3 requests/minute, 20-second interval, burst 3
   *
   * @param downloadId - ID отчёта (UUID format)
   * @returns Успешно - ZIP архив с CSV файлом
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/seller-analytics#tag/Analitika-prodavca-CSV}
   * @example
   * const result = await sdk.analytics.getDownloadsFile('downloadId-value');
   * console.log(result);
   */
  async getDownloadsFile(e) {
    return this.client.get(
      `https://seller-analytics-api.wildberries.ru/api/v2/nm-report/downloads/file/${e}`,
      { rateLimitKey: "analytics.nmReportDownloadsFile" }
    );
  }
  /**
   * Основная страница
   *
   * Метод формирует набор данных для основной страницы отчёта по поисковым запросам с общей информацией, позициями товаров, данными по видимости и переходам в карточку, данными для таблицы по группам.
   * Параметры `includeSubstitutedSKUs` и `includeSearchTexts` не могут одновременно иметь значение `false`.
   *
   * Rate limit: 3 requests/minute, 20-second interval, burst 3
   *
   * @param data - Request body data
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/seller-analytics#tag/Poiskovye-zaprosy}
   * @example
   * const result = await sdk.analytics.createSearchReportReport({});
   * console.log(result);
   */
  async createSearchReportReport(e) {
    return this.client.post(
      "https://seller-analytics-api.wildberries.ru/api/v2/search-report/report",
      e,
      { rateLimitKey: "analytics.postSearchReportReport" }
    );
  }
  /**
   * Пагинация по группам
   *
   * Метод формирует дополнительные данные к основному отчёту с пагинацией по группам.
   * Пагинация возможна только при наличии фильтра по бренду, предмету или ярлыку.
   * Параметры `includeSubstitutedSKUs` и `includeSearchTexts` не могут одновременно иметь значение `false`.
   *
   * Rate limit: 3 requests/minute, 20-second interval, burst 3
   *
   * @param data - Request body data
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/seller-analytics#tag/Poiskovye-zaprosy}
   * @example
   * const result = await sdk.analytics.createTableGroup({});
   * console.log(result);
   */
  async createTableGroup(e) {
    return this.client.post(
      "https://seller-analytics-api.wildberries.ru/api/v2/search-report/table/groups",
      e,
      { rateLimitKey: "analytics.postSearchReportTableGroups" }
    );
  }
  /**
   * Пагинация по товарам в группе
   *
   * Метод формирует дополнительные данные к основному отчёту с пагинацией по товарам в группе.
   * Пагинация возможна вне зависимости от наличия фильтров.
   * Параметры `includeSubstitutedSKUs` и `includeSearchTexts` не могут одновременно иметь значение `false`.
   *
   * Rate limit: 3 requests/minute, 20-second interval, burst 3
   *
   * @param data - Request body data
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/seller-analytics#tag/Poiskovye-zaprosy}
   * @example
   * const result = await sdk.analytics.createTableDetail({});
   * console.log(result);
   */
  async createTableDetail(e) {
    return this.client.post(
      "https://seller-analytics-api.wildberries.ru/api/v2/search-report/table/details",
      e,
      { rateLimitKey: "analytics.postSearchReportTableDetails" }
    );
  }
  /**
   * Поисковые запросы по товару
   *
   * Метод формирует топ поисковых запросов по товару.
   * Параметры `includeSubstitutedSKUs` и `includeSearchTexts` не могут одновременно иметь значение `false`.
   *
   * Rate limit: 3 requests/minute, 20-second interval, burst 3
   *
   * @param data - Request body data
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/seller-analytics#tag/Poiskovye-zaprosy}
   * @example
   * const result = await sdk.analytics.createProductSearchText({});
   * console.log(result);
   */
  async createProductSearchText(e) {
    return this.client.post(
      "https://seller-analytics-api.wildberries.ru/api/v2/search-report/product/search-texts",
      e,
      { rateLimitKey: "analytics.postSearchReportProductSearchTexts" }
    );
  }
  /**
   * Заказы и позиции по поисковым запросам товара
   *
   * Метод формирует данные для таблицы по количеству заказов и позиций в поиске по запросам покупателя.
   *
   * Rate limit: 3 requests/minute, 20-second interval, burst 3
   *
   * @param data - Request body data
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/seller-analytics#tag/Poiskovye-zaprosy}
   * @example
   * const result = await sdk.analytics.createProductOrder({});
   * console.log(result);
   */
  async createProductOrder(e) {
    return this.client.post(
      "https://seller-analytics-api.wildberries.ru/api/v2/search-report/product/orders",
      e,
      { rateLimitKey: "analytics.postSearchReportProductOrders" }
    );
  }
  /**
   * Данные по группам
   *
   * Метод формирует набор данных об остатках по группам товаров.
   * Группа товаров описывается кортежем `subjectID, brandName, tagID`.
   *
   * Rate limit: 3 requests/minute, 20-second interval, burst 3
   *
   * @param data - Request body data
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/seller-analytics#tag/Istoriya-ostatkov}
   * @example
   * const result = await sdk.analytics.createProductsGroup({});
   * console.log(result);
   */
  async createProductsGroup(e) {
    return this.client.post(
      "https://seller-analytics-api.wildberries.ru/api/v2/stocks-report/products/groups",
      e,
      { rateLimitKey: "analytics.postStocksReportProductsGroups" }
    );
  }
  /**
   * Данные по товарам
   *
   * Метод формирует набор данных об остатках по товарам.
   * Можно получить данные как по отдельным товарам, так и в рамках всего отчёта — если в запросе отсутствуют фильтры: `nmIDs`, `subjectID`, `brandName`, `tagID`.
   *
   * Rate limit: 3 requests/minute, 20-second interval, burst 3
   *
   * @param data - Request body data
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/seller-analytics#tag/Istoriya-ostatkov}
   * @example
   * const result = await sdk.analytics.createProductsProduct({});
   * console.log(result);
   */
  async createProductsProduct(e) {
    return this.client.post(
      "https://seller-analytics-api.wildberries.ru/api/v2/stocks-report/products/products",
      e,
      { rateLimitKey: "analytics.postStocksReportProductsProducts" }
    );
  }
  /**
   * Данные по размерам
   *
   * Метод формирует набор данных об остатках по размерам товара.
   * Товар не имеет размера, если у него единственный размер с `"techSize":"0"`.
   * Данные по складам Маркетплейс (FBS) приходят в агрегированном виде.
   *
   * Rate limit: 3 requests/minute, 20-second interval, burst 3
   *
   * @param data - Request body data
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/seller-analytics#tag/Istoriya-ostatkov}
   * @example
   * const result = await sdk.analytics.createProductsSize({});
   * console.log(result);
   */
  async createProductsSize(e) {
    return this.client.post(
      "https://seller-analytics-api.wildberries.ru/api/v2/stocks-report/products/sizes",
      e,
      { rateLimitKey: "analytics.postStocksReportProductsSizes" }
    );
  }
  /**
   * Данные по складам
   *
   * Метод формирует набор данных об остатках по складам.
   * Данные по складам Маркетплейс (FBS) приходят в агрегированном виде — по всем сразу, без детализации по конкретным складам.
   *
   * Rate limit: 3 requests/minute, 20-second interval, burst 3
   *
   * @param data - Request body data
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/seller-analytics#tag/Istoriya-ostatkov}
   * @example
   * const result = await sdk.analytics.createStocksReportOffice({});
   * console.log(result);
   */
  async createStocksReportOffice(e) {
    return this.client.post(
      "https://seller-analytics-api.wildberries.ru/api/v2/stocks-report/offices",
      e,
      { rateLimitKey: "analytics.postStocksReportOffices" }
    );
  }
  // ============ v3 Sales Funnel Methods ============
  /**
   * Статистика карточек товаров за период (v3)
   *
   * Возвращает отчёт о товарах с ключевыми показателями — переходы в карточку,
   * добавления в корзину, заказы — за текущий и прошлый периоды.
   *
   * Rate limit: 3 requests/minute, 20-second interval, 3-request burst
   *
   * @param data - Request parameters
   * @returns Sales funnel products statistics
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/seller-analytics#tag/Voronka-prodazh}
   * @example
   * const result = await sdk.analytics.getSalesFunnelProducts({
   *   selectedPeriod: { start: '2026-01-01', end: '2026-01-31' },
   *   orderBy: { field: 'orderCount', mode: 'desc' },
   *   limit: 10,
   *   offset: 0,
   * });
   * console.log(result.products);
   */
  async getSalesFunnelProducts(e) {
    return this.client.post(
      "https://seller-analytics-api.wildberries.ru/api/analytics/v3/sales-funnel/products",
      e,
      { rateLimitKey: "analytics.postSalesFunnelProducts" }
    );
  }
  /**
   * Статистика карточек товаров по дням (v3)
   *
   * Возвращает статистику карточек товаров по дням или неделям.
   *
   * Rate limit: 3 requests/minute, 20-second interval, 3-request burst
   *
   * @param data - Request parameters
   * @returns Products history statistics
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/seller-analytics#tag/Voronka-prodazh}
   * @example
   * const result = await sdk.analytics.getSalesFunnelProductsHistory({
   *   selectedPeriod: { start: '2026-01-01', end: '2026-01-07' },
   *   nmIds: [268913787],
   *   aggregationLevel: 'day',
   * });
   * console.log(result);
   */
  async getSalesFunnelProductsHistory(e) {
    return this.client.post(
      "https://seller-analytics-api.wildberries.ru/api/analytics/v3/sales-funnel/products/history",
      e,
      { rateLimitKey: "analytics.postSalesFunnelProductsHistory" }
    );
  }
  /**
   * Статистика групп карточек товаров по дням (v3)
   *
   * Возвращает статистику карточек товаров по дням, сгруппированных по предметам, брендам и ярлыкам.
   *
   * Rate limit: 3 requests/minute, 20-second interval, 3-request burst
   *
   * @param data - Request parameters
   * @returns Grouped history statistics
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/seller-analytics#tag/Voronka-prodazh}
   * @example
   * const result = await sdk.analytics.getSalesFunnelGroupedHistory({
   *   selectedPeriod: { start: '2026-01-01', end: '2026-01-07' },
   *   aggregationLevel: 'day',
   * });
   * console.log(result);
   */
  async getSalesFunnelGroupedHistory(e) {
    return this.client.post(
      "https://seller-analytics-api.wildberries.ru/api/analytics/v3/sales-funnel/grouped/history",
      e,
      { rateLimitKey: "analytics.postSalesFunnelGroupedHistory" }
    );
  }
  /**
   * Текущие остатки на складах WB
   *
   * Возвращает актуальные остатки товаров на складах Wildberries.
   * Данные обновляются раз в 30 минут. Одна строка = один размер на одном складе.
   * Результаты отсортированы по возрастанию nmId.
   *
   * Доступен только для токенов типа Personal и Service.
   *
   * **Заменяет устаревший метод** `GET /api/v1/supplier/stocks`,
   * который будет отключён 23 июня 2026.
   *
   * Rate limit: 3 requests per minute, 20-second interval, burst 1
   *
   * @param data - Filter and pagination parameters (all optional)
   * @param data.nmIds - WB articles to filter (0-1000, empty = all)
   * @param data.chrtIds - Size IDs (only for articles in nmIds)
   * @param data.limit - Rows in response (max 250000, default 250000)
   * @param data.offset - Skip N results for pagination (default 0)
   * @returns Current inventory with warehouse IDs, region names, quantities
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @since 3.4.0
   * @see {@link https://dev.wildberries.ru/docs/openapi/analytics#tag/Istoriya-ostatkov/operation/postV1StocksReportWbWarehouses}
   * @example
   * ```typescript
   * // Get all inventory
   * const stock = await sdk.analytics.getWbWarehousesStock();
   * for (const item of stock.data.items) {
   *   console.log(`${item.warehouseName} (${item.regionName}): ${item.quantity} шт.`);
   * }
   *
   * // With filters and pagination
   * const page = await sdk.analytics.getWbWarehousesStock({
   *   nmIds: [395996251],
   *   limit: 100,
   *   offset: 0,
   * });
   * ```
   */
  async getWbWarehousesStock(e) {
    return this.client.post(
      "https://seller-analytics-api.wildberries.ru/api/analytics/v1/stocks-report/wb-warehouses",
      e ?? {},
      { rateLimitKey: "analytics.postStocksReportWbWarehouses" }
    );
  }
};
var xs = /^\d+:[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}:[0-9a-f]+$/i;
var Ns = {
  MAX_MESSAGE_LENGTH: 1e3,
  MAX_TOTAL_FILE_SIZE: 30 * 1024 * 1024,
  MAX_PER_FILE_SIZE: 5 * 1024 * 1024,
  MAX_REPLYSIGN_LENGTH: 255
};
var { MAX_MESSAGE_LENGTH: it, MAX_TOTAL_FILE_SIZE: Us, MAX_PER_FILE_SIZE: _s, MAX_REPLYSIGN_LENGTH: at } = Ns;
var $s = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".pdf": "application/pdf"
};
function js(r) {
  const e = r.toLowerCase();
  for (const [t, s] of Object.entries($s))
    if (e.endsWith(t)) return s;
  return "application/octet-stream";
}
var Gs = class {
  constructor(e) {
    this.client = e;
  }
  /**
   * Непросмотренные отзывы и вопросы
   *
   * Метод проверяет наличие непросмотренных [вопросов](/openapi/user-communication#tag/Voprosy/paths/~1api~1v1~1questions/get) и [отзывов](/openapi/user-communication#tag/Otzyvy/paths/~1api~1v1~1feedbacks/get) от покупателей. Если у продавца есть непросмотренные вопросы или отзывы, возвращает `true`. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца для всех методов категории <strong>Вопросы и отзывы</strong>: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 3 запроса | 333 миллисекунды | 6 запросов | </div>
   *
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.communications.newFeedbacksQuestions();
  console.log(result);
   */
  async newFeedbacksQuestions() {
    return this.client.get("https://feedbacks-api.wildberries.ru/api/v1/new-feedbacks-questions", {
      rateLimitKey: "communications.newFeedbacksQuestions"
    });
  }
  /**
   * Неотвеченные вопросы
   *
   * Метод возвращает общее количество неотвеченных [вопросов](/openapi/user-communication#tag/Voprosy/paths/~1api~1v1~1questions/get) и количество неотвеченных вопросов за сегодня. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца для всех методов категории <strong>Вопросы и отзывы</strong>: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 3 запроса | 333 миллисекунды | 6 запросов | </div>
   *
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.communications.getQuestionsCountUnanswered();
  console.log(result);
   */
  async getQuestionsCountUnanswered() {
    return this.client.get("https://feedbacks-api.wildberries.ru/api/v1/questions/count-unanswered", {
      rateLimitKey: "communications.questionsCountUnanswered"
    });
  }
  /**
   * Количество вопросов
   *
   * Метод возвращает количество отвеченных или неотвеченных [вопросов](/openapi/user-communication#tag/Voprosy/paths/~1api~1v1~1questions/get) за заданный период. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца для всех методов категории <strong>Вопросы и отзывы</strong>: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 3 запроса | 333 миллисекунды | 6 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.communications.getQuestionsCount({});
  console.log(result);
   */
  async getQuestionsCount(e) {
    return this.client.get("https://feedbacks-api.wildberries.ru/api/v1/questions/count", {
      params: e,
      rateLimitKey: "communications.questionsCount"
    });
  }
  /**
   * Список вопросов
   *
   * Метод возвращает список вопросов по заданным фильтрам. Вы можете: - получить данные отвеченных и неотвеченных вопросов - сортировать вопросы по дате - настроить пагинацию и количество вопросов в ответе <div class="description_important"> Можно получить максимум 10 000 вопросов в одном ответе </div> <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца для всех методов категории <strong>Вопросы и отзывы</strong>: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 3 запроса | 333 миллисекунды | 6 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.communications.questions({});
  console.log(result);
   */
  async questions(e) {
    return this.client.get("https://feedbacks-api.wildberries.ru/api/v1/questions", {
      params: e,
      rateLimitKey: "communications.questions"
    });
  }
  /**
   * Работа с вопросами
   *
   * В зависимости от тела запроса, метод позволяет: - отметить [вопрос](/openapi/user-communication#tag/Voprosy/paths/~1api~1v1~1questions/get) как просмотренный - отклонить вопрос - ответить на вопрос или отредактировать ответ <div class="description_important"> Отредактировать ответ на вопрос можно 1 раз в течение 60 дней после отправки ответа </div> <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца для всех методов категории <strong>Вопросы и отзывы</strong>: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 3 запроса | 333 миллисекунды | 6 запросов | </div>
   *
   * @param [data] - Request body data
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.communications.updateQuestion({});
  console.log(result);
   */
  async updateQuestion(e) {
    return this.client.patch("https://feedbacks-api.wildberries.ru/api/v1/questions", e, {
      rateLimitKey: "communications.patchQuestions"
    });
  }
  /**
   * Получить вопрос по ID
   *
   * Метод возвращает данные [вопроса](/openapi/user-communication#tag/Voprosy/paths/~1api~1v1~1questions/get) по его ID. Далее вы можете [работать с этим вопросом](/openapi/user-communication#tag/Voprosy/paths/~1api~1v1~1questions/patch). <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца для всех методов категории <strong>Вопросы и отзывы</strong>: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 3 запроса | 333 миллисекунды | 6 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.communications.question({});
  console.log(result);
   */
  async question(e) {
    return this.client.get("https://feedbacks-api.wildberries.ru/api/v1/question", {
      params: e,
      rateLimitKey: "communications.question"
    });
  }
  /**
   * Необработанные отзывы
   *
   * Метод возвращает: - количество необработанных [отзывов](/openapi/user-communication#tag/Otzyvy/paths/~1api~1v1~1feedbacks/get) за сегодня и за всё время - среднюю оценку всех отзывов <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца для всех методов категории <strong>Вопросы и отзывы</strong>: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 3 запроса | 333 миллисекунды | 6 запросов | </div>
   *
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.communications.getFeedbacksCountUnanswered();
  console.log(result);
   */
  async getFeedbacksCountUnanswered() {
    return this.client.get("https://feedbacks-api.wildberries.ru/api/v1/feedbacks/count-unanswered", {
      rateLimitKey: "communications.feedbacksCountUnanswered"
    });
  }
  /**
   * Количество отзывов
   *
   * Метод возвращает количество обработанных или необработанных [отзывов](/openapi/user-communication#tag/Otzyvy/paths/~1api~1v1~1feedbacks/get) за заданный период. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца для всех методов категории <strong>Вопросы и отзывы</strong>: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 3 запроса | 333 миллисекунды | 6 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.communications.getFeedbacksCount({});
  console.log(result);
   */
  async getFeedbacksCount(e) {
    return this.client.get("https://feedbacks-api.wildberries.ru/api/v1/feedbacks/count", {
      params: e,
      rateLimitKey: "communications.feedbacksCount"
    });
  }
  /**
   * Список отзывов
   *
   * Метод возвращает список отзывов по заданным фильтрам. Вы можете: - получить данные обработанных и необработанных отзывов - сортировать отзывы по дате - настроить пагинацию и количество отзывов в ответе <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца для всех методов категории <strong>Вопросы и отзывы</strong>: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 3 запроса | 333 миллисекунды | 6 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.communications.feedbacks({});
  console.log(result);
   */
  async feedbacks(e) {
    return this.client.get("https://feedbacks-api.wildberries.ru/api/v1/feedbacks", {
      params: e,
      rateLimitKey: "communications.feedbacks"
    });
  }
  /**
   * Ответить на отзыв
   *
   * Метод позволяет ответить на [отзыв](/openapi/user-communication#tag/Otzyvy/paths/~1api~1v1~1feedbacks/get) покупателя. <div class="description_important"> ID отзыва не валидируется. Если в запросе вы передали некорректный ID, вы не получите ошибку. </div> <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца для всех методов категории <strong>Вопросы и отзывы</strong>: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 3 запроса | 333 миллисекунды | 6 запросов | </div>
   *
   * @param [data] - Request body data
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.communications.createFeedbacksAnswer({});
   */
  async createFeedbacksAnswer(e) {
    return this.client.post("https://feedbacks-api.wildberries.ru/api/v1/feedbacks/answer", e, {
      rateLimitKey: "communications.postFeedbacksAnswer"
    });
  }
  /**
   * Отредактировать ответ на отзыв
   *
   * Метод позволяет отредактировать уже отправленный [ответ на отзыв](/openapi/user-communication#tag/Otzyvy/paths/~1api~1v1~1feedbacks~1answer/post) покупателя. <br><br> Отредактировать ответ можно только один раз в течение 60 дней c момента отправки. <div class="description_important"> ID отзыва не валидируется. Если в запросе вы передали некорректный ID, вы не получите ошибку. </div> <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца для всех методов категории <strong>Вопросы и отзывы</strong>: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 3 запроса | 333 миллисекунды | 6 запросов | </div>
   *
   * @param [data] - Request body data
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.communications.updateFeedbacksAnswer({});
   */
  async updateFeedbacksAnswer(e) {
    return this.client.patch("https://feedbacks-api.wildberries.ru/api/v1/feedbacks/answer", e, {
      rateLimitKey: "communications.patchFeedbacksAnswer"
    });
  }
  /**
   * Возврат товара по ID отзыва
   *
   * Метод запрашивает возврат товара, по которому оставлен [отзыв](/openapi/user-communication#tag/Otzyvy/paths/~1api~1v1~1feedbacks/get). <br><br> Возврат доступен для отзывов с полем `"isAbleReturnProductOrders": true`. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца для всех методов категории <strong>Вопросы и отзывы</strong>: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 3 запроса | 333 миллисекунды | 6 запросов | </div>
   *
   * @param data - Request body data
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.communications.createOrderReturn({});
  console.log(result);
   */
  async createOrderReturn(e) {
    return this.client.post("https://feedbacks-api.wildberries.ru/api/v1/feedbacks/order/return", e, {
      rateLimitKey: "communications.postFeedbacksOrderReturn"
    });
  }
  /**
   * Получить отзыв по ID
   *
   * Метод возвращает данные [отзыва](/openapi/user-communication#tag/Otzyvy/paths/~1api~1v1~1feedbacks/get) по его ID. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца для всех методов категории <strong>Вопросы и отзывы</strong>: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 3 запроса | 333 миллисекунды | 6 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.communications.feedback({});
  console.log(result);
   */
  async feedback(e) {
    return this.client.get("https://feedbacks-api.wildberries.ru/api/v1/feedback", {
      params: e,
      rateLimitKey: "communications.feedback"
    });
  }
  /**
   * Список архивных отзывов
   *
   * Метод возвращает список архивных [отзывов](/openapi/user-communication#tag/Otzyvy/paths/~1api~1v1~1feedbacks/get). <br><br> Отзыв становится архивным, если: - на отзыв получен ответ - на отзыв не получен ответ в течение 30 дней - в отзыве нет текста и фото <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца для всех методов категории <strong>Вопросы и отзывы</strong>: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 3 запроса | 333 миллисекунды | 6 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.communications.getFeedbacksArchive({});
  console.log(result);
   */
  async getFeedbacksArchive(e) {
    return this.client.get("https://feedbacks-api.wildberries.ru/api/v1/feedbacks/archive", {
      params: e,
      rateLimitKey: "communications.feedbacksArchive"
    });
  }
  /**
   * Список чатов
   *
   * Метод возвращает список всех чатов продавца. По этим данным можно получить [события чатов](/openapi/user-communication#tag/Chat-s-pokupatelyami/paths/~1api~1v1~1seller~1events/get) или [отправить сообщение покупателю](/openapi/user-communication#tag/Chat-s-pokupatelyami/paths/~1api~1v1~1seller~1message/post). <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 10 секунд | 10 запросов | 1 секунда | 10 запросов | </div>
   *
   * **v3.13.0 — replySign format change (deadline 2026-06-04)**: WB updated the `replySign` field
   * returned by this endpoint. If you cache `replySign` values, you must refresh them via this
   * method before calling `createSellerMessage()` after 2026-06-04 — old-format values will be
   * rejected by WB with HTTP 400. New format: `<version>:<UUID>:<crypto-signature>` (~135 chars).
   * See docs/guides/chat-replysign-format-migration.md.
   *
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const chats = await sdk.communications.getSellerChats();
  console.log(chats.result);
   */
  async getSellerChats() {
    return this.client.get(
      "https://buyer-chat-api.wildberries.ru/api/v1/seller/chats",
      { rateLimitKey: "communications.sellerChats" }
    );
  }
  /**
   * События чатов
   *
   * Метод возвращает список событий всех [чатов с покупателями](/openapi/user-communication#tag/Chat-s-pokupatelyami/paths/~1api~1v1~1seller~1chats/get). Чтобы получить все события: 1. Сделайте первый запрос без параметра `next`. 2. Повторяйте запрос со значением параметра `next` из ответа на предыдущий запрос, пока `totalEvents` не станет равным `0`. Это будет означать, что вы получили все события. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 10 секунд | 10 запросов | 1 секунда | 10 запросов | </div>
   *
   * **v3.13.0 — replySign format change (deadline 2026-06-04)**: when `Event.isNewChat` is `true`,
   * the event includes a `replySign` field in the new format (`<version>:<UUID>:<crypto-signature>`).
   * Old-format `replySign` values (e.g. cached from before 2026-06-04) will be rejected by WB after
   * the deadline. Prefer refreshing via `getSellerChats()` which always returns the latest values.
   * See docs/guides/chat-replysign-format-migration.md.
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.communications.getSellerEvents({});
  console.log(result);
   */
  async getSellerEvents(e) {
    return this.client.get(
      "https://buyer-chat-api.wildberries.ru/api/v1/seller/events",
      {
        params: e,
        rateLimitKey: "communications.sellerEvents"
      }
    );
  }
  /**
     * Отправить сообщение покупателю (multipart/form-data)
     *
     * Метод отправляет сообщение в [чат с покупателем](/openapi/user-communication#tag/Chat-s-pokupatelyami/paths/~1api~1v1~1seller~1chats/get). <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 10 секунд | 10 запросов | 1 секунда | 10 запросов | </div>
     *
     * **v3.13.0 fix**: this method previously took zero parameters and always sent an empty body
     * (broken since introduction). It now requires a `data` parameter with `replySign`.
     *
     * **replySign deadline 2026-06-04**: WB rejects old-format `replySign` values with HTTP 400.
     * Always fetch a fresh `replySign` from `getSellerChats()` before sending. New-format pattern:
     * `<version>:<UUID>:<crypto-signature>` (~135 chars, e.g. `1:1e265a58-a120-b178-008c-60af2460207c:66f136...`).
     * If you pass a value that does not match this pattern the SDK emits a one-time `console.warn`
     * (see `warnOnce` — key `communications.createSellerMessage:legacy-replysign-format`).
     * See docs/guides/chat-replysign-format-migration.md.
     *
     * @param data - Request body: `replySign` (required), optional `message` and `file` attachments
     * @returns Успешно
     * @throws {ValidationError} When `replySign` is missing/empty/exceeds 255 chars, `message` > 1000 chars, or total file size > 30 MB
     * @throws {AuthenticationError} When API key is invalid (401/403)
     * @throws {RateLimitError} When rate limit exceeded (429)
     * @throws {NetworkError} When network request fails or times out
     * @example
    // 1. Fetch chats to get a fresh replySign
    const chats = await sdk.communications.getSellerChats();
    const chat = chats.result?.[0];
    if (!chat?.replySign) throw new Error('No chat found');
  
    // 2. Send message (optionally with attachments)
    const result = await sdk.communications.createSellerMessage({
      replySign: chat.replySign,
      message: 'Thank you for your order!',
    });
    console.log(result);
     */
  async createSellerMessage(e) {
    if (e == null)
      throw new b("data is required: pass { replySign, message?, file? }");
    if (e.replySign == null || typeof e.replySign != "string" || e.replySign.trim().length === 0)
      throw new b("replySign is required (string, non-empty after trim)");
    if (e.replySign.length > at)
      throw new b(`replySign exceeds maxLength ${String(at)}`);
    if (e.message && e.message.length > it)
      throw new b(`message exceeds maxLength ${String(it)}`);
    if (e.file) {
      let s = 0;
      for (const i of e.file) {
        const a = i instanceof Blob ? i.size : i.content.length;
        if (a > _s)
          throw new b(
            `file size exceeds 5 MB (got ${String(a)} bytes). WB limit: 5 MB per file.`
          );
        s += a;
      }
      if (s > Us)
        throw new b(`total file size exceeds 30 MB (got ${String(s)} bytes)`);
    }
    xs.test(e.replySign) || q(
      "communications.createSellerMessage:legacy-replysign-format",
      "communications.createSellerMessage: `replySign` does not match the expected new-format pattern (version:UUID:signature). WB API rejects old-format `replySign` after 2026-06-04. Refresh via `getSellerChats()` to get current-format values. See docs/guides/chat-replysign-format-migration.md."
    );
    const t = new FormData();
    if (t.append("replySign", e.replySign), e.message && t.append("message", e.message), e.file)
      for (const s of e.file)
        if (s instanceof Blob)
          t.append("file", s);
        else {
          const i = js(s.filename);
          t.append("file", new Blob([s.content], { type: i }), s.filename);
        }
    return this.client.post(
      "https://buyer-chat-api.wildberries.ru/api/v1/seller/message",
      t,
      {
        rateLimitKey: "communications.postSellerMessage",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- axios + FormData auto-sets
        // multipart/form-data boundary; overriding to undefined removes the default application/json
        headers: { "Content-Type": void 0 }
      }
    );
  }
  /**
   * Получить файл из сообщения
   *
   * Метод возвращает файл или изображение из сообщения по его ID. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 10 секунд | 10 запросов | 1 секунда | 10 запросов | </div>
   *
   * @param id - ID файла, см. значение поля `downloadID` в методе [События чатов](https://dev.wildberries.ru/openapi/user-communication#tag/Chat-s-pokupatelyami/paths/~1api~1v1~1seller~1events/get)
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.communications.getSellerDownload('id-value');
  console.log(result);
   */
  async getSellerDownload(e) {
    return this.client.get(
      `https://buyer-chat-api.wildberries.ru/api/v1/seller/download/${e}`,
      {
        rateLimitKey: "communications.sellerDownload"
      }
    );
  }
  /**
   * Заявки покупателей на возврат
   *
   * Метод возвращает заявки покупателей на возврат товаров за последние 14 дней. Вы можете [отвечать на эти заявки](/openapi/user-communication#tag/Vozvraty-pokupatelyami/paths/~1api~1v1~1claim/patch). <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 20 запросов | 3 секунды | 10 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.communications.claims({});
  console.log(result);
   */
  async claims(e) {
    return this.client.get("https://returns-api.wildberries.ru/api/v1/claims", {
      params: e,
      rateLimitKey: "communications.claims"
    });
  }
  /**
   * Ответ на заявку покупателя
   *
   * Метод отправляет ответ на [заявку](/openapi/user-communication#tag/Vozvraty-pokupatelyami/paths/~1api~1v1~1claims/get) покупателя на возврат товаров. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 20 запросов | 3 секунды | 10 запросов | </div>
   *
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.communications.updateClaim();
  console.log(result);
   */
  async updateClaim() {
    return this.client.patch(
      "https://returns-api.wildberries.ru/api/v1/claim",
      void 0,
      {
        rateLimitKey: "communications.patchClaim"
      }
    );
  }
  // ============================================================================
  // Pinned Reviews Methods (Закреплённые отзывы)
  // ============================================================================
  /**
   * Get count of pinned/unpinned reviews
   *
   * Returns the count of pinned and unpinned reviews for the given filters.
   * Unpinned reviews are only those that were automatically unpinned due to reasons
   * specified in the `unpinnedCause` field.
   *
   * Rate limit: 3 requests per second with 333ms interval, burst of 6 requests.
   *
   * @param params - Optional filter parameters
   * @returns Count of reviews matching the filter
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/user-communication#tag/Zakreplyonnye-otzyvy}
   * @example
   * ```typescript
   * // Get count of all pinned reviews
   * const count = await sdk.communications.getPinnedFeedbacksCount({ state: 'pinned' });
   * console.log(`Pinned reviews: ${count.data}`);
   *
   * // Get count of pinned reviews on product cards
   * const cardCount = await sdk.communications.getPinnedFeedbacksCount({
   *   state: 'pinned',
   *   pinOn: 'nm'
   * });
   * ```
   */
  async getPinnedFeedbacksCount(e) {
    return this.client.get(
      "https://feedbacks-api.wildberries.ru/api/feedbacks/v1/pins/count",
      { params: e, rateLimitKey: "communications.getPinnedFeedbacksCount" }
    );
  }
  /**
   * Get limits for pinning reviews
   *
   * Returns the limits for pinning reviews by subscription and tariff option.
   * Shows total limits, used count, remaining slots, and per-unit limits.
   *
   * Rate limit: 3 requests per second with 333ms interval, burst of 6 requests.
   *
   * @returns Limits data for subscription and tariff
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/user-communication#tag/Zakreplyonnye-otzyvy}
   * @example
   * ```typescript
   * const limits = await sdk.communications.getPinnedFeedbacksLimits();
   * if (limits.data.subscription) {
   *   console.log(`Subscription remaining: ${limits.data.subscription.remaining}`);
   * }
   * if (limits.data.tariff) {
   *   console.log(`Tariff remaining: ${limits.data.tariff.remaining}`);
   * }
   * ```
   */
  async getPinnedFeedbacksLimits() {
    return this.client.get(
      "https://feedbacks-api.wildberries.ru/api/feedbacks/v1/pins/limits",
      { rateLimitKey: "communications.getPinnedFeedbacksLimits" }
    );
  }
  /**
   * Get list of pinned/unpinned reviews
   *
   * Returns a list of pinned and unpinned reviews with pagination support.
   * Unpinned reviews are only those that were automatically unpinned due to reasons
   * specified in the `unpinnedCause` field.
   *
   * Rate limit: 3 requests per second with 333ms interval, burst of 6 requests.
   *
   * @param params - Optional filter and pagination parameters
   * @returns List of pinned/unpinned review items with pagination cursor
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/user-communication#tag/Zakreplyonnye-otzyvy}
   * @example
   * ```typescript
   * // Get first page of pinned reviews
   * const response = await sdk.communications.getPinnedFeedbacks({
   *   state: 'pinned',
   *   limit: 100
   * });
   * console.log(`Found ${response.data.length} pinned reviews`);
   *
   * // Get next page if available
   * if (response.next) {
   *   const nextPage = await sdk.communications.getPinnedFeedbacks({
   *     state: 'pinned',
   *     next: response.next
   *   });
   * }
   * ```
   */
  async getPinnedFeedbacks(e) {
    return this.client.get(
      "https://feedbacks-api.wildberries.ru/api/feedbacks/v1/pins",
      { params: e, rateLimitKey: "communications.getPinnedFeedbacks" }
    );
  }
  /**
   * Pin reviews to product cards or merged groups
   *
   * Pins reviews to a product card or group of merged product cards.
   * Requires an active Jam subscription or tariff option for pinning reviews.
   * Maximum 500 reviews can be pinned in a single request.
   *
   * Rate limit: 3 requests per second with 333ms interval, burst of 6 requests.
   *
   * @param data - Array of reviews to pin (max 500 items)
   * @returns Result of pin operations with success/error details per item
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400)
   * @throws {ForbiddenError} When no active subscription or tariff (403)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/user-communication#tag/Zakreplyonnye-otzyvy}
   * @example
   * ```typescript
   * const result = await sdk.communications.pinFeedback([
   *   {
   *     pinMethod: 'subscription',
   *     pinOn: 'imt',
   *     feedbackId: 'VlbkVVl7mtw37wyWkJZz'
   *   },
   *   {
   *     pinMethod: 'tariff',
   *     pinOn: 'nm',
   *     feedbackId: 'DibuRAImknLyiqgzvGcU'
   *   }
   * ]);
   *
   * result.data.forEach(item => {
   *   if (item.isErrors) {
   *     console.log(`Failed to pin ${item.feedbackId}:`, item.errors);
   *   } else {
   *     console.log(`Pinned ${item.feedbackId} with pinId: ${item.pinId}`);
   *   }
   * });
   * ```
   */
  async pinFeedback(e) {
    return this.client.post(
      "https://feedbacks-api.wildberries.ru/api/feedbacks/v1/pins",
      e,
      { rateLimitKey: "communications.pinFeedback" }
    );
  }
  /**
   * Unpin reviews from product cards or merged groups
   *
   * Unpins reviews using their pin operation IDs (pinId).
   * Get pinId values from the getPinnedFeedbacks method.
   * Maximum 500 pin IDs can be unpinned in a single request.
   *
   * Rate limit: 3 requests per second with 333ms interval, burst of 6 requests.
   *
   * @param data - Array of pin IDs to unpin (max 500 items)
   * @returns Array of successfully unpinned pin IDs
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/user-communication#tag/Zakreplyonnye-otzyvy}
   * @example
   * ```typescript
   * // Get pinned reviews first to obtain pinIds
   * const pinned = await sdk.communications.getPinnedFeedbacks({ state: 'pinned' });
   * const pinIdsToUnpin = pinned.data.slice(0, 3).map(item => item.pinId);
   *
   * // Unpin the reviews
   * const result = await sdk.communications.unpinFeedback(pinIdsToUnpin);
   * console.log(`Successfully unpinned: ${result.data.join(', ')}`);
   * ```
   */
  async unpinFeedback(e) {
    return this.client.delete(
      "https://feedbacks-api.wildberries.ru/api/feedbacks/v1/pins",
      e,
      { rateLimitKey: "communications.unpinFeedback" }
    );
  }
};
var Ws = class {
  constructor(e) {
    this.client = e;
  }
  /**
   * Склады
   *
   * Метод возвращает количество остатков товаров на складах WB.<br>Данные обновляются раз в 30 минут. <br><br> Для одного ответа в системе установлено условное ограничение 60000 строк. Поэтому, чтобы получить все остатки, может потребоваться более, чем один запрос. Во втором и далее запросе в параметре `dateFrom` используйте полное значение поля `lastChangeDate` из последней строки ответа на предыдущий запрос.<br> Если в ответе отдаётся пустой массив `[]`, все остатки уже выгружены. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 1 запрос | 1 минута | 1 запрос | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.getSupplierStocks({});
   * console.log(result);
   */
  async getSupplierStocks(e) {
    return this.client.get(
      "https://statistics-api.wildberries.ru/api/v1/supplier/stocks",
      { params: e, rateLimitKey: "reports.supplierStocks" }
    );
  }
  /**
   * Заказы
   *
   * Метод возвращает информацию обо всех заказах.<br>Данные обновляются раз в 30 минут.<br><br> 1 строка = 1 заказ = 1 cборочное задание = 1 единица товара.<br>Для определения заказа рекомендуем использовать поле `srid`.<br><br> Информация о заказе хранится 90 дней с момента оформления.<br><br> Для одного ответа на запрос с `flag=0` или без `flag` в системе установлено условное ограничение 80000 строк. Поэтому, чтобы получить все заказы, может потребоваться более, чем один запрос. Во втором и далее запросе в параметре `dateFrom` используйте полное значение поля `lastChangeDate` из последней строки ответа на предыдущий запрос.<br> Если в ответе отдаётся пустой массив `[]`, все заказы уже выгружены. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 1 запрос | 1 минута | 1 запрос | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.getSupplierOrders({});
   * console.log(result);
   */
  async getSupplierOrders(e) {
    return this.client.get(
      "https://statistics-api.wildberries.ru/api/v1/supplier/orders",
      { params: e, rateLimitKey: "reports.supplierOrders" }
    );
  }
  /**
   * Продажи
   *
   * Метод возвращает информацию о продажах и возвратах.<br>Данные обновляются раз в 30 минут.<br><br> 1 строка = 1 заказ = 1 cборочное задание = 1 единица товара.<br>Для определения заказа рекомендуем использовать поле `srid`.<br><br> Информация о заказе хранится 90 дней с момента оформления.<br><br> Для одного ответа на запрос с `flag=0` или без `flag` в системе установлено условное ограничение 80000 строк. Поэтому, чтобы получить все продажи и возвраты, может потребоваться более, чем один запрос. Во втором и далее запросе в параметре `dateFrom `используйте полное значение поля `lastChangeDate` из последней строки ответа на предыдущий запрос.<br> Если в ответе отдаётся пустой массив `[]`, все продажи и возвраты уже выгружены. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 1 запрос | 1 минута | 1 запрос | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.getSupplierSales({});
   * console.log(result);
   */
  async getSupplierSales(e) {
    return this.client.get(
      "https://statistics-api.wildberries.ru/api/v1/supplier/sales",
      { params: e, rateLimitKey: "reports.supplierSales" }
    );
  }
  /**
   * Получить отчёт
   *
   * Метод возвращает отчёт с [операциями по товарам с обязательной маркировкой](https://seller.wildberries.ru/analytics-reports/excise-report).<br><br> Данный отчёт можно сохранить в [формате таблиц](https://dev.wildberries.ru/cases/1). <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 5 часов | 10 запросов | 30 минут | 10 запросов | </div>
   *
   * @param [options] - Query parameters
   * @param [data] - Request body data
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.createAnalyticsExciseReport({}, {});
   * console.log(result);
   */
  async createAnalyticsExciseReport(e, t) {
    return this.client.post(
      "https://seller-analytics-api.wildberries.ru/api/v1/analytics/excise-report",
      t,
      { params: e, rateLimitKey: "reports.postAnalyticsExciseReport" }
    );
  }
  /**
   * Создать отчёт
   *
   * Метод создаёт [задание на генерацию](/openapi/reports#tag/Otchyot-ob-ostatkah-na-skladah/paths/~1api~1v1~1warehouse_remains~1tasks~1%7Btask_id%7D~1status/get) отчёта об [остатках на складах WB](/openapi/reports#tag/Otchyot-ob-ostatkah-na-skladah/paths/~1api~1v1~1warehouse_remains~1tasks~1%7Btask_id%7D~1download/get).<br><br> Параметры `groupBy` и `filter` (группировки и фильтры) можно задать в любой комбинации — аналогично [версии](https://seller.wildberries.ru/analytics-reports/warehouse-remains) в личном кабинете. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 1 запрос | 1 минута | 5 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.warehouseRemains({});
   * console.log(result);
   */
  async warehouseRemains(e) {
    return this.client.get(
      "https://seller-analytics-api.wildberries.ru/api/v1/warehouse_remains",
      { params: e, rateLimitKey: "reports.warehouse_remains" }
    );
  }
  /**
   * Проверить статус задания на генерацию отчёта об остатках на складах WB
   *
   * @param task_id - ID задания на генерацию
   * @returns Статус задания
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.getWarehouseRemainsTaskStatus('task-uuid');
   * console.log(result.data?.status);
   */
  async getWarehouseRemainsTaskStatus(e) {
    return this.client.get(
      `https://seller-analytics-api.wildberries.ru/api/v1/warehouse_remains/tasks/${e}/status`,
      { rateLimitKey: "reports.warehouse_remainsTasksStatus" }
    );
  }
  /**
   * Получить отчёт об остатках на складах WB
   *
   * @param task_id - ID задания на генерацию
   * @returns Данные отчёта
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.downloadWarehouseRemainsReport('task-uuid');
   * console.log(result);
   */
  async downloadWarehouseRemainsReport(e) {
    return this.client.get(
      `https://seller-analytics-api.wildberries.ru/api/v1/warehouse_remains/tasks/${e}/download`,
      { rateLimitKey: "reports.warehouse_remainsTasksDownload" }
    );
  }
  /**
   * Самовыкупы
   *
   * Метод возвращает отчёт об удержаниях за самовыкупы. Отчёт формируется каждую неделю по средам, до 7:00 по московскому времени, и содержит данные за одну неделю.<br><br> Удержание за самовыкуп — 30% от стоимости товаров.<br>Минимальная сумма всех удержаний — 100 000 ₽, если за неделю в ПВЗ привезли ваших товаров больше, чем на сумму 100 000 ₽.<br><br> Данные доступны с августа 2023. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 100 минут | 10 запросов | 10 минут | 10 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.getAnalyticsAntifraudDetails({});
   * console.log(result);
   */
  async getAnalyticsAntifraudDetails(e) {
    return this.client.get(
      "https://seller-analytics-api.wildberries.ru/api/v1/analytics/antifraud-details",
      { params: e, rateLimitKey: "reports.analyticsAntifraudDetails" }
    );
  }
  /**
   * Маркировка товара
   *
   * Метод возвращает отчёт о штрафах за отсутствие обязательной маркировки товаров.<br> В отчёте представлены фотографии товаров, на которых маркировка отсутствует либо не считывается.<br><br> Можно получить данные максимум за 31 день. Данные доступны с марта 2024. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 10 минут | 10 запросов | 1 минута | 10 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.getAnalyticsGoodsLabeling({});
   * console.log(result);
   */
  async getAnalyticsGoodsLabeling(e) {
    return this.client.get(
      "https://seller-analytics-api.wildberries.ru/api/v1/analytics/goods-labeling",
      { params: e, rateLimitKey: "reports.analyticsGoodsLabeling" }
    );
  }
  /**
   * Создать отчёт
   *
   * Метод создаёт [задание на генерацию](/openapi/reports#tag/Platnaya-priyomka/paths/~1api~1v1~1acceptance_report~1tasks~1%7Btask_id%7D~1status/get) отчёта о [платной приёмке](/openapi/reports#tag/Platnaya-priyomka/paths/~1api~1v1~1acceptance_report~1tasks~1%7Btask_id%7D~1download/get).<br><br> Можно получить отчёт максимум за 31 день. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 1 запрос | 1 минута | 1 запрос | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.acceptanceReport({});
   * console.log(result);
   */
  async acceptanceReport(e) {
    return this.client.get(
      "https://seller-analytics-api.wildberries.ru/api/v1/acceptance_report",
      { params: e, rateLimitKey: "reports.acceptance_report" }
    );
  }
  /**
   * Проверить статус задания на генерацию отчёта о платной приёмке
   *
   * @param task_id - ID задания на генерацию
   * @returns Статус задания
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.getAcceptanceReportTaskStatus('task-uuid');
   * console.log(result.data?.status);
   */
  async getAcceptanceReportTaskStatus(e) {
    return this.client.get(
      `https://seller-analytics-api.wildberries.ru/api/v1/acceptance_report/tasks/${e}/status`,
      { rateLimitKey: "reports.acceptance_reportTasksStatus" }
    );
  }
  /**
   * Получить отчёт о платной приёмке
   *
   * @param task_id - ID задания на генерацию
   * @returns Данные отчёта
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.downloadAcceptanceReport('task-uuid');
   * console.log(result);
   */
  async downloadAcceptanceReport(e) {
    return this.client.get(
      `https://seller-analytics-api.wildberries.ru/api/v1/acceptance_report/tasks/${e}/download`,
      { rateLimitKey: "reports.acceptance_reportTasksDownload" }
    );
  }
  /**
   * Создать отчёт
   *
   * Метод создаёт [задание на генерацию](/openapi/reports#tag/Platnoe-hranenie/paths/~1api~1v1~1paid_storage~1tasks~1%7Btask_id%7D~1status/get) отчёта о [платном хранении](/openapi/reports#tag/Platnoe-hranenie/paths/~1api~1v1~1paid_storage~1tasks~1%7Btask_id%7D~1download/get).<br><br> Можно получить отчёт максимум за 8 дней. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 1 запрос | 1 минута | 5 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.paidStorage({});
   * console.log(result);
   */
  async paidStorage(e) {
    return this.client.get(
      "https://seller-analytics-api.wildberries.ru/api/v1/paid_storage",
      { params: e, rateLimitKey: "reports.paid_storage" }
    );
  }
  /**
   * Проверить статус задания на генерацию отчёта о платном хранении
   *
   * @param task_id - ID задания на генерацию
   * @returns Статус задания
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.getPaidStorageTaskStatus('task-uuid');
   * console.log(result.data?.status);
   */
  async getPaidStorageTaskStatus(e) {
    return this.client.get(
      `https://seller-analytics-api.wildberries.ru/api/v1/paid_storage/tasks/${e}/status`,
      { rateLimitKey: "reports.paid_storageTasksStatus" }
    );
  }
  /**
   * Получить отчёт о платном хранении
   *
   * @param task_id - ID задания на генерацию
   * @returns Данные отчёта
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.downloadPaidStorageReport('task-uuid');
   * console.log(result);
   */
  async downloadPaidStorageReport(e) {
    return this.client.get(
      `https://seller-analytics-api.wildberries.ru/api/v1/paid_storage/tasks/${e}/download`,
      { rateLimitKey: "reports.paid_storageTasksDownload" }
    );
  }
  /**
   * Получить отчёт
   *
   * Метод возвращает отчёт с [данными продаж, сгруппированных по регионам стран](https://seller.wildberries.ru/analytics-reports/region-sale).<br><br> Можно получить отчёт максимум за 31 день. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 10 секунд | 1 запрос | 10 секунд | 5 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.getAnalyticsRegionSale({});
   * console.log(result);
   */
  async getAnalyticsRegionSale(e) {
    return this.client.get(
      "https://seller-analytics-api.wildberries.ru/api/v1/analytics/region-sale",
      { params: e, rateLimitKey: "reports.analyticsRegionSale" }
    );
  }
  /**
   * Бренды продавца
   *
   * Метод возвращает список брендов продавца для отчёта о [доле бренда в продажах](https://seller.wildberries.ru/analytics-reports/brand-share). <br><br> Можно получить только бренды, которые: - Продавались за последние 90 дней. - Есть на складе WB. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 1 запрос | 1 минута | 10 запросов | </div>
   *
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.getBrandShareBrands();
   * console.log(result);
   */
  async getBrandShareBrands() {
    return this.client.get(
      "https://seller-analytics-api.wildberries.ru/api/v1/analytics/brand-share/brands",
      { rateLimitKey: "reports.analyticsBrandShareBrands" }
    );
  }
  /**
   * Родительские категории бренда
   *
   * Метод возвращает родительские категории бренда продавца для отчёта о [доле бренда в продажах](https://seller.wildberries.ru/analytics-reports/brand-share).<br><br> Можно получить отчёт максимум за 365 дней. Данные доступны с 1 ноября 2022. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 5 секунд | 1 запрос | 5 секунд | 20 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.getBrandShareParentSubjects({});
   * console.log(result);
   */
  async getBrandShareParentSubjects(e) {
    return this.client.get(
      "https://seller-analytics-api.wildberries.ru/api/v1/analytics/brand-share/parent-subjects",
      { params: e, rateLimitKey: "reports.analyticsBrandShareParentSubjects" }
    );
  }
  /**
   * Получить отчёт
   *
   * Метод возвращает отчёт о [доле бренда продавца в продажах](https://seller.wildberries.ru/analytics-reports/brand-share). <br><br> Можно получить отчёт максимум за 365 дней. Данные доступны с 1 ноября 2022. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 5 секунд | 1 запрос | 5 секунд | 20 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.getAnalyticsBrandShare({});
   * console.log(result);
   */
  async getAnalyticsBrandShare(e) {
    return this.client.get(
      "https://seller-analytics-api.wildberries.ru/api/v1/analytics/brand-share",
      { params: e, rateLimitKey: "reports.analyticsBrandShare" }
    );
  }
  /**
   * Заблокированные карточки
   *
   * Метод возвращает список [заблокированных карточек товаров продавца](https://seller.wildberries.ru/analytics-reports/banned-products) с причинами блокировки. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 10 секунд | 1 запрос | 10 секунд | 6 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.getBannedProductsBlocked({});
   * console.log(result);
   */
  async getBannedProductsBlocked(e) {
    return this.client.get(
      "https://seller-analytics-api.wildberries.ru/api/v1/analytics/banned-products/blocked",
      { params: e, rateLimitKey: "reports.analyticsBannedProductsBlocked" }
    );
  }
  /**
   * Скрытые из каталога
   *
   * Метод возвращает список [товаров продавца, скрытых из каталога](https://seller.wildberries.ru/analytics-reports/banned-products/shadowed). <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 10 секунд | 1 запрос | 10 секунд | 6 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.getBannedProductsShadowed({});
   * console.log(result);
   */
  async getBannedProductsShadowed(e) {
    return this.client.get(
      "https://seller-analytics-api.wildberries.ru/api/v1/analytics/banned-products/shadowed",
      { params: e, rateLimitKey: "reports.analyticsBannedProductsShadowed" }
    );
  }
  /**
   * Получить отчёт
   *
   * Метод возвращает отчёт о [возвратах товаров продавцу](https://seller.wildberries.ru/analytics-reports/goods-return). <br><br> Можно получить отчёт максимум за 31 день. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 1 запрос | 1 минута | 10 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.reports.getAnalyticsGoodsReturn({});
   * console.log(result);
   */
  async getAnalyticsGoodsReturn(e) {
    return this.client.get(
      "https://seller-analytics-api.wildberries.ru/api/v1/analytics/goods-return",
      { params: e, rateLimitKey: "reports.analyticsGoodsReturn" }
    );
  }
  // ==========================================================================
  // New Deduction Endpoints - EPIC 44
  // ==========================================================================
  /**
   * Занижение габаритов упаковки (штрафы)
   *
   * Метод возвращает отчёт об удержаниях за занижение габаритов упаковки.
   *
   * Rate limit: 1 req/min, 1 min interval, burst 1
   *
   * @param options - Query parameters
   * @param options.dateFrom - Start of reporting period (ISO 8601)
   * @param options.dateTo - End of reporting period (ISO 8601, required)
   * @param options.limit - Number of items in response (max 1000, required)
   * @param options.offset - Number of items to skip (default 0)
   * @returns Penalty reports with total count
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see EPIC 44 - New endpoint replacing tab=penalty on old warehouse-measurements
   * @example
   * const result = await sdk.reports.getMeasurementPenalties({
   *   dateTo: '2026-02-06',
   *   limit: 100
   * });
   * console.log(result.data?.reports);
   */
  async getMeasurementPenalties(e) {
    return this.client.get(
      "https://seller-analytics-api.wildberries.ru/api/analytics/v1/measurement-penalties",
      { params: e, rateLimitKey: "reports.measurementPenalties" }
    );
  }
  /**
   * Замеры склада
   *
   * Метод возвращает отчёт о замерах склада.
   *
   * Rate limit: 1 req/min, 1 min interval, burst 1
   *
   * @param options - Query parameters
   * @param options.dateFrom - Start of reporting period (ISO 8601)
   * @param options.dateTo - End of reporting period (ISO 8601, required)
   * @param options.limit - Number of items in response (max 1000, required)
   * @param options.offset - Number of items to skip (default 0)
   * @returns Measurement reports with total count
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see EPIC 44 - New endpoint replacing tab=measurement on old warehouse-measurements
   * @example
   * const result = await sdk.reports.getWarehouseMeasurementsV2({
   *   dateTo: '2026-02-06',
   *   limit: 100
   * });
   * console.log(result.data?.reports);
   */
  async getWarehouseMeasurementsV2(e) {
    return this.client.get(
      "https://seller-analytics-api.wildberries.ru/api/analytics/v1/warehouse-measurements",
      { params: e, rateLimitKey: "reports.warehouseMeasurementsV2" }
    );
  }
  /**
   * Удержания за подмену и некорректные вложения
   *
   * Метод возвращает отчёт об удержаниях за подмену товара и некорректные вложения.
   * Заменяет удалённый endpoint /api/v1/analytics/incorrect-attachments.
   *
   * Rate limit: 1 req/min, 1 min interval, burst 1
   *
   * @param options - Query parameters
   * @param options.dateFrom - Start of reporting period (ISO 8601)
   * @param options.dateTo - End of reporting period (ISO 8601, required)
   * @param options.sort - Sort field: nmId, dtBonus, bonusSumm (default: dtBonus)
   * @param options.order - Sort order: desc, asc (default: desc)
   * @param options.limit - Number of items in response (max 1000, required)
   * @param options.offset - Number of items to skip (default 0)
   * @returns Deduction reports with total count
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see EPIC 44 - New endpoint replacing removed incorrect-attachments
   * @example
   * const result = await sdk.reports.getDeductions({
   *   dateTo: '2026-02-06',
   *   limit: 100,
   *   sort: 'dtBonus',
   *   order: 'desc'
   * });
   * console.log(result.data?.reports);
   */
  async getDeductions(e) {
    return this.client.get(
      "https://seller-analytics-api.wildberries.ru/api/analytics/v1/deductions",
      { params: e, rateLimitKey: "reports.deductions" }
    );
  }
};
var Hs = class {
  constructor(e) {
    this.client = e;
  }
  /**
   * Удаление кампании
   *
   * Метод удаляет [кампании](/openapi/promotion#tag/Kampanii/paths/~1adv~1v1~1promotion~1adverts/post) в статусе `4` — готова к запуску.<br><br> После удаления кампания некоторое время будет находиться в статусе `-1` — кампания в процессе удаления. Полное удаление кампании занимает от 3 до 10 минут. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 5 запросов | 200 миллисекунд | 5 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.getAdvDelete({});
  console.log(result);
   */
  async getAdvDelete(e) {
    return this.client.get("https://advert-api.wildberries.ru/adv/v0/delete", {
      params: e,
      rateLimitKey: "promotion.advDelete"
    });
  }
  /**
   * Переименование кампании
   *
   * Метод меняет название [кампании](/openapi/promotion#tag/Kampanii/paths/~1adv~1v1~1promotion~1adverts/post). Это можно сделать в любой момент существования кампании. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 5 запросов | 200 миллисекунд | 5 запросов | </div>
   *
   * @param [data] - Request body data
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.createAdvRename({});
  console.log(result);
   */
  async createAdvRename(e) {
    return this.client.post("https://advert-api.wildberries.ru/adv/v0/rename", e, {
      rateLimitKey: "promotion.postAdvRename"
    });
  }
  /**
   * Завершение кампании
   *
   * Метод завершает [кампании](/openapi/promotion#tag/Kampanii/paths/~1adv~1v1~1promotion~1adverts/post) в статусах: - `4` — готово к запуску - `9` — активна - `11` — пауза <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 5 запросов | 200 миллисекунд | 5 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.getAdvStop({});
  console.log(result);
   */
  async getAdvStop(e) {
    return this.client.get("https://advert-api.wildberries.ru/adv/v0/stop", {
      params: e,
      rateLimitKey: "promotion.advStop"
    });
  }
  /**
   * Изменение мест размещения в кампаниях с ручной ставкой
   *
   * Метод меняет места размещения в кампаниях с ручной ставкой. <br><br> Для кампаний в статусах `4`, `9` и `11`. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 1 запрос | 1 секунда | 1 запрос | </div>
   *
   * @param data - Request body data
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.updateAuctionPlacement({});
   */
  async updateAuctionPlacement(e) {
    return this.client.put("https://advert-api.wildberries.ru/adv/v0/auction/placements", e, {
      rateLimitKey: "promotion.putAdvAuctionPlacements"
    });
  }
  /**
   * Изменение ставок в кампаниях
   *
   * Метод меняет ставки карточек товаров по артикулам WB в кампаниях типа `9` с единой или ручной ставкой. <br><br> Для кампаний в статусах `4`, `9` и `11`. <br><br> В запросе укажите место размещения в параметре `placement`: - `combined` — в поиске и рекомендациях для кампаний с единой ставкой - `search `или `recommendations` — в поиске или рекомендациях для кампаний с ручной ставкой <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 5 запросов | 200 миллисекунд | 5 запросов | </div>
   *
   * @deprecated Use updateBidsV2() instead for kopeck-based bidding.
   * @param data - Request body data
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.updateAuctionBid({});
  console.log(result);
   */
  async updateAuctionBid(e) {
    return this.client.patch("https://advert-api.wildberries.ru/adv/v0/auction/bids", e, {
      rateLimitKey: "promotion.patchAdvAuctionBids"
    });
  }
  /**
   * Баланс
   *
   * Метод возвращает информацию о: - счёте кабинета Продвижения WB. Его пополняет продавец. - балансе — максимальной сумме для оплаты камапнии по взаиморасчету: удержании средств из будущих продаж. Баланс пополнить нельзя, он рассчитывается автоматически на основе отчётов по продвижению. - бонусных начислениях WB. Информацию о бюджете кампаний можно получить в [отдельном методе](/openapi/promotion#tag/Finansy/paths/~1adv~1v1~1budget/get). <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 1 запрос | 1 секунда | 5 запросов | </div>
   *
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.getAdvBalance();
  console.log(result);
   */
  async getAdvBalance() {
    return this.client.get("https://advert-api.wildberries.ru/adv/v1/balance", {
      rateLimitKey: "promotion.advBalance"
    });
  }
  /**
   * Бюджет кампании
   *
   * Метод возвращает информацию о бюджете [кампании](/openapi/promotion#tag/Kampanii/paths/~1adv~1v1~1promotion~1adverts/post) — максимальной сумме затрат на кампанию. Бюджет кампании можно [пополнить](/openapi/promotion#tag/Finansy/paths/~1adv~1v1~1budget~1deposit/post). <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 4 запроса | 250 миллисекунд | 4 запроса | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.getAdvBudget({});
  console.log(result);
   */
  async getAdvBudget(e) {
    return this.client.get(
      "https://advert-api.wildberries.ru/adv/v1/budget",
      { params: e, rateLimitKey: "promotion.advBudget" }
    );
  }
  /**
   * Пополнение бюджета кампании
   *
   * Метод пополняет [бюджет](/openapi/promotion#tag/Finansy/paths/~1adv~1v1~1budget/get) кампании в статусе `11` — на паузе. <br> Чтобы запустить кампанию после пополнения бюджета, используйте метод [Запуск кампании](/openapi/promotion#tag/Upravlenie-kampaniyami/paths/~1adv~1v0~1start/get). <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 1 запрос | 1 секунда | 5 запросов | </div>
   *
   * @param data - Request body data
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.createBudgetDeposit({}, {});
  console.log(result);
   */
  async createBudgetDeposit(e, t) {
    return this.client.post(
      "https://advert-api.wildberries.ru/adv/v1/budget/deposit",
      e,
      { params: t, rateLimitKey: "promotion.postAdvBudgetDeposit" }
    );
  }
  /**
   * Получение истории затрат
   *
   * Метод формирует список фактических затрат на рекламные кампании за заданный период. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 1 запрос | 1 секунда | 5 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.getAdvUpd({});
  console.log(result);
   */
  async getAdvUpd(e) {
    return this.client.get("https://advert-api.wildberries.ru/adv/v1/upd", {
      params: e,
      rateLimitKey: "promotion.advUpd"
    });
  }
  /**
   * Получение истории пополнений счёта
   *
   * Метод возвращает историю пополнений счёта **WB Продвижение** за заданный период. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 1 запрос | 1 секунда | 5 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.getAdvPayments({});
  console.log(result);
   */
  async getAdvPayments(e) {
    return this.client.get("https://advert-api.wildberries.ru/adv/v1/payments", {
      params: e,
      rateLimitKey: "promotion.advPayments"
    });
  }
  /**
   * Установка/удаление минус-фраз для кампании с единой ставкой
   *
   * <div class="description_important"> ⚠️ **DEPRECATED**: Этот метод устарел и будет отключён **2 февраля 2026**.<br><br> **Обновление**: Дата отключения перенесена с 15 января на 2 февраля 2026.<br><br> **Причина**: Переход от кампаний с единой ставкой (type 8) к кампаниям с ручной и единой ставкой (type 9).<br><br> **Альтернатива**: Для работы с минус-фразами в кампаниях type 9 используйте соответствующие методы управления кампаниями с ручной ставкой. </div> Метод устанавливает и удаляет минус-фразы для кампании [с единой ставкой](/openapi/promotion#tag/Sozdanie-kampanij/paths/~1adv~1v1~1save-ad/post).<br><br> Данные фразы можно выбрать из списка запросов, по которым покупатели находили ваш товар. Список запросов можно получить в [статистике ключевых фраз](/openapi/analytics#tag/Statistika-po-prodvizheniyu/paths/~1adv~1v0~1stats~1keywords/get).<br> Отправка пустого массива удаляет все минус-фразы из кампании. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 6 секунд | 1 запрос | 6 секунд | 5 запросов | </div>
   *
   * @deprecated This method will be disabled by Wildberries API on February 2, 2026.
   * Use setNormqueryMinus() for type 9 campaigns with manual bidding instead.
   * @see {@link https://dev.wildberries.ru/release-notes?id=388} Release notes
   * @see {@link PromotionModule.setNormqueryMinus} New method
   *
   * @param data - Request body data
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.promotion.createAutoSetExcluded({}, {}); // February 2, 2026
   * console.log(result);
   */
  async createAutoSetExcluded(e, t) {
    return q(
      "PromotionModule.createAutoSetExcluded",
      "[DEPRECATED] createAutoSetExcluded() will be disabled by Wildberries API on February 2, 2026. Use setNormqueryMinus() for type 9 campaigns with manual bidding instead."
    ), this.client.post("https://advert-api.wildberries.ru/adv/v1/auto/set-excluded", e, {
      params: t,
      rateLimitKey: "promotion.postAdvAutoSetExcluded"
    });
  }
  /**
   * Изменение списка карточек товаров в кампании с единой ставкой
   *
   * <div class="description_important"> ⚠️ **DEPRECATED**: Этот метод устарел и будет отключён **2 февраля 2026**.<br><br> **Причина**: Переход от кампаний с единой ставкой (type 8) к кампаниям с ручной и единой ставкой (type 9).<br><br> **Альтернатива**: Для работы с товарами в кампаниях type 9 используйте метод [Управление товарами в кампаниях](/openapi/promotion#tag/Upravlenie-kampaniyami/paths/~1adv~1v0~1auction~1nms/patch). </div> Метод добавляет и удаляет карточки товаров в кампании с единой ставкой.<br><br> <div class="description_important"> Добавить можно только те карточки товаров, которые вернутся в <a href="/openapi/promotion#tag/Parametry-avtomaticheskih-kampanij/paths/~1adv~1v1~1auto~1getnmtoadd/get">списке карточек товаров для кампании с единой ставкой</a>.<br>Удалить единственную карточку товара из кампании нельзя. </div> Проверки по параметру `delete` не предусмотрено. Если пришел ответ со статус-кодом `200`, а изменений не произошло, проверьте, чтобы запрос соответствовал документации. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 60 запросов | 1 секунда | 5 запросов | </div>
   *
   * @deprecated This method will be disabled by Wildberries API on February 2, 2026.
   * Use updateAuctionNm() for type 9 campaigns instead.
   * @see {@link https://dev.wildberries.ru/release-notes?id=388} Release notes
   * @see {@link PromotionModule.updateAuctionNm} New method
   *
   * @param data - Request body data
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.promotion.createAutoUpdatenm({}, {}); // February 2, 2026
   * console.log(result);
   */
  async createAutoUpdatenm(e, t) {
    return q(
      "PromotionModule.createAutoUpdatenm",
      "[DEPRECATED] createAutoUpdatenm() will be disabled by Wildberries API on February 2, 2026. Use updateAuctionNm() for type 9 campaigns instead."
    ), this.client.post("https://advert-api.wildberries.ru/adv/v1/auto/updatenm", e, {
      params: t,
      rateLimitKey: "promotion.postAdvAutoUpdatenm"
    });
  }
  /**
   * Изменение списка карточек товаров в кампаниях
   *
   * Метод добавляет и удаляет карточки товаров в кампаниях. <br><br> Для кампаний в статусах `4`, `9` и `11`. <br><br> Для добавляемых товаров устанавливается текущая минимальная ставка. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 1 запрос | 1 секунда | 1 запрос | </div>
   *
   * @param data - Request body data
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.updateAuctionNm({});
  console.log(result);
   */
  async updateAuctionNm(e) {
    return this.client.patch("https://advert-api.wildberries.ru/adv/v0/auction/nms", e, {
      rateLimitKey: "promotion.patchAdvAuctionNms"
    });
  }
  /**
   * Количество медиакампаний
   *
   * Метод возвращает количество [медиакампаний](/openapi/promotion#tag/Media/paths/~1adv~1v1~1advert/get) продавца с группировкой по статусам. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 10 запросов | 100 миллисекунд | 10 запросов | </div>
   *
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.getAdvCount();
  console.log(result);
   */
  async getAdvCount() {
    return this.client.get("https://advert-media-api.wildberries.ru/adv/v1/count", {
      rateLimitKey: "promotion.advCount"
    });
  }
  /**
   * Список медиакампаний
   *
   * Метод возвращает список всех [медиакампаний](/openapi/promotion#tag/Media/paths/~1adv~1v1~1advert/get) продавца по их типам и статусам. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 10 запросов | 100 миллисекунд | 10 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.getAdvAdverts({});
  console.log(result);
   */
  async getAdvAdverts(e) {
    return this.client.get("https://advert-media-api.wildberries.ru/adv/v1/adverts", {
      params: e,
      rateLimitKey: "promotion.advAdverts"
    });
  }
  /**
   * Информация о медиакампании
   *
   * Метод возвращает информацию о кампании [WB Медиа](https://cmp.wildberries.ru/cmpf/list). Вместо карточек товаров в медиакампаниях продвигаются рекламные баннеры продавца на сайте и в приложении WB. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 10 запросов | 100 миллисекунд | 10 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.getAdvAdvert({});
  console.log(result);
   */
  async getAdvAdvert(e) {
    return this.client.get("https://advert-media-api.wildberries.ru/adv/v1/advert", {
      params: e,
      rateLimitKey: "promotion.advAdvert"
    });
  }
  /**
   * Статистика кампаний
   *
   * Метод формирует статистику для кампаний независимо от типа. <br><br> Максимальный период в запросе — 31 день. <br><br> Для кампаний в статусах `7`, `9` и `11`. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 3 запроса | 20 секунд | 1 запрос | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.getAdvFullstats({});
  console.log(result);
   */
  async getAdvFullstats(e) {
    return this.client.get(
      "https://advert-api.wildberries.ru/adv/v3/fullstats",
      { params: e, rateLimitKey: "promotion.advFullstats" }
    );
  }
  /**
   * Статистика по ключевым фразам
   *
   * Метод формирует статистику по ключевым фразам из поисковой строки: количество просмотров товара и затраты по одной ключевой фразе. Подходит для кампаний c единой и ручной ставкой. <br><br> Статистика формируется за каждый день, когда кампания была активна. В одном запросе можно получить данные максимум за 7 дней. <br> Данные обновляются каждый час. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 4 запроса | 250 миллисекунд | 4 запроса | </div>
   *
   * @deprecated This endpoint is deprecated. Use alternative methods for keyword statistics.
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.getStatsKeywords({});
  console.log(result);
   */
  async getStatsKeywords(e) {
    return this.client.get(
      "https://advert-api.wildberries.ru/adv/v0/stats/keywords",
      { params: e, rateLimitKey: "promotion.advStatsKeywords" }
    );
  }
  /**
   * Статистика медиакампаний
   *
   * Метод формирует статистику кампаний сервиса [WB Медиа](https://cmp.wildberries.ru/cmpf/statistics). Статистику можно группировать по датам и/или интервалам. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 секунда | 10 запросов | 100 миллисекунд | 10 запросов | </div>
   *
   * @param data - Request body data
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.createAdvStat({});
  console.log(result);
   */
  async createAdvStat(e) {
    return this.client.post(
      "https://advert-media-api.wildberries.ru/adv/v1/stats",
      e,
      { rateLimitKey: "promotion.postAdvStats" }
    );
  }
  /**
   * Список акций
   *
   * Метод возвращает список [акций](/openapi/promotion#tag/Kalendar-akcij/paths/~1api~1v1~1calendar~1promotions~1details/get) в WB с датами и временем проведения. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца для всех методов категории <strong>Календарь акций</strong>: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 6 секунд | 10 запросов | 600 миллисекунд | 5 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.getCalendarPromotions({});
  console.log(result);
   */
  async getCalendarPromotions(e) {
    return this.client.get(
      "https://dp-calendar-api.wildberries.ru/api/v1/calendar/promotions",
      { params: e, rateLimitKey: "promotion.calendarPromotions" }
    );
  }
  /**
   * Детальная информация об акциях
   *
   * Метод возвращает подробную информацию об [акции](/openapi/promotion#tag/Kalendar-akcij/paths/~1api~1v1~1calendar~1promotions~1details/get) по ID. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца для всех методов категории <strong>Календарь акций</strong>: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 6 секунд | 10 запросов | 600 миллисекунд | 5 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.getPromotionsDetails({});
  console.log(result);
   */
  async getPromotionsDetails(e) {
    return this.client.get(
      "https://dp-calendar-api.wildberries.ru/api/v1/calendar/promotions/details",
      { params: e, rateLimitKey: "promotion.calendarPromotionsDetails" }
    );
  }
  /**
   * Список товаров для участия в акции
   *
   * Метод формирует список товаров, подходящих для участия в [акции](/openapi/promotion#tag/Kalendar-akcij/paths/~1api~1v1~1calendar~1promotions~1details/get). Эти товары можно добавить в акцию с помощью [отдельного метода](/openapi/promotion#tag/Kalendar-akcij/paths/~1api~1v1~1calendar~1promotions~1upload/post). <div class="description_important"> Данный метод неприменим для автоакций. </div> <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца для всех методов категории <strong>Календарь акций</strong>: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 6 секунд | 10 запросов | 600 миллисекунд | 5 запросов | </div>
   *
   * @param [options] - Query parameters
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.getPromotionsNomenclatures({});
  console.log(result);
   */
  async getPromotionsNomenclatures(e) {
    return this.client.get(
      "https://dp-calendar-api.wildberries.ru/api/v1/calendar/promotions/nomenclatures",
      { params: e, rateLimitKey: "promotion.calendarPromotionsNomenclatures" }
    );
  }
  /**
   * Добавить товар в акцию
   *
   * Метод создаёт задание на загрузку товара в [акцию](/openapi/promotion#tag/Kalendar-akcij/paths/~1api~1v1~1calendar~1promotions~1details/get).<br> Состояние загрузки можно проверить с помощью [отдельных методов](/openapi/work-with-products#tag/Ceny-i-skidki/paths/~1api~1v2~1history~1tasks/get). <div class="description_important"> Данный метод неприменим для автоакций. </div> <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца для всех методов категории <strong>Календарь акций</strong>: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 6 секунд | 10 запросов | 600 миллисекунд | 5 запросов | </div>
   *
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
  const result = await sdk.promotion.createPromotionsUpload();
  console.log(result);
   */
  async createPromotionsUpload() {
    return this.client.post(
      "https://dp-calendar-api.wildberries.ru/api/v1/calendar/promotions/upload",
      void 0,
      { rateLimitKey: "promotion.postCalendarPromotionsUpload" }
    );
  }
  // ============================================================================
  // Deprecated V0/V1 Methods - Will be removed February 2, 2026
  // ============================================================================
  /**
   * Получить информацию о кампаниях (устаревший метод)
   *
   * Метод возвращает информацию о рекламных кампаниях по их идентификаторам.
   *
   * @deprecated Будет удалён 2 февраля 2026. Используйте getAdvertsV2() вместо этого.
   * @see {@link https://dev.wildberries.ru/release-notes?id=388} Release notes
   * @see {@link PromotionModule.getAdvertsV2} Новый метод
   *
   * @param ids - Массив идентификаторов кампаний
   * @returns Информация о кампаниях
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * ```typescript
   * const adverts = await sdk.promotion.getPromotionAdverts([12345, 67890]);
   * console.log(adverts);
   * ```
   */
  async getPromotionAdverts(e) {
    return q(
      "PromotionModule.getPromotionAdverts",
      "[DEPRECATED] getPromotionAdverts() \u0431\u0443\u0434\u0435\u0442 \u0443\u0434\u0430\u043B\u0451\u043D 2 \u0444\u0435\u0432\u0440\u0430\u043B\u044F 2026. \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 getAdvertsV2()."
    ), this.client.post(
      "https://advert-api.wildberries.ru/adv/v1/promotion/adverts",
      e,
      { rateLimitKey: "promotion.postAdvPromotionAdverts" }
    );
  }
  /**
   * Получить список аукционных кампаний (устаревший метод)
   *
   * Метод возвращает список рекламных кампаний типа "аукцион".
   *
   * @deprecated Будет удалён 2 февраля 2026. Используйте getAdvertsV2() вместо этого.
   * @see {@link https://dev.wildberries.ru/release-notes?id=388} Release notes
   * @see {@link PromotionModule.getAdvertsV2} Новый метод
   *
   * @param params - Параметры фильтрации
   * @returns Список аукционных кампаний
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * ```typescript
   * const adverts = await sdk.promotion.getAuctionAdverts({ status: 9 });
   * console.log(adverts);
   * ```
   */
  async getAuctionAdverts(e) {
    return q(
      "PromotionModule.getAuctionAdverts",
      "[DEPRECATED] getAuctionAdverts() \u0431\u0443\u0434\u0435\u0442 \u0443\u0434\u0430\u043B\u0451\u043D 2 \u0444\u0435\u0432\u0440\u0430\u043B\u044F 2026. \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 getAdvertsV2()."
    ), this.client.get("https://advert-api.wildberries.ru/adv/v0/auction/adverts", {
      params: e,
      rateLimitKey: "promotion.advAuctionAdverts"
    });
  }
  // ============================================================================
  // Search Clusters (NormQuery) Methods - NEW in Feb 2026
  // ============================================================================
  /**
   * Статистика поисковых кластеров
   *
   * Метод возвращает статистику по поисковым кластерам за указанный период.
   * Можно использовать только для кампаний с моделью оплаты `cpm` — за показы.
   *
   * Rate limit: 10 requests per minute, 6 second interval, burst 20
   *
   * @param data - Request body with date range and campaign/product items
   * @returns Statistics for search clusters
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/promotion#tag/Statistika/paths/~1adv~1v0~1normquery~1stats/post}
   * @example
   * ```typescript
   * const stats = await sdk.promotion.getNormqueryStats({
   *   from: '2025-10-07',
   *   to: '2025-10-08',
   *   items: [{ advert_id: 1825035, nm_id: 983512347 }]
   * });
   * console.log(stats.stats);
   * ```
   */
  async getNormqueryStats(e) {
    return this.client.post(
      "https://advert-api.wildberries.ru/adv/v0/normquery/stats",
      e,
      { rateLimitKey: "promotion.normqueryStats" }
    );
  }
  /**
   * Список ставок поисковых кластеров
   *
   * Метод возвращает список поисковых кластеров со ставками по ID кампаний и артикулам WB.
   *
   * Rate limit: 5 requests per second, 200ms interval, burst 10
   *
   * @param data - Request body with campaign/product items
   * @returns List of search cluster bids
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/promotion#tag/Poiskovye-klastery/paths/~1adv~1v0~1normquery~1get-bids/post}
   * @example
   * ```typescript
   * const bids = await sdk.promotion.getNormqueryBids({
   *   items: [{ advert_id: 1825035, nm_id: 983512347 }]
   * });
   * console.log(bids.bids);
   * ```
   */
  async getNormqueryBids(e) {
    return this.client.post(
      "https://advert-api.wildberries.ru/adv/v0/normquery/get-bids",
      e,
      { rateLimitKey: "promotion.normqueryGetBids" }
    );
  }
  /**
   * Установить ставки для поисковых кластеров
   *
   * Метод устанавливает ставки на поисковые кластеры.
   * Можно использовать только для кампаний с ручной ставкой и моделью оплаты `cpm` — за показы.
   *
   * Rate limit: 2 requests per second, 500ms interval, burst 4
   *
   * @param data - Request body with bids to set
   * @returns void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/promotion#tag/Poiskovye-klastery/paths/~1adv~1v0~1normquery~1bids/post}
   * @example
   * ```typescript
   * await sdk.promotion.setNormqueryBids({
   *   bids: [{
   *     advert_id: 1825035,
   *     nm_id: 983512347,
   *     norm_query: 'Фраза 1',
   *     bid: 1000
   *   }]
   * });
   * ```
   */
  async setNormqueryBids(e) {
    await this.client.post("https://advert-api.wildberries.ru/adv/v0/normquery/bids", e, {
      rateLimitKey: "promotion.normquerySetBids"
    });
  }
  /**
   * Удалить ставки поисковых кластеров
   *
   * Метод удаляет ставки с поисковых кластеров.
   * Можно использовать только для кампаний с ручной ставкой и моделью оплаты `cpm` — за показы.
   *
   * Rate limit: 5 requests per second, 200ms interval, burst 10
   *
   * @param data - Request body with bids to delete
   * @returns void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/promotion#tag/Poiskovye-klastery/paths/~1adv~1v0~1normquery~1bids/delete}
   * @example
   * ```typescript
   * await sdk.promotion.deleteNormqueryBids({
   *   bids: [{
   *     advert_id: 1825035,
   *     nm_id: 983512347,
   *     norm_query: 'Фраза 1',
   *     bid: 1000
   *   }]
   * });
   * ```
   */
  async deleteNormqueryBids(e) {
    await this.client.delete("https://advert-api.wildberries.ru/adv/v0/normquery/bids", e, {
      rateLimitKey: "promotion.normqueryDeleteBids"
    });
  }
  /**
   * Список минус-фраз кампаний
   *
   * Метод возвращает список минус-фраз по ID кампаний и артикулам WB.
   *
   * Rate limit: 5 requests per second, 200ms interval, burst 10
   *
   * @param data - Request body with campaign/product items
   * @returns List of minus-phrases
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/promotion#tag/Poiskovye-klastery/paths/~1adv~1v0~1normquery~1get-minus/post}
   * @example
   * ```typescript
   * const minusPhrases = await sdk.promotion.getNormqueryMinus({
   *   items: [{ advert_id: 1825035, nm_id: 983512347 }]
   * });
   * console.log(minusPhrases.items);
   * ```
   */
  async getNormqueryMinus(e) {
    return this.client.post(
      "https://advert-api.wildberries.ru/adv/v0/normquery/get-minus",
      e,
      { rateLimitKey: "promotion.normqueryGetMinus" }
    );
  }
  /**
   * Установка и удаление минус-фраз
   *
   * Метод устанавливает и удаляет минус-фразы в кампаниях с ручной ставкой и моделью оплаты `cpm` — за показы.
   * Отправка пустого массива удаляет все минус-фразы.
   *
   * Rate limit: 5 requests per second, 200ms interval, burst 10
   *
   * @param data - Request body with minus-phrases to set
   * @returns void on success
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/promotion#tag/Poiskovye-klastery/paths/~1adv~1v0~1normquery~1set-minus/post}
   * @example
   * ```typescript
   * await sdk.promotion.setNormqueryMinus({
   *   advert_id: 1825035,
   *   nm_id: 983512347,
   *   norm_queries: ['Фраза 1', 'Фраза 2']
   * });
   * ```
   */
  async setNormqueryMinus(e) {
    await this.client.post("https://advert-api.wildberries.ru/adv/v0/normquery/set-minus", e, {
      rateLimitKey: "promotion.normquerySetMinus"
    });
  }
  // ============================================================================
  // V2 Replacement Methods - NEW in Feb 2026
  // ============================================================================
  /**
   * Информация о кампаниях (V2)
   *
   * Метод возвращает информацию о рекламных кампаниях с единой или ручной ставкой
   * по их статусам, типам оплаты и ID. Replaces deprecated v1 endpoints.
   *
   * Данные синхронизируются с базой раз в 3 минуты. Статусы кампаний меняются раз в минуту.
   * Ставки кампаний меняются раз в 30 секунд.
   *
   * Rate limit: 5 requests per second, 200ms interval, burst 5
   *
   * @param options - Query parameters for filtering campaigns
   * @param options.ids - Campaign IDs, comma-separated (max 50)
   * @param options.statuses - Campaign statuses: -1 (deleted), 4 (ready), 7 (finished), 8 (cancelled), 9 (active), 11 (paused)
   * @param options.payment_type - Payment type: cpm (per impressions) or cpc (per click)
   * @returns List of campaigns with bid_type (auto/manual) and bids in kopecks
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @since 3.4.0 — Return type changed from GetAdverts to GetAdvertsV2Response
   * @see {@link https://dev.wildberries.ru/docs/openapi/promotion#tag/Kampanii/paths/~1api~1advert~1v2~1adverts/get}
   * @example
   * ```typescript
   * const campaigns = await sdk.promotion.getAdvertsV2({
   *   ids: '12345,23456',
   *   statuses: '9,11',
   *   payment_type: 'cpm',
   * });
   * for (const advert of campaigns.adverts) {
   *   console.log(advert.id, advert.bid_type, advert.status);
   *   for (const nm of advert.nm_settings) {
   *     console.log(`  nmId=${nm.nm_id} search=${nm.bids_kopecks.search} reco=${nm.bids_kopecks.recommendations}`);
   *   }
   * }
   * ```
   */
  async getAdvertsV2(e) {
    return this.client.get(
      "https://advert-api.wildberries.ru/api/advert/v2/adverts",
      {
        params: e,
        rateLimitKey: "promotion.advertsV2"
      }
    );
  }
  /**
   * Минимальные ставки для карточек товаров (V1 API)
   *
   * Метод возвращает минимальные ставки для карточек товаров в копейках
   * по типу оплаты и местам размещения. Replaces deprecated v0 endpoint.
   *
   * Rate limit: 20 requests per minute, 3 second interval, burst 5
   *
   * @param data - Request body with campaign ID, product IDs, payment type, and placement types
   * @returns Minimum bids for products by placement type (in kopecks)
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/promotion#tag/Sozdanie-kampanij/paths/~1api~1advert~1v1~1bids~1min/post}
   * @example
   * ```typescript
   * const minBids = await sdk.promotion.getBidsMinV2({
   *   advert_id: 98765432,
   *   nm_ids: [12345678, 87654321],
   *   payment_type: 'cpm',
   *   placement_types: ['combined', 'search', 'recommendation']
   * });
   * console.log(minBids.bids);
   * ```
   */
  async getBidsMinV2(e) {
    return this.client.post("https://advert-api.wildberries.ru/api/advert/v1/bids/min", e, {
      rateLimitKey: "promotion.bidsMinV1"
    });
  }
  /**
   * Рекомендуемые ставки для карточек товаров и поисковых кластеров
   *
   * Метод возвращает рекомендуемые ставки для карточек товаров и поисковых кластеров кампании.
   * Только для кампаний с типом оплаты cpm (за показы).
   *
   * Данные синхронизируются с базой раз в 3 минуты.
   * Для приостановленных кампаний `normQueries` может быть пустым массивом.
   *
   * Rate limit: 5 requests per minute, 12-second interval, burst 5
   *
   * @param params - Campaign ID and WB article ID
   * @param params.advertId - Campaign ID
   * @param params.nmId - WB article ID (must belong to the campaign)
   * @returns Recommended bids: base (card-level) and normQueries (per search cluster)
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When nmId does not belong to campaign or params invalid (400)
   * @throws {NetworkError} When network request fails or times out
   * @since 3.4.0
   * @see {@link https://dev.wildberries.ru/docs/openapi/promotion#tag/Upravlenie-kampaniyami/paths/~1api~1advert~1v0~1bids~1recommendations/get}
   * @example
   * ```typescript
   * const reco = await sdk.promotion.getBidsRecommendations({
   *   advertId: 29081652,
   *   nmId: 148190095,
   * });
   * for (const nq of reco.normQueries) {
   *   console.log(`${nq.normQuery}: min=${nq.reachMin.bidKopecks} med=${nq.reachMedium.bidKopecks} max=${nq.reachMax.bidKopecks}`);
   * }
   * ```
   */
  async getBidsRecommendations(e) {
    return this.client.get(
      "https://advert-api.wildberries.ru/api/advert/v0/bids/recommendations",
      {
        params: { advertId: e.advertId, nmId: e.nmId },
        rateLimitKey: "promotion.getBidsRecommendations"
      }
    );
  }
  /**
   * Изменение ставок в кампаниях (V1 API)
   *
   * Метод меняет ставки карточек товаров по артикулам WB в кампаниях с единой или ручной ставкой.
   * Для кампаний в статусах 4, 9 и 11. Replaces deprecated v0 endpoint.
   *
   * Rate limit: 5 requests per second, 200ms interval, burst 5
   *
   * @param data - Request body with bids in kopecks
   * @returns Updated bids
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/promotion#tag/Upravlenie-kampaniyami/paths/~1api~1advert~1v1~1bids/patch}
   * @example
   * ```typescript
   * const result = await sdk.promotion.updateBidsV2({
   *   bids: [{
   *     advert_id: 12345,
   *     nm_bids: [{
   *       nm_id: 13335157,
   *       bid_kopecks: 250,
   *       placement: 'recommendations'
   *     }]
   *   }]
   * });
   * console.log(result.bids);
   * ```
   */
  async updateBidsV2(e) {
    return this.client.patch("https://advert-api.wildberries.ru/api/advert/v1/bids", e, {
      rateLimitKey: "promotion.bidsV1"
    });
  }
  // ============================================================================
  // Campaign Management Methods - NEW
  // ============================================================================
  /**
   * Получение списков кампаний
   *
   * Возвращает списки всех рекламных кампаний продавца с их ID.
   * Кампании сгруппированы по типу и статусу, у каждой указана дата последнего изменения.
   *
   * Rate limit:
   * | Период | Лимит | Интервал | Всплеск |
   * | --- | --- | --- | --- |
   * | 1 сек | 5 запросов | 200 мс | 5 запросов |
   *
   * @readonly
   * @returns Списки кампаний по типам и статусам
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @see {@link https://dev.wildberries.ru/openapi/promotion#tag/Kampanii}
   * @example
   * ```typescript
   * const campaigns = await sdk.promotion.getCampaignCount();
   * console.log(`Total campaigns: ${campaigns.all}`);
   * for (const group of campaigns.adverts || []) {
   *   console.log(`Type ${group.type}, Status ${group.status}: ${group.count} campaigns`);
   * }
   * ```
   */
  async getCampaignCount() {
    return this.client.get(
      "https://advert-api.wildberries.ru/adv/v1/promotion/count",
      { rateLimitKey: "promotion.getCampaignCount" }
    );
  }
  /**
   * Создание кампании
   *
   * Метод создаёт рекламную кампанию с единой или ручной ставкой.
   * Возвращает ID созданной кампании.
   *
   * Rate limit:
   * | Период | Лимит | Интервал | Всплеск |
   * | --- | --- | --- | --- |
   * | 1 мин | 5 запросов | 12 сек | 5 запросов |
   *
   * @param data - Данные для создания кампании
   * @returns ID созданной кампании
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @see {@link https://dev.wildberries.ru/openapi/promotion#tag/Sozdanie-kampanij}
   * @example
   * ```typescript
   * const campaignId = await sdk.promotion.createCampaign({
   *   name: 'My Campaign',
   *   nms: [12345678, 87654321],
   *   bid_type: 'manual',
   *   payment_type: 'cpm',
   *   placement_types: ['search', 'recommendations']
   * });
   * console.log(`Created campaign with ID: ${campaignId}`);
   * ```
   */
  async createCampaign(e) {
    return this.client.post(
      "https://advert-api.wildberries.ru/adv/v2/seacat/save-ad",
      e,
      { rateLimitKey: "promotion.createCampaign" }
    );
  }
  /**
   * Список предметов продавца
   *
   * Метод возвращает список предметов, для которых можно создать кампанию.
   * Возвращает null, если нет товаров для создания кампаний.
   *
   * Rate limit:
   * | Период | Лимит | Интервал | Всплеск |
   * | --- | --- | --- | --- |
   * | 1 мин | 5 запросов | 12 сек | 5 запросов |
   *
   * @param params - Параметры фильтрации
   * @returns Список предметов или null
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @see {@link https://dev.wildberries.ru/openapi/promotion#tag/Sozdanie-kampanij}
   * @example
   * ```typescript
   * const subjects = await sdk.promotion.getSupplierSubjects({ payment_type: 'cpm' });
   * if (subjects) {
   *   for (const subject of subjects) {
   *     console.log(`${subject.name}: ${subject.count} products`);
   *   }
   * }
   * ```
   */
  async getSupplierSubjects(e) {
    return this.client.get(
      "https://advert-api.wildberries.ru/adv/v1/supplier/subjects",
      { params: e ? { ...e } : void 0, rateLimitKey: "promotion.getSupplierSubjects" }
    );
  }
  /**
   * Список карточек товаров продавца
   *
   * Метод возвращает список карточек товаров по указанным предметам.
   * Используется для получения артикулов WB для добавления в кампанию.
   *
   * Rate limit:
   * | Период | Лимит | Интервал | Всплеск |
   * | --- | --- | --- | --- |
   * | 1 мин | 5 запросов | 12 сек | 5 запросов |
   *
   * @param subjectIds - Массив ID предметов
   * @returns Список карточек товаров
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @see {@link https://dev.wildberries.ru/openapi/promotion#tag/Sozdanie-kampanij}
   * @example
   * ```typescript
   * const products = await sdk.promotion.getSupplierNms([123, 456]);
   * for (const product of products) {
   *   console.log(`${product.title} (nmId: ${product.nm})`);
   * }
   * ```
   */
  async getSupplierNms(e) {
    return this.client.post(
      "https://advert-api.wildberries.ru/adv/v2/supplier/nms",
      e,
      { rateLimitKey: "promotion.getSupplierNms" }
    );
  }
  /**
   * Запуск кампании
   *
   * Метод запускает кампании в статусах:
   * - `4` — готова к запуску
   * - `11` — на паузе
   *
   * Rate limit:
   * | Период | Лимит | Интервал | Всплеск |
   * | --- | --- | --- | --- |
   * | 1 сек | 5 запросов | 200 мс | 5 запросов |
   *
   * @param id - ID кампании
   * @returns void
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When campaign is in wrong status (400)
   * @see {@link https://dev.wildberries.ru/openapi/promotion#tag/Upravlenie-kampaniyami}
   * @example
   * ```typescript
   * await sdk.promotion.startCampaign(12345);
   * console.log('Campaign started successfully');
   * ```
   */
  async startCampaign(e) {
    return this.client.get("https://advert-api.wildberries.ru/adv/v0/start", {
      params: { id: e },
      rateLimitKey: "promotion.startCampaign"
    });
  }
  /**
   * Пауза кампании
   *
   * Метод ставит кампании на паузу. Работает только для кампаний в статусе:
   * - `9` — активна
   *
   * Rate limit:
   * | Период | Лимит | Интервал | Всплеск |
   * | --- | --- | --- | --- |
   * | 1 сек | 5 запросов | 200 мс | 5 запросов |
   *
   * @param id - ID кампании
   * @returns void
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When campaign is in wrong status (400)
   * @see {@link https://dev.wildberries.ru/openapi/promotion#tag/Upravlenie-kampaniyami}
   * @example
   * ```typescript
   * await sdk.promotion.pauseCampaign(12345);
   * console.log('Campaign paused successfully');
   * ```
   */
  async pauseCampaign(e) {
    return this.client.get("https://advert-api.wildberries.ru/adv/v0/pause", {
      params: { id: e },
      rateLimitKey: "promotion.pauseCampaign"
    });
  }
  // ============================================================================
  // Minus Phrases Methods (task-54) - New naming convention
  // ============================================================================
  /**
   * Получить минус-фразы для кампаний
   *
   * Возвращает список минус-фраз по ID кампаний и артикулам WB.
   *
   * **nm_id по типу кампании:**
   * - Type 8 (устаревший): nm_id=0 для всей кампании
   * - Type 9 (актуальный): nm_id = реальный артикул WB
   *
   * Rate limit: 5 requests per second, 200ms interval, burst 10
   *
   * @param request - Запрос с массивом items (max 100)
   * @returns Promise<GetMinusPhrasesResponse>
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/promotion#tag/Poiskovye-klastery/paths/~1adv~1v0~1normquery~1get-minus/post}
   * @example
   * ```typescript
   * const result = await sdk.promotion.getMinusPhrases({
   *   items: [{ advert_id: 123456, nm_id: 789012 }]
   * });
   * console.log(result.items[0].norm_queries); // ['фраза1', 'фраза2']
   * ```
   */
  async getMinusPhrases(e) {
    return this.client.post(
      "https://advert-api.wildberries.ru/adv/v0/normquery/get-minus",
      e,
      { rateLimitKey: "promotion.getMinusPhrases" }
    );
  }
  /**
   * Установить минус-фразы для кампании
   *
   * Устанавливает минус-фразы в кампаниях с ручной ставкой и CPM.
   *
   * **ВАЖНО:** Отправка пустого массива norm_queries УДАЛЯЕТ ВСЕ минус-фразы!
   *
   * **nm_id по типу кампании:**
   * - Type 8: nm_id=0 для настроек всей кампании
   * - Type 9: nm_id = реальный артикул WB
   *
   * Rate limit: 5 requests per second, 200ms interval, burst 10
   *
   * @param request - Запрос (max 1000 norm_queries)
   * @returns Promise<void>
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/promotion#tag/Poiskovye-klastery/paths/~1adv~1v0~1normquery~1set-minus/post}
   * @example
   * ```typescript
   * // Установить минус-фразы
   * await sdk.promotion.setMinusPhrases({
   *   advert_id: 123456,
   *   nm_id: 789012,
   *   norm_queries: ['нежелательная фраза', 'другая фраза']
   * });
   *
   * // Удалить ВСЕ минус-фразы
   * await sdk.promotion.setMinusPhrases({
   *   advert_id: 123456,
   *   nm_id: 789012,
   *   norm_queries: []  // УДАЛЯЕТ ВСЕ!
   * });
   * ```
   */
  async setMinusPhrases(e) {
    await this.client.post(
      "https://advert-api.wildberries.ru/adv/v0/normquery/set-minus",
      e,
      { rateLimitKey: "promotion.setMinusPhrases" }
    );
  }
  // ============================================================================
  // Search Cluster Statistics (task-55) - New naming convention
  // ============================================================================
  /**
   * Получить статистику поисковых кластеров
   *
   * Возвращает статистику по поисковым кластерам за период.
   *
   * Поддерживает кампании cpm и cpc. Для cpc-кампаний поля `views`, `ctr`, `cpm` отсутствуют в ответе.
   *
   * **nm_id по типу кампании:**
   * - Type 8: nm_id=0 для агрегированной статистики
   * - Type 9: nm_id = реальный артикул WB
   *
   * Rate limit: 10 requests per minute, 6 second interval, burst 20
   *
   * @param request - Запрос с периодом и items (max 100)
   * @returns Promise<GetSearchClusterStatsResponse>
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/promotion#tag/Statistika/paths/~1adv~1v0~1normquery~1stats/post}
   * @example
   * ```typescript
   * const stats = await sdk.promotion.getSearchClusterStats({
   *   from: '2026-02-01',
   *   to: '2026-02-09',
   *   items: [{ advert_id: 123456, nm_id: 789012 }]
   * });
   * // stats.stats[0].stats[0].norm_query = "фраза"
   * // stats.stats[0].stats[0].views = 1949
   * ```
   */
  async getSearchClusterStats(e) {
    return this.client.post(
      "https://advert-api.wildberries.ru/adv/v0/normquery/stats",
      e,
      { rateLimitKey: "promotion.getSearchClusterStats" }
    );
  }
  // ============================================================================
  // V1 API Methods with kopecks (bid_kopecks)
  // ============================================================================
  /**
   * Изменение ставок в кампаниях (V1 API с копейками)
   *
   * Меняет ставки карточек товаров по артикулам WB в кампаниях с единой или ручной ставкой.
   * Для кампаний в статусах 4, 9 и 11.
   *
   * **ВАЖНО**: Ставки указываются в КОПЕЙКАХ (bid_kopecks), не в рублях!
   *
   * Rate limit: 5 requests per second, 200ms interval, burst 5
   *
   * @param data - Request body with bids in kopecks
   * @returns Updated bids
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/promotion#tag/Upravlenie-kampaniyami/paths/~1api~1advert~1v1~1bids/patch}
   * @example
   * ```typescript
   * const result = await sdk.promotion.updateBids({
   *   bids: [{
   *     advert_id: 12345,
   *     nm_bids: [{
   *       nm_id: 13335157,
   *       bid_kopecks: 250, // = 2.50 RUB
   *       placement: 'recommendations'
   *     }]
   *   }]
   * });
   * ```
   */
  async updateBids(e) {
    return this.client.patch(
      "https://advert-api.wildberries.ru/api/advert/v1/bids",
      e,
      { rateLimitKey: "promotion.updateBids" }
    );
  }
  /**
   * Управление товарами в кампаниях
   *
   * Добавляет и удаляет карточки товаров в кампаниях типа 9.
   * Для кампаний в статусах 4, 9 и 11.
   * Для добавляемых товаров устанавливается текущая минимальная ставка.
   *
   * Rate limit: 1 request per second, 1000ms interval, burst 1
   *
   * @param data - Request body with campaigns and products to add/delete
   * @returns Results of product updates
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/promotion#tag/Upravlenie-kampaniyami/paths/~1adv~1v0~1auction~1nms/patch}
   * @example
   * ```typescript
   * const result = await sdk.promotion.updateCampaignProducts({
   *   campaigns: [{
   *     advert_id: 12345,
   *     add_nms: [111, 222],
   *     delete_nms: [333]
   *   }]
   * });
   * ```
   */
  async updateCampaignProducts(e) {
    return this.client.patch(
      "https://advert-api.wildberries.ru/adv/v0/auction/nms",
      {
        nms: e.campaigns.map((t) => ({
          advert_id: t.advert_id,
          nms: { add: t.add_nms, delete: t.delete_nms }
        }))
      },
      { rateLimitKey: "promotion.updateCampaignProducts" }
    );
  }
};
var Vs = class {
  constructor(e) {
    this.client = e;
  }
  /**
   * Комиссия по категориям товаров
   *
   * Метод возвращает данные о [комиссии](https://seller.wildberries.ru/dynamic-product-categories/commission) WB по [родительским категориям товаров](/openapi/work-with-products#tag/Kategorii-predmety-i-harakteristiki/paths/~1content~1v2~1object~1parent~1all/get) согласно модели продаж. <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 1 запрос | 1 минута | 2 запроса | </div>
   *
   * @param [options] - Query parameters
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * // Get commission rates (default locale)
   * const result = await sdk.tariffs.getTariffsCommission();
   * console.log(result);
   *
   * @example
   * // Get commission rates with English locale
   * const result = await sdk.tariffs.getTariffsCommission({ locale: 'en' });
   * console.log(result);
   */
  async getTariffsCommission(e) {
    return this.client.get("https://common-api.wildberries.ru/api/v1/tariffs/commission", {
      params: e,
      rateLimitKey: "tariffs.tariffsCommission"
    });
  }
  /**
   * Тарифы для коробов
   *
   * Для товаров, которые поставляются на склад в коробах, метод возвращает [тарифы на остаток](https://seller.wildberries.ru/dynamic-product-categories): - доставка со склада или пункта приёма до покупателя - доставка от покупателя до пункта приёма - хранение на складе WB <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 60 запросов | 1 секунда | 5 запросов | </div>
   *
   * @param date - Date for tariffs in YYYY-MM-DD format (required)
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.tariffs.getTariffsBox('2024-01-15');
   * console.log(result);
   */
  async getTariffsBox(e) {
    return this.client.get(
      "https://common-api.wildberries.ru/api/v1/tariffs/box",
      { params: { date: e }, rateLimitKey: "tariffs.tariffsBox" }
    );
  }
  /**
   * Тарифы для монопаллет
   *
   * Для товаров, которые поставляются на склад WB на монопаллетах, метод возвращает [стоимость](https://seller.wildberries.ru/dynamic-product-categories): - доставки со склада до покупателя - доставки от покупателя до склада - хранения на складе WB <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 60 запросов | 1 секунда | 5 запросов | </div>
   *
   * @param date - Date for tariffs in YYYY-MM-DD format (required)
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.tariffs.getTariffsPallet('2024-01-15');
   * console.log(result);
   */
  async getTariffsPallet(e) {
    return this.client.get(
      "https://common-api.wildberries.ru/api/v1/tariffs/pallet",
      { params: { date: e }, rateLimitKey: "tariffs.tariffsPallet" }
    );
  }
  /**
   * Тарифы на возврат
   *
   * Метод возвращает [тарифы](https://seller.wildberries.ru/dynamic-product-categories/return-cost): - на перевозку товаров со склада WB или из пункта приёма до продавца - на обратную перевозку возвратов, которые не забрал продавец <div class="description_limit"> <a href="/openapi/api-information#tag/Vvedenie/Limity-zaprosov">Лимит запросов</a> на один аккаунт продавца: | Период | Лимит | Интервал | Всплеск | | --- | --- | --- | --- | | 1 минута | 60 запросов | 1 секунда | 5 запросов | </div>
   *
   * @param date - Date for tariffs in YYYY-MM-DD format (required)
   * @returns Успешно
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.tariffs.getTariffsReturn('2024-01-15');
   * console.log(result);
   */
  async getTariffsReturn(e) {
    return this.client.get(
      "https://common-api.wildberries.ru/api/v1/tariffs/return",
      { params: { date: e }, rateLimitKey: "tariffs.tariffsReturn" }
    );
  }
  /**
   * Тарифы на поставку
   *
   * Метод возвращает тарифы на поставку для конкретных складов на ближайшие 14 дней.
   *
   * Приёмка для поставки доступна только при сочетании:
   * - `coefficient` — `0` или `1`
   * - `allowUnload` — `true`
   *
   * Rate limit: 6 requests per minute, 10 second interval, burst 6
   *
   * @param options - Query parameters
   * @param options.warehouseIDs - Warehouse IDs, comma-separated. Returns all warehouses by default
   * @returns Array of acceptance coefficients for the next 14 days
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * // Get coefficients for all warehouses
   * const allCoeffs = await sdk.tariffs.getAcceptanceCoefficients();
   * console.log(allCoeffs);
   *
   * @example
   * // Get coefficients for specific warehouses
   * const coeffs = await sdk.tariffs.getAcceptanceCoefficients({ warehouseIDs: '507,117501' });
   * console.log(coeffs);
   */
  async getAcceptanceCoefficients(e) {
    return this.client.get(
      "https://common-api.wildberries.ru/api/tariffs/v1/acceptance/coefficients",
      { params: e, rateLimitKey: "tariffs.acceptanceCoefficients" }
    );
  }
};
var zs = class {
  constructor(e) {
    this.client = e;
  }
  /**
   * Получить список новых сборочных заданий
   *
   * Метод возвращает список всех новых сборочных заданий, которые есть у продавца на момент запроса.
   *
   * @returns Список новых сборочных заданий
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.inStorePickup.getOrdersNew();
   * console.log(result);
   */
  async getOrdersNew() {
    return this.client.get(
      "https://marketplace-api.wildberries.ru/api/v3/click-collect/orders/new",
      { rateLimitKey: "in-store-pickup.clickCollectOrdersNew" }
    );
  }
  /**
   * Перевести на сборку
   *
   * Метод переводит сборочное задание в статус confirm — на сборке.
   *
   * @param orderId - ID сборочного задания
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * await sdk.inStorePickup.updateOrdersConfirm(12345);
   */
  async updateOrdersConfirm(e) {
    return this.client.patch(
      `https://marketplace-api.wildberries.ru/api/v3/click-collect/orders/${e}/confirm`,
      {},
      { rateLimitKey: "in-store-pickup.patchClickCollectOrdersConfirm" }
    );
  }
  /**
   * Сообщить, что сборочное задание готово к выдаче
   *
   * Метод переводит сборочное задание в статус prepare — готово к выдаче.
   *
   * @param orderId - ID сборочного задания
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * await sdk.inStorePickup.updateOrdersPrepare(12345);
   */
  async updateOrdersPrepare(e) {
    return this.client.patch(
      `https://marketplace-api.wildberries.ru/api/v3/click-collect/orders/${e}/prepare`,
      {},
      { rateLimitKey: "in-store-pickup.patchClickCollectOrdersPrepare" }
    );
  }
  /**
   * Информация о покупателе
   *
   * Метод возвращает информацию о покупателе по ID сборочного задания.
   * Доступно только для сборочных заданий в статусах confirm и prepare.
   *
   * @param data - Request body data
   * @returns Информация о покупателе
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.inStorePickup.createOrdersClient({ orders: [12345] });
   * console.log(result);
   */
  async createOrdersClient(e) {
    return this.client.post(
      "https://marketplace-api.wildberries.ru/api/v3/click-collect/orders/client",
      e,
      { rateLimitKey: "in-store-pickup.postClickCollectOrdersClient" }
    );
  }
  /**
   * Проверить, что заказ принадлежит покупателю
   *
   * Метод сообщает, принадлежит ли проверяемый заказ покупателю или нет по переданному коду.
   * Доступно, если хотя бы одно сборочное задание из заказа находится в статусе prepare.
   *
   * @param data - Request body data
   * @returns Результат проверки идентификации
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.inStorePickup.createClientIdentity({ orderCode: '170046918-0011', passcode: '4567' });
   * console.log(result);
   */
  async createClientIdentity(e) {
    return this.client.post(
      "https://marketplace-api.wildberries.ru/api/v3/click-collect/orders/client/identity",
      e,
      { rateLimitKey: "in-store-pickup.postClickCollectOrdersClientIdentity" }
    );
  }
  /**
   * Сообщить, что заказ принят покупателем
   *
   * Метод переводит сборочное задание в статус receive — получено покупателем.
   *
   * @param orderId - ID сборочного задания
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * await sdk.inStorePickup.updateOrdersReceive(12345);
   */
  async updateOrdersReceive(e) {
    return this.client.patch(
      `https://marketplace-api.wildberries.ru/api/v3/click-collect/orders/${e}/receive`,
      {},
      { rateLimitKey: "in-store-pickup.patchClickCollectOrdersReceive" }
    );
  }
  /**
   * Сообщить, что покупатель отказался от заказа
   *
   * Метод переводит сборочное задание в статус reject — отказ при получении.
   *
   * @param orderId - ID сборочного задания
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * await sdk.inStorePickup.updateOrdersReject(12345);
   */
  async updateOrdersReject(e) {
    return this.client.patch(
      `https://marketplace-api.wildberries.ru/api/v3/click-collect/orders/${e}/reject`,
      {},
      { rateLimitKey: "in-store-pickup.patchClickCollectOrdersReject" }
    );
  }
  /**
   * Получить статусы сборочных заданий
   *
   * Метод возвращает статусы сборочных заданий по их ID.
   *
   * @param data - Request body data
   * @returns Статусы сборочных заданий
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.inStorePickup.createOrdersStatus({ orders: [12345] });
   * console.log(result);
   */
  async createOrdersStatus(e) {
    return this.client.post(
      "https://marketplace-api.wildberries.ru/api/v3/click-collect/orders/status",
      e,
      { rateLimitKey: "in-store-pickup.postClickCollectOrdersStatus" }
    );
  }
  /**
   * Получить информацию о завершённых сборочных заданиях
   *
   * Метод возвращает информацию о завершённых сборочных заданиях после продажи или отмены заказа.
   * Можно получить данные за заданный период, максимум 30 календарных дней одним запросом.
   *
   * @param [options] - Query parameters
   * @returns Список завершённых сборочных заданий
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.inStorePickup.getClickCollectOrders({ limit: 10, next: 0, dateFrom: 0, dateTo: 0 });
   * console.log(result);
   */
  async getClickCollectOrders(e) {
    return this.client.get(
      "https://marketplace-api.wildberries.ru/api/v3/click-collect/orders",
      { params: e, rateLimitKey: "in-store-pickup.clickCollectOrders" }
    );
  }
  /**
   * Отменить сборочное задание
   *
   * Метод отменяет сборочное задание и переводит в статус cancel — отменено продавцом.
   *
   * @param orderId - ID сборочного задания
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * await sdk.inStorePickup.updateOrdersCancel(12345);
   */
  async updateOrdersCancel(e) {
    return this.client.patch(
      `https://marketplace-api.wildberries.ru/api/v3/click-collect/orders/${e}/cancel`,
      {},
      { rateLimitKey: "in-store-pickup.patchClickCollectOrdersCancel" }
    );
  }
  /**
   * Получить метаданные сборочного задания
   *
   * Метод возвращает метаданные сборочного задания.
   * Перечень метаданных, доступных для сборочного задания, можно получить в списке новых сборочных заданий, поле requiredMeta.
   *
   * @param orderId - ID сборочного задания
   * @returns Метаданные сборочного задания
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * const result = await sdk.inStorePickup.getOrdersMeta(12345);
   * console.log(result);
   */
  async getOrdersMeta(e) {
    return this.client.get(
      `https://marketplace-api.wildberries.ru/api/v3/click-collect/orders/${e}/meta`,
      { rateLimitKey: "in-store-pickup.clickCollectOrdersMeta" }
    );
  }
  /**
   * Удалить метаданные сборочного задания
   *
   * Метод удаляет значение метаданных сборочного задания для переданного ключа.
   * Возможные метаданные: imei, uin, gtin, sgtin. Передается только одно значение.
   *
   * @param orderId - ID сборочного задания
   * @param options - Query parameters
   * @param options.key - Metadata key to delete (imei, uin, gtin, sgtin)
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * await sdk.inStorePickup.deleteOrdersMeta(12345, { key: 'imei' });
   */
  async deleteOrdersMeta(e, t) {
    return this.client.delete(
      `https://marketplace-api.wildberries.ru/api/v3/click-collect/orders/${e}/meta`,
      {},
      { params: t, rateLimitKey: "in-store-pickup.deleteClickCollectOrdersMeta" }
    );
  }
  /**
   * Закрепить за сборочным заданием код маркировки товара (SGTIN)
   *
   * Метод закрепляет за сборочным заданием код маркировки Честный знак.
   * Закрепить код маркировки можно только, если в метаданных есть поле sgtins,
   * а сборочное задание находится в статусе confirm.
   *
   * @param orderId - ID сборочного задания
   * @param data - Request body data
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * await sdk.inStorePickup.updateMetaSgtin(12345, { sgtins: ['1234567890123456'] });
   */
  async updateMetaSgtin(e, t) {
    return this.client.put(
      `https://marketplace-api.wildberries.ru/api/v3/click-collect/orders/${e}/meta/sgtin`,
      t,
      { rateLimitKey: "in-store-pickup.putClickCollectOrdersMetaSgtin" }
    );
  }
  /**
   * Закрепить за сборочным заданием УИН (уникальный идентификационный номер)
   *
   * Метод обновляет УИН сборочного задания. У одного сборочного задания может быть только один УИН.
   * Добавлять маркировку можно только для сборочных заданий в статусе confirm.
   *
   * @param orderId - ID сборочного задания
   * @param data - Request body data
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * await sdk.inStorePickup.updateMetaUin(12345, { uin: '1234567890123456' });
   */
  async updateMetaUin(e, t) {
    return this.client.put(
      `https://marketplace-api.wildberries.ru/api/v3/click-collect/orders/${e}/meta/uin`,
      t,
      { rateLimitKey: "in-store-pickup.putClickCollectOrdersMetaUin" }
    );
  }
  /**
   * Закрепить за сборочным заданием IMEI
   *
   * Метод обновляет IMEI сборочного задания. У одного сборочного задания может быть только один IMEI.
   * Добавлять маркировку можно только для сборочных заданий в статусе confirm.
   *
   * @param orderId - ID сборочного задания
   * @param data - Request body data
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * await sdk.inStorePickup.updateMetaImei(12345, { imei: '123456789012345' });
   */
  async updateMetaImei(e, t) {
    return this.client.put(
      `https://marketplace-api.wildberries.ru/api/v3/click-collect/orders/${e}/meta/imei`,
      t,
      { rateLimitKey: "in-store-pickup.putClickCollectOrdersMetaImei" }
    );
  }
  /**
   * Закрепить за сборочным заданием GTIN
   *
   * Метод обновляет GTIN (уникальный ID товара в Беларуси) сборочного задания.
   * У одного сборочного задания может быть только один GTIN.
   * Добавлять маркировку можно только для сборочных заданий в статусе confirm.
   *
   * @param orderId - ID сборочного задания
   * @param data - Request body data
   * @returns Response data
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @example
   * await sdk.inStorePickup.updateMetaGtin(12345, { gtin: '1234567890123456' });
   */
  async updateMetaGtin(e, t) {
    return this.client.put(
      `https://marketplace-api.wildberries.ru/api/v3/click-collect/orders/${e}/meta/gtin`,
      t,
      { rateLimitKey: "in-store-pickup.putClickCollectOrdersMetaGtin" }
    );
  }
};
var M = "https://marketplace-api.wildberries.ru";
var Js = 30 * 24 * 60 * 60;
var Xs = class {
  constructor(e) {
    this.client = e;
  }
  /**
   * Get list of new DBS assembly tasks
   *
   * Returns all new orders awaiting processing. Each order includes:
   * - Customer address with GPS coordinates for delivery routing
   * - Delivery window (ddate, dTimeFrom, dTimeTo)
   * - requiredMeta indicating which metadata must be added before shipping
   *
   * Rate limit: 300 requests/min, 200ms interval, 20 burst
   *
   * @returns Promise resolving to list of new DBS orders
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {NetworkError} When network request fails
   *
   * @see {@link https://dev.wildberries.ru/openapi/orders-dbs#tag/Sborochnye-zadaniya-DBS/paths/~1api~1v3~1dbs~1orders~1new/get}
   *
   * @example
   * ```typescript
   * const newOrders = await sdk.ordersDBS.getNewOrders();
   *
   * for (const order of newOrders.orders ?? []) {
   *   console.log(`Order ${order.id}: ${order.address?.fullAddress}`);
   *   console.log(`Delivery: ${order.ddate} ${order.dTimeFrom}-${order.dTimeTo}`);
   *
   *   if (order.requiredMeta && order.requiredMeta.length > 0) {
   *     console.log(`Required metadata: ${order.requiredMeta.join(', ')}`);
   *   }
   * }
   * ```
   */
  async getNewOrders() {
    return this.client.get(`${M}/api/v3/dbs/orders/new`, {
      rateLimitKey: "orders-dbs.getNewOrders"
    });
  }
  /**
   * Get completed DBS orders with pagination and date filtering
   *
   * Returns orders that have been completed (delivered) or cancelled.
   * Maximum 30 calendar days per request.
   *
   * Rate limit: 300 requests/min, 200ms interval, 20 burst
   *
   * @param params - Query parameters for filtering and pagination
   * @param params.limit - Number of orders to return (1-1000)
   * @param params.next - Pagination cursor (0 for first request)
   * @param params.dateFrom - Start date as Unix timestamp
   * @param params.dateTo - End date as Unix timestamp
   * @returns Promise resolving to orders and next pagination cursor
   * @throws {ValidationError} When parameters are invalid (limit out of range, date range > 30 days)
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {NetworkError} When network request fails
   *
   * @see {@link https://dev.wildberries.ru/openapi/orders-dbs#tag/Zakazy-DBS/paths/~1api~1v3~1dbs~1orders/get}
   *
   * @example
   * ```typescript
   * // Get orders from last 7 days with pagination
   * const now = Math.floor(Date.now() / 1000);
   * const weekAgo = now - 7 * 24 * 60 * 60;
   *
   * let next = 0;
   * do {
   *   const result = await sdk.ordersDBS.getOrders({
   *     limit: 100,
   *     next,
   *     dateFrom: weekAgo,
   *     dateTo: now
   *   });
   *
   *   console.log(`Fetched ${result.orders?.length ?? 0} orders`);
   *   next = result.next ?? 0;
   * } while (next > 0);
   * ```
   */
  async getOrders(e) {
    if (e.limit < 1 || e.limit > 1e3)
      throw new b("limit must be between 1 and 1000");
    if (e.next < 0)
      throw new b("next must be >= 0");
    const t = e.dateTo - e.dateFrom;
    if (t > Js)
      throw new b("Date range cannot exceed 30 calendar days");
    if (t < 0)
      throw new b("dateFrom must be less than or equal to dateTo");
    return this.client.get(`${M}/api/v3/dbs/orders`, {
      params: {
        limit: e.limit,
        next: e.next,
        dateFrom: e.dateFrom,
        dateTo: e.dateTo
      },
      rateLimitKey: "orders-dbs.getOrders"
    });
  }
  /**
   * Get customer contact information for DBS orders
   *
   * Returns customer name, phone number, and additional contact codes.
   * Use this to contact customers for delivery coordination.
   *
   * Rate limit: 300 requests/min, 200ms interval, 20 burst
   *
   * @param orderIds - Array of order IDs to get client info for
   * @returns Promise resolving to customer contact information
   * @throws {ValidationError} When orderIds array is empty
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {NotFoundError} When order not found (404)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {NetworkError} When network request fails
   *
   * @see {@link https://dev.wildberries.ru/openapi/orders-dbs#tag/Zakazy-DBS/paths/~1api~1v3~1dbs~1orders~1client/post}
   *
   * @example
   * ```typescript
   * const clientInfo = await sdk.ordersDBS.getClientInfo([123456, 234567]);
   *
   * for (const client of clientInfo.orders ?? []) {
   *   console.log(`Order ${client.orderID}:`);
   *   console.log(`  Name: ${client.fullName}`);
   *   console.log(`  Phone: +${client.phoneCode}${client.phone}`);
   * }
   * ```
   */
  async getClientInfo(e) {
    if (e.length === 0)
      throw new b("orderIds array cannot be empty");
    return this.client.post(
      `${M}/api/v3/dbs/orders/client`,
      { orders: e },
      { rateLimitKey: "orders-dbs.getClientInfo" }
    );
  }
  /**
   * Get B2B buyer information for DBS orders
   *
   * Returns B2B buyer details (organization name, INN, KPP) for orders
   * placed by business customers. For B2C orders, returns an error
   * indicating the order is not a B2B order.
   *
   * Note: Individual Entrepreneurs (IP) may have empty KPP field
   * and a 12-digit INN instead of 10-digit INN for legal entities.
   *
   * Rate limit: Standard DBS rate limits apply
   *
   * @param orderIds - Array of order IDs to get B2B info for (1-1000 items)
   * @returns Promise resolving to B2B buyer information for each order
   * @throws {ValidationError} When orderIds array is empty or exceeds 1000 items
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {NetworkError} When network request fails
   *
   * @see {@link https://dev.wildberries.ru/openapi/orders-dbs#tag/B2B}
   *
   * @example
   * ```typescript
   * const b2bInfo = await sdk.ordersDBS.getB2BInfo([123456, 234567]);
   *
   * for (const result of b2bInfo.results ?? []) {
   *   if (result.isError) {
   *     console.log(`Order ${result.orderId}: Not a B2B order`);
   *   } else {
   *     console.log(`Order ${result.orderId}:`);
   *     console.log(`  Organization: ${result.data?.orgName}`);
   *     console.log(`  INN: ${result.data?.inn}`);
   *     console.log(`  KPP: ${result.data?.kpp || 'N/A (IP)'}`);
   *   }
   * }
   * ```
   */
  async getB2BInfo(e) {
    if (e.length === 0)
      throw new b("orderIds array cannot be empty");
    if (e.length > 1e3)
      throw new b("orderIds array cannot exceed 1000 items");
    return this.client.post(
      `${M}/api/marketplace/v3/dbs/orders/b2b/info`,
      { ordersIds: e },
      { rateLimitKey: "orders-dbs.getB2BInfo" }
    );
  }
  // ==========================================================================
  // New Info Endpoints (Story 26.1)
  // ==========================================================================
  /**
   * Get paid delivery group information
   *
   * @param request - Request with order IDs
   * @returns Promise resolving to order group information
   *
   * @example
   * ```typescript
   * const groups = await sdk.ordersDBS.getGroupsInfo({ orders: [123456] });
   * ```
   */
  async getGroupsInfo(e) {
    return this.client.post(`${M}/api/v3/dbs/groups/info`, e, {
      rateLimitKey: "orders-dbs.getGroupsInfo"
    });
  }
  /**
   * Get delivery dates for DBS orders
   *
   * @param request - Request with order IDs
   * @returns Promise resolving to delivery date information
   *
   * @example
   * ```typescript
   * const dates = await sdk.ordersDBS.getDeliveryDates({ orders: [123456] });
   * ```
   */
  async getDeliveryDates(e) {
    return this.client.post(
      `${M}/api/v3/dbs/orders/delivery-date`,
      e,
      { rateLimitKey: "orders-dbs.getDeliveryDates" }
    );
  }
  // ==========================================================================
  // Bulk Metadata Endpoints (Story 26.2) - Replace deprecated single-order methods
  // ==========================================================================
  /**
   * Get metadata for multiple orders (bulk)
   *
   * Replaces the deprecated single-order getMeta() method.
   * Rate limit: 150 requests/min, 400ms interval, 20 burst
   *
   * @param request - Request with order IDs
   * @returns Promise resolving to bulk metadata response
   *
   * @example
   * ```typescript
   * const meta = await sdk.ordersDBS.getMetaBulk({ orders: [123456, 234567] });
   * ```
   */
  async getMetaBulk(e) {
    return this.client.post(
      `${M}/api/marketplace/v3/dbs/orders/meta/info`,
      e,
      { rateLimitKey: "orders-dbs.getMetaBulk" }
    );
  }
  /**
   * Delete metadata for multiple orders (bulk)
   *
   * Replaces the deprecated single-order deleteMeta() method.
   * Rate limit: 150 requests/min, 400ms interval, 20 burst
   *
   * @param request - Request with order IDs and metadata key to delete
   * @returns Promise resolving to bulk delete response
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersDBS.deleteMetaBulk({ orders: [123456], key: 'imei' });
   * ```
   */
  async deleteMetaBulk(e) {
    return this.client.post(
      `${M}/api/marketplace/v3/dbs/orders/meta/delete`,
      e,
      { rateLimitKey: "orders-dbs.deleteMetaBulk" }
    );
  }
  /**
   * Set SGTIN codes for multiple orders (bulk)
   *
   * Replaces the deprecated single-order setSgtin() method.
   * Rate limit: 500 requests/min, 120ms interval, 20 burst
   *
   * @param request - Request with order SGTIN data
   * @returns Promise resolving to bulk set response
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersDBS.setSgtinBulk({
   *   orders: [{ orderId: 123456, sgtins: ['1234567890123456'] }]
   * });
   * ```
   */
  async setSgtinBulk(e) {
    return this.client.post(
      `${M}/api/marketplace/v3/dbs/orders/meta/sgtin`,
      e,
      { rateLimitKey: "orders-dbs.setSgtinBulk" }
    );
  }
  /**
   * Set UIN codes for multiple orders (bulk)
   *
   * Replaces the deprecated single-order setUin() method.
   * Rate limit: 500 requests/min, 120ms interval, 20 burst
   *
   * @param request - Request with order UIN data
   * @returns Promise resolving to bulk set response
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersDBS.setUinBulk({
   *   orders: [{ orderId: 123456, uin: '1234567890123456' }]
   * });
   * ```
   */
  async setUinBulk(e) {
    return this.client.post(
      `${M}/api/marketplace/v3/dbs/orders/meta/uin`,
      e,
      { rateLimitKey: "orders-dbs.setUinBulk" }
    );
  }
  /**
   * Set IMEI codes for multiple orders (bulk)
   *
   * Replaces the deprecated single-order setImei() method.
   * Rate limit: 500 requests/min, 120ms interval, 20 burst
   *
   * @param request - Request with order IMEI data
   * @returns Promise resolving to bulk set response
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersDBS.setImeiBulk({
   *   orders: [{ orderId: 123456, imei: '123456789012345' }]
   * });
   * ```
   */
  async setImeiBulk(e) {
    return this.client.post(
      `${M}/api/marketplace/v3/dbs/orders/meta/imei`,
      e,
      { rateLimitKey: "orders-dbs.setImeiBulk" }
    );
  }
  /**
   * Set GTIN codes for multiple orders (bulk)
   *
   * Replaces the deprecated single-order setGtin() method.
   * Rate limit: 500 requests/min, 120ms interval, 20 burst
   *
   * @param request - Request with order GTIN data
   * @returns Promise resolving to bulk set response
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersDBS.setGtinBulk({
   *   orders: [{ orderId: 123456, gtin: '1234567890123' }]
   * });
   * ```
   */
  async setGtinBulk(e) {
    return this.client.post(
      `${M}/api/marketplace/v3/dbs/orders/meta/gtin`,
      e,
      { rateLimitKey: "orders-dbs.setGtinBulk" }
    );
  }
  /**
   * Set customs declaration for multiple orders (bulk)
   *
   * Replaces the deprecated single-order setCustomsDeclaration() method.
   * Rate limit: 500 requests/min, 120ms interval, 20 burst
   *
   * @param request - Request with order customs declaration data
   * @returns Promise resolving to bulk set response
   *
   * @example
   * ```typescript
   * const result = await sdk.ordersDBS.setCustomsDeclarationBulk({
   *   orders: [{ orderId: 123456, customsDeclaration: 'CD-123456789' }]
   * });
   * ```
   */
  async setCustomsDeclarationBulk(e) {
    return this.client.post(
      `${M}/api/marketplace/v3/dbs/orders/meta/customs-declaration`,
      e,
      { rateLimitKey: "orders-dbs.setCustomsDeclarationBulk" }
    );
  }
  // ==========================================================================
  // Bulk Status Management Methods (Story 12.2)
  // ==========================================================================
  /**
   * Get status information for multiple DBS orders (bulk)
   *
   * Retrieves the current status and tracking information for up to 1000 orders
   * in a single request. This is more efficient than individual status queries
   * for batch processing scenarios.
   *
   * Rate limit: Standard DBS rate limits apply
   *
   * @param orderIds - Array of order IDs to get status for (1-1000 items)
   * @returns Promise resolving to status information for each order
   * @throws {ValidationError} When orderIds array is empty or exceeds 1000 items
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {NetworkError} When network request fails
   *
   * @see {@link https://dev.wildberries.ru/openapi/orders-dbs#tag/Status-DBS}
   *
   * @example
   * ```typescript
   * // Get status for multiple orders
   * const statuses = await sdk.ordersDBS.getStatusesBulk([123456, 234567, 345678]);
   *
   * for (const order of statuses.orders ?? []) {
   *   console.log(`Order ${order.orderId}: ${order.wbStatus}`);
   *   console.log(`  Seller status: ${order.supplierStatus}`);
   *   console.log(`  Updated: ${order.changedAt}`);
   * }
   * ```
   */
  async getStatusesBulk(e) {
    if (e.length === 0)
      throw new b("orderIds array cannot be empty");
    if (e.length > 1e3)
      throw new b("orderIds array cannot exceed 1000 items");
    return this.client.post(
      `${M}/api/marketplace/v3/dbs/orders/status/info`,
      { orders: e },
      { rateLimitKey: "orders-dbs.getStatusesBulk" }
    );
  }
  /**
   * Confirm multiple DBS orders for assembly (bulk)
   *
   * Moves up to 1000 orders from "new" to "confirmed" status in a single request.
   * This indicates the seller has acknowledged the orders and will begin
   * preparing them for delivery.
   *
   * Rate limit: Standard DBS rate limits apply
   *
   * @param orderIds - Array of order IDs to confirm (1-1000 items)
   * @returns Promise resolving to confirmation results for each order
   * @throws {ValidationError} When orderIds array is empty or exceeds 1000 items
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {NetworkError} When network request fails
   *
   * @see {@link https://dev.wildberries.ru/openapi/orders-dbs#tag/Status-DBS}
   *
   * @example
   * ```typescript
   * // Confirm multiple orders at once
   * const result = await sdk.ordersDBS.confirmBulk([123456, 234567, 345678]);
   *
   * for (const order of result.orders ?? []) {
   *   if (order.isError) {
   *     console.log(`Order ${order.orderId} failed: ${order.errorText}`);
   *   } else {
   *     console.log(`Order ${order.orderId} confirmed successfully`);
   *   }
   * }
   * ```
   */
  async confirmBulk(e) {
    if (e.length === 0)
      throw new b("orderIds array cannot be empty");
    if (e.length > 1e3)
      throw new b("orderIds array cannot exceed 1000 items");
    return this.client.post(
      `${M}/api/marketplace/v3/dbs/orders/status/confirm`,
      { orders: e },
      { rateLimitKey: "orders-dbs.confirmBulk" }
    );
  }
  /**
   * Mark multiple DBS orders as delivered (bulk)
   *
   * Moves up to 1000 orders to "delivered" status in a single request.
   * Use this when the seller has handed over the packages for delivery
   * to the customer. This triggers the delivery tracking process.
   *
   * **Important:** Orders requiring IMEI must have it attached before calling this method.
   * Check `requiredMeta` array in `getNewOrders()` response — if it contains `"imei"`,
   * call `setImei()` first. Otherwise this method returns 409 with `"detail":"ImeiIsNotFilled"`.
   *
   * Rate limit: Standard DBS rate limits apply
   *
   * @param orderIds - Array of order IDs to mark as delivered (1-1000 items)
   * @returns Promise resolving to delivery status results for each order. When WB returns
   *   application-level 409 MetaValidationFail, it surfaces in `result.results[].errors[]`
   *   with `code === 409` and `detail === 'MetaValidationFail'`; check
   *   `result.results[].errors[].metaDetails[]` per-order before retrying. (since 3.11.0 — WB API 2026-05-06)
   * @throws {ValidationError} When orderIds array is empty or exceeds 1000 items
   * @throws {WBAPIError} 409 — ImeiIsNotFilled: mandatory IMEI not attached to order
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {NetworkError} When network request fails
   *
   * @see {@link https://dev.wildberries.ru/openapi/orders-dbs#tag/Status-DBS}
   *
   * @example
   * ```typescript
   * // Mark multiple orders as delivered to carrier
   * const result = await sdk.ordersDBS.deliverBulk([123456, 234567, 345678]);
   *
   * for (const order of result.orders ?? []) {
   *   if (order.isError) {
   *     console.log(`Order ${order.orderId} failed: ${order.errorText}`);
   *   } else {
   *     console.log(`Order ${order.orderId} marked as delivered`);
   *   }
   * }
   * ```
   */
  async deliverBulk(e) {
    if (e.length === 0)
      throw new b("orderIds array cannot be empty");
    if (e.length > 1e3)
      throw new b("orderIds array cannot exceed 1000 items");
    return this.client.post(
      `${M}/api/marketplace/v3/dbs/orders/status/deliver`,
      { orders: e },
      { rateLimitKey: "orders-dbs.deliverBulk" }
    );
  }
  /**
   * Confirm customer receipt for multiple DBS orders (bulk)
   *
   * Moves up to 1000 orders to "received" status in a single request.
   * Use this when the customer has received and accepted the delivery.
   * Requires the customer confirmation code for each order.
   *
   * Rate limit: Standard DBS rate limits apply
   *
   * @param orders - Array of orders with IDs and customer confirmation codes (1-1000 items)
   * @returns Promise resolving to receive confirmation results for each order
   * @throws {ValidationError} When orders array is empty, exceeds 1000 items, contains invalid orderId, or missing code
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {NetworkError} When network request fails
   *
   * @see {@link https://dev.wildberries.ru/openapi/orders-dbs#tag/Status-DBS}
   *
   * @example
   * ```typescript
   * // Confirm receipt for multiple orders with customer codes
   * const result = await sdk.ordersDBS.receiveBulk([
   *   { orderId: 123456, code: 'ABC123' },
   *   { orderId: 234567, code: 'DEF456' },
   *   { orderId: 345678, code: 'GHI789' }
   * ]);
   *
   * for (const order of result.orders ?? []) {
   *   if (order.isError) {
   *     console.log(`Order ${order.orderId} failed: ${order.errorText}`);
   *   } else {
   *     console.log(`Order ${order.orderId} receipt confirmed`);
   *   }
   * }
   * ```
   */
  async receiveBulk(e) {
    if (e.length === 0)
      throw new b("orders array cannot be empty");
    if (e.length > 1e3)
      throw new b("orders array cannot exceed 1000 items");
    for (const t of e) {
      if (t.orderId <= 0)
        throw new b("orderId must be a positive number");
      if (!t.code || t.code === "")
        throw new b("code cannot be empty");
    }
    return this.client.post(
      `${M}/api/marketplace/v3/dbs/orders/status/receive`,
      { orders: e },
      { rateLimitKey: "orders-dbs.receiveBulk" }
    );
  }
  /**
   * Reject delivery for multiple DBS orders (bulk)
   *
   * Moves up to 1000 orders to "rejected" status in a single request.
   * Use this when the customer has refused to accept the delivery
   * (e.g., wrong product, damaged package, changed mind).
   * Requires the rejection code for each order.
   *
   * Rate limit: Standard DBS rate limits apply
   *
   * @param orders - Array of orders with IDs and rejection codes (1-1000 items)
   * @returns Promise resolving to rejection results for each order
   * @throws {ValidationError} When orders array is empty, exceeds 1000 items, contains invalid orderId, or missing code
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {NetworkError} When network request fails
   *
   * @see {@link https://dev.wildberries.ru/openapi/orders-dbs#tag/Status-DBS}
   *
   * @example
   * ```typescript
   * // Reject delivery for multiple orders with rejection codes
   * const result = await sdk.ordersDBS.rejectBulk([
   *   { orderId: 123456, code: 'DAMAGED' },
   *   { orderId: 234567, code: 'WRONG_ITEM' },
   *   { orderId: 345678, code: 'CUSTOMER_REFUSED' }
   * ]);
   *
   * for (const order of result.orders ?? []) {
   *   if (order.isError) {
   *     console.log(`Order ${order.orderId} rejection failed: ${order.errorText}`);
   *   } else {
   *     console.log(`Order ${order.orderId} rejected successfully`);
   *   }
   * }
   * ```
   */
  async rejectBulk(e) {
    if (e.length === 0)
      throw new b("orders array cannot be empty");
    if (e.length > 1e3)
      throw new b("orders array cannot exceed 1000 items");
    for (const t of e) {
      if (t.orderId <= 0)
        throw new b("orderId must be a positive number");
      if (!t.code || t.code === "")
        throw new b("code cannot be empty");
    }
    return this.client.post(
      `${M}/api/marketplace/v3/dbs/orders/status/reject`,
      { orders: e },
      { rateLimitKey: "orders-dbs.rejectBulk" }
    );
  }
  /**
   * Cancel multiple DBS orders (bulk)
   *
   * Cancels up to 1000 orders in a single request. Use this when the seller
   * cannot fulfill the orders (e.g., out of stock, unable to deliver).
   * Orders can only be cancelled before they are delivered.
   *
   * Rate limit: Standard DBS rate limits apply
   *
   * @param orderIds - Array of order IDs to cancel (1-1000 items)
   * @returns Promise resolving to cancellation results for each order
   * @throws {ValidationError} When orderIds array is empty or exceeds 1000 items
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {NetworkError} When network request fails
   *
   * @see {@link https://dev.wildberries.ru/openapi/orders-dbs#tag/Status-DBS}
   *
   * @example
   * ```typescript
   * // Cancel multiple orders that cannot be fulfilled
   * const result = await sdk.ordersDBS.cancelBulk([123456, 234567, 345678]);
   *
   * for (const order of result.orders ?? []) {
   *   if (order.isError) {
   *     console.log(`Order ${order.orderId} cancellation failed: ${order.errorText}`);
   *   } else {
   *     console.log(`Order ${order.orderId} cancelled successfully`);
   *   }
   * }
   * ```
   */
  async cancelBulk(e) {
    if (e.length === 0)
      throw new b("orderIds array cannot be empty");
    if (e.length > 1e3)
      throw new b("orderIds array cannot exceed 1000 items");
    return this.client.post(
      `${M}/api/marketplace/v3/dbs/orders/status/cancel`,
      { orders: e },
      { rateLimitKey: "orders-dbs.cancelBulk" }
    );
  }
};
var Qs = class {
  constructor(e) {
    this.client = e;
  }
  /**
   * Создание приглашения для пользователя
   *
   * Создаёт приглашение для нового пользователя профиля продавца.
   * В запросе указываются номер телефона, должность и настройки доступа к разделам.
   * Если массив `access` пустой или не указан — будут применены доступы по умолчанию.
   * Возвращает ID приглашения, ссылку для приглашения и срок действия.
   *
   * Rate limit:
   * | Период | Лимит | Интервал | Всплеск |
   * | --- | --- | --- | --- |
   * | 1 мин | 60 запросов | 1 секунда | 5 запросов |
   *
   * @param data - Данные для создания приглашения (доступы и информация о приглашённом)
   * @returns Результат создания приглашения (ID, URL, срок действия, статус)
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/api-information#tag/Upravlenie-polzovatelyami-prodavca}
   * @example
   * ```typescript
   * const result = await sdk.userManagement.createInvite({
   *   invite: {
   *     phoneNumber: '+79991234567',
   *     position: 'Менеджер',
   *   },
   *   access: [
   *     { code: 'balance', disabled: false },
   *     { code: 'finance', disabled: true },
   *   ],
   * });
   * console.log(result.inviteUrl);
   * console.log(result.inviteID);
   * ```
   */
  async createInvite(e) {
    return this.client.post(
      "https://user-management-api.wildberries.ru/api/v1/invite",
      e,
      {
        rateLimitKey: "userManagement.createInvite"
      }
    );
  }
  /**
   * Получение списка пользователей профиля продавца
   *
   * Возвращает список активных или приглашённых пользователей профиля продавца.
   * Поддерживает пагинацию через `limit` и `offset`.
   * Параметр `isInviteOnly` позволяет фильтровать только приглашённых,
   * которые ещё не активировали доступ.
   *
   * Rate limit:
   * | Период | Лимит | Интервал | Всплеск |
   * | --- | --- | --- | --- |
   * | 1 мин | 60 запросов | 1 секунда | 5 запросов |
   *
   * @readonly
   * @param [params] - Параметры запроса (пагинация и фильтрация)
   * @param [params.limit] - Количество пользователей в ответе (по умолчанию 100, максимум 100)
   * @param [params.offset] - Сколько элементов пропустить (по умолчанию 0)
   * @param [params.isInviteOnly] - Фильтр: true — только приглашённые, false — активные
   * @returns Список пользователей с общим количеством
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/api-information#tag/Upravlenie-polzovatelyami-prodavca}
   * @example
   * ```typescript
   * const result = await sdk.userManagement.getUsers({ limit: 50, offset: 0 });
   * console.log(result.total);
   * for (const user of result.users) {
   *   console.log(user.firstName, user.secondName, user.role);
   * }
   * ```
   */
  async getUsers(e) {
    return this.client.get(
      "https://user-management-api.wildberries.ru/api/v1/users",
      {
        params: e ? { ...e } : void 0,
        rateLimitKey: "userManagement.getUsers"
      }
    );
  }
  /**
   * Обновление настроек доступа пользователей
   *
   * Обновляет настройки доступа к разделам профиля продавца для указанных пользователей.
   * Для каждого пользователя передаётся массив настроек доступа с кодом раздела
   * и статусом (disabled: true — запрещён, false — разрешён).
   *
   * Rate limit:
   * | Период | Лимит | Интервал | Всплеск |
   * | --- | --- | --- | --- |
   * | 1 мин | 60 запросов | 1 секунда | 5 запросов |
   *
   * @param data - Настройки доступа для пользователей
   * @returns void (200 ответ без тела)
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/api-information#tag/Upravlenie-polzovatelyami-prodavca}
   * @example
   * ```typescript
   * await sdk.userManagement.updateUserAccess({
   *   usersAccesses: [
   *     {
   *       userId: 12345,
   *       access: [
   *         { code: 'balance', disabled: false },
   *         { code: 'finance', disabled: true },
   *       ],
   *     },
   *   ],
   * });
   * ```
   */
  async updateUserAccess(e) {
    return this.client.put("https://user-management-api.wildberries.ru/api/v1/users/access", e, {
      rateLimitKey: "userManagement.updateAccess"
    });
  }
  /**
   * Удаление пользователя из профиля продавца
   *
   * Удаляет пользователя из профиля продавца по его ID.
   * ID пользователя передаётся как query-параметр `deletedUserID`.
   * После удаления пользователь теряет доступ ко всем разделам профиля.
   *
   * Rate limit:
   * | Период | Лимит | Интервал | Всплеск |
   * | --- | --- | --- | --- |
   * | 1 мин | 60 запросов | 1 секунда | 10 запросов |
   *
   * @param deletedUserID - ID удаляемого пользователя
   * @returns void (200 ответ без тела)
   * @throws {AuthenticationError} When API key is invalid (401/403)
   * @throws {RateLimitError} When rate limit exceeded (429)
   * @throws {ValidationError} When request data is invalid (400/422)
   * @throws {NetworkError} When network request fails or times out
   * @see {@link https://dev.wildberries.ru/openapi/api-information#tag/Upravlenie-polzovatelyami-prodavca}
   * @example
   * ```typescript
   * await sdk.userManagement.deleteUser(12345);
   * ```
   */
  async deleteUser(e) {
    return this.client.delete("https://user-management-api.wildberries.ru/api/v1/user", void 0, {
      params: { deletedUserID: e },
      rateLimitKey: "userManagement.deleteUser"
    });
  }
};
function Ae(r) {
  if (!r) return "other";
  const e = r.toLowerCase().trim();
  return e ? /повреждени|поврежд|сломан|разбит|потёрт|царапин|деформ|помят/.test(e) ? "damage" : /брак|дефект|неисправн|не работает|сломалось|не включается/.test(e) ? "defect" : /не подошёл размер|не подошел размер|не по размеру|размер не подошёл|размер не подошел|маловат|великоват|узк|шир/.test(
    e
  ) ? "wrong_size" : /не тот товар|неправильный товар|ошибк[аи] комплект|пришло другое|перепутали/.test(e) ? "wrong_item" : /срок годности|истёк срок|истек срок|просроч|время.*возврат/.test(e) ? "expired" : /не соответств|не как на фото|описан|качество|не оправда/.test(e) ? "not_as_described" : /отказ|раздума|передумал|не понравил|не нужен|вернуть/.test(e) ? "customer_refused" : "other" : "other";
}
function Ys(r) {
  if (r == null || r === "") return 0;
  const e = parseFloat(r);
  return Number.isNaN(e) ? 0 : e;
}
function Zs(r, e) {
  const t = new Date(r), s = new Date(e);
  if (isNaN(t.getTime()))
    throw new Error(`Invalid dateFrom: '${r}' is not a valid date string`);
  if (isNaN(s.getTime()))
    throw new Error(`Invalid dateTo: '${e}' is not a valid date string`);
  const a = (s.getTime() - t.getTime()) / (1e3 * 60 * 60 * 24);
  if (a < 0)
    throw new Error(`dateFrom (${r}) must be <= dateTo (${e})`);
  if (a > 31)
    throw new Error(
      `Date range exceeds 31-day limit (got ${Math.round(a)} days). WB getAnalyticsGoodsReturn supports max 31 days. Split your range and call getReturns() multiple times.`
    );
}
function ei(r) {
  return r.isStatusActive === 1 ? "initiated" : r.isStatusActive === 0 && r.completedDt ? "processed" : "received";
}
function ti(r) {
  const e = [];
  for (const t of r) {
    if (t.nmId === void 0 || !t.orderId && t.orderId !== 0) continue;
    const s = t.completedDt ?? t.readyToReturnDt ?? t.orderDt;
    s && e.push({
      orderId: String(t.orderId),
      nmId: t.nmId,
      orderType: "fbo",
      returnDate: s,
      returnStatus: ei(t),
      returnReason: t.reason ?? "",
      returnReasonCode: Ae(t.reason ?? ""),
      returnCategory: "unknown",
      quantity: 1,
      srid: t.srid
    });
  }
  return e;
}
function ri(r, e) {
  if (e.length === 0) return r;
  const t = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  for (const a of e) {
    const n = a.forPay !== void 0 ? Ys(a.forPay) : 0;
    if (a.srid && t.set(a.srid, (t.get(a.srid) ?? 0) + n), a.orderId !== void 0 && a.nmId !== void 0) {
      const o = `${a.orderId}:${a.nmId}`;
      s.set(o, (s.get(o) ?? 0) + n), a.srid && !i.has(o) && i.set(o, a.srid);
    }
  }
  return r.map((a) => {
    let n, o;
    if (a.srid && t.has(a.srid))
      n = t.get(a.srid);
    else {
      const u = `${a.orderId}:${a.nmId}`;
      s.has(u) && (n = s.get(u), o = i.get(u));
    }
    return n === void 0 ? a : { ...a, returnAmount: n, srid: a.srid ?? o };
  });
}
function si(r) {
  const e = /* @__PURE__ */ new Set();
  return r.filter((t) => t.srid ? e.has(t.srid) ? false : (e.add(t.srid), true) : true);
}
var ii = class {
  /**
   * Constructor parameters `_client` and `_ordersFBS` are reserved for
   * v3.10.1 FBS status history implementation. The `_` prefix satisfies
   * TypeScript `noUnusedParameters` while preserving the full DI contract
   * documented in story 13.2.
   */
  constructor(e, t, s, i) {
    this.reports = t, this.finances = i;
  }
  /**
   * Fetches all finance lines via cursor pagination on rrdId.
   * Returns up to FINANCE_PAGE_LIMIT × FINANCE_MAX_PAGES rows; if truncated,
   * pushes a warning into the supplied warnings array.
   */
  async fetchAllFinanceLines(e, t, s) {
    const n = [];
    let o = 0;
    for (let u = 0; u < 5; u++) {
      const l = await this.finances.getSalesReportsDetailed({
        dateFrom: e,
        dateTo: t,
        limit: 1e5,
        rrdId: o
      });
      if (l.length === 0 || (n.push(...l), l.length < 1e5)) break;
      const p = l[l.length - 1];
      if (p.rrdId === void 0) break;
      o = p.rrdId;
    }
    return n.length >= 1e5 * 5 && s.push(
      `Finance source truncated at ${n.length} lines (safety cap). Some returnAmount values may be missing for high-volume sellers \u2014 narrow your date range and call getReturns() multiple times.`
    ), n;
  }
  /**
   * Unified return analytics aggregator.
   *
   * Fetches FBO returns from `sdk.reports.getAnalyticsGoodsReturn()`,
   * optionally FBS returns (reserved — currently skipped), and enriches all
   * records with financial amounts from `sdk.finances.getSalesReportsDetailed()`.
   *
   * Parallel execution via `Promise.allSettled` — one source failing does NOT
   * abort the response; failures are surfaced in `partialFailures`.
   *
   * **Rate limit note**: FBO source is 1 req/min; Finance source is 1 req/min.
   * Both are fetched in parallel to minimise wall-clock time.
   *
   * @param params - Date range, optional filters, and pagination
   * @returns Unified `ReturnsApiResponse` with data, warnings, partialFailures, _meta
   * @throws {Error} If `dateFrom > dateTo`, range exceeds 31 days, or date strings are invalid
   *
   * @example
   * ```typescript
   * const result = await sdk.returns.getReturns({
   *   dateFrom: '2026-04-01',
   *   dateTo: '2026-04-30',
   *   orderType: 'fbo',
   * });
   * result.data.forEach(r => console.log(r.returnReasonCode, r.returnAmount));
   * ```
   *
   * @since v3.10.0
   */
  async getReturns(e) {
    Zs(e.dateFrom, e.dateTo);
    const t = e.orderType !== "fbs", s = [];
    e.orderType !== "fbo" && (e.includeFbsStatusHistory === true ? s.push(
      "FBS status history fetching is reserved for future implementation in v3.10.0; FBS source skipped"
    ) : s.push(
      "FBS status history skipped \u2014 pass includeFbsStatusHistory: true to include (currently no-op in v3.10.0)"
    ));
    const [i, a] = await Promise.allSettled([
      t ? this.reports.getAnalyticsGoodsReturn({
        dateFrom: e.dateFrom,
        dateTo: e.dateTo
      }) : Promise.resolve(null),
      this.fetchAllFinanceLines(e.dateFrom, e.dateTo, s)
    ]), n = [];
    i.status === "rejected" && n.push({
      source: "fbo",
      error: i.reason instanceof Error ? i.reason.message : String(i.reason)
    }), a.status === "rejected" && n.push({
      source: "finance",
      error: a.reason instanceof Error ? a.reason.message : String(a.reason)
    });
    const o = i.status === "fulfilled" && i.value ? ti(i.value.report ?? []) : [], u = a.status === "fulfilled" ? a.value : [], l = {
      sources: {
        fbo: t ? {
          fetched: o.length,
          skipped: false,
          failed: i.status === "rejected",
          reason: i.status === "rejected" ? "fetch failed" : void 0
        } : { fetched: 0, skipped: true, failed: false, reason: "orderType filter" },
        fbs: {
          fetched: 0,
          skipped: true,
          failed: false,
          reason: "v3.10.0: implementation deferred"
        },
        finance: {
          fetched: u.length,
          skipped: false,
          failed: a.status === "rejected",
          reason: a.status === "rejected" ? "fetch failed" : void 0
        }
      }
    }, p = ri(o, u), f = si(p), m = e.nmIds, g = m ? f.filter((L) => m.includes(L.nmId)) : f;
    g.sort((L, w) => w.returnDate.localeCompare(L.returnDate));
    const d = e.offset ?? 0, h = g.length, y = e.limit ?? g.length;
    return { data: g.slice(d, d + y), total: h, warnings: s, partialFailures: n, _meta: l };
  }
  /**
   * Convenience: fetch a single return record by WB orderId.
   *
   * Wraps `getReturns()` and filters in-memory. Date range still required because
   * WB API requires it.
   *
   * @param orderId - WB order ID (string for BigInt safety)
   * @param params - Date window
   * @returns The matching ReturnItem, or `null` if not found
   * @throws {Error} When orderId is empty
   *
   * @example
   * ```typescript
   * const ret = await sdk.returns.getReturnByOrderId('123456789', {
   *   dateFrom: '2026-04-01',
   *   dateTo: '2026-04-30',
   * });
   * if (ret) console.log(ret.returnReason, ret.returnAmount);
   * ```
   *
   * **Important**: When the underlying `getReturns()` partial-failed (e.g., FBO
   * source down), this method may return `null` even though the order exists.
   * If you need failure visibility, call `getReturns()` directly and inspect
   * the `partialFailures` field.
   *
   * @since v3.10.0
   */
  async getReturnByOrderId(e, t) {
    if (!e || e.trim() === "")
      throw new Error("orderId must be a non-empty string");
    return (await this.getReturns({
      dateFrom: t.dateFrom,
      dateTo: t.dateTo,
      orderType: t.orderType
    })).data.find((i) => i.orderId === e) ?? null;
  }
  /**
   * Convenience: aggregate return statistics grouped by nmId / category / orderType.
   *
   * Calls `getReturns()` once with the same filters, then post-processes in-memory.
   * Buckets sorted by `count` descending (key ascending as tiebreaker).
   *
   * @example
   * ```typescript
   * // Top SKUs by return count
   * const stats = await sdk.returns.getReturnStats({
   *   dateFrom: '2026-04-01',
   *   dateTo: '2026-04-30',
   *   groupBy: 'nmId',
   * });
   * stats.buckets.slice(0, 10).forEach(b => {
   *   console.log(`nmId=${b.key}: ${b.count} returns, ${b.totalAmount} ₽ ` +
   *     `(${b.pendingFinanceCount} pending finance)`);
   * });
   * ```
   *
   * **Important**: When `partialFailures` is non-empty, the bucket counts may be
   * understated — one or more underlying sources failed. Always check
   * `result.partialFailures.length === 0` before trusting zero/low counts.
   *
   * @example
   * ```typescript
   * const stats = await sdk.returns.getReturnStats({ ... });
   * if (stats.partialFailures.length > 0) {
   *   console.warn('Some sources failed:', stats.partialFailures);
   *   // Treat zero counts as "unknown", not "no returns"
   * }
   * ```
   *
   * @since v3.10.0
   */
  async getReturnStats(e) {
    const t = await this.getReturns({
      dateFrom: e.dateFrom,
      dateTo: e.dateTo,
      nmIds: e.nmIds,
      orderType: e.orderType
      // No limit — we want ALL records for accurate stats
    }), s = /* @__PURE__ */ new Map();
    for (const a of t.data) {
      let n;
      switch (e.groupBy) {
        case "nmId":
          n = String(a.nmId);
          break;
        case "category":
          n = a.returnCategory;
          break;
        case "orderType":
          n = a.orderType;
          break;
        default: {
          const u = e.groupBy;
          throw new Error(`Unsupported groupBy value: ${String(u)}`);
        }
      }
      const o = s.get(n) ?? { count: 0, totalAmount: 0, pendingFinanceCount: 0 };
      o.count++, a.returnAmount !== void 0 ? o.totalAmount += a.returnAmount : o.pendingFinanceCount++, s.set(n, o);
    }
    const i = Array.from(s.entries()).map(([a, n]) => ({
      key: a,
      count: n.count,
      totalAmount: n.totalAmount,
      pendingFinanceCount: n.pendingFinanceCount
    }));
    return i.sort((a, n) => n.count !== a.count ? n.count - a.count : a.key.localeCompare(n.key)), {
      buckets: i,
      totalReturns: i.reduce((a, n) => a + n.count, 0),
      totalAmount: i.reduce((a, n) => a + n.totalAmount, 0),
      warnings: t.warnings,
      partialFailures: t.partialFailures,
      _meta: t._meta
    };
  }
};
var aa = class {
  /**
   * Initialize the Wildberries SDK with configuration
   *
   * Creates a new SDK instance with the provided configuration.
   * The SDK uses a single shared HTTP client for all API modules to ensure
   * consistent authentication, rate limiting, and error handling.
   *
   * @param config - SDK configuration options
   * @throws {AuthenticationError} If API key is missing or invalid
   *
   * @example
   * ```typescript
   * const sdk = new WildberriesSDK({
   *   apiKey: process.env.WB_API_KEY!,
   *   timeout: 30000,
   *   logLevel: 'info'
   * });
   * ```
   */
  constructor(e) {
    if (!e.apiKey || e.apiKey.trim() === "")
      throw new Te(
        "API key is required. Please provide a valid Wildberries API key in the configuration.",
        401
      );
    this.client = new Rs(e);
    const t = e.tokenType ?? "personal";
    (t === "basic" || t === "test") && console.warn(
      `[WildberriesSDK] ${t.charAt(0).toUpperCase() + t.slice(1)} token detected. Reduced rate limits apply. Consider upgrading to a Personal or Service token. See https://dev.wildberries.ru/news/281`
    ), this.general = new Bs(this.client), this.products = new Os(this.client), this.ordersFBS = new Es(this.client), this.ordersFBW = new Ds(this.client), this.finances = new Is(this.client), this.analytics = new Fs(this.client), this.communications = new Gs(this.client), this.reports = new Ws(this.client), this.promotion = new Hs(this.client), this.tariffs = new Vs(this.client), this.inStorePickup = new zs(this.client), this.ordersDBS = new Xs(this.client), this.userManagement = new Qs(this.client), this.returns = new ii(this.client, this.reports, this.ordersFBS, this.finances);
  }
};

// scripts/sync-modules/prices.mjs
var FETCH_TIMEOUT2 = 3e4;
var noopLog2 = {
  write: () => {
  },
  line: () => {
  },
  progress: () => {
  },
  detail: () => {
  }
};
async function wbFetchOfficialPrices(apiKey, log2 = noopLog2) {
  if (!apiKey) return /* @__PURE__ */ new Map();
  const sdk = new aa({
    apiKey,
    timeout: FETCH_TIMEOUT2
  });
  const priceMap = /* @__PURE__ */ new Map();
  log2.write("  Fetching WB official prices (via SDK)...");
  try {
    let offset = 0;
    const LIMIT = 1e3;
    while (true) {
      const response = await sdk.products.getGoodsFilter({
        limit: LIMIT,
        offset
      });
      const goods = response?.data?.listGoods || [];
      if (goods.length === 0) break;
      for (const g of goods) {
        const size = g.sizes?.[0];
        if (size?.price != null) {
          priceMap.set(g.nmID, {
            price: size.price / 100,
            discountedPrice: size.discountedPrice / 100
          });
        }
      }
      log2.write(` ${priceMap.size}`);
      if (goods.length < LIMIT) break;
      offset += LIMIT;
    }
    log2.line(` \u2014 ${priceMap.size} products via SDK`);
  } catch (err) {
    log2.line(`
  SDK prices API error: ${err.message}`);
  }
  return priceMap;
}

// scripts/sync-modules/stocks.mjs
var FETCH_TIMEOUT3 = 3e4;
var BATCH_SIZE = 1e3;
var noopLog3 = {
  write: () => {
  },
  line: () => {
  },
  progress: () => {
  },
  detail: () => {
  }
};
async function wbFetchStocks(nmIDs, apiKey, log2 = noopLog3) {
  if (!nmIDs || nmIDs.length === 0 || !apiKey) return /* @__PURE__ */ new Map();
  const sdk = new aa({
    apiKey,
    timeout: FETCH_TIMEOUT3
  });
  const stockMap = /* @__PURE__ */ new Map();
  const now = /* @__PURE__ */ new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
  const periodStart = thirtyDaysAgo.toISOString().split("T")[0];
  const periodEnd = now.toISOString().split("T")[0];
  log2.write(`  Fetching WB stocks (via SDK) for ${nmIDs.length} cards:`);
  try {
    let offset = 0;
    while (offset < nmIDs.length) {
      const chunk = nmIDs.slice(offset, offset + BATCH_SIZE);
      const response = await sdk.analytics.createProductsProduct({
        nmIDs: chunk,
        currentPeriod: { start: periodStart, end: periodEnd },
        stockType: "",
        skipDeletedNm: true,
        availabilityFilters: [],
        orderBy: { field: "stockCount", mode: "desc" },
        limit: BATCH_SIZE,
        offset: 0
      });
      const items = response?.data?.items || [];
      for (const item of items) {
        if (item.nmID && item.metrics?.stockCount != null) {
          stockMap.set(item.nmID, item.metrics.stockCount);
        }
      }
      log2.write(` ${stockMap.size}`);
      offset += BATCH_SIZE;
    }
    log2.line(` \u2014 ${stockMap.size} products`);
  } catch (err) {
    log2.line(`
  SDK stocks API error: ${err.message}`);
  }
  return stockMap;
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
  sleep(ms2) {
    return new Promise((resolve) => setTimeout(resolve, ms2));
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
async function ozonFetchAllProducts(clientId, apiKey, log2) {
  const api = getClient(clientId, apiKey);
  log2.write("  Fetching Ozon product list:");
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
    log2.write(` ${allItems.length}`);
    lastId = data?.result?.last_id;
    if (!lastId || items.length < 1e3) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  log2.line(` \u2014 ${allItems.length} products`);
  return allItems;
}
async function ozonFetchProductInfo(clientId, apiKey, offerIds, log2) {
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
  log2.line(`  Info: ${infoMap.size} products`);
  return infoMap;
}
async function ozonFetchProductAttributes(clientId, apiKey, offerIds, log2) {
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
  log2.line(`  Attributes: ${attrMap.size} products`);
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
var SUPPLIER_ID = Number(process.env.WB_SUPPLIER_ID) || 312222;
var ITEMS_PER_WB_CARDS = 100;
var FETCH_TIMEOUT4 = 3e4;
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
var SKIP_PHASE = flags.fromPhase ? /* @__PURE__ */ new Set() : null;
var PHASES = [
  "wb-cards",
  "wb-official-prices",
  "wb-stocks",
  "wb-analytics",
  "wb-process",
  "ozon-list",
  "ozon-info",
  "ozon-attrs",
  "ozon-process",
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
      const yesno = (v2) => v2 ? "\u0435\u0441\u0442\u044C" : "\u043D\u0435\u0442";
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
var log = {
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
    signal: AbortSignal.timeout(FETCH_TIMEOUT4)
  });
  if (resp.status === 429 && attempt <= 3) {
    const retryAfter = parseInt(resp.headers.get("Retry-After") || "1", 10);
    const delay = Math.min(retryAfter * 1e3, 3e4);
    log.line(`  429 (\u043F\u043E\u043F\u044B\u0442\u043A\u0430 ${attempt}): \u043F\u043E\u0432\u0442\u043E\u0440 \u0447\u0435\u0440\u0435\u0437 ${delay}\u043C\u0441`);
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
  log.write(`  \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 ${trash ? "\u0443\u0434\u0430\u043B\u0451\u043D\u043D\u044B\u0445" : "\u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445"} \u043A\u0430\u0440\u0442\u043E\u0447\u0435\u043A:`);
  while (allCards.length < total) {
    const body = {
      settings: { cursor, filter: { withPhoto: -1 } }
    };
    const data = await wbFetch(WB_CONTENT_API, endpoint, { method: "POST", apiKey, body });
    const cards = data.cards || [];
    allCards.push(...cards);
    total = data.cursor?.total ?? allCards.length;
    log.write(` ${allCards.length}/${total}`);
    if (data.cursor && cards.length === ITEMS_PER_WB_CARDS) {
      cursor = data.cursor;
      await new Promise((r) => setTimeout(r, 200));
    } else {
      break;
    }
  }
  log.line(` \u2014 ${allCards.length} \u043A\u0430\u0440\u0442\u043E\u0447\u0435\u043A`);
  return allCards;
}
async function getExistingProducts(prisma) {
  const all = await prisma.product.findMany({ orderBy: { id: "asc" } });
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
  const id = await generateId(prisma);
  const sku = data.sku || null;
  const slug = sku ? makeSlug(sku) : id;
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
  log.line("=== \u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u044F \u0437\u0430\u043F\u0443\u0449\u0435\u043D\u0430 ===\n");
  if (flags.dry) log.line("  [DRY RUN \u2014 \u0431\u0435\u0437 \u0437\u0430\u043F\u0438\u0441\u0438 \u0432 \u0411\u0414]\n");
  if (flags.fromPhase) log.line(`  \u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0435\u043D\u0438\u0435 \u0441 \u0444\u0430\u0437\u044B: ${flags.fromPhase}
`);
  const wbApiKey = process.env.WB_API_KEY;
  const wbAnalyticsKey = process.env.WB_ANALYTICS_API_KEY;
  const wbPricesKey = process.env.WB_PRICES_API_KEY;
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
  const sleep = (ms2) => new Promise((r) => setTimeout(r, ms2));
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
    log.line("\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u0438\u0437 \u0411\u0414...");
    const existing = await prismaRetry(() => getExistingProducts(prisma));
    log.line(`  ${existing.all.length} \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u0432 \u0411\u0414
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
    let ozonArticles = [];
    let ozonItems = [];
    let trashArticles = [];
    let wbCards = [];
    let wbTrashCards = [];
    let wbPriceMap = /* @__PURE__ */ new Map();
    let wbStockMap = /* @__PURE__ */ new Map();
    let wbAnalyticsMap = /* @__PURE__ */ new Map();
    let infoMap, attrMap;
    if (!flags.ozonOnly) {
      if (shouldRun("wb-cards")) {
        log.progress("wb-cards", 0, 1);
        log.line("[1/2] \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043A\u0430\u0440\u0442\u043E\u0447\u0435\u043A WB (\u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0435)...");
        wbCards = await wbFetchAllCards(wbApiKey, false);
        wbArticles = wbCards.map((c2) => c2.nmID);
        log.line(`  ${wbCards.length} \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u043A\u0430\u0440\u0442\u043E\u0447\u0435\u043A
`);
        log.progress("wb-cards", 1, 1);
        log.progress("wb-trash", 0, 1);
        log.line("[2/2] \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043A\u0430\u0440\u0442\u043E\u0447\u0435\u043A WB (\u043A\u043E\u0440\u0437\u0438\u043D\u0430)...");
        wbTrashCards = await wbFetchAllCards(wbApiKey, true);
        trashArticles = wbTrashCards.map((c2) => c2.nmID);
        log.line(`  ${wbTrashCards.length} \u043A\u0430\u0440\u0442\u043E\u0447\u0435\u043A \u0432 \u043A\u043E\u0440\u0437\u0438\u043D\u0435
`);
        log.progress("wb-trash", 1, 1);
      }
      if (shouldRun("wb-official-prices") && wbPricesKey) {
        log.progress("wb-official-prices", 0, 1);
        log.line("\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0446\u0435\u043D WB (\u0447\u0435\u0440\u0435\u0437 SDK)...");
        wbPriceMap = await wbFetchOfficialPrices(wbPricesKey, log);
        log.progress("wb-official-prices", 1, 1);
      } else if (shouldRun("wb-official-prices") && !wbPricesKey) {
        log.line("[SKIP] WB_PRICES_API_KEY \u043D\u0435 \u0437\u0430\u0434\u0430\u043D \u2014 \u0446\u0435\u043D\u044B \u043D\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u044E\u0442\u0441\u044F");
      }
      if (shouldRun("wb-stocks") && wbAnalyticsKey) {
        log.progress("wb-stocks", 0, 1);
        log.line("\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0441\u0442\u043E\u043A\u043E\u0432 WB (\u0447\u0435\u0440\u0435\u0437 SDK)...");
        wbStockMap = await wbFetchStocks(wbArticles, wbAnalyticsKey, log);
        let mergedCount = 0;
        for (const [nmId, stock] of wbStockMap) {
          const existing2 = wbPriceMap.get(nmId);
          if (existing2) {
            wbPriceMap.set(nmId, { ...existing2, stock });
            mergedCount++;
          } else {
            wbPriceMap.set(nmId, { price: null, discountedPrice: null, stock });
          }
        }
        if (mergedCount > 0) {
          log.line(`  \u0421\u0442\u043E\u043A\u0438 \u043D\u0430\u043B\u043E\u0436\u0435\u043D\u044B \u043D\u0430 ${mergedCount} \u0442\u043E\u0432\u0430\u0440\u043E\u0432`);
        }
        log.progress("wb-stocks", 1, 1);
      } else if (shouldRun("wb-stocks") && !wbAnalyticsKey) {
        log.line("[SKIP] WB_ANALYTICS_API_KEY \u043D\u0435 \u0437\u0430\u0434\u0430\u043D \u2014 \u0441\u0442\u043E\u043A\u0438 \u043D\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u044E\u0442\u0441\u044F");
      }
      if (shouldRun("wb-analytics") && wbAnalyticsKey) {
        log.progress("wb-analytics", 0, 1);
        log.line("\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0430\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0438 WB (\u0440\u0435\u0439\u0442\u0438\u043D\u0433)...");
        wbAnalyticsMap = await wbFetchAnalytics(wbArticles, wbAnalyticsKey, log);
        log.progress("wb-analytics", 1, 1);
      } else if (shouldRun("wb-analytics") && !wbAnalyticsKey) {
        log.line("[SKIP] WB_ANALYTICS_API_KEY \u043D\u0435 \u0437\u0430\u0434\u0430\u043D \u2014 \u0440\u0435\u0439\u0442\u0438\u043D\u0433 \u0438 \u0441\u0442\u043E\u043A\u0438 \u0442\u043E\u043B\u044C\u043A\u043E \u0438\u0437 Content API");
      }
      if (shouldRun("wb-process")) {
        const wbVendorToNm = /* @__PURE__ */ new Map();
        for (const card of wbCards) {
          const vc = card.vendorCode?.trim();
          if (vc) wbVendorToNm.set(vc, card.nmID);
        }
        log.line("\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u043A\u0430\u0440\u0442\u043E\u0447\u0435\u043A WB...");
        log.progress("wb-process", 0, wbCards.length);
        for (let i = 0; i < wbCards.length; i++) {
          const card = wbCards[i];
          const article = card.nmID;
          const vendorCode = (card.vendorCode || "").trim();
          let db = vendorCode ? existing.bySku.get(vendorCode) : null;
          if (!db) db = existing.byWbArticle.get(article);
          const wbPrices = wbPriceMap.get(article) || null;
          const analytics = wbAnalyticsMap.get(article) || null;
          const wbRating = analytics?.productRating != null ? { rating: analytics.productRating, feedbacks: card.feedbacks ?? 0 } : card.rating != null ? { rating: card.rating, feedbacks: card.feedbacks ?? 0 } : null;
          if (db) {
            const ensureFields = {};
            if (article && !db.wbArticle) ensureFields.wbArticle = toBigInt(article);
            const updates = mergeProductSources(card, wbPrices, wbRating, null, null, null, db);
            const allUpdates = { ...ensureFields, ...updates };
            if (Object.keys(allUpdates).length > 0) {
              const ok = await updateProduct(prisma, db.id, allUpdates);
              if (ok) {
                stats.wbUpdated++;
                log.detail("updated", db.id, db.name, formatChanges(db, allUpdates));
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
            log.line(`  \u0421\u043E\u0437\u0434\u0430\u043D: ${id} (sku=${vendorCode}), \u0430\u0440\u0442\u0438\u043A\u0443\u043B WB: ${article}`);
            log.detail("created", id, updates.name || card.title || "", []);
            stats.wbCreated++;
          }
          if ((i + 1) % 10 === 0 || i === wbCards.length - 1) {
            log.progress("wb-process", i + 1, wbCards.length);
          }
        }
        log.line(`  WB: ${stats.wbCreated} \u0441\u043E\u0437\u0434\u0430\u043D\u043E, ${stats.wbUpdated} \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E
`);
      }
    }
    if (!flags.wbOnly) {
      if (shouldRun("ozon-list")) {
        log.progress("ozon-list", 0, 1);
        log.line("[Ozon] \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0441\u043F\u0438\u0441\u043A\u0430 \u0442\u043E\u0432\u0430\u0440\u043E\u0432...");
        ozonItems = await ozonFetchAllProducts(ozonClientId, ozonApiKey, log);
        ozonArticles = ozonItems.map((i) => i.productId).filter((id) => id > 0);
        log.line(`  ${ozonItems.length} \u0442\u043E\u0432\u0430\u0440\u043E\u0432 Ozon
`);
        log.progress("ozon-list", 1, 1);
      }
      const offerIdList = ozonItems.map((i) => i.offerId).filter(Boolean);
      if (shouldRun("ozon-info") || shouldRun("ozon-attrs")) {
        log.line("[Ozon] \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0434\u0435\u0442\u0430\u043B\u0435\u0439 \u0442\u043E\u0432\u0430\u0440\u043E\u0432 (\u043F\u0430\u0440\u0430\u043B\u043B\u0435\u043B\u044C\u043D\u043E)...");
        const fetches = [];
        if (shouldRun("ozon-info")) {
          log.progress("ozon-info", 0, 1);
          fetches.push(
            ozonFetchProductInfo(ozonClientId, ozonApiKey, offerIdList, log).then((r) => {
              infoMap = r;
              log.progress("ozon-info", 1, 1);
              return r;
            })
          );
        }
        if (shouldRun("ozon-attrs")) {
          log.progress("ozon-attrs", 0, 1);
          fetches.push(
            ozonFetchProductAttributes(ozonClientId, ozonApiKey, offerIdList, log).then((r) => {
              attrMap = r;
              log.progress("ozon-attrs", 1, 1);
              return r;
            })
          );
        }
        await Promise.all(fetches);
        log.line("");
      }
      if (shouldRun("ozon-process")) {
        log.line("\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0442\u043E\u0432\u0430\u0440\u043E\u0432 Ozon...");
        const ozonLocks = /* @__PURE__ */ new Map();
        for (const p of existing.all) {
          if (p.ozonArticle) ozonLocks.set(Number(p.ozonArticle), p.id);
        }
        const skippedOzonFixes = [];
        const totalOzonItems = ozonItems.filter((i) => i.offerId || i.productId).length;
        log.progress("ozon-process", 0, totalOzonItems);
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
                log.detail("updated", db.id, db.name, formatChanges(db, allUpdates));
              }
            } else {
              stats.ozonSkipped++;
            }
          } else {
            const ozonPrice = info.price != null ? Number(info.price) : null;
            const ozonOrigPrice = info.old_price != null ? Number(info.old_price) : null;
            const ozonCat = ozonExtractCategory(info, attrs);
            const ozonComp = ozonExtractComposition(attrs);
            const id = await createProduct(prisma, {
              sku: offerId || null,
              name: info.name || "",
              price: ozonPrice || 0,
              originalPrice: ozonOrigPrice || 0,
              ozonPrice,
              ozonOriginalPrice: ozonOrigPrice,
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
            log.line(`  \u0421\u043E\u0437\u0434\u0430\u043D (Ozon): ${id} (offer=${offerId}), \u0430\u0440\u0442\u0438\u043A\u0443\u043B Ozon: ${publicSku || productId}`);
            log.detail("created", id, info.name || "", []);
            stats.ozonCreated++;
          }
          ozonProcessed++;
          if (ozonProcessed % 10 === 0 || ozonProcessed === totalOzonItems) {
            log.progress("ozon-process", ozonProcessed, totalOzonItems);
          }
        }
        if (skippedOzonFixes.length > 0) {
          log.line(`  \u0412\u0442\u043E\u0440\u043E\u0439 \u043F\u0440\u043E\u0445\u043E\u0434: \u043F\u043E\u0432\u0442\u043E\u0440 \u0434\u043B\u044F ${skippedOzonFixes.length} \u043F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u043D\u044B\u0445 ozonArticle...`);
          for (const { db, newVal, oldVal } of skippedOzonFixes) {
            if (ozonLocks.has(newVal)) {
              log.line(`    \u0412\u0441\u0451 \u0435\u0449\u0451 \u043F\u0440\u043E\u043F\u0443\u0449\u0435\u043D ${db.id}: ${newVal} \u0437\u0430\u043D\u044F\u0442 ${ozonLocks.get(newVal)}`);
            } else {
              ozonLocks.set(newVal, db.id);
              const ok = await updateProduct(prisma, db.id, { ozonArticle: toBigInt(newVal) });
              if (ok) {
                log.line(`    \u0418\u0441\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 ozonArticle \u0434\u043B\u044F ${db.id}: ${oldVal} \u2192 ${newVal} (2-\u0439 \u043F\u0440\u043E\u0445\u043E\u0434)`);
                stats.ozonUpdated++;
              }
            }
          }
        }
        log.line(`  Ozon: ${stats.ozonUpdated} \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E
`);
      }
    }
    if (shouldRun("ozon-models") && !flags.wbOnly) {
      log.progress("ozon-models", 0, 1);
      const ozonModelResult = await syncOzonModels(prisma, attrMap || /* @__PURE__ */ new Map(), log);
      if (ozonModelResult.created > 0 || ozonModelResult.assigned > 0) {
        log.line(`  \u041C\u043E\u0434\u0435\u043B\u0438 Ozon: ${ozonModelResult.created} \u0441\u043E\u0437\u0434\u0430\u043D\u043E, ${ozonModelResult.assigned} \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D\u043E`);
      }
      log.progress("ozon-models", 1, 1);
    }
    if (shouldRun("wb-models") && !flags.ozonOnly && wbCards.length > 0) {
      log.progress("wb-models", 0, 1);
      log.line("\u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u044F \u043C\u043E\u0434\u0435\u043B\u0435\u0439 \u0438\u0437 WB imtId...");
      const modelResult = await syncModels(prisma, wbCards, resolveCategory, log, flags);
      log.line(`  \u041C\u043E\u0434\u0435\u043B\u0438 WB: ${modelResult.created} \u0441\u043E\u0437\u0434\u0430\u043D\u043E, ${modelResult.assigned} \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D\u043E
`);
      log.progress("wb-models", 1, 1);
    }
    if (shouldRun("archive")) {
      log.progress("archive", 0, 1);
      log.line("\u0410\u0440\u0445\u0438\u0432\u0430\u0446\u0438\u044F \u0443\u0434\u0430\u043B\u0451\u043D\u043D\u044B\u0445 \u0442\u043E\u0432\u0430\u0440\u043E\u0432...");
      const archiveResult = await archiveGoneProducts(
        prisma,
        existing.all,
        wbArticles,
        ozonItems,
        trashArticles,
        !flags.ozonOnly,
        !flags.wbOnly,
        log,
        flags
      );
      stats.archived = archiveResult.archived;
      stats.outOfStock = archiveResult.markedOutOfStock;
      log.progress("archive", 1, 1);
    }
    log.progress("done", 1, 1);
    const duration = ((Date.now() - startTime) / 1e3).toFixed(1);
    log.line("\n=== \u0418\u0422\u041E\u0413 ===");
    log.line(`  WB \u0441\u043E\u0437\u0434\u0430\u043D\u043E:              ${stats.wbCreated}`);
    log.line(`  WB \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E:            ${stats.wbUpdated}`);
    log.line(`  WB \u043F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u043E:            ${stats.wbSkipped}`);
    log.line(`  WB \u0430\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430:            ${wbAnalyticsMap.size} \u0442\u043E\u0432\u0430\u0440\u043E\u0432`);
    log.line(`  Ozon \u0441\u043E\u0437\u0434\u0430\u043D\u043E:            ${stats.ozonCreated}`);
    log.line(`  Ozon \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E:          ${stats.ozonUpdated}`);
    log.line(`  Ozon \u043F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u043E:          ${stats.ozonSkipped}`);
    log.line(`  \u0410\u0440\u0445\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D\u043E:            ${stats.archived}`);
    log.line(`  \u041D\u0435\u0442 \u0432 \u043D\u0430\u043B\u0438\u0447\u0438\u0438:           ${stats.outOfStock}`);
    log.line(`  \u041E\u0448\u0438\u0431\u043E\u043A:                  ${stats.errors}`);
    log.line(`  \u0414\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C:            ${duration}\u0441`);
    log.line(`  \u0420\u0435\u0436\u0438\u043C:                   ${flags.dry ? "DRY (\u0431\u0435\u0437 \u0437\u0430\u043F\u0438\u0441\u0438)" : "live"}`);
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
