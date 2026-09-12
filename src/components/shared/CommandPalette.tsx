import type { FC, ReactNode } from "react";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Icon } from "@tabler/icons-react";
import {
  IconArrowRight,
  IconBrandGithub,
  IconBrandLinkedin,
  IconCheck,
  IconCopy,
  IconCornerDownLeft,
  IconExternalLink,
  IconMail,
  IconMoon,
  IconSearch,
  IconSun,
} from "@tabler/icons-react";
import { SectionNavContext } from "@/contexts/section-nav.context";
import { ColorContext } from "@/contexts/color.context";
import { ThemeContext } from "@/contexts/theme.context";
import { PRESET_COLORS } from "@/constants/colors.constants";
import { PROJECTS } from "@/constants/projects.constants";
import { CONTACT } from "@/constants/strings.constants";
import { PALETTE_TOGGLE_EVENT } from "@/utils/commandPalette";

interface Command {
  id: string;
  label: string;
  /** Right-aligned detail: a hostname, a shortcut, the current value. */
  hint?: string;
  group: string;
  /** Extra words to match on that are not worth showing. */
  keywords?: string;
  icon?: Icon;
  /** Accent commands show their colour instead of an icon. */
  swatch?: string;
  /** Choosing a colour should not dismiss the list you are choosing from. */
  keepOpen?: boolean;
  run: () => void;
}

const GROUP_ORDER = ["Go to", "Projects", "Contact", "Appearance"];

