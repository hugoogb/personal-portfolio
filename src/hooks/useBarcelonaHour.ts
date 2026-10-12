import { useEffect, useState } from "react";
import { barcelonaHour } from "@/world/lib/sun";

/** The hour in Barcelona (13.5 is 13:30), refreshed every 30 s. */
export const useBarcelonaHour = () => {
  const [hour, setHour] = useState(() => barcelonaHour(new Date()));
  useEffect(() => {
    const id = window.setInterval(() => setHour(barcelonaHour(new Date())), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return hour;
};
