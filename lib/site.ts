/**
 * Single source of truth for anything that appears in more than one place:
 * nav labels, metadata, external profiles. Components read from here so a
 * rename happens once.
 */

export const site = {
  name: "Torrin Kay",
  domain: "torkay.com",
  url: "https://torkay.com",
  title: "Torrin Kay",
  description:
    "Software engineer and digital consultant in Brisbane, Australia. Building practical systems with software engineering and machine learning.",
  locale: "en_AU",
} as const;

export const nav = [
  { label: "Index", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Writing", href: "/p" },
  { label: "Terminal", href: "/terminal" },
  { label: "Contact", href: "/contact" },
] as const;

export const profiles = {
  github: "https://github.com/torkay",
  linkedin: "https://www.linkedin.com/in/torrin-kay-b31876246/",
  consultancy: "https://sortedsystems.com.au",
  email: "hi@torkay.com",
} as const;
