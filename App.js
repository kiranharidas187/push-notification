/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import PushNotification from 'react-native-push-notification';
import PushController from './PushNotification';
import { AsyncStorage } from 'react-native';
import firebase from 'react-native-firebase';
// PushController
// import PushController from './PushController.js'; 

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    // this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.sendNotification = this.sendNotification.bind(this);
  };

  componentDidMount() {
    this.checkPermission();
    this.createNotificationListeners(); //add this line

    // AppState.addEventListener('change', this.handleAppStateChange);
  };

  async createNotificationListeners() {


    this.notificationListener = firebase.notifications().onNotification((notification) => {
      const { title, body } = notification;
      // this.showAlert(title, body);
      // this.sendNotification("opened");

    });

    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
      const { title, body } = notificationOpen.notification;
      // this.showAlert(title, body);
      // this.sendNotification("colsed");
    });

    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
      const { title, body } = notificationOpen.notification;
      this.showAlert(title, body);
    }

    this.messageListener = firebase.messaging().onMessage((message) => {
      //process data message
      console.log(JSON.stringify(message));
    });

  }

  showAlert(title, body) {
    Alert.alert(
      title, body,
      [
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ],
      { cancelable: false },
    );
  }


  componentWillUnmount() {
    // AppState.removeEventListener('change', this.handleAppStateChange);
  };

  // This will notify the user in 3 seconds after sending the app to the 
  // background (like after pressing the home button or switching apps)
  handleAppStateChange(appState) {
    // if (appState === 'background') {
    //   // Schedule a notification
    //   PushNotification.localNotificationSchedule({
    //     message: 'Scheduled delay notification message', // (required)
    //     date: new Date(Date.now() + (3 * 1000)) // in 3 secs
    //   });
    // }
  };

  sendNotification() {
    console.log("send notification")
    PushNotification.localNotification({
      title: "My Notification Title ", // (optional)
      message: "My Notification Message", // (required)
      playSound: true, // (optional) default: true
      soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
      number: '10', // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
      repeatType: 'day', // (optional) Repeating interval. Check 'Repeating Notifications' section for more info.
      actions: '["Yes", "No"]',
    });
  };

  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
      console.log("request permission success")

    } else {
      console.log("request permission error")
      this.requestPermission();
    }
  }

  //3
  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    console.log("Local: " + fcmToken)
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      console.log("Token: " + fcmToken)
      if (fcmToken) {
        // user has a device token
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    } else {
      firebase.messaging().onMessage((message) => {
        // Process your message as required
        console.log("Message")
      });
    }
  }

  //2
  async requestPermission() {
    try {
      console.log("inside")
      await firebase.messaging().requestPermission();
      // User has authorised
      this.getToken();
    } catch (error) {
      // User has rejected permissions
      console.log('permission rejected');
    }
  }


  render() {
    return (
      <View >
        <Button title='Press here for a notification'
          onPress={this.sendNotification} />
        <PushController />
      </View>
    );
  };

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

// export default App;
