import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import HistorialMedicoScreen from "../screens/HistorialMedicoScreen";
import { colors } from "../constants/styles";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

const Stack = createNativeStackNavigator();

function BackButton({ canGoBack, tintColor }) {
   const navigation = useNavigation();

   if (!canGoBack) {
      return null;
   }

   return (
      <Pressable onPress={() => navigation.goBack()} style={{ width: 35 }} >
         <Ionicons name="chevron-back" size={24} color={tintColor} />
      </Pressable>
   )
}

export default function AppNavigator() {
   return (
      <NavigationContainer>
         <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
               headerBackVisible: false,
               headerStyle: {
                  backgroundColor: 'white',
               },
               headerShadowVisible: false,
               headerTintColor: colors.primary,
               headerTitleStyle: {
                  fontWeight: '900'
               },
               headerLeft: BackButton
            }}
         >
            <Stack.Screen
               name = "Login"
               component = {LoginScreen}
               options={{
                  headerShown: false
               }}
            />
            <Stack.Screen
               name = "HistorialMedico"
               component = {HistorialMedicoScreen}
               options={{
                  title: 'Historial Médico'
               }}
            />
         </Stack.Navigator>
      </NavigationContainer>
   )
}
