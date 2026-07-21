"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TypingText } from "@/components/animate-ui/primitives/texts/typing";
import { findCommand, suggest } from "./commands";

/**
 * The terminal.
 *
 * A rebuild of the v1 page, which drove innerHTML from a keydown listener.
 * Same commands, same prompt, same inline ghost completion — but the history
 * is state, so it survives re-render, and the whole thing is keyboard-complete.
 *
 * Added over v1, because a terminal that lacks them feels broken to anyone who
 * uses a real one: ↑/↓ history recall, Tab to accept the completion, Ctrl-L
 * and a `clear` command, and click-anywhere-to-focus.
 *
 * Deliberately dark regardless of site theme. It is a quotation of a machine,
 * and a light terminal is not one.
 */

const PROMPT = "user@localhost:~$";
const BOOT_TEXT = "Welcome to torkay.com 👋";
/** Milliseconds per character, matching the v1 typing speed. */
const BOOT_SPEED = 25;

type Line =
  | { kind: "input"; text: string }
  | { kind: "output"; node: React.ReactNode };

export function Terminal() {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [booted, setBooted] = useState(false);

  // History is a stack plus a cursor. -1 means "at the live prompt", which is
  // what lets ↓ return to a half-typed command instead of emptying the input.
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const completion = suggest(value.trim().toLowerCase());

  // Keep the newest line in view without stealing focus.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  // TypingText drives its own timers and exposes no completion callback, so the
  // boot delay is derived from the same two numbers it uses. Keeping them
  // adjacent here is what stops the prompt from appearing mid-sentence if the
  // banner text is ever edited.
  useEffect(() => {
    const id = window.setTimeout(
      () => setBooted(true),
      [...BOOT_TEXT].length * BOOT_SPEED + 150,
    );
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (booted) inputRef.current?.focus();
  }, [booted]);

  const submit = useCallback(() => {
    const raw = value.trim();
    setValue("");
    setLines((prev) => [...prev, { kind: "input", text: raw }]);

    if (raw === "") return;

    history.current.unshift(raw);
    cursor.current = -1;

    const command = findCommand(raw);

    if (!command) {
      setLines((prev) => [
        ...prev,
        {
          kind: "output",
          node: (
            <span>
              Command not found: <span className="text-[#f87171]">{raw}</span>. Type{" "}
              <span className="text-[#7fb2ff]">help</span> for available commands.
            </span>
          ),
        },
      ]);
      return;
    }

    const result = command.run();

    if (result.kind === "clear") {
      setLines([]);
      return;
    }

    if (result.kind === "print") {
      setLines((prev) => [...prev, { kind: "output", node: result.node }]);
      return;
    }

    setLines((prev) => [...prev, { kind: "output", node: result.message }]);
    const external = result.href.startsWith("http") || result.href.startsWith("mailto:");
    window.setTimeout(() => {
      if (external) window.location.href = result.href;
      else router.push(result.href);
    }, 400);
  }, [value, router]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
      return;
    }

    // Tab accepts the ghost completion rather than leaving the field — inside
    // a terminal, Tab means complete.
    if (e.key === "Tab" && completion) {
      e.preventDefault();
      setValue(value.trim() + completion);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cursor.current + 1 < history.current.length) {
        cursor.current += 1;
        setValue(history.current[cursor.current]);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cursor.current > 0) {
        cursor.current -= 1;
        setValue(history.current[cursor.current]);
      } else {
        cursor.current = -1;
        setValue("");
      }
      return;
    }

    if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl border border-[#1e2024] bg-[#0a0a0b] font-mono text-sm text-[#f4f5f6] shadow-[var(--shadow-raise-lg)]"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Window chrome — carried over from v1, where it was the whole visual
          identity of the page. */}
      <div className="flex items-center gap-2 border-b border-[#1e2024] px-4 py-2.5">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="text-[#868d97] ml-2 text-xs">./index</span>
      </div>

      <div ref={scrollRef} className="max-h-[70vh] overflow-y-auto p-5 leading-relaxed">
        <TypingText text={BOOT_TEXT} duration={BOOT_SPEED} className="block" />
        {booted && (
          <p className="text-[#868d97]">
            ==&gt; Type <span className="text-[#7fb2ff]">help</span> for available commands
          </p>
        )}

        {lines.map((line, i) =>
          line.kind === "input" ? (
            <div key={i} className="mt-2">
              <span className="font-bold text-[#3ddc6a]">{PROMPT}</span>
              <span className="ml-2">{line.text}</span>
            </div>
          ) : (
            <div key={i} className="text-[#c8ccd2]">
              {line.node}
            </div>
          ),
        )}

        {/* The live prompt. The ghost completion is a sibling span rather than
            an overlay, so it inherits the same metrics and can never drift out
            of alignment with the typed text at a different zoom level. */}
        {booted && (
          <div className="mt-2 flex items-baseline">
            <span className="shrink-0 font-bold text-[#3ddc6a]">{PROMPT}</span>
            <span className="relative ml-2 inline-flex flex-1 items-baseline">
              <span aria-hidden className="pointer-events-none absolute inset-0 whitespace-pre">
                <span className="invisible">{value}</span>
                <span className="text-[#4b5058]">{completion}</span>
              </span>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                aria-label="Terminal input"
                className="relative w-full bg-transparent caret-[#f4f5f6] outline-none"
              />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
