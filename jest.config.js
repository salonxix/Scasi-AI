/**
 * Jest config for Scasi-AI.
 *
 * Setup:  npm install --save-dev jest @testing-library/jest-dom
 * Run:    npx jest
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require('next/jest')({ dir: './' });

/** @type {import('jest').Config} */
const config = {
    testEnvironment: 'jsdom',
    testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/__tests__/**',
    ],
    coverageThreshold: {
        global: {
            lines: 60,
            functions: 60,
            branches: 50,
            statements: 60,
        },
    },
};

module.exports = nextJest(config);
