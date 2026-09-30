import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import HistorialMedicoScreen from "../screens/HistorialMedicoScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
   return (
      <NavigationContainer>
         <Stack.Navigator initialRouteName="HistorialMedico">
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
                  headerShown: false
               }}
            />
         </Stack.Navigator>
      </NavigationContainer>
   )
}
