/**
 * Toast notification system
 * Shows styled notifications instead of using browser alerts
 */

interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

type ToastType = 'success' | 'error' | 'info' | 'warning';

const createToastElement = (
  message: string,
  type: ToastType,
  duration: number = 4000,
  position: string = 'top-right'
) => {
  // Create toast container if it doesn't exist
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      left: auto;
      bottom: auto;
      z-index: 9999;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 420px;
    `;
    
    // Adjust position based on parameter
    if (position.includes('left')) {
      container.style.right = 'auto';
      container.style.left = '24px';
    }
    if (position.includes('bottom')) {
      container.style.bottom = '24px';
      container.style.top = 'auto';
    }
    if (position.includes('center')) {
      container.style.left = '50%';
      container.style.transform = 'translateX(-50%)';
      container.style.right = 'auto';
    }
    
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.style.cssText = `
    animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    pointer-events: auto;
    border-radius: 16px;
    padding: 18px 22px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    font-size: 15px;
    font-weight: 500;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    gap: 14px;
    max-width: 100%;
    word-wrap: break-word;
    white-space: pre-wrap;
    backdrop-filter: blur(10px);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: pointer;
  `;

  // Set type-specific colors with modern gradients
  const typeStyles = {
    success: {
      bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      bgLight: '#ecfdf5',
      textLight: '#065f46',
      borderColor: '#10b981',
      icon: '✓',
      shadowColor: 'rgba(16, 185, 129, 0.2)'
    },
    error: {
      bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      bgLight: '#fef2f2',
      textLight: '#7f1d1d',
      borderColor: '#ef4444',
      icon: '✕',
      shadowColor: 'rgba(239, 68, 68, 0.2)'
    },
    info: {
      bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      bgLight: '#eff6ff',
      textLight: '#1e3a8a',
      borderColor: '#3b82f6',
      icon: 'ℹ',
      shadowColor: 'rgba(59, 130, 246, 0.2)'
    },
    warning: {
      bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      bgLight: '#fffbeb',
      textLight: '#78350f',
      borderColor: '#f59e0b',
      icon: '⚠',
      shadowColor: 'rgba(245, 158, 11, 0.2)'
    }
  };

  const style = typeStyles[type];
  toast.style.backgroundColor = style.bgLight;
  toast.style.color = style.textLight;
  toast.style.border = `1px solid ${style.borderColor}30`;
  toast.style.boxShadow += `, 0 0 0 1px ${style.borderColor}15, 0 4px 12px ${style.shadowColor}`;

  // Hover effect
  toast.onmouseenter = () => {
    toast.style.transform = 'translateY(-2px) scale(1.01)';
    toast.style.boxShadow = `0 24px 48px rgba(0, 0, 0, 0.15), 0 12px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px ${style.borderColor}25, 0 6px 16px ${style.shadowColor}`;
  };
  toast.onmouseleave = () => {
    toast.style.transform = 'translateY(0) scale(1)';
    toast.style.boxShadow = `0 20px 40px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px ${style.borderColor}15, 0 4px 12px ${style.shadowColor}`;
  };

  // Add icon with gradient background
  const iconWrapper = document.createElement('div');
  iconWrapper.style.cssText = `
    background: ${style.bg};
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 8px ${style.shadowColor};
  `;

  const icon = document.createElement('span');
  icon.textContent = style.icon;
  icon.style.cssText = `
    font-size: 18px;
    font-weight: bold;
    color: white;
    line-height: 1;
  `;
  iconWrapper.appendChild(icon);

  // Add message
  const messageSpan = document.createElement('span');
  messageSpan.textContent = message;
  messageSpan.style.cssText = `
    flex: 1;
    line-height: 1.5;
    letter-spacing: -0.01em;
  `;

  // Add close button with better styling
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `
    background: ${style.textLight}10;
    border: none;
    color: ${style.textLight};
    font-size: 22px;
    cursor: pointer;
    padding: 4px;
    margin-left: 4px;
    flex-shrink: 0;
    opacity: 0.6;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    border-radius: 8px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  `;
  closeBtn.onmouseover = () => {
    closeBtn.style.opacity = '1';
    closeBtn.style.background = `${style.textLight}20`;
    closeBtn.style.transform = 'scale(1.1) rotate(90deg)';
  };
  closeBtn.onmouseout = () => {
    closeBtn.style.opacity = '0.6';
    closeBtn.style.background = `${style.textLight}10`;
    closeBtn.style.transform = 'scale(1) rotate(0deg)';
  };
  closeBtn.onclick = (e) => {
    e.stopPropagation();
    removeToast();
  };

  toast.appendChild(iconWrapper);
  toast.appendChild(messageSpan);
  toast.appendChild(closeBtn);

  // Add animation styles to document if not already there
  if (!document.getElementById('toast-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'toast-styles';
    styleEl.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0) scale(1);
          opacity: 1;
        }
        to {
          transform: translateX(400px) scale(0.95);
          opacity: 0;
        }
      }
      @keyframes slideInLeft {
        from {
          transform: translateX(-400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutLeft {
        from {
          transform: translateX(0) scale(1);
          opacity: 1;
        }
        to {
          transform: translateX(-400px) scale(0.95);
          opacity: 0;
        }
      }
      @keyframes fadeIn {
        from {
          transform: translateY(-20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      @keyframes fadeOut {
        from {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
        to {
          transform: translateY(-20px) scale(0.95);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styleEl);
  }

  // Adjust animation based on position
  if (position.includes('left')) {
    toast.style.animation = 'slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
  } else if (position.includes('center')) {
    toast.style.animation = 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
  }

  // Add to container
  container.appendChild(toast);

  const removeToast = () => {
    if (position.includes('left')) {
      toast.style.animation = 'slideOutLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    } else if (position.includes('center')) {
      toast.style.animation = 'fadeOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    } else {
      toast.style.animation = 'slideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    }
    setTimeout(() => {
      toast.remove();
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 300);
  };

  // Auto remove after duration
  if (duration > 0) {
    setTimeout(removeToast, duration);
  }
};

export const toast = {
  success: (message: string, options: ToastOptions = {}) => {
    createToastElement(message, 'success', options.duration ?? 4000, options.position ?? 'top-right');
  },
  error: (message: string, options: ToastOptions = {}) => {
    createToastElement(message, 'error', options.duration ?? 5000, options.position ?? 'top-right');
  },
  info: (message: string, options: ToastOptions = {}) => {
    createToastElement(message, 'info', options.duration ?? 4000, options.position ?? 'top-right');
  },
  warning: (message: string, options: ToastOptions = {}) => {
    createToastElement(message, 'warning', options.duration ?? 4000, options.position ?? 'top-right');
  },
};

export default toast;