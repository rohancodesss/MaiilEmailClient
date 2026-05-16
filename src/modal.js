let activeDialog = null;
let returnFocusElement = null;
let keydownHandler = null;

export function openDialog(dialogElement, openerElement) {
  closeDialog();
  if (!dialogElement) return;

  activeDialog = dialogElement;
  returnFocusElement = openerElement || document.activeElement;

  const focusable = getFocusableElements(dialogElement);
  (focusable[0] || dialogElement).focus();

  keydownHandler = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      document.dispatchEvent(new CustomEvent("byob:close-dialog"));
      return;
    }
    if (event.key === "Tab") trapTab(event, dialogElement);
  };

  document.addEventListener("keydown", keydownHandler);
}

export function closeDialog() {
  if (keydownHandler) {
    document.removeEventListener("keydown", keydownHandler);
    keydownHandler = null;
  }

  if (returnFocusElement && typeof returnFocusElement.focus === "function") {
    returnFocusElement.focus();
  }

  activeDialog = null;
  returnFocusElement = null;
}

function trapTab(event, dialogElement) {
  const focusable = getFocusableElements(dialogElement);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function getFocusableElements(root) {
  return [...root.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')].filter(
    (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true"
  );
}
