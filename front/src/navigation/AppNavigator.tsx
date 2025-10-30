import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useAuth} from '../context/AuthContext';

// Import screens (to be created)
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CheckInOutScreen from '../screens/CheckInOutScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import SalaryScreen from '../screens/SalaryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FaceRegistrationScreen from '../screens/FaceRegistrationScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const MainTabs = () => {
  const {user} = useAuth();
  const isHRorAdmin = user && (user.role === 'admin' || user.role === 'manager');

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{title: 'Accueil'}}
      />
      <Tab.Screen
        name="CheckInOut"
        component={CheckInOutScreen}
        options={{title: 'Pointage'}}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{title: 'Présences'}}
      />
      <Tab.Screen
        name="Salary"
        component={SalaryScreen}
        options={{title: 'Salaire'}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{title: 'Profil'}}
      />
      {isHRorAdmin && (
        <Tab.Screen
          name="FaceRegistration"
          component={FaceRegistrationScreen}
          options={{title: 'RH'}}
        />
      )}
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const {user, loading} = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
