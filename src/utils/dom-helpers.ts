export function mountAfterLastMes(container: HTMLElement): boolean {
  const chat = document.querySelector('#chat');
  const lastMes = chat?.querySelector('.mes.last_mes');
  if (!chat || !lastMes) return false;

  if (container.parentElement !== chat || container.previousElementSibling !== lastMes) {
    lastMes.insertAdjacentElement('afterend', container);
  }

  return true;
}
