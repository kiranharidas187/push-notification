// import firebase from 'react-native-firebase';
// Optional flow type
import type { RemoteMessage } from 'react-native-firebase';
import PushNotification from 'react-native-push-notification';

export default async (message: RemoteMessage) => {
    // handle your message
    console.log("BMessaging");
    console.log(message)
    // sendNotification(message) {
        console.log("send notification")
        PushNotification.localNotification(message.data);
    // };
    return Promise.resolve();
}