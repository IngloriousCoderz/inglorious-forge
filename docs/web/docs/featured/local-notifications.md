---
title: Local Notifications
description: "Reminders the device shows at a given time, even with the app closed"
---

# Local Notifications

`createLocalNotifications` from `@inglorious/web/device/local-notifications` is the type behind reminders the device shows on its own, such as "your job starts in an hour". In a native app they go through [`@capacitor/local-notifications`](https://capacitorjs.com/docs/apis/local-notifications), once you hand the plugin over, and show even with the app closed. In a browser they show only while the page is open, through the Notification API.

```javascript
import { LocalNotifications } from "@capacitor/local-notifications"
import { createLocalNotifications } from "@inglorious/web/device/local-notifications"

const types = {
  Reminders: createLocalNotifications({ plugin: LocalNotifications }),
}
const entities = { reminders: { type: "Reminders" } }

api.notify("#reminders:localNotificationSchedule", {
  id: 1,
  title: "Wedding in an hour",
  body: "Villa Erba, Cernobbio",
  at: new Date(start - HOUR),
  url: "/jobs/1",
})
api.notify("#reminders:localNotificationCancel", 1)
```

The entity's `permission` is `"granted"`, `"denied"`, `"prompt"` or `"unsupported"`, and `null` until the device says. `localNotificationsAsk` brings up the system's dialog: send it from a tap, which a browser requires.

An `id` is a whole number, which the app chooses so it can cancel the reminder later. A tap on a reminder with a `url` navigates there, through `onTap(url, api)` in the config, by default `#router:navigate`.
