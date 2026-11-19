import { Ionicons, Octicons } from "@expo/vector-icons";
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/styles";
import { useEffect, useState } from "react";
import ProfileInput from "../components/ProfileInput";
import { useNavigation } from "@react-navigation/native";
import ImagePickerModal from "../components/ImagePicker";
import { supabase } from "../supabase/supabaseClient";
import { useAppData } from "../context/AppDataContext";

const user = {
   photo: 'https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/e40b6ea6361a1abe28f32e7910f63b66/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg'
}

export default function ProfileScreen() {
   const navigation = useNavigation()
   const { profile, clearAppData } = useAppData();

   const [loading, setLoading] = useState(false)

   const [showPicker, setShowPicker] = useState(false)
   const [photo, setPhoto] = useState(user.photo)

   const [dni, setDni] = useState("");
   const [name, setName] = useState("")
   const [paternalSurname, setPaternalSurname] = useState("")
   const [maternalSurname, setMaternalSurname] = useState("")
   const [phone, setPhone] = useState("")
   const [address, setAddress] = useState("")

   const [showPasswordModal, setShowPasswordModal] = useState(false)
   const [currentPassword, setCurrentPassword] = useState("")
   const [newPassword, setNewPassword] = useState("")
   const [confirmPassword, setConfirmPassword] = useState("")
   const [showCurrentPassword, setShowCurrentPassword] = useState(false)
   const [showNewPassword, setShowNewPassword] = useState(false)
   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
   const [passwordLoading, setPasswordLoading] = useState(false)

   useEffect(() => {
      if (!profile) return;

      setDni(profile.dni);
      setName(profile.nombres);
      setPaternalSurname(profile.apaterno);
      setMaternalSurname(profile.amaterno);
      setPhone(profile.celular);
      setAddress(profile.direccion);
   }, [profile]);

   const resetPasswordModal = () => {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
      setPasswordLoading(false)
      setShowPasswordModal(false)
   }

   const handleChangePassword = async () => {
      if (!currentPassword || !newPassword || !confirmPassword) {
         Alert.alert("Campos incompletos", "Por favor completa todos los campos.")
         return
      }

      if (newPassword.length < 6) {
         Alert.alert("Contraseña débil", "La nueva contraseña debe tener al menos 6 caracteres.")
         return
      }

      if (currentPassword === newPassword) {
         Alert.alert("Contraseña idéntica", "La nueva contraseña debe ser diferente a la contraseña actual.")
         return
      }

      if (newPassword !== confirmPassword) {
         Alert.alert("Error de coincidencia", "Las nuevas contraseñas no coinciden.")
         return
      }

      setPasswordLoading(true)

      try {
         const { data: { user: authUser }, error: userError } = await supabase.auth.getUser()

         if (userError || !authUser?.email) {
            setPasswordLoading(false)
            Alert.alert("Error", "No se pudo verificar la sesión del usuario.")
            return
         }

         const { error: verifyError } = await supabase.auth.signInWithPassword({
            email: authUser.email,
            password: currentPassword,
         })

         if (verifyError) {
            setPasswordLoading(false)
            Alert.alert("Contraseña incorrecta", "La contraseña actual no es válida. Por favor verifícala.")
            return
         }

         const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
         })

         setPasswordLoading(false)

         if (updateError) {
            Alert.alert("Error al actualizar", updateError.message)
            return
         }

         Alert.alert("¡Éxito!", "Tu contraseña ha sido actualizada correctamente.")
         resetPasswordModal()
      } catch (err) {
         setPasswordLoading(false)
         Alert.alert("Error", "Ocurrió un error inesperado al actualizar la contraseña.")
      }
   }

   const handleSelectImage = (uri) => {
      setPhoto(uri)
   }

   const logout = async () => {
      setLoading(true)
      
      const { error } = await supabase.auth.signOut()

      if (error) {
         console.error('Error al cerrar sesión:', error)
         return
      }

      clearAppData();

      navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
   }

   return (
      <SafeAreaView edges={['top']} style={styles.container}>
         <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.document}>DNI° {dni}</Text>
            <View style={styles.photoContainer}>
               <View style={styles.photo}>
                  {
                     photo
                        ? <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} />
                        : <Ionicons color={colors.primary} name="person-circle-outline" size={50} />
                  }
               </View>
               <TouchableOpacity style={styles.photoButton} onPress={() => setShowPicker(true)}>
                  <Text style={{textAlign: 'center', fontWeight: '700', fontSize: 15, color: 'white'}}>Cambiar foto</Text>
               </TouchableOpacity>
               <ImagePickerModal
                  visible={showPicker}
                  onClose={() => setShowPicker(false)}
                  onImageSelected={handleSelectImage}
                  colors={colors}
               />
            </View>

            <Text style={styles.label}>Nombre completo</Text>
            <ProfileInput value={name} setValue={setName} placeholder={'Ingresa el nombre completo'} columnName={'nombres'} />

            <Text style={styles.label}>Apellido paterno</Text>
            <ProfileInput value={paternalSurname} setValue={setPaternalSurname} placeholder={'Ingresa el apellido paterno'} columnName={'apaterno'} />

            <Text style={styles.label}>Apellido materno</Text>
            <ProfileInput value={maternalSurname} setValue={setMaternalSurname} placeholder={'Ingresa el apellido materno'} columnName={'amaterno'} />

            <Text style={styles.label}>Celular</Text>
            <ProfileInput value={phone} setValue={setPhone} placeholder={'Ingresa el número de celular'} columnName={'celular'} />

            <Text style={styles.label}>Dirección</Text>
            <ProfileInput value={address} setValue={setAddress} placeholder={'Ingresa la dirección del domicilio'} columnName={'direccion'} />

            <TouchableOpacity style={styles.button} onPress={() => setShowPasswordModal(true)}>
               <Text style={styles.textButton}>Cambiar contraseña</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: colors.danger, marginBottom: 50 }]} onPress={logout} disabled={loading}>
               { loading
                  ? <ActivityIndicator color="white" />
                  : <Text style={styles.textButton}>Cerrar sesión</Text>
               }
            </TouchableOpacity>
         </ScrollView>

         <Modal
            visible={showPasswordModal}
            transparent={true}
            animationType="fade"
            onRequestClose={resetPasswordModal}
         >
            <View style={styles.modalOverlay}>
               <View style={styles.modalCard}>
                  <View style={styles.modalHeader}>
                     <Text style={styles.modalTitle}>Cambiar Contraseña</Text>
                     <TouchableOpacity onPress={resetPasswordModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="close" size={24} color={colors.input} />
                     </TouchableOpacity>
                  </View>

                  <Text style={styles.modalSubtitle}>
                     Ingresa tu contraseña actual para verificar tu identidad y luego escribe la nueva contraseña.
                  </Text>

                  <Text style={styles.fieldLabel}>Contraseña actual</Text>
                  <View style={styles.modalInputContainer}>
                     <Octicons name="lock" size={18} color={colors.input} />
                     <TextInput
                        style={styles.modalInput}
                        placeholder="Contraseña actual"
                        placeholderTextColor={colors.input}
                        secureTextEntry={!showCurrentPassword}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                     />
                     <Pressable onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                        <Octicons
                           name={showCurrentPassword ? "eye-closed" : "eye"}
                           size={18}
                           color={colors.input}
                        />
                     </Pressable>
                  </View>

                  <Text style={styles.fieldLabel}>Nueva contraseña</Text>
                  <View style={styles.modalInputContainer}>
                     <Octicons name="key" size={18} color={colors.input} />
                     <TextInput
                        style={styles.modalInput}
                        placeholder="Mínimo 6 caracteres"
                        placeholderTextColor={colors.input}
                        secureTextEntry={!showNewPassword}
                        value={newPassword}
                        onChangeText={setNewPassword}
                     />
                     <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
                        <Octicons
                           name={showNewPassword ? "eye-closed" : "eye"}
                           size={18}
                           color={colors.input}
                        />
                     </Pressable>
                  </View>

                  <Text style={styles.fieldLabel}>Confirmar nueva contraseña</Text>
                  <View style={styles.modalInputContainer}>
                     <Octicons name="check-circle" size={18} color={colors.input} />
                     <TextInput
                        style={styles.modalInput}
                        placeholder="Repite la nueva contraseña"
                        placeholderTextColor={colors.input}
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                     />
                     <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Octicons
                           name={showConfirmPassword ? "eye-closed" : "eye"}
                           size={18}
                           color={colors.input}
                        />
                     </Pressable>
                  </View>

                  <TouchableOpacity
                     style={styles.actionButton}
                     onPress={handleChangePassword}
                     disabled={passwordLoading}
                  >
                     {passwordLoading ? (
                        <ActivityIndicator color="white" />
                     ) : (
                        <Text style={styles.actionButtonText}>Actualizar contraseña</Text>
                     )}
                  </TouchableOpacity>

                  <TouchableOpacity
                     style={styles.cancelButton}
                     onPress={resetPasswordModal}
                     disabled={passwordLoading}
                  >
                     <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </Modal>
      </SafeAreaView>
   )
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: 'white',
   },
   scrollContent: {
      alignItems: 'center',
      paddingHorizontal: 20
   },
   document: {
      fontWeight: '700',
      fontSize: 24,
      textAlign: 'center',
      marginBottom: 20
   },
   photoContainer: {
      gap: 20,
      alignItems: 'center'
   },
   photo: {
      width: 200,
      height: 200,
      borderRadius: 100,
      overflow: 'hidden',
   },
   photoButton: {
      width: 150,
      backgroundColor: colors.secondary,
      paddingVertical: 10,
      borderRadius: 15,
      marginBottom: 30
   },
   label: {
      alignSelf: 'flex-start',
      marginBottom: 15,
      fontWeight: 'bold'
   },
   button: {
      width: '100%',
      backgroundColor: colors.primary,
      padding: 15,
      alignItems: 'center',
      borderRadius: 8,
      marginBottom: 20
   },
   textButton: {
      color: 'white',
      fontWeight: 'bold'
   },
   modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
   },
   modalCard: {
      width: '100%',
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 22,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
   },
   modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
   },
   modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.secondary,
   },
   modalSubtitle: {
      fontSize: 13,
      color: '#4B5563',
      marginBottom: 18,
      lineHeight: 18,
   },
   fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 6,
   },
   modalInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.input,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 14,
      backgroundColor: '#FAFAFA',
   },
   modalInput: {
      flex: 1,
      marginLeft: 10,
      fontSize: 14,
      color: '#1F2937',
   },
   actionButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
   },
   actionButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 15,
   },
   cancelButton: {
      alignItems: 'center',
      marginTop: 12,
      paddingVertical: 6,
   },
   cancelButtonText: {
      color: colors.muted,
      fontSize: 14,
      fontWeight: '600',
   },
})