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
        '7xl': '5rem',    // גודל ענק
      },
      colors: {
        primaryColor: '#006a69',
        secondaryColor: '#66b2b1',
      },
      maxHeight: {
        '112': '28rem', // לדוגמה, מידה חדשה בגובה 448px
        '128': '32rem', // לדוגמה, מידה חדשה בגובה 512px
        '144': '36rem', // לדוגמה, מידה חדשה בגובה 576px
      },
      maxWidth: {
        '112': '28rem', // לדוגמה, מידה חדשה ברוחב 448px
        '128': '32rem', // לדוגמה, מידה חדשה ברוחב 512px
        '144': '36rem', // לדוגמה, מידה חדשה ברוחב 576px
        '176': '44rem', // לדוגמה, מידה חדשה ברוחב 704px
      },
    },
  },
  plugins: [],
};
