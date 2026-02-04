import {ServiceInjector} from "../services/service-injector";
import {ArgumentInjector} from "./argument-injector";
import {ElementEvent, TemplateProcessor} from "./template-processor";
import {balrog} from "../../index";
import {FormControl, FormSubmitControl} from "../forms/form-control";
import disconnected from 'disconnected';

const observe = disconnected({Event, WeakSet});

export interface Declarer
{
    component: any;
}

export abstract class Component
{
    tagName: string;


    constructor() {
    }

    onInit(): void
    {}

    onChange(): void
    {}

    onDestroy(): void
    {}
}

export interface EventConfig
{
    id: string;
    eventType: string;
    eventCb: (event: any) => void;
}

export interface ComponentConfig
{
    name: string;
    template: string;
    dirname?: string;
    extends?: string;
}

export function component(config: ComponentConfig) {
    return function _ComponentWrapper<T extends {new(...args: any[]): Component}>(constr: T): T {
        let resolve = class EmbeddedComponent extends constr {
            constructor(...args: any[]) {
                super(...args);
                // this.onInit(); initialization insde embedded component.
                this.tagName = config.name;
            }
        };

        if(customElements.get(config.name) === undefined)
        {
            if(config.dirname)
            {
                // preload file in debug mode.
                fetch(`${config.dirname}/${config.template}`)
                    .then((res) =>
                    {
                        res.text().then((text) =>
                        {
                            config.template = text;
                        })
                    });
            }

            const extension = getHtmlElementType(config.extends);
            const tmpClass = class HtmlComponentWrapper extends extension {
                component: Component;
                // @deprecated
                // static htmlTemplateFile: string;
                htmlFile: string;
                initialized: boolean;
                private objectSet: Set<string>;

                constructor() {
                    super();
                    this.objectSet = new Set<string>();
                    this.initialized = false;
                    const htmlELement = this;
                    this.component = new Proxy(ServiceInjector.resolve(constr),
                        {
                            set(target: Component, p: string | symbol, value: any, receiver: any): boolean {
                                if(htmlELement.initialized)
                                {
                                    setTimeout(() =>
                                    {
                                        htmlELement.getHtmlElement();
                                    }, 5);
                                }

                                return Reflect.set(target, p, value, receiver);
                            }
                        });
                    this.htmlFile = '';

                    for (const attr of this.attributes) {
                        // @ts-ignore
                        this.component[attr.name] = this.__getAttributeValue(attr.value);
                    }

                    // Initialize component.
                    this.component.onInit();

                    if(/^.*\.html$/.test(config.template))
                    {
                        // load file in debug mode (should already be loaded but if it is not we load it here).
                        fetch(`${config.dirname}/${config.template}`)
                            .then((res) =>
                            {
                                res.text().then((text) =>
                                {
                                    config.template = text;

                                    this.getHtmlElement();
                                })
                            }).catch((err) =>
                            {
                                this.getHtmlElement();
                            });
                    } else
                    {
                        // use timeout so the customComponent is constructed before parsing.
                        // else it would crash while constructing the element as it should not have children.
                        setTimeout(() =>
                        {
                            this.getHtmlElement();
                        }, 1);
                    }

                    // observe to know when the object is destroyed.
                    observe(this);
                    this.addEventListener('disconnected', () => {
                        this.component.onDestroy();
                        this.objectSet.forEach((objUid) => {
                            ArgumentInjector.unregisterObject(objUid)
                        });
                    });
                }

                private __getAttributeValue(value: string)
                {
                    if(value.indexOf('object:0x') !== -1)
                    {
                        this.objectSet.add(value);
                        return ArgumentInjector.getObject(value);
                    }
                    return value;
                }

                public getHtmlElement()
                {
                    this.htmlFile = config.template;

                    const processedTemplate = TemplateProcessor.processTemplate(this.htmlFile, this.component);
                    this.innerHTML = processedTemplate.template;
                    this.initialized = true;

                    this.__processRoutes();
                    this.__processFormControls();
                    this.__injectEventFunctions(processedTemplate.events);
                }

                private __processRoutes()
                {
                    const routerElements = this.querySelectorAll('[blroute]');
                    for(const rElem of routerElements)
                    {
                        const route = rElem.attributes.getNamedItem('blroute');
                        if(route)
                        {
                            rElem.addEventListener('click', (event) =>
                            {
                                event.preventDefault();
                                // RoutingListener.triggerRouteChange(route.value);
                                balrog.router.goToRoute(route.value);
                            });
                        }
                    }
                }

                private __processFormControls()
                {
                    const controlElements = this.querySelectorAll('[control]');
                    for(let control of controlElements)
                    {
                        const ctrlAttr = control.attributes.getNamedItem('control');
                        const typeAttr = control.attributes.getNamedItem('type');
                        if(ctrlAttr)
                        {
                            const formCtrl = this.__getAttributeValue(ctrlAttr.value);

                            if(formCtrl)
                            {
                                if(formCtrl instanceof FormControl)
                                {
                                    // @ts-ignore
                                    control.value = formCtrl.value;
                                    control.addEventListener('change', (event) =>
                                    {
                                        // @ts-ignore
                                        formCtrl.onValueChanged(control.value);
                                    });
                                    // TODO try to understand why *blfor loop does not return obj instance.
                                } else if(formCtrl instanceof FormSubmitControl ||
                                    (typeAttr && typeAttr.value === 'submit'))
                                {
                                    // @ts-ignore
                                    control.value = formCtrl.name;
                                    control.addEventListener('click', (event) =>
                                    {
                                        event.preventDefault();
                                        // @ts-ignore
                                        formCtrl.callback();
                                    })
                                }
                            }
                        }
                    }
                }


                private __injectEventFunctions(events: ElementEvent[])
                {
                    for(const event of events)
                    {
                        if(!event.treated)
                        {
                            continue;
                        }

                        const eventELement = this.querySelector(`[bl-${event.eventId}]`);

                        if(eventELement)
                        {
                            eventELement.addEventListener(event.eventName, (e) =>
                            {
                                if(e.preventDefault)
                                {
                                    e.preventDefault();
                                }

                                event.eventCb();
                            })
                        }
                    }
                }
            };
            // @ts-ignore
            customElements.define(config.name, tmpClass, config.extends ? { extends: config.extends } : null);
        }

        return resolve;
    }
}

function getHtmlElementType(elementExtended?: string)
{
    switch(elementExtended)
    {
        case 'ul':
            return HTMLUListElement;
        case 'li':
            return HTMLLIElement;
        case 'tr':
            return HTMLTableRowElement;
        case 'td':
            return HTMLTableCellElement;
        default:
            return HTMLElement;
    }
}

interface ElementCondition
{
    hasCondition: boolean;
    conditionType?: ConditionType;
    showElement: boolean;
    statement?: string;
}

enum ConditionType
{
    IF  = 0,
    FOR = 1,
}
