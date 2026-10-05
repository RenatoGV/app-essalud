import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Octicons } from "@expo/vector-icons";
import { colors } from "../constants/styles";
import { useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function RegisterScreen({ navigation }) {

  const [dni, setDni] = useState("");
  const [nombres, setNombres] = useState("");
  const [apaterno, setApaterno] = useState("");
  const [amaterno, setAmaterno] = useState("");
  const [fechaNac, setFechaNac] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [date, setDate] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false); // En Android se cierra solo al elegir
    }
    if (selectedDate) {
      setDate(selectedDate);
      // Formatea automáticamente a YYYY-MM-DD para la base de datos
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFechaNac(formattedDate);
    }
  };

  const handleRegister = async () => {
    if (!dni || !nombres || !apaterno || !amaterno || !fechaNac || !email || !password) {
      return Alert.alert("Error", "Por favor completa todos los campos obligatorios.");
    }
    if (password !== confirmPassword) {
      return Alert.alert("Error", "Las contraseñas no coinciden.");
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) {
      setLoading(false);
      return Alert.alert("Error al crear cuenta", authError.message);
    }

    if (authData.user) {
      const { error: dbError } = await supabase.from('pacientes').insert([
        {
          id: authData.user.id,
          dni: dni,
          nombres: nombres,
          apaterno: apaterno,
          amaterno: amaterno,
          fecha_nac: fechaNac, // Formato esperado en BD: YYYY-MM-DD
          celular: celular,
          correo_contacto: email
        }
      ]);

      if (dbError) {
        setLoading(false);
        return Alert.alert("Error al guardar perfil", dbError.message);
      }
    }

    setLoading(false);
    Alert.alert("¡Éxito!", "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.");
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      ></KeyboardAvoidingView>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }} keyboardShouldPersistTaps="handled"></ScrollView>
      
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
        onChangeText={setNombres} />
      </View>

      <View style={styles.inputContainer}>
        <Octicons name="person" size={20} color={colors.input} />
        <TextInput 
        style={styles.input} 
        placeholder="Apellido Paterno" 
        placeholderTextColor={colors.input} 
        value={apaterno} 
        onChangeText={setApaterno} />
      </View>

      <View style={styles.inputContainer}>
        <Octicons name="person" size={20} color={colors.input} />
        <TextInput 
        style={styles.input} 
        placeholder="Apellido Materno" 
        placeholderTextColor={colors.input} 
        value={amaterno} 
        onChangeText={setAmaterno} />
      </View>

      <TouchableOpacity 
        style={styles.inputContainer} 
        onPress={() => setShowDatePicker(true)}
      >
        <Octicons name="calendar" size={20} color={colors.input} />
        <Text style={[styles.input, { color: fechaNac ? "#333333" : colors.input, paddingTop: Platform.OS === 'ios' ? 12 : 0 }]}>
          {fechaNac || "Fecha de Nacimiento"}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <View style={styles.datePickerWrapper}>
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'} // "spinner" es la ruedita de iOS
            maximumDate={new Date()} // No permite fechas en el futuro
            onChange={onChangeDate}
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.confirmDateButton} onPress={() => setShowDatePicker(false)}>
              <Text style={styles.confirmDateText}>Confirmar Fecha</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.inputContainer}>
        <Octicons name="mail" size={20} color={colors.input} />
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          placeholderTextColor={colors.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email} onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Octicons name="device-mobile" size={20} color={colors.input} />
        <TextInput
          style={styles.input}
          placeholder="Número de Celular"
          placeholderTextColor={colors.input}
          keyboardType="phone-pad"
          value={celular} onChangeText={setCelular}
        />
      </View>

      <View style={styles.inputContainer}>
        <Octicons name="lock" size={20} color={colors.input} />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={colors.input}
          secureTextEntry={!showPassword}
          value={password} onChangeText={setPassword}
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
          value={confirmPassword} onChangeText={setConfirmPassword}
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
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Registrarme</Text>}
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.question}>¿Ya tienes cuenta?</Text>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")} 
          disabled={loading}
        >
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="auto"/>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },

  header: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },

  logo: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 5,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111111",
  },

  inputContainer: {
    width: "100%",
    height: 43,
    flexDirection: "row",
    borderColor: colors.input,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "white",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  input: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: "#333333",
  },

  datePickerWrapper: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.input,
  },

  confirmDateButton: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: colors.softBackground,
    borderTopWidth: 1,
    borderColor: colors.input,
  },

  confirmDateText: {
    color: colors.primary,
    fontWeight: 'bold',
  },

  registerButton: {
    width: "100%",
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 5,
    marginTop: 8,
  },

  loginContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: 30,
    paddingBottom: 15,
  },

  question: {
    fontSize: 12,
    color: "#111111",
    marginBottom: 8,
  },

  loginButton: {
    width: "100%",
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 5,
  },

  buttonText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
});
