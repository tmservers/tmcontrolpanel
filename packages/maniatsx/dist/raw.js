import { RAW_XML } from "./vnode.js";
// Trusted XML inserted verbatim; never pass player-controlled text.
export function raw(xml) {
    if (typeof xml !== "string")
        throw new TypeError("raw() expects a string");
    return Object.freeze({ $$typeof: RAW_XML, xml });
}
