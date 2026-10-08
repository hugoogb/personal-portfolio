export function BriefIntro() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="section-container pt-20 pb-14 sm:pt-28 space-y-6"
    >
      <p className="inline-flex items-center gap-2.5 rounded-full bg-primary px-4 py-1.5 text-xs sm:text-sm font-semibold text-primary-fg">
        Open to remote roles &amp; freelance
      </p>
      <h1 id="about-title">Hugo García Benjumea</h1>
      <p className="text-lg sm:text-xl font-medium uppercase tracking-[0.2em] text-muted">
        Full-Stack Engineer
      </p>
      <p className="max-w-2xl text-base sm:text-lg text-muted leading-relaxed">
        I build web products end to end - database, API, and interface - in TypeScript and Node.js.
        I take them all the way: from an empty repo to a server I deploy and keep running.
      </p>
      <p className="max-w-2xl text-base sm:text-lg text-muted leading-relaxed">
        Most of what I write is TypeScript - React and Next.js in the browser, Node.js and NestJS on
        the server, with PostgreSQL behind them.
      </p>
      <p className="max-w-2xl text-base sm:text-lg text-muted leading-relaxed">
        The last couple of years have been SaaS work - features across existing platforms, and a
        greenfield internal control panel I'm on now. On my own time I run side projects on a VPS I
        manage myself: Docker, Postgres, a reverse proxy, deploys from CI. Writing the code and
        keeping it running are different skills and I wanted both.
      </p>
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-text">
        <li>Barcelona, working remotely</li>
        <li>EU &amp; US hours</li>
      </ul>
    </section>
  );
}
