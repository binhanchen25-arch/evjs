# 配置

evjs **默认零配置**。你可以选择在项目根目录创建 `ev.config.ts` 来覆盖默认值。`defineConfig` 辅助函数提供完整的类型安全。

```ts
import { defineConfig } from "@evjs/ev";
export default defineConfig({ /* ... */ });
```

## 默认值

所有字段都是可选的，以下是内置默认值：

| 设置 | 默认值 |
|------|--------|
| `entry` | `./src/main.tsx` |
| `html` | `./index.html` |
| `dev.port` | `3000` |
| `server.dev.port` | `3001` |
| `server.endpoint` | `/api/fn` |

## 完整参考

```ts
import { defineConfig } from "@evjs/ev";

export default defineConfig({
  entry: "./src/main.tsx",
  html: "./index.html",
  dev: {
    port: 3000,
    https: false,
  },
  // 设置为 `false` 可禁用服务端（纯 CSR 模式，扁平 dist/ 输出）
  // server: false,
  server: {
    entry: "./src/server.ts",
    endpoint: "/api/fn",
    functions: {
      clientProxy: "@evjs/client/transport",
      serverRegister: "@evjs/server/register",
    },
    dev: {
      port: 3001,
      https: false,
    },
  },
});
```

## 客户端选项

## 插件

通过 `plugins` 数组注册插件。每个插件包含 `name` 和返回生命周期钩子的 `setup()` 函数：

```ts
export default defineConfig({
  plugins: [
    {
      name: "my-plugin",
      setup(ctx) {
        return {
          buildStart() { /* ... */ },
          bundlerConfig(config, ctx) { /* ... */ },
          transformHtml(doc) { /* ... */ },
          buildEnd(result) { /* ... */ },
        };
      },
    },
  ],
});
```

查看 **[插件指南](./plugins.md)** 获取完整 API 参考、`EvDocument` DOM 接口、类型安全构建器辅助函数和实用示例。

## 构建器选项

`bundler` 字段选择编译引擎。默认情况下，evjs 使用 `@evjs/bundler-utoopack` 提供的 **Utoopack 适配器**。

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `bundler` | `BundlerAdapter` | utoopack | 激活的构建器适配器。从 `@evjs/bundler-utoopack` 导入 `utoopackAdapter` 可显式选择默认的 Utoopack 后端。 |

```ts
import { defineConfig } from "@evjs/ev";
import { utoopackAdapter } from "@evjs/bundler-utoopack";

export default defineConfig({
  bundler: utoopackAdapter,
});
```

### 内置支持：CSS 和 Tailwind
evjs 包含**内置的 PostCSS/Tailwind 支持**。如果项目根目录检测到 `postcss.config.js` 文件，当前构建器适配器会自动启用 PostCSS 处理。标准 Tailwind 设置无需插件或自定义钩子。

## 服务端选项

`server` 字段接受一个对象用于全栈应用，或设置为 `false` 以完全禁用服务端（纯 CSR 模式）。

```ts
// 纯 CSR：扁平 dist/ 输出，无服务端 bundle
export default defineConfig({ server: false });
```

设置 `server: false` 时：
- 构建输出到 `dist/` 而不是 `dist/client/` + `dist/server/`
- 任何 `"use server"` 模块都会导致**构建错误**
- 开发模式下不配置 API 代理

### `server.entry`

显式服务端入口文件。提供后会覆盖自动生成的 `@evjs/server/fetch` 入口。自定义入口应默认导出带 `fetch` 的对象，通常写作 `export default { fetch: app.fetch };`。

### `server.endpoint`

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `endpoint` | `string` | `/api/fn` | 服务端函数 RPC 调用路径 |

### `server.functions`

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `clientProxy` | `string` | `@evjs/client/transport` | 客户端服务端函数桩代码使用的模块 |
| `serverRegister` | `string` | `@evjs/server/register` | 服务端函数实现注册使用的模块 |

## 示例

### 完整示例

此示例展示了一个具备自定义加载器和构建分析的生产就绪设置。

```ts
import { defineConfig } from "@evjs/ev";
import { utoopack } from "@evjs/bundler-utoopack";

export default defineConfig({
  entry: "./src/entry-client.tsx",
  server: {
    entry: "./src/entry-server.ts",
    endpoint: "/api/rpc",
    functions: {
      clientProxy: "@evjs/client/transport",
      serverRegister: "@evjs/server/register",
    },
    dev: { port: 4001 },
  },

  dev: { port: 4000 },

  plugins: [
    {
      name: "mdx-support",
      setup() {
        return {
          bundlerConfig(config, ctx) {
            utoopack((cfg) => {
              cfg.module = {
                ...cfg.module,
                rules: {
                  ...cfg.module?.rules,
                  ".mdx": { type: "raw" },
                },
              };
            })(config, ctx);
          },
        };
      },
    },
    {
      name: "build-timer",
      setup(ctx) {
        const t0 = Date.now();
        return {
          buildStart() {
            console.log(`构建中 (${ctx.mode})...`);
          },
          buildEnd(result) {
            console.log(`完成，耗时 ${Date.now() - t0}ms`);
            console.log(`资源: ${result.clientManifest.assets.js.length} 个 JS 文件`);
          },
        };
      },
    },
  ],
});
```
