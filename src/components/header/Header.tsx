import { Navbar } from "@/components/header/navbar/Navbar";

export const Header = () => {
  return (
    <header className="fixed top-0 w-full z-50 py-4">
      <div className="max-w-fit mx-auto px-4">
        <div className="bg-background/80 backdrop-blur-md border border-border rounded-full shadow-sm">
          <div className="px-4 py-1">
            <Navbar />
          </div>
        </div>
      </div>
    </header>
  );
};
