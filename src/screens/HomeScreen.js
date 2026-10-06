import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/styles";
import { Feather, FontAwesome, FontAwesome5, FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import HomeButtonItem from "../components/HomeButtonItem";
import { useNavigation } from "@react-navigation/native";

const user = {
   name: 'Juan',
   photo: 'https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/e40b6ea6361a1abe28f32e7910f63b66/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg'
}

const nextDate = {
   doctor: 'Dr. Carlos Mendoza',
   cpm: '48291',
   date: 'Miércoles, 24 de Mayo',
   time: '10:30 a.m.',
   hospital: 'Hospital Nacional Edgardo Rebagliati Martins',
   details: 'Pabellón Central - Consultorio 212'
}

export default function HomeScreen() {
   const navigation = useNavigation()

   const items = [
      {
         title: 'Solicitar Cita',
         subtitle: 'Nueva consulta',
         icon: (props) => (
            <MaterialIcons {...props} name="calendar-today" />
         ),
         onPress: () => navigation.navigate('ReservarCita')
      },
      {
         title: 'Mis Citas',
         subtitle: 'Pendientes',
         icon: (props) => (
            <FontAwesome6 {...props} name="clock" />
         ),
         onPress: () => navigation.navigate('MisCitas'),
      },
      {
         title: 'Historial Médico',
         subtitle: 'Atenciones',
         icon: (props) => (
            <Ionicons {...props} name="document-text-outline" />
         ),
         onPress: () => navigation.navigate('HistorialMedico'),
      },
      {
         title: 'Centros de Salud',
         subtitle: 'Direcciones y policlínicos',
         icon: (props) => (
            <FontAwesome {...props} name="building-o" />
         ),
         onPress: () => navigation.navigate('CentrosSalud'),
      },
   ]

   return (
      <SafeAreaView edges={['top']} style={styles.container}>
         <View style={styles.header}>
            <Text style={styles.logo}>Essalud</Text>
            <TouchableOpacity style={styles.photoContainer} onPress={() => navigation.navigate('Profile')}>
               {
                  user.photo
                     ? <Image source={{ uri: user.photo }} style={{ width: '100%', height: '100%' }} />
                     : <Ionicons color={colors.primary} name="person-circle-outline" size={50} />
               }
               
            </TouchableOpacity>
         </View>
         <View style={styles.content}>
            <Text style={styles.title}>Hola, {user.name}</Text>
            <Text style={styles.subtitle}>¿Qué necesitas gestionar hoy?</Text>
            <View style={styles.grid}>
               {items.map((item) => (
                  <View key={item.title} style={styles.item}>
                     <HomeButtonItem
                     title={item.title}
                     subtitle={item.subtitle}
                     Icon={item.icon}
                     onPress={item.onPress}
                     />
                  </View>
               ))}
            </View>

            <View style={styles.nextDateContainer}>
               <Text style={styles.nextDateTitle}>Tu próxima cita</Text>
               <TouchableOpacity style={{flexDirection: 'row', gap: 5, alignItems: 'center'}} onPress={() => navigation.navigate('MisCitas')}>
                  <Text style={styles.nextDateTextButton}>Ver todas</Text>
                  <FontAwesome5 name="arrow-right" size={14} color={colors.primary} />
               </TouchableOpacity>
            </View>

            <View style={[styles.cardContainer, {marginBottom: 15}]}>
               <View style={{flexDirection: 'row', gap: 15, marginBottom: 15, alignItems: 'center'}}>
                  <Ionicons color={colors.primary} name="person-circle-outline" size={40} />
                  <View>
                     <Text style={{fontSize: 16, fontWeight: 'bold'}}>{nextDate.doctor}</Text>
                     <Text style={{fontSize: 12, color: colors.input, fontWeight: '400'}}>CMP {nextDate.cpm}</Text>
                  </View>
               </View>
               <View style={styles.dateCardInfo}>
                  <MaterialIcons color={colors.primary} name="calendar-today" size={20} />
                  <Text style={{fontWeight: 'bold', fontSize: 13}}>{nextDate.date}</Text>
                  <Text style={{color: colors.input}}>•</Text>
                  <Text style={{color: colors.primary, fontWeight: 'bold', fontSize: 13}}>{nextDate.time}</Text>
               </View>
               <View style={{flexDirection: 'row', gap: 10, marginBottom: 15}}>
                  <FontAwesome6 color={colors.primary} name="location-dot" size={20} />
                  <View>
                     <Text style={{fontWeight: 'bold', fontSize: 13}}>{nextDate.hospital}</Text>
                     <Text style={{fontSize: 13, color: colors.input}}>{nextDate.details}</Text>
                  </View>
               </View>
               <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DetalleCita')}>
                  <Text style={{textAlign: 'center', fontWeight: '700', fontSize: 15, color: 'white'}}>Ver Detalles</Text>
               </TouchableOpacity>
            </View>

            <View style={styles.cardContainer}>
               <View style={{flexDirection: 'row', gap: 10, marginBottom: 10}}>
                  <View style={{backgroundColor: colors.softBackground, alignSelf: 'flex-start', padding: 5, borderRadius: 10}}>
                     <Feather name="phone" size={25} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                     <View style={{flexDirection: 'row', gap: 20, alignItems: 'center'}}>
                        <Text style={{fontSize: 16, fontWeight: 'bold'}}>Línea ESSALUD</Text>
                        <View style={{backgroundColor: colors.secondary, width: 50, height: 15, borderRadius: 5, alignItems: 'center',}}>
                           <Text style={{color: 'white', fontWeight: 'bold', fontSize: 10}}>24/7</Text>
                        </View>
                     </View>
                     <Text style={{color: colors.input, fontSize: 12, flexShrink: 1}}>Central telefónica donde puedes sacar tus citas méricas en todo el país.</Text>
                  </View>
               </View>
               <TouchableOpacity style={[styles.button, {backgroundColor: colors.secondary}]} onPress={() => Linking.openURL('tel:014118000')}>
                  <Text style={{textAlign: 'center', fontWeight: '700', fontSize: 15, color: 'white'}}>Llamar gratis</Text>
               </TouchableOpacity>
            </View>
         </View>
      </SafeAreaView>
      
   )
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: 'white',
   },
   header: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
   },
   logo: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 24
   },
   photoContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      overflow: 'hidden'
   },
   content: {
      flex: 1,
      paddingHorizontal: 20
   },
   title: {
      fontSize: 30,
      fontWeight: 'bold',
      marginBottom: 5
   },
   subtitle: {
      fontSize: 16,
      color: colors.input,
      marginBottom: 30
   },
   grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: 12,
      marginBottom: 20
   },
   item: {
      width: '50%',
      paddingHorizontal: 6,
   },
   nextDateContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20
   },
   nextDateTitle: {
      fontSize: 18,
      fontWeight: 'bold'
   },
   nextDateTextButton: {
      color: colors.primary,
      fontWeight: 'bold'
   },
   cardContainer: {
      borderWidth: 2,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderColor: colors.input,
   },
   dateCardInfo: {
      backgroundColor: '#94a3c828',
      flexDirection: 'row',
      borderWidth: 1,
      borderRadius: 20,
      borderColor: colors.input,
      paddingVertical: 5,
      paddingHorizontal: 10,
      alignItems: 'center',
      gap: 5,
      marginBottom: 15
   },
   button: {
      backgroundColor: colors.primary,
      paddingVertical: 10,
      borderRadius: 20,
      marginBottom: 5
   }
})
