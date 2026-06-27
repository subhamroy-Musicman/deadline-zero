"use client";

import React from "react";

export default function BouncingBall() {
  return (
    <div className="bouncing-ball-container">
      <div className="bouncing-ball-world">
        <div className="bouncing-ball-shadow"></div>
        <div className="bouncing-ball"></div>
      </div>
    </div>
  );
}
