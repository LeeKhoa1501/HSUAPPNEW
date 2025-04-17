// App.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../HSUMobileApp/screens/LoginScreen';
import MainTabNavigator from './MainTabNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BookingScreen from './screens/BookingScreen';
import HandbookScreen from './screens/HandbookScreen';
import TimetableScreen from './screens/TimetableScreen';
import ExamScheduleScreen from './screens/ExamScheduleScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="Handbook" component={HandbookScreen} 
          options={{
            headerShown:true,
            title:'Sổ tay sinh viên',
            headerStyle:{backgroundColor:'#002366'},
            headerTintColor:'#fff',
          }}/>

          <Stack.Screen name="Booking" component={BookingScreen}
            options={{
              headerShown: true, 
              title: 'Đặt phòng', 
              headerStyle: { backgroundColor: '#002366' }, 
              headerTintColor: '#fff',             
            }}
          />

          <Stack.Screen name="Timetable" component={TimetableScreen}
            options={{
              headerShown: true, 
              title: 'Thời khóa biểu', 
              headerStyle: { backgroundColor: '#002366' }, 
              headerTintColor: '#fff',             
            }}
          />

          <Stack.Screen name='ExamSchedule' component={ExamScheduleScreen}
          options={{
            headerShown:true,
            title:'Lịch thi',
            headerStyle:{backgroundColor:'#002366'},
            headerTintColor:'#fff',
          }}></Stack.Screen>
          
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});