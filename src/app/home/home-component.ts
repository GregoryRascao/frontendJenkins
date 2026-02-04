import {component, Component} from "../../framework/components/component";


@component({
    name: 'home-component',
    template: 'home-component.html',
})
export class HomeComponent extends Component
{
    testattr?: string;
    testattr2?: { testVar: string };


    constructor() {
        super();
        this.testattr = "HELLO WORLD"
    }

    onInit(): void {
    }

    testClick()
    {
        console.log("TEST CLICK");
    }

    testClick2(val: any)
    {
        console.log("TEST CLICK 2", val);
    }

    asdfCb(a: any, b: any)
    {
        console.log('ASDF CALLBACK', a, b);
    }
}
