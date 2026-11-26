import { TECH } from "@/constants/tech.constants";
import { PROJECTS } from "@/constants/projects.constants";
import { CONTACT } from "@/constants/strings.constants";

const SITE = "https://hugoogb.dev/";
const PERSON_ID = `${SITE}#person`;
const WEBSITE_ID = `${SITE}#website`;

export const structuredData = () => ({
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
      name: "Hugo García Benjumea | Full-Stack Engineer in Barcelona",
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: { "@id": PERSON_ID },
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Hugo García Benjumea",
      givenName: "Hugo",
      familyName: "García Benjumea",
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
      knowsAbout: TECH,
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
