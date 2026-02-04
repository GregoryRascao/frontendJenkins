import {Component, component} from "../../../framework/components/component";
import {Router} from "../../../framework/routing/router";
import {FormControl, FormSubmitControl} from "../../../framework/forms/form-control";
import {Validators} from "../../../framework/forms/validators/validators";
import {FormGroup} from "../../../framework/forms/form-group";
import {User} from "../../core/models/user-model";
import {AuthService} from "../../core/services/auth-service";

@component({
    name: 'login-component',
    template: 'login-component.html',
})
export class LoginComponent extends Component {
    usernamectl: FormControl;
    userpasswordctl: FormControl;
    submitctl: FormSubmitControl;
    formGroup: FormGroup;
    user: User;

    constructor(
        private authService: AuthService,
        private router: Router,
    ) {
        super();
    }

    onInit() {
        this.usernamectl = new FormControl("username",null, [Validators.required()]);
        this.userpasswordctl = new FormControl("password", null, [Validators.required()]);

        this.formGroup = new FormGroup({
            username: this.usernamectl,
            password: this.userpasswordctl,
        });

        this.submitctl = new FormSubmitControl('submit', () =>
        {
            this.submit();
        });
    }

    submit()
    {
        if(!this.formGroup.validate())
        {
            return;
        }
         let user = {} as User;
        user.username = this.usernamectl.value;
        user.userpassword = this.userpasswordctl.value;


        this.authService.login(user)
            .subscribe((user) =>
            {
                console.log("Welcome to Balrog!");
                this.router.goToRoute('/users');
            })
    }
}
