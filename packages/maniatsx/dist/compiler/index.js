import ts from "typescript6";
import path from "node:path";
import { Analyzer, authoringCallKind, unparen } from "./analyzer.js";
import { Lowerer } from "./lower.js";
import { toMs } from "./ty.js";
import { joinItems } from "./util.js";
// Sites are relative to root so builds are reproducible across machines
function transform(program, files, root) {
    const diagnostics = [];
    const analyzer = new Analyzer(program, program.getTypeChecker(), {
        report(node, code, message, severity = "error") {
            const file = node.getSourceFile();
            const pos = file.getLineAndCharacterOfPosition(node.getStart(file));
            diagnostics.push({
                file: file.fileName,
                line: pos.line + 1,
                column: pos.character + 1,
                code,
                message,
                severity,
            });
        },
    });
    const output = new Map();
    for (const file of files) {
        let text = file.text;
        if (!file.statements.some((s) => ts.isImportDeclaration(s) &&
            ts.isStringLiteral(s.moduleSpecifier) &&
            s.moduleSpecifier.text === "maniatsx/client")) {
            output.set(file.fileName, text);
            continue;
        }
        const edits = [];
        const visit = (node) => {
            if (ts.isCallExpression(node)) {
                const kind = authoringCallKind(analyzer.checker, node);
                if (kind) {
                    const pos = file.getLineAndCharacterOfPosition(node.getStart(file));
                    const rel = path.relative(root, file.fileName).split(path.sep).join("/");
                    const site = `${rel}:${pos.line + 1}:${pos.character + 1}`;
                    const arg = node.arguments[0];
                    const hole = (h) => h.kind === "lib"
                        ? `{ kind: "lib", lib: ${JSON.stringify(h.lib)} }`
                        : `{ kind: ${JSON.stringify(h.kind)}${h.kind === "value" ? `, type: ${JSON.stringify(h.type)}` : ""}, get: () => (${h.expr}) }`;
                    const descriptor = (items, structs = []) => {
                        const { code, holes } = joinItems(items);
                        return `{ code: ${JSON.stringify(code)}, holes: [${holes.map(hole).join(", ")}], structs: ${JSON.stringify(structs)}, site: ${JSON.stringify(site)} }`;
                    };
                    let replacement;
                    if (kind === "ref") {
                        const ty = analyzer.refClassTy(node, node);
                        if (typeof ty === "object" && "class" in ty)
                            replacement = `__mtx.ref(${JSON.stringify(ty.class)}, ${JSON.stringify(site)})`;
                    }
                    else if (kind === "state" && arg) {
                        const type = toMs(analyzer.stateArgTy(node, node));
                        const options = stateOptions(analyzer, node.arguments[1]);
                        if (type && options !== null)
                            replacement = `__mtx.state(${JSON.stringify(type)}, ${descriptor([{ kind: "value", type, expr: arg.getText(file) }])}, ${JSON.stringify(site)}${options ? `, ${JSON.stringify(options)}` : ""})`;
                    }
                    else if (kind === "shared") {
                        const key = arg && unparen(arg);
                        if (!key || !ts.isStringLiteralLike(key))
                            analyzer.report(arg ?? node, "shared-key", 'client.shared needs a string literal key as its first argument, for example `client.shared<Integer>("count", 0)`.');
                        else if (!/^[A-Za-z]\w*$/.test(key.text) || /_(V|Seen)$/.test(key.text))
                            analyzer.report(key, "shared-key", "A client.shared key may only contain letters, digits and `_`, must start with a letter and must not end in `_V` or `_Seen`.");
                        else if (!node.arguments[1])
                            analyzer.report(node, "shared-initial", "client.shared needs an initial value.");
                        else {
                            const tracked = analyzer.trackStructs(() => {
                                const ty = analyzer.stateArgTy(node, node, 1);
                                analyzer.trackNote(ty);
                                return ty;
                            });
                            const type = msWithFields(analyzer, tracked.result);
                            if (type)
                                replacement = `__mtx.shared(${JSON.stringify(key.text)}, ${JSON.stringify(type)}, ${descriptor([{ kind: "value", type, expr: node.arguments[1].getText(file) }], tracked.structs)}, ${JSON.stringify(site)})`;
                            else
                                analyzer.report(node, "shared-type", "This client.shared type cannot be written as a ManiaScript literal.");
                        }
                    }
                    else if (kind === "watch") {
                        const closure = node.arguments[1] && unparen(node.arguments[1]);
                        if (!arg ||
                            !closure ||
                            !(ts.isArrowFunction(closure) || ts.isFunctionExpression(closure)))
                            analyzer.report(node, "closure", "client.watch expects a shared handle and a function expression.");
                        else {
                            const lowerer = new Lowerer(analyzer, closure, "handler");
                            const tracked = analyzer.trackStructs(() => lowerer.lowerStatements());
                            replacement = `__mtx.watch(${arg.getText(file)}, ${descriptor(tracked.result, tracked.structs)})`;
                        }
                    }
                    else if (arg) {
                        const closure = unparen(arg);
                        if (ts.isArrowFunction(closure) || ts.isFunctionExpression(closure)) {
                            if (closure.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword))
                                analyzer.report(closure, "async", "Async functions are not supported in client code.");
                            if (closure.asteriskToken)
                                analyzer.report(closure, "generator", "Generators are not supported in client code.");
                            for (const param of closure.parameters) {
                                if (param.dotDotDotToken)
                                    analyzer.report(param.dotDotDotToken, "rest", "Rest parameters are not supported in client code.");
                            }
                            const decl = node.parent;
                            const sig = kind === "fn" && ts.isVariableDeclaration(decl)
                                ? analyzer.fnSig(node, decl)
                                : undefined;
                            const lowerer = new Lowerer(analyzer, closure, kind === "onInit"
                                ? "init"
                                : kind === "onFrame"
                                    ? "frame"
                                    : kind === "state"
                                        ? "handler"
                                        : kind, sig);
                            const tracked = analyzer.trackStructs(() => kind === "bind"
                                ? lowerer.lowerBind(undefined)
                                : {
                                    items: kind === "fn" && sig
                                        ? lowerer.lowerFn()
                                        : kind === "onInit" || kind === "onFrame"
                                            ? lowerer.lowerLifecycle()
                                            : lowerer.lowerStatements(),
                                    ty: undefined,
                                });
                            const code = descriptor(tracked.result.items, tracked.structs);
                            if (kind === "bind") {
                                const type = tracked.result.ty && toMs(tracked.result.ty);
                                if (type)
                                    replacement = `__mtx.bind(${JSON.stringify(type)}, ${code})`;
                                else
                                    analyzer.report(node, "bind-type", "Cannot determine binding type.");
                            }
                            else if (kind === "fn" && sig)
                                replacement = `__mtx.fn(${JSON.stringify(sig.name)}, ${code})`;
                            else
                                replacement = `__mtx.${kind}(${code})`;
                        }
                        else
                            analyzer.report(node, "closure", "Expected a function expression.");
                    }
                    if (replacement)
                        edits.push({ start: node.getStart(file), end: node.end, text: replacement });
                    return;
                }
            }
            ts.forEachChild(node, visit);
        };
        visit(file);
        for (const edit of edits.sort((a, b) => b.start - a.start))
            text = text.slice(0, edit.start) + edit.text + text.slice(edit.end);
        if (edits.length)
            text = `import { __mtx } from "maniatsx/client";\n` + text;
        output.set(file.fileName, text);
    }
    return { output, diagnostics };
}
// Like toMs, but structs carry their fields so the runtime can emit a struct literal
function msWithFields(analyzer, ty, depth = 0) {
    if (typeof ty === "object" && depth < 8) {
        if ("struct" in ty) {
            const fields = [];
            for (const f of analyzer.structFields(ty.struct) ?? []) {
                const type = msWithFields(analyzer, f.ty, depth + 1);
                if (!type)
                    return undefined;
                fields.push({ name: f.name, type });
            }
            return { struct: ty.struct, fields };
        }
        if ("array" in ty) {
            const inner = msWithFields(analyzer, ty.array, depth + 1);
            return inner && { array: inner };
        }
        if ("record" in ty) {
            const base = toMs(ty);
            const value = msWithFields(analyzer, ty.record.value, depth + 1);
            return base && value && typeof base === "object" && "record" in base
                ? { record: { key: base.record.key, value } }
                : undefined;
        }
    }
    return toMs(ty);
}
// Options must be literals so the compiler can bake them in; null means an error was reported
function stateOptions(analyzer, node) {
    if (!node)
        return undefined;
    const bad = (at, message) => {
        analyzer.report(at, "state-options", message);
        return null;
    };
    const literal = unparen(node);
    if (!ts.isObjectLiteralExpression(literal))
        return bad(node, "client.state options must be an object literal like `{ persist: true }`.");
    let persist = false;
    let key;
    for (const prop of literal.properties) {
        const name = ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) ? prop.name.text : "";
        const value = ts.isPropertyAssignment(prop) ? unparen(prop.initializer) : undefined;
        if (name === "persist" && value) {
            if (value.kind === ts.SyntaxKind.TrueKeyword)
                persist = true;
            else if (value.kind !== ts.SyntaxKind.FalseKeyword)
                return bad(value, "`persist` must be the literal `true` or `false`.");
        }
        else if (name === "key" && value) {
            if (!ts.isStringLiteralLike(value))
                return bad(value, "`key` must be a string literal.");
            if (!/^[A-Za-z]\w*$/.test(value.text))
                return bad(value, "`key` may only contain letters, digits and `_`, and must start with a letter.");
            key = value.text;
        }
        else
            return bad(prop, "client.state options support only `persist` and `key` as literals.");
    }
    if (key !== undefined && !persist)
        return bad(node, "`key` only applies with `persist: true`.");
    return persist ? { persist: true, ...(key !== undefined && { key }) } : undefined;
}
export function compileSource(fileName, sourceText, opts = {}) {
    const root = path.resolve(opts.rootDir ?? process.cwd());
    const name = path.resolve(root, fileName);
    try {
        const options = {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.NodeNext,
            moduleResolution: ts.ModuleResolutionKind.NodeNext,
            jsx: ts.JsxEmit.ReactJSX,
            jsxImportSource: "maniatsx",
            baseUrl: root,
            paths: {
                "maniatsx/client": ["src/client/index.ts"],
                "maniatsx/maniascript": ["src/maniascript/index.ts"],
                "maniatsx/jsx-runtime": ["src/jsx-runtime.ts"],
            },
            skipLibCheck: true,
        };
        const host = ts.createCompilerHost(options);
        const read = host.readFile.bind(host), exists = host.fileExists.bind(host);
        host.readFile = (f) => (path.resolve(f) === name ? sourceText : read(f));
        host.fileExists = (f) => path.resolve(f) === name || exists(f);
        const program = ts.createProgram([name], options, host);
        const result = transform(program, [program.getSourceFile(name)], root);
        return { code: result.output.get(name), diagnostics: result.diagnostics };
    }
    catch (error) {
        return {
            code: sourceText,
            diagnostics: [
                {
                    file: name,
                    line: 1,
                    column: 1,
                    code: "internal-error",
                    severity: "error",
                    message: `Internal compiler error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
        };
    }
}
export function compileProject({ tsconfigPath }) {
    const config = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    if (config.error)
        throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(path.resolve(tsconfigPath)));
    const program = ts.createProgram(parsed.fileNames, parsed.options);
    const result = transform(program, parsed.fileNames.map((f) => program.getSourceFile(f)).filter((f) => !!f), path.dirname(path.resolve(tsconfigPath)));
    return { files: result.output, diagnostics: result.diagnostics };
}
export function debugEmit(code, values = []) {
    return code.holes.reduce((out, hole, i) => out +
        (hole.kind === "lib"
            ? hole.lib
            : hole.kind === "value"
                ? i in values
                    ? JSON.stringify(values[i])
                    : `<hole ${i}>`
                : `<${hole.kind}>`) +
        code.code[i + 1], code.code[0] ?? "");
}
