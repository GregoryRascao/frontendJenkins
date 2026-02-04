import {Component, component} from "../../../framework/components/component";
import {
    ButtonType,
    ColumnType,
    SortDirection,
    TableConfig
} from "../../core/components/table/table-component/table-component";
import {Item} from "../../core/models/item-model";
import {ItemService} from "../../core/services/item-service";
import {BasketService} from "../../core/services/basket-service";
import {Router} from "../../../framework/routing/router";
import {Entity} from "../../core/models/entity-model";
import {map} from "rxjs";

@component({
    name: 'basket-component',
    template: 'basket-component.html',
})
export class BasketComponent extends Component {
    tableConfig: TableConfig;
    items: Array<Item>;

    constructor(
        private basketService: BasketService,
        private router: Router,
    ) {
        super();
    }

    onInit() {
        this.tableConfig = {
            sort: {
                sortValueName: 'id',
                direction: SortDirection.ASC
            },
            columns: [
                {
                    columnName: 'Id',
                    value: 'item.id',
                    type: ColumnType.DATA
                },
                {
                    columnName: 'name',
                    value: 'item.name',
                    type: ColumnType.DATA
                },
                {
                    columnName: 'Price',
                    value: 'item.price',
                    type: ColumnType.DATA
                },
                {
                    columnName: 'Quantity',
                    valueCb: (data) => {
                        const basketItem = data as Item;

                        return basketItem.quantity.toString();
                    },
                    type: ColumnType.FORM,
                    formName: 'quantity'
                },
                {
                    columnName: 'Actions',
                    type: ColumnType.ACTIONS
                },
            ],
            form: {
                formName: 'Basket',
                formFields: [
                    {
                        fieldType: 'number',
                        fieldName: 'quantity',
                        validators: []
                    },
                ],
                formSubmit: (event) => console.log(event)
            },
            findDataCb: () => this.basketService.getBasket()
                .pipe(map((basket) => basket.items)),
            actions: [
                {
                    actionName: "Update basket",
                    actionCb: (item: Entity) =>
                    {
                        this.basketService.addToBasket(item as Item)
                            .subscribe((basket) =>
                            {
                                console.log(basket);
                                this.basketService.getBasket()
                                    .subscribe((basket) =>
                                    {
                                        console.log(basket);
                                    });
                            });
                        console.log(item);
                    },
                    type: ButtonType.SUBMIT
                },
            ]
        }
    }
}
