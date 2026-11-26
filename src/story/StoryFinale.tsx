export function StoryFinale() {
  return (
    <section
      id="explore"
      data-stop="overview"
      className="story-stop story-stop--finale"
      aria-labelledby="explore-title"
    >
      <div className="story-finale">
        <p
          id="explore-title"
          className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl"
        >
          That's the tour.
        </p>
        <button type="button" className="story-btn story-btn--primary" data-explore-cta disabled>
          Explore the town &rarr;
        </button>
        <p id="explore-why" className="story-note story-finale__why" hidden />
      </div>
    </section>
  );
}
