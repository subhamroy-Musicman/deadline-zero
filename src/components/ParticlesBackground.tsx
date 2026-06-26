"use client";

import { useState, useEffect } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";
import { useStore, Theme } from "@/store/useStore";

export default function ParticlesBackground() {
  const [mounted, setMounted] = useState(false);
  const { theme, reducedMotion } = useStore();

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setMounted(true);
    });
  }, []);

  if (!mounted || reducedMotion) return null;

  const getThemeConfig = (currentTheme: Theme): any => {
    switch (currentTheme) {
      case "ocean":
        return {
          particles: {
            number: { value: 40 },
            color: { value: "#0bc5ea" },
            shape: { type: "circle" },
            opacity: { value: 0.3 },
            size: { value: { min: 5, max: 15 } },
            move: {
              enable: true,
              speed: 1.5,
              direction: "top",
              outModes: "out"
            }
          }
        };
      case "cyberpunk":
        return {
          particles: {
            number: { value: 60 },
            color: { value: "#f50057" },
            links: {
              enable: true,
              color: "#00e5ff",
              distance: 120,
              opacity: 0.4,
              width: 1
            },
            move: {
              enable: true,
              speed: 2,
              direction: "none",
              outModes: "bounce"
            }
          }
        };
      case "sunset":
        return {
          particles: {
            number: { value: 50 },
            color: { value: ["#f43f5e", "#f59e0b", "#ec4899"] },
            shape: { type: "circle" },
            opacity: {
              value: { min: 0.3, max: 0.7 },
              animation: { enable: true, speed: 0.5, sync: false }
            },
            size: { value: { min: 3, max: 8 } },
            move: {
              enable: true,
              speed: 1,
              direction: "top-right",
              outModes: "out"
            }
          }
        };
      case "neon":
        return {
          particles: {
            number: { value: 80 },
            color: { value: ["#39ff14", "#ff00ff"] },
            shape: { type: "circle" },
            opacity: { value: 0.6 },
            size: { value: { min: 1, max: 2 } },
            move: {
              enable: true,
              speed: 4,
              direction: "none",
              outModes: "out",
              straight: true
            }
          }
        };
      case "aurora":
      case "emerald":
        return {
          particles: {
            number: { value: 30 },
            color: { value: "#10b981" },
            shape: { type: "polygon", polygon: { sides: 6 } },
            opacity: { value: 0.5 },
            size: { value: { min: 10, max: 30 } },
            move: {
              enable: true,
              speed: 1,
              direction: "bottom",
              outModes: "out"
            }
          }
        };
      case "synthwave":
      case "crimson":
      case "midnight":
        return {
          particles: {
            number: { value: 100 },
            color: { value: "#ffffff" },
            shape: { type: "star" },
            opacity: {
              value: { min: 0.1, max: 0.8 },
              animation: { enable: true, speed: 1, sync: false }
            },
            size: { value: { min: 1, max: 3 } },
            move: {
              enable: true,
              speed: 0.5,
              direction: "none",
              outModes: "out"
            }
          }
        };
      default:
        return {
          particles: {
            number: { value: 50 },
            color: { value: "#6366f1" },
            links: {
              enable: true,
              color: "#a5b4fc",
              distance: 150,
              opacity: 0.3,
              width: 1
            },
            move: { enable: true, speed: 1 }
          }
        };
    }
  };

  const config = getThemeConfig(theme);

  return (
    <div 
      className="particles-container" 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none"
      }}
    >
      <Particles
        id="tsparticles"
        options={{
          fullScreen: { enable: false },
          background: { color: "transparent" },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: { enable: true, mode: "repulse" },
            },
            modes: {
              repulse: { distance: 100, duration: 0.4 }
            }
          },
          ...config.particles
        }}
        className="particles-canvas"
        style={{
          width: "100%",
          height: "100%"
        }}
      />
    </div>
  );
}
