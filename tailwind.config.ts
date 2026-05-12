import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ink: '#1d1b2f', blush: '#fff4f7', lavender: '#f4efff', rose: '#e96d8e', plum: '#6e4a86' },
      boxShadow: { soft: '0 20px 60px rgba(40, 29, 70, 0.12)' }
    }
  },
  plugins: []
};

export default config;
