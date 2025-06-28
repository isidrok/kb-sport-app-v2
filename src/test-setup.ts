import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/preact';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});