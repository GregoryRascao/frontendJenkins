import {Component, component} from "../../../framework/components/component";
import {UserService} from "../../core/services/user-service";
import {Router} from "../../../framework/routing/router";
import {ActivatedRoute} from "../../../framework/routing/activated-route";
import {FormControl, FormSubmitControl} from "../../../framework/forms/form-control";
import {Validators} from "../../../framework/forms/validators/validators";
import {FormGroup} from "../../../framework/forms/form-group";
import {User} from "../../core/models/user-model";

@component({
    name: 'user-form-component',
    template: 'user-form-component.html',
})
export class UserFormComponent extends Component {
    usernamectl: FormControl;
    useremailctl: FormControl;
    userpasswordctl: FormControl;
    userdescriptionctl: FormControl;
    submitctl: FormSubmitControl;
    formGroup: FormGroup;
    user: User;

    constructor(
        private userService: UserService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) {
        super();
    }

    onInit() {
        this.usernamectl = new FormControl("username",null, [Validators.required()]);
        this.useremailctl = new FormControl("email", null, [Validators.required()]);
        this.userpasswordctl = new FormControl("password", null, [Validators.required()]);
        this.userdescriptionctl = new FormControl("description", null, [Validators.required()]);

        this.formGroup = new FormGroup({
            username: this.usernamectl,
            password: this.userpasswordctl,
            email: this.useremailctl,
            description: this.userdescriptionctl,
        });

        this.submitctl = new FormSubmitControl('submit', () =>
        {
            this.submit();
        })

        const id = parseInt(this.activatedRoute.getParameter('id'));

        this.user = {} as User;

        if(!isNaN(id))
        {
            this.userService.findOne(id)
                .subscribe((user) =>
                {
                    this.user = user;
                    this.usernamectl.value = user.username;
                    this.useremailctl.value = user.useremail;
                    this.userdescriptionctl.value = user.userdescription;
                });
        }
    }

    submit()
    {
        if(!this.formGroup.validate())
        {
            return;
        }

        this.user.username = this.usernamectl.value;
        this.user.useremail = this.useremailctl.value;
        this.user.userpassword = this.userpasswordctl.value;
        this.user.userdescription = this.userdescriptionctl.value;

        if(this.user.id)
        {
            this.userService.update(this.user.id, this.user)
                .subscribe((user) =>
                {
                    console.log(user);
                    this.router.goToRoute('/users');
                })
        } else
        {
            this.userService.register(this.user)
                .subscribe((user) =>
                {
                    this.router.goToRoute('/users');
                })
        }
    }
}
