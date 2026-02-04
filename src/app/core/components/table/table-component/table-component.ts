import {Entity} from "../../../models/entity-model";
import {component, Component} from "../../../../../framework/components/component";
import {Observable} from "rxjs";
import {FormGroup} from "../../../../../framework/forms/form-group";
import {FormControl} from "../../../../../framework/forms/form-control";

@component({
    name: 'table-component',
    template: 'table-component.html',
})
export class TableComponent extends Component
{
    data: TableData[];
    formGroup: FormGroup;

    constructor(private config: TableConfig) {
        super();
    }

    onInit() {
        this.refreshData();
    }

    private refreshData()
    {
        this.config.findDataCb()
            .subscribe((data) =>
            {
                if(!data)
                {
                    return;
                }

                if(this.config.sort)
                {
                    const sortData = this.config.sort;
                    data.sort((a, b) =>
                    {
                        if(sortData.direction === SortDirection.ASC)
                        {
                            return a[sortData.sortValueName] - b[sortData.sortValueName];
                        }
                        return b[sortData.sortValueName] - a[sortData.sortValueName];
                    })
                }
                this.data = data.map((row) => {
                        return { row: row } as TableData;
                    }
                );
                this.manageForm();
            }
        );
    }

    private manageForm()
    {
        if(this.config.form)
        {
            for(let data of this.data)
            {
                let formCtls: { [key: string]: FormControl } = {};

                for(const field of this.config.form.formFields)
                {
                    let ctl = new FormControl(field.fieldName, null, field.validators);
                    ctl.type = field.fieldType;
                    formCtls[field.fieldName] = ctl;
                }

                // TODO FormGroup.addControl(ctrl); instead of passing controls in the constructor.
                data.formGroup = new FormGroup(formCtls);
            }
        }
    }
}

interface TableData
{
    row: any;
    formGroup?: FormGroup;
}

export interface TableConfig
{
    columns: Array<ColumnConfig>;
    actions: Array<RowAction>;
    findDataCb: () => Observable<any[]>;
    sort?: SortConfig;
    form?: FormConfig;
}

interface SortConfig
{
    sortValueName: string;
    direction: SortDirection;
}

export enum SortDirection
{
    ASC,
    DESC
}

export interface ColumnConfig
{
    columnName: string;
    value?: string;
    valueCb?: (data: Entity) => string;
    formName?: string;
    type: ColumnType;
    actions?: Array<RowAction>;
}

interface FormConfig
{
    formName: string;
    formFields: Array<FormFieldConfig>;
    formSubmit: (event: any) => void
    formReset?: (event: any) => void
}

interface FormFieldConfig
{
    fieldName: string;
    fieldType: string;
    validators: Array<(value: string) => string|null>;
}

export interface RowAction
{
    actionName: string;
    actionCb: (data: Entity) => any;
    type: ButtonType;
}

export enum ColumnType
{
    DATA = 0,
    ACTIONS = 1,
    FORM = 2,
}

export enum ButtonType
{
    SUCCESS = 0,
    WARNING = 1,
    DANGER = 2,
    SUBMIT = 3,
}
