# 项目目录结构

evjs 默认零配置，因此必需目录应该保持很小。先从 `src/main.tsx`、
`src/pages/` 和 `src/api/` 开始；只有当应用变大时，再引入按业务拆分的
`features/`。

## 最小应用

一个可用的全栈 evjs 应用最少可以这样组织：

```text
my-evjs-app/
├── ev.config.ts              # 可选的框架配置
├── index.html                # 包含 <div id="app"> 的 HTML 模板
├── package.json
├── tsconfig.json
└── src/
    ├── main.tsx              # 客户端入口：构建路由树并渲染应用
    ├── pages/
    │   ├── __root.tsx        # 包含 <Outlet /> 的根布局
    │   └── home.tsx          # / 路由组件
    └── api/
        └── users.server.ts   # "use server" 服务端函数
```

`ev dev` 和 `ev build` 会为 `entry` 与 `html` 使用约定默认值：

```ts
// ev.config.ts
import { defineConfig } from "@evjs/ev";

export default defineConfig({
  entry: "./src/main.tsx",
  html: "./index.html",
});
```

## 全栈应用

应用变大后，建议清晰拆分客户端组装、服务端代码和共享 UI：

```text
src/
├── main.tsx
├── global.ts                 # 可选：路由类型注册 / transport 初始化
├── pages/                    # 路由声明和页面级组装
│   ├── __root.tsx
│   ├── home.tsx
│   └── users/
│       ├── index.tsx
│       └── detail.tsx
├── api/                      # 服务端边界
│   ├── users.server.ts       # 服务端函数："use server"
│   ├── posts.server.ts
│   ├── health.routes.ts      # 可选 HTTP 路由处理器
│   └── posts.routes.ts
├── server.ts                 # 可选：自定义服务端入口
├── components/               # 全局可复用 UI
├── features/                 # 中大型应用的业务模块
│   └── auth/
│       ├── components/
│       ├── hooks/
│       ├── model.ts
│       └── types.ts
├── lib/                      # 共享客户端、适配器、工具函数
├── hooks/                    # 全局 React hooks
└── styles.css                # 全局样式 / Tailwind 入口
```

## 路由文件

`src/pages/` 用于路由声明和页面组装。evjs 直接使用 TanStack Router API；
它不要求文件路由生成。

路由文件应保持轻量：

- 使用 `createRoute()` 定义路由。
- 读取路由参数和搜索参数。
- 需要时调用 loader 或服务端函数。
- 从 `features/` 或 `components/` 组合 UI。

业务逻辑通常不应该堆在路由文件里。

## 服务端边界

默认把服务端专用代码放在 `src/api/` 下。

使用 `*.server.ts` 编写服务端函数：

```ts
// src/api/users.server.ts
"use server";

export async function getUsers() {
  return [{ id: 1, name: "Ada" }];
}
```

使用 `*.routes.ts` 编写标准 Request/Response 端点：

```ts
// src/api/health.routes.ts
import { createRoute } from "@evjs/server";

export const healthRoute = createRoute("/api/health", {
  GET: async () => Response.json({ ok: true }),
});
```

在自定义服务端入口中挂载路由处理器：

```ts
// src/server.ts
import { createApp } from "@evjs/server";
import { healthRoute } from "./api/health.routes";

const app = createApp({
  routes: [healthRoute],
});

export default { fetch: app.fetch };
```

然后在配置中指定这个入口：

```ts
// ev.config.ts
import { defineConfig } from "@evjs/ev";

export default defineConfig({
  server: {
    entry: "./src/server.ts",
  },
});
```

## MPA 应用

多页应用使用顶层 `pages` 配置。每个页面有独立入口，也可以复用默认 HTML
模板：

```text
src/
├── home/
│   └── main.tsx
└── about/
    └── main.tsx
```

```ts
// ev.config.ts
import { defineConfig } from "@evjs/ev";

export default defineConfig({
  pages: {
    home: "./src/home/main.tsx",
    about: "./src/about/main.tsx",
  },
});
```

设置 `pages` 后，它会优先于单应用的 `entry` / `html` 字段。

## 扩展建议

- 小应用保持扁平即可：`pages/`、`api/`、`components/`。
- 中型应用建议用 `features/` 收纳领域相关 UI、hooks 和模型代码。
- 服务端密钥和 Node-only API 应留在 `src/api/`，或只被 `src/api/` 引用的模块中。
- 浏览器安全的共享工具放在 `lib/`。
- 静态文件放在 `public/`，应用样式从客户端入口导入。
