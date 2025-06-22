import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 🎨 Colores personalizados para FocusLife
      colors: {
        // Colores base del sistema (conservando los existentes)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // Sistema de glassmorphism personalizado
        glass: {
          light: 'rgba(255, 255, 255, 0.15)',
          medium: 'rgba(255, 255, 255, 0.25)',
          heavy: 'rgba(255, 255, 255, 0.35)',
        },

        // Bordes glassmorphism
        'glass-border': {
          light: 'rgba(255, 255, 255, 0.2)',
          medium: 'rgba(255, 255, 255, 0.3)',
          heavy: 'rgba(255, 255, 255, 0.4)',
        },

        // Colores para widgets con transparencias optimizadas
        widget: {
          blue: 'rgba(59, 130, 246, 0.4)',
          green: 'rgba(34, 197, 94, 0.4)',
          purple: 'rgba(147, 51, 234, 0.4)',
          orange: 'rgba(249, 115, 22, 0.4)',
          red: 'rgba(239, 68, 68, 0.4)',
        },

        // Bordes para widgets
        'widget-border': {
          blue: 'rgba(147, 197, 253, 0.7)',
          green: 'rgba(74, 222, 128, 0.6)',
          purple: 'rgba(196, 181, 253, 0.6)',
          orange: 'rgba(251, 146, 60, 0.6)',
          red: 'rgba(248, 113, 113, 0.6)',
        },

        // Mantener todos los colores shadcn/ui existentes
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },

      // 🎭 Gradientes personalizados para FocusLife
      backgroundImage: {
        'gradient-optimized':
          'linear-gradient(135deg, #64748b 0%, #3b82f6 50%, #6366f1 100%)',
        'gradient-blue': 'linear-gradient(to right, #2563eb, #4f46e5)',
        'gradient-green': 'linear-gradient(to right, #059669, #10b981)',
        'gradient-purple': 'linear-gradient(to right, #7c3aed, #8b5cf6)',
        'gradient-orange': 'linear-gradient(to right, #ea580c, #f97316)',
      },

      // 📦 Box shadows personalizadas para glassmorphism
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.12)',
        'glass-hover': '0 16px 64px rgba(0, 0, 0, 0.2)',
        'glass-strong':
          '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        widget: '0 4px 20px rgba(0, 0, 0, 0.1)',
      },

      // 🎬 Animaciones personalizadas
      animation: {
        'glass-fade': 'glassFade 0.3s ease-in-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },

      // 🎪 Keyframes para las animaciones
      keyframes: {
        glassFade: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      // 📏 Border radius personalizado
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        glass: '12px', // Específico para elementos glassmorphism
      },

      // 🔧 Backdrop blur personalizado
      backdropBlur: {
        glass: '16px',
        'glass-heavy': '24px',
      },
    },
  },
  plugins: [],
};

export default config;
