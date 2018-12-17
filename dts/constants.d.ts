declare const TYPE: {
    Controller: symbol;
};
declare const METADATA_KEY: {
    controller: string;
    controllerMethod: string;
    controllerParameter: string;
};
export declare enum PARAMETER_TYPE {
    REQUEST = 0,
    RESPONSE = 1,
    PARAMS = 2,
    QUERY = 3,
    BODY = 4,
    HEADERS = 5,
    COOKIES = 6,
    NEXT = 7,
    CTX = 8
}
declare const DEFAULT_ROUTING_ROOT_PATH = "/";
export { TYPE, METADATA_KEY, DEFAULT_ROUTING_ROOT_PATH };
