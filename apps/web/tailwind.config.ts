import type { Config } from 'tailwindcss';
import { visaTrackPreset } from '@visa-track/ui/tailwind-preset';

const config: Config = {
  presets: [visaTrackPreset as Config],
  content: [
    './src/**/*.{ts,tsx,mdx}',
    './app/**/*.{ts,tsx,mdx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};

export default config;
