export class Injectable
{

}

export class Service
{
    constructor() {
    }
}

export function service()
{
    return function _DecoratorName<T extends {new(...args: any[]): Service}>(constr: T): T {
        return constr;
    }
}
