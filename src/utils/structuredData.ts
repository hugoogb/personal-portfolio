import { TECH_GROUPS } from "@/constants/icons.constants";
import { PROJECTS } from "@/constants/projects.constants";
import { CONTACT } from "@/constants/strings.constants";

const SITE = "https://hugoogb.dev/";
const PERSON_ID = `${SITE}#person`;
const WEBSITE_ID = `${SITE}#website`;

/**
 * JSON-LD for the page, built from the same constants the page renders, so it
 * cannot drift from what a visitor sees - a hand-written block in index.html
 * would have kept listing projects long after they left the Work section.
 *
 * Projects are SoftwareSourceCode when the code is public and CreativeWork when
 * it is not. Neither is a Google rich-result type, which is the point: they
 * describe the work without inviting "missing field" warnings in Search Console
 * that SoftwareApplication would raise for not having prices or ratings.
 */
export const structuredData = (modified: Date) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE,
      name: "Hugo García Benjumea",
      alternateName: "hugoogb.dev",
      inLanguage: "en",
      publisher: { "@id": PERSON_ID },
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE}#profile`,
      url: SITE,
      name: "Hugo García Benjumea | Full-Stack Engineer",
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: { "@id": PERSON_ID },
      dateModified: modified.toISOString(),
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Hugo García Benjumea",
      givenName: "Hugo",
      familyName: "García Benjumea",
      // How people actually type it: without the accent, or by handle.
      alternateName: ["Hugo Garcia Benjumea", "hugoogb"],
      url: SITE,
      image: `${SITE}favicon/android-chrome-512x512.png`,
      jobTitle: "Full-Stack Engineer",
      email: `mailto:${CONTACT.EMAIL}`,
      description:
        "Full-stack engineer building web applications end to end with TypeScript, Node.js, React and Next.js.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Barcelona",
        addressCountry: "ES",
      },
      knowsAbout: TECH_GROUPS.flatMap((group) => group.icons.map((icon) => icon.name)),
      sameAs: [CONTACT.GITHUB, CONTACT.LINKEDIN, "https://www.npmjs.com/org/avatar-generator"],
    },
    ...PROJECTS.map((project) => ({
      "@type": project.repoUrl ? "SoftwareSourceCode" : "CreativeWork",
      name: project.name,
      description: project.desc,
      ...(project.urlPreview && { url: project.urlPreview }),
      ...(project.repoUrl && { codeRepository: project.repoUrl }),
      ...(project.repoUrl && { programmingLanguage: project.techStack.languages }),
      creator: { "@id": PERSON_ID },
    })),
  ],
});
