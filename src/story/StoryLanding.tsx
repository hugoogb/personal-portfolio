export function StoryLanding() {
  return (
    <section
      id="top"
      data-stop="top"
      className="story-stop story-stop--landing"
      aria-labelledby="name"
    >
      <div className="story-landing">
        <h1 id="name">Hugo García Benjumea</h1>
        <p className="story-landing__role">Full-Stack Engineer</p>
        <a className="story-landing__cue" href="#about">
          Scroll
        </a>
      </div>
    </section>
  );
}
