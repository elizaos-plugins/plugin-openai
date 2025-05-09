// src/index.ts
import { createOpenAI } from "@ai-sdk/openai";
import { getProviderBaseURL } from "@elizaos/core";
import {
  EventType,
  logger,
  ModelType,
  VECTOR_DIMS,
  safeReplacer,
  ServiceType
} from "@elizaos/core";
import {
  generateObject,
  generateText,
  JSONParseError
} from "ai";
import { encodingForModel } from "js-tiktoken";
import { fetch, FormData } from "undici";

// node_modules/@opentelemetry/api/build/esm/platform/node/globalThis.js
var _globalThis = typeof globalThis === "object" ? globalThis : global;

// node_modules/@opentelemetry/api/build/esm/version.js
var VERSION = "1.9.0";

// node_modules/@opentelemetry/api/build/esm/internal/semver.js
var re = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
function _makeCompatibilityCheck(ownVersion) {
  var acceptedVersions = /* @__PURE__ */ new Set([ownVersion]);
  var rejectedVersions = /* @__PURE__ */ new Set();
  var myVersionMatch = ownVersion.match(re);
  if (!myVersionMatch) {
    return function() {
      return false;
    };
  }
  var ownVersionParsed = {
    major: +myVersionMatch[1],
    minor: +myVersionMatch[2],
    patch: +myVersionMatch[3],
    prerelease: myVersionMatch[4]
  };
  if (ownVersionParsed.prerelease != null) {
    return function isExactmatch(globalVersion) {
      return globalVersion === ownVersion;
    };
  }
  function _reject(v) {
    rejectedVersions.add(v);
    return false;
  }
  function _accept(v) {
    acceptedVersions.add(v);
    return true;
  }
  return function isCompatible2(globalVersion) {
    if (acceptedVersions.has(globalVersion)) {
      return true;
    }
    if (rejectedVersions.has(globalVersion)) {
      return false;
    }
    var globalVersionMatch = globalVersion.match(re);
    if (!globalVersionMatch) {
      return _reject(globalVersion);
    }
    var globalVersionParsed = {
      major: +globalVersionMatch[1],
      minor: +globalVersionMatch[2],
      patch: +globalVersionMatch[3],
      prerelease: globalVersionMatch[4]
    };
    if (globalVersionParsed.prerelease != null) {
      return _reject(globalVersion);
    }
    if (ownVersionParsed.major !== globalVersionParsed.major) {
      return _reject(globalVersion);
    }
    if (ownVersionParsed.major === 0) {
      if (ownVersionParsed.minor === globalVersionParsed.minor && ownVersionParsed.patch <= globalVersionParsed.patch) {
        return _accept(globalVersion);
      }
      return _reject(globalVersion);
    }
    if (ownVersionParsed.minor <= globalVersionParsed.minor) {
      return _accept(globalVersion);
    }
    return _reject(globalVersion);
  };
}
var isCompatible = _makeCompatibilityCheck(VERSION);

// node_modules/@opentelemetry/api/build/esm/internal/global-utils.js
var major = VERSION.split(".")[0];
var GLOBAL_OPENTELEMETRY_API_KEY = Symbol.for("opentelemetry.js.api." + major);
var _global = _globalThis;
function registerGlobal(type, instance, diag, allowOverride) {
  var _a;
  if (allowOverride === void 0) {
    allowOverride = false;
  }
  var api = _global[GLOBAL_OPENTELEMETRY_API_KEY] = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) !== null && _a !== void 0 ? _a : {
    version: VERSION
  };
  if (!allowOverride && api[type]) {
    var err = new Error("@opentelemetry/api: Attempted duplicate registration of API: " + type);
    diag.error(err.stack || err.message);
    return false;
  }
  if (api.version !== VERSION) {
    var err = new Error("@opentelemetry/api: Registration of version v" + api.version + " for " + type + " does not match previously registered API v" + VERSION);
    diag.error(err.stack || err.message);
    return false;
  }
  api[type] = instance;
  diag.debug("@opentelemetry/api: Registered a global for " + type + " v" + VERSION + ".");
  return true;
}
function getGlobal(type) {
  var _a, _b;
  var globalVersion = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _a === void 0 ? void 0 : _a.version;
  if (!globalVersion || !isCompatible(globalVersion)) {
    return;
  }
  return (_b = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _b === void 0 ? void 0 : _b[type];
}
function unregisterGlobal(type, diag) {
  diag.debug("@opentelemetry/api: Unregistering a global for " + type + " v" + VERSION + ".");
  var api = _global[GLOBAL_OPENTELEMETRY_API_KEY];
  if (api) {
    delete api[type];
  }
}

// node_modules/@opentelemetry/api/build/esm/diag/ComponentLogger.js
var __read = function(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = { error };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }
  return ar;
};
var __spreadArray = function(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
};
var DiagComponentLogger = (
  /** @class */
  function() {
    function DiagComponentLogger2(props) {
      this._namespace = props.namespace || "DiagComponentLogger";
    }
    DiagComponentLogger2.prototype.debug = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return logProxy("debug", this._namespace, args);
    };
    DiagComponentLogger2.prototype.error = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return logProxy("error", this._namespace, args);
    };
    DiagComponentLogger2.prototype.info = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return logProxy("info", this._namespace, args);
    };
    DiagComponentLogger2.prototype.warn = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return logProxy("warn", this._namespace, args);
    };
    DiagComponentLogger2.prototype.verbose = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return logProxy("verbose", this._namespace, args);
    };
    return DiagComponentLogger2;
  }()
);
function logProxy(funcName, namespace, args) {
  var logger2 = getGlobal("diag");
  if (!logger2) {
    return;
  }
  args.unshift(namespace);
  return logger2[funcName].apply(logger2, __spreadArray([], __read(args), false));
}

