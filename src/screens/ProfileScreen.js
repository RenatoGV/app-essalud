import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/styles";
import { useState } from "react";
import ProfileInput from "../components/ProfileInput";
import { useNavigation } from "@react-navigation/native";
import ImagePickerModal from "../components/ImagePicker";
import { supabase } from "../supabase/supabaseClient";

const user = {
   dni: '1234578',
   name: 'Juan',
   apaterno: 'Gomez',
   amaterno: 'Ramirez',
   email: 'jgomez@gmail.com',
   phone: '985349754',
   address: 'Av. Arequipa 3423',
   photo: 'https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/e40b6ea6361a1abe28f32e7910f63b66/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg'
}

export default function ProfileScreen() {
   const navigation = useNavigation()

   const [loading, setLoading] = useState(false)

   const [showPicker, setShowPicker] = useState(false)
   const [photo, setPhoto] = useState(user.photo)

   const [name, setName] = useState(user.name)
   const [paternalSurname, setPaternalSurname] = useState(user.apaterno)
   const [maternalSurname, setMaternalSurname] = useState(user.amaterno)
   const [email, setEmail] = useState(user.email)
   const [phone, setPhone] = useState(user.phone)
   const [address, setAddress] = useState(user.address)

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

      navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
   }

   return (
      <SafeAreaView edges={['top']} style={styles.container}>
         <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.document}>DNI° {user.dni}</Text>
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
            <ProfileInput value={name} setValue={setName} placeholder={'Ingresa el nombre completo'} />

            <Text style={styles.label}>Apellido paterno</Text>
            <ProfileInput value={paternalSurname} setValue={setPaternalSurname} placeholder={'Ingresa el apellido paterno'} />

            <Text style={styles.label}>Apellido materno</Text>
            <ProfileInput value={maternalSurname} setValue={setMaternalSurname} placeholder={'Ingresa el apellido materno'} />

            <Text style={styles.label}>Correo electrónico</Text>
            <ProfileInput value={email} setValue={setEmail} placeholder={'Ingresa el correo electrónico'} />

            <Text style={styles.label}>Celular</Text>
            <ProfileInput value={phone} setValue={setPhone} placeholder={'Ingresa el número de celular'} />

            <Text style={styles.label}>Dirección</Text>
            <ProfileInput value={address} setValue={setAddress} placeholder={'Ingresa la dirección del domicilio'} />

            <TouchableOpacity style={styles.button} onPress={() => console.log('pressed')}>
               <Text style={styles.textButton}>Cambiar contraseña</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: colors.danger, marginBottom: 50 }]} onPress={logout} disabled={loading}>
               { loading
                  ? <ActivityIndicator color="white" />
                  : <Text style={styles.textButton}>Cerrar sesión</Text>
               }
            </TouchableOpacity>
         </ScrollView>
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
   }
})