import {BaseService, CrudConfig} from "./base-service";
import {Item} from "../models/item-model";
import {HttpService} from "../../../framework/services/http-service";
import {service} from "../../../framework/services/base-service";

const config: CrudConfig = {
    manyUrl: 'items',
    singleUrl: (id) => `items/${id}`
}

@service()
export class ItemService extends BaseService<Item>
{
    constructor(protected http: HttpService) {
        super(http, config);
    }
}
