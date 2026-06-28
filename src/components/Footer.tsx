"use client";

import React from "react";

export default function Footer() {
  return (
    <footer style={{
      textAlign: "center",
      padding: "3rem 1rem 1rem",
      marginTop: "auto",
      color: "var(--text-secondary)",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      opacity: 0.8,
      zIndex: 10,
      position: "relative"
    }}>
      <p style={{ margin: 0, fontWeight: 500, fontSize: "1rem" }}>
        Made with <span style={{ color: "#e25555" }}>❤</span> by Subham Roy
      </p>
      <p style={{ margin: 0, fontSize: "0.85rem" }}>
        For any queries or suggestions e-mail : <a href="https://mail.google.com/mail/?view=cm&fs=1&to=subhamroy5709@gmail.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>subhamroy5709@gmail.com</a>
      </p>
    </footer>
  );
}
