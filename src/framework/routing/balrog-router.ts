import {Component} from "../components/component";
import {WebRoot} from "../web-root";
import {ServiceInjector} from "../services/service-injector";
import {IModule} from "../module/module";
import {Service} from "../services/base-service";

class SubRoute
{
    paramName?: string;
    subRoutes: Map<string, SubRoute>;
    component?: {new(...args: any[]): Component};
    hasSubRoute: boolean;

    constructor()
    {
        this.subRoutes = new Map<string, SubRoute>();
        this.component = undefined;
        this.hasSubRoute = false;
    }

    addSubroute(subRoute: string, rte: SubRoute)
    {
        this.hasSubRoute = true;
        this.subRoutes.set(subRoute, rte);
    }

    getRoute(routeName: string)
    {
        return this.subRoutes.get(routeName);
    }
}

export interface Route
{
    name: string;
    component?: {new(...args: any[]): Component};
    child?: IModule;
}

export class BalrogRouter
{
    webRoot: WebRoot;
    routes: Map<string, SubRoute>;
    params: Map<string, string>;
    activeComponent?: Component;
    url: string;

    constructor(webRoot: WebRoot) {
        this.webRoot = webRoot;
        this.routes = new Map<string, SubRoute>();
        this.params = new Map<string, string>();
        this.activeComponent = undefined;
        this.url = '';
    }

    registerModule(module: IModule, subRoute: string = '')
    {
        for(const route of module.routes)
        {
            if(route.component)
            {
                this.registerRoute(subRoute + route.name, route.component);
            }
            if(route.child)
            {
                this.registerModule(route.child, route.name);
            }
        }
    }

    private registerRoute(route: string, component: {new(...args: any[]): Component})
    {
        console.log("REGISTER", route);
        const rte = route.split(/(\/[a-z\-\/]+\/):([a-z]+)/).filter((itm) => itm != '');
        console.log("splited route", rte);

        let rte_to_add = this.routes.get(rte[0]);
        rte_to_add = rte_to_add ? rte_to_add : new SubRoute();

        this.routes.set(rte[0], rte_to_add);

        if(rte.length > 1)
        {
            this.routes.set(rte[0], rte_to_add);
            rte_to_add.paramName = rte[1];

            for(let i = 2; i < rte.length; i++)
            {
                if(rte[i].at(0) === '/')
                {
                    let sub_rte = new SubRoute();
                    rte_to_add.addSubroute(rte[i], sub_rte);
                    rte_to_add = sub_rte;
                } else
                {
                    rte_to_add.paramName = rte[i];
                }
            }
        }

        rte_to_add.component = component;
    }

    goToRoute(route: string)
    {
        if(route === this.url)
        {
            return;
        }
        this.url = route;
        
        const rte = route.split(/(\/[a-z\-\/]+\/)([0-9]+)/).filter((itm) => itm != '');
        let activeRoute = this.routes.get(rte[0]);
        const urlRoute: string = rte[0];
        window.history.pushState({}, '', route);

        this.params.clear();

        if(activeRoute && activeRoute.paramName && rte.length > 1)
        {
            this.params.set(activeRoute.paramName, rte[1]);

            for(let i = 2; i < rte.length && activeRoute; i++)
            {
                if(rte[i].at(0) === '/')
                {
                    activeRoute = activeRoute.getRoute(rte[i]);
                } else if(activeRoute.paramName)
                {
                    this.params.set(activeRoute.paramName, rte[i]);
                }
            }
        }

        if(activeRoute && activeRoute.component !== undefined)
        {
            this.clearRoot();
            this.activeComponent = ServiceInjector.resolve(activeRoute.component);
            const component = document.createElement(this.activeComponent.tagName);
            this.webRoot.root.appendChild(component);
        }
    }

    private clearRoot()
    {
        while(this.webRoot.root.firstChild)
        {
            let child = this.webRoot.root.firstChild;
            this.webRoot.root.removeChild(this.webRoot.root.firstChild);
        }
    }
}
