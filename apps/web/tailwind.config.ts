import type { Config } from 'tailwindcss';
import { spinvisaPreset } from '@spinvisa/ui/tailwind-preset';

const config: Config = {
  presets: [spinvisaPreset as Config],
  content: [
    './src/**/*.{ts,tsx,mdx}',
    './app/**/*.{ts,tsx,mdx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};

export default config;
