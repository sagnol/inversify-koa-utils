import { injectable, decorate } from "inversify";
import { METADATA_KEY, PARAMETER_TYPE } from "./constants";
export function Controller(path) {
    var middleware = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middleware[_i - 1] = arguments[_i];
    }
    return function (target) {
        var metadata = { path: path, middleware: middleware, target: target };
        decorate(injectable(), target);
        Reflect.defineMetadata(METADATA_KEY.controller, metadata, target);
        var previousMetadata = Reflect.getMetadata(METADATA_KEY.controller, Reflect) || [];
        var newMetadata = [metadata].concat(previousMetadata);
        Reflect.defineMetadata(METADATA_KEY.controller, newMetadata, Reflect);
    };
}
export function All(path) {
    var middleware = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middleware[_i - 1] = arguments[_i];
    }
    return HttpMethod.apply(void 0, ["all", path].concat(middleware));
}
export function Get(path) {
    var middleware = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middleware[_i - 1] = arguments[_i];
    }
    return HttpMethod.apply(void 0, ["get", path].concat(middleware));
}
export function Post(path) {
    var middleware = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middleware[_i - 1] = arguments[_i];
    }
    return HttpMethod.apply(void 0, ["post", path].concat(middleware));
}
export function Put(path) {
    var middleware = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middleware[_i - 1] = arguments[_i];
    }
    return HttpMethod.apply(void 0, ["put", path].concat(middleware));
}
export function Patch(path) {
    var middleware = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middleware[_i - 1] = arguments[_i];
    }
    return HttpMethod.apply(void 0, ["patch", path].concat(middleware));
}
export function Head(path) {
    var middleware = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middleware[_i - 1] = arguments[_i];
    }
    return HttpMethod.apply(void 0, ["head", path].concat(middleware));
}
export function Delete(path) {
    var middleware = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middleware[_i - 1] = arguments[_i];
    }
    return HttpMethod.apply(void 0, ["delete", path].concat(middleware));
}
export function HttpMethod(method, path) {
    var middleware = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        middleware[_i - 2] = arguments[_i];
    }
    return function (target, key, value) {
        var metadata = { path: path, middleware: middleware, method: method, target: target, key: key };
        var metadataList = [];
        if (!Reflect.hasOwnMetadata(METADATA_KEY.controllerMethod, target.constructor)) {
            Reflect.defineMetadata(METADATA_KEY.controllerMethod, metadataList, target.constructor);
        }
        else {
            metadataList = Reflect.getOwnMetadata(METADATA_KEY.controllerMethod, target.constructor);
        }
        metadataList.push(metadata);
    };
}
export var Request = paramDecoratorFactory(PARAMETER_TYPE.REQUEST);
export var Response = paramDecoratorFactory(PARAMETER_TYPE.RESPONSE);
export var RequestParam = paramDecoratorFactory(PARAMETER_TYPE.PARAMS);
export var QueryParam = paramDecoratorFactory(PARAMETER_TYPE.QUERY);
export var RequestBody = paramDecoratorFactory(PARAMETER_TYPE.BODY);
export var RequestHeaders = paramDecoratorFactory(PARAMETER_TYPE.HEADERS);
export var Cookies = paramDecoratorFactory(PARAMETER_TYPE.COOKIES);
export var Next = paramDecoratorFactory(PARAMETER_TYPE.NEXT);
export var Context = paramDecoratorFactory(PARAMETER_TYPE.CTX);
function paramDecoratorFactory(parameterType) {
    return function (name) {
        name = name || "default";
        return params(parameterType, name);
    };
}
export function params(type, parameterName) {
    return function (target, methodName, index) {
        var metadataList = {};
        var parameterMetadataList = [];
        var parameterMetadata = {
            index: index,
            parameterName: parameterName,
            type: type
        };
        if (!Reflect.hasOwnMetadata(METADATA_KEY.controllerParameter, target.constructor)) {
            parameterMetadataList.unshift(parameterMetadata);
        }
        else {
            metadataList = Reflect.getOwnMetadata(METADATA_KEY.controllerParameter, target.constructor);
            if (metadataList.hasOwnProperty(methodName)) {
                parameterMetadataList = metadataList[methodName];
            }
            parameterMetadataList.unshift(parameterMetadata);
        }
        metadataList[methodName] = parameterMetadataList;
        Reflect.defineMetadata(METADATA_KEY.controllerParameter, metadataList, target.constructor);
    };
}
