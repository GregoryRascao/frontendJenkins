import {component, Component} from "../../../framework/components/component";
import {UserService} from "../../core/services/user-service";
import {
    ButtonType,
    ColumnType,
    SortDirection,
    TableConfig
} from "../../core/components/table/table-component/table-component";
import {User} from "../../core/models/user-model";
import {Entity} from "../../core/models/entity-model";
import {Router} from "../../../framework/routing/router";

@component({
    name: 'user-list-component',
    template: 'user-list-component.html',
})
export class UserListComponent extends Component
{
    private test: string;
    tableConfig: TableConfig;
    testattr2: any;
    users: Array<User>;

    constructor(
        private userService: UserService,
        private router: Router,
    ) {
        super();
        this.test = "asdf1234";
        this.testattr2 = { testVar: "test1234" };
    }

    onInit(): void {
        this.tableConfig = {
            sort: {
              sortValueName: 'id',
              direction: SortDirection.ASC
            },
            columns: [
                {
                    columnName: 'Id',
                    value: 'id',
                    type: ColumnType.DATA
                },
                {
                    columnName: 'Username',
                    value: 'username',
                    type: ColumnType.DATA
                },
                {
                    columnName: 'Email',
                    value: 'useremail',
                    type: ColumnType.DATA
                },
                {
                    columnName: 'Description',
                    value: 'userdescription',
                    type: ColumnType.DATA
                },
                {
                    columnName: 'Actions',
                    type: ColumnType.ACTIONS
                },
            ],
            findDataCb: () => this.userService.findAll(),
            actions: [
                {
                    actionName: "Edit",
                    actionCb: (user: Entity) =>
                    {
                        console.log(user);
                        this.router.goToRoute(`/users/${user.id}/edit`);
                    },
                    type: ButtonType.SUCCESS
                },
                {
                    actionName: "Info",
                    actionCb: (user: Entity) =>
                    {
                        console.log(user);
                        this.router.goToRoute(`/users/${user.id}`);
                    },
                    type: ButtonType.SUCCESS
                },
            ]
        }
    }

    onDestroy() {
    }
}
