import {AjaxConfig, AjaxResponse} from "rxjs/ajax";

export interface AjaxInterceptor
{
    intercept(config: AjaxConfig): AjaxConfig;
}
