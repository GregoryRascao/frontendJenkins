import {Component, component} from "../../../framework/components/component";
import {ItemService} from "../../core/services/item-service";
import {Router} from "../../../framework/routing/router";
import {ActivatedRoute} from "../../../framework/routing/activated-route";
import {Item} from "../../core/models/item-model";

@component({
    name: 'item-view-component',
    template: 'item-view-component.html',
})
export class ItemViewComponent extends Component {
    item: Item;

    constructor(
        private itemService: ItemService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) {
        super();
    }

    onInit() {
        const id = parseInt(this.activatedRoute.getParameter('id'));

        if(!isNaN(id))
        {
            this.itemService.findOne(id)
                .subscribe((item) =>
                {
                    this.item = item;
                })
        }
    }
}
