import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

window.scheduleNativeAlarms = async function(tasks, timeToMsFn) {
  if (Capacitor.isNativePlatform()) {
    try {
      // Request permissions first
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== 'granted') return;

      // Cancel any pending notifications
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
      
      let notifications = [];
      let notifId = 1;
      const sorted = [...tasks].sort((a,b) => a.time.localeCompare(b.time));
      
      sorted.forEach((task, idx) => {
        const taskMs = timeToMsFn(task.time);
        const alertMs = taskMs - 60000;
        if (alertMs > Date.now()) {
          const prev = sorted[idx-1] || null;
          const msg = prev
            ? `"${task.name}" in 1 min — did you finish "${prev.name}"?`
            : `"${task.name}" starts in 1 minute!`;
          
          notifications.push({
            title: "⏰ Up Next",
            body: msg,
            id: notifId++,
            schedule: { at: new Date(alertMs), allowWhileIdle: true },
            sound: null,
            attachments: null,
            actionTypeId: "",
            extra: null
          });
        }
      });
      
      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
      }
    } catch (e) {
      console.error("Native notification error:", e);
    }
  }
};
