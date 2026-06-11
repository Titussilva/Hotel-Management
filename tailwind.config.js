export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        ink: '#17211f',
        pine: '#24594f',
        coral: '#d96f57',
        mist: '#edf5f2',
        gold: '#c8942f',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(23, 33, 31, 0.10)',
      },
    },
  },
  plugins: [],
};
