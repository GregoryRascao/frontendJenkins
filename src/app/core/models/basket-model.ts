import {Entity} from "./entity-model";
import {Item} from "./item-model";
import {User} from "./user-model";

export interface Basket extends Entity
{
    items: Item[];
    user: User;
}
