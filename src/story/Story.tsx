import { Backdrop } from "@/story/Backdrop";
import { Rail } from "@/story/Rail";
import { StoryAbout } from "@/story/StoryAbout";
import { StoryContact } from "@/story/StoryContact";
import { StoryFinale } from "@/story/StoryFinale";
import { StoryLanding } from "@/story/StoryLanding";
import { StoryProject } from "@/story/StoryProject";
import { PROJECT_PLACES } from "@/content/places";
import "@/story/story.css";

/**
 * The page (spec 5.2). Prerendered and never hydrated: crawlers, link previews,
 * screen readers and Text mode read exactly this. Story lays it over the town,
 * Explore hides it, Text shows it plain. Sections follow STOPS in tour.ts.
 */
export function Story() {
  return (
    <>
      <Backdrop />
      <Rail />
      <main id="story">
        <StoryLanding />
        <StoryAbout />
        {PROJECT_PLACES.map((place) => (
          <StoryProject key={place.id} place={place} />
        ))}
        <StoryContact />
        <StoryFinale />
      </main>
    </>
  );
}
