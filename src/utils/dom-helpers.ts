export function mountAfterLastMes(container: HTMLElement): boolean {
  const chat = document.querySelector('#chat') as HTMLElement | null;
  const lastMes = chat?.querySelector('.mes.last_mes') as HTMLElement | null;
  if (!chat) return false;

  if (lastMes) {
    if (container.parentElement !== chat || container.previousElementSibling !== lastMes) {
      lastMes.insertAdjacentElement('afterend', container);
    }
    return true;
  }

  // Fallback: chat may be ready before .mes.last_mes appears after refresh.
  if (container.parentElement !== chat) {
    chat.appendChild(container);
  }

  return true;
}
