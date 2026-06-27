"use client";

import React from "react";

export default function FloatingCurves() {
  return (
    <div className="floating-curves-container">
      <svg className="curve-svg curve-svg-1" viewBox="0 0 1000 200" preserveAspectRatio="none">
        <path d="M0,100 C250,250 750,-50 1000,100" fill="none" className="curve-path" />
      </svg>
      <svg className="curve-svg curve-svg-2" viewBox="0 0 1000 200" preserveAspectRatio="none">
        <path d="M0,100 C300,-50 700,250 1000,100" fill="none" className="curve-path" />
      </svg>
      <svg className="curve-svg curve-svg-3" viewBox="0 0 1000 200" preserveAspectRatio="none">
        <path d="M0,150 C400,-100 600,300 1000,50" fill="none" className="curve-path" />
      </svg>
    </div>
  );
}