export const CommandPalette: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  const { sectionIds, goToSection } = useContext(SectionNavContext);
  const { color, setColor } = useContext(ColorContext);
  const { isDark, toggleDark } = useContext(ThemeContext);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  /* ---- the shortcut, and the navbar button that fires the same event ---- */
  useEffect(() => {
    const toggle = () =>
      setIsOpen((prev) => {
        if (!prev) restoreFocusTo.current = document.activeElement as HTMLElement | null;
        return !prev;
      });

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(PALETTE_TOGGLE_EVENT, toggle);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(PALETTE_TOGGLE_EVENT, toggle);
    };
  }, []);

  /* ---- open/close side effects: focus, and don't scroll what's behind ---- */
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 10);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      restoreFocusTo.current?.focus?.();
    };
  }, [isOpen]);

  const copyEmail = useCallback(() => {
    void navigator.clipboard.writeText(CONTACT.EMAIL);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, []);

  const commands = useMemo<Command[]>(() => {
    const openUrl = (url: string) => () => window.open(url, "_blank", "noopener,noreferrer");

    return [
      ...sectionIds.map((id) => ({
        id: `go-${id}`,
        label: id === "Work" ? "Work" : id,
        group: "Go to",
        keywords: id === "Work" ? "projects portfolio" : "",
        icon: IconArrowRight,
        run: () => goToSection(id),
      })),

      ...PROJECTS.map((project) => ({
        id: `project-${project.id}`,
        label: project.name,
        hint: project.urlPreview?.replace(/^https?:\/\//, ""),
        group: "Projects",
        keywords: project.runsOn ?? "",
        icon: IconExternalLink,
        run: project.urlPreview ? openUrl(project.urlPreview) : () => goToSection("Work"),
      })),

      {
        id: "copy-email",
        label: copied ? "Email address copied" : "Copy email address",
        hint: CONTACT.EMAIL,
        group: "Contact",
        keywords: "mail contact reach",
        icon: copied ? IconCheck : IconCopy,
        run: copyEmail,
        keepOpen: true,
      },
      {
        id: "send-email",
        label: "Send me an email",
        hint: "mailto",
        group: "Contact",
        icon: IconMail,
        run: () => {
          window.location.href = `mailto:${CONTACT.EMAIL}`;
        },
      },
      {
        id: "github",
        label: "GitHub",
        hint: "github.com/hugoogb",
        group: "Contact",
        icon: IconBrandGithub,
        run: openUrl(CONTACT.GITHUB),
      },
      {
        id: "linkedin",
        label: "LinkedIn",
        hint: "linkedin.com/in/hugoogb",
        group: "Contact",
        icon: IconBrandLinkedin,
        run: openUrl(CONTACT.LINKEDIN),
      },

      {
        id: "theme",
        label: isDark ? "Switch to light mode" : "Switch to dark mode",
        group: "Appearance",
        keywords: "theme dark light contrast",
        icon: isDark ? IconSun : IconMoon,
        run: toggleDark,
        keepOpen: true,
      },
      ...PRESET_COLORS.map((preset) => ({
        id: `accent-${preset.color}`,
        label: `Accent — ${preset.name}`,
        hint: color.toLowerCase() === preset.color.toLowerCase() ? "current" : preset.color,
        group: "Appearance",
        keywords: "colour color accent theme",
        swatch: preset.color,
        run: () => setColor(preset.color),
        keepOpen: true,
      })),
    ];
  }, [sectionIds, goToSection, copied, copyEmail, isDark, toggleDark, color, setColor]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands;
    return commands.filter((command) =>
      `${command.label} ${command.hint ?? ""} ${command.group} ${command.keywords ?? ""}`
        .toLowerCase()
        .includes(needle),
    );
  }, [commands, query]);

  // A filtered list can be shorter than the cursor's last position.
  useEffect(() => {
    setActiveIndex((prev) => (prev >= results.length ? 0 : prev));
  }, [results.length]);

  const runCommand = useCallback(
    (command: Command) => {
      command.run();
      if (!command.keepOpen) close();
    },
    [close],
  );

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "ArrowDown" || (e.key === "n" && e.ctrlKey)) {
      e.preventDefault();
      setActiveIndex((prev) => (results.length ? (prev + 1) % results.length : 0));
      return;
    }
    if (e.key === "ArrowUp" || (e.key === "p" && e.ctrlKey)) {
      e.preventDefault();
      setActiveIndex((prev) => (results.length ? (prev - 1 + results.length) % results.length : 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const command = results[activeIndex];
      if (command) runCommand(command);
    }
  };

  // Keep the highlighted row in view when arrowing past the fold.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  /* ---- rendering ---- */
  const rows: ReactNode[] = [];
  const indexOf = new Map(results.map((command, index) => [command.id, index]));
  let renderedGroup = "";

  GROUP_ORDER.forEach((group) => {
    results.forEach((command) => {
      if (command.group !== group) return;
      const index = indexOf.get(command.id) ?? 0;

      if (renderedGroup !== group) {
        renderedGroup = group;
        rows.push(
          <div
            key={`group-${group}`}
            className="px-4 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted/60"
          >
            {group}
          </div>,
        );
      }

      const CommandIcon = command.icon;
      const isActive = index === activeIndex;

      rows.push(
        <button
          key={command.id}
          type="button"
          data-index={index}
          onClick={() => runCommand(command)}
          onMouseMove={() => setActiveIndex(index)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
            isActive ? "bg-muted/10" : ""
          }`}
        >
          {command.swatch ? (
            <span
              className="w-4 h-4 rounded-full shrink-0 border border-border"
              style={{ backgroundColor: command.swatch }}
              aria-hidden="true"
            />
          ) : (
            CommandIcon && (
              <CommandIcon size={17} stroke={1.6} className="text-muted shrink-0" aria-hidden />
            )
          )}
          <span className="flex-grow min-w-0 truncate text-sm font-medium text-text">
            {command.label}
          </span>
          {command.hint && (
            <span className="font-mono text-[11px] text-muted/70 shrink-0 truncate max-w-[45%]">
              {command.hint}
            </span>
          )}
          {isActive && (
            <IconCornerDownLeft size={14} className="text-muted/60 shrink-0" aria-hidden />
          )}
        </button>,
      );
    });
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] sm:pt-[15vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: "spring", duration: 0.32, bounce: 0.18 }}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
              <IconSearch size={18} stroke={1.6} className="text-muted shrink-0" aria-hidden />
              <input
                id="command-palette-input"
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onInputKeyDown}
                placeholder="Jump to a section, open a project, change the accent…"
                aria-label="Search commands"
                autoComplete="off"
                spellCheck={false}
                className="flex-grow bg-transparent text-sm text-text placeholder:text-muted/60 focus:outline-none"
              />
              <kbd className="hidden sm:block font-mono text-[10px] text-muted/60 border border-border rounded-md px-1.5 py-0.5 shrink-0">
                esc
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[52vh] overflow-y-auto pb-2">
              {rows.length > 0 ? (
                rows
              ) : (
                <p className="px-4 py-8 text-center text-sm text-muted">
                  Nothing matches “{query}”.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-border bg-muted/5 text-[11px] text-muted/70">
              <span className="font-mono truncate">↑↓ move · ↵ select · esc close</span>
              <span className="font-mono shrink-0">{results.length} commands</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
