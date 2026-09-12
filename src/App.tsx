import { Analytics } from "@vercel/analytics/react";
import { Suspense, lazy, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { HomeSection } from "@/components/sections/home/HomeSection";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const importAbout = () => import("@/components/sections/about/AboutSection");
const importProjects = () => import("@/components/sections/projects/ProjectsSection");
const importContact = () => import("@/components/sections/contact/ContactSection");

const AboutSection = lazy(() => importAbout().then((m) => ({ default: m.AboutSection })));
const ProjectsSection = lazy(() => importProjects().then((m) => ({ default: m.ProjectsSection })));
const ContactSection = lazy(() => importContact().then((m) => ({ default: m.ContactSection })));

export function App() {
  // The page scrolls freely, so a visitor can flick to Contact long before React
  // asks for its chunk - and the one Suspense fallback stands in for all three
  // sections, so a late arrival would resize the page under them. Warm the
  // chunks once the browser is idle; `lazy` dedupes, so this costs one request
  // each and nothing at all if a section has already been rendered.
  useEffect(() => {
    const warm = () => {
      void importAbout();
      void importProjects();
      void importContact();
    };

    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(warm, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }

    const id = window.setTimeout(warm, 300);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <Layout>
      <HomeSection />
      <Suspense
        fallback={
          <div className="section-container min-h-dvh flex items-center justify-center py-24 sm:py-32">
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
