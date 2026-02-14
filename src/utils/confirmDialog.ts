/**
 * Custom confirmation dialog system
 * Replaces browser's window.confirm() with styled modals
 */

export const showConfirm = (message: string, title: string = 'Confirm'): Promise<boolean> => {
  return new Promise((resolve) => {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease-out;
    `;

    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 32px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Add styles for dark mode if needed
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      modal.style.backgroundColor = '#1f2937';
      modal.style.color = '#f3f4f6';
    }

    // Create title
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    titleEl.style.cssText = `
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: inherit;
    `;

    // Create message
    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    messageEl.style.cssText = `
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 24px 0;
      color: inherit;
      opacity: 0.9;
    `;

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    `;

    // Create Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = `
      padding: 10px 24px;
      border: 2px solid #e5e7eb;
      background: #f3f4f6;
      color: #1f2937;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;

    // Dark mode button style
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      cancelBtn.style.backgroundColor = '#374151';
      cancelBtn.style.borderColor = '#4b5563';
      cancelBtn.style.color = '#f3f4f6';
    }

    cancelBtn.onmouseover = () => {
      cancelBtn.style.opacity = '0.8';
    };
    cancelBtn.onmouseout = () => {
      cancelBtn.style.opacity = '1';
    };

    cancelBtn.onclick = () => {
      closeModal();
      resolve(false);
    };

    // Create Confirm button
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Delete';
    confirmBtn.style.cssText = `
      padding: 10px 24px;
      border: none;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    `;

    confirmBtn.onmouseover = () => {
      confirmBtn.style.transform = 'scale(1.05)';
      confirmBtn.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
    };
    confirmBtn.onmouseout = () => {
      confirmBtn.style.transform = 'scale(1)';
      confirmBtn.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
    };

    confirmBtn.onclick = () => {
      closeModal();
      resolve(true);
    };

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);

    modal.appendChild(titleEl);
    modal.appendChild(messageEl);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);

    // Add animation styles if not already in document
    if (!document.getElementById('confirm-dialog-styles')) {
      const style = document.createElement('style');
      style.id = 'confirm-dialog-styles';
      style.textContent = `
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(20px);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(overlay);

    const closeModal = () => {
      modal.style.animation = 'slideDown 0.2s ease-out';
      overlay.style.animation = 'fadeIn 0.2s ease-out reverse';
      setTimeout(() => {
        overlay.remove();
      }, 200);
    };

    // Close on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        resolve(false);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  });
};

export default showConfirm;
