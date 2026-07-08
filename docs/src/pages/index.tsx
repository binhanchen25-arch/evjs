import Link from "@docusaurus/Link";
import Translate, { translate } from "@docusaurus/Translate";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import type { ReactNode } from "react";
import styles from "./index.module.css";

/* ─── Feature data ─── */

type FeatureIconName =
  | "routes"
  | "ir"
  | "plugin"
  | "server"
  | "bundler"
  | "deploy";

type FlowStep = {
  label: string;
  title: string;
  description: string;
};

function useFeatures(): Array<{
  icon: FeatureIconName;
  title: string;
  description: string;
}> {
  return [
    {
      icon: "routes",
      title: translate({
        id: "homepage.feature.conventions.title",
        message: "File Conventions",
      }),
      description: translate({
        id: "homepage.feature.conventions.description",
        message:
          "src/pages, src/apis, middleware, layouts, and server modules stay as the application source of truth.",
      }),
    },
    {
      icon: "ir",
      title: translate({
        id: "homepage.feature.frameworkIr.title",
        message: "Framework IR",
      }),
      description: translate({
        id: "homepage.feature.frameworkIr.description",
        message:
          ".ev records discovered graphs, entry facades, generated modules, slot attachments, and import edges.",
      }),
    },
    {
      icon: "plugin",
      title: translate({
        id: "homepage.feature.plugins.title",
        message: "Plugin Contributions",
      }),
      description: translate({
        id: "homepage.feature.plugins.description",
        message:
          "Plugins declare generated artifacts and attach them to framework slots without bundler-specific loaders.",
      }),
    },
    {
      icon: "server",
      title: translate({
        id: "homepage.feature.serverBoundary.title",
        message: "Server Boundary",
      }),
      description: translate({
        id: "homepage.feature.serverBoundary.description",
        message:
          "Server functions, src/apis routes, middleware, SSR, PPR, and RSC share one Hono-based runtime path.",
      }),
    },
    {
      icon: "bundler",
      title: translate({
        id: "homepage.feature.bundlers.title",
        message: "Bundler Adapters",
      }),
      description: translate({
        id: "homepage.feature.bundlers.description",
        message:
          "Utoopack and webpack consume the same build plan and .ev entries instead of duplicating framework assembly.",
      }),
    },
    {
      icon: "deploy",
      title: translate({
        id: "homepage.feature.deployment.title",
        message: "Deployment Output",
      }),
      description: translate({
        id: "homepage.feature.deployment.description",
        message:
          "Build output separates browser assets, server bundles, manifests, and deployment metadata for adapters.",
      }),
    },
  ];
}

function useFlowSteps(): FlowStep[] {
  return [
    {
      label: "01",
      title: translate({
        id: "homepage.flow.conventions.title",
        message: "Discover conventions",
      }),
      description: translate({
        id: "homepage.flow.conventions.description",
        message:
          "Read src/pages, src/apis, middleware, server functions, and ev.config.ts.",
      }),
    },
    {
      label: "02",
      title: translate({
        id: "homepage.flow.ir.title",
        message: "Materialize .ev",
      }),
      description: translate({
        id: "homepage.flow.ir.description",
        message:
          "Write generated entries, plugin modules, slots, import edges, and manifest data.",
      }),
    },
    {
      label: "03",
      title: translate({
        id: "homepage.flow.bundle.title",
        message: "Bundle once",
      }),
      description: translate({
        id: "homepage.flow.bundle.description",
        message:
          "Let Utoopack or webpack consume the same framework build plan.",
      }),
    },
    {
      label: "04",
      title: translate({
        id: "homepage.flow.output.title",
        message: "Deploy",
      }),
      description: translate({
        id: "homepage.flow.output.description",
        message:
          "Emit browser files, server runtime output, and deployment metadata.",
      }),
    },
  ];
}

/* ─── Hero ─── */

