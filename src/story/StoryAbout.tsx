import { TECH_GROUPS } from "@/constants/icons.constants";

export function StoryAbout() {
  return (
    <section
      id="about"
      data-stop="about"
      className="story-stop"
      data-side="left"
      aria-labelledby="about-title"
    >
      <div className="story-card">
        <h2 id="about-title">About</h2>
        <p className="story-text">
          I build web products end to end - database, API, and interface - in TypeScript and
          Node.js. I take them all the way: from an empty repo to a server I deploy and keep
          running.
        </p>
        <p className="story-text">
          Most of what I write is TypeScript - React and Next.js in the browser, Node.js and NestJS
          on the server, with PostgreSQL behind them.
        </p>
        <p className="story-text">
          The last couple of years have been SaaS work - features across existing platforms, and a
          greenfield internal control panel I'm on now. On my own time I run side projects on a VPS
          I manage myself: Docker, Postgres, a reverse proxy, deploys from CI. Writing the code and
          keeping it running are different skills and I wanted both.
        </p>
        <ul className="story-meta">
          <li>Barcelona, working remotely</li>
          <li>EU &amp; US hours</li>
        </ul>
        <ul className="story-chips" aria-label="Stack">
          {TECH_GROUPS.flatMap((g) => g.icons.map((icon) => <li key={icon.name}>{icon.name}</li>))}
        </ul>
      </div>
    </section>
  );
}
