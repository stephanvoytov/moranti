"use client";

import { useEffect } from "react";
import { addRecentlyViewed } from "@/lib/recently-viewed";

interface RecentlyViewedTrackerProps {
  wbArticle: number;
}

export default function RecentlyViewedTracker({
  wbArticle,
}: RecentlyViewedTrackerProps) {
  useEffect(() => {
    addRecentlyViewed(wbArticle);
  }, [wbArticle]);

  return null;
}
