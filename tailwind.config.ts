const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './_components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        accent: 'var(--accent)',
        'light-shadow': 'var(--light-shadow)',
        shadow: 'var(--shadow)',
        highlight: 'var(--highlight)',
        white: 'var(--white)',
        hover: 'var(--hover)',
        medium: 'var(--medium)',
        'dark-hover': 'var(--dark-hover)',
      },
      borderWidth: {
        DEFAULT: '3px',
      },
      screens: {
        xs: '400px',
        custom: '1200px',
      },
      skew: {
        'hover-left': '1deg',
        'hover-right': '-1deg',
        'hover-middle': '0deg',
      },
      translate: {
        'hover-left': '-0.5px',
        'hover-right': '-0.5px',
        'hover-middle': '1px',
      },
    },
  },
  plugins: [
    // @ts-expect-error - v4 migration
    function ({ addComponents }) {
      addComponents({
        '.pixel-corners': {
          clipPath:
            'polygon(0px calc(100% - 6px), 3px calc(100% - 6px), 3px calc(100% - 3px), 6px calc(100% - 3px), 6px 100%, calc(100% - 6px) 100%, calc(100% - 6px) calc(100% - 3px), calc(100% - 3px) calc(100% - 3px), calc(100% - 3px) calc(100% - 6px), 100% calc(100% - 6px), 100% 6px, calc(100% - 3px) 6px, calc(100% - 3px) 3px, calc(100% - 6px) 3px, calc(100% - 6px) 0px, 6px 0px, 6px 3px, 3px 3px, 3px 6px, 0px 6px)',
          position: 'relative',
          border: '3px solid transparent',
          '&::before': {
            content: '""',
            position: 'absolute',
            clipPath:
              'polygon(0px calc(100% - 6px), 3px calc(100% - 6px), 3px calc(100% - 3px), 6px calc(100% - 3px), 6px 100%, calc(100% - 6px) 100%, calc(100% - 6px) calc(100% - 3px), calc(100% - 3px) calc(100% - 3px), calc(100% - 3px) calc(100% - 6px), 100% calc(100% - 6px), 100% 6px, calc(100% - 3px) 6px, calc(100% - 3px) 3px, calc(100% - 6px) 3px, calc(100% - 6px) 0px, 6px 0px, 6px 3px, 3px 3px, 3px 6px, 0px 6px, 0px 50%, 3px 50%, 3px 6px, 6px 6px, 6px 3px, calc(100% - 6px) 3px, calc(100% - 6px) 6px, calc(100% - 3px) 6px, calc(100% - 3px) calc(100% - 6px), calc(100% - 6px) calc(100% - 6px), calc(100% - 6px) calc(100% - 3px), 6px calc(100% - 3px), 6px calc(100% - 6px), 3px calc(100% - 6px), 3px 50%, 0px 50%)',
            top: '0',
            bottom: '0',
            left: '0',
            right: '0',
            background: 'var(--pixel-border-color, var(--white))',
            display: 'block',
            pointerEvents: 'none',
            margin: '-3px',
          },
        },
        '.pixel-corners-top': {
          clipPath:
            'polygon(100% 6px, calc(100% - 3px) 6px, calc(100% - 3px) 3px, calc(100% - 6px) 3px, calc(100% - 6px) 0px, 6px 0px, 6px 3px, 3px 3px, 3px 6px, 0px 6px, 0px 100%, 100% 100%)',
          position: 'relative',
          border: '3px solid transparent',
          '&::before': {
            content: '""',
            position: 'absolute',
            clipPath:
              'polygon(100% 6px, calc(100% - 3px) 6px, calc(100% - 3px) 3px, calc(100% - 6px) 3px, calc(100% - 6px) 0px, 6px 0px, 6px 3px, 3px 3px, 3px 6px, 0px 6px, 0px 100%, 3px 100%, 3px 6px, 6px 6px, 6px 3px, calc(100% - 6px) 3px, calc(100% - 6px) 6px, calc(100% - 3px) 6px, calc(100% - 3px) 100%, 100% 100%)',
            top: '0',
            bottom: '0',
            left: '0',
            right: '0',
            background: 'var(--pixel-border-color, var(--white))',
            display: 'block',
            pointerEvents: 'none',
            margin: '-3px',
          },
        },
      })

      const colorUtilities = {
        '.pixel-border-white': { '--pixel-border-color': 'var(--white)' },
        '.pixel-border-black': { '--pixel-border-color': 'var(--foreground)' },
        '.pixel-border-highlight': {
          '--pixel-border-color': 'var(--highlight)',
        },
        '.pixel-border-shadow': {
          '--pixel-border-color': 'var(--shadow)',
        },
        '.pixel-border-background': {
          '--pixel-border-color': 'var(--background)',
        },
        '.pixel-border-medium': {
          '--pixel-border-color': 'var(--medium)',
        },
        '.pixel-border-light-shadow': {
          '--pixel-border-color': 'var(--light-shadow)',
        },
        '.pixel-border-accent': {
          '--pixel-border-color': 'var(--accent)',
        },
      }

      addComponents(colorUtilities)
    },
  ],
}

export default config
