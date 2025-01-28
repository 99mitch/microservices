import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import VideoDetailsScreen from '../screens/VideoDetailsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'MyYouTube',
          }}
        />
        <Stack.Screen 
          name="VideoDetails" 
          component={VideoDetailsScreen}
          options={({ route }) => ({
            title: route.params?.video?.name || 'Video Details',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
