import {Entity} from "./entity-model";
import {Role} from "./role-model";

export interface User extends Entity
{
    username: string;
    userpassword: string;
    useremail: string;
    userdescription: string;
    userroles: Array<Role>;
}
