"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Koa = require("koa");
var Router = require("koa-router");
var constants_1 = require("./constants");
/**
 * Wrapper for the koa server.
 */
var InversifyKoaServer = /** @class */ (function () {
    /**
     * Wrapper for the koa server.
     *
     * @param container Container loaded with all controllers and their dependencies.
     */
    function InversifyKoaServer(container, customRouter, routingConfig, customApp) {
        this._container = container;
        this._router = customRouter || new Router();
        this._routingConfig = routingConfig || {
            rootPath: constants_1.DEFAULT_ROUTING_ROOT_PATH
        };
        this._app = customApp || new Koa();
    }
    /**
     * Sets the configuration function to be applied to the application.
     * Note that the config function is not actually executed until a call to InversifyKoaServer.build().
     *
     * This method is chainable.
     *
     * @param fn Function in which app-level middleware can be registered.
     */
    InversifyKoaServer.prototype.setConfig = function (fn) {
        this._configFn = fn;
        return this;
    };
    /**
     * Sets the error handler configuration function to be applied to the application.
     * Note that the error config function is not actually executed until a call to InversifyKoaServer.build().
     *
     * This method is chainable.
     *
     * @param fn Function in which app-level error handlers can be registered.
     */
    InversifyKoaServer.prototype.setErrorConfig = function (fn) {
        this._errorConfigFn = fn;
        return this;
    };
    /**
     * Applies all routes and configuration to the server, returning the Koa application.
     */
    InversifyKoaServer.prototype.build = function () {
        // register server-level middleware before anything else
        if (this._configFn) {
            this._configFn.apply(undefined, [this._app]);
        }
        this.registerControllers();
        // register error handlers after controllers
        if (this._errorConfigFn) {
            this._errorConfigFn.apply(undefined, [this._app]);
        }
        return this._app;
    };
    InversifyKoaServer.prototype.registerControllers = function () {
        var _this = this;
        // set prefix route in config rootpath
        if (this._routingConfig.rootPath !== constants_1.DEFAULT_ROUTING_ROOT_PATH) {
            this._router.prefix(this._routingConfig.rootPath);
        }
        var controllers = this._container.getAll(constants_1.TYPE.Controller);
        controllers.forEach(function (controller) {
            var controllerMetadata = Reflect.getOwnMetadata(constants_1.METADATA_KEY.controller, controller.constructor);
            var methodMetadata = Reflect.getOwnMetadata(constants_1.METADATA_KEY.controllerMethod, controller.constructor);
            var parameterMetadata = Reflect.getOwnMetadata(constants_1.METADATA_KEY.controllerParameter, controller.constructor);
            if (controllerMetadata && methodMetadata) {
                var controllerMiddleware_1 = _this.resolveMidleware.apply(_this, controllerMetadata.middleware);
                methodMetadata.forEach(function (metadata) {
                    var _a;
                    var paramList = [];
                    if (parameterMetadata) {
                        paramList = parameterMetadata[metadata.key] || [];
                    }
                    var handler = _this.handlerFactory(controllerMetadata.target.name, metadata.key, paramList);
                    var routeMiddleware = _this.resolveMidleware.apply(_this, metadata.middleware);
                    (_a = _this._router)[metadata.method].apply(_a, ["" + controllerMetadata.path + metadata.path].concat(controllerMiddleware_1, routeMiddleware, [handler]));
                });
            }
        });
        this._app.use(this._router.routes());
    };
    InversifyKoaServer.prototype.resolveMidleware = function () {
        var _this = this;
        var middleware = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            middleware[_i] = arguments[_i];
        }
        return middleware.map(function (middlewareItem) {
            try {
                return _this._container.get(middlewareItem);
            }
            catch (_) {
                return middlewareItem;
            }
        });
    };
    InversifyKoaServer.prototype.handlerFactory = function (controllerName, key, parameterMetadata) {
        var _this = this;
        // this function works like another top middleware to extract and inject arguments
        return function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, args, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        args = this.extractParameters(ctx, next, parameterMetadata);
                        return [4 /*yield*/, (_a = this._container.getNamed(constants_1.TYPE.Controller, controllerName))[key].apply(_a, args)];
                    case 1:
                        result = _b.sent();
                        if (result && result instanceof Promise) {
                            // koa handle promises
                            return [2 /*return*/, result];
                        }
                        else if (result && !ctx.headerSent) {
                            ctx.body = result;
                        }
                        return [2 /*return*/];
                }
            });
        }); };
    };
    InversifyKoaServer.prototype.extractParameters = function (ctx, next, params) {
        var args = [];
        if (!params || !params.length) {
            return [ctx, next];
        }
        for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
            var item = params_1[_i];
            switch (item.type) {
                default:
                    args[item.index] = ctx;
                    break; // response
                case constants_1.PARAMETER_TYPE.RESPONSE:
                    args[item.index] = this.getParam(ctx.response, null, item.parameterName);
                    break;
                case constants_1.PARAMETER_TYPE.REQUEST:
                    args[item.index] = this.getParam(ctx.request, null, item.parameterName);
                    break;
                case constants_1.PARAMETER_TYPE.NEXT:
                    args[item.index] = next;
                    break;
                case constants_1.PARAMETER_TYPE.CTX:
                    args[item.index] = this.getParam(ctx, null, item.parameterName);
                    break;
                case constants_1.PARAMETER_TYPE.PARAMS:
                    args[item.index] = this.getParam(ctx, "params", item.parameterName);
                    break;
                case constants_1.PARAMETER_TYPE.QUERY:
                    args[item.index] = this.getParam(ctx, "query", item.parameterName);
                    break;
                case constants_1.PARAMETER_TYPE.BODY:
                    args[item.index] = this.getParam(ctx.request, "body", item.parameterName);
                    break;
                case constants_1.PARAMETER_TYPE.HEADERS:
                    args[item.index] = this.getParam(ctx.request, "headers", item.parameterName);
                    break;
                case constants_1.PARAMETER_TYPE.COOKIES:
                    args[item.index] = this.getParam(ctx, "cookies", item.parameterName);
                    break;
            }
        }
        args.push(ctx, next);
        return args;
    };
    InversifyKoaServer.prototype.getParam = function (source, paramType, name) {
        var param = source[paramType] || source;
        return param[name] || this.checkQueryParam(paramType, param, name);
    };
    InversifyKoaServer.prototype.checkQueryParam = function (paramType, param, name) {
        if (paramType === "query") {
            return undefined;
        }
        if (paramType === "cookies") {
            return param.get(name);
        }
        else {
            return param;
        }
    };
    return InversifyKoaServer;
}());
exports.InversifyKoaServer = InversifyKoaServer;
