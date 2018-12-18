import { METADATA_KEY, NO_CONTROLLERS_FOUND } from "./constants";
import { TYPE } from "./constants";
export function getControllersFromContainer(container, forceControllers) {
    if (container.isBound(TYPE.Controller)) {
        return container.getAll(TYPE.Controller);
    }
    else if (forceControllers) {
        throw new Error(NO_CONTROLLERS_FOUND);
    }
    else {
        return [];
    }
}
export function getControllersFromMetadata() {
    var arrayOfControllerMetadata = Reflect.getMetadata(METADATA_KEY.controller, Reflect) || [];
    return arrayOfControllerMetadata.map(function (metadata) { return metadata.target; });
}
export function cleanUpMetadata() {
    Reflect.defineMetadata(METADATA_KEY.controller, [], Reflect);
}
