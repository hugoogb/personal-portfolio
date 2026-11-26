import { useEffect, useState } from "react";
import { barcelonaHour } from "@/world/lib/sun";

export const useBarcelonaHour = () => {
  const [hour, setHour] = useState(() => barcelonaHour(new Date()));
  useEffect(() => {
    const id = window.setInterval(() => setHour(barcelonaHour(new Date())), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return hour;
};
