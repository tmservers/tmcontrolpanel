// Makes player text safe to embed in a label: `$` starts formatting codes.
export function escapeFormatting(text) {
    return text.replaceAll("$", "$$$$");
}
// $$ | $RGB | $l/$h/$p with optional [target] | single-letter codes | $< $>
const CODE = /\$(\$|[0-9a-f]{3}|[lhp](?:\[[^\]]*\])?|[iowntsgzm<>])/gi;
export function stripFormatting(text) {
    return text.replace(CODE, (_m, code) => (code === "$" ? "$" : ""));
}
