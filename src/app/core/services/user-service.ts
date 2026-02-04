import {User} from "../models/user-model";
import {service} from "../../../framework/services/base-service";
import {HttpService} from "../../../framework/services/http-service";
import {BaseService, CrudConfig} from "./base-service";
import {environement} from "../../../env/environement";

const config: CrudConfig = {
    manyUrl: 'users',
    singleUrl: (id) => `users/${id}`
}

@service()
export class UserService extends BaseService<User>
{
    constructor(protected httpService: HttpService) {
        super(httpService, config);
    }

    register(user: User)
    {
        return this.httpService.post<User>(`${environement.api}users/register`, user);
    }
}
