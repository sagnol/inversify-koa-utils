import "reflect-metadata";
import * as sinon from "sinon";
import * as supertest from "supertest";
import { expect } from "chai";
import * as inversify from "inversify";
import * as Koa from "koa";
import * as Router from "koa-router";
import * as bodyParser from "koa-bodyparser";
import { injectable, Container } from "inversify";
import { interfaces } from "../src/interfaces";
import { InversifyKoaServer } from "../src/server";
import {
    Controller, HttpMethod, All, Get, Post, Put, Patch,
    Head, Delete, Request, Response, params, RequestParam,
    RequestBody, QueryParam, RequestHeaders, Cookies,
    Next, Context
} from "../src/decorators";
import { TYPE, PARAMETER_TYPE } from "../src/constants";

describe("Integration Tests:", () => {
    let server: InversifyKoaServer;
    let container: inversify.interfaces.Container;

    beforeEach((done) => {
        // refresh container and container
        container = new Container();
        done();
    });

    describe("Routing & Request Handling:", () => {

        it("should work for basic koa cascading (using async/await)", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Get("/") public async getTest(ctx: Router.IRouterContext, nextFunc: () => Promise<any>) {
                    const start = new Date();
                    await nextFunc();
                    const ms = new Date().valueOf() - start.valueOf();
                    ctx.set("X-Response-Time", `${ms}ms`);
                }

                @Get("/") public getTest2(ctx: Router.IRouterContext) {
                    ctx.body = "Hello World";
                }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            supertest(server.build().listen())
                .get("/")
                .expect(200, "Hello World", done);
        });

        it("should work for basic koa cascading (using promises)", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Get("/") public async getTest(ctx: Router.IRouterContext, nextFunc: () => Promise<any>) {
                    const start = new Date();
                    return nextFunc().then(() => {
                        const ms = new Date().valueOf() - start.valueOf();
                        ctx.set("X-Response-Time", `${ms}ms`);
                        ctx.body = "Hello World";
                    });
                }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            supertest(server.build().listen())
                .get("/")
                .expect(200, "Hello World", done);
        });

        it("should work for methods which call nextFunc()", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Get("/") public async getTest(ctx: Router.IRouterContext, nextFunc: () => Promise<any>) {
                    nextFunc();
                }

                @Get("/") public getTest2(ctx: Router.IRouterContext) {
                    ctx.body = "GET";
                }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            supertest(server.build().listen())
                .get("/")
                .expect(200, "GET", done);
        });


        it("should work for async methods which call nextFunc()", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Get("/") public getTest(ctx: Router.IRouterContext, nextFunc: () => Promise<any>) {
                    return new Promise(((resolve) => {
                        setTimeout(() => {
                            nextFunc();
                            resolve();
                        }, 100);
                    }));
                }

                @Get("/") public getTest2(ctx: Router.IRouterContext) {
                    ctx.body = "GET";
                }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            supertest(server.build().listen())
                .get("/")
                .expect(200, "GET", done);
        });


        it("should work for async methods called by nextFunc()", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Get("/") public async getTest(ctx: Router.IRouterContext, nextFunc: () => Promise<any>) {
                    await nextFunc();
                }

                @Get("/") public getTest2(ctx: Router.IRouterContext) {
                    return new Promise(((resolve) => {
                        setTimeout(resolve, 100, "GET");
                    }));
                }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            supertest(server.build().listen())
                .get("/")
                .expect(200, "GET", done);
        });


        it("should work for each shortcut decorator", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Get("/") public getTest(ctx: Router.IRouterContext) { ctx.body = "GET"; }
                @Post("/") public postTest(ctx: Router.IRouterContext) { ctx.body = "POST"; }
                @Put("/") public putTest(ctx: Router.IRouterContext) { ctx.body = "PUT"; }
                @Patch("/") public patchTest(ctx: Router.IRouterContext) { ctx.body = "PATCH"; }
                @Head("/") public headTest(ctx: Router.IRouterContext) { ctx.body = "HEAD"; }
                @Delete("/") public deleteTest(ctx: Router.IRouterContext) { ctx.body = "DELETE"; }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            let agent = supertest(server.build().listen());

            let deleteFn = () => { agent.delete("/").expect(200, "DELETE", done); };
            let head = () => { agent.head("/").expect(200, "HEAD", deleteFn); };
            let patch = () => { agent.patch("/").expect(200, "PATCH", head); };
            let put = () => { agent.put("/").expect(200, "PUT", patch); };
            let post = () => { agent.post("/").expect(200, "POST", put); };
            let get = () => { agent.get("/").expect(200, "GET", post); };

            get();
        });


        it("should work for more obscure HTTP methods using the HttpMethod decorator", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @HttpMethod("propfind", "/") public getTest(ctx: Router.IRouterContext) { ctx.body = "PROPFIND"; }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            supertest(server.build().listen())
                .propfind("/")
                .expect(200, "PROPFIND", done);
        });


        it("should use returned values as Response", (done) => {
            let result = { "hello": "world" };

            @injectable()
            @Controller("/")
            class TestController {
                @Get("/") public getTest(ctx: Router.IRouterContext) { return result; }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            supertest(server.build().listen())
                .get("/")
                .expect(200, JSON.stringify(result), done);
        });

        it("should use custom router passed from configuration", () => {
            @injectable()
            @Controller("/")
            class TestController {
                @Get("endpoint") public get() {
                    return "Such Text";
                }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            const customRouter = new Router({
                prefix: "/api"
            });

            server = new InversifyKoaServer(container, customRouter);
            const app = server.build().listen();

            const expectedSuccess = supertest(app)
                .get("/api/endpoint")
                .expect(200, "Such Text");

            const expectedNotFound1 = supertest(app)
                .get("/otherpath/endpoint")
                .expect(404);

            const expectedNotFound2 = supertest(app)
                .get("/endpoint")
                .expect(404);

            return Promise.all([
                expectedSuccess,
                expectedNotFound1,
                expectedNotFound2
            ]);

        });

        it("should use custom routing configuration", () => {
            @injectable()
            @Controller("/ping")
            class TestController {
                @Get("/endpoint") public get() {
                    return "pong";
                }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container, null, { rootPath: "/api/v1" });

            return supertest(server.build().listen())
                .get("/api/v1/ping/endpoint")
                .expect(200, "pong");
        });
    });


    describe("Middleware:", () => {
        let result: string;
        let middleware: any = {
            a: function (ctx: Router.IRouterContext, nextFunc: () => Promise<any>) {
                result += "a";
                nextFunc();
            },
            b: function (ctx: Router.IRouterContext, nextFunc: () => Promise<any>) {
                result += "b";
                nextFunc();
            },
            c: function (ctx: Router.IRouterContext, nextFunc: () => Promise<any>) {
                result += "c";
                nextFunc();
            }
        };
        let spyA = sinon.spy(middleware, "a");
        let spyB = sinon.spy(middleware, "b");
        let spyC = sinon.spy(middleware, "c");

        beforeEach((done) => {
            result = "";
            spyA.resetHistory();
            spyB.resetHistory();
            spyC.resetHistory();
            done();
        });

        it("should call method-level middleware correctly (GET)", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Get("/", spyA, spyB, spyC) public getTest(ctx: Router.IRouterContext) { ctx.body = "GET"; }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            let agent = supertest(server.build().listen());

            agent.get("/")
                .expect(200, "GET", function () {
                    expect(spyA.calledOnce).to.eqls(true);
                    expect(spyB.calledOnce).to.eqls(true);
                    expect(spyC.calledOnce).to.eqls(true);
                    expect(result).to.equal("abc");
                    done();
                });
        });

        it("should call method-level middleware correctly (POST)", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Post("/", spyA, spyB, spyC) public postTest(ctx: Router.IRouterContext) { ctx.body = "POST"; }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            let agent = supertest(server.build().listen());

            agent.post("/")
                .expect(200, "POST", function () {
                    expect(spyA.calledOnce).to.eqls(true);
                    expect(spyB.calledOnce).to.eqls(true);
                    expect(spyC.calledOnce).to.eqls(true);
                    expect(result).to.equal("abc");
                    done();
                });
        });

        it("should call method-level middleware correctly (PUT)", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Put("/", spyA, spyB, spyC) public postTest(ctx: Router.IRouterContext) { ctx.body = "PUT"; }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            let agent = supertest(server.build().listen());

            agent.put("/")
                .expect(200, "PUT", function () {
                    expect(spyA.calledOnce).to.eqls(true);
                    expect(spyB.calledOnce).to.eqls(true);
                    expect(spyC.calledOnce).to.eqls(true);
                    expect(result).to.equal("abc");
                    done();
                });
        });

        it("should call method-level middleware correctly (PATCH)", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Patch("/", spyA, spyB, spyC) public postTest(ctx: Router.IRouterContext) { ctx.body = "PATCH"; }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            let agent = supertest(server.build().listen());

            agent.patch("/")
                .expect(200, "PATCH", function () {
                    expect(spyA.calledOnce).to.eqls(true);
                    expect(spyB.calledOnce).to.eqls(true);
                    expect(spyC.calledOnce).to.eqls(true);
                    expect(result).to.equal("abc");
                    done();
                });
        });

        it("should call method-level middleware correctly (HEAD)", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Head("/", spyA, spyB, spyC) public postTest(ctx: Router.IRouterContext) { ctx.body = "HEAD"; }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            let agent = supertest(server.build().listen());

            agent.head("/")
                .expect(200, "HEAD", function () {
                    expect(spyA.calledOnce).to.eqls(true);
                    expect(spyB.calledOnce).to.eqls(true);
                    expect(spyC.calledOnce).to.eqls(true);
                    expect(result).to.equal("abc");
                    done();
                });
        });

        it("should call method-level middleware correctly (DELETE)", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Delete("/", spyA, spyB, spyC) public postTest(ctx: Router.IRouterContext) { ctx.body = "DELETE"; }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            let agent = supertest(server.build().listen());

            agent.delete("/")
                .expect(200, "DELETE", function () {
                    expect(spyA.calledOnce).to.eqls(true);
                    expect(spyB.calledOnce).to.eqls(true);
                    expect(spyC.calledOnce).to.eqls(true);
                    expect(result).to.equal("abc");
                    done();
                });
        });

        it("should call method-level middleware correctly (ALL)", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @All("/", spyA, spyB, spyC) public postTest(ctx: Router.IRouterContext) { ctx.body = "ALL"; }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            let agent = supertest(server.build().listen());

            agent.get("/")
                .expect(200, "ALL", function () {
                    expect(spyA.calledOnce).to.eqls(true);
                    expect(spyB.calledOnce).to.eqls(true);
                    expect(spyC.calledOnce).to.eqls(true);
                    expect(result).to.equal("abc");
                    done();
                });
        });


        it("should call Controller-level middleware correctly", (done) => {
            @injectable()
            @Controller("/", spyA, spyB, spyC)
            class TestController {
                @Get("/") public getTest(ctx: Router.IRouterContext) { ctx.body = "GET"; }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            supertest(server.build().listen())
                .get("/")
                .expect(200, "GET", function () {
                    expect(spyA.calledOnce).to.eqls(true);
                    expect(spyB.calledOnce).to.eqls(true);
                    expect(spyC.calledOnce).to.eqls(true);
                    expect(result).to.equal("abc");
                    done();
                });
        });


        it("should call server-level middleware correctly", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Get("/") public getTest(ctx: Router.IRouterContext) { ctx.body = "GET"; }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);

            server.setConfig((app) => {
                app.use(spyA);
                app.use(spyB);
                app.use(spyC);
            });

            supertest(server.build().listen())
                .get("/")
                .expect(200, "GET", function () {
                    expect(spyA.calledOnce).to.eqls(true);
                    expect(spyB.calledOnce).to.eqls(true);
                    expect(spyC.calledOnce).to.eqls(true);
                    expect(result).to.equal("abc");
                    done();
                });
        });


        it("should call all middleware in correct order", (done) => {
            @injectable()
            @Controller("/", spyB)
            class TestController {
                @Get("/", spyC) public getTest(ctx: Router.IRouterContext) { ctx.body = "GET"; }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);

            server.setConfig((app) => {
                app.use(spyA);
            });

            supertest(server.build().listen())
                .get("/")
                .expect(200, "GET", function () {
                    expect(spyA.calledOnce).to.eqls(true);
                    expect(spyB.calledOnce).to.eqls(true);
                    expect(spyC.calledOnce).to.eqls(true);
                    expect(result).to.equal("abc");
                    done();
                });
        });

        it("should resolve Controller-level middleware", () => {
            const symbolId = Symbol("spyA");
            const strId = "spyB";

            @injectable()
            @Controller("/", symbolId, strId)
            class TestController {
                @Get("/") public getTest(ctx: Router.IRouterContext) { ctx.body = "GET"; }
            }

            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");
            container.bind<interfaces.KoaRequestHandler>(symbolId).toConstantValue(spyA);
            container.bind<interfaces.KoaRequestHandler>(strId).toConstantValue(spyB);

            server = new InversifyKoaServer(container);

            let agent = supertest(server.build().listen());

            return agent.get("/")
                .expect(200, "GET")
                .then(() => {
                    expect(spyA.calledOnce).to.eqls(true);
                    expect(spyB.calledOnce).to.eqls(true);
                    expect(result).to.equal("ab");
                });
        });

        it("should resolve method-level middleware", () => {
            const symbolId = Symbol("spyA");
            const strId = "spyB";

            @injectable()
            @Controller("/")
            class TestController {
                @Get("/", symbolId, strId)
                public getTest(ctx: Router.IRouterContext) { ctx.body = "GET"; }
            }

            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");
            container.bind<interfaces.KoaRequestHandler>(symbolId).toConstantValue(spyA);
            container.bind<interfaces.KoaRequestHandler>(strId).toConstantValue(spyB);

            server = new InversifyKoaServer(container);

            let agent = supertest(server.build().listen());

            return agent.get("/")
                .expect(200, "GET")
                .then(() => {
                    expect(spyA.calledOnce).to.eqls(true);
                    expect(spyB.calledOnce).to.eqls(true);
                    expect(result).to.equal("ab");
                });
        });

        it("should compose Controller- and method-level middleware", () => {
            const symbolId = Symbol("spyA");
            const strId = "spyB";

            @injectable()
            @Controller("/", symbolId)
            class TestController {
                @Get("/", strId)
                public getTest(ctx: Router.IRouterContext) { ctx.body = "GET"; }
            }

            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");
            container.bind<interfaces.KoaRequestHandler>(symbolId).toConstantValue(spyA);
            container.bind<interfaces.KoaRequestHandler>(strId).toConstantValue(spyB);

            server = new InversifyKoaServer(container);

            let agent = supertest(server.build().listen());

            return agent.get("/")
                .expect(200, "GET")
                .then(() => {
                    expect(spyA.calledOnce).to.eqls(true);
                    expect(spyB.calledOnce).to.eqls(true);
                    expect(result).to.equal("ab");
                });
        });
    });
    describe("Parameters:", () => {
        it("should bind a method parameter to the url parameter of the web Request", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                // tslint:disable-next-line:max-line-length
                @Get(":id") public getTest( @RequestParam("id") id: string, ctx: Router.IRouterContext) {
                    return id;
                }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            supertest(server.build().listen())
                .get("/foo")
                .expect(200, "foo", done);
        });

        it("should bind a method parameter to the Request object", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Get(":id") public getTest( @Request() req: Koa.Request) {
                    return req.url;
                }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            supertest(server.build().listen())
                .get("/GET")
                .expect(200, "/GET", done);
        });

        it("should bind a method parameter to the Response object", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Get("/") public getTest( @Response() res: Koa.Response) {
                    return res.body = "foo";
                }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            supertest(server.build().listen())
                .get("/")
                .expect(200, "foo", done);
        });

        it("should bind a method parameter to the context object", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Get("/") public getTest( @Context() ctx: Koa.Context) {
                    return ctx.body = "foo";
                }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            supertest(server.build().listen())
                .get("/")
                .expect(200, "foo", done);
        });

        it("should bind a method parameter to a query parameter", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Get("/") public getTest( @QueryParam("id") id: string) {
                    return id;
                }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            supertest(server.build().listen())
                .get("/")
                .query("id=foo")
                .expect(200, "foo", done);
        });

        it("should bind a method parameter to the Request body", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Post("/") public getTest( @RequestBody() reqBody: string) {
                    return reqBody;
                }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            server.setConfig((app) => {
                app.use(bodyParser());
            });
            let body = { foo: "bar" };
            supertest(server.build().listen())
                .post("/")
                .send(body)
                .expect(200, body, done);
        });

        it("should bind a method parameter to the Request headers", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Get("/") public getTest( @RequestHeaders("testhead") headers: any) {
                    return headers;
                }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            supertest(server.build().listen())
                .get("/")
                .set("TestHead", "foo")
                .expect(200, "foo", done);
        });

        it("should bind a method parameter to a cookie", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Get("/") public getCookie(@Cookies("cookie") cookie: any, ctx: Router.IRouterContext) {
                    if (cookie) {
                        ctx.body = cookie;
                    } else {
                        ctx.body = ":(";
                    }
                }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            server.setConfig((app) => {
                app.use(function (ctx, nextFunc) {
                    ctx.cookies.set("cookie", "hey", { httpOnly: false });
                    nextFunc();
                });
            });
            supertest(server.build().listen())
                .get("/")
                .expect("set-cookie", "cookie=hey; path=/", done);
        });

        it("should bind a method parameter to the next function", (done) => {
            @injectable()
            @Controller("/")
            class TestController {
                @Get("/") public async getTest( @Next() nextFunc: any) {
                    let err = new Error("foo");
                    await nextFunc();
                }
                @Get("/") public getResult() {
                    return "foo";
                }
            }
            container.bind<interfaces.Controller>(TYPE.Controller).to(TestController).whenTargetNamed("TestController");

            server = new InversifyKoaServer(container);
            supertest(server.build().listen())
                .get("/")
                .expect(200, "foo", done);
        });
    });

});
