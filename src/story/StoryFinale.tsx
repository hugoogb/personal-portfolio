export function StoryFinale() {
  return (
    <section
      id="explore"
      data-stop="overview"
      className="story-stop story-stop--finale"
      aria-labelledby="explore-title"
    >
      <div className="story-finale">
        <h2 id="explore-title" className="story-finale__title">
          That's the tour.
        </h2>
        <button type="button" className="story-btn story-btn--primary" data-explore-cta disabled>
          Explore the town &rarr;
        </button>
      </div>
    </section>
  );
}
