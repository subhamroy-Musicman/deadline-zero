"use client";

import { useEffect } from "react";

export default function CursorSparkle() {
  useEffect(() => {
    let lastSpawnTime = 0;
    const spawnRate = 40; // ms between sparkles

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSpawnTime < spawnRate) return;
      lastSpawnTime = now;

      const sparkle = document.createElement("div");
      sparkle.className = "cursor-sparkle";
      sparkle.style.left = `${e.clientX}px`;
      sparkle.style.top = `${e.clientY}px`;
      
      // Randomize initial rotation and 3d movement
      const rotZ = Math.random() * 180 - 90;
      const moveX = (Math.random() - 0.5) * 60;
      const moveY = (Math.random() - 0.5) * 60 - 30; // Bias upward

      sparkle.style.setProperty("--rotZ", `${rotZ}deg`);
      sparkle.style.setProperty("--moveX", `${moveX}px`);
      sparkle.style.setProperty("--moveY", `${moveY}px`);

      document.body.appendChild(sparkle);

      // Remove after animation completes (1s)
      setTimeout(() => {
        sparkle.remove();
      }, 1000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return null;
}
