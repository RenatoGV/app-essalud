import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Octicons } from "@expo/vector-icons";
import { colors } from "../constants/styles";
import { useState } from "react";
import { formatDate } from "../helpers/Formatter";
import { Host } from "@expo/ui";
import { DatePickerDialog } from "@expo/ui/jetpack-compose";
import { supabase } from "../supabase/supabaseClient";

export default function RegisterScreen({ navigation }) {
   const [showPassword, setShowPassword] = useState(false)
   const [showConfirmPassword, setShowConfirmPassword] = useState(false)

   const [showPicker, setShowPicker] = useState(false)
   const [loading, setLoading] = useState(false)

   const [dni, setDni] = useState("")
   const [nombres, setNombres] = useState("")
   const [apaterno, setApaterno] = useState("")
   const [amaterno, setAmaterno] = useState("")
   const [fechaNac, setFechaNac] = useState(new Date())
   const [email, setEmail] = useState("")
   const [celular, setCelular] = useState("")
   const [password, setPassword] = useState("")
   const [confirmPassword, setConfirmPassword] = useState("")

   const handleRegister = async () => {
      if (!dni || !nombres || !apaterno || !amaterno || !fechaNac || !email || !password) {
         return Alert.alert("Error", "Por favor completa todos los campos obligatorios.")
      }
      if (password !== confirmPassword) {
         return Alert.alert("Error", "Las contraseñas no coinciden.")
      }

      setLoading(true)

      const { data: authData, error: authError } = await supabase.auth.signUp({
         email: email,
         password: password,
      });

      if (authError) {
         setLoading(false)
         return Alert.alert("Error al crear cuenta", authError.message)
      }

      if (authData.user) {
         const { error: dbError } = await supabase.from('pacientes').insert([
            {
               id: authData.user.id,
               dni: dni,
               nombres: nombres,
               apaterno: apaterno,
               amaterno: amaterno,
               fecha_nac: fechaNac, // TODO: Formato esperado en BD: YYYY-MM-DD
               celular: celular,
               correo_contacto: email
            }
         ])

         if (dbError) {
            setLoading(false)
            return Alert.alert("Error al guardar perfil", dbError.message)
         }
      }

      setLoading(false)
      Alert.alert("¡Éxito!", "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.")
      navigation.navigate("Login")
   }

   return (
      <SafeAreaView style={styles.container}>
         <View style={styles.header}>
            <Text style={styles.logo}>EsSalud</Text>
            <Text style={styles.title}>Crear Cuenta</Text>
         </View>

         <View style={styles.inputContainer}>
            <Octicons name="id-badge" size={20} color={colors.input} />
            <TextInput
               style={styles.input}
               placeholder="Número de Documento"
               placeholderTextColor={colors.input}
               keyboardType="numeric"
               value={dni}
               onChangeText={setDni}
               maxLength={8}
            />
         </View>

         <View style={styles.inputContainer}>
            <Octicons name="person" size={20} color={colors.input} />
            <TextInput
               style={styles.input}
               placeholder="Nombres"
               placeholderTextColor={colors.input}
               value={nombres}
               onChangeText={setNombres}
            />
         </View>

         <View style={styles.inputContainer}>
            <Octicons name="person" size={20} color={colors.input} />
            <TextInput
               style={styles.input}
               placeholder="Apellido Paterno"
               placeholderTextColor={colors.input}
               value={apaterno}
               onChangeText={setApaterno}
            />
         </View>

         <View style={styles.inputContainer}>
            <Octicons name="person" size={20} color={colors.input} />
            <TextInput
               style={styles.input}
               placeholder="Apellido Materno"
               placeholderTextColor={colors.input}
               value={amaterno}
               onChangeText={setAmaterno}
            />
         </View>

         <Pressable style={styles.inputContainer} onPress={() => setShowPicker(true)}>
            <Octicons name="calendar" size={20} color={colors.input} />
            <Text style={styles.selectorText} numberOfLines={1}>{formatDate(fechaNac)}</Text>
         </Pressable>
         {showPicker && (
            <Host>
               <DatePickerDialog
                  onDateSelected={(selectedDate) => {
                     setFechaNac(selectedDate)
                     setShowPicker(false)
                  }}
                  onDismissRequest={() => setShowPicker(false)}
                  color={colors.primary}
               />
            </Host>
         )}

         <View style={styles.inputContainer}>
            <Octicons name="mail" size={20} color={colors.input} />
            <TextInput
               style={styles.input}
               placeholder="Correo Electrónico"
               placeholderTextColor={colors.input}
               keyboardType="email-address"
               autoCapitalize="none"
               value={email}
               onChangeText={setEmail}
            />
         </View>

         <View style={styles.inputContainer}>
            <Octicons name="device-mobile" size={20} color={colors.input} />
            <TextInput
               style={styles.input}
               placeholder="Número de Celular"
               placeholderTextColor={colors.input}
               keyboardType="phone-pad"
               value={celular}
               onChangeText={setCelular}
            />
         </View>

         <View style={styles.inputContainer}>
            <Octicons name="lock" size={20} color={colors.input} />
            <TextInput
               style={styles.input}
               placeholder="Contraseña"
               placeholderTextColor={colors.input}
               secureTextEntry={!showPassword}
               value={password}
               onChangeText={setPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
               <Octicons
                  name={showPassword ? "eye-closed" : "eye"}
                  size={20}
                  color={colors.input}
               />
            </Pressable>
         </View>

         <View style={styles.inputContainer}>
            <Octicons name="lock" size={20} color={colors.input} />
            <TextInput
               style={styles.input}
               placeholder="Confirmar Contraseña"
               placeholderTextColor={colors.input}
               secureTextEntry={!showConfirmPassword}
               value={confirmPassword}
               onChangeText={setConfirmPassword}
            />
            <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
               <Octicons
                  name={showConfirmPassword ? "eye-closed" : "eye"}
                  size={20}
                  color={colors.input}
               />
            </Pressable>
         </View>

         <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
            {
               loading
                  ? <ActivityIndicator color="white" />
                  : <Text style={styles.buttonText}>Registrarme</Text>
            }
         </TouchableOpacity>

         <View style={styles.loginContainer}>
            <Text style={styles.question}>¿Ya tienes cuenta?</Text>

            <TouchableOpacity
               style={styles.loginButton}
               onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
               disabled={loading}
            >
               <Text style={styles.buttonText}>Iniciar sesión</Text>
            </TouchableOpacity>
         </View>

         <StatusBar style="auto"/>
      </SafeAreaView>
   )
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
   },
   header: {
      alignItems: "center",
      marginBottom: 50,
   },
   logo: {
      fontSize: 24,
      fontWeight: "900",
      color: colors.primary,
      marginBottom: 5,
   },
   title: {
      fontSize: 32,
      fontWeight: "800",
      color: "#111111",
   },
   inputContainer: {
      width: "100%",
      height: 43,
      flexDirection: "row",
      borderColor: colors.input,
      borderWidth: 2,
      paddingHorizontal: 10,
      borderRadius: 5,
      backgroundColor: "white",
      alignItems: "center",
      gap: 10,
      marginBottom: 20,
   },
   input: {
      flex: 1,
      fontWeight: "600",
      color: "#333333",
   },
   registerButton: {
      width: "100%",
      backgroundColor: colors.primary,
      padding: 15,
      alignItems: "center",
      borderRadius: 5,
      marginTop: 8,
   },
   loginContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      paddingBottom: 15,
   },
   question: {
      color: "#111111",
      marginBottom: 8,
   },
   loginButton: {
      width: "100%",
      backgroundColor: colors.secondary,
      padding: 15,
      alignItems: "center",
      borderRadius: 5,
   },
   buttonText: {
      color: "white",
      fontWeight: "bold",
   },
});