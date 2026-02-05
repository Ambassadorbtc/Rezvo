import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import PasswordResetSuccessScreen from '../screens/PasswordResetSuccessScreen';

// Client Screens
import ClientHomeScreen from '../screens/client/HomeScreen';
import ClientSearchScreen from '../screens/client/SearchScreen';
import ClientBookingsScreen from '../screens/client/BookingsScreen';
import ClientProfileScreen from '../screens/client/ProfileScreen';
import BusinessDetailScreen from '../screens/client/BusinessDetailScreen';
import BookingFlowScreen from '../screens/client/BookingFlowScreen';

// Business Screens
import BusinessDashboardScreen from '../screens/business/DashboardScreen';
import BusinessCalendarScreen from '../screens/business/CalendarScreen';
import BusinessBookingsScreen from '../screens/business/BookingsScreen';
import BusinessServicesScreen from '../screens/business/ServicesScreen';
import BusinessSettingsScreen from '../screens/business/SettingsScreen';
import BusinessTeamScreen from '../screens/business/TeamScreen';
import BusinessAnalyticsScreen from '../screens/business/AnalyticsScreen';

// Settings Sub-screens
import HelpCentreScreen from '../screens/HelpCentreScreen';
import ContactSupportScreen from '../screens/ContactSupportScreen';
import TermsPrivacyScreen from '../screens/TermsPrivacyScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TEAL = '#00BFA5';
const GRAY = '#9FB3C8';

// Client Bottom Tabs
function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Bookings') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: TEAL,
        tabBarInactiveTintColor: GRAY,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
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
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Calendar') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Bookings') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Services') iconName = focused ? 'cut' : 'cut-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: TEAL,
        tabBarInactiveTintColor: GRAY,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
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

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="PasswordResetSuccess" component={PasswordResetSuccessScreen} />
    </Stack.Navigator>
  );
}

function ClientStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClientTabs" component={ClientTabs} />
      <Stack.Screen name="BusinessDetail" component={BusinessDetailScreen} />
      <Stack.Screen name="BookingFlow" component={BookingFlowScreen} />
      <Stack.Screen name="HelpCentre" component={HelpCentreScreen} />
      <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
      <Stack.Screen name="TermsPrivacy" component={TermsPrivacyScreen} />
    </Stack.Navigator>
  );
}

function BusinessStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BusinessTabs" component={BusinessTabs} />
      <Stack.Screen name="Team" component={BusinessTeamScreen} />
      <Stack.Screen name="Analytics" component={BusinessAnalyticsScreen} />
      <Stack.Screen name="HelpCentre" component={HelpCentreScreen} />
      <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
      <Stack.Screen name="TermsPrivacy" component={TermsPrivacyScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, userType, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    );
  }

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
    backgroundColor: '#FDFBF7',
  },
});
