/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0a0a0f',
        glass: 'rgba(255,255,255,0.07)',
        cyan: '#00e5ff',
        violet: '#8f5cff',
        ember: '#ffb800',
        plasma: '#6dff6d',
        magenta: '#ff3df2',
        danger: '#ff375f',
      },
      fontFamily: {
        heading: ['Orbitron', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 28px rgba(0,229,255,0.22)',
        violet: '0 0 32px rgba(143,92,255,0.25)',
        ember: '0 0 28px rgba(255,184,0,0.18)',
      },
      keyframes: {
        floatMesh: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(2%, -3%, 0) scale(1.06)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        toastIn: {
          from: { opacity: 0, transform: 'translateY(18px) scale(.96)' },
          to: { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-10px)' },
          '40%': { transform: 'translateX(9px)' },
          '60%': { transform: 'translateX(-6px)' },
          '80%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        'float-mesh': 'floatMesh 14s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        'toast-in': 'toastIn 260ms ease-out both',
        shake: 'shake 420ms ease-in-out',
      },
    },
  },
  plugins: [],
}
