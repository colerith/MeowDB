const FALLBACK_EXTENSION_FOLDER = 'MeowDB';
const RELOAD_DELAY_MS = 800;

function getSelfExtensionFolder(): string {
  const match = import.meta.url.match(/\/scripts\/extensions\/[^/]+\/([^/]+)\//i);
  return match?.[1] ?? FALLBACK_EXTENSION_FOLDER;
}

function normalizeExtensionName(name: string): string {
  const trimmed = name.trim().replace(/^['"]|['"]$/g, '');
  const withoutSlashes = trimmed.replace(/^\/+|\/+$/g, '');
  const parts = withoutSlashes.split('/').filter(Boolean);
  return (parts.at(-1) ?? '').toLowerCase();
}

function isExtensionUpdateApi(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.pathname === '/api/extensions/update';
  } catch {
    return false;
  }
}

async function readUpdateTarget(input: RequestInfo | URL, init?: RequestInit): Promise<string | null> {
  const tryParse = (text: string): string | null => {
    try {
      const payload = JSON.parse(text) as { extensionName?: unknown };
      return typeof payload.extensionName === 'string' ? payload.extensionName : null;
    } catch {
      return null;
    }
  };

  if (typeof init?.body === 'string') {
    return tryParse(init.body);
  }

  if (input instanceof Request) {
    try {
      const text = await input.clone().text();
      return tryParse(text);
    } catch {
      return null;
    }
  }

  return null;
}

function scheduleReload(): void {
  const w = window as typeof window & { __meowdbReloadScheduled?: boolean };
  if (w.__meowdbReloadScheduled) return;

  w.__meowdbReloadScheduled = true;

  const toastrRef = (window as typeof window & { toastr?: { info?: (msg: string) => void } }).toastr;
  toastrRef?.info?.('MeowDB update detected. Reloading page...');

  window.setTimeout(() => {
    window.location.reload();
  }, RELOAD_DELAY_MS);
}

export function initAutoReloadOnExtensionUpdate(): void {
  const w = window as typeof window & { __meowdbAutoReloadPatchInstalled?: boolean };
  if (w.__meowdbAutoReloadPatchInstalled) return;
  w.__meowdbAutoReloadPatchInstalled = true;

  const selfExtensionName = normalizeExtensionName(getSelfExtensionFolder());
  const originalFetch = window.fetch.bind(window);

  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const response = await originalFetch(input, init);

    try {
      const requestUrl = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
      if (!isExtensionUpdateApi(requestUrl)) {
        return response;
      }

      const target = await readUpdateTarget(input, init);
      if (!target || normalizeExtensionName(target) !== selfExtensionName) {
        return response;
      }

      if (!response.ok) {
        return response;
      }

      const data = (await response.clone().json()) as { isUpToDate?: unknown };
      if (data?.isUpToDate === false) {
        scheduleReload();
      }
    } catch {
      // ignore update hook failures; do not break normal fetch flow
    }

    return response;
  }) as typeof fetch;
}
