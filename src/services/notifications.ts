/**
 * Native Anbindung an expo-notifications. Plant zwei tägliche Erinnerungen
 * (morgens/abends). Idempotent: vor dem Planen werden alte Einträge gelöscht,
 * damit sich Erinnerungen nicht vervielfachen.
 */
import * as Notifications from "expo-notifications";
import { DEFAULT_REMINDERS, ReminderDef } from "./reminders";

/** Einmalig beim App-Start setzen: wie eine Benachrichtigung im Vordergrund erscheint. */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/** Erfragt die Berechtigung (falls nötig) und meldet, ob erlaubt. */
export async function ensureNotificationPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (
    current.granted ||
    current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/** Plant die täglichen Erinnerungen neu. Gibt false zurück, wenn keine Berechtigung. */
export async function scheduleDailyReminders(
  reminders: ReminderDef[] = DEFAULT_REMINDERS
): Promise<boolean> {
  const allowed = await ensureNotificationPermissions();
  if (!allowed) return false;

  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const r of reminders) {
    await Notifications.scheduleNotificationAsync({
      content: { title: r.title, body: r.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: r.hour,
        minute: r.minute,
      },
    });
  }
  return true;
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
