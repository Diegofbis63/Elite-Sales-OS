import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                app: {
                    bg: '#0a0a0a',
                    surface: '#0f0f0f',
                    accent: '#10b981',
                }
            },
            fontFamily: {
                serif: ['Playfair Display', 'serif'],
            }
        },
    },
    plugins: [],
}
export default config
