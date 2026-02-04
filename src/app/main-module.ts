import {IModule, module, Module} from "../framework/module/module";
import {routes} from "./main-router";
import {Provider} from "../framework/services/service-injector";
import {NavBarComponent} from "./core/components/navbar/navbar-component/navbar-component";
import {HomeComponent} from "./home/home-component";
import {UserListComponent} from "./user/user-list-component/user-list-component";
import {UserService} from "./core/services/user-service";
import {TableComponent} from "./core/components/table/table-component/table-component";
import {TableItemComponent} from "./core/components/table/table-item-component/table-item-component";
import {HttpService} from "../framework/services/http-service";
import {UserViewComponent} from "./user/user-view-component/user-view-component";
import {UserFormComponent} from "./user/user-form-component/user-form-component";
import {BasketService} from "./core/services/basket-service";
import {ItemService} from "./core/services/item-service";
import {AuthService} from "./core/services/auth-service";
import {LoginComponent} from "./user/login-component/login-component";
import {JwtInterceptor} from "./core/interceptors/JwtInterceptor";
import {BasketComponent} from "./item/basket-component/basket-component";

function getToken()
{
    return sessionStorage.getItem('token');
}

@module({
    declarers: [
        { component: NavBarComponent },
        { component: HomeComponent },
        { component: UserListComponent },
        { component: UserViewComponent },
        { component: UserFormComponent },
        { component: TableComponent },
        { component: TableItemComponent },
        { component: LoginComponent },
        { component: BasketComponent },
    ],
    providers: [
        { service: HttpService },
        { service: UserService },
        { service: BasketService },
        { service: ItemService },
        { service: AuthService },
        { interceptor: new JwtInterceptor(getToken) },
    ],
    routes: routes
})
export class MainModule extends Module
{}
