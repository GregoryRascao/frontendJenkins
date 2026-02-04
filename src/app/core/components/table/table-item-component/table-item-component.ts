import {component, Component} from "../../../../../framework/components/component";
import {ButtonType, ColumnConfig, ColumnType, RowAction} from "../table-component/table-component";
import {FormControl, FormSubmitControl} from "../../../../../framework/forms/form-control";
import {FormGroup} from "../../../../../framework/forms/form-group";
import {Entity} from "../../../models/entity-model";

@component({
    name: 'table-item-component',
    template: 'table-item-component.html',
    extends: 'td'
})
export class TableItemComponent extends Component
{
    element: any;
    colValue: string;
    column: ColumnConfig;
    actions?: Array<RowAction>;
    formgroup: FormGroup;
    inputCtr: FormControl;
    controls: FormSubmitControl[];
    columnType = ColumnType;

    constructor() {
        super();
        this.colValue = '';
        this.controls = [];
    }

    onInit() {
        this.processColumnData();
        
        switch (this.column.type)
        {
            case ColumnType.DATA:
                break;
            case ColumnType.ACTIONS:
                this.processColumnAction();
                break;
            case ColumnType.FORM:
                this.processColumnForm();
                break;
        }
    }

    private processColumnData()
    {
        if(this.element)
        {
            if(this.column.value)
            {
                this.colValue = this.procesRowValue(this.element, this.column.value);
            } else if(this.column.valueCb)
            {
                this.colValue = this.column.valueCb(this.element);
            }
        }
    }

    private processColumnAction()
    {
        if(!this.actions)
        {
            return;
        }

        for(const action of this.actions)
        {
            let control = new FormSubmitControl(action.actionName, () => {
                let value = this.element;
                if(action.type === ButtonType.SUBMIT)
                {
                    if(this.formgroup.validate())
                    {
                        value = this.formgroup.getValues() as Entity;
                        value.id = this.element.id;
                    }
                }
                action.actionCb(value)
            });
            this.controls.push(control);
        }
    }

    private processColumnForm()
    {
        if(!this.formgroup || !this.column.formName)
        {
            return;
        }

        this.inputCtr = this.formgroup.getControl(this.column.formName);

        if(this.inputCtr && this.colValue)
        {
            this.inputCtr.value = this.colValue;
        }
    }

    private procesRowValue (row: any, value: string)
    {
        if(value.indexOf('.') !== -1)
        {
            let objMemberName = value.split('.');
            const len = objMemberName.length - 1;
            for(let i = 0; i < len; i++)
            {
                row = this.procesRowValue(row, objMemberName[i]);
            }
            return row[objMemberName[len]];
        }

        return row[value];
    }
}
