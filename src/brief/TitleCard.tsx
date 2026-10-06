/**
 * Shown instead of the Brief while the 3D town loads (html.world, from Phase 2).
 * Real text, so the page still paints content straight away.
 */
export function TitleCard() {
  return (
    <div id="title-card" className="title-card">
      <div className="title-card__inner">
        <p className="title-card__name">Hugo García Benjumea</p>
        <p className="title-card__role">Full-Stack Engineer</p>
        <div className="title-card__bar">
          <span id="title-card-progress" />
        </div>
        <a href="#brief" className="title-card__brief">
          Read the brief
        </a>
      </div>
    </div>
  );
}
