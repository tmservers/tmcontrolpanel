interface EsbuildMessage {
    text: string;
    location?: {
        file: string;
        line: number;
        column: number;
        length?: number;
        lineText?: string;
    };
}
interface EsbuildBuild {
    onLoad(options: {
        filter: RegExp;
    }, callback: (args: {
        path: string;
    }) => Promise<{
        contents?: string;
        loader?: "ts" | "tsx";
        errors?: EsbuildMessage[];
        warnings?: EsbuildMessage[];
    } | null>): void;
}
export interface EsbuildPluginOptions {
    rootDir?: string;
    tsconfigPath?: string;
}
export interface EsbuildPlugin {
    name: string;
    setup(build: EsbuildBuild): void;
}
export declare function maniatsxEsbuildPlugin(options?: EsbuildPluginOptions): EsbuildPlugin;
export {};
