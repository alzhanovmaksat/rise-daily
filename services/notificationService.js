import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return;
    }
  }
  return token;
}

export async function scheduleNotifications(settings) {
  await cancelAllNotifications();
  
  const times = [
    { hour: 7, minute: 0, title: 'Morning Affirmation', body: 'Start your day with inspiration' },
    { hour: 14, minute: 0, title: 'Afternoon Affirmation', body: 'Stay motivated through your day' },
    { hour: 20, minute: 0, title: 'Evening Affirmation', body: 'End your day with peace' }
  ];

  for (const time of times) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: time.title,
        body: time.body,
        sound: true,
      },
      trigger: {
        hour: time.hour,
        minute: time.minute,
        repeats: true,
      },
    });
  }
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