// node_modules/@opentelemetry/api/build/esm/diag/types.js
var DiagLogLevel;
(function(DiagLogLevel2) {
  DiagLogLevel2[DiagLogLevel2["NONE"] = 0] = "NONE";
  DiagLogLevel2[DiagLogLevel2["ERROR"] = 30] = "ERROR";
  DiagLogLevel2[DiagLogLevel2["WARN"] = 50] = "WARN";
  DiagLogLevel2[DiagLogLevel2["INFO"] = 60] = "INFO";
  DiagLogLevel2[DiagLogLevel2["DEBUG"] = 70] = "DEBUG";
  DiagLogLevel2[DiagLogLevel2["VERBOSE"] = 80] = "VERBOSE";
  DiagLogLevel2[DiagLogLevel2["ALL"] = 9999] = "ALL";
})(DiagLogLevel || (DiagLogLevel = {}));

// node_modules/@opentelemetry/api/build/esm/diag/internal/logLevelLogger.js
function createLogLevelDiagLogger(maxLevel, logger2) {
  if (maxLevel < DiagLogLevel.NONE) {
    maxLevel = DiagLogLevel.NONE;
  } else if (maxLevel > DiagLogLevel.ALL) {
    maxLevel = DiagLogLevel.ALL;
  }
  logger2 = logger2 || {};
  function _filterFunc(funcName, theLevel) {
    var theFunc = logger2[funcName];
    if (typeof theFunc === "function" && maxLevel >= theLevel) {
      return theFunc.bind(logger2);
    }
    return function() {
    };
  }
  return {
    error: _filterFunc("error", DiagLogLevel.ERROR),
    warn: _filterFunc("warn", DiagLogLevel.WARN),
    info: _filterFunc("info", DiagLogLevel.INFO),
    debug: _filterFunc("debug", DiagLogLevel.DEBUG),
    verbose: _filterFunc("verbose", DiagLogLevel.VERBOSE)
  };
}

// node_modules/@opentelemetry/api/build/esm/api/diag.js
var __read2 = function(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = { error };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }
  return ar;
};
var __spreadArray2 = function(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
};
var API_NAME = "diag";
var DiagAPI = (
  /** @class */
  function() {
    function DiagAPI2() {
      function _logProxy(funcName) {
        return function() {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          var logger2 = getGlobal("diag");
          if (!logger2)
            return;
          return logger2[funcName].apply(logger2, __spreadArray2([], __read2(args), false));
        };
      }
      var self = this;
      var setLogger = function(logger2, optionsOrLogLevel) {
        var _a, _b, _c;
        if (optionsOrLogLevel === void 0) {
          optionsOrLogLevel = { logLevel: DiagLogLevel.INFO };
        }
        if (logger2 === self) {
          var err = new Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
          self.error((_a = err.stack) !== null && _a !== void 0 ? _a : err.message);
          return false;
        }
        if (typeof optionsOrLogLevel === "number") {
          optionsOrLogLevel = {
            logLevel: optionsOrLogLevel
          };
        }
        var oldLogger = getGlobal("diag");
        var newLogger = createLogLevelDiagLogger((_b = optionsOrLogLevel.logLevel) !== null && _b !== void 0 ? _b : DiagLogLevel.INFO, logger2);
        if (oldLogger && !optionsOrLogLevel.suppressOverrideMessage) {
          var stack = (_c = new Error().stack) !== null && _c !== void 0 ? _c : "<failed to generate stacktrace>";
          oldLogger.warn("Current logger will be overwritten from " + stack);
          newLogger.warn("Current logger will overwrite one already registered from " + stack);
        }
        return registerGlobal("diag", newLogger, self, true);
      };
      self.setLogger = setLogger;
      self.disable = function() {
        unregisterGlobal(API_NAME, self);
      };
      self.createComponentLogger = function(options) {
        return new DiagComponentLogger(options);
      };
      self.verbose = _logProxy("verbose");
      self.debug = _logProxy("debug");
      self.info = _logProxy("info");
      self.warn = _logProxy("warn");
      self.error = _logProxy("error");
    }
    DiagAPI2.instance = function() {
      if (!this._instance) {
        this._instance = new DiagAPI2();
      }
      return this._instance;
    };
    return DiagAPI2;
  }()
);

// node_modules/@opentelemetry/api/build/esm/context/context.js
var BaseContext = (
  /** @class */
  /* @__PURE__ */ function() {
    function BaseContext2(parentContext) {
      var self = this;
      self._currentContext = parentContext ? new Map(parentContext) : /* @__PURE__ */ new Map();
      self.getValue = function(key) {
        return self._currentContext.get(key);
      };
      self.setValue = function(key, value) {
        var context2 = new BaseContext2(self._currentContext);
        context2._currentContext.set(key, value);
        return context2;
      };
      self.deleteValue = function(key) {
        var context2 = new BaseContext2(self._currentContext);
        context2._currentContext.delete(key);
        return context2;
      };
    }
    return BaseContext2;
  }()
);
var ROOT_CONTEXT = new BaseContext();

// node_modules/@opentelemetry/api/build/esm/context/NoopContextManager.js
var __read3 = function(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = { error };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }
  return ar;
};
var __spreadArray3 = function(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
};
var NoopContextManager = (
  /** @class */
  function() {
    function NoopContextManager2() {
    }
    NoopContextManager2.prototype.active = function() {
      return ROOT_CONTEXT;
    };
    NoopContextManager2.prototype.with = function(_context, fn, thisArg) {
      var args = [];
      for (var _i = 3; _i < arguments.length; _i++) {
        args[_i - 3] = arguments[_i];
      }
      return fn.call.apply(fn, __spreadArray3([thisArg], __read3(args), false));
    };
    NoopContextManager2.prototype.bind = function(_context, target) {
      return target;
    };
    NoopContextManager2.prototype.enable = function() {
      return this;
    };
    NoopContextManager2.prototype.disable = function() {
      return this;
    };
    return NoopContextManager2;
  }()
);

