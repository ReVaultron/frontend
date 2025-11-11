// src/vite-polyfill.ts
// Add this file and import it at the top of main.tsx

import { Buffer } from 'buffer';

// Polyfill for Node.js globals in browser
if (typeof window !== 'undefined') {
  window.global = window.global ?? window;
  window.Buffer = window.Buffer ?? Buffer;
  window.process = window.process ?? { 
    env: {},
    version: '',
    versions: {} as any,
    nextTick: (fn: Function) => setTimeout(fn, 0)
  } as any;
}

// Ensure globalThis has Buffer
if (typeof globalThis !== 'undefined') {
  (globalThis as any).Buffer = Buffer;
  (globalThis as any).process = window.process;
}

export {};