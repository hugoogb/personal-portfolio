export function Backdrop() {
  return (
    <div id="backdrop" aria-hidden="true">
      <div className="backdrop__still" />
      <div id="town-root" className="backdrop__town" />
    </div>
  );
}
