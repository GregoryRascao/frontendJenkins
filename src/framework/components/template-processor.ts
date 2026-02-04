import {ArgumentInjector} from "./argument-injector";
import {contains} from "jquery";

export class TemplateProcessor
{
    public static processTemplate(template: string, valueContainer: any)
    {
        let subTemplate = template;
        let parents = Array<Element>();
        let parent = null;
        let events = [] as ElementEvent[];

        do
        {
            parent = TemplateProcessor.__getParentsAndChildrenElement(subTemplate, events);
            if(parent.indexEnd)
            {
                parents.push(parent);
                subTemplate = subTemplate.substring(parent.indexEnd);
            }
        } while (parent.hasValue);

        const newTemplate = TemplateProcessor.__processTemplateWithElements(template, parents, valueContainer, events);

        return { template: newTemplate, events: events };
    }

    private static __getParentsAndChildrenElement(template: string, events: ElementEvent[], closingTagName?: string)
    {
        const parentOpenTag = TemplateProcessor.__extractFirstElementAndIndex(/<[a-z0-9]+(-[a-z0-9]+)*[^>]*>/gm, template);

        let subTemplate = template;
        let retVal = {} as Element;
        retVal.hasValue = false;
        retVal.children = new Array<Element>();

        if(parentOpenTag.element)
        {
            const parentTag = parentOpenTag.element;
            const tagIndex = parentOpenTag.index;
            const parentTagName = TemplateProcessor.__extractTagName(parentTag);
            retVal.indexEnd = tagIndex + parentTag.length;
            closingTagName = closingTagName ? closingTagName : parentTagName;

            const autoClosing = parentTag.substring(parentTag.length - 2, parentTag.length - 1) === '/';

            subTemplate = template.substring(tagIndex + parentTag.length);
            if(!autoClosing)
            {
                while(!retVal.hasValue)
                {
                    const firstChild = TemplateProcessor
                        .__extractFirstElementAndIndex(new RegExp(`<[a-z]+(-[a-z]+)*[^>]+>(.|\\n)*?(?=<\\/${closingTagName}>)`, 'g'), subTemplate);
                    const closingTag = TemplateProcessor
                        .__extractFirstElementAndIndex(new RegExp(`<\\/${closingTagName}>`, 'gm'), subTemplate);

                    // if has children, then fetch children and grand children
                    if(firstChild.element !== '' && closingTagName && (closingTag.index > firstChild.index))
                    {
                        const firstChildTagName = TemplateProcessor.__extractTagName(firstChild.element);
                        const child = TemplateProcessor
                            .__getParentsAndChildrenElement(subTemplate, events, `${firstChildTagName}`);
                        retVal.children.push(child);
                        // child.parent = retVal;
                        retVal.indexEnd += child.indexEnd;
                        subTemplate = subTemplate.substring(child.indexEnd);
                    } else // if no child and not auto closing then fetch closing tag
                    {
                        retVal.innerHTML = template.substring(tagIndex + parentTag.length, retVal.indexEnd + closingTag.index);
                        retVal.tag = parentTag;
                        retVal.attributes = retVal.tag.match(/\[?\*?[a-zA-Z0-9_]+\]?="[^"]+"/g);
                        retVal.outerHTML = retVal.tag + retVal.innerHTML + `</${closingTagName}>`;
                        retVal.indexStart = tagIndex;
                        retVal.indexEnd += closingTag.index + closingTag.element.length;
                        retVal.hasValue = true;
                    }
                }
            } else
            {
                retVal.tag = parentTag;
                retVal.attributes = retVal.tag.match(/\[?\*?[a-zA-Z0-9_]+\]?="[^"]+"/g);
                retVal.outerHTML = parentTag;
                retVal.innerHTML = '';
                retVal.indexStart = tagIndex;
                retVal.indexEnd = tagIndex + parentTag.length;
            }
        }
        if(retVal.tag)
        {
            retVal.events = TemplateProcessor.__extractEventCallback(retVal.tag);
        }

        return retVal;
    }

    private static __extractFirstElementAndIndex(re: RegExp, template: string)
    {
        const extracted = re.exec(template);
        if(extracted)
        {
            return { element: extracted[0], index: extracted.index };
        }
        return { element: '', index: -1 }
    }

    private static __extractTagName(htmlTag: string)
    {
        const tagNameExtractRe = /<([a-z0-9]+(-[a-z0-9]+)*) ?[^>]*>/
        const tagName = tagNameExtractRe.exec(htmlTag);

        if(tagName)
        {
            // return first capture group;
            return tagName[1];
        }

        return undefined;
    }

