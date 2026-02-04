export class FormControl
{
    private validators?: Array<(value: string) => string|null>;
    public name: string;
    public type: string;
    public value: any;
    public valid: boolean;
    public errors: Array<string>;

    constructor(name: string, value: any, validators?: Array<(value: string) => string|null>) {
        this.name = name;
        this.value = value;
        this.validators = validators;
        this.valid = true;
        this.errors = new Array<string>();
        this.type = 'text';
    }

    onValueChanged(value: any)
    {
        this.value = value;
    }

    validate()
    {
        this.valid = true;
        this.errors = [];

        if(this.validators)
        {
            for(let validator of this.validators)
            {
                let error = validator(this.value);

                if(error)
                {
                    this.valid = false;
                    this.errors.push(error);
                }
            }
        }

        return this.valid;
    }
}

export class FormSubmitControl
{
    public name: string;
    public callback: () => void;

    constructor(name: string, callback: () => void) {
        this.name = name;
        this.callback = callback;
    }
}
