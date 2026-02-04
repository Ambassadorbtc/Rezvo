import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../lib/theme';

// Auth Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

// Client Screens (Booking App)
import ClientHomeScreen from '../screens/client/HomeScreen';
import ClientSearchScreen from '../screens/client/SearchScreen';
import ClientBookingsScreen from '../screens/client/BookingsScreen';
import ClientProfileScreen from '../screens/client/ProfileScreen';
import BusinessDetailScreen from '../screens/client/BusinessDetailScreen';
import BookingFlowScreen from '../screens/client/BookingFlowScreen';

// Business Screens (Owner App)
import BusinessDashboardScreen from '../screens/business/DashboardScreen';
import BusinessCalendarScreen from '../screens/business/CalendarScreen';
import BusinessBookingsScreen from '../screens/business/BookingsScreen';
import BusinessServicesScreen from '../screens/business/ServicesScreen';
import BusinessSettingsScreen from '../screens/business/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Simple Tab Icon Component
function TabIcon({ label, focused }) {
  const icons = {
    Home: '🏠',
    Search: '🔍',
    Bookings: '📅',
    Profile: '👤',
    Dashboard: '📊',
    Calendar: '📆',
    Services: '✂️',
    Settings: '⚙️',
  };
  
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icons[label] || '📌'}
    </Text>
  );
}

// Client Bottom Tabs
function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          paddingTop: 8,
          paddingBottom: 24,
          height: 80,
        },
      })}
    >
      <Tab.Screen name="Home" component={ClientHomeScreen} />
      <Tab.Screen name="Search" component={ClientSearchScreen} />
      <Tab.Screen name="Bookings" component={ClientBookingsScreen} />
      <Tab.Screen name="Profile" component={ClientProfileScreen} />
    </Tab.Navigator>
  );
}

// Business Bottom Tabs
function BusinessTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          paddingTop: 8,
          paddingBottom: 24,
          height: 80,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={BusinessDashboardScreen} />
      <Tab.Screen name="Calendar" component={BusinessCalendarScreen} />
      <Tab.Screen name="Bookings" component={BusinessBookingsScreen} />
      <Tab.Screen name="Services" component={BusinessServicesScreen} />
      <Tab.Screen name="Settings" component={BusinessSettingsScreen} />
    </Tab.Navigator>
  );
}

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// Main Client Stack
function ClientStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClientTabs" component={ClientTabs} />
      <Stack.Screen name="BusinessDetail" component={BusinessDetailScreen} />
      <Stack.Screen name="BookingFlow" component={BookingFlowScreen} />
    </Stack.Navigator>
  );
}

// Main Business Stack
function BusinessStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BusinessTabs" component={BusinessTabs} />
    </Stack.Navigator>
  );
}

// Root Navigator
export default function AppNavigator() {
  const { user, userType, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Determine which stack to show
  const isLoggedIn = user !== null && user !== undefined;
  const isClient = userType === 'client';

  return (
    <NavigationContainer>
      {!isLoggedIn ? (
        <AuthStack />
      ) : isClient ? (
        <ClientStack />
      ) : (
        <BusinessStack />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
