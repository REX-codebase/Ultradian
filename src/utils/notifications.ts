/**
 * Browser Notification API helper for desktop/background alerts
 */

export function checkNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendDesktopNotification(title: string, body: string, icon?: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: icon || '/favicon.ico',
      tag: 'ultradian-timer-alert',
      requireInteraction: true, // Remains on screen until user interacts!
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (err) {
    console.warn('Failed to send notification:', err);
  }
}

export function updateTabTitle(minutes: number, seconds: number, sessionType: 'work' | 'shortBreak' | 'longBreak', isRunning: boolean): void {
  const m = String(minutes).padStart(2, '0');
  const s = String(seconds).padStart(2, '0');
  const typeLabel = sessionType === 'work' ? '🧠 Flow' : sessionType === 'shortBreak' ? '☕ Rest' : '🌿 Recovery';
  const statusIcon = isRunning ? '▶' : '⏸';

  document.title = `${statusIcon} ${m}:${s} - ${typeLabel} | Ultradian Focus`;
}

export function resetTabTitle(): void {
  document.title = 'Ultradian Focus Pulse';
}
