import { inject, injectable, decorate } from "inversify";
import { interfaces } from "./interfaces";
import { METADATA_KEY, PARAMETER_TYPE } from "./constants";

export function Controller(path: string, ...middleware: interfaces.Middleware[]) {
    return function (target: any) {
        const metadata: interfaces.ControllerMetadata = {path, middleware, target};

        decorate(injectable(), target);
        Reflect.defineMetadata(METADATA_KEY.controller, metadata, target);

        // We need to create an array that contains the metadata of all
        // the controllers in the application, the metadata cannot be
        // attached to a controller. It needs to be attached to a global
        // We attach metadata to the Reflect object itself to avoid
        // declaring additonal globals. Also, the Reflect is avaiable
        // in both node and web browsers.
        const previousMetadata: interfaces.ControllerMetadata[] = Reflect.getMetadata(
            METADATA_KEY.controller,
            Reflect
        ) || [];

        const newMetadata = [metadata, ...previousMetadata];

        Reflect.defineMetadata(
            METADATA_KEY.controller,
            newMetadata,
            Reflect
        );
    };
}

export function All(path: string, ...middleware: interfaces.Middleware[]): interfaces.HandlerDecorator {
    return HttpMethod("all",    path, ...middleware);
}

export function Get(path: string, ...middleware: interfaces.Middleware[]): interfaces.HandlerDecorator {
    return HttpMethod("get",    path, ...middleware);
}

export function Post(path: string, ...middleware: interfaces.Middleware[]): interfaces.HandlerDecorator {
    return HttpMethod("post",   path, ...middleware);
}

export function Put(path: string, ...middleware: interfaces.Middleware[]): interfaces.HandlerDecorator {
    return HttpMethod("put",    path, ...middleware);
}

export function Patch(path: string, ...middleware: interfaces.Middleware[]): interfaces.HandlerDecorator {
    return HttpMethod("patch",  path, ...middleware);
}

export function Head(path: string, ...middleware: interfaces.Middleware[]): interfaces.HandlerDecorator {
    return HttpMethod("head",   path, ...middleware);
}

export function Delete(path: string, ...middleware: interfaces.Middleware[]): interfaces.HandlerDecorator {
    return HttpMethod("delete", path, ...middleware);
}

export function HttpMethod(method: string, path: string, ...middleware: interfaces.Middleware[]): interfaces.HandlerDecorator {
    return function (target: any, key: string, value: any) {
        let metadata: interfaces.ControllerMethodMetadata = {path, middleware, method, target, key};
        let metadataList: interfaces.ControllerMethodMetadata[] = [];

        if (!Reflect.hasOwnMetadata(METADATA_KEY.controllerMethod, target.constructor)) {
            Reflect.defineMetadata(METADATA_KEY.controllerMethod, metadataList, target.constructor);
        } else {
            metadataList = Reflect.getOwnMetadata(METADATA_KEY.controllerMethod, target.constructor);
        }

        metadataList.push(metadata);
    };
}

export const Request = paramDecoratorFactory(PARAMETER_TYPE.REQUEST);
export const Response = paramDecoratorFactory(PARAMETER_TYPE.RESPONSE);
export const RequestParam = paramDecoratorFactory(PARAMETER_TYPE.PARAMS);
export const QueryParam = paramDecoratorFactory(PARAMETER_TYPE.QUERY);
export const RequestBody = paramDecoratorFactory(PARAMETER_TYPE.BODY);
export const RequestHeaders = paramDecoratorFactory(PARAMETER_TYPE.HEADERS);
export const Cookies = paramDecoratorFactory(PARAMETER_TYPE.COOKIES);
export const Next = paramDecoratorFactory(PARAMETER_TYPE.NEXT);
export const Context = paramDecoratorFactory(PARAMETER_TYPE.CTX);


function paramDecoratorFactory(parameterType: PARAMETER_TYPE): (name?: string) => ParameterDecorator {
    return function (name?: string): ParameterDecorator {
        name = name || "default";
        return params(parameterType, name);
    };
}

export function params(type: PARAMETER_TYPE, parameterName: string) {
    return function (target: Object, methodName: string, index: number) {

        let metadataList: interfaces.ControllerParameterMetadata = {};
        let parameterMetadataList: interfaces.ParameterMetadata[] = [];
        let parameterMetadata: interfaces.ParameterMetadata = {
            index: index,
            parameterName: parameterName,
            type: type
        };
        if (!Reflect.hasOwnMetadata(METADATA_KEY.controllerParameter, target.constructor)) {
            parameterMetadataList.unshift(parameterMetadata);
        } else {
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
