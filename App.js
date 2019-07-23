/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { View, Button, Text, StyleSheet, AppRegistry } from 'react-native';
import PushNotification from 'react-native-push-notification';
import PushNotificationAndroid from 'react-native-push-notification'

import PushController from './PushNotification';
import { AsyncStorage, DeviceEventEmitter } from 'react-native';
import firebase from 'react-native-firebase';
import bgMessaging from './bgMessaging';

// PushController
// import PushController from './PushController.js'; 

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    // this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.sendNotification = this.sendNotification.bind(this);
    PushNotificationAndroid.registerNotificationActions(['Accept','Reject', 'Yes', 'No']);
    DeviceEventEmitter.addListener('notificationActionReceived', function(action){
      console.log ('Notification action received: ' );
      console.log(JSON.parse(action.dataJSON).action)
      const info = JSON.parse(action.dataJSON);
      if (info.action == 'Accept') {
        console.log("Accept")
        // Do work pertaining to Accept action here
      } else if (info.action == 'Reject') {
        console.log("Reject")

        // Do work pertaining to Reject action here
      }
      // Add all the required actions handlers
    });

    AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging); 
  };

  componentDidMount() {
    this.checkPermission();
    this.createNotificationListeners(); //add this line

    // AppState.addEventListener('change', this.handleAppStateChange);
  };

  async createNotificationListeners() {


    this.notificationListener = firebase.notifications().onNotification((notification) => {
      const { title, body } = notification;
      console.log("onNotification")
      console.log(notificationOpen.notification)
      // this.showAlert(title, body);
      // this.sendNotification("opened");

    });

    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
      const { title, body } = notificationOpen.notification;
      console.log("onNotificationOpened")
      console.log(notificationOpen.notification)
      // this.showAlert(title, body);
      // this.sendNotification("colsed");
    });

    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
      const { title, body } = notificationOpen.notification;
      console.log("getInitialNotification")
      console.log(notificationOpen.notification)
      this.showAlert(title, body);
    }

    this.messageListener = firebase.messaging().onMessage((message) => {
      //process data message
      console.log(JSON.stringify(message));
      this.sendNotification(message);

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

  sendNotification(message) {
    console.log("send notification")
    PushNotification.localNotification(message._data);
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
