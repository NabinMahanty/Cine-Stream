// ===== Utility Functions =====

/**
 * Debounce a function - waits until user stops calling for `delay` ms
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay = 500) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in ms
 */
export function showToast(message, duration = 2500) {
  if (typeof window === "undefined") return;

  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 350);
  }, duration);
}

/**
 * Extract year from a date string
 * @param {string} dateStr - Date string like "2024-03-15"
 * @returns {string} Year or "N/A"
 */
export function getYear(dateStr) {
  return dateStr ? dateStr.split("-")[0] : "N/A";
}
