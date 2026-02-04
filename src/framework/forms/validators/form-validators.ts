export function required() {
    return function(it: string) {
        return it && it != '' ? null : "requried";
    };
}

export function minLength(length: number) {
    //CLOSURE
    return function(it: string) {
        return it && it.length > length ? null : `must be greater than ${length}`
    }
}

export function pattern(regex: RegExp) {
    return function(it: string) {
        return it.length > 0 && it.match(regex) ? null : 'does match!';
    }
}
