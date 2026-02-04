import {Service} from "../services/base-service";
import {balrog} from "../../index";

export class ActivatedRoute extends Service
{
    constructor() {
        super();
    }

    getParameter(paramKey: string): string
    {
        const value = balrog.router.params.get(paramKey);
        return value ? value : '';
    }
}
