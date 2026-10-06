import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import HistorialMedicoScreen from "../screens/HistorialMedicoScreen";
import { colors } from "../constants/styles";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, View } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import MisCitas from "../screens/MisCitas";
import ReservarCitaScreen from '../screens/ReservarCitaScreen';
import RegisterScreen from "../screens/RegisterScreen";
import AppointmentDetailsScreen from "../screens/DetalleCita";
import ProfileScreen from "../screens/ProfileScreen";
import CentrosSaludScreen from "../screens/CentrosSaludScreen";
import { supabase } from '../supabase/supabaseClient';
import { useEffect, useState } from "react";

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
   const [session, setSession] = useState(null)
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      const getSession = async () => {
         try {
            const { data } = await supabase.auth.getSession()

            setSession(data.session)
         } finally {
            setLoading(false)
         }
      }
      
      void getSession().catch((error) => {
         console.error("Error al obtener la sesión:", error)
         setLoading(false)
      })

      const { data : listener } = supabase.auth.onAuthStateChange(
         (_, session) => {
            setSession(session)
         }
      )

      return () => listener.subscription.unsubscribe()
   }, [])

   if (loading) {
      return (
         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }}>
            <ActivityIndicator color={'white'} />
         </View>
      );
   }

   return (
      <NavigationContainer>
         <Stack.Navigator
            initialRouteName={session ? "Home" : "Login"}
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
               name="CentrosSalud"
               component={CentrosSaludScreen}
               options={{
                  title: "Centros de Salud",
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
