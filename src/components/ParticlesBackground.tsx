"use client";

import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";
import { useStore, Theme } from "@/store/useStore";

export default function ParticlesBackground() {
  const { theme, reducedMotion } = useStore();

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  if (reducedMotion) return null;

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
            color: { value: ["#fce819", "#ff003c"] },
            shape: { type: "square" },
            opacity: { value: 0.5 },
            size: { value: { min: 1, max: 3 } },
            move: {
              enable: true,
              speed: 3,
              direction: "none",
              outModes: "out"
            }
          }
        };
      case "sunset":
        return {
          particles: {
            number: { value: 20 },
            color: { value: ["#ed8936", "#e53e3e"] },
            shape: { type: "circle" },
            opacity: { value: 0.2 },
            size: { value: { min: 10, max: 30 } },
            move: {
              enable: true,
              speed: 0.5,
              direction: "none",
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
            shape: { type: "circle" },
            opacity: { value: 0.4 },
            size: { value: { min: 2, max: 8 } },
            move: {
              enable: true,
              speed: 1,
              direction: "top",
              outModes: "out",
              random: true
            }
          }
        };
      case "synthwave":
      case "crimson":
      case "midnight":
      default:
        return {
          particles: {
            number: { value: 40 },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.1 },
            size: { value: { min: 1, max: 3 } },
            move: {
              enable: true,
              speed: 0.8,
              direction: "none",
              outModes: "out"
            }
          }
        };
    }
  };

  const config = getThemeConfig(theme);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
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
        ...config
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none"
      }}
    />
  );
}
