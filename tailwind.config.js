
module.exports = {
  purge: { content: ['./public/**/*.html', './src/**/*.vue'] },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        rBlue: '#052CC0',
        rBlack: '#003057',
        rGreen: '#00C389',
        rGrayLight: '#F2F2FC',
        rGray: '#DDE5ED',
        rGrayMed: '#7A99AC',
        rGrayDark: '#7A99AC'
      },
      height: {
        tallest: '99999999999px'
      },
      padding: {
        headerHeight: '6.4rem'
      }
    },
    filter: {
      none: 'none',
      blur: 'blur(10px)',
      blurSmall: 'blur(5px)'
    },
    fontFamily: {
      sans: ['IBM Plex Sans', 'sans-serif']
    },
    gradientColorStops: theme => ({
      ...theme('colors'),
      blueMid: '#051EA9',
      blueEnd: '#060F8F'
    })
  },
  variants: {
    extend: {}
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-filters')
  ]
}
