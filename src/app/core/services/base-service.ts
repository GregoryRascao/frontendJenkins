import {HttpService} from "../../../framework/services/http-service";
import {Service} from "../../../framework/services/base-service";
import {Observable} from "rxjs";
import {environement} from "../../../env/environement";

export interface CrudConfig
{
    manyUrl: string;
    singleUrl: (id: number) => string;
}

export abstract class BaseService<T> extends Service
{
    constructor(protected httpService: HttpService, protected config: CrudConfig) {
        super();
    }

    findAll(): Observable<Array<T>>
    {
        return this.httpService.get<Array<T>>(environement.api + this.config.manyUrl);
    }

    findOne(id: number): Observable<T>
    {
        return this.httpService.get<T>(environement.api + this.config.singleUrl(id));
    }

    insert(data: T): Observable<T>
    {
        return this.httpService.post<T>(environement.api + this.config.manyUrl, data);
    }

    update(id: number, data: T): Observable<T>
    {
        return this.httpService.put<T>(environement.api + this.config.singleUrl(id), data);
    }

    delete(id: number): Observable<T>
    {
        return this.httpService.delete<T>(environement.api + this.config.singleUrl(id));
    }

}