    private static __extractEventCallback(htmlTag: string)
    {
        const eventExtractRe = /(\([a-zA-Z0-9]+\)=(?:"|')[a-zA-Z]+(\.?[a-zA-Z0-9]+)*\([^)]*\)(?:"|'))/gm
        const tagEvents = htmlTag.match(eventExtractRe);

        if(!tagEvents)
        {
            return undefined;
        }
        let ownEvents = new Array<ElementEvent>();

        for(let eventArgs of tagEvents)
        {
            let event = {} as ElementEvent;
            const nameAndVal = eventArgs.split('=');
            event.eventId = nameAndVal[0];
            event.eventValue = nameAndVal[1];
            ownEvents.push(event);
        }

        return ownEvents;
    }

    private static __processTemplateWithElements(template: string, elements: Array<Element>, container: any, events: ElementEvent[])
    {
        if(elements.length > 0)
        {
            template = this.__processChildElement(template, elements, container, events);

            template = TemplateProcessor.__processHtmlElementInjection(template, container);
            template = TemplateProcessor.__injectHtmlMembers(template, container);

            // process functions
        }

        return template;
    }

    private static __processChildElement(template: string, elements: Array<Element>, container: any, events: ElementEvent[])
    {
        for(let element of elements)
        {
            const condition = TemplateProcessor.__getElementCondition(element, container);
            let originalOuter = element.outerHTML;
            let originalInner = element.innerHTML;

            if(condition.showElement)
            {
                element = TemplateProcessor.__processForStatement(element, condition, container, events);
                template = template.replace(originalInner, element.innerHTML);
                template = TemplateProcessor.__processChildElement(template, element.children, container, events);
                template = template.replace(originalOuter, element.outerHTML);
                template = TemplateProcessor.__processElementEvent(events, element, template, container);
            } else
            {
                template = template.replace(originalOuter, '');
            }
        }

        return template;
    }

    private static __injectHtmlMembers(template: string, component: any)
    {
        let memberNames = null;
        do
        {
            const findMembers = /{{\s*[a-zA-Z0-9]+(\.*([a-zA-Z0-9]+))*\s*}}/gm;
            memberNames = findMembers.exec(template);

            if(memberNames)
            {
                const extractMember = /[a-zA-Z0-9]+(\.*([a-zA-Z0-9]+))*/;
                const memberName = extractMember.exec(memberNames[0]);
                // @ts-ignore
                template = template.replace(memberNames[0],
                    // @ts-ignore
                    TemplateProcessor.__extractMemberValue(component, memberName[0]));
            }
        } while(memberNames);

        return template;
    }

    private static __processHtmlElementInjection(template: string, container: any)
    {
        const extractTags = /<([a-z]+[^/]*)>/gm;
        const tags = template.match(extractTags);

        if(!tags)
        {
            return template;
        }

        for(const tag of tags)
        {
            template = TemplateProcessor.__processHtmlTagAttributesInjection(template, container);
        }

        return template;
    }

    private static __processHtmlTagAttributesInjection(template: string, container: any) {
        const extractTags = /(\[[a-zA-Z0-9]+\]=('|")[a-zA-Z0-9]+(\.*([a-zA-Z0-9]+))*('|"))/gm;
        const attributes = template.match(extractTags);

        if(!attributes)
        {
            return template;
        }

        for(const attr of attributes)
        {
            const keyVal = attr.split('=');

            let key = keyVal[0].substring(1, keyVal[0].length - 1);
            let val = keyVal[1].substring(1, keyVal[1].length - 1);
            const value = TemplateProcessor.__processTagInputInjection(key, val, container);
            template = template.replace(attr, `${key}="${value}"`);
        }

        return template;
    }

    private static __getElementCondition(element: Element, container: any): ElementCondition
    {
        let ret: ElementCondition = { showElement: true, hasCondition: false };

        if(!element.attributes)
        {
            return ret;
        }
        let attributes = element.attributes.map((value) => value.split('=')[0]);
        const hasCondition = attributes.includes('*blif') || attributes.includes('*blfor');

        const extractCondition = /\*bl(if|for)="[^"]+"/g;
        const extraced = extractCondition.exec(element.outerHTML);

        if(hasCondition && extraced)
        {
            const value = extraced[0];
            ret.statement = value;
            if(value.indexOf('*blif=') !== -1)
            {
                ret.hasCondition = true;
                ret.conditionType = ConditionType.IF;
                ret.showElement = TemplateProcessor.__processIfStatement(value, container);
            } else
            {
                ret.hasCondition = true;
                ret.conditionType = ConditionType.FOR;
            }
        }

        return ret;
    }

    private static __processTagInputInjection(key: string, val: string, container: any) : string
    {
        let value = TemplateProcessor.__extractMemberValue(container, val);
        return TemplateProcessor.__getMemberValue(value);
    }

    private static __getMemberValue(value: any)
    {
        return typeof value === 'object' ? ArgumentInjector.registerObject(value) : value;
    }

    private static __processIfStatement(statement: string, container: any)
    {
        const extractStatement = /\*blif="([^"]+)"/gm;
        const attr = extractStatement.exec(statement);

        if(!attr)
        {
            return false;
        }

        let val = attr[1];

        if(val.indexOf(' ') !== -1)
        {
            return this.__processIfConditions(val, container);
        }

        const argumentOpt = TemplateProcessor.__processIfArg(val, container);

        let value = argumentOpt.argument;

        if(argumentOpt.startIndex === 0)
        {
            return !!value;
        } else
        {
            return !value;
        }
    }

    private static __processIfConditions(condition: string, container: any)
    {
        const parts = condition.split(' ');


        // TODO manage more than two args
        const leftArg = TemplateProcessor.__processIfArg(parts[0], container);
        const rightArg = TemplateProcessor.__processIfArg(parts[2], container);

        const operator = parts[1];

        return TemplateProcessor.__processIfOperation(leftArg, rightArg, operator);
    }

    private static __processIfOperation(left: IfArg, right: IfArg, operator: string): boolean
    {
        let leftVal = left.argument;
        let rightVal = right.argument;

        // TODO regex to check if contains < > <= >= == !=
        if(operator.indexOf("!=") !== -1)
        {
            return leftVal !== rightVal;
        } else if(operator.indexOf("==") !== -1)
        {
            return leftVal === rightVal;
        }

        leftVal = left.startIndex === 0 ? !!leftVal : !leftVal;
        rightVal = left.startIndex === 0 ? !!rightVal : !rightVal;

        switch (operator)
        {
            case "||":
                return leftVal || rightVal;
            case "&&":
                return leftVal && rightVal;
        }

        return false;
    }

    private static __processIfArg(argument: string, container: any): IfArg
    {
        const startIndex = argument[0] ===  '!' ? 1 : 0;
        argument = argument.substring(startIndex);

        return { startIndex: startIndex, argument: TemplateProcessor.__extractMemberValue(container, argument) };
    }

    private static __processForStatement(element: Element, condition: ElementCondition, component: any, events: ElementEvent[])
    {
        if(!condition.statement || condition.conditionType !== ConditionType.FOR)
        {
            return element;
        }

        const attr = condition.statement.split('=');
        // remove begining and ending "
        let loopDeclaration = attr[1].substring(1, attr[1].length - 1);
        const loopComponent = loopDeclaration.split(' ');

        // length should be 4 let val of values
        if(loopComponent.length === 4)
        {
            const innerHTML = element.innerHTML;
            element.innerHTML = '';
            const val = loopComponent[1];
            const values = TemplateProcessor.__extractMemberValue(component, loopComponent[3]);
            
            if(!values)
            {
                return element;
            }

            const originalChildren: Element[] = element.children;
            const newChildren: Element[] = [];
            const components: any[] = [];
            components.push(component);

            for(let injectedValue of values)
            {
                components.push(injectedValue);
                let extractValues = new RegExp(`{{ *${val}(\.[a-zA-Z0-9_]+)* *}}`, 'gm');
                // const extractArrayVal = new RegExp(`{{ *[a-zA-Z0-9_.]+\\[${val}(\.[a-zA-Z0-9_]+)*\\] *}}`, 'gm')
                const toInject = innerHTML.match(extractValues);

                for(const child of originalChildren)
                {
                    let newChild = JSON.parse(JSON.stringify(child));
                    newChildren.push(newChild);
                }

                // TODO check if innerHTML has for loops => inject value into object & process sub for.
                let tmpInnerHtml = innerHTML;
                if(toInject)
                {
                    for(let inject of toInject)
                    {
                        let param = inject.replace(/{{ */,'').replace(/ *}}/, '');

                        let paramValue = injectedValue;
                        if(param.indexOf('.') !== -1)
                        {
                            param = param.replace(/[a-zA-Z_]+\./, '');
                            paramValue = TemplateProcessor.__extractMemberValue(paramValue, param);
                        }
                        tmpInnerHtml =  tmpInnerHtml.replace(inject, paramValue);
                        for(const child of newChildren)
                        {
                            TemplateProcessor
                                .__replaceChildrenValues(child, inject, paramValue);
                        }
                    }
                }
                const extractInputVal = new RegExp(`\\[[a-zA-Z0-9]+\\]="${val}(\.[a-zA-Z0-9_]+)*"`, 'gm')
                const inputInject = innerHTML.match(extractInputVal);
                if(inputInject)
                {
                    for(const attr of inputInject)
                    {
                        const keyVal = attr.split('=');

                        // remove []
                        let key = keyVal[0].substring(1, keyVal[0].length - 1);
                        // remove ""
                        let attrval = keyVal[1].substring(1, keyVal[1].length - 1);

                        let value = injectedValue;
                        if(attrval.indexOf('.') !== -1)
                        {
                            attrval = attrval.replace(`${val}.`, '');
                            value = TemplateProcessor.__processTagInputInjection(key, attrval, injectedValue);
                        }

                        value = TemplateProcessor.__getMemberValue(value);
                        tmpInnerHtml = tmpInnerHtml.replace(attr, `${key}="${value}"`);
                        for(const child of newChildren)
                        {
                            TemplateProcessor
                                .__replaceChildrenValues(child, attr, `${key}="${value}"`);
                        }
                    }
                }
                const extractIfVal = new RegExp(`\\*blif="!?${val}(\.[a-zA-Z0-9_]+)*[^"]*"`, 'gm')
                const ifInject = innerHTML.match(extractIfVal);

                if(ifInject)
                {
                    tmpInnerHtml = TemplateProcessor
                        .__processForLoopInnerIfStatement(ifInject, injectedValue, val, newChildren, tmpInnerHtml, component);
                }

                element.innerHTML = element.innerHTML + tmpInnerHtml;
                element.children = newChildren;

                for(const child of element.children)
                {
                    TemplateProcessor.__processElementEventWithComponents(element, element.innerHTML, component, components, events);
                }
            }
        }

        return element;
    }

    private static __processForLoopInnerIfStatement(ifInject: Array<string>, injectedValue: any,
                                                    val: string, newChildren: Element[], tmpInnerHtml: string,
                                                    container: any)
    {
        const processForArg = (attr: string) =>
        {
            if(attr.indexOf('.'))
            {
                return attr.replace(new RegExp(`${val}\\.`, 'gm'), '');
            }

            return attr.replace(new RegExp(`${val}`, 'gm'), '');
        }

        for(let attribute of ifInject)
        {
            let replaceVal = '';
            let keep = false;

            if(attribute.indexOf(' ') !== -1)
            {
                let attr = attribute.replace('*blif=', '').replace('"', '');
                let parts = attr.split(' ');
                let colRegex = new RegExp(`^${val}(\\.[a-zA-Z]*)*$`);
                let left = {} as any;
                let right = {} as any;

                if(colRegex.exec(parts[0]))
                {
                    left = TemplateProcessor.__processIfArg(parts[0].replace(`${val}.`, ''), injectedValue);
                    right = TemplateProcessor.__processIfArg(parts[2], container);
                } else if(colRegex.exec(parts[2]))
                {
                    left = TemplateProcessor.__processIfArg(parts[0], container);
                    right = TemplateProcessor.__processIfArg(parts[2].replace(`${val}.`, ''), injectedValue);
                }

                if(TemplateProcessor.__processIfOperation(left, right, parts[1]))
                {
                    replaceVal = '';
                    keep = true;
                }
            } else
            {
                let attr = processForArg(attribute);

                if(TemplateProcessor.__processIfStatement(attr, injectedValue))
                {
                    replaceVal = '';
                    keep = true;
                }
            }


            for(let child of newChildren)
            {
                const childOuter = child.outerHTML;
                TemplateProcessor
                    .__processChildrenIfStatment(child, attribute, keep);
                tmpInnerHtml = tmpInnerHtml.replace(childOuter, child.outerHTML);
            }
        }

        return tmpInnerHtml;
    }

    private static __replaceChildrenValues(parent: Element, attr: string, value: string)
    {
        for(const child of parent.children)
        {
            TemplateProcessor.__replaceChildrenValues(child, attr, value);
        }

        parent.outerHTML = parent.outerHTML.replace(attr, value);
        parent.innerHTML = parent.innerHTML.replace(attr, value);
    }

    private static __processChildrenIfStatment(parent: Element, statement: string, keep: boolean)
    {
        for(const child of parent.children)
        {
            const childOuter = child.outerHTML;
            TemplateProcessor
                .__processChildrenIfStatment(child, statement, keep);
            parent.innerHTML = parent.innerHTML.replace(childOuter, child.outerHTML);
        }

        if(parent.tag.includes(statement) && !keep)
        {
            parent.outerHTML = '';
            parent.innerHTML = '';
            return;
        }

        parent.outerHTML = parent.outerHTML.replace(statement, '');
        parent.innerHTML = parent.innerHTML.replace(statement, '');
    }



    private static __extractMemberValue(component: any, memberName: string)
    {
        if(memberName === '')
        {
            return component;
        }

        const nameLen = memberName.length;
        if(memberName[0] === "'" && memberName[nameLen - 1] === "'")
        {
            return memberName.substring(1, nameLen - 1);
        }

        // is digits
        if(/^\d+$/.exec(memberName))
        {
            return parseInt(memberName);
        }

        if(memberName.indexOf('.') !== -1)
        {
            let objMemberName = memberName.split('.');
            const len = objMemberName.length - 1;

            for(let i = 0; i < len && component[objMemberName[i]]; i++)
            {
                component = component[objMemberName[i]];
            }

            return component[objMemberName[len]];
        }

        return component[memberName]
    }

    private static __processElementEvent(events: ElementEvent[], element: Element, template: string, component: any) {
        if(!element.events)
        {
            return template;
        }

        return TemplateProcessor.__processElementEvents(events, element.events, template, component, (name) => {
            return TemplateProcessor.__extractMemberValue(component, name);
        });
    }

    /**
     * This function should ONLY be used for events inside blfor statements.
     * @param element
     * @param parent
     * @param components
     * @private
     */
    private static __processElementEventWithComponents(element: Element, template: string, parent: any, components: any[], events: ElementEvent[])
    {
        if(!element.events)
        {
            return template;
        }

        return TemplateProcessor.__processElementEvents(events, element.events, template, parent, (name) => {
            for (let i = components.length - 1; i >= 0; i--) {
                const val = TemplateProcessor.__extractMemberValue(components[i], name);
                if (val) {
                    return val;
                }
            }
        });
    }

    private static __processElementEvents(events: ElementEvent[], childEvents: ElementEvent[], template: string, parent: any, getValueCb: (name: string) => any) {
        if(childEvents)
        {
            let i = 1;
            for(let event of childEvents)
            {
                const extractCallbackName = /([a-zA-Z0-9.]+)\(/gm
                // @ts-ignore
                const callbackName = extractCallbackName.exec(event.eventValue)[1];
                const callback = TemplateProcessor.__extractMemberValue(parent, callbackName);

                if(typeof callback === 'function')
                {
                    let args = TemplateProcessor.__getEvenArgsName(event);
                    let newEvent = {} as ElementEvent;
                    newEvent.args = [];

                    for(let arg of args)
                    {
                        const val = getValueCb(arg);
                        newEvent.args.push(val);
                    }

                    newEvent.eventCb = () => callback.apply(parent, event.args);
                    let newEventId = event.eventId.replace('(', '').replace(')', '');
                    newEvent.eventName = newEventId;
                    newEvent.eventValue = event.eventValue;
                    newEventId += `-${events.length + 1}`;
                    template = template.replace(`${event.eventId}=${event.eventValue}`, `bl-${newEventId}=${event.eventValue}`);
                    newEvent.eventId = newEventId;
                    newEvent.treated = true;
                    events.push(newEvent);
                }
            }
        }
        return template;
    }

    private static __getEvenArgsName(event: ElementEvent)
    {
        const extractArgsString = /\(([^)]*)\)/gm
        // @ts-ignore
        let argsString = extractArgsString.exec(event.eventValue)[0];
        argsString = argsString.replace('(', '').replace(')', '');

        if(argsString.length === 0)
        {
            return [];
        }

        return argsString.split(/,\s?/);
    }
}

interface Element
{
    children: Element[];
    attributes?: Array<string>|null;
    innerHTML: string;
    outerHTML: string;
    tag: string;
    indexStart: number;
    indexEnd: number;
    hasValue: boolean;
    events?: ElementEvent[];
}

interface ElementCondition
{
    hasCondition: boolean;
    conditionType?: ConditionType;
    showElement: boolean;
    statement?: string;
}

export interface ElementEvent
{
    // eg: (click) for (click)="cbFct(test)"
    eventId: string;
    // eg: click for (click)="cbFct(test)"
    eventName: string;
    // eg: cbFct(test) for (click)="cbFct(test)"
    eventValue: string;
    eventCb: () => void;
    args: Array<any>;
    // if the event has already been treated use if threated in for loops.
    treated: boolean;
}

enum ConditionType
{
    IF  = 0,
    FOR = 1,
}

interface IfArg
{
    startIndex: number;
    argument: any;
}
