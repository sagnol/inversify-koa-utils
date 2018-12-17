import * as Koa from "koa";
import * as Router from "koa-router";
import * as inversify from "inversify";
import { interfaces } from "./interfaces";
/**
 * Wrapper for the koa server.
 */
export declare class InversifyKoaServer {
    private _router;
    private _container;
    private _app;
    private _configFn;
    private _errorConfigFn;
    private _routingConfig;
    /**
     * Wrapper for the koa server.
     *
     * @param container Container loaded with all controllers and their dependencies.
     */
    constructor(container: inversify.interfaces.Container, customRouter?: Router, routingConfig?: interfaces.RoutingConfig, customApp?: Koa);
    /**
     * Sets the configuration function to be applied to the application.
     * Note that the config function is not actually executed until a call to InversifyKoaServer.build().
     *
     * This method is chainable.
     *
     * @param fn Function in which app-level middleware can be registered.
     */
    setConfig(fn: interfaces.ConfigFunction): InversifyKoaServer;
    /**
     * Sets the error handler configuration function to be applied to the application.
     * Note that the error config function is not actually executed until a call to InversifyKoaServer.build().
     *
     * This method is chainable.
     *
     * @param fn Function in which app-level error handlers can be registered.
     */
    setErrorConfig(fn: interfaces.ConfigFunction): InversifyKoaServer;
    /**
     * Applies all routes and configuration to the server, returning the Koa application.
     */
    build(): Koa;
    private registerControllers;
    private resolveMidleware;
    private handlerFactory;
    private extractParameters;
    private getParam;
    private checkQueryParam;
}