// node_modules/@opentelemetry/api/build/esm/api/context.js
var __read4 = function(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = { error };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }
  return ar;
};
var __spreadArray4 = function(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
};
var API_NAME2 = "context";
var NOOP_CONTEXT_MANAGER = new NoopContextManager();
var ContextAPI = (
  /** @class */
  function() {
    function ContextAPI2() {
    }
    ContextAPI2.getInstance = function() {
      if (!this._instance) {
        this._instance = new ContextAPI2();
      }
      return this._instance;
    };
    ContextAPI2.prototype.setGlobalContextManager = function(contextManager) {
      return registerGlobal(API_NAME2, contextManager, DiagAPI.instance());
    };
    ContextAPI2.prototype.active = function() {
      return this._getContextManager().active();
    };
    ContextAPI2.prototype.with = function(context2, fn, thisArg) {
      var _a;
      var args = [];
      for (var _i = 3; _i < arguments.length; _i++) {
        args[_i - 3] = arguments[_i];
      }
      return (_a = this._getContextManager()).with.apply(_a, __spreadArray4([context2, fn, thisArg], __read4(args), false));
    };
    ContextAPI2.prototype.bind = function(context2, target) {
      return this._getContextManager().bind(context2, target);
    };
    ContextAPI2.prototype._getContextManager = function() {
      return getGlobal(API_NAME2) || NOOP_CONTEXT_MANAGER;
    };
    ContextAPI2.prototype.disable = function() {
      this._getContextManager().disable();
      unregisterGlobal(API_NAME2, DiagAPI.instance());
    };
    return ContextAPI2;
  }()
);

// node_modules/@opentelemetry/api/build/esm/trace/status.js
var SpanStatusCode;
(function(SpanStatusCode2) {
  SpanStatusCode2[SpanStatusCode2["UNSET"] = 0] = "UNSET";
  SpanStatusCode2[SpanStatusCode2["OK"] = 1] = "OK";
  SpanStatusCode2[SpanStatusCode2["ERROR"] = 2] = "ERROR";
})(SpanStatusCode || (SpanStatusCode = {}));

// node_modules/@opentelemetry/api/build/esm/context-api.js
var context = ContextAPI.getInstance();

