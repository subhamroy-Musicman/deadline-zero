"use client";

import React, { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function ThemeProvider() {
  const { theme, mode } = useStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-mode', mode);
  }, [theme, mode]);

  return null;
}
