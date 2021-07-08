
module.exports = {
  purge: { content: ['./public/**/*.html', './src/**/*.vue'] },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        rBlue: '#052CC0',
        rBlack: '#003057',
        rGreen: '#00C389',
        rGreenDark: '#00AB84',
        rRed: '#EF4136',
        rOffwhite: '#F8F8FD',
        rGrayLightest: '#F7F7FD',
        rGrayLight: '#F2F2FC',
        rGray: '#DDE5ED',
        rGrayMed: '#4F758B',
        rGrayDark: '#7A99AC',
        translucent: {
          black: 'rgba(0, 0, 0, 0.1)',
          gray: 'rgba(242, 242, 252, 0.3)',
          greenLighter: 'rgba(0, 195, 137, 0.2)',
          greenLight: 'rgba(0, 195, 137, 0.4)'
        }
      },
      height: {
        tallest: '99999999999px',
        modal: '600px'
      },
      padding: {
        headerHeight: '6.4rem'
      },
      width: {
        120: '30rem',
        26: '6.5rem'
      },
      margin: {
        '-full': '-100%'
      }
    },
    filter: {
      none: 'none',
      blur: 'blur(10px)',
      blurSmall: 'blur(5px)'
    },
    fontFamily: {
      sans: ['IBM Plex Sans', 'sans-serif'],
      mono: ['IBM Plex Mono', 'ui-monospace', 'monospace']
    },
    gradientColorStops: theme => ({
      ...theme('colors'),
      blueMid: '#051EA9',
      blueEnd: '#060F8F'
    })
  },
  variants: {
    extend: {
      backgroundColor: ['active'],
      textColor: ['active'],
      padding: ['odd', 'even'],
      margin: ['odd', 'even'],
      visibility: ['group-hover']
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-filters')
  ]
}
