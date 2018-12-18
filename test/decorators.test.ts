import { expect } from "chai";
import { Controller, HttpMethod, params } from "../src/decorators";
import { interfaces } from "../src/interfaces";
import { METADATA_KEY, PARAMETER_TYPE } from "../src/constants";
import { cleanUpMetadata } from "../src/utils";

describe("Unit Test: Controller Decorators", () => {

    beforeEach((done) => {
        cleanUpMetadata();
        done();
    });

    it("should add controller metadata to a class when decorated with @Controller", (done) => {
        let middleware = [function() { return; }, "foo", Symbol("bar")];
        let path = "foo";

        @Controller(path, ...middleware)
        class TestController {}

        let controllerMetadata: interfaces.ControllerMetadata = Reflect.getMetadata("inversify-express-utils:controller", TestController);

        expect(controllerMetadata.middleware).eql(middleware);
        expect(controllerMetadata.path).eql(path);
        expect(controllerMetadata.target).eql(TestController);
        done();
    });


    it("should add method metadata to a class when decorated with @HttpMethod", (done) => {
        let middleware = [function() { return; }, "bar", Symbol("baz")];
        let path = "foo";
        let method = "get";

        class TestController {
            @HttpMethod(method, path, ...middleware)
            public test() { return; }

            @HttpMethod("foo", "bar")
            public test2() { return; }

            @HttpMethod("bar", "foo")
            public test3() { return; }
        }

        let methodMetadata: interfaces.ControllerMethodMetadata[] = Reflect.getMetadata(
            "inversify-express-utils:controller-method", TestController);

        expect(methodMetadata.length).eql(3);

        let metadata: interfaces.ControllerMethodMetadata = methodMetadata[0];

        expect(metadata.middleware).eql(middleware);
        expect(metadata.path).eql(path);
        expect(metadata.target.constructor).eql(TestController);
        expect(metadata.key).eql("test");
        expect(metadata.method).eql(method);
        done();
    });

    it("should add parameter metadata to a class when decorated with @params", (done) => {
        let middleware = [function() { return; }, "bar", Symbol("baz")];
        let path = "foo";
        let method = "get";
        let methodName = "test";

        class TestController {
            @HttpMethod(method, path, ...middleware)
            public test(@params(PARAMETER_TYPE.PARAMS, "id") id: any, @params(PARAMETER_TYPE.PARAMS, "cat") cat: any) { return; }

            @HttpMethod("foo", "bar")
            public test2(@params(PARAMETER_TYPE.PARAMS, "dog")dog: any) { return; }

            @HttpMethod("bar", "foo")
            public test3() { return; }
        }
        let methodMetadataList: interfaces.ControllerParameterMetadata =
        Reflect.getMetadata(METADATA_KEY.controllerParameter, TestController);
        expect(methodMetadataList.hasOwnProperty("test")).to.eqls(true);

        let paramaterMetadataList: interfaces.ParameterMetadata[] = methodMetadataList[methodName];
        expect(paramaterMetadataList.length).eql(2);

        let paramaterMetadata: interfaces.ParameterMetadata = paramaterMetadataList[0];
        expect(paramaterMetadata.index).eql(0);
        expect(paramaterMetadata.parameterName).eql("id");
        done();
    });

});
