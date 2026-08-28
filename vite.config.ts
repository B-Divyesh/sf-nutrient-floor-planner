import { defineConfig } from 'vitest/config';
export default defineConfig({ build: { target: 'es2022' }, test: { exclude: ['tests/**', 'node_modules/**', 'dist/**'] } });
