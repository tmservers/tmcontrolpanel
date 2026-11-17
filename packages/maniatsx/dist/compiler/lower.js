import ts from "typescript6";
import { DIRTY_FLAG } from "../client/contract.js";
import { Analyzer, authoringCallKind, isActionFactoryCall, resolveSymbol, unparen, } from "./analyzer.js";
import { compat, hasNum, isClass, isNum, isVec, msName, toMs } from "./ty.js";
import { decimal, libRef, realLiteral, safeLocalName, stringLiteral, } from "./util.js";
const OR = 1;
const AND = 2;
const EQ = 3;
const REL = 4;
const CONCAT = 5;
const ADD = 6;
const MUL = 7;
const UNARY = 8;
const ATOM = 100;
const atom = (text, ty) => ({ items: [text], ty, prec: ATOM });
function operand(e, parent, right) {
    let need;
    if (parent === CONCAT)
        need = e.prec < UNARY && !(e.prec === CONCAT && !right);
    else if (e.prec === CONCAT)
        need = true;
    else
        need = e.prec < parent || (e.prec === parent && right);
    return need ? ["(", ...e.items, ")"] : e.items;
}
class Out {
    level;
    items = [];
    constructor(level = 0) {
        this.level = level;
    }
    line(...parts) {
        this.items.push("  ".repeat(this.level));
        for (const p of parts) {
            if (Array.isArray(p))
                this.items.push(...p);
            else
                this.items.push(p);
        }
        this.items.push("\n");
    }
}
const MATH_FNS = {
    abs: "Abs",
    min: "Min",
    max: "Max",
    floor: "FloorInteger",
    ceil: "CeilingInteger",
    round: "NearestInteger",
    trunc: "TruncInteger",
    sqrt: "Sqrt",
    sin: "Sin",
    cos: "Cos",
    tan: "Tan",
    asin: "Asin",
    acos: "Acos",
    atan2: "Atan2",
    exp: "Exp",
    pow: "Pow",
    log: "Ln",
};
const ARITH_OPS = {
    [ts.SyntaxKind.MinusToken]: "-",
    [ts.SyntaxKind.AsteriskToken]: "*",
    [ts.SyntaxKind.SlashToken]: "/",
    [ts.SyntaxKind.PercentToken]: "%",
};
const COMPARE_OPS = {
    [ts.SyntaxKind.LessThanToken]: "<",
    [ts.SyntaxKind.LessThanEqualsToken]: "<=",
    [ts.SyntaxKind.GreaterThanToken]: ">",
    [ts.SyntaxKind.GreaterThanEqualsToken]: ">=",
};
const EQUALITY_OPS = {
    [ts.SyntaxKind.EqualsEqualsEqualsToken]: "==",
    [ts.SyntaxKind.EqualsEqualsToken]: "==",
    [ts.SyntaxKind.ExclamationEqualsEqualsToken]: "!=",
    [ts.SyntaxKind.ExclamationEqualsToken]: "!=",
};
const ASSIGN_OPS = {
    [ts.SyntaxKind.EqualsToken]: "=",
    [ts.SyntaxKind.PlusEqualsToken]: "+=",
    [ts.SyntaxKind.MinusEqualsToken]: "-=",
    [ts.SyntaxKind.AsteriskEqualsToken]: "*=",
    [ts.SyntaxKind.SlashEqualsToken]: "/=",
    [ts.SyntaxKind.PercentEqualsToken]: "%=",
};
const BAD_BINARY = {
    [ts.SyntaxKind.QuestionQuestionToken]: [
        "`??`",
        "Compare with null explicitly: `x === null ? a : b` (as an if/else).",
    ],
    [ts.SyntaxKind.AsteriskAsteriskToken]: ["`**`", "Use `MathLib.Pow(a, b)`."],
    [ts.SyntaxKind.InKeyword]: [
        "`in`",
        "Use `rec.keys.includes(k)` via Object.keys, or `arr.includes(x)`.",
    ],
    [ts.SyntaxKind.InstanceOfKeyword]: [
        "`instanceof`",
        "ManiaScript has no runtime type checks; compare against null.",
    ],
    [ts.SyntaxKind.CommaToken]: ["the comma operator", "Write separate statements."],
};
export class Lowerer {
    a;
    closure;
    kind;
    sig;
    out = null;
    lazy = 0;
    quiet = 0;
    tmp = 0;
    declared = 0;
    usedNames = new Set();
    names = new Map();
    localTys = new Map();
    targets = [];
    constructor(a, closure, kind, sig) {
        this.a = a;
        this.closure = closure;
        this.kind = kind;
        this.sig = sig;
    }
    get checker() {
        return this.a.checker;
    }
    // ---- diagnostics ----
    err(node, code, message) {
        if (!this.quiet)
            this.a.report(node, code, message);
    }
    snippet(node) {
        const t = node.getText().replace(/\s+/g, " ");
        return t.length > 60 ? t.slice(0, 57) + "..." : t;
    }
    bad(node, code, what, suggestion = "") {
        this.err(node, code, `${what} (\`${this.snippet(node)}\`) is not supported in client code.${suggestion ? " " + suggestion : ""}`);
        return atom("Null", "Void");
    }
    quietly(fn) {
        this.quiet++;
        try {
            return fn();
        }
        finally {
            this.quiet--;
        }
    }
    // ---- entry points ----
    begin() {
        const out = new Out(0);
        this.out = out;
        return out;
    }
    lowerStatements() {
        const out = this.begin();
        const body = this.closure.body;
        if (!body)
            return [];
        if (ts.isBlock(body))
            this.statements(body.statements);
        else
            this.exprStmt(body);
        return this.finish(out);
    }
    // init/frame bodies share the main/loop scope, so wrap them when they declare locals
    lowerLifecycle() {
        const out = this.begin();
        out.level = 1;
        const body = this.closure.body;
        if (ts.isBlock(body))
            this.statements(body.statements);
        else
            this.exprStmt(body);
        const inner = out.items;
        if (this.declared === 0) {
            const flat = new Out(0);
            const stripped = this.dedent(inner);
            flat.items = stripped;
            return this.finish(flat);
        }
        const wrapped = new Out(0);
        wrapped.items = ["{\n", ...inner, "}\n"];
        return this.finish(wrapped);
    }
    dedent(items) {
        return items.map((it, i) => {
            if (typeof it !== "string")
                return it;
            const prev = items[i - 1];
            const atLineStart = i === 0 || (typeof prev === "string" && prev.endsWith("\n"));
            return atLineStart && it.startsWith("  ") ? it.slice(2) : it;
        });
    }
    finish(out) {
        const items = out.items;
        const last = items[items.length - 1];
        if (typeof last === "string" && last.endsWith("\n"))
            items[items.length - 1] = last.slice(0, -1);
        return items;
    }
    lowerBind(expected) {
        const body = this.closure.body;
        let expr;
        if (ts.isBlock(body)) {
            const only = body.statements.length === 1 ? body.statements[0] : undefined;
            if (only && ts.isReturnStatement(only) && only.expression)
                expr = only.expression;
            else
                this.err(body, "bind-body", "A client.bind callback must be a single expression, e.g. `() => count.value + 1`.");
        }
        else
            expr = body;
        if (!expr)
            return { items: ["Null"], ty: "Void" };
        this.out = null;
        const e = this.val(expr, expected);
        return { items: e.items, ty: e.ty };
    }
    lowerFn() {
        const sig = this.sig;
        const out = this.begin();
        out.level = 1;
        const params = this.closure.parameters.map((p, i) => {
            const sym = this.checker.getSymbolAtLocation(p.name);
            const ty = sig.params[i].ty;
            const name = `_${sig.params[i].name}`;
            this.usedNames.add(name);
            if (sym) {
                this.names.set(sym, name);
                this.localTys.set(sym, ty);
            }
            return `${msName(ty)} ${name}`;
        });
        const body = this.closure.body;
        if (ts.isBlock(body))
            this.statements(body.statements);
        else {
            const e = this.val(body, sig.ret);
            out.line("return ", e.items, ";");
        }
        return [`${msName(sig.ret)} ${sig.name}(${params.join(", ")}) {\n`, ...out.items, "}"];
    }
    // ---- naming ----
    alloc(base) {
        const first = safeLocalName(base);
        let name = first;
        for (let n = 2; this.usedNames.has(name); n++)
            name = `${first}_${n}`;
        this.usedNames.add(name);
        return name;
    }
    declareLocal(sym, base, ty) {
        const name = this.alloc(base);
        this.declared++;
        if (sym) {
            this.names.set(sym, name);
            this.localTys.set(sym, ty);
        }
        return name;
    }
    tmpName() {
        return `Mtx_T${this.tmp++}`;
    }
    // ---- statements ----
    block(fn) {
        this.out.level++;
        try {
            fn();
        }
        finally {
            this.out.level--;
        }
    }
    // Runs fn against a scratch buffer at `level`, returning what it emitted
    capture(fn, level) {
        const saved = this.out;
        const scratch = new Out(level);
        this.out = scratch;
        try {
            return { result: fn(), items: scratch.items };
        }
        finally {
            this.out = saved;
        }
    }
    statements(list) {
        for (const s of list)
            this.stmt(s);
    }
    body(node) {
        this.block(() => {
            if (ts.isBlock(node))
                this.statements(node.statements);
            else
                this.stmt(node);
        });
    }
    stmt(node) {
        const out = this.out;
        if (ts.isBlock(node)) {
            out.line("{");
            this.body(node);
            out.line("}");
        }
        else if (ts.isVariableStatement(node))
            this.varStmt(node);
        else if (ts.isExpressionStatement(node))
            this.exprStmt(node.expression);
        else if (ts.isIfStatement(node))
            this.ifStmt(node);
        else if (ts.isWhileStatement(node))
            this.whileStmt(node);
        else if (ts.isForStatement(node))
            this.forStmt(node);
        else if (ts.isForOfStatement(node))
            this.forOfStmt(node);
        else if (ts.isSwitchStatement(node))
            this.switchStmt(node);
        else if (ts.isReturnStatement(node))
            this.returnStmt(node);
        else if (ts.isBreakStatement(node)) {
            if (node.label)
                this.bad(node, "label", "Labels", "Restructure the loop.");
            else if (this.targets.length === 0)
                this.err(node, "break", "`break` outside of a loop or switch.");
            else if (this.targets[this.targets.length - 1] === "switch") {
                this.err(node, "break", "`break` inside a switch is only supported as the last statement of a case.");
            }
            else
                out.line("break;");
        }
        else if (ts.isContinueStatement(node)) {
            if (node.label)
                this.bad(node, "label", "Labels", "Restructure the loop.");
            else if (!this.targets.includes("loop"))
                this.err(node, "continue", "`continue` outside of a loop.");
            else
                out.line("continue;");
        }
        else if (ts.isEmptyStatement(node)) {
            // nothing to emit
        }
        else if (ts.isTryStatement(node))
            this.bad(node, "try", "try/catch", "ManiaScript has no exceptions; check conditions explicitly.");
        else if (ts.isThrowStatement(node))
            this.bad(node, "throw", "`throw`", "ManiaScript has no exceptions; use `log(...)` and return.");
        else if (ts.isDoStatement(node))
            this.bad(node, "do-while", "do/while", "Use `while`.");
        else if (ts.isForInStatement(node))
            this.bad(node, "for-in", "for/in", "Use `for (const k of Object.keys(rec))`.");
        else if (ts.isFunctionDeclaration(node))
            this.bad(node, "closure", "Nested functions", "Define a module-level `client.fn`.");
        else if (ts.isClassDeclaration(node))
            this.bad(node, "class", "Classes", "Use an interface for data.");
        else if (ts.isLabeledStatement(node))
            this.bad(node, "label", "Labels", "Restructure the loop.");
        else
            this.bad(node, "statement", `The \`${ts.SyntaxKind[node.kind]}\` statement`);
    }
    varStmt(node) {
        const flags = node.declarationList.flags;
        if (!(flags & (ts.NodeFlags.Const | ts.NodeFlags.Let))) {
            this.err(node, "var", "`var` is not supported in client code. Use `const` or `let`.");
        }
        for (const d of node.declarationList.declarations)
            this.varDecl(d);
    }
    varDecl(d) {
        if (!ts.isIdentifier(d.name)) {
            this.bad(d.name, "destructuring", "Destructuring", "Declare one variable per value.");
            return;
        }
        let ty = d.type ? this.a.tyFromTypeNode(d.type, d) : undefined;
        let init;
        if (d.initializer) {
            init = this.val(d.initializer, ty);
            if (!ty) {
                ty = init.ty;
                if (hasNum(ty)) {
                    this.err(d, "bare-number", `\`${d.name.text}\` is initialised with a bare number literal, so its type is ambiguous. Annotate it: \`let ${d.name.text}: Integer = ...\` or \`Real\`.`);
                    ty = "Integer";
                }
                else if (ty === "Null" || ty === "Void") {
                    this.err(d, "untyped", `Cannot infer the type of \`${d.name.text}\`. Annotate the declaration.`);
                    ty = "Integer";
                }
            }
        }
        else if (!ty) {
            this.err(d, "untyped", `\`${d.name.text}\` needs an initial value or a type annotation.`);
            ty = "Integer";
        }
        const sym = this.checker.getSymbolAtLocation(d.name);
        const name = this.declareLocal(sym, d.name.text, ty);
        // Class values are references: ManiaScript assigns them with <=>
        const eq = isClass(ty) ? " <=> " : " = ";
        this.out.line("declare ", msName(ty), " ", name, init ? [eq, ...init.items] : [], ";");
    }
    exprStmt(expr) {
        const e = unparen(expr);
        const out = this.out;
        if (ts.isBinaryExpression(e) && ASSIGN_OPS[e.operatorToken.kind])
            return this.assignStmt(e);
        if (ts.isBinaryExpression(e) &&
            e.operatorToken.kind >= ts.SyntaxKind.FirstCompoundAssignment &&
            e.operatorToken.kind <= ts.SyntaxKind.LastCompoundAssignment) {
            this.bad(e, "operator", `The \`${e.operatorToken.getText()}\` operator`);
            return;
        }
        if ((ts.isPrefixUnaryExpression(e) || ts.isPostfixUnaryExpression(e)) &&
            (e.operator === ts.SyntaxKind.PlusPlusToken || e.operator === ts.SyntaxKind.MinusMinusToken)) {
            if (this.readOnlyShared(e, e.operand))
                return;
            const target = this.val(e.operand);
            const op = e.operator === ts.SyntaxKind.PlusPlusToken ? "+=" : "-=";
            out.line(target.items, " ", op, " 1;");
            if (this.stateRooted(e.operand))
                out.line(`${DIRTY_FLAG} = True;`);
            return;
        }
        if (ts.isCallExpression(e)) {
            const mutator = unparen(e.expression);
            if (ts.isPropertyAccessExpression(mutator) &&
                ["push", "splice"].includes(mutator.name.text) &&
                this.readOnlyShared(e, mutator.expression))
                return;
            const r = this.lowerCall(e, undefined);
            out.line(r.items, ";");
            const callee = unparen(e.expression);
            if (ts.isPropertyAccessExpression(callee) &&
                ["push", "splice"].includes(callee.name.text) &&
                this.stateRooted(callee.expression)) {
                out.line(`${DIRTY_FLAG} = True;`);
            }
            return;
        }
        if (ts.isVoidExpression(e)) {
            this.bad(e, "void", "`void`");
            return;
        }
        this.err(e, "expression-statement", `This expression statement does nothing (\`${this.snippet(e)}\`). Client statements must be calls, assignments or ++/--.`);
    }
    assignStmt(e) {
        const out = this.out;
        const target = unparen(e.left);
        if (ts.isArrayLiteralExpression(target) || ts.isObjectLiteralExpression(target)) {
            this.bad(target, "destructuring", "Destructuring assignment");
            return;
        }
        if (this.readOnlyShared(e, target))
            return;
        const root = this.rootIdentifier(target);
        if (root) {
            const k = this.a.classify(root, this.closure);
            // `props.count.value = …` / `props.title.control.X = …` write through a handle, not to the capture
            const throughHandle = this.handleRooted(target);
            if (!throughHandle &&
                (k.k === "capture" || k.k === "function" || k.k === "fn" || k.k === "action")) {
                this.err(e, "assign-capture", `\`${root.text}\` is a server value captured by this closure and cannot be assigned. Use client.state for values that change on the client.`);
                return;
            }
        }
        const L = this.val(target);
        const op = ASSIGN_OPS[e.operatorToken.kind];
        let R;
        if (op === "=")
            R = this.val(e.right, L.ty);
        else {
            R = this.val(e.right);
            if (R.ty === "Num")
                R = this.val(e.right, L.ty);
            if (isNum(L.ty) && isNum(R.ty) && L.ty !== R.ty)
                this.mixed(e, L.ty, R.ty);
        }
        const text = op === "+=" && L.ty === "Text" ? "^=" : op === "=" && isClass(L.ty) ? "<=>" : op;
        out.line(L.items, " ", text, " ", R.items, ";");
        if (this.stateRooted(target))
            out.line(`${DIRTY_FLAG} = True;`);
    }
    rootIdentifier(e) {
        let cur = unparen(e);
        for (;;) {
            if (ts.isIdentifier(cur))
                return cur;
            if (ts.isPropertyAccessExpression(cur) ||
                ts.isElementAccessExpression(cur) ||
                ts.isNonNullExpression(cur))
                cur = unparen(cur.expression);
            else
                return undefined;
        }
    }
    // True when the chain passes `.value` of a state or `.control` of a ref
    handleRooted(expr) {
        let e = unparen(expr);
        for (;;) {
            if (ts.isPropertyAccessExpression(e)) {
                const receiver = e.expression;
                const key = e.name.text;
                if (key === "value" || key === "control") {
                    const ty = this.quietly(() => this.lower(receiver).ty);
                    if (typeof ty === "object" &&
                        (key === "value" ? "state" in ty || "shared" in ty : "ref" in ty))
                        return true;
                }
                e = unparen(e.expression);
            }
            else if (ts.isElementAccessExpression(e) || ts.isNonNullExpression(e))
                e = unparen(e.expression);
            else
                return false;
        }
    }
    // True when the expression reads through some state.value (writes there must set the dirty flag)
    stateRooted(expr) {
        let e = unparen(expr);
        for (;;) {
            if (ts.isPropertyAccessExpression(e)) {
                const receiver = e.expression;
                if (e.name.text === "value" && this.quietly(() => this.isState(receiver)))
                    return true;
                e = unparen(e.expression);
            }
            else if (ts.isElementAccessExpression(e) || ts.isNonNullExpression(e))
                e = unparen(e.expression);
            else
                return false;
        }
    }
    // True when the chain passes `.value` of a client.shared handle, which is read-only
    sharedRooted(expr) {
        let e = unparen(expr);
        for (;;) {
            if (ts.isPropertyAccessExpression(e)) {
                const receiver = e.expression;
                if (e.name.text === "value") {
                    const t = this.quietly(() => this.lower(receiver).ty);
                    if (typeof t === "object" && "shared" in t)
                        return true;
                }
                e = unparen(receiver);
            }
            else if (ts.isElementAccessExpression(e) || ts.isNonNullExpression(e))
                e = unparen(e.expression);
            else
                return false;
        }
    }
    readOnlyShared(node, target) {
        if (!this.sharedRooted(target))
            return false;
        this.err(node, "assign-shared", `\`${this.snippet(target)}\` is a client.shared value and is read-only in client code. Write it from the server side with <Publish to={...} value={...} />.`);
        return true;
    }
    isState(expr) {
        const t = this.lower(expr).ty;
        return typeof t === "object" && "state" in t;
    }
    ifStmt(node) {
        const out = this.out;
        const c = this.cond(node.expression);
        out.line("if (", c, ") {");
        this.body(node.thenStatement);
        this.elsePart(node.elseStatement);
    }
    elsePart(els) {
        const out = this.out;
        if (!els) {
            out.line("}");
            return;
        }
        if (ts.isIfStatement(els)) {
            const cap = this.capture(() => this.cond(els.expression), out.level + 1);
            if (cap.items.length === 0) {
                out.line("} else if (", cap.result, ") {");
                this.body(els.thenStatement);
                this.elsePart(els.elseStatement);
                return;
            }
            out.line("} else {");
            out.items.push(...cap.items);
            out.level++;
            out.line("if (", cap.result, ") {");
            this.body(els.thenStatement);
            this.elsePart(els.elseStatement);
            out.level--;
            out.line("}");
            return;
        }
        out.line("} else {");
        this.body(els);
        out.line("}");
    }
    whileStmt(node) {
        const out = this.out;
        const cap = this.capture(() => this.cond(node.expression), out.level + 1);
        this.targets.push("loop");
        if (cap.items.length === 0) {
            out.line("while (", cap.result, ") {");
            this.body(node.statement);
        }
        else {
            out.line("while (True) {");
            out.items.push(...cap.items);
            out.level++;
            out.line("if (!(", cap.result, ")) {");
            out.line("  break;");
            out.line("}");
            out.level--;
            this.body(node.statement);
        }
        this.targets.pop();
        out.line("}");
    }
    forStmt(node) {
        const shape = "Only `for (let i = a; i < b; i++)` (or `<=`) is supported; use `while` for anything else.";
        const init = node.initializer;
        if (!init ||
            !ts.isVariableDeclarationList(init) ||
            init.declarations.length !== 1 ||
            !ts.isIdentifier(init.declarations[0].name) ||
            !init.declarations[0].initializer) {
            this.bad(node, "for-shape", "This `for` loop", shape);
            return;
        }
        const decl = init.declarations[0];
        const v = decl.name.text;
        const cond = node.condition && unparen(node.condition);
        const inc = node.incrementor && unparen(node.incrementor);
        const condOk = cond &&
            ts.isBinaryExpression(cond) &&
            (cond.operatorToken.kind === ts.SyntaxKind.LessThanToken ||
                cond.operatorToken.kind === ts.SyntaxKind.LessThanEqualsToken) &&
            ts.isIdentifier(unparen(cond.left)) &&
            unparen(cond.left).text === v;
        const incOk = inc &&
            (((ts.isPostfixUnaryExpression(inc) || ts.isPrefixUnaryExpression(inc)) &&
                inc.operator === ts.SyntaxKind.PlusPlusToken &&
                ts.isIdentifier(inc.operand) &&
                inc.operand.text === v) ||
                (ts.isBinaryExpression(inc) &&
                    inc.operatorToken.kind === ts.SyntaxKind.PlusEqualsToken &&
                    ts.isIdentifier(unparen(inc.left)) &&
                    unparen(inc.left).text === v &&
                    ts.isNumericLiteral(unparen(inc.right)) &&
                    unparen(inc.right).text === "1"));
        if (!condOk || !incOk) {
            this.bad(node, "for-shape", "This `for` loop", shape);
            return;
        }
        const out = this.out;
        const from = this.val(decl.initializer, "Integer");
        const c = cond;
        const inclusive = c.operatorToken.kind === ts.SyntaxKind.LessThanEqualsToken;
        const toE = this.val(c.right, "Integer");
        let to;
        if (inclusive)
            to = toE.items;
        else if (toE.items.length === 1 &&
            typeof toE.items[0] === "string" &&
            /^-?\d+$/.test(toE.items[0]))
            to = [String(Number(toE.items[0]) - 1)];
        else
            to = [...operand(toE, ADD, false), " - 1"];
        const sym = this.checker.getSymbolAtLocation(decl.name);
        const name = this.declareLocal(sym, v, "Integer");
        out.line("for (", name, ", ", from.items, ", ", to, ") {");
        this.targets.push("loop");
        this.body(node.statement);
        this.targets.pop();
        out.line("}");
    }
    forOfStmt(node) {
        const out = this.out;
        const init = node.initializer;
        if (node.awaitModifier) {
            this.bad(node, "async", "`for await`");
            return;
        }
        if (!ts.isVariableDeclarationList(init) || init.declarations.length !== 1) {
            this.bad(node, "for-of", "This `for...of` loop", "Use `for (const x of arr)`.");
            return;
        }
        const d = init.declarations[0];
        const iter = unparen(node.expression);
        const header = [];
        if (ts.isArrayBindingPattern(d.name)) {
            const els = d.name.elements;
            const callee = ts.isCallExpression(iter) ? unparen(iter.expression) : undefined;
            const isEntries = callee &&
                ts.isPropertyAccessExpression(callee) &&
                callee.name.text === "entries" &&
                ts.isIdentifier(callee.expression) &&
                this.a.classify(callee.expression, this.closure).k === "global";
            if (!isEntries ||
                els.length !== 2 ||
                !els.every((el) => ts.isBindingElement(el) && ts.isIdentifier(el.name))) {
                this.bad(d.name, "destructuring", "Destructuring", "Only `for (const [k, v] of Object.entries(rec))` is supported.");
                return;
            }
            const rec = this.val(iter.arguments[0]);
            if (typeof rec.ty !== "object" || !("record" in rec.ty)) {
                this.bad(iter, "entries", "`Object.entries` on a non-record value", "Use it on a Record<Text | Integer, T>.");
                return;
            }
            const [k, v] = els.map((el) => el.name);
            const kn = this.declareLocal(this.checker.getSymbolAtLocation(k), k.text, rec.ty.record.key);
            const vn = this.declareLocal(this.checker.getSymbolAtLocation(v), v.text, rec.ty.record.value);
            header.push(kn, " => ", vn, " in ", ...operand(rec, ATOM, false));
        }
        else if (ts.isIdentifier(d.name)) {
            const arr = this.val(node.expression);
            if (typeof arr.ty !== "object" || !("array" in arr.ty)) {
                this.bad(node.expression, "for-of", "Iterating a non-array value", "Iterate arrays, or `Object.keys(rec)`.");
                return;
            }
            const name = this.declareLocal(this.checker.getSymbolAtLocation(d.name), d.name.text, arr.ty.array);
            header.push(name, " in ", ...operand(arr, ATOM, false));
        }
        else {
            this.bad(d.name, "destructuring", "Destructuring");
            return;
        }
        out.line("foreach (", header, ") {");
        this.targets.push("loop");
        this.body(node.statement);
        this.targets.pop();
        out.line("}");
    }
    switchStmt(node) {
        const out = this.out;
        const subj = this.val(node.expression);
        out.line("switch (", subj.items, ") {");
        out.level++;
        this.targets.push("switch");
        const clauses = node.caseBlock.clauses;
        let labels = [];
        let isDefault = false;
        clauses.forEach((clause, i) => {
            if (ts.isCaseClause(clause))
                labels.push(this.val(clause.expression, subj.ty).items);
            else
                isDefault = true;
            const last = i === clauses.length - 1;
            if (clause.statements.length === 0 && !last)
                return;
            let stmts = [...clause.statements];
            const tail = stmts[stmts.length - 1];
            let ended = false;
            if (tail && ts.isBreakStatement(tail) && !tail.label) {
                stmts.pop();
                ended = true;
            }
            else if (tail && (ts.isReturnStatement(tail) || ts.isContinueStatement(tail)))
                ended = true;
            if (!ended && stmts.length > 0 && !last) {
                this.err(clause, "fallthrough", "A non-empty switch case falls through to the next one. End it with `break`, or merge the cases.");
            }
            const head = [];
            if (isDefault)
                head.push("default:");
            else {
                head.push("case ");
                labels.forEach((l, j) => head.push(...(j ? [", ", ...l] : l)));
                head.push(":");
            }
            out.line(head, " {");
            this.block(() => this.statements(stmts));
            out.line("}");
            labels = [];
            isDefault = false;
        });
        this.targets.pop();
        out.level--;
        out.line("}");
    }
    returnStmt(node) {
        const out = this.out;
        if (this.kind === "init" || this.kind === "frame") {
            this.err(node, "return", "`return` is not allowed in client.onInit/onFrame because it would leave the page script's main loop. Use if/else.");
            return;
        }
        if (this.kind === "handler") {
            if (node.expression)
                this.err(node, "return", "A client.handler cannot return a value.");
            else
                out.line("return;");
            return;
        }
        const ret = this.sig?.ret ?? "Void";
        if (!node.expression) {
            out.line("return;");
            return;
        }
        const e = this.val(node.expression, ret);
        out.line("return ", e.items, ";");
    }
    // ---- expressions ----
    cond(node) {
        const e = this.val(node, "Boolean");
        if (isClass(e.ty))
            return [...operand(e, EQ, false), " != Null"];
        if (e.ty !== "Boolean") {
            this.err(node, "condition", `Conditions must be Boolean, found ${msName(e.ty)} (\`${this.snippet(node)}\`). Compare explicitly, for example \`x > 0\`.`);
        }
        return e.items;
    }
    // Lowers an expression that must be a plain value (not a state/fn/action handle)
    val(node, expected) {
        const e = this.lower(node, expected);
        if (typeof e.ty === "object" &&
            ("state" in e.ty || "shared" in e.ty || "ref" in e.ty || "fn" in e.ty)) {
            this.err(node, "handle", `\`${this.snippet(node)}\` is a client handle, not a value. ${"state" in e.ty ? "Read or write `.value`." : "shared" in e.ty ? "Read `.value`." : "ref" in e.ty ? "Use `.control`." : "Call it."}`);
        }
        else if (e.ty === "Action") {
            this.err(node, "handle", `\`${this.snippet(node)}\` is an action. Only \`.trigger(...)\` can be used in client code.`);
        }
        if (expected)
            this.coerce(e, expected, node);
        return e;
    }
    coerce(e, expected, node) {
        if (expected === "Real" && e.ty === "Integer" && e.intDiv) {
            if (!this.quiet) {
                this.a.report(node, "int-division", "Integer / Integer is integer division in ManiaScript, but the result is used as a Real. Convert an operand first, for example `MathLib.ToReal(a) / MathLib.ToReal(b)`.", "warning");
            }
        }
        else if (expected === "Integer" && e.ty === "Real") {
            this.err(node, "real-to-integer", `A Real value (\`${this.snippet(node)}\`) is used where an Integer is expected. Convert explicitly with MathLib.FloorInteger, MathLib.NearestInteger, MathLib.TruncInteger or MathLib.CeilingInteger.`);
        }
    }
    mixed(node, l, r) {
        this.err(node, "mixed-number", `Integer and Real are mixed in \`${this.snippet(node)}\` (${msName(l)} and ${msName(r)}). Convert explicitly with MathLib.ToReal or MathLib.NearestInteger.`);
    }
    lower(node, expected) {
        switch (node.kind) {
            case ts.SyntaxKind.ParenthesizedExpression:
                return this.lower(node.expression, expected);
            case ts.SyntaxKind.NumericLiteral:
                return this.numeric(node, false, expected);
            case ts.SyntaxKind.StringLiteral:
            case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
                return atom(stringLiteral(node.text), "Text");
            case ts.SyntaxKind.TrueKeyword:
                return atom("True", "Boolean");
            case ts.SyntaxKind.FalseKeyword:
                return atom("False", "Boolean");
            case ts.SyntaxKind.NullKeyword:
                return atom("Null", "Null");
            case ts.SyntaxKind.Identifier:
                return this.ident(node);
            case ts.SyntaxKind.TemplateExpression:
                return this.template(node);
            case ts.SyntaxKind.PropertyAccessExpression:
                return this.prop(node);
            case ts.SyntaxKind.ElementAccessExpression:
                return this.element(node);
            case ts.SyntaxKind.CallExpression:
                return this.lowerCall(node, expected);
            case ts.SyntaxKind.PrefixUnaryExpression:
                return this.prefix(node, expected);
            case ts.SyntaxKind.BinaryExpression:
                return this.binary(node, expected);
            case ts.SyntaxKind.ConditionalExpression:
                return this.conditional(node, expected);
            case ts.SyntaxKind.AsExpression:
                return this.asExpr(node);
            case ts.SyntaxKind.NonNullExpression:
                return this.lower(node.expression, expected);
            case ts.SyntaxKind.ArrayLiteralExpression:
                return this.arrayLiteral(node, expected);
            case ts.SyntaxKind.ObjectLiteralExpression:
                return this.objectLiteral(node, expected);
            case ts.SyntaxKind.ThisKeyword:
                return this.bad(node, "this", "`this`");
            case ts.SyntaxKind.ArrowFunction:
            case ts.SyntaxKind.FunctionExpression:
                return this.bad(node, "closure", "Nested closures", "Only client.handler/bind/fn/onInit/onFrame callbacks are compiled; use a module-level `client.fn` for helpers.");
            case ts.SyntaxKind.AwaitExpression:
                return this.bad(node, "async", "`await`", "ManiaScript has no promises; use `yield;` patterns via client.onFrame.");
            case ts.SyntaxKind.YieldExpression:
                return this.bad(node, "generator", "Generators");
            case ts.SyntaxKind.TypeOfExpression:
                return this.bad(node, "typeof", "`typeof`");
            case ts.SyntaxKind.DeleteExpression:
                return this.bad(node, "delete", "`delete`", "Use `rec.removekey` via splice on arrays; records cannot shrink in client code.");
            case ts.SyntaxKind.VoidExpression:
                return this.bad(node, "void", "`void`");
            case ts.SyntaxKind.NewExpression:
                return this.bad(node, "new", `\`new ${node.expression.getText()}\``, "Use an object literal for structs, or an array literal.");
            case ts.SyntaxKind.RegularExpressionLiteral:
                return this.bad(node, "regex", "Regular expressions", "Use TextLib functions.");
            case ts.SyntaxKind.BigIntLiteral:
                return this.bad(node, "bigint", "BigInt literals");
            case ts.SyntaxKind.SpreadElement:
                return this.bad(node, "spread", "Spread");
            case ts.SyntaxKind.TaggedTemplateExpression:
                return this.bad(node, "tagged-template", "Tagged templates");
            case ts.SyntaxKind.PostfixUnaryExpression:
                return this.bad(node, "increment", "`++`/`--` inside an expression", "Use it as its own statement.");
            case ts.SyntaxKind.SatisfiesExpression:
                return this.bad(node, "satisfies", "`satisfies`");
            case ts.SyntaxKind.ClassExpression:
                return this.bad(node, "class", "Classes");
            case ts.SyntaxKind.JsxElement:
            case ts.SyntaxKind.JsxSelfClosingElement:
            case ts.SyntaxKind.JsxFragment:
                return this.bad(node, "jsx", "JSX");
            default:
                return this.bad(node, "expression", `The \`${ts.SyntaxKind[node.kind]}\` expression`);
        }
    }
    numeric(node, negative, expected) {
        const n = (negative ? -1 : 1) * Number(node.text);
        if (expected === "Real")
            return atom(realLiteral(n), "Real");
        if (expected === "Integer") {
            if (!Number.isInteger(n)) {
                this.err(node, "number-literal", `The literal \`${node.text}\` is not an integer but an Integer is expected here.`);
            }
            else if (!Number.isSafeInteger(n)) {
                this.err(node, "number-literal", `The literal \`${node.text}\` is outside the safe Integer range.`);
            }
            return atom(decimal(n), "Integer");
        }
        return atom(decimal(n), "Num");
    }
    ident(node) {
        const k = this.a.classify(node, this.closure);
        switch (k.k) {
            case "local": {
                const sym = resolveSymbol(this.checker, node);
                const ty = this.localTys.get(sym) ?? this.a.declTy(sym, node);
                const name = this.names.get(sym) ?? this.declareFreeParam(sym, node);
                return atom(name, ty);
            }
            case "nullId":
                return atom("NullId", "Ident");
            case "state":
                return { items: [{ kind: "state", expr: node.text }], ty: k.ty, prec: ATOM };
            case "shared":
                return { items: [{ kind: "shared", expr: node.text }], ty: k.ty, prec: ATOM };
            case "ref":
                return { items: [{ kind: "ref", expr: node.text }], ty: k.ty, prec: ATOM };
            case "fn":
                return { items: [{ kind: "fn", expr: node.text }], ty: k.ty, prec: ATOM };
            case "action":
                return { items: [{ kind: "action", expr: node.text }], ty: "Action", prec: ATOM };
            case "capture":
                return this.capture1(node, k.ty);
            case "function":
                return this.bad(node, "capture-function", `The function \`${node.text}\``, "Define it with a module-level `client.fn`, or call a game API function directly.");
            case "ml":
                return this.bad(node, "ml", "`ml` on its own", "Access a member, for example `ml.Page`.");
            case "lib":
            case "vecCtor":
                return this.bad(node, "api", `\`${node.text}\` on its own`, "Call a function on it.");
            case "global":
                return this.bad(node, "global", k.name === "undefined" ? "`undefined`" : `\`${k.name}\``, k.name === "undefined" ? "Use `null`." : "");
            case "client":
                return this.bad(node, "client", "`client` inside client code", "Client constructs cannot be nested.");
            default:
                return this.bad(node, "unresolved", `The identifier \`${node.text}\``, "Make sure it is declared and typed.");
        }
    }
    // Parameters declared in an outer signature that the closure itself owns (rare: handler params)
    declareFreeParam(sym, node) {
        this.err(node, "param", "Closure parameters are only supported on client.fn.");
        return this.declareLocal(sym, sym.name, "Integer");
    }
    capture1(node, ty) {
        const ms = toMs(ty);
        if (ty === "Ident" || (typeof ty === "object" && "struct" in ty)) {
            this.err(node, "capture-type", `\`${this.snippet(node)}\` cannot be captured: objects and Ident values cannot cross the server boundary. Capture a primitive value instead.`);
            return atom("Null", "Void");
        }
        if (!ms || hasNum(ty)) {
            this.err(node, "capture-type", `\`${this.snippet(node)}\` cannot be captured: its type (${msName(ty)}) is not an Integer, Real, Boolean, Text, Ident, vector, array, record or struct.`);
            return atom("Null", "Void");
        }
        this.a.trackNote(ty);
        return { items: [{ kind: "value", type: ms, expr: node.getText() }], ty, prec: ATOM };
    }
    template(node) {
        const parts = [];
        if (node.head.text)
            parts.push(atom(stringLiteral(node.head.text), "Text"));
        for (const span of node.templateSpans) {
            parts.push(this.val(span.expression));
            if (span.literal.text)
                parts.push(atom(stringLiteral(span.literal.text), "Text"));
        }
        return this.concat(parts, true);
    }
    concat(parts, forceText) {
        if (parts.length === 1 && (parts[0].ty === "Text" || !forceText))
            return parts[0];
        const items = [];
        if (parts.length === 1 || parts[0].ty !== "Text") {
            if (parts.length === 1 || parts[1].ty !== "Text")
                items.push('"" ^ ');
        }
        parts.forEach((p, i) => {
            if (i)
                items.push(" ^ ");
            items.push(...operand(p, CONCAT, i > 0));
        });
        return { items, ty: "Text", prec: CONCAT };
    }
    // ---- property and element access ----
    chainRoot(node) {
        let cur = unparen(node);
        while (ts.isPropertyAccessExpression(cur) || ts.isNonNullExpression(cur))
            cur = unparen(cur.expression);
        return ts.isIdentifier(cur) ? cur : undefined;
    }
    prop(node) {
        if (node.questionDotToken)
            return this.bad(node, "optional-chain", "Optional chaining", "Check for null explicitly.");
        const name = node.name.text;
        const root = this.chainRoot(node);
        const rootKind = root ? this.a.classify(root, this.closure) : undefined;
        // Enum member: the checker sees the fully qualified literal
        if (rootKind?.k === "apiValue") {
            const t = this.checker.getTypeAtLocation(node);
            if (t.isStringLiteral() && /^\w+(::\w+)+$/.test(t.value)) {
                return atom(t.value, { enum: t.value.slice(0, t.value.lastIndexOf("::")) });
            }
            return this.bad(node, "api", `\`${this.snippet(node)}\``, "Only enum members of API classes can be used as values.");
        }
        const recvNode = unparen(node.expression);
        if (ts.isIdentifier(recvNode)) {
            const rk = this.a.classify(recvNode, this.closure);
            if (rk.k === "ml")
                return this.apiMember(node, atom("", { class: "CSmMlScriptIngame" }), true);
            if (rk.k === "lib") {
                const sym = this.checker.getSymbolAtLocation(node.name);
                const ty = sym ? this.a.declTy(sym, node) : "Real";
                return { items: [libRef(rk.name), `::${name}`], ty, prec: ATOM };
            }
            if (rk.k === "global" && rk.name === "Math") {
                if (name === "PI") {
                    return { items: [libRef("MathLib"), "::Pi"], ty: "Real", prec: ATOM };
                }
                return this.bad(node, "math", `\`Math.${name}\``, "Use the MathLib equivalents.");
            }
            if (rk.k === "global")
                return this.bad(node, "global", `\`${rk.name}.${name}\``);
        }
        if (name === "value") {
            const recv = this.lower(recvNode);
            if (typeof recv.ty === "object" && "state" in recv.ty) {
                return { items: recv.items, ty: recv.ty.state, prec: ATOM };
            }
            if (typeof recv.ty === "object" && "shared" in recv.ty) {
                return { items: recv.items, ty: recv.ty.shared, prec: ATOM };
            }
        }
        if (name === "control") {
            const inner = this.quietly(() => this.lower(recvNode).ty);
            if (typeof inner === "object" && "ref" in inner) {
                return { items: this.lower(recvNode).items, ty: inner.ref, prec: ATOM };
            }
        }
        // A chain rooted in a server-side declaration is captured whole
        if (rootKind?.k === "capture" && this.isPlainChain(node) && !this.handleRooted(node)) {
            if (name === "length") {
                const inner = this.quietly(() => this.lower(recvNode).ty);
                if (typeof inner === "object" && "array" in inner)
                    return this.capture1(node, "Integer");
            }
            const sym = this.checker.getSymbolAtLocation(node.name);
            const ty = sym ? this.a.declTy(sym, node) : "Void";
            if (typeof ty === "object" && "state" in ty)
                return { items: [{ kind: "state", expr: node.getText() }], ty, prec: ATOM };
            if (typeof ty === "object" && "shared" in ty)
                return { items: [{ kind: "shared", expr: node.getText() }], ty, prec: ATOM };
            if (typeof ty === "object" && "ref" in ty)
                return { items: [{ kind: "ref", expr: node.getText() }], ty, prec: ATOM };
            if (typeof ty === "object" && "fn" in ty)
                return { items: [{ kind: "fn", expr: node.getText() }], ty, prec: ATOM };
            if (ty === "Action")
                return { items: [{ kind: "action", expr: node.getText() }], ty, prec: ATOM };
            return this.capture1(node, ty);
        }
        const recv = this.val(recvNode);
        if (name === "length") {
            if (typeof recv.ty === "object" && "array" in recv.ty)
                return { items: [...operand(recv, ATOM, false), ".count"], ty: "Integer", prec: ATOM };
            if (recv.ty === "Text") {
                return {
                    items: [libRef("TextLib"), "::Length(", ...recv.items, ")"],
                    ty: "Integer",
                    prec: ATOM,
                };
            }
        }
        return this.apiMember(node, recv, false);
    }
    isPlainChain(node) {
        let cur = unparen(node);
        while (ts.isPropertyAccessExpression(cur) || ts.isNonNullExpression(cur))
            cur = unparen(cur.expression);
        return ts.isIdentifier(cur);
    }
    // Member of an API class, struct or vector (receiver already lowered). ml members drop the prefix.
    apiMember(node, recv, isMl) {
        const sym = this.checker.getSymbolAtLocation(node.name);
        const decl = sym?.valueDeclaration ?? sym?.declarations?.[0];
        if (!sym || !decl || ts.isMethodSignature(decl)) {
            return this.bad(node, "member", `\`${this.snippet(node)}\``, decl && ts.isMethodSignature(decl) ? "Call it instead of reading it." : "Unknown member.");
        }
        const ty = this.a.declTy(sym, node);
        if (isMl)
            return atom(node.name.text, ty);
        if (typeof recv.ty === "object" && ("array" in recv.ty || "record" in recv.ty)) {
            return this.bad(node, "member", `\`.${node.name.text}\` on an array or record`, "Supported: length, push, includes, indexOf, splice(i, 1), Object.keys.");
        }
        return { items: [...operand(recv, ATOM, false), ".", node.name.text], ty, prec: ATOM };
    }
    element(node) {
        if (node.questionDotToken)
            return this.bad(node, "optional-chain", "Optional chaining");
        const recv = this.val(node.expression);
        const t = recv.ty;
        if (typeof t === "object" && "array" in t) {
            const idx = this.val(node.argumentExpression, "Integer");
            return {
                items: [...operand(recv, ATOM, false), "[", ...idx.items, "]"],
                ty: t.array,
                prec: ATOM,
            };
        }
        if (typeof t === "object" && "record" in t) {
            const idx = this.val(node.argumentExpression, t.record.key);
            return {
                items: [...operand(recv, ATOM, false), "[", ...idx.items, "]"],
                ty: t.record.value,
                prec: ATOM,
            };
        }
        return this.bad(node, "index", "Indexing a non-array value");
    }
    // ---- operators ----
    prefix(node, expected) {
        switch (node.operator) {
            case ts.SyntaxKind.ExclamationToken: {
                const e = this.val(node.operand, "Boolean");
                if (isClass(e.ty))
                    return { items: [...operand(e, EQ, false), " == Null"], ty: "Boolean", prec: EQ };
                return { items: ["!", ...operand(e, UNARY, false)], ty: "Boolean", prec: UNARY };
            }
            case ts.SyntaxKind.MinusToken: {
                const inner = unparen(node.operand);
                if (ts.isNumericLiteral(inner))
                    return this.numeric(inner, true, expected);
                const e = this.val(node.operand, expected);
                let items = operand(e, UNARY, false);
                if (typeof items[0] === "string" && items[0].startsWith("-"))
                    items = ["(", ...e.items, ")"];
                return { items: ["-", ...items], ty: e.ty, prec: UNARY };
            }
            case ts.SyntaxKind.PlusToken:
                return this.val(node.operand, expected);
            case ts.SyntaxKind.PlusPlusToken:
            case ts.SyntaxKind.MinusMinusToken:
                return this.bad(node, "increment", "`++`/`--` inside an expression", "Use it as its own statement.");
            default:
                return this.bad(node, "bitwise", "Bitwise `~`", "ManiaScript has no bitwise operators.");
        }
    }
    // Lowers both operands, resolving bare literals against their sibling's type
    pair(node, expected) {
        let L = this.val(node.left);
        let R = this.val(node.right);
        if (L.ty === "Num" && R.ty === "Num") {
            if (expected && isNum(expected)) {
                L = this.val(node.left, expected);
                R = this.val(node.right, expected);
            }
        }
        else if (L.ty === "Num")
            L = this.val(node.left, R.ty);
        else if (R.ty === "Num")
            R = this.val(node.right, L.ty);
        if (isNum(L.ty) && isNum(R.ty) && L.ty !== R.ty)
            this.mixed(node, L.ty, R.ty);
        return [L, R];
    }
    binary(node, expected) {
        const op = node.operatorToken.kind;
        if (ASSIGN_OPS[op] ||
            (op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment)) {
            return this.bad(node, "assignment", "An assignment used as an expression", "Assignments must be their own statements.");
        }
        const bad = BAD_BINARY[op];
        if (bad)
            return this.bad(node, "operator", `The ${bad[0]} operator`, bad[1]);
        if (op === ts.SyntaxKind.AmpersandAmpersandToken || op === ts.SyntaxKind.BarBarToken) {
            const isAnd = op === ts.SyntaxKind.AmpersandAmpersandToken;
            const prec = isAnd ? AND : OR;
            const l = this.val(node.left, "Boolean");
            const left = isClass(l.ty)
                ? { items: [...operand(l, EQ, false), " != Null"], ty: "Boolean", prec: EQ }
                : l;
            this.lazy++;
            let right;
            try {
                const r = this.val(node.right, "Boolean");
                right = isClass(r.ty)
                    ? { items: [...operand(r, EQ, false), " != Null"], ty: "Boolean", prec: EQ }
                    : r;
            }
            finally {
                this.lazy--;
            }
            return {
                items: [
                    ...operand(left, prec, false),
                    isAnd ? " && " : " || ",
                    ...operand(right, prec, true),
                ],
                ty: "Boolean",
                prec,
            };
        }
        const eq = EQUALITY_OPS[op];
        const cmp = COMPARE_OPS[op];
        if (eq || cmp) {
            const [L, R] = this.pair(node);
            const prec = eq ? EQ : REL;
            return {
                items: [...operand(L, prec, false), ` ${eq ?? cmp} `, ...operand(R, prec, true)],
                ty: "Boolean",
                prec,
            };
        }
        if (op === ts.SyntaxKind.PlusToken) {
            const [L, R] = this.pair(node, expected);
            if (L.ty === "Text" || R.ty === "Text")
                return this.concatPlus(node, L, R);
            return {
                items: [...operand(L, ADD, false), " + ", ...operand(R, ADD, true)],
                ty: this.arithTy(L, R),
                prec: ADD,
            };
        }
        const sym = ARITH_OPS[op];
        if (sym) {
            const [L, R] = this.pair(node, expected);
            const prec = op === ts.SyntaxKind.MinusToken ? ADD : MUL;
            const ty = this.arithTy(L, R);
            const e = {
                items: [...operand(L, prec, false), ` ${sym} `, ...operand(R, prec, true)],
                ty,
                prec,
            };
            if (op === ts.SyntaxKind.SlashToken && L.ty === "Integer" && R.ty === "Integer")
                e.intDiv = true;
            return e;
        }
        return this.bad(node, "bitwise", `The \`${node.operatorToken.getText()}\` operator`, "ManiaScript has no bitwise operators.");
    }
    concatPlus(node, L, R) {
        void node;
        const items = [...operand(L, CONCAT, false), " ^ ", ...operand(R, CONCAT, true)];
        return { items, ty: "Text", prec: CONCAT };
    }
    arithTy(L, R) {
        if (isVec(L.ty))
            return L.ty;
        if (isVec(R.ty))
            return R.ty;
        return L.ty === "Num" ? R.ty : L.ty;
    }
    conditional(node, expected) {
        if (!this.out) {
            return this.bad(node, "conditional", "A conditional expression in a client.bind", "Move the logic into a `client.fn` with if/else and call it from the binding.");
        }
        if (this.lazy > 0) {
            return this.bad(node, "conditional", "A conditional expression on the right of && or ||", "Use an if/else statement.");
        }
        const out = this.out;
        const c = this.cond(node.condition);
        const level = out.level + 1;
        const a = this.capture(() => this.val(node.whenTrue, expected), level);
        const b = this.capture(() => this.val(node.whenFalse, expected), level);
        let ty = a.result.ty;
        if (ty === "Num" || ty === "Null")
            ty = b.result.ty;
        if (ty === "Num" || (expected && ty === "Null"))
            ty = expected ?? ty;
        if (ty === "Num" || ty === "Null" || ty === "Void") {
            return this.bad(node, "conditional-type", "A conditional expression whose type cannot be inferred", "Annotate the target variable, e.g. `const x: Integer = ...`.");
        }
        if (isNum(a.result.ty) && isNum(b.result.ty) && a.result.ty !== b.result.ty)
            this.mixed(node, a.result.ty, b.result.ty);
        const resolve = (r, branch) => r.result.ty === "Num" ? this.capture(() => this.val(branch, ty), level) : r;
        const ra = resolve(a, node.whenTrue);
        const rb = resolve(b, node.whenFalse);
        const t = this.tmpName();
        this.declared++;
        out.line(`declare ${msName(ty)} ${t};`);
        out.line("if (", c, ") {");
        out.items.push(...ra.items);
        const eq = isClass(ty) ? " <=> " : " = ";
        out.line("  ", t, eq, ra.result.items, ";");
        out.line("} else {");
        out.items.push(...rb.items);
        out.line("  ", t, eq, rb.result.items, ";");
        out.line("}");
        return atom(t, ty);
    }
    asExpr(node) {
        if (ts.isTypeReferenceNode(node.type) && node.type.typeName.getText() === "const") {
            return this.bad(node, "as-const", "`as const`");
        }
        const target = this.a.tyFromTypeNode(node.type, node);
        if (!isClass(target)) {
            return this.bad(node, "as", `A cast to ${msName(target)}`, "Only casts to API classes (for example `as CMlLabel`) are supported.");
        }
        const e = this.val(node.expression);
        return { items: ["(", ...e.items, ` as ${target.class})`], ty: target, prec: ATOM };
    }
    arrayLiteral(node, expected) {
        const elemExpected = expected && typeof expected === "object" && "array" in expected ? expected.array : undefined;
        const spread = node.elements.find(ts.isSpreadElement);
        if (spread)
            return this.bad(spread, "spread", "Spread in an array literal");
        if (node.elements.length === 0) {
            if (!elemExpected)
                return this.bad(node, "empty-array", "An empty array literal without a known type", "Annotate the target, e.g. `const xs: Integer[] = []`.");
            return atom(`${msName(elemExpected)}[]`, expected);
        }
        let elems = node.elements.map((el) => this.val(el, elemExpected));
        let elTy = elems.find((e) => e.ty !== "Num")?.ty ?? "Num";
        if (elTy !== "Num" && elems.some((e) => e.ty === "Num")) {
            elems = node.elements.map((el, i) => elems[i].ty === "Num" ? this.val(el, elTy) : elems[i]);
        }
        for (const e of elems)
            if (isNum(e.ty) && isNum(elTy) && e.ty !== elTy)
                this.mixed(node, elTy, e.ty);
        if (elemExpected && elTy === "Num")
            elTy = elemExpected;
        const items = ["["];
        elems.forEach((e, i) => items.push(...(i ? [", ", ...e.items] : e.items)));
        items.push("]");
        return { items, ty: { array: elTy }, prec: ATOM };
    }
    objectLiteral(node, expected) {
        if (!expected ||
            typeof expected !== "object" ||
            !("struct" in expected || "record" in expected)) {
            return this.bad(node, "object-literal", "An object literal without a known struct or record type", "Declare the target with an interface, e.g. `const p: Point = { X: 1, Y: 2 }`.");
        }
        const props = [];
        for (const p of node.properties) {
            if (ts.isPropertyAssignment(p))
                props.push({ key: p.name, value: p.initializer });
            else if (ts.isShorthandPropertyAssignment(p))
                props.push({ key: p.name, value: p.name });
            else
                return this.bad(p, "object-literal", "Spread, methods and accessors in an object literal");
        }
        if ("struct" in expected) {
            const fields = this.a.structFields(expected.struct) ?? [];
            const items = [`${expected.struct} {`];
            props.forEach((p, i) => {
                const keyName = ts.isIdentifier(p.key) || ts.isStringLiteral(p.key) ? p.key.text : undefined;
                const field = fields.find((f) => f.name === keyName);
                if (!keyName || !field) {
                    this.err(p.key, "object-literal", `\`${p.key.getText()}\` is not a field of ${expected.struct}.`);
                    return;
                }
                const v = this.val(p.value, field.ty);
                items.push(i ? ", " : " ", `${keyName} = `, ...v.items);
            });
            items.push(props.length ? " }" : "}");
            return { items, ty: expected, prec: ATOM };
        }
        const { key, value } = expected.record;
        if (props.length === 0)
            return atom(`${msName(value)}[${msName(key)}]`, expected);
        const items = ["["];
        props.forEach((p, i) => {
            const k = ts.isIdentifier(p.key) || ts.isStringLiteral(p.key)
                ? stringLiteral(p.key.text)
                : ts.isNumericLiteral(p.key)
                    ? p.key.text
                    : undefined;
            if (k === undefined) {
                this.err(p.key, "object-literal", "Computed keys are not supported.");
                return;
            }
            const v = this.val(p.value, value);
            items.push(i ? ", " : "", k, " => ", ...v.items);
        });
        items.push("]");
        return { items, ty: expected, prec: ATOM };
    }
    // ---- calls ----
    lowerCall(node, expected) {
        void expected;
        if (node.questionDotToken)
            return this.bad(node, "optional-chain", "Optional chaining");
        if (authoringCallKind(this.checker, node)) {
            return this.bad(node, "nested", "A client construct inside client code", "client.state/shared/watch/handler/bind/fn/onInit/onFrame must be called outside closures.");
        }
        if (isActionFactoryCall(this.checker, node)) {
            return this.bad(node, "action", "`action(...)` inside client code", "Create the action outside the closure and call `.trigger()` on it.");
        }
        if (node.arguments.some(ts.isSpreadElement))
            return this.bad(node, "spread", "Spread arguments");
        const callee = unparen(node.expression);
        if (ts.isPropertyAccessExpression(callee))
            return this.methodCall(node, callee);
        if (ts.isIdentifier(callee)) {
            const symbol = this.checker.getSymbolAtLocation(callee);
            const declaration = symbol?.declarations?.[0];
            let owner = declaration;
            while (owner && !ts.isImportDeclaration(owner))
                owner = owner.parent;
            if (owner &&
                ts.isStringLiteral(owner.moduleSpecifier) &&
                !["maniatsx/client", "maniatsx/maniascript"].includes(owner.moduleSpecifier.text))
                return this.bad(node, "import", `Calling an import from ${owner.moduleSpecifier.text}`);
            const k = this.a.classify(callee, this.closure);
            if (k.k === "vecCtor")
                return this.vecCtor(node, k.name);
            if (k.k === "fn")
                return this.fnCall(node, callee.text, k.ty);
            if (k.k === "function" || k.k === "capture" || k.k === "local" || k.k === "apiValue") {
                return this.bad(node, "call", `Calling \`${callee.text}\``, "Only game API functions and module-level `client.fn` helpers can be called from client code.");
            }
            return this.bad(node, "call", `Calling \`${callee.text}\``);
        }
        return this.bad(node, "call", "This call");
    }
    vecCtor(node, name) {
        const real = name === "vec2" || name === "vec3";
        const n = name.endsWith("3") ? 3 : 2;
        if (node.arguments.length !== n)
            return this.bad(node, "call", `\`${name}\` with ${node.arguments.length} arguments`);
        const args = node.arguments.map((a) => this.val(a, real ? "Real" : "Integer"));
        const items = ["<"];
        args.forEach((a, i) => items.push(...(i ? [", ", ...a.items] : a.items)));
        items.push(">");
        return { items, ty: (name[0].toUpperCase() + name.slice(1)), prec: ATOM };
    }
    fnCall(node, text, ty) {
        const sig = ty.fn;
        if (node.arguments.length !== sig.params.length) {
            return this.bad(node, "call", `Calling \`${text}\` with ${node.arguments.length} arguments (it takes ${sig.params.length})`);
        }
        const args = node.arguments.map((a, i) => this.val(a, sig.params[i].ty));
        return { items: [{ kind: "fn", expr: text }, ...this.argList(args)], ty: sig.ret, prec: ATOM };
    }
    argList(args) {
        const items = ["("];
        args.forEach((a, i) => items.push(...(i ? [", ", ...a.items] : a.items)));
        items.push(")");
        return items;
    }
    // Picks the overload whose parameters fit and lowers the arguments against it
    withDecls(node, decls) {
        const args = node.arguments.map((a) => this.val(a));
        const candidates = decls.map((d) => ({
            d,
            params: d.parameters.map((p) => this.quietly(() => this.a.tyFromTypeNode(p.type, p))),
            required: d.parameters.filter((p) => !p.questionToken && !p.initializer).length,
        }));
        const fits = candidates.find((c) => args.length >= c.required &&
            args.length <= c.params.length &&
            args.every((a, i) => compat(c.params[i], a.ty)));
        const chosen = fits ?? candidates.find((c) => args.length >= c.required && args.length <= c.params.length);
        if (!chosen) {
            this.err(node, "overload", `No signature of \`${this.snippet(node.expression)}\` takes ${args.length} argument(s) of these types (${args.map((a) => msName(a.ty)).join(", ")}).`);
            return { args, ret: "Void" };
        }
        if (!fits) {
            this.err(node, "overload", `The arguments (${args.map((a) => msName(a.ty)).join(", ")}) do not match any signature of \`${this.snippet(node.expression)}\`. Check Integer vs Real; convert explicitly with MathLib.ToReal or MathLib.NearestInteger.`);
        }
        const final = args.map((a, i) => {
            const p = chosen.params[i];
            if (hasNum(a.ty))
                return this.val(node.arguments[i], p);
            this.coerce(a, p, node.arguments[i]);
            return a;
        });
        return { args: final, ret: this.a.tyFromTypeNode(chosen.d.type, chosen.d) };
    }
    declsOf(name) {
        const sym = this.checker.getSymbolAtLocation(name);
        return (sym?.declarations ?? []).filter((d) => ts.isMethodSignature(d) || ts.isMethodDeclaration(d));
    }
    methodCall(node, callee) {
        if (callee.questionDotToken)
            return this.bad(node, "optional-chain", "Optional chaining");
        const name = callee.name.text;
        const recvNode = unparen(callee.expression);
        // Inline action("x").trigger(...)
        if (ts.isCallExpression(recvNode) &&
            isActionFactoryCall(this.checker, recvNode) &&
            name === "trigger") {
            const lit = recvNode.arguments[0];
            if (!lit || !ts.isStringLiteral(lit))
                return this.bad(recvNode, "action", "An action with a non-literal name inside client code", "Create the action outside the closure.");
            return this.trigger(node, atom(stringLiteral(lit.text), "Text"));
        }
        if (ts.isIdentifier(recvNode)) {
            const rk = this.a.classify(recvNode, this.closure);
            if (rk.k === "global")
                return this.globalCall(node, callee, rk.name);
            if (rk.k === "ml") {
                const { args, ret } = this.withDecls(node, this.declsOf(callee.name));
                return { items: [name, ...this.argList(args)], ty: ret, prec: ATOM };
            }
            if (rk.k === "lib") {
                const { args, ret } = this.withDecls(node, this.declsOf(callee.name));
                return {
                    items: [libRef(rk.name), `::${name}`, ...this.argList(args)],
                    ty: ret,
                    prec: ATOM,
                };
            }
        }
        const fnSym = this.fnHandle(callee);
        if (fnSym)
            return this.fnCall(node, callee.getText(), fnSym);
        const recv = this.lower(recvNode);
        if (recv.ty === "Action" && name === "trigger")
            return this.trigger(node, recv);
        if (typeof recv.ty === "object" && "array" in recv.ty)
            return this.arrayMethod(node, name, recv, recv.ty.array);
        if (recv.ty === "Text") {
            return this.bad(node, "text-method", `The string method \`.${name}\``, "Use TextLib functions such as TextLib.SubString, TextLib.Length, TextLib.Replace.");
        }
        if (typeof recv.ty === "object" && "record" in recv.ty) {
            return this.bad(node, "record-method", `The record method \`.${name}\``, "Use Object.keys(rec) and indexing.");
        }
        if (typeof recv.ty === "object" && "state" in recv.ty) {
            return this.bad(node, "handle", `\`.${name}\` on a state handle`, "Use `.value`.");
        }
        if (typeof recv.ty === "object" && "shared" in recv.ty) {
            return this.bad(node, "handle", `\`.${name}\` on a shared handle`, "Use `.value`.");
        }
        if (typeof recv.ty === "object" && "ref" in recv.ty) {
            return this.bad(node, "handle", `\`.${name}\` on a ref handle`, "Use `.control`.");
        }
        const decls = this.declsOf(callee.name);
        if (decls.length === 0)
            return this.bad(node, "call", `Calling \`.${name}\``, "Only game API methods are available.");
        const { args, ret } = this.withDecls(node, decls);
        return {
            items: [...operand(recv, ATOM, false), ".", name, ...this.argList(args)],
            ty: ret,
            prec: ATOM,
        };
    }
    fnHandle(callee) {
        const sym = resolveSymbol(this.checker, callee.name);
        const decl = sym?.valueDeclaration;
        if (!decl || !ts.isVariableDeclaration(decl) || !decl.initializer)
            return undefined;
        const init = unparen(decl.initializer);
        if (!ts.isCallExpression(init) || authoringCallKind(this.checker, init) !== "fn")
            return undefined;
        return this.a.declTy(sym, callee);
    }
    trigger(node, action) {
        const args = node.arguments.map((a) => this.val(a, "Text"));
        const items = ["TriggerPageAction(", ...action.items];
        for (const a of args)
            items.push(' ^ "|" ^ ', ...operand(a, CONCAT, true));
        items.push(")");
        return { items, ty: "Void", prec: ATOM };
    }
    arrayMethod(node, name, recv, elem) {
        const r = operand(recv, ATOM, false);
        const argc = node.arguments.length;
        const one = () => this.val(node.arguments[0], elem);
        if (name === "push" && argc === 1)
            return { items: [...r, ".add(", ...one().items, ")"], ty: "Void", prec: ATOM };
        if (name === "includes" && argc === 1)
            return { items: [...r, ".exists(", ...one().items, ")"], ty: "Boolean", prec: ATOM };
        if (name === "indexOf" && argc === 1)
            return { items: [...r, ".keyof(", ...one().items, ")"], ty: "Integer", prec: ATOM };
        if (name === "splice" && argc === 2) {
            const count = node.arguments[1];
            if (ts.isNumericLiteral(count) && count.text === "1") {
                const idx = this.val(node.arguments[0], "Integer");
                return { items: [...r, ".removekey(", ...idx.items, ")"], ty: "Void", prec: ATOM };
            }
        }
        return this.bad(node, "array-method", `The array method \`.${name}\` with ${argc} argument(s)`, "Supported: push(x), includes(x), indexOf(x), splice(i, 1), length. Use a for/while loop for map/filter/reduce.");
    }
    globalCall(node, callee, global) {
        const name = callee.name.text;
        if (global === "Math") {
            const lib = MATH_FNS[name];
            if (name === "random") {
                return { items: [libRef("MathLib"), "::Rand(0., 1.)"], ty: "Real", prec: ATOM };
            }
            if (!lib)
                return this.bad(node, "math", `\`Math.${name}\``, "Use the MathLib functions directly.");
            const { args, ret } = this.withDecls(node, this.a.libMember("MathLib", lib));
            return { items: [libRef("MathLib"), `::${lib}`, ...this.argList(args)], ty: ret, prec: ATOM };
        }
        if (global === "console" && name === "log") {
            const args = node.arguments.map((a) => this.val(a));
            if (args.length === 0)
                return atom('log("")', "Void");
            const parts = [];
            args.forEach((a, i) => {
                if (i)
                    parts.push(atom('" "', "Text"));
                parts.push(a);
            });
            const text = this.concat(parts, true);
            return { items: ["log(", ...text.items, ")"], ty: "Void", prec: ATOM };
        }
        if (global === "Object" && name === "keys" && node.arguments.length === 1) {
            const rec = this.val(node.arguments[0]);
            if (typeof rec.ty === "object" && "record" in rec.ty) {
                // doc.h has no `.keys`, so collect them with a foreach into a temp
                if (!this.out || this.lazy > 0) {
                    return this.bad(node, "keys", "`Object.keys` in a binding or on the right of && or ||", "Assign it to a local first.");
                }
                const out = this.out;
                const ty = { array: rec.ty.record.key };
                const t = this.tmpName();
                this.declared++;
                out.line(`declare ${msName(ty)} ${t};`);
                out.line("foreach (", `${t}_K => ${t}_V in `, rec.items, ") {");
                out.line(`  ${t}.add(${t}_K);`);
                out.line("}");
                return atom(t, ty);
            }
            return this.bad(node, "keys", "`Object.keys` on a non-record value");
        }
        if (global === "Object" && name === "entries") {
            return this.bad(node, "entries", "`Object.entries` outside a for-of loop", "Use `for (const [k, v] of Object.entries(rec))`.");
        }
        return this.bad(node, "global", `\`${global}.${name}\``, global === "Date" || global === "JSON" ? "ManiaScript has TimeLib and no JSON." : "");
    }
}
