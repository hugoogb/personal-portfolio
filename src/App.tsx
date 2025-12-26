import { Analytics } from "@vercel/analytics/react";
import { Suspense, lazy } from "react";
import { Layout } from "@/components/Layout";
import { HomeSection } from "@/components/sections/home/HomeSection";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const AboutSection = lazy(() =>
  import("@/components/sections/about/AboutSection").then((m) => ({
    default: m.AboutSection,
  })),
);
const ProjectsSection = lazy(() =>
  import("@/components/sections/projects/ProjectsSection").then((m) => ({
    default: m.ProjectsSection,
  })),
);
const ContactSection = lazy(() =>
  import("@/components/sections/contact/ContactSection").then((m) => ({
    default: m.ContactSection,
  })),
);

export function App() {
  return (
    <Layout>
      <HomeSection />
      <Suspense
        fallback={
          <div className="section-container min-h-screen flex items-center justify-center py-24 sm:py-32">
            <LoadingSpinner />
          </div>
        }
      >
        <AboutSection />
        <ProjectsSection />
        <ContactSection />
      </Suspense>
      <Analytics />
    </Layout>
  );
}
