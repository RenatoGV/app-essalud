import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import HistorialMedicoScreen from "../screens/HistorialMedicoScreen";
import { colors } from "../constants/styles";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import MisCitas from "../screens/MisCitas";
import ReservarCitaScreen from '../screens/ReservarCitaScreen';
import RegisterScreen from "../screens/RegisterScreen";
import AppointmentDetailsScreen from "../screens/DetalleCita";
import ProfileScreen from "../screens/ProfileScreen";

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
               name = "Register"
               component = {RegisterScreen}
               options={{
                  headerShown: false
               }}
            />
            <Stack.Screen
               name = "Home"
               component = {HomeScreen}
               options={{
                  headerShown: false
               }}
            />
            <Stack.Screen
               name = "Profile"
               component = {ProfileScreen}
               options={{
                  title: 'Perfil del paciente'
               }}
            />
            <Stack.Screen
               name = "ReservarCita"
               component = {ReservarCitaScreen}
               options={{
                  title: 'Reservar cita'
               }}
            />
            <Stack.Screen
               name = "MisCitas"
               component = {MisCitas}
               options={{
                  title: 'Mis citas'
               }}
            />
            <Stack.Screen
               name = "HistorialMedico"
               component = {HistorialMedicoScreen}
               options={{
                  title: 'Historial Médico'
               }}
            />
            <Stack.Screen
               name = "DetalleCita"
               component = {AppointmentDetailsScreen}
               options={{
                  title: 'Detalles de la Cita'
               }}
            />
         </Stack.Navigator>
      </NavigationContainer>
   )
}
