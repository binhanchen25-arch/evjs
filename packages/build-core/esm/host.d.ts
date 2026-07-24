import type { AssetGroup, BuildOutput, BuildOutputServerModule, BuildPlan, BuildPlanUpdate } from "./manifest.js";
export type BuildHostKind = "node" | "browser" | "custom";
export interface BuildHost {
    readonly kind: BuildHostKind;
    readonly root: string;
    readonly capabilities: BuildHostCapabilities;
    readonly fs: BuildHostFs;
    readonly path: BuildHostPath;
    readonly parser: BuildHostParser;
    readonly modules: BuildHostModules;
    readonly diagnostics: BuildHostDiagnostics;
    readonly bundler?: BuildHostBundler;
    readonly watch?: BuildHostWatch;
    readonly artifacts?: BuildHostArtifacts;
}
export interface BuildHostCapabilities {
    readonly filesystem: "read-only" | "read-write" | "virtual" | "none";
    readonly modules: "native" | "sandbox" | "remote" | "none";
    readonly parser: "native" | "wasm" | "remote" | "none";
    readonly watch: "native" | "hosted" | "polling" | "none";
    readonly bundler: "native" | "wasm" | "remote" | "none";
    readonly serverRuntime: "node-process" | "fetch" | "remote" | "none";
}
export interface BuildHostFs {
    readFile(file: string): Promise<string>;
    writeFile(file: string, source: string): Promise<void>;
    exists(file: string): Promise<boolean>;
    stat(file: string): Promise<BuildHostFileStat | undefined>;
    readDir(dir: string): Promise<BuildHostDirectoryEntry[]>;
    walk(dir: string, options?: BuildHostWalkOptions): Promise<string[]>;
    remove(file: string, options?: BuildHostRemoveOptions): Promise<void>;
}
export interface BuildHostFileStat {
    readonly type: "file" | "directory";
    readonly revision?: string;
    readonly size?: number;
    readonly mtimeMs?: number;
}
export interface BuildHostDirectoryEntry {
    readonly name: string;
    readonly type: "file" | "directory";
}
export interface BuildHostWalkOptions {
    readonly extensions?: readonly string[];
    readonly includeDirectories?: boolean;
}
export interface BuildHostRemoveOptions {
    readonly recursive?: boolean;
}
export interface BuildHostPath {
    resolve(...parts: string[]): string;
    join(...parts: string[]): string;
    relative(from: string, to: string): string;
    dirname(file: string): string;
    basename(file: string): string;
    extname(file: string): string;
    isAbsolute(file: string): boolean;
    normalize(file: string): string;
    toPosix(file: string): string;
    toProjectPath(file: string): string;
    isInsideRoot(file: string): boolean;
}
export interface BuildHostParser {
    parseModule(source: string, options?: BuildHostParseOptions): BuildHostParsedModule;
    formatParseError(error: unknown, options?: BuildHostParseErrorOptions): string;
}
export interface BuildHostParseOptions {
    readonly filename?: string;
    readonly syntax?: "typescript" | "ecmascript";
    readonly jsx?: boolean;
}
export interface BuildHostParsedModule<TAst = unknown> {
    readonly source: string;
    readonly ast?: TAst;
    readonly error?: unknown;
}
export interface BuildHostParseErrorOptions {
    readonly firstLine?: boolean;
}
export interface BuildHostModules {
    resolve(specifier: string, options?: BuildHostResolveOptions): Promise<string | undefined>;
    load<TModule = unknown>(specifier: string, options?: BuildHostLoadOptions): Promise<TModule>;
    toFileUrl?(file: string): string;
    invalidate?(specifier?: string): Promise<void> | void;
}
export interface BuildHostResolveOptions {
    readonly importer?: string;
    readonly aliases?: Readonly<Record<string, string>>;
    readonly conditions?: readonly string[];
    readonly extensions?: readonly string[];
}
export interface BuildHostLoadOptions {
    readonly importer?: string;
    readonly cache?: boolean;
}
export interface BuildHostDiagnostics {
    report(diagnostic: BuildHostDiagnostic): void;
}
export interface BuildHostDiagnostic {
    readonly level: "info" | "warning" | "error";
    readonly code?: string;
    readonly message: string;
    readonly file?: string;
    readonly line?: number;
    readonly column?: number;
}
export interface BuildHostBundler {
    build(plan: BuildPlan): Promise<BuildHostBundlerFacts>;
    dev?(plan: BuildPlan, callbacks: BuildHostDevCallbacks): Promise<BuildHostDevController>;
}
export interface BuildHostBundlerFacts {
    readonly clientEntryAssets?: Readonly<Record<string, AssetGroup>>;
    readonly firstClientEntryAssets?: AssetGroup;
    readonly serverEntryAssets?: Readonly<Record<string, AssetGroup>>;
    readonly serverEntry?: string;
    readonly serverAssets?: AssetGroup;
    readonly serverModules?: readonly BuildOutputServerModule[];
    readonly loadServerModule?: (asset: string) => Promise<unknown>;
    readonly rscManifests?: {
        readonly clientReferenceManifest?: Readonly<Record<string, unknown>>;
    };
}
export interface BuildHostDevCallbacks {
    onBuildFacts(facts: BuildHostBundlerFacts, options?: {
        isRebuild?: boolean;
    }): void | Promise<void>;
    onServerRuntimeReady?(): void | Promise<void>;
}
export interface BuildHostDevController {
    close?(): void | Promise<void>;
    updatePlan?(update: BuildPlanUpdate): void | Promise<void>;
}
export interface BuildHostWatch {
    watch(files: readonly string[], callback: BuildHostWatchCallback): BuildHostWatchSubscription;
}
export type BuildHostWatchCallback = (changes: readonly BuildHostFileChange[]) => void | Promise<void>;
export interface BuildHostFileChange {
    readonly file: string;
    readonly kind: "created" | "updated" | "deleted";
    readonly revision?: string;
}
export interface BuildHostWatchSubscription {
    close(): void | Promise<void>;
}
export interface BuildHostArtifacts {
    emitBuildOutput(output: BuildOutput): Promise<void>;
    writeText(file: string, source: string): Promise<void>;
    remove(file: string): Promise<void>;
}
export interface CapabilityGate {
    assertCapability(capability: keyof BuildHostCapabilities, requirement?: string): void;
}
//# sourceMappingURL=host.d.ts.map