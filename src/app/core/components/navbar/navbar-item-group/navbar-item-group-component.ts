import {component, Component} from "../../../../../framework/components/component";
import {NavbarGroupConfig, NavbarItemConfig, NavbarPrivilege} from "../menu-provider";
import {Subscription} from "rxjs";
import {AuthService} from "../../../services/auth-service";
import {User} from "../../../models/user-model";

export enum NavbarGroupSide {
    LEFT = 0,
    RIGHT = 1
}

@component({
    name: 'navbar-item-group-component',
    template: 'navbar-item-group-component.html',
    extends: 'ul'
})
export class NavbarItemGroupComponent extends Component
{
    group: NavbarGroupConfig;
    private items: Array<NavbarItemConfig>;
    private originalItems: Array<NavbarItemConfig>;
    private authSubscription: Subscription;
    private user: User|null;

    constructor(
        private authService: AuthService
    ) {
        super();
    }

    onInit() {
        this.user = this.authService.getUser();
        this.originalItems = this.group.items;
        this.authSubscription = this.authService
            .authStatusChanged
            .subscribe((user) =>
            {
                this.user = user;
                this.processItems();
            });

        this.processItems();
    }

    onDestroy() {
        this.authSubscription.unsubscribe();
    }

    private processItems()
    {
        this.items = [];
        for(let item of this.originalItems)
        {
            switch(item.privileges)
            {
                case NavbarPrivilege.AUTH:
                case NavbarPrivilege.ADMIN:
                    if(this.user)
                    {
                        this.items.push(item);
                    }
                    break;
                case NavbarPrivilege.DISCONECTED:
                    if(!this.user)
                    {
                        this.items.push(item);
                    }
                    break;
                case NavbarPrivilege.NONE:
                    this.items.push(item);
                    break;
            }
        }
    }
}