function HeroSection() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>evjs</h1>
        <p className={styles.heroSubtitle}>
          <Translate id="homepage.tagline">
            File-convention React framework with an agent-readable .ev IR
          </Translate>
        </p>
        <p className={styles.heroDescription}>
          <Translate id="homepage.hero.description">
            Keep application code in src/pages, src/apis, and server modules.
            evjs generates framework-owned entries, plugin modules, slots, and
            manifests before the bundler runs.
          </Translate>
        </p>
        <div className={styles.heroButtons}>
          <Link className={styles.btnPrimary} to="/docs/quick-start">
            <Translate id="homepage.getStarted">Get Started</Translate>
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            className={styles.btnSecondary}
            to="/docs/generated-contributions"
          >
            <Translate id="homepage.exploreIr">Explore .ev IR</Translate>
          </Link>
          <Link
            className={styles.btnSecondary}
            href="https://github.com/evaijs/evjs"
          >
            <GitHubIcon />
            GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── Framework IR Preview ─── */

function FrameworkIRPreview() {
  const steps = useFlowSteps();
  return (
    <section className={styles.irSection}>
      <div className={styles.irContainer}>
        <div className={styles.irIntro}>
          <div className={styles.featuresLabel}>
            <Translate id="homepage.ir.label">Generated Framework IR</Translate>
          </div>
          <h2 className={styles.irTitle}>
            <Translate id="homepage.ir.title">
              Framework code is visible before bundling
            </Translate>
          </h2>
          <p className={styles.irDescription}>
            <Translate id="homepage.ir.description">
              Run ev prepare to inspect .ev without producing dist. Agents,
              plugin authors, and reviewers can read the generated graph instead
              of reverse-engineering virtual loaders.
            </Translate>
          </p>
        </div>
        <div className={styles.flowGrid}>
          {steps.map((step) => (
            <div key={step.label} className={styles.flowStep}>
              <span className={styles.flowLabel}>{step.label}</span>
              <h3 className={styles.flowTitle}>{step.title}</h3>
              <p className={styles.flowDescription}>{step.description}</p>
            </div>
          ))}
        </div>
        <div className={styles.irShell}>
          <div className={styles.irShellHeader}>
            <span>.ev</span>
            <span>ev prepare</span>
          </div>
          <pre className={styles.irTree}>
            {[
              ".ev/",
              "  framework/",
              "    app-graph.json",
              "    build-plan.json",
              "  entries/",
              "    main.ts",
              "    server.ts",
              "  plugins/",
              "    qiankun/slave/entry-wrapper.ts",
              "  manifest.json",
              "  types.d.ts",
            ].join("\n")}
          </pre>
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */

function FeaturesSection() {
  const features = useFeatures();
  return (
    <section className={styles.features}>
      <div className={styles.featuresContainer}>
        <div className={styles.featuresHeading}>
          <div className={styles.featuresLabel}>
            <Translate id="homepage.features.label">Core Surfaces</Translate>
          </div>
          <h2 className={styles.featuresTitle}>
            <Translate id="homepage.features.title">
              One framework graph for application code, plugins, and output
            </Translate>
          </h2>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((feature) => (
            <div key={feature.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <FeatureIcon name={feature.icon} />
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Icons ─── */

function FeatureIcon({ name }: { name: FeatureIconName }) {
  const paths: Record<FeatureIconName, ReactNode> = {
    routes: (
      <>
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="18" cy="18" r="2.5" />
        <path d="M8.5 6H14a4 4 0 0 1 0 8h-4a4 4 0 0 0 0 8h5.5" />
      </>
    ),
    ir: (
      <>
        <path d="M4 5h16v14H4z" />
        <path d="M8 9h8M8 13h5M8 17h8" />
      </>
    ),
    plugin: (
      <>
        <path d="M8 3v5H3" />
        <path d="M16 3v5h5" />
        <path d="M8 21v-5H3" />
        <path d="M16 21v-5h5" />
        <path d="M8 8h8v8H8z" />
      </>
    ),
    server: (
      <>
        <rect x="4" y="4" width="16" height="6" rx="2" />
        <rect x="4" y="14" width="16" height="6" rx="2" />
        <path d="M8 7h.01M8 17h.01M12 7h4M12 17h4" />
      </>
    ),
    bundler: (
      <>
        <path d="M4 7h16" />
        <path d="M4 17h16" />
        <path d="M7 4v16" />
        <path d="M17 4v16" />
        <path d="m10 10 4 2-4 2v-4Z" />
      </>
    ),
    deploy: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
        <path d="M7 17h10" />
      </>
    ),
  };

  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <title>GitHub</title>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

/* ─── Page ─── */

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <HeroSection />
      <FrameworkIRPreview />
      <main>
        <FeaturesSection />
      </main>
    </Layout>
  );
}
