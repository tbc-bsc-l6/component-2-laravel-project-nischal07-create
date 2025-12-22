// Simple toast replacement for sonner
export const toast = {
  success: (message: string) => {
    alert(`✓ ${message}`);
  },
  error: (message: string) => {
    alert(`✗ ${message}`);
  },
  info: (message: string) => {
    alert(`ℹ ${message}`);
  },
};

