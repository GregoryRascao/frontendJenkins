import {Route} from "../framework/routing/balrog-router";
import {HomeComponent} from "./home/home-component";
import {UserListComponent} from "./user/user-list-component/user-list-component";
import {UserViewComponent} from "./user/user-view-component/user-view-component";
import {UserFormComponent} from "./user/user-form-component/user-form-component";
import {ItemListComponent} from "./item/item-list-component/item-list-component";
import {ItemFormComponent} from "./item/item-form-component/item-form-component";
import {ItemViewComponent} from "./item/item-view-component/item-view-component";
import {LoginComponent} from "./user/login-component/login-component";
import {BasketComponent} from "./item/basket-component/basket-component";

export const routes: Route[] = [

    //------------------------------------------------------------------------
    // HOME
    //------------------------------------------------------------------------
    { name: "/", component: HomeComponent },
    { name: "/login", component: LoginComponent },

    //------------------------------------------------------------------------
    // USERS
    //------------------------------------------------------------------------
    { name: "/users", component: UserListComponent },
    { name: "/users/:id", component: UserViewComponent },
    { name: "/users/:id/edit", component: UserFormComponent },
    { name: "/users/add", component: UserFormComponent },
    { name: "/basket", component: BasketComponent },

    //------------------------------------------------------------------------
    // ITEMS
    //------------------------------------------------------------------------
    { name: "/items", component: ItemListComponent },
    { name: "/items/:id", component: ItemViewComponent },
    { name: "/items/:id/edit", component: ItemFormComponent },
    { name: "/items/add", component: ItemFormComponent },
]
