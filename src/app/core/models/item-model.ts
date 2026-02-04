import {Entity} from "./entity-model";

export interface Item extends Entity
{
    name: string;
    price: number;
    quantity: number;
    description: string;
}
