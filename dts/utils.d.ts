import { interfaces as inversifyInterfaces } from "inversify";
import { interfaces } from "./interfaces";
export declare function getControllersFromContainer(container: inversifyInterfaces.Container, forceControllers: boolean): interfaces.Controller[];
export declare function getControllersFromMetadata(): any[];
export declare function cleanUpMetadata(): void;
