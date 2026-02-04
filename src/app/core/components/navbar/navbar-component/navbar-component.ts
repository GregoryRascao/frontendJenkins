/*
 *   Copyright (c) 2023 
 *   All rights reserved.
 */
import {component, Component} from "../../../../../framework/components/component";
import {NavbarConfig, navbarConfig} from "../menu-provider";
import {NavbarItemGroupComponent} from "../navbar-item-group/navbar-item-group-component";
import {NavbarItemComponent} from "../navbar-item-component/navbar-item-component";
import {User} from "../../../models/user-model";
import {Subscription} from "rxjs";
import {AuthService} from "../../../services/auth-service";

@component({
    name: 'navbar-component',
    template: 'navbar-component.html',
})
export class NavBarComponent extends Component
{
    private container?: HTMLElement;
    private collapsable?: HTMLElement;
    private config: NavbarConfig;
    private user: User;
    private authSubscription: Subscription;

    constructor(
        private authService: AuthService
    ) {
        super();
        this.config = navbarConfig;
    }
}
