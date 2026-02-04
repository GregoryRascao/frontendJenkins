import {Service} from "../services/base-service";
import {BalrogRouter} from "./balrog-router";
import {balrog} from "../../index";

export class Router extends Service
{
    constructor() {
        super();
    }

    goToRoute(route: string)
    {
        balrog.router.goToRoute(route);
    }
}
