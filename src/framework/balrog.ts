import {WebRoot} from "./web-root";
import {BalrogRouter} from "./routing/balrog-router";
import {IModule, Module} from "./module/module";

export class Balrog
{
    webRoot: WebRoot;
    router: BalrogRouter;

    constructor() {
        this.webRoot = new WebRoot();
        this.router = new BalrogRouter(this.webRoot);
    }

    initBalrog(mainModule: Module)
    {
        (mainModule as IModule).init(this.router);

        this.router.goToRoute(window.location.pathname);
    }
}
