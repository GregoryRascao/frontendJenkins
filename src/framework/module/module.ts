import {Route, BalrogRouter} from "../routing/balrog-router";
import {Provider} from "../services/service-injector";
import {Declarer} from "../components/component";
import {AjaxInterceptor} from "../services/interceptor";
import {AjaxWrapper} from "../services/ajax-wrapper";

export interface ModuleInit
{
    routes: Route[];
    providers: Provider[];
    declarers: Declarer[];
}

export function module(moduleInit: ModuleInit) {
    return function _DecoratorName<T extends {new(...args: any[]): Module}>(constr: T): T {
        // @ts-ignore
        let resolve = class extends constr implements IModule {

            routes: Route[];
            providers: Provider[];
            declarers: Declarer[];

            constructor(...args: any[]) {
                super();
                this.routes = moduleInit.routes;
                this.providers = moduleInit.providers;
                this.declarers = moduleInit.declarers;
            }

            init(router: BalrogRouter)
            {
                router.registerModule(this);

                for(let provide of this.providers)
                {
                    if(provide.interceptor)
                    {
                        AjaxWrapper.addInterceptors(provide.interceptor);
                    }
                }
            }
        };

        return resolve;
    }
}

export class Module
{}

export interface IModule
{
    routes: Route[];
    providers: Provider[];
    declarers: Declarer[];

    init(router: BalrogRouter): void;
}