// src/index.ts
function getTracer(runtime) {
  const availableServices = Array.from(runtime.getAllServices().keys());
  logger.debug(`[getTracer] Available services: ${JSON.stringify(availableServices)}`);
  logger.debug(`[getTracer] Attempting to get service with key: ${ServiceType.INSTRUMENTATION}`);
  const instrumentationService = runtime.getService(
    ServiceType.INSTRUMENTATION
  );
  if (!instrumentationService) {
    logger.warn(`[getTracer] Service ${ServiceType.INSTRUMENTATION} not found in runtime.`);
    return null;
  }
  if (!instrumentationService.isEnabled()) {
    logger.debug("[getTracer] Instrumentation service found but is disabled.");
    return null;
  }
  logger.debug("[getTracer] Successfully retrieved enabled instrumentation service.");
  return instrumentationService.getTracer("eliza.llm.openai");
}
async function startLlmSpan(runtime, spanName, attributes, fn) {
  const tracer = getTracer(runtime);
  if (!tracer) {
    const dummySpan = {
      setAttribute: () => {
      },
      setAttributes: () => {
      },
      addEvent: () => {
      },
      recordException: () => {
      },
      setStatus: () => {
      },
      end: () => {
      },
      spanContext: () => ({ traceId: "", spanId: "", traceFlags: 0 })
    };
    return fn(dummySpan);
  }
  const activeContext = context.active();
  return tracer.startActiveSpan(spanName, { attributes }, activeContext, async (span) => {
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message });
      span.end();
      throw error;
    }
  });
}
function getSetting(runtime, key, defaultValue) {
  return runtime.getSetting(key) ?? process.env[key] ?? defaultValue;
}
function getBaseURL(runtime) {
  const defaultBaseURL = getSetting(runtime, "OPENAI_BASE_URL", "https://api.openai.com/v1");
  logger.debug(`[OpenAI] Default base URL: ${defaultBaseURL}`);
  return getProviderBaseURL(runtime, "openai", defaultBaseURL);
}
function getEmbeddingBaseURL(runtime) {
  const embeddingURL = getSetting(runtime, "OPENAI_EMBEDDING_URL");
  if (embeddingURL) {
    logger.debug(`[OpenAI] Using specific embedding base URL: ${embeddingURL}`);
    return embeddingURL;
  }
  logger.debug("[OpenAI] Falling back to general base URL for embeddings.");
  return getBaseURL(runtime);
}
function getApiKey(runtime) {
  return getSetting(runtime, "OPENAI_API_KEY");
}
function getSmallModel(runtime) {
  return getSetting(runtime, "OPENAI_SMALL_MODEL") ?? getSetting(runtime, "SMALL_MODEL", "gpt-4o-mini");
}
function getLargeModel(runtime) {
  return getSetting(runtime, "OPENAI_LARGE_MODEL") ?? getSetting(runtime, "LARGE_MODEL", "gpt-4o");
}
function createOpenAIClient(runtime) {
  return createOpenAI({
    apiKey: getApiKey(runtime),
    baseURL: getBaseURL(runtime)
  });
}
async function tokenizeText(model, prompt) {
  const modelName = model === ModelType.TEXT_SMALL ? process.env.OPENAI_SMALL_MODEL ?? process.env.SMALL_MODEL ?? "gpt-4o-mini" : process.env.LARGE_MODEL ?? "gpt-4o";
  const encoding = encodingForModel(modelName);
  const tokens = encoding.encode(prompt);
  return tokens;
}
async function detokenizeText(model, tokens) {
  const modelName = model === ModelType.TEXT_SMALL ? process.env.OPENAI_SMALL_MODEL ?? process.env.SMALL_MODEL ?? "gpt-4o-mini" : process.env.OPENAI_LARGE_MODEL ?? process.env.LARGE_MODEL ?? "gpt-4o";
  const encoding = encodingForModel(modelName);
  return encoding.decode(tokens);
}
async function generateObjectByModelType(runtime, params, modelType, getModelFn) {
  const openai = createOpenAIClient(runtime);
  const modelName = getModelFn(runtime);
  logger.log(`[OpenAI] Using ${modelType} model: ${modelName}`);
  const temperature = params.temperature ?? 0;
  const schemaPresent = !!params.schema;
  const attributes = {
    "llm.vendor": "OpenAI",
    "llm.request.type": "object_generation",
    "llm.request.model": modelName,
    "llm.request.temperature": temperature,
    "llm.request.schema_present": schemaPresent
  };
  return startLlmSpan(runtime, "LLM.generateObject", attributes, async (span) => {
    span.addEvent("llm.prompt", { "prompt.content": params.prompt });
    if (schemaPresent) {
      span.addEvent("llm.request.schema", {
        schema: JSON.stringify(params.schema, safeReplacer())
      });
      logger.info(
        `Using ${modelType} without schema validation (schema provided but output=no-schema)`
      );
    }
    try {
      const { object, usage } = await generateObject({
        model: openai.languageModel(modelName),
        output: "no-schema",
        prompt: params.prompt,
        temperature,
        experimental_repairText: getJsonRepairFunction()
      });
      span.addEvent("llm.response.processed", {
        "response.object": JSON.stringify(object, safeReplacer())
      });
      if (usage) {
        span.setAttributes({
          "llm.usage.prompt_tokens": usage.promptTokens,
          "llm.usage.completion_tokens": usage.completionTokens,
          "llm.usage.total_tokens": usage.totalTokens
        });
        emitModelUsageEvent(runtime, modelType, params.prompt, usage);
      }
      return object;
    } catch (error) {
      if (error instanceof JSONParseError) {
        logger.error(`[generateObject] Failed to parse JSON: ${error.message}`);
        span.recordException(error);
        span.addEvent("llm.error.json_parse", {
          "error.message": error.message,
          "error.text": error.text
        });
        span.addEvent("llm.repair.attempt");
        const repairFunction = getJsonRepairFunction();
        const repairedJsonString = await repairFunction({
          text: error.text,
          error
        });
        if (repairedJsonString) {
          try {
            const repairedObject = JSON.parse(repairedJsonString);
            span.addEvent("llm.repair.success", {
              repaired_object: JSON.stringify(repairedObject, safeReplacer())
            });
            logger.info("[generateObject] Successfully repaired JSON.");
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "JSON parsing failed but was repaired"
            });
            return repairedObject;
          } catch (repairParseError) {
            const message = repairParseError instanceof Error ? repairParseError.message : String(repairParseError);
            logger.error(`[generateObject] Failed to parse repaired JSON: ${message}`);
            const exception = repairParseError instanceof Error ? repairParseError : new Error(message);
            span.recordException(exception);
            span.addEvent("llm.repair.parse_error", {
              "error.message": message
            });
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: `JSON repair failed: ${message}`
            });
            throw repairParseError;
          }
        } else {
          const errMsg = error instanceof Error ? error.message : String(error);
          logger.error("[generateObject] JSON repair failed.");
          span.addEvent("llm.repair.failed");
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: `JSON repair failed: ${errMsg}`
          });
          throw error;
        }
      } else {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`[generateObject] Unknown error: ${message}`);
        const exception = error instanceof Error ? error : new Error(message);
        span.recordException(exception);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message
        });
        throw error;
      }
    }
  });
}
function getJsonRepairFunction() {
  return async ({ text, error }) => {
    try {
      if (error instanceof JSONParseError) {
        const cleanedText = text.replace(/```json\n|\n```|```/g, "");
        JSON.parse(cleanedText);
        return cleanedText;
      }
      return null;
    } catch (jsonError) {
      const message = jsonError instanceof Error ? jsonError.message : String(jsonError);
      logger.warn(`Failed to repair JSON text: ${message}`);
      return null;
    }
  };
}
function emitModelUsageEvent(runtime, type, prompt, usage) {
  runtime.emitEvent(EventType.MODEL_USED, {
    provider: "openai",
    type,
    prompt,
    tokens: {
      prompt: usage.promptTokens,
      completion: usage.completionTokens,
      total: usage.totalTokens
    }
  });
}
async function fetchTextToSpeech(runtime, text) {
  const apiKey = getApiKey(runtime);
  const model = getSetting(runtime, "OPENAI_TTS_MODEL", "gpt-4o-mini-tts");
  const voice = getSetting(runtime, "OPENAI_TTS_VOICE", "nova");
  const instructions = getSetting(runtime, "OPENAI_TTS_INSTRUCTIONS", "");
  const baseURL = getBaseURL(runtime);
  try {
    const res = await fetch(`${baseURL}/audio/speech`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        voice,
        input: text,
        ...instructions && { instructions }
      })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI TTS error ${res.status}: ${err}`);
    }
    return res.body;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to fetch speech from OpenAI TTS: ${message}`);
  }
}
var openaiPlugin = {
  name: "openai",
  description: "OpenAI plugin",
  config: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    OPENAI_SMALL_MODEL: process.env.OPENAI_SMALL_MODEL,
    OPENAI_LARGE_MODEL: process.env.OPENAI_LARGE_MODEL,
    SMALL_MODEL: process.env.SMALL_MODEL,
    LARGE_MODEL: process.env.LARGE_MODEL,
    OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL,
    OPENAI_EMBEDDING_URL: process.env.OPENAI_EMBEDDING_URL,
    OPENAI_EMBEDDING_DIMENSIONS: process.env.OPENAI_EMBEDDING_DIMENSIONS
  },
  async init(_config, runtime) {
    try {
      if (!getApiKey(runtime)) {
        logger.warn(
          "OPENAI_API_KEY is not set in environment - OpenAI functionality will be limited"
        );
        return;
      }
      try {
        const baseURL = getBaseURL(runtime);
        const response = await fetch(`${baseURL}/models`, {
          headers: { Authorization: `Bearer ${getApiKey(runtime)}` }
        });
        if (!response.ok) {
          logger.warn(`OpenAI API key validation failed: ${response.statusText}`);
          logger.warn("OpenAI functionality will be limited until a valid API key is provided");
        } else {
          logger.log("OpenAI API key validated successfully");
        }
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : String(fetchError);
        logger.warn(`Error validating OpenAI API key: ${message}`);
        logger.warn("OpenAI functionality will be limited until a valid API key is provided");
      }
    } catch (error) {
      const message = error?.errors?.map((e) => e.message).join(", ") || (error instanceof Error ? error.message : String(error));
      logger.warn(
        `OpenAI plugin configuration issue: ${message} - You need to configure the OPENAI_API_KEY in your environment variables`
      );
    }
  },
  models: {
    [ModelType.TEXT_EMBEDDING]: async (runtime, params) => {
      const embeddingModelName = getSetting(
        runtime,
        "OPENAI_EMBEDDING_MODEL",
        "text-embedding-3-small"
      );
      const embeddingDimension = Number.parseInt(
        getSetting(runtime, "OPENAI_EMBEDDING_DIMENSIONS", "1536") || "1536",
        10
      );
      logger.debug(
        `[OpenAI] Using embedding model: ${embeddingModelName} with dimension: ${embeddingDimension}`
      );
      if (!Object.values(VECTOR_DIMS).includes(embeddingDimension)) {
        const errorMsg = `Invalid embedding dimension: ${embeddingDimension}. Must be one of: ${Object.values(VECTOR_DIMS).join(", ")}`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }
      if (params === null) {
        logger.debug("Creating test embedding for initialization");
        const testVector = Array(embeddingDimension).fill(0);
        testVector[0] = 0.1;
        return testVector;
      }
      let text;
      if (typeof params === "string") {
        text = params;
      } else if (typeof params === "object" && params.text) {
        text = params.text;
      } else {
        logger.warn("Invalid input format for embedding");
        const fallbackVector = Array(embeddingDimension).fill(0);
        fallbackVector[0] = 0.2;
        return fallbackVector;
      }
      if (!text.trim()) {
        logger.warn("Empty text for embedding");
        const emptyVector = Array(embeddingDimension).fill(0);
        emptyVector[0] = 0.3;
        return emptyVector;
      }
      const attributes = {
        "llm.vendor": "OpenAI",
        "llm.request.type": "embedding",
        "llm.request.model": embeddingModelName,
        "llm.request.embedding.dimensions": embeddingDimension,
        "input.text.length": text.length
      };
      return startLlmSpan(runtime, "LLM.embedding", attributes, async (span) => {
        span.addEvent("llm.prompt", { "prompt.content": text });
        const embeddingBaseURL = getEmbeddingBaseURL(runtime);
        const apiKey = getApiKey(runtime);
        if (!apiKey) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "OpenAI API key not configured"
          });
          throw new Error("OpenAI API key not configured");
        }
        try {
          const response = await fetch(`${embeddingBaseURL}/embeddings`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: embeddingModelName,
              input: text
            })
          });
          const responseClone = response.clone();
          const rawResponseBody = await responseClone.text();
          span.addEvent("llm.response.raw", {
            "response.body": rawResponseBody
          });
          if (!response.ok) {
            logger.error(`OpenAI API error: ${response.status} - ${response.statusText}`);
            span.setAttributes({ "error.api.status": response.status });
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: `OpenAI API error: ${response.status} - ${response.statusText}. Response: ${rawResponseBody}`
            });
            const errorVector = Array(embeddingDimension).fill(0);
            errorVector[0] = 0.4;
            return errorVector;
          }
          const data = await response.json();
          if (!data?.data?.[0]?.embedding) {
            logger.error("API returned invalid structure");
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "API returned invalid structure"
            });
            const errorVector = Array(embeddingDimension).fill(0);
            errorVector[0] = 0.5;
            return errorVector;
          }
          const embedding = data.data[0].embedding;
          span.setAttribute("llm.response.embedding.vector_length", embedding.length);
          if (data.usage) {
            span.setAttributes({
              "llm.usage.prompt_tokens": data.usage.prompt_tokens,
              "llm.usage.total_tokens": data.usage.total_tokens
            });
            const usage = {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: 0,
              totalTokens: data.usage.total_tokens
            };
            emitModelUsageEvent(runtime, ModelType.TEXT_EMBEDDING, text, usage);
          }
          logger.log(`Got valid embedding with length ${embedding.length}`);
          return embedding;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          logger.error(`Error generating embedding: ${message}`);
          const exception = error instanceof Error ? error : new Error(message);
          span.recordException(exception);
          span.setStatus({ code: SpanStatusCode.ERROR, message });
          const errorVector = Array(embeddingDimension).fill(0);
          errorVector[0] = 0.6;
          return errorVector;
        }
      });
    },
    [ModelType.TEXT_TOKENIZER_ENCODE]: async (_runtime, { prompt, modelType = ModelType.TEXT_LARGE }) => {
      return await tokenizeText(modelType ?? ModelType.TEXT_LARGE, prompt);
    },
    [ModelType.TEXT_TOKENIZER_DECODE]: async (_runtime, { tokens, modelType = ModelType.TEXT_LARGE }) => {
      return await detokenizeText(modelType ?? ModelType.TEXT_LARGE, tokens);
    },
    [ModelType.TEXT_SMALL]: async (runtime, { prompt, stopSequences = [] }) => {
      const temperature = 0.7;
      const frequency_penalty = 0.7;
      const presence_penalty = 0.7;
      const max_response_length = 8192;
      const openai = createOpenAIClient(runtime);
      const modelName = getSmallModel(runtime);
      logger.log(`[OpenAI] Using TEXT_SMALL model: ${modelName}`);
      logger.log(prompt);
      const attributes = {
        "llm.vendor": "OpenAI",
        "llm.request.type": "completion",
        "llm.request.model": modelName,
        "llm.request.temperature": temperature,
        "llm.request.max_tokens": max_response_length,
        "llm.request.frequency_penalty": frequency_penalty,
        "llm.request.presence_penalty": presence_penalty,
        "llm.request.stop_sequences": JSON.stringify(stopSequences)
      };
      return startLlmSpan(runtime, "LLM.generateText", attributes, async (span) => {
        span.addEvent("llm.prompt", { "prompt.content": prompt });
        const { text: openaiResponse, usage } = await generateText({
          model: openai.languageModel(modelName),
          prompt,
          system: runtime.character.system ?? void 0,
          temperature,
          maxTokens: max_response_length,
          frequencyPenalty: frequency_penalty,
          presencePenalty: presence_penalty,
          stopSequences
        });
        span.setAttribute("llm.response.processed.length", openaiResponse.length);
        span.addEvent("llm.response.processed", {
          "response.content": openaiResponse.substring(0, 200) + (openaiResponse.length > 200 ? "..." : "")
        });
        if (usage) {
          span.setAttributes({
            "llm.usage.prompt_tokens": usage.promptTokens,
            "llm.usage.completion_tokens": usage.completionTokens,
            "llm.usage.total_tokens": usage.totalTokens
          });
          emitModelUsageEvent(runtime, ModelType.TEXT_SMALL, prompt, usage);
        }
        return openaiResponse;
      });
    },
    [ModelType.TEXT_LARGE]: async (runtime, {
      prompt,
      stopSequences = [],
      maxTokens = 8192,
      temperature = 0.7,
      frequencyPenalty = 0.7,
      presencePenalty = 0.7
    }) => {
      const openai = createOpenAIClient(runtime);
      const modelName = getLargeModel(runtime);
      logger.log(`[OpenAI] Using TEXT_LARGE model: ${modelName}`);
      logger.log(prompt);
      const attributes = {
        "llm.vendor": "OpenAI",
        "llm.request.type": "completion",
        "llm.request.model": modelName,
        "llm.request.temperature": temperature,
        "llm.request.max_tokens": maxTokens,
        "llm.request.frequency_penalty": frequencyPenalty,
        "llm.request.presence_penalty": presencePenalty,
        "llm.request.stop_sequences": JSON.stringify(stopSequences)
      };
      return startLlmSpan(runtime, "LLM.generateText", attributes, async (span) => {
        span.addEvent("llm.prompt", { "prompt.content": prompt });
        const { text: openaiResponse, usage } = await generateText({
          model: openai.languageModel(modelName),
          prompt,
          system: runtime.character.system ?? void 0,
          temperature,
          maxTokens,
          frequencyPenalty,
          presencePenalty,
          stopSequences
        });
        span.setAttribute("llm.response.processed.length", openaiResponse.length);
        span.addEvent("llm.response.processed", {
          "response.content": openaiResponse.substring(0, 200) + (openaiResponse.length > 200 ? "..." : "")
        });
        if (usage) {
          span.setAttributes({
            "llm.usage.prompt_tokens": usage.promptTokens,
            "llm.usage.completion_tokens": usage.completionTokens,
            "llm.usage.total_tokens": usage.totalTokens
          });
          emitModelUsageEvent(runtime, ModelType.TEXT_LARGE, prompt, usage);
        }
        return openaiResponse;
      });
    },
    [ModelType.IMAGE]: async (runtime, params) => {
      const n = params.n || 1;
      const size = params.size || "1024x1024";
      const prompt = params.prompt;
      const modelName = "dall-e-3";
      logger.log(`[OpenAI] Using IMAGE model: ${modelName}`);
      const attributes = {
        "llm.vendor": "OpenAI",
        "llm.request.type": "image_generation",
        "llm.request.image.size": size,
        "llm.request.image.count": n
      };
      return startLlmSpan(runtime, "LLM.imageGeneration", attributes, async (span) => {
        span.addEvent("llm.prompt", { "prompt.content": prompt });
        const baseURL = getBaseURL(runtime);
        const apiKey = getApiKey(runtime);
        if (!apiKey) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "OpenAI API key not configured"
          });
          throw new Error("OpenAI API key not configured");
        }
        try {
          const response = await fetch(`${baseURL}/images/generations`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              prompt,
              n,
              size
            })
          });
          const responseClone = response.clone();
          const rawResponseBody = await responseClone.text();
          span.addEvent("llm.response.raw", {
            "response.body": rawResponseBody
          });
          if (!response.ok) {
            span.setAttributes({ "error.api.status": response.status });
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: `Failed to generate image: ${response.statusText}. Response: ${rawResponseBody}`
            });
            throw new Error(`Failed to generate image: ${response.statusText}`);
          }
          const data = await response.json();
          const typedData = data;
          span.addEvent("llm.response.processed", {
            "response.urls": JSON.stringify(typedData.data)
          });
          return typedData.data;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const exception = error instanceof Error ? error : new Error(message);
          span.recordException(exception);
          span.setStatus({ code: SpanStatusCode.ERROR, message });
          throw error;
        }
      });
    },
    [ModelType.IMAGE_DESCRIPTION]: async (runtime, params) => {
      let imageUrl;
      let promptText;
      const modelName = "gpt-4o-mini";
      logger.log(`[OpenAI] Using IMAGE_DESCRIPTION model: ${modelName}`);
      const maxTokens = 300;
      if (typeof params === "string") {
        imageUrl = params;
        promptText = "Please analyze this image and provide a title and detailed description.";
      } else {
        imageUrl = params.imageUrl;
        promptText = params.prompt || "Please analyze this image and provide a title and detailed description.";
      }
      const attributes = {
        "llm.vendor": "OpenAI",
        "llm.request.type": "chat",
        "llm.request.model": modelName,
        "llm.request.max_tokens": maxTokens,
        "llm.request.image.url": imageUrl
      };
      const messages = [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ];
      return startLlmSpan(runtime, "LLM.imageDescription", attributes, async (span) => {
        span.addEvent("llm.prompt", {
          "prompt.content": JSON.stringify(messages, safeReplacer())
        });
        const baseURL = getBaseURL(runtime);
        const apiKey = getApiKey(runtime);
        if (!apiKey) {
          logger.error("OpenAI API key not set");
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "OpenAI API key not configured"
          });
          return {
            title: "Failed to analyze image",
            description: "API key not configured"
          };
        }
        try {
          const response = await fetch(`${baseURL}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: modelName,
              messages,
              max_tokens: maxTokens
            })
          });
          const responseClone = response.clone();
          const rawResponseBody = await responseClone.text();
          span.addEvent("llm.response.raw", {
            "response.body": rawResponseBody
          });
          if (!response.ok) {
            span.setAttributes({ "error.api.status": response.status });
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: `OpenAI API error: ${response.status}. Response: ${rawResponseBody}`
            });
            throw new Error(`OpenAI API error: ${response.status}`);
          }
          const result = await response.json();
          const typedResult = result;
          const content = typedResult.choices?.[0]?.message?.content;
          if (typedResult.usage) {
            span.setAttributes({
              "llm.usage.prompt_tokens": typedResult.usage.prompt_tokens,
              "llm.usage.completion_tokens": typedResult.usage.completion_tokens,
              "llm.usage.total_tokens": typedResult.usage.total_tokens
            });
            emitModelUsageEvent(
              runtime,
              ModelType.IMAGE_DESCRIPTION,
              typeof params === "string" ? params : params.prompt || "",
              {
                promptTokens: typedResult.usage.prompt_tokens,
                completionTokens: typedResult.usage.completion_tokens,
                totalTokens: typedResult.usage.total_tokens
              }
            );
          }
          if (typedResult.choices?.[0]?.finish_reason) {
            span.setAttribute("llm.response.finish_reason", typedResult.choices[0].finish_reason);
          }
          if (!content) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "No content in API response"
            });
            return {
              title: "Failed to analyze image",
              description: "No response from API"
            };
          }
          const titleMatch = content.match(/title[:\s]+(.+?)(?:\n|$)/i);
          const title = titleMatch?.[1]?.trim() || "Image Analysis";
          const description = content.replace(/title[:\s]+(.+?)(?:\n|$)/i, "").trim();
          const processedResult = { title, description };
          span.addEvent("llm.response.processed", {
            "response.object": JSON.stringify(processedResult, safeReplacer())
          });
          return processedResult;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          logger.error(`Error analyzing image: ${message}`);
          const exception = error instanceof Error ? error : new Error(message);
          span.recordException(exception);
          span.setStatus({ code: SpanStatusCode.ERROR, message });
          return {
            title: "Failed to analyze image",
            description: `Error: ${message}`
          };
        }
      });
    },
    [ModelType.TRANSCRIPTION]: async (runtime, audioBuffer) => {
      logger.log("audioBuffer", audioBuffer);
      const modelName = "whisper-1";
      logger.log(`[OpenAI] Using TRANSCRIPTION model: ${modelName}`);
      const attributes = {
        "llm.vendor": "OpenAI",
        "llm.request.type": "transcription",
        "llm.request.model": modelName,
        "llm.request.audio.input_size_bytes": audioBuffer?.length || 0
      };
      return startLlmSpan(runtime, "LLM.transcription", attributes, async (span) => {
        span.addEvent("llm.prompt", {
          "prompt.info": "Audio buffer for transcription"
        });
        const baseURL = getBaseURL(runtime);
        const apiKey = getApiKey(runtime);
        if (!apiKey) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "OpenAI API key not configured"
          });
          throw new Error("OpenAI API key not configured - Cannot make request");
        }
        if (!audioBuffer || audioBuffer.length === 0) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Audio buffer is empty or invalid"
          });
          throw new Error("Audio buffer is empty or invalid for transcription");
        }
        const formData = new FormData();
        formData.append("file", new Blob([audioBuffer]), "recording.mp3");
        formData.append("model", "whisper-1");
        try {
          const response = await fetch(`${baseURL}/audio/transcriptions`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`
            },
            body: formData
          });
          const responseClone = response.clone();
          const rawResponseBody = await responseClone.text();
          span.addEvent("llm.response.raw", {
            "response.body": rawResponseBody
          });
          logger.log("response", response);
          if (!response.ok) {
            span.setAttributes({ "error.api.status": response.status });
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: `Failed to transcribe audio: ${response.statusText}. Response: ${rawResponseBody}`
            });
            throw new Error(`Failed to transcribe audio: ${response.statusText}`);
          }
          const data = await response.json();
          const processedText = data.text;
          span.setAttribute("llm.response.processed.length", processedText.length);
          span.addEvent("llm.response.processed", {
            "response.text": processedText
          });
          return processedText;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const exception = error instanceof Error ? error : new Error(message);
          span.recordException(exception);
          span.setStatus({ code: SpanStatusCode.ERROR, message });
          throw error;
        }
      });
    },
    [ModelType.TEXT_TO_SPEECH]: async (runtime, text) => {
      const ttsModelName = getSetting(runtime, "OPENAI_TTS_MODEL", "gpt-4o-mini-tts");
      const attributes = {
        "llm.vendor": "OpenAI",
        "llm.request.type": "tts",
        "llm.request.model": ttsModelName,
        "input.text.length": text.length
      };
      return startLlmSpan(runtime, "LLM.tts", attributes, async (span) => {
        logger.log(`[OpenAI] Using TEXT_TO_SPEECH model: ${ttsModelName}`);
        span.addEvent("llm.prompt", { "prompt.content": text });
        try {
          const speechStream = await fetchTextToSpeech(runtime, text);
          span.addEvent("llm.response.success", {
            info: "Speech stream generated"
          });
          return speechStream;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const exception = error instanceof Error ? error : new Error(message);
          span.recordException(exception);
          span.setStatus({ code: SpanStatusCode.ERROR, message });
          throw error;
        }
      });
    },
    [ModelType.OBJECT_SMALL]: async (runtime, params) => {
      return generateObjectByModelType(runtime, params, ModelType.OBJECT_SMALL, getSmallModel);
    },
    [ModelType.OBJECT_LARGE]: async (runtime, params) => {
      return generateObjectByModelType(runtime, params, ModelType.OBJECT_LARGE, getLargeModel);
    }
  },
  tests: [
    {
      name: "openai_plugin_tests",
      tests: [
        {
          name: "openai_test_url_and_api_key_validation",
          fn: async (runtime) => {
            const baseURL = getBaseURL(runtime);
            const response = await fetch(`${baseURL}/models`, {
              headers: {
                Authorization: `Bearer ${getApiKey(runtime)}`
              }
            });
            const data = await response.json();
            logger.log("Models Available:", data?.data?.length ?? "N/A");
            if (!response.ok) {
              throw new Error(`Failed to validate OpenAI API key: ${response.statusText}`);
            }
          }
        },
        {
          name: "openai_test_text_embedding",
          fn: async (runtime) => {
            try {
              const embedding = await runtime.useModel(ModelType.TEXT_EMBEDDING, {
                text: "Hello, world!"
              });
              logger.log("embedding", embedding);
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              logger.error(`Error in test_text_embedding: ${message}`);
              throw error;
            }
          }
        },
        {
          name: "openai_test_text_large",
          fn: async (runtime) => {
            try {
              const text = await runtime.useModel(ModelType.TEXT_LARGE, {
                prompt: "What is the nature of reality in 10 words?"
              });
              if (text.length === 0) {
                throw new Error("Failed to generate text");
              }
              logger.log("generated with test_text_large:", text);
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              logger.error(`Error in test_text_large: ${message}`);
              throw error;
            }
          }
        },
        {
          name: "openai_test_text_small",
          fn: async (runtime) => {
            try {
              const text = await runtime.useModel(ModelType.TEXT_SMALL, {
                prompt: "What is the nature of reality in 10 words?"
              });
              if (text.length === 0) {
                throw new Error("Failed to generate text");
              }
              logger.log("generated with test_text_small:", text);
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              logger.error(`Error in test_text_small: ${message}`);
              throw error;
            }
          }
        },
        {
          name: "openai_test_image_generation",
          fn: async (runtime) => {
            logger.log("openai_test_image_generation");
            try {
              const image = await runtime.useModel(ModelType.IMAGE, {
                prompt: "A beautiful sunset over a calm ocean",
                n: 1,
                size: "1024x1024"
              });
              logger.log("generated with test_image_generation:", image);
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              logger.error(`Error in test_image_generation: ${message}`);
              throw error;
            }
          }
        },
        {
          name: "image-description",
          fn: async (runtime) => {
            try {
              logger.log("openai_test_image_description");
              try {
                const result = await runtime.useModel(
                  ModelType.IMAGE_DESCRIPTION,
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Vitalik_Buterin_TechCrunch_London_2015_%28cropped%29.jpg/537px-Vitalik_Buterin_TechCrunch_London_2015_%28cropped%29.jpg"
                );
                if (result && typeof result === "object" && "title" in result && "description" in result) {
                  logger.log("Image description:", result);
                } else {
                  logger.error("Invalid image description result format:", result);
                }
              } catch (e) {
                const message = e instanceof Error ? e.message : String(e);
                logger.error(`Error in image description test: ${message}`);
              }
            } catch (e) {
              const message = e instanceof Error ? e.message : String(e);
              logger.error(`Error in openai_test_image_description: ${message}`);
            }
          }
        },
        {
          name: "openai_test_transcription",
          fn: async (runtime) => {
            logger.log("openai_test_transcription");
            try {
              const response = await fetch(
                "https://upload.wikimedia.org/wikipedia/en/4/40/Chris_Benoit_Voice_Message.ogg"
              );
              const arrayBuffer = await response.arrayBuffer();
              const transcription = await runtime.useModel(
                ModelType.TRANSCRIPTION,
                Buffer.from(new Uint8Array(arrayBuffer))
              );
              logger.log("generated with test_transcription:", transcription);
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              logger.error(`Error in test_transcription: ${message}`);
              throw error;
            }
          }
        },
        {
          name: "openai_test_text_tokenizer_encode",
          fn: async (runtime) => {
            const prompt = "Hello tokenizer encode!";
            const tokens = await runtime.useModel(ModelType.TEXT_TOKENIZER_ENCODE, { prompt });
            if (!Array.isArray(tokens) || tokens.length === 0) {
              throw new Error("Failed to tokenize text: expected non-empty array of tokens");
            }
            logger.log("Tokenized output:", tokens);
          }
        },
        {
          name: "openai_test_text_tokenizer_decode",
          fn: async (runtime) => {
            const prompt = "Hello tokenizer decode!";
            const tokens = await runtime.useModel(ModelType.TEXT_TOKENIZER_ENCODE, { prompt });
            const decodedText = await runtime.useModel(ModelType.TEXT_TOKENIZER_DECODE, { tokens });
            if (decodedText !== prompt) {
              throw new Error(
                `Decoded text does not match original. Expected "${prompt}", got "${decodedText}"`
              );
            }
            logger.log("Decoded text:", decodedText);
          }
        },
        {
          name: "openai_test_text_to_speech",
          fn: async (runtime) => {
            try {
              const text = "Hello, this is a test for text-to-speech.";
              const response = await fetchTextToSpeech(runtime, text);
              if (!response) {
                throw new Error("Failed to generate speech");
              }
              logger.log("Generated speech successfully");
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              logger.error(`Error in openai_test_text_to_speech: ${message}`);
              throw error;
            }
          }
        }
      ]
    }
  ]
};
var index_default = openaiPlugin;
export {
  index_default as default,
  openaiPlugin
};
//# sourceMappingURL=index.js.map