export var TYPE = {
    Controller: Symbol("Controller")
};
export var METADATA_KEY = {
    controller: "inversify-express-utils:controller",
    controllerMethod: "inversify-express-utils:controller-method",
    controllerParameter: "inversify-express-utils:controller-parameter",
};
export var PARAMETER_TYPE;
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
})(PARAMETER_TYPE || (PARAMETER_TYPE = {}));
export var DUPLICATED_CONTROLLER_NAME = function (name) {
    return "Two controllers cannot have the same name: " + name;
};
export var NO_CONTROLLERS_FOUND = "No controllers have been found! " +
    "Please ensure that you have register at least one Controller.";
export var DEFAULT_ROUTING_ROOT_PATH = "/";
