import { HomeTitle } from "@/components/sections/home/HomeTitle";
import { ServicePanel } from "@/components/sections/home/ServicePanel";

export function HomeSection() {
  return (
    <section
      id="Home"
      className="section-container min-h-dvh flex flex-col justify-center py-20 sm:py-28"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 sm:gap-16 lg:gap-20">
        <div className="flex-1 text-center md:text-left animate-hero-in">
          <HomeTitle />
        </div>
        <div className="w-full md:w-auto md:flex-1 flex justify-center md:justify-end">
          <ServicePanel />
        </div>
      </div>
    </section>
  );
}
