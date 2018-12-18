import * as Koa from "koa";
import * as Router from "koa-router";
import * as inversify from "inversify";
import { interfaces } from "./interfaces";
export declare class InversifyKoaServer {
    private _router;
    private _container;
    private _app;
    private _configFn;
    private _errorConfigFn;
    private _routingConfig;
    private _forceControllers;
    constructor(container: inversify.interfaces.Container, customRouter?: Router, routingConfig?: interfaces.RoutingConfig, customApp?: Koa, forceControllers?: boolean);
    setConfig(fn: interfaces.ConfigFunction): InversifyKoaServer;
    setErrorConfig(fn: interfaces.ConfigFunction): InversifyKoaServer;
    build(): Koa;
    private registerControllers;
    private resolveMidleware;
    private handlerFactory;
    private extractParameters;
    private getParam;
    private checkQueryParam;
}
