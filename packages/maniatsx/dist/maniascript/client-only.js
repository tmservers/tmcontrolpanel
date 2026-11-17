export function clientOnly(name) {
    return new Proxy(() => { }, {
        get(_target, property) {
            if (property === Symbol.toPrimitive)
                return () => `[client-only ${name}]`;
            if (typeof property === "symbol" || property === "then")
                return undefined;
            throw new Error(`${name}.${property} is client-only: use it inside maniatsx client code`);
        },
        apply() {
            throw new Error(`${name} is client-only: use it inside maniatsx client code`);
        },
    });
}
