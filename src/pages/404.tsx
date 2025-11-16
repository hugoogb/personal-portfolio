import type { NextPage } from "next";
import { SectionCard } from "@/components/sections/SectionCard";
import { SEO } from "@/components/SEO";

const Custom404: NextPage = () => {
  return (
    <>
      <SEO
        title="404 - Page Not Found"
        description="The page you are looking for does not exist."
        canonicalUrl="https://hugoogb.dev/404"
      />
      <SectionCard
        title={"404 - Page Not Found"}
        memoji="/memojis/image0.png"
      ></SectionCard>
    </>
  );
};

export default Custom404;
