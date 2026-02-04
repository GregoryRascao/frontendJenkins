import {AjaxInterceptor} from "./interceptor";
import {map, Observable} from "rxjs";
import {ajax, AjaxConfig} from "rxjs/ajax";

export class AjaxWrapper<T>
{
    private static interceptors: AjaxInterceptor[] = [];

    public static addInterceptors(interceptor: AjaxInterceptor) {
        AjaxWrapper.interceptors.push(interceptor);
    }

    private static generateConfig(): AjaxConfig
    {
        let config = {} as AjaxConfig;
        config.headers = {};
        config.responseType = 'json';

        for(const interceptor of AjaxWrapper.interceptors)
        {
            config = interceptor.intercept(config);
        }

        return config;
    }

    public static get<T>(url: string): Observable<T>
    {
        console.log("GET", url);
        let config = AjaxWrapper.generateConfig();

        config.method = 'GET';
        config.url = url;
        const http = ajax<T>(config);

        return http.pipe(map((res) => res.response));
    }

    public static post<T>(url: string, body: T): Observable<T>
    {
        console.log("POST", url);
        let config = AjaxWrapper.generateConfig();

        config.method = 'POST'
        config.url = url;
        config.body = body;
        const http = ajax<T>(config);

        return http.pipe(map((res) => res.response));
    }

    public static put<T>(url: string, body: T): Observable<T>
    {
        console.log("PUT", url);
        let config = AjaxWrapper.generateConfig();

        config.method = 'PUT'
        config.url = url;
        config.body = body;
        const http = ajax<T>(config);

        return http.pipe(map((res) => res.response));
    }

    public static delete<T>(url: string): Observable<T>
    {
        console.log("DELETE", url);
        let config = AjaxWrapper.generateConfig();

        config.method = 'DELETE';
        config.url = url;
        const http = ajax<T>(config);

        return http.pipe(map((res) => res.response));
    }
}
