let current: HTMLElement | null = null;
let raf = 0;
let clearTimer: number | null = null;

function handlePointerMove(e: PointerEvent) {
  if (raf) cancelAnimationFrame(raf as any);
  raf = requestAnimationFrame(() => {
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    if (!el) return;
    const blinkable = el.closest('.blinkable') as HTMLElement | null;
    if (blinkable !== current) {
      if (current) current.classList.remove('is-blinking');
      if (blinkable) {
        blinkable.classList.add('is-blinking');
        if (clearTimer) window.clearTimeout(clearTimer);
        clearTimer = window.setTimeout(() => {
          blinkable.classList.remove('is-blinking');
          if (current === blinkable) current = null;
        }, 900);
      }
      current = blinkable;
    }
  });
}

function handleFocusIn(e: FocusEvent) {
  const target = e.target as HTMLElement | null;
  const blinkable = target?.closest?.('.blinkable') as HTMLElement | null;
  if (blinkable) blinkable.classList.add('is-blinking');
}

function handleFocusOut(e: FocusEvent) {
  const target = e.target as HTMLElement | null;
  const blinkable = target?.closest?.('.blinkable') as HTMLElement | null;
  if (blinkable) blinkable.classList.remove('is-blinking');
}

if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  window.addEventListener('focusin', handleFocusIn);
  window.addEventListener('focusout', handleFocusOut);
}

export {};
