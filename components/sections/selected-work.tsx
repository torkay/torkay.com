"use client";

import Link from "next/link";
import { useState } from "react";
import { Effect } from "@/components/animate-ui/primitives/effects/effect";
import { Tilt, TiltContent } from "@/components/animate-ui/primitives/effects/tilt";
import { BounceSidebar } from "@/components/ui/bounce-sidebar";
import { Folder } from "@/components/ui/folder";
import { SPRING_RISE, STAGGER } from "@/lib/motion";

/**
 * Selected work.
 *
 * The sidebar filters; the folders are the work. Both are deliberately
 * physical — a travelling dot and a folder you can open — against an otherwise
 * flat page. Two tactile objects is the budget; a third would make the section
 * a toy.
 *
 * Everything here reveals on scroll (`inView`) rather than on mount, so the
 * section is not already finished by the time the visitor reaches it.
 */

const projects = [
  {
    name: "RideRadar",
    kind: "Product",
    year: "2026",
    blurb: "Motorcycle auction meta-search across the Australian market. Ingest, dedupe, rank, alert.",
    href: "https://rideradar.com.au",
    color: "black",
  },
  {
    name: "Sorted Systems",
    kind: "Consultancy",
    year: "2025",
    blurb: "Digital software consultancy. Discovery, build, and handover for small teams.",
    href: "https://sortedsystems.com.au",
    color: "blue",
  },
  {
    name: "BitBit",
    kind: "Platform",
    year: "2025",
    blurb: "Event-driven notification infrastructure with a scheduling and delivery layer.",
    href: "/p",
    color: "white",
  },
] as const;

const filters = ["All", "Product", "Consultancy", "Platform"] as const;

export function SelectedWork() {
  const [filter, setFilter] = useState(0);
  const active = filters[filter];
  const shown = active === "All" ? projects : projects.filter((p) => p.kind === active);

  return (
    <section className="border-line mx-auto w-full max-w-(--container-page) border-t px-6 py-20">
      <div className="flex flex-col gap-12 lg:flex-row">
        <div className="lg:w-48 lg:shrink-0">
          <Effect inView fade slide={{ direction: "up", offset: 12 }} transition={SPRING_RISE}>
            <h2 className="text-ink-subtle mb-4 text-xs font-medium tracking-[0.02em] uppercase">
              Selected work
            </h2>
          </Effect>
          <BounceSidebar
            items={[...filters]}
            value={filter}
            onChange={setFilter}
            aria-label="Filter work by kind"
          />
        </div>

        <div className="grid flex-1 gap-8 sm:grid-cols-2">
          {shown.map((project, i) => (
            <Effect
              key={project.name}
              inView
              fade
              slide={{ direction: "up", offset: 24 }}
              delay={i * STAGGER.block}
              transition={SPRING_RISE}
            >
              <Tilt maxTilt={6} className="h-full">
                <TiltContent>
                  <Link
                    href={project.href}
                    className="raise group flex h-full flex-col rounded-xl p-6 transition-shadow duration-150 hover:shadow-[var(--shadow-raise-lg)]"
                  >
                    <div className="pointer-events-none mb-4 h-40">
                      <Folder color={project.color} size="sm" label={project.name} />
                    </div>
                    <div className="text-ink-subtle flex items-baseline gap-2 text-xs">
                      <span>{project.kind}</span>
                      <span aria-hidden>·</span>
                      <span>{project.year}</span>
                    </div>
                    <h3 className="font-display mt-1 text-2xl tracking-[-0.02em]">
                      {project.name}
                    </h3>
                    <p className="text-ink-muted mt-2 text-sm">{project.blurb}</p>
                  </Link>
                </TiltContent>
              </Tilt>
            </Effect>
          ))}
        </div>
      </div>
    </section>
  );
}
