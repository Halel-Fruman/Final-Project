module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rubik', 'sans-serif'], // הגדרת Rubik כברירת מחדל
      },
      fontSize: {
        'xxs': '0.65rem', // גודל קטן במיוחד
        'xxl': '2.5rem',  // גודל גדול במיוחד
      },
      colors: {
        primaryColor: '#006a69',
        secondaryColor: '#66b2b1',
      },
    },
  },
  plugins: [],
};
