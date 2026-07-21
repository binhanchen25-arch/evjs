import type { CliContext, CliFlagValue } from "@evjs/ev/plugin";

function toFlagName(rawName: string): string {
  return rawName.replace(/-([a-zA-Z0-9])/g, (_, char: string) =>
    char.toUpperCase(),
  );
}

function coerceFlagValue(value: string): boolean | string {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}

function setFlag(
  flags: Record<string, CliFlagValue>,
  name: string,
  value: boolean | string,
): void {
  const current = flags[name];
  if (current === undefined) {
    flags[name] = value;
  } else if (Array.isArray(current)) {
    current.push(value);
  } else {
    flags[name] = [current, value];
  }
}

export function parseCliContext(args: readonly string[]): CliContext {
  const flags: CliContext["flags"] = {};

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === "--") break;
    if (!arg?.startsWith("--") || arg === "--") continue;

    const rawFlag = arg.slice(2);
    if (!rawFlag) continue;

    const equalsIndex = rawFlag.indexOf("=");
    if (equalsIndex >= 0) {
      const name = toFlagName(rawFlag.slice(0, equalsIndex));
      setFlag(flags, name, coerceFlagValue(rawFlag.slice(equalsIndex + 1)));
      continue;
    }

    if (rawFlag.startsWith("no-")) {
      setFlag(flags, toFlagName(rawFlag.slice(3)), false);
      continue;
    }

    const nextArg = args[index + 1];
    if (nextArg && !nextArg.startsWith("-")) {
      setFlag(flags, toFlagName(rawFlag), coerceFlagValue(nextArg));
      index++;
    } else {
      setFlag(flags, toFlagName(rawFlag), true);
    }
  }

  return { flags };
}
