import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Octicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
   const navigation = useNavigation();
   
   const [showPassword, setShowPassword] = useState(false)

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
            <Octicons name="id-badge" size={24} color={colors.input} />
            <TextInput
               style={styles.input}
               placeholder='Número de Documento'
               placeholderTextColor={colors.input}
            />
         </View>
         <View style={styles.inputContainer}>
            <Octicons name="lock" size={24} color={colors.input} />
            <TextInput
               style={styles.input}
               placeholder='Contraseña'
               placeholderTextColor={colors.input}
               secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
               <Octicons name={showPassword ? "eye-closed" : "eye" } size={24} color={colors.input} />
            </Pressable>
         </View>
         <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HistorialMedico')}>
               <Text style={styles.textButton}>Ingresar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.secondary }]}>
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
