import {service, Service} from "./base-service";
import {map, Observable} from "rxjs";
import {AjaxWrapper} from "./ajax-wrapper";

const ajax = AjaxWrapper;

@service()
export class HttpService extends Service
{
    constructor() {
        super();
    }

    public get<T>(url: string): Observable<T>
    {

        return ajax.get<T>(url);
    }

    public post<T>(url: string, data: T): Observable<T>
    {
        return ajax.post<T>(url, data);
    }

    public put<T>(url: string, data: T): Observable<T>
    {
        return ajax.put<T>(url, data);
    }

    public delete<T>(url: string): Observable<T>
    {
        return ajax.delete<T>(url);
    }
}
