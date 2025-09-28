module.exports = {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
      },
      fontSize: {
        'xxs': '0.65rem',
        'xxl': '2.5rem',
        "8.5xl":'7rem',
      },
      colors: {
        primaryColor: '#006a69',
        secondaryColor: '#009D9C',
        textColor: '#333333',
        backGC: '#f6eee0',
        boxesC:'#f2dbd0',
        deleteC: '#dc3968',
      },
      maxHeight: {
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
      },
      minHeight: {
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
      },
      maxWidth: {
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
        '176': '44rem',
      },
      width: {
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
        '176': '44rem',
      },
      height: {
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
      },

    },
  },
  plugins: [],
};
