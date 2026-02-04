import {Component, component} from "../../../framework/components/component";
import {UserService} from "../../core/services/user-service";
import {Router} from "../../../framework/routing/router";
import {ActivatedRoute} from "../../../framework/routing/activated-route";
import {User} from "../../core/models/user-model";

@component({
    name: 'user-view-component',
    template: 'user-view-component.html',
})
export class UserViewComponent extends Component {
    user: User;

    constructor(
        private userService: UserService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) {
        super();
    }

    onInit() {
        const id = parseInt(this.activatedRoute.getParameter('id'));

        if(!isNaN(id))
        {
            this.userService.findOne(id)
                .subscribe((user) =>
                {
                    this.user = user;
                })
        }
    }
}
