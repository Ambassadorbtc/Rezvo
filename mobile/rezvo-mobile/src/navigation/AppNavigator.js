import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, typography } from '../lib/theme';

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

// Icons (using simple text for now, will add expo-vector-icons later)
const TabIcon = ({ name, focused }) => (
  <View style={styles.iconContainer}>
    <Text style={[styles.iconText, focused === true && styles.iconFocused]}>{name}</Text>
  </View>
);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Client Bottom Tabs
function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={ClientHomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={ClientSearchScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="🔍" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={ClientBookingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="📅" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ClientProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Business Bottom Tabs
function BusinessTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={BusinessDashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={BusinessCalendarScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="📆" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BusinessBookingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="📋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Services"
        component={BusinessServicesScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="✂️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={BusinessSettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// Main Client Stack
function ClientStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="ClientTabs" component={ClientTabs} />
      <Stack.Screen name="BusinessDetail" component={BusinessDetailScreen} />
      <Stack.Screen name="BookingFlow" component={BookingFlowScreen} />
    </Stack.Navigator>
  );
}

// Main Business Stack
function BusinessStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="BusinessTabs" component={BusinessTabs} />
    </Stack.Navigator>
  );
}

// Root Navigator
export default function AppNavigator() {
  const { user, userType, loading } = useAuth();

  if (loading === true) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.spinner} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user === null ? (
        <AuthStack />
      ) : userType === 'client' ? (
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
  spinner: {
    width: 32,
    height: 32,
    borderWidth: 3,
    borderColor: colors.primary,
    borderTopColor: 'transparent',
    borderRadius: 16,
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
    paddingBottom: 24,
    height: 80,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
    opacity: 0.7,
  },
  iconFocused: {
    opacity: 1,
  },
});
