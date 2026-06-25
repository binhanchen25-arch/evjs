import Link from "@docusaurus/Link";
import Translate, { translate } from "@docusaurus/Translate";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import type { ReactNode } from "react";
import styles from "./index.module.css";

/* ─── Feature data ─── */

type FeatureIconName =
  | "bolt"
  | "routes"
  | "server"
  | "function"
  | "query"
  | "runtime";

function useFeatures(): Array<{
  icon: FeatureIconName;
  title: string;
  description: string;
}> {
  return [
    {
      icon: "bolt",
      title: translate({
        id: "homepage.feature.zeroConfig.title",
        message: "Zero Config",
      }),
      description: translate({
        id: "homepage.feature.zeroConfig.description",
        message:
          "ev dev / ev build — no boilerplate needed. Convention over configuration with optional ev.config.ts.",
      }),
    },
    {
      icon: "routes",
      title: translate({
        id: "homepage.feature.clientRoutes.title",
        message: "Client Routes",
      }),
      description: translate({
        id: "homepage.feature.clientRoutes.description",
        message:
          "Type-safe page params, search, loaders, and navigation from src/pages while evjs owns router setup.",
      }),
    },
    {
      icon: "server",
      title: translate({
        id: "homepage.feature.serverRoutes.title",
        message: "Server Routes",
      }),
      description: translate({
        id: "homepage.feature.serverRoutes.description",
        message:
          "File-based REST endpoints from src/apis with uppercase HTTP method exports and scoped middleware.",
      }),
    },
    {
      icon: "function",
      title: translate({
        id: "homepage.feature.serverFn.title",
        message: "Server Functions",
      }),
      description: translate({
        id: "homepage.feature.serverFn.description",
        message:
          '"use server" directive auto-transforms async functions into type-safe API calls at build time.',
      }),
    },
    {
      icon: "query",
      title: translate({
        id: "homepage.feature.dataFetching.title",
        message: "Data Fetching",
      }),
      description: translate({
        id: "homepage.feature.dataFetching.description",
        message:
          "TanStack Query helpers for server functions — useQuery(fn, ...args), useMutation(fn), and stable query keys.",
      }),
    },
    {
      icon: "runtime",
      title: translate({
        id: "homepage.feature.multiRuntime.title",
        message: "Multi-Runtime",
      }),
      description: translate({
        id: "homepage.feature.multiRuntime.description",
        message:
          "Hono-based server runs on Node.js, Deno, Bun, and edge runtimes out of the box.",
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
            React fullstack framework for file-based pages and Hono servers
          </Translate>
        </p>
        <div className={styles.heroButtons}>
          <Link className={styles.btnPrimary} to="/docs/quick-start">
            <Translate id="homepage.getStarted">Get Started</Translate>
            <span aria-hidden="true">→</span>
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

/* ─── Terminal Code Preview ─── */

function TerminalPreview() {
  return (
    <div className={styles.terminalSection}>
      <div className={styles.terminal}>
        <div className={styles.terminalHeader}>
          <span className={`${styles.terminalDot} ${styles.terminalDotRed}`} />
          <span
            className={`${styles.terminalDot} ${styles.terminalDotYellow}`}
          />
          <span
            className={`${styles.terminalDot} ${styles.terminalDotGreen}`}
          />
        </div>
        <div className={styles.terminalBody}>
          <div>
            <span className={styles.terminalComment}>
              # Create a new evjs app
            </span>
          </div>
          <div>
            <span className={styles.terminalPrompt}>$ </span>
            <span className={styles.terminalCmd}>npx</span>{" "}
            <span className={styles.terminalArg}>@evjs/create-app</span> my-app
          </div>
          <div style={{ marginTop: "0.5rem" }}>
            <span className={styles.terminalComment}># Start developing</span>
          </div>
          <div>
            <span className={styles.terminalPrompt}>$ </span>
            <span className={styles.terminalCmd}>cd</span> my-app &&{" "}
            <span className={styles.terminalCmd}>npm run</span>{" "}
            <span className={styles.terminalArg}>dev</span>
            <span className={styles.terminalCursor} />
          </div>
        </div>
      </div>
    </div>
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
            <Translate id="homepage.features.label">Features</Translate>
          </div>
          <h2 className={styles.featuresTitle}>
            <Translate id="homepage.features.title">
              Everything you need to build full-stack React apps
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
    bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
    routes: (
      <>
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="18" cy="18" r="2.5" />
        <path d="M8.5 6H14a4 4 0 0 1 0 8h-4a4 4 0 0 0 0 8h5.5" />
      </>
    ),
    server: (
      <>
        <rect x="4" y="4" width="16" height="6" rx="2" />
        <rect x="4" y="14" width="16" height="6" rx="2" />
        <path d="M8 7h.01M8 17h.01M12 7h4M12 17h4" />
      </>
    ),
    function: (
      <>
        <path d="M8 7c0-2 1.5-4 4-4h2" />
        <path d="M6 11h8" />
        <path d="M7 21h1c2.5 0 4-2 4-4V7" />
        <path d="m16 13 2 2 2-2" />
        <path d="m16 19 2-2 2 2" />
      </>
    ),
    query: (
      <>
        <path d="M5 5h14v10H8l-3 3V5Z" />
        <path d="M8 9h8M8 12h5" />
      </>
    ),
    runtime: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3.5 12h17M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
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
      <TerminalPreview />
      <main>
        <FeaturesSection />
      </main>
    </Layout>
  );
}
