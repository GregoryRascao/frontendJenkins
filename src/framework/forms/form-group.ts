import {FormControl} from "./form-control";

export class FormGroup
{
    public controls: { [key: string]: FormControl };
    public valid: boolean;

    constructor(controls: { [key: string]: FormControl }) {
        this.controls = controls;
    }

    validate()
    {
        this.valid = true;

        for(const control in this.controls)
        {
            if(!this.controls[control].validate())
            {
                this.valid = false;
            }
        }

        return this.valid;
    }

    getControl(name: string)
    {
        return this.controls[name];
    }

    getValues()
    {
        let values: any = {};
        for(const control in this.controls)
        {
            values[control] = this.controls[control].value;
        }

        return values;
    }
}
