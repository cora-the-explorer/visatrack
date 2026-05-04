import type { Config } from 'tailwindcss';
import { visa-trackPreset } from '@visa-track/ui/tailwind-preset';

const config: Config = {
  presets: [visa-trackPreset as Config],
  content: [
    './src/**/*.{ts,tsx,mdx}',
    './app/**/*.{ts,tsx,mdx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};

export default config;
