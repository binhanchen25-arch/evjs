# 插件

evjs 插件扩展构建流水线的自定义行为 —— 从注入构建器规则、修改输出 HTML，到收集构建元数据用于 CI/CD。插件在 `ev.config.ts` 中声明，按顺序执行。

## 快速示例

```ts
import { defineConfig } from "@evjs/ev";

export default defineConfig({
  plugins: [
    {
      name: "build-timer",
      setup(ctx) {
        let t0: number;
        return {
          buildStart() {
            t0 = Date.now();
            console.log(`构建中 (${ctx.mode})...`);
          },
          buildEnd(result) {
            console.log(`完成，耗时 ${Date.now() - t0}ms`);
            console.log(`${result.clientManifest.assets.js.length} 个 JS 资源`);
          },
        };
      },
    },
  ],
});
```

## 插件结构

每个插件是一个包含 `name`，以及可选 `config()` / `setup()` 函数的对象：

```ts
interface EvPlugin {
  /** 插件名称 —— 用于日志和错误信息。 */
  name: string;

  /** 在默认值解析前修改用户原始配置。 */
  config?: (
    config: EvConfig,
    ctx: EvPluginConfigContext,
  ) => EvConfig | undefined | Promise<EvConfig | undefined>;

  /** 初始化插件，返回生命周期钩子。 */
  setup?: (
    ctx: EvPluginContext,
  ) => EvPluginHooks | undefined | Promise<EvPluginHooks | undefined>;
}
```

### Config Hook

`config` hook 在 evjs 解析默认配置前执行。它适合修改框架级配置，尤其是那些会影响派生配置、开发代理或运行时代码注入的选项，例如 `server.endpoint`。

```ts
export default defineConfig({
  plugins: [
    {
      name: "custom-function-endpoint",
      config(config) {
        config.server = {
          ...(typeof config.server === "object" ? config.server : {}),
          endpoint: "/api/rpc",
        };
        return config;
      },
    },
  ],
});
```

如果只是应用自己配置服务端函数端点，直接在 `defineConfig` 中设置 `server.endpoint` 即可。只有需要由插件统一注入或封装这类配置时，才使用 `config` hook。

### Setup 上下文

`setup` 函数接收一个包含当前模式和完整解析配置的上下文：

```ts
interface EvPluginContext {
  mode: "development" | "production";
  cwd: string;
  config: ResolvedEvConfig;
}
```

所有返回的钩子通过闭包共享状态 —— 在 `setup()` 中初始化共享变量，返回引用它们的钩子。

## 生命周期钩子

钩子在构建流水线的特定节点运行：

```mermaid
flowchart LR
    A[config] --> B["resolveConfig"]
    B --> C[setup]
    C --> D[buildStart]
    D --> E[bundlerConfig]
    E --> F["bundler 编译"]
    F --> G["HTML 生成"]
    G --> H[transformHtml]
    H --> I[buildEnd]
```

| 钩子 | 签名 | 时机 |
|------|------|------|
| `config` | `(config, ctx) => EvConfig \| undefined \| Promise<...>` | 默认配置解析前 |
| `buildStart` | `() => void \| Promise<void>` | 编译开始前 |
| `bundlerConfig` | `(config, ctx) => void` | 构建器配置创建期间 |
| `transformHtml` | `(doc, result) => void \| Promise<void>` | 资源注入后、HTML 输出前 |
| `buildEnd` | `(result) => void \| Promise<void>` | 生产构建编译完成后 |

所有钩子均可异步（返回 `Promise`）。

`config` 用于修改 evjs 框架配置；`bundlerConfig` 只用于修改底层构建器配置。不要用 `bundlerConfig` 改服务端函数端点这类运行时协议配置，因为它无法同步影响开发代理等框架派生配置。

---

### `buildStart`

编译开始前运行一次。用于日志记录、初始化计时器或设置外部服务。

```ts
setup() {
  return {
    buildStart() {
      console.log("编译开始...");
    },
  };
}
```

---

### `bundlerConfig`

直接修改底层构建器配置。应使用当前构建器对应的类型辅助函数，避免依赖类型断言或错误的配置结构。

```ts
setup() {
  return {
    bundlerConfig(config, ctx) {
      // 优先使用下方的类型辅助函数修改特定构建器配置。
    },
  };
}
```

#### 类型安全的构建器配置

通常情况下，插件只需支持项目实际使用的构建器即可。evjs 默认使用 `utoopack`。导入 `utoopack()` 辅助函数即可获得完整的 TypeScript 支持：

```ts
import { mergeConfig, utoopack } from "@evjs/bundler-utoopack";

{
  name: "yaml-support",
  setup() {
    return {
      bundlerConfig: utoopack((cfg) => {
        mergeConfig(cfg, {
          module: { rules: { ".yaml": { type: "json" } } },
        });
      }),
    };
  },
}
```

这些辅助函数会包装你的回调，并仅在对应的构建器处于激活状态时执行。

