import { jsx as _jsx } from "maniatsx/jsx-runtime";
import { raw } from "./raw.js";
import { renderTextElement } from "./render.js";
const XML_NAME = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}][:A-Z_a-z0-9.\-\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0300-\u036F\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}]*$/u;
function Entries({ entries }) {
    return entries.map(([id, text]) => raw(renderTextElement(id, text)));
}
export function Dico({ translations }) {
    const languages = Object.entries(translations);
    if (languages.length === 0)
        throw new Error("<Dico> requires at least one language");
    // The game uses the last language as its fallback.
    return (_jsx("dico", { children: languages.map(([language, translations]) => {
            const entries = Object.entries(translations);
            for (const [id] of entries) {
                if (!XML_NAME.test(id)) {
                    throw new Error(`<Dico> language ${JSON.stringify(language)} has invalid textid ${JSON.stringify(id)}`);
                }
            }
            return (_jsx("language", { id: language, children: _jsx(Entries, { entries: entries }) }));
        }) }));
}
