import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { trackVisit } from "@/lib/visits";

export function VisitTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    void trackVisit(pathname, window.location.search);
  }, [pathname]);

  return null;
}
