import * as Koa from "koa";
import * as Router from "koa-router";
import { interfaces as inversifyInterfaces } from "inversify";
import { PARAMETER_TYPE } from "./constants";
declare namespace interfaces {
    type Middleware = (inversifyInterfaces.ServiceIdentifier<any> | KoaRequestHandler);
    interface ControllerMetadata {
        path: string;
        middleware: Middleware[];
        target: any;
    }
    interface ControllerMethodMetadata extends ControllerMetadata {
        method: string;
        key: string;
    }
    interface ControllerParameterMetadata {
        [methodName: string]: ParameterMetadata[];
    }
    interface ParameterMetadata {
        parameterName: string;
        index: number;
        type: PARAMETER_TYPE;
    }
    interface Controller {
    }
    interface HandlerDecorator {
        (target: any, key: string, value: any): void;
    }
    interface ConfigFunction {
        (app: Koa): void;
    }
    interface RoutingConfig {
        rootPath: string;
    }
    interface KoaRequestHandler {
        (ctx: Router.IRouterContext, next: () => Promise<any>): any;
    }
}
export { interfaces };
