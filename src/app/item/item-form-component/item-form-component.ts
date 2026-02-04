import {component, Component} from "../../../framework/components/component";
import {ItemService} from "../../core/services/item-service";
import {Router} from "../../../framework/routing/router";
import {FormControl, FormSubmitControl} from "../../../framework/forms/form-control";
import {FormGroup} from "../../../framework/forms/form-group";
import {Item} from "../../core/models/item-model";
import {Validators} from "../../../framework/forms/validators/validators";
import {ActivatedRoute} from "../../../framework/routing/activated-route";

@component({
    name: 'item-form-component',
    template: 'item-form-component.html',
})
export class ItemFormComponent extends Component {
    namectl: FormControl;
    pricectl: FormControl;
    quantityctl: FormControl;
    descriptionctl: FormControl;
    submitctl: FormSubmitControl;
    formGroup: FormGroup;
    item: Item;

    constructor(
        private itemService: ItemService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) {
        super();
    }
    
    onInit() {
        this.namectl = new FormControl("name",null, [Validators.required()]);
        this.pricectl = new FormControl("price", null, [Validators.required()]);
        this.quantityctl = new FormControl("quantity", null, [Validators.required()]);
        this.descriptionctl = new FormControl("description", null, [Validators.required()]);

        this.formGroup = new FormGroup({
            name: this.namectl,
            price: this.pricectl,
            quantity: this.quantityctl,
            description: this.descriptionctl,
        });

        this.submitctl = new FormSubmitControl('submit', () =>
        {
            this.submit();
        })

        const id = parseInt(this.activatedRoute.getParameter('id'));

        this.item = {} as Item;

        if(!isNaN(id))
        {
            this.itemService.findOne(id)
                .subscribe((item) =>
                {
                    this.item = item;
                    this.namectl.value = item.name;
                    this.pricectl.value = item.price;
                    this.quantityctl.value = item.quantity;
                    this.descriptionctl.value = item.description;
                });
        }
    }

    submit()
    {
        if(!this.formGroup.validate())
        {
            return;
        }

        this.item.name = this.namectl.value;
        this.item.price = this.pricectl.value;
        this.item.quantity = this.quantityctl.value;
        this.item.description = this.descriptionctl.value;

        if(this.item.id)
        {
            this.itemService.update(this.item.id, this.item)
                .subscribe((item) =>
                {
                    console.log(item);
                    this.router.goToRoute('/items');
                })
        } else
        {
            this.itemService.insert(this.item)
                .subscribe((item) =>
                {
                    this.router.goToRoute('/items');
                })
        }
    }
}
