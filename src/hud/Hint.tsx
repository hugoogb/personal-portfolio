/** What the card slot shows when nothing is selected (spec 4.1). */
export function Hint() {
  return (
    <p className="hint glass" role="status">
      <span className="hint__wide">Click a place to inspect it · ← → to cycle</span>
      <span className="hint__narrow">Tap a place to inspect it</span>
    </p>
  );
}
