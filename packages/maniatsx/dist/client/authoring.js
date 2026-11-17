// Authoring API for client code. The compiler rewrites every call below into a `__mtx.*` call;
// reaching one of these bodies at runtime means the build transform did not run.
import { CLIENT, } from "./contract.js";
import { clientOnly } from "../maniascript/client-only.js";
// The manialink script context: `ml.Page`, `ml.LocalUser`, `ml.Now`… compile to `Page`, `LocalUser`, `Now`
export const ml = clientOnly("ml");
function notCompiled(api) {
    throw new Error(`${api} was not compiled: add the maniatsx build transform (Bun plugin or \`maniatsx compile\`)`);
}
export const client = {
    // Client-side variable; `initial` is evaluated on the server and sent as a literal.
    // `{ persist: true }` keeps it across page re-sends; the options must be literals
    state(initial, options) {
        void initial;
        void options;
        return notCompiled("client.state");
    },
    // Value written by an update page (<Publish>) and read here; the key is a literal and names the `for This` variable
    shared(key, initial) {
        void key;
        void initial;
        return notCompiled("client.shared");
    },
    // Runs `body` when the shared value changes (and once at init if it was already published)
    watch(shared, body) {
        void shared;
        void body;
        notCompiled("client.watch");
    },
    // Handle to a control: pass it as `ref` to an element, read `.control` in client code. The type argument is required
    ref() {
        return notCompiled("client.ref");
    },
    // Event handler for on* props (onClick, onRightClick, onMouseOver, onMouseOut, onSubmit)
    handler(body) {
        void body;
        return notCompiled("client.handler");
    },
    // Attribute value computed on the client and kept up to date when state changes
    bind(expr) {
        void expr;
        return notCompiled("client.bind");
    },
    // Module-level ManiaScript function; call it from client code like a normal function
    fn(fn) {
        void fn;
        return notCompiled("client.fn");
    },
    // Runs once when the page loads
    onInit(body) {
        void body;
        notCompiled("client.onInit");
    },
    // Runs every frame; keep it cheap
    onFrame(body) {
        void body;
        notCompiled("client.onFrame");
    },
};
// Actions are plain data, so they work without the compiler; trigger() only exists in client code
export function action(name) {
    if (!/^[\w.:-]+$/.test(name))
        throw new Error(`action(): invalid name ${JSON.stringify(name)}`);
    return {
        $$typeof: CLIENT,
        kind: "action",
        name,
        trigger: () => notCompiled(`action("${name}").trigger`),
    };
}
