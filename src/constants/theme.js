export const colors = {
  primary: '#E67E22',      // Warm orange - representing African sunset
  secondary: '#27AE60',    // Forest green - representing nature
  success: '#2ECC71',      // Vibrant green - representing wildlife
  danger: '#C0392B',       // Deep red - representing Maasai culture
  warning: '#F39C12',      // Golden yellow - representing savannah
  info: '#3498DB',         // Sky blue - representing clear skies
  neutral: '#D5B8A3',      // Warm beige - representing earth tones
  accent: '#8E44AD',       // Deep purple - representing luxury
};

export const gradients = {
  primary: 'bg-gradient-to-r from-[#E67E22] to-[#D35400]',
  hover: 'hover:bg-gradient-to-l hover:from-[#E67E22] hover:to-[#D35400]',
};

export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  },
  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.3 }
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.3 }
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.3 }
  }
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
}; 