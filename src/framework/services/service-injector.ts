import "reflect-metadata";
import {Injectable, Service} from "../services/base-service"
import {AjaxInterceptor} from "./interceptor";

export interface Provider
{
    service?: Service;
    interceptor?: AjaxInterceptor;
}

interface ArgType<T> {
    new (...args: any[]): T;
}

export class ServiceInjector {
    private static container = new Map<string, any>();

    static resolve<T>(target: ArgType<T>): T {
        // check if the class is already in the container.
        if (ServiceInjector.container.has(target.name)) {
            return ServiceInjector.container.get(target.name) as T;
        }

        // get constructors arguments.
        const args = Reflect.getMetadata("design:paramtypes", target) || [];

        // Recover injectable args
        const injections = args.map((arg: ArgType<any>): any =>
            // Resolve dependency constructor if needed.
            ServiceInjector.resolve(arg)
        );

        // Inject injectable arguments into the target constructor.
        const instance = new target(...injections);

        // If instance is an instance of service then it should be add to the container.
        if(instance instanceof Service)
        {
            ServiceInjector.container.set(target.name, instance);
        }

        return instance as T;
    }
}
