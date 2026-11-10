export type NotifPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export function getNotifPermission(): NotifPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission as NotifPermission;
}

export async function requestNotifPermission(): Promise<NotifPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  try {
    const result = await Notification.requestPermission();
    return result as NotifPermission;
  } catch {
    return 'denied';
  }
}

export function showNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    const n = new Notification(title, {
      body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: 'kun-tartibi-' + Date.now(),
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    /* ignore */
  }
}
