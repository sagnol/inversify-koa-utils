"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TYPE = {
    Controller: Symbol("Controller")
};
exports.METADATA_KEY = {
    controller: "inversify-express-utils:controller",
    controllerMethod: "inversify-express-utils:controller-method",
    controllerParameter: "inversify-express-utils:controller-parameter",
};
var PARAMETER_TYPE;
(function (PARAMETER_TYPE) {
    PARAMETER_TYPE[PARAMETER_TYPE["REQUEST"] = 0] = "REQUEST";
    PARAMETER_TYPE[PARAMETER_TYPE["RESPONSE"] = 1] = "RESPONSE";
    PARAMETER_TYPE[PARAMETER_TYPE["PARAMS"] = 2] = "PARAMS";
    PARAMETER_TYPE[PARAMETER_TYPE["QUERY"] = 3] = "QUERY";
    PARAMETER_TYPE[PARAMETER_TYPE["BODY"] = 4] = "BODY";
    PARAMETER_TYPE[PARAMETER_TYPE["HEADERS"] = 5] = "HEADERS";
    PARAMETER_TYPE[PARAMETER_TYPE["COOKIES"] = 6] = "COOKIES";
    PARAMETER_TYPE[PARAMETER_TYPE["NEXT"] = 7] = "NEXT";
    PARAMETER_TYPE[PARAMETER_TYPE["CTX"] = 8] = "CTX";
})(PARAMETER_TYPE = exports.PARAMETER_TYPE || (exports.PARAMETER_TYPE = {}));
exports.DUPLICATED_CONTROLLER_NAME = function (name) {
    return "Two controllers cannot have the same name: " + name;
};
exports.NO_CONTROLLERS_FOUND = "No controllers have been found! " +
    "Please ensure that you have register at least one Controller.";
exports.DEFAULT_ROUTING_ROOT_PATH = "/";
