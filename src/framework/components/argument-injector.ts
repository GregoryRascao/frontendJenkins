export class ArgumentInjector
{
    private static objectMap: Map<string, object> = new Map<string, object>();
    private static functionMap: Map<string, Function> = new Map<string, Function>();

    static registerObject(object: object)
    {
        // @ts-ignore
        if(!object.objectHashCode)
        {
            // TODO add random number before and after generatedHashcode.
            // @ts-ignore
            object.objectHashCode = `object:0x${ArgumentInjector.generateHashCode(object).toString(16)}-${Math.floor(Math.random() * 10000)}-${Date.now()}`;
            // @ts-ignore
            object.objectReferences = 0;
        }

        // @ts-ignore
        ArgumentInjector.objectMap.set(object.objectHashCode, object);

        // @ts-ignore
        return object.objectHashCode;
    }

    static unregisterObject(objectUidHash: string)
    {
        let obj = ArgumentInjector.objectMap.get(objectUidHash);

        if(obj) {
            // @ts-ignore
            obj.objectReferences -= 1;
            
            // @ts-ignore
            if(obj.objectReferences <= 0)
            {
                // @ts-ignore
                obj.objectReferences = 0;

                /**
                 * if object is to be deleted
                 * wait 10 sec and recheck that it is not used by a new component.
                 * if it is not in use then delete the object from the map.
                 */
                setTimeout(() =>
                {
                    // @ts-ignore
                    if(obj.objectReferences <= 0)
                    {
                        // @ts-ignore
                        obj.objectHashCode = null;
                        ArgumentInjector.objectMap.delete(objectUidHash);
                    }
                }, 10000)
            }
        }
    }

    static registerFunction(fct: Function)
    {
        const fctHash = `function:0x${(Math.floor(Math.random() * 10000) + Date.now()).toString(16)}-${Math.floor(Math.random() * 10000)}-${Date.now()}`;

        ArgumentInjector.functionMap.set(fctHash, fct);

        return fctHash;
    }

    static unregisterFunction(hash: string)
    {
        ArgumentInjector.functionMap.delete(hash);
    }

    static getObject(hashCode: string)
    {
        const obj = ArgumentInjector.objectMap.get(hashCode);
        // @ts-ignore
        obj.objectReferences += 1;
        return obj;
    }

    private static generateHashCode(object: object): number{
        const jsonString = JSON.stringify(object);
        let hash = 0;
        for (let i = 0; i < jsonString.length; i++) {
            let code = jsonString.charCodeAt(i);
            hash = ((hash<<5)-hash)+code;
            // hash = hash & hash;
        }
        return hash>>>0;
    }
}
