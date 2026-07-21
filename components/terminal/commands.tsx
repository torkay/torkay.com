import Link from "next/link";
import { profiles, site } from "@/lib/site";

/**
 * The command registry.
 *
 * The command set is the one thing worth keeping from the v1 site, but it was
 * a chain of `else if` inside a DOM event handler. Restructured into data:
 * adding a command is now one entry, rather than an edit in four places (the
 * handler, the help text, the autosuggest list, and the not-found hint) that
 * inevitably drifted apart.
 *
 * A command returns something to print or somewhere to go. It never touches
 * the DOM — the terminal owns all rendering.
 */

export type CommandResult =
  | { kind: "print"; node: React.ReactNode }
  | { kind: "navigate"; href: string; message: string }
  | { kind: "clear" };

export type Command = {
  readonly name: string;
  readonly summary: string;
  /** Runnable, but hidden from `help` — aliases. */
  readonly hidden?: boolean;
  readonly run: () => CommandResult;
};

const ACCENT = "text-[#7fb2ff]";

const print = (node: React.ReactNode): CommandResult => ({ kind: "print", node });

export const COMMANDS: readonly Command[] = [
  {
    name: "help",
    summary: "Show this menu",
    run: () =>
      print(
        <div>
          <span className={ACCENT}>Available commands</span>
          <ul className="mt-1">
            {COMMANDS.filter((c) => !c.hidden).map((c) => (
              <li key={c.name}>
                {"  ==> "}
                <span className={ACCENT}>{c.name.padEnd(10)}</span>
                {c.summary}
              </li>
            ))}
          </ul>
        </div>,
      ),
  },
  {
    name: "about",
    summary: "Who I am",
    run: () =>
      print(
        <div>
          <span className={ACCENT}>{site.name}</span>
          <p>Software engineer and digital consultant based in Brisbane, Australia.</p>
          <p>
            Focused on building practical systems through software engineering and
            machine learning.
          </p>
          <p className="mt-2">
            <span className={ACCENT}>Currently:</span> running Sorted Systems, a digital
            software consultancy.
          </p>
        </div>,
      ),
  },
  {
    name: "work",
    summary: "Sorted Systems (consultancy)",
    run: () => ({
      kind: "navigate",
      href: profiles.consultancy,
      message: "Opening Sorted Systems...",
    }),
  },
  {
    name: "projects",
    summary: "View my portfolio",
    run: () => ({ kind: "navigate", href: "/work", message: "Loading portfolio..." }),
  },
  {
    name: "portfolio",
    summary: "Alias for projects",
    hidden: true,
    run: () => ({ kind: "navigate", href: "/work", message: "Loading portfolio..." }),
  },
  {
    name: "writing",
    summary: "Published briefs and breakdowns",
    run: () => ({ kind: "navigate", href: "/p", message: "Opening /p..." }),
  },
  {
    name: "contact",
    summary: "Get in touch",
    run: () =>
      print(
        <div>
          <span className={ACCENT}>Let&apos;s connect</span>
          <p>
            {"  Email:    "}
            <Link href={`mailto:${profiles.email}`} className={ACCENT}>
              {profiles.email}
            </Link>
          </p>
          <p>
            {"  LinkedIn: "}
            <Link href={profiles.linkedin} className={ACCENT}>
              linkedin.com/in/torrin-kay
            </Link>
          </p>
          <p>
            {"  GitHub:   "}
            <Link href={profiles.github} className={ACCENT}>
              github.com/torkay
            </Link>
          </p>
          <p className="mt-2">
            Type <span className={ACCENT}>linkedin</span> or{" "}
            <span className={ACCENT}>github</span> to go straight there.
          </p>
        </div>,
      ),
  },
  {
    name: "status",
    summary: "Current availability",
    run: () =>
      print(
        <div>
          <span className={ACCENT}>Current status</span>
          <p>
            {"  Availability: "}
            <span className="text-[#3ddc6a]">Open to consulting opportunities</span>
          </p>
          <p>{"  Location:     Brisbane, Australia"}</p>
          <p>{"  Focus:        Software engineering, machine learning, digital systems"}</p>
        </div>,
      ),
  },
  {
    name: "github",
    summary: "Visit my GitHub",
    run: () => ({ kind: "navigate", href: profiles.github, message: "Opening GitHub..." }),
  },
  {
    name: "linkedin",
    summary: "Connect on LinkedIn",
    run: () => ({ kind: "navigate", href: profiles.linkedin, message: "Opening LinkedIn..." }),
  },
  {
    name: "clear",
    summary: "Clear the screen",
    run: () => ({ kind: "clear" }),
  },
] as const;

export const COMMAND_NAMES = COMMANDS.map((c) => c.name);

export function findCommand(input: string): Command | undefined {
  return COMMANDS.find((c) => c.name === input.trim().toLowerCase());
}

/** The completion for `prefix`, as the remaining characters only — the input
 *  already shows what was typed, so the ghost renders just the tail. */
export function suggest(prefix: string): string {
  if (!prefix) return "";
  const match = COMMAND_NAMES.find((n) => n.startsWith(prefix) && n !== prefix);
  return match ? match.slice(prefix.length) : "";
}
