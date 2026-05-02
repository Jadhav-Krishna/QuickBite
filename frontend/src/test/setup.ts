import { vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';
import React from 'react';

// Make React globally available for JSX
global.React = React;

expect.extend(matchers);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return []; }
  unobserve() {}
} as any;

// Mock FileReader
global.FileReader = class FileReader {
  readAsDataURL() {
    setTimeout(() => {
      if (this.onloadend) {
        this.onloadend({ target: { result: 'data:image/png;base64,mock' } } as any);
      }
    }, 0);
  }
  result: string | ArrayBuffer | null = null;
  onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
} as any;

// Mock requestAnimationFrame for GSAP
global.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 0) as unknown as number;
global.cancelAnimationFrame = (id: number) => clearTimeout(id);

// Mock environment variables
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000/api');
vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-google-client-id');
vi.stubEnv('VITE_GITHUB_CLIENT_ID', 'test-github-client-id');
