import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const useDialog = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const previous = document.activeElement as HTMLElement | null;
    const items = () =>
      [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => {
        if (!(el.checkVisibility?.() ?? true)) return false;
        if (!(el instanceof HTMLInputElement) || el.type !== "radio" || el.checked) return true;
        return !node.querySelector(`input[type="radio"][name="${el.name}"]:checked`);
      });
    (node.querySelector<HTMLElement>("[data-autofocus]") ?? items()[0] ?? node).focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = items();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    node.addEventListener("keydown", onKey);
    return () => {
      node.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, []);
  return ref;
};
