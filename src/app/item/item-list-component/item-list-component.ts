import {component, Component} from "../../../framework/components/component";
import {ItemService} from "../../core/services/item-service";
import {
    ButtonType,
    ColumnType,
    SortDirection,
    TableConfig
} from "../../core/components/table/table-component/table-component";
import {Item} from "../../core/models/item-model";
import {Entity} from "../../core/models/entity-model";
import {Router} from "../../../framework/routing/router";
import {Validators} from "../../../framework/forms/validators/validators";
import {BasketService} from "../../core/services/basket-service";

@component({
    name: 'item-list-component',
    template: 'item-list-component.html',
})
export class ItemListComponent extends Component
{
    tableConfig: TableConfig;
    items: Array<Item>;

    constructor(
        private itemService: ItemService,
        private basketService: BasketService,
        private router: Router,
    ) {
        super();
    }

    onInit(): void {
        this.tableConfig = {
            sort: {
                sortValueName: 'id',
                direction: SortDirection.ASC
            },
            columns: [
                {
                    columnName: 'Id',
                    value: 'id',
                    type: ColumnType.DATA
                },
                {
                    columnName: 'name',
                    value: 'name',
                    type: ColumnType.DATA
                },
                {
                    columnName: 'Price',
                    value: 'price',
                    type: ColumnType.DATA
                },
                {
                    columnName: 'Quantity',
                    value: 'quantity',
                    type: ColumnType.DATA
                },
                {
                    columnName: 'Ajouter',
                    valueCb: (data) => '1',
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
            findDataCb: () => this.itemService.findAll(),
            actions: [
                {
                    actionName: "Add to basket",
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
                {
                    actionName: "Edit",
                    actionCb: (item: Entity) =>
                    {
                        console.log(item);
                        this.router.goToRoute(`/items/${item.id}/edit`);
                    },
                    type: ButtonType.SUCCESS
                },
                {
                    actionName: "Info",
                    actionCb: (item: Entity) =>
                    {
                        console.log(item);
                        this.router.goToRoute(`/items/${item.id}`);
                    },
                    type: ButtonType.SUCCESS
                },
            ]
        }
    }

    onDestroy() {
    }
}
