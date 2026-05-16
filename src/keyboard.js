export function bindKeyboardShortcuts(handlers) {
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const typing =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable;

    if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      handlers.focusSearch?.();
      return;
    }

    if (typing || event.metaKey || event.ctrlKey || event.altKey) return;

    if (event.key === "c") {
      event.preventDefault();
      handlers.compose?.();
    } else if (event.key === "j") {
      event.preventDefault();
      handlers.nextMessage?.();
    } else if (event.key === "k") {
      event.preventDefault();
      handlers.prevMessage?.();
    }
  });
}
