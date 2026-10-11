/** The still image of the town (Task 9) with the live canvas over it once it is ready (Task 10). */
export function Backdrop() {
  return (
    <div id="backdrop" aria-hidden="true">
      <div className="backdrop__still" />
      <div id="town-root" className="backdrop__town" />
    </div>
  );
}
