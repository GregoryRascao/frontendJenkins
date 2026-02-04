import {AjaxInterceptor} from "../../../framework/services/interceptor";
import {AjaxConfig} from "rxjs/ajax";

export class JwtInterceptor implements AjaxInterceptor
{
    constructor(private tokenGetter: () => string | null) {
    }

    intercept(config: AjaxConfig): AjaxConfig {
        const token = this.tokenGetter();

        if(token)
        {
            // @ts-ignore
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    }
}
