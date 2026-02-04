import {NavbarGroupSide} from "./navbar-item-group/navbar-item-group-component";
import {NavbarItemType} from "./navbar-item-component/navbar-item-component";
import {ServiceInjector} from "../../../../framework/services/service-injector";
import {AuthService} from "../../services/auth-service";

export enum NavbarPrivilege
{
    NONE = 0,
    DISCONECTED = 1,
    AUTH = 2,
    ADMIN =3,
}

export const navbarConfig: NavbarConfig =
{
    name: 'Balrog Demo',
    itemGroups: [
        {
            groupSide: NavbarGroupSide.LEFT,
            items: [
                {
                    value: 'Home',
                    route: '/',
                    itemType: NavbarItemType.BUTTON,
                    privileges: NavbarPrivilege.NONE
                },
                {
                    value: 'Shop',
                    route: '/items',
                    itemType: NavbarItemType.BUTTON,
                    privileges: NavbarPrivilege.NONE
                },
            ]
        },
        {
            groupSide: NavbarGroupSide.RIGHT,
            items: [
                {
                    value: 'Basket',
                    route: '/basket',
                    itemType: NavbarItemType.BUTTON,
                    privileges: NavbarPrivilege.AUTH,
                },
                {
                    value: 'Users',
                    route: '/users',
                    itemType: NavbarItemType.BUTTON,
                    privileges: NavbarPrivilege.AUTH,
                },
                {
                    value: 'Logout',
                    callback: () => {
                        ServiceInjector.resolve(AuthService).logout()
                    },
                    itemType: NavbarItemType.BUTTON,
                    privileges: NavbarPrivilege.AUTH,
                },
                {
                    value: 'Login',
                    route: '/login',
                    itemType: NavbarItemType.BUTTON,
                    privileges: NavbarPrivilege.DISCONECTED
                },
            ]
        },
    ]
}

export interface NavbarConfig
{
    name: string;
    itemGroups: Array<NavbarGroupConfig>;
}

export interface NavbarGroupConfig
{
    groupSide: NavbarGroupSide;
    items: Array<NavbarItemConfig>;
}

export interface NavbarItemConfig
{
    value: string;
    route?: string;
    itemType: NavbarItemType;
    privileges?:NavbarPrivilege;
    callback?: () => void;
}

interface NavbarItemForm
{
    method: string;
    fields: Array<string>; // TODO replace by fieldType
}
