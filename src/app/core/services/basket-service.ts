import {BaseService, CrudConfig} from "./base-service";
import {Basket} from "../models/basket-model";
import {HttpService} from "../../../framework/services/http-service";
import {service} from "../../../framework/services/base-service";
import {Item} from "../models/item-model";
import {environement} from "../../../env/environement";

const config: CrudConfig = {
    manyUrl: 'baskets',
    singleUrl: (id) => `baskets/${id}`
}

@service()
export class BasketService extends BaseService<Basket>
{
    constructor(protected http: HttpService) {
        super(http, config);
    }

    getBasket()
    {
        return this.http.get<Basket>(`${environement.api}basket`);
    }

    addToBasket(item: Item)
    {
        return this.http.put<any>(`${environement.api}basket/add`, item);
    }
}
