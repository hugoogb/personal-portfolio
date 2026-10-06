import { useEffect } from "react";
import { useBaseCamp } from "@/store/store";

export const TOAST_MS = 3200;

export function Toasts() {
  const toasts = useBaseCamp((s) => s.toasts);
  const dismiss = useBaseCamp((s) => s.dismissToast);

  useEffect(() => {
    if (!toasts.length) return;
    const id = window.setTimeout(() => dismiss(toasts[0].id), TOAST_MS);
    return () => window.clearTimeout(id);
  }, [toasts, dismiss]);

  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.slice(0, 3).map((t) => (
        <p key={t.id} className="toast glass">
          {t.text}
        </p>
      ))}
    </div>
  );
}
