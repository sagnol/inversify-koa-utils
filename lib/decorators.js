"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var inversify_1 = require("inversify");
var constants_1 = require("./constants");
function Controller(path) {
    var middleware = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middleware[_i - 1] = arguments[_i];
    }
    return function (target) {
        var metadata = { path: path, middleware: middleware, target: target };
        inversify_1.decorate(inversify_1.injectable(), target);
        Reflect.defineMetadata(constants_1.METADATA_KEY.controller, metadata, target);
        var previousMetadata = Reflect.getMetadata(constants_1.METADATA_KEY.controller, Reflect) || [];
        var newMetadata = [metadata].concat(previousMetadata);
        Reflect.defineMetadata(constants_1.METADATA_KEY.controller, newMetadata, Reflect);
    };
}
exports.Controller = Controller;
function All(path) {
    var middleware = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middleware[_i - 1] = arguments[_i];
    }
    return HttpMethod.apply(void 0, ["all", path].concat(middleware));
}
exports.All = All;
function Get(path) {
    var middleware = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middleware[_i - 1] = arguments[_i];
    }
    return HttpMethod.apply(void 0, ["get", path].concat(middleware));
}
exports.Get = Get;
function Post(path) {
    var middleware = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middleware[_i - 1] = arguments[_i];
    }
    return HttpMethod.apply(void 0, ["post", path].concat(middleware));
}
exports.Post = Post;
function Put(path) {
    var middleware = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middleware[_i - 1] = arguments[_i];
    }
    return HttpMethod.apply(void 0, ["put", path].concat(middleware));
}
exports.Put = Put;
function Patch(path) {
    var middleware = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middleware[_i - 1] = arguments[_i];
    }
    return HttpMethod.apply(void 0, ["patch", path].concat(middleware));
}
exports.Patch = Patch;
function Head(path) {
    var middleware = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middleware[_i - 1] = arguments[_i];
    }
    return HttpMethod.apply(void 0, ["head", path].concat(middleware));
}
exports.Head = Head;
function Delete(path) {
    var middleware = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middleware[_i - 1] = arguments[_i];
    }
    return HttpMethod.apply(void 0, ["delete", path].concat(middleware));
}
exports.Delete = Delete;
function HttpMethod(method, path) {
    var middleware = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        middleware[_i - 2] = arguments[_i];
    }
    return function (target, key, value) {
        var metadata = { path: path, middleware: middleware, method: method, target: target, key: key };
        var metadataList = [];
        if (!Reflect.hasOwnMetadata(constants_1.METADATA_KEY.controllerMethod, target.constructor)) {
            Reflect.defineMetadata(constants_1.METADATA_KEY.controllerMethod, metadataList, target.constructor);
        }
        else {
            metadataList = Reflect.getOwnMetadata(constants_1.METADATA_KEY.controllerMethod, target.constructor);
        }
        metadataList.push(metadata);
    };
}
exports.HttpMethod = HttpMethod;
exports.Request = paramDecoratorFactory(constants_1.PARAMETER_TYPE.REQUEST);
exports.Response = paramDecoratorFactory(constants_1.PARAMETER_TYPE.RESPONSE);
exports.RequestParam = paramDecoratorFactory(constants_1.PARAMETER_TYPE.PARAMS);
exports.QueryParam = paramDecoratorFactory(constants_1.PARAMETER_TYPE.QUERY);
exports.RequestBody = paramDecoratorFactory(constants_1.PARAMETER_TYPE.BODY);
exports.RequestHeaders = paramDecoratorFactory(constants_1.PARAMETER_TYPE.HEADERS);
exports.Cookies = paramDecoratorFactory(constants_1.PARAMETER_TYPE.COOKIES);
exports.Next = paramDecoratorFactory(constants_1.PARAMETER_TYPE.NEXT);
exports.Context = paramDecoratorFactory(constants_1.PARAMETER_TYPE.CTX);
function paramDecoratorFactory(parameterType) {
    return function (name) {
        name = name || "default";
        return params(parameterType, name);
    };
}
function params(type, parameterName) {
    return function (target, methodName, index) {
        var metadataList = {};
        var parameterMetadataList = [];
        var parameterMetadata = {
            index: index,
            parameterName: parameterName,
            type: type
        };
        if (!Reflect.hasOwnMetadata(constants_1.METADATA_KEY.controllerParameter, target.constructor)) {
            parameterMetadataList.unshift(parameterMetadata);
        }
        else {
            metadataList = Reflect.getOwnMetadata(constants_1.METADATA_KEY.controllerParameter, target.constructor);
            if (metadataList.hasOwnProperty(methodName)) {
                parameterMetadataList = metadataList[methodName];
            }
            parameterMetadataList.unshift(parameterMetadata);
        }
        metadataList[methodName] = parameterMetadataList;
        Reflect.defineMetadata(constants_1.METADATA_KEY.controllerParameter, metadataList, target.constructor);
    };
}
exports.params = params;
