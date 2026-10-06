import { useState, type KeyboardEvent } from "react";
import { runCommand } from "@/hud/actions";
import { filterCommands } from "@/hud/commands";
import { useDialog } from "@/hud/useDialog";

export function Console() {
  const ref = useDialog<HTMLDivElement>();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const results = filterCommands(query);
  const current = results[Math.min(active, results.length - 1)];

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && current) {
      e.preventDefault();
      runCommand(current);
    }
  };

  return (
    <div
      ref={ref}
      className="console glass"
      role="dialog"
      aria-modal="true"
      aria-label="Console"
      tabIndex={-1}
    >
      <input
        data-autofocus
        className="console__input"
        role="combobox"
        aria-expanded="true"
        aria-controls="console-results"
        aria-activedescendant={current ? `cmd-${current.id}` : undefined}
        placeholder="Type a command, e.g. go readledger"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
      />
      <ul id="console-results" role="listbox" className="console__list">
        {results.map((c) => (
          <li
            key={c.id}
            id={`cmd-${c.id}`}
            role="option"
            aria-selected={c === current}
            className="console__item"
            onMouseDown={(e) => {
              e.preventDefault();
              runCommand(c);
            }}
          >
            {c.label}
          </li>
        ))}
        {!results.length && <li className="console__empty">No matching command</li>}
      </ul>
    </div>
  );
}
