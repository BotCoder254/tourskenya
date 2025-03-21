export const colors = {
  primary: '#66D2CE',
  secondary: '#2DAA9E',
  neutral: '#EAEAEA',
  accent: '#E3D2C3',
};

export const gradients = {
  primary: 'bg-gradient-to-r from-[#66D2CE] to-[#2DAA9E]',
  hover: 'hover:bg-gradient-to-l hover:from-[#66D2CE] hover:to-[#2DAA9E]',
};

export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  },
  slideIn: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.5 }
  },
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.3 }
  }
}; 