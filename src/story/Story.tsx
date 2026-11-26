import { Backdrop } from "@/story/Backdrop";
import { Rail } from "@/story/Rail";
import { StoryAbout } from "@/story/StoryAbout";
import { StoryContact } from "@/story/StoryContact";
import { StoryFinale } from "@/story/StoryFinale";
import { StoryLanding } from "@/story/StoryLanding";
import { StoryProject } from "@/story/StoryProject";
import { PROJECT_PLACES } from "@/content/places";
import "@/story/story.css";

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
