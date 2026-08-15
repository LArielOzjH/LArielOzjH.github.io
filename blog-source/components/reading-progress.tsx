"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height <= 0 ? 0 : Math.min(100, (window.scrollY / height) * 100));
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div className="fixed left-0 top-[61px] z-30 h-[3px] w-full bg-[color-mix(in_srgb,var(--fg)_7%,transparent)]">
      <div
        className="h-full bg-[color-mix(in_srgb,var(--fg)_44%,var(--bg))] transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