---

### `transformHtml`

在 evjs 注入 `<script>` 和 `<link>` 标签之后、文件写入磁盘之前，修改输出 HTML **文档**。

钩子接收一个已解析的 DOM 文档（`EvDocument`）—— 使用标准 DOM 方法操作它。无需脆弱的字符串替换。

```ts
setup() {
  return {
    transformHtml(doc, result) {
      // 注入 <meta> 标签
      const meta = doc.createElement("meta");
      meta.setAttribute("name", "generator");
      meta.setAttribute("content", "evjs");
      doc.head?.appendChild(meta);

      // 注入包含构建信息的注释
      const count = result.clientManifest.assets.js.length;
      const comment = doc.createComment(` ${count} 个 JS 资源 `);
      doc.head?.appendChild(comment);
    },
  };
}
```

#### 多插件协作

当多个插件定义 `transformHtml` 时，它们都接收**相同的文档**，变更按顺序累积：

```ts
plugins: [
  pluginA,  // 添加 <meta name="a">
  pluginB,  // 添加 <meta name="b"> —— 可以看到 pluginA 的 <meta> 已在 DOM 中
]
```

#### `EvDocument` API

`EvDocument` 接口是标准 DOM API 的构建器无关子集。主要方法：

| 类别 | 方法 |
|------|------|
| **查询** | `querySelector()`, `querySelectorAll()`, `getElementById()` |
| **属性** | `getAttribute()`, `setAttribute()`, `removeAttribute()`, `hasAttribute()` |
| **树操作** | `appendChild()`, `removeChild()`, `insertBefore()`, `append()`, `prepend()`, `remove()` |
| **内容** | `insertAdjacentHTML()`, `innerHTML`（读写）, `outerHTML`（只读）, `textContent` |
| **创建** | `createElement()`, `createTextNode()`, `createComment()` |
| **遍历** | `head`, `body`, `parentNode`, `firstChild`, `children`, `childNodes` |

导入类型用于显式标注：

```ts
import type { EvDocument } from "@evjs/ev";
```

---

### `buildEnd`

生产构建编译完成后运行。接收包含两个 manifest 的 `EvBuildResult`：

```ts
interface EvBuildResult {
  clientManifest: ClientManifest;      // 资源、路由
  serverManifest?: ServerManifest;     // entry、fns（server: false 时为 undefined）
  isRebuild: boolean;                 // 常规生产构建为 false
}
```

```ts
setup() {
  return {
    buildEnd(result) {
      console.log("JS:", result.clientManifest.assets.js);
      console.log("CSS:", result.clientManifest.assets.css);

      if (result.serverManifest) {
        console.log("服务端函数:", Object.keys(result.serverManifest.fns));
      }
    },
  };
}
```

## 实用示例

### 注入构建时常量

```ts
import { mergeConfig, utoopack } from "@evjs/bundler-utoopack";

{
  name: "env-inject",
  setup() {
    return {
      bundlerConfig: utoopack((cfg) => {
        mergeConfig(cfg, {
          define: {
            __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
            __APP_VERSION__: JSON.stringify("1.0.0"),
          },
        });
      }),
    };
  },
}
```

### 生成部署 Manifest

```ts
import fs from "node:fs";

{
  name: "deploy-manifest",
  setup(ctx) {
    return {
      buildEnd(result) {
        fs.writeFileSync(
          "dist/deploy.json",
          JSON.stringify({
            builtAt: new Date().toISOString(),
            mode: ctx.mode,
            js: result.clientManifest.assets.js,
            css: result.clientManifest.assets.css,
            hasServer: !!result.serverManifest,
          }, null, 2),
        );
      },
    };
  },
}
```

### 为脚本添加 CSP Nonce

```ts
import crypto from "node:crypto";

{
  name: "csp-nonce",
  setup() {
    return {
      transformHtml(doc) {
        const nonce = crypto.randomBytes(16).toString("base64");

        // 为所有注入的脚本添加 nonce
        for (const script of doc.querySelectorAll("script")) {
          script.setAttribute("nonce", nonce);
        }

        // 注入 CSP meta 标签
        const meta = doc.createElement("meta");
        meta.setAttribute("http-equiv", "Content-Security-Policy");
        meta.setAttribute(
          "content",
          `script-src 'nonce-${nonce}' 'strict-dynamic'`,
        );
        doc.head?.appendChild(meta);
      },
    };
  },
}
```

### 注入统计分析代码

```ts
{
  name: "analytics",
  setup() {
    return {
      transformHtml(doc) {
        doc.body?.insertAdjacentHTML(
          "beforeend",
          `<script defer src="https://analytics.example.com/script.js"
                  data-website-id="abc-123"></script>`,
        );
      },
    };
  },
}
```

## 示例项目

查看 [`examples/plugin-authoring`](https://github.com/afx-team/evjs/tree/main/examples/plugin-authoring) 获取演示插件钩子的完整示例。
