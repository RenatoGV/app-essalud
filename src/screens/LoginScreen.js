import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../constants/styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Octicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase/supabaseClient';

export default function LoginScreen() {

   const navigation = useNavigation()
   const [documento, setDocumento] = useState('')
   const [password, setPassword] = useState('')
   const [showPassword, setShowPassword] = useState(false)
   const [loading, setLoading] = useState(false)


   const handleLogin = async () => {
      if (!documento || !password) {
         Alert.alert("Error", "Por favor ingresa tu correo electrónico y contraseña.");
         return;
      }

      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
         email: documento,
         password: password
      });

      if (error) {
         Alert.alert("Error de Inicio de Sesión", error.message);
         setLoading(false);
         return;
      }

      setLoading(false);
      
      navigation.reset({
         index: 0,
         routes: [{ name: 'Home' }],
      });
   }

   return (
      <SafeAreaView style={styles.container}>
         <View style={styles.imageContainer}>
            <Image
               source={require('../../assets/logo.png')}
               style={{ width: 200, height: 200 }}
            />
         </View>
         <Text style={styles.title}>Bienvenido(a)</Text>

         <View style={styles.inputContainer}>
            <Octicons name="mail" size={24} color={colors.input} />
            <TextInput
               style={styles.input}
               placeholder='Correo Electrónico'
               placeholderTextColor={colors.input}
               value={documento}
               onChangeText={setDocumento}
               keyboardType='email-address'
               autoCapitalize='none'
            />
         </View>
         <View style={styles.inputContainer}>
            <Octicons name="lock" size={24} color={colors.input} />
            <TextInput
               style={styles.input}
               placeholder='Contraseña'
               placeholderTextColor={colors.input}
               secureTextEntry={!showPassword}
               value={password}
               onChangeText={setPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
               <Octicons name={showPassword ? "eye-closed" : "eye" } size={24} color={colors.input} />
            </Pressable>
         </View>

         <View style={styles.buttonsContainer}>

            <TouchableOpacity 
               style={styles.button} 
               onPress={handleLogin}
               disabled={loading}
            >
               {loading ? (
                  <ActivityIndicator color="white" />
               ) : (
                  <Text style={styles.textButton}>Ingresar</Text>
               )}
            </TouchableOpacity>

            <TouchableOpacity 
               style={[styles.button, { backgroundColor: colors.secondary }]}
               disabled={loading}
               // Cuando se trabaje en la rama de registro
               // onPress={() => navigation.navigate('Registro')}
            >
               <Text style={styles.textButton}>Crear cuenta</Text>
            </TouchableOpacity>
         </View>
         <StatusBar style="auto" />
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      paddingHorizontal: 40,
   },
   imageContainer: {
      marginVertical: 40
   },
   title: {
      fontSize: 32,
      fontWeight: '800',
      marginBottom: 40
   },
   inputContainer: {
      width: '100%',
      flexDirection: 'row',
      borderColor: colors.input,
      borderWidth: 2,
      paddingHorizontal: 10,
      borderRadius: 5,
      backgroundColor: 'white',
      alignItems: 'center',
      gap: 10,
      marginBottom: 30
   },
   input: {
      flex: 1,
      fontWeight: '700'
   },
   buttonsContainer: {
      width: '100%',
      gap: 20
   },
   button: {
      width: '100%',
      backgroundColor: colors.primary,
      padding: 15,
      alignItems: 'center',
      borderRadius: 8
   },
   textButton: {
      color: 'white',
      fontWeight: 'bold'
   }
});
