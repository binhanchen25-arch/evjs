# @evjs/build-core

Shared framework build contracts for evjs hosts and adapters.

This package is the browser-safe home for build semantics that can be shared by
Node and Browser Sandbox hosts. The initial surface re-exports manifest
contracts from `@evjs/shared/manifest`, including `AppGraph`, `BuildPlan`,
`BuildOutput`, route resolution helpers, deployment projections, and
`linkBuildOutput()`.

`@evjs/build-core` must stay free of Node host behavior such as config loading,
filesystem access, process management, dev servers, and concrete bundler
execution. Node/CLI behavior remains in `@evjs/ev`, and browser-specific host
behavior should be implemented by a Browser Sandbox host package.

The `@evjs/build-core/host` subpath defines host-neutral interfaces for
filesystem, path, parser, module loading, diagnostics, bundling, artifacts, and
watch capabilities. It describes the contract Node and Browser Sandbox hosts
must implement; it does not provide a concrete host implementation.
