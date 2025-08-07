import { definePreset } from '@primeng/themes';
import Lara from '@primeng/themes/lara';

export const MyThemePreset = definePreset(Lara, {
  semantic: {
    transitionDuration: '0.3s',
    focusRing: {
      width: '1px',
      style: 'solid',
      color: '{primary.color}',
      offset: '2px'
    },
    disabledOpacity: '0.6',
    primary: {
      50: '#fefaf3',
      100: '#fce8c6',
      200: '#fad698',
      300: '#f8c46b',
      400: '#f6b23d',
      500: '#f4a010',
      600: '#cf880e',
      700: '#ab700b',
      800: '#865809',
      900: '#624006',
      950: '#3d2804'
    },
    formField: {
      paddingX: '0.75rem',
      paddingY: '0.5rem',
      focusRing: {
        width: '0',
        style: 'none',
        color: 'transparent',
        offset: '0',
        shadow: 'none'
      },
      transitionDuration: '{transition.duration}'
    },
    content: {
      borderRadius: '{border.radius.md}'
    },
    navigation: {
      list: {
        padding: '0.5rem',
        gap: '0.5rem'
      },
      item: {
        padding: '0.6rem 0.75rem',
        borderRadius: '{border.radius.md}',
        gap: '0.5rem'
      }
    },
    overlay: {
      select: {
        borderRadius: '{border.radius.md}',
        shadow:
          '0 0 0 1px hsla(0, 0%, 0%, 0.03), 0 0 25px -10px rgba(0, 0, 0, 0.3);'
      },
      popover: {
        borderRadius: '{border.radius.md}',
        padding: '0.75rem',
        shadow:
          '0 0 0 1px hsla(0, 0%, 0%, 0.03), 0 0 25px -10px rgba(0, 0, 0, 0.3);'
      },
      modal: {
        borderRadius: '{border.radius.xl}',
        padding: '1.25rem',
        shadow:
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      },
      navigation: {
        shadow:
          '0 0 0 1px hsla(0, 0%, 0%, 0.03), 0 0 25px -10px rgba(0, 0, 0, 0.3);'
      }
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}'
        }
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b'
        },
        primary: {
          color: '{primary.400}',
          contrastColor: '{surface.900}',
          hoverColor: '{primary.300}',
          activeColor: '{primary.200}'
        }
      }
    }
  }
});
