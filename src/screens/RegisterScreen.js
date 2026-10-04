import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Octicons } from "@expo/vector-icons";
import { colors } from "../constants/styles";

export default function RegisterScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        />
      </View>

      <View style={styles.inputContainer}>
        <Octicons name="calendar" size={20} color={colors.input} />
        <TextInput
          style={styles.input}
          placeholder="Fecha de Nacimiento"
          placeholderTextColor={colors.input}
        />
      </View>

      <View style={styles.inputContainer}>
        <Octicons name="mail" size={20} color={colors.input} />
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          placeholderTextColor={colors.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Octicons name="device-mobile" size={20} color={colors.input} />
        <TextInput
          style={styles.input}
          placeholder="Número de Celular"
          placeholderTextColor={colors.input}
          keyboardType="phone-pad"
        />
      </View>

      <View>
        <Octicons name="lock" size={20} color={colors.input} />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={colors.input}
          secureTextEntry={!showPassword}
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
        />
        <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Octicons
            name={showConfirmPassword ? "eye-closed" : "eye"}
            size={20}
            color={colors.input}
          />
        </Pressable>
      </View>

      <TouchableOpacity style={styles.registerButton}>
        <Text style={styles.buttonText}>Registrarme</Text>
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.question}>¿Ya tienes cuenta?</Text>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
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
