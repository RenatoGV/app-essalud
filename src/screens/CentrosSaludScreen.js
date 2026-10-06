import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Linking } from 'react-native';
import { colors } from '../constants/styles';

const centrosSalud = [
   { id: '1', nombre: 'Hospital Nacional Edgardo Rebagliati Martins', direccion: 'Jr. Edgardo Rebagliati 490, Jesús María' },
   { id: '2', nombre: 'Hospital III Suárez Angamos', direccion: 'Av. Angamos Este 261, Miraflores 15046' },
   { id: '3', nombre: 'Hospital II Cañete', direccion: 'Av. Mariscal Benavides N° 295, San Vicente de Cañete' },
   { id: '4', nombre: 'Hospital I Uldarico Rocca Fernández', direccion: 'Esq. Avenidas César Vallejo y Separadora Industrial, Villa El Salvador' },
   { id: '5', nombre: 'Hospital I Carlos Alcántara Butterfield', direccion: 'Av. Los Constructores 1201 Urb. Covima, La Molina' },
   { id: '6', nombre: 'Clínica Central de Prevención', direccion: 'Av. Larco 670, Miraflores' }
];

const CentrosSaludScreen = () => {
   const abrirGoogleMaps = (direccion) => {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
      void Linking.openURL(url);
   };

   const renderItem = ({ item }) => (
      <View style={styles.card}>
         <View style={styles.headerCard}>
         <View style={styles.titleContainer}>
            <FontAwesome5 name="ambulance" size={24} color={colors.primary} />
            <Text style={styles.nombre}>{item.nombre}</Text>
         </View>
         <Text style={styles.direccion}>{item.direccion}</Text>
         </View>

         <Image
         source={require('../../assets/map-image.jpg')}
         style={styles.mapaImagen}
         resizeMode="cover"
         />
         
         <TouchableOpacity style={styles.botonLlegar} onPress={() => abrirGoogleMaps(item.direccion)}>
            <Ionicons name="location-sharp" size={20} color="white" />
            <Text style={styles.textoBoton}>Como llegar (Google Maps)</Text>
         </TouchableOpacity>
      </View>
   );

   return (
      <View style={styles.container}>
         <FlatList
         showsVerticalScrollIndicator={false}
         data={centrosSalud}
         keyExtractor={item => item.id}
         renderItem={renderItem}
         contentContainerStyle={styles.listContainer}
         />
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: 'white'
   },
   listContainer: {
      padding: 16
   },
   card: {
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 16,
      marginBottom: 20,
      borderWidth: 2,
      borderColor: colors.input,
   },
   headerCard: {
      marginBottom: 12
   },
   titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      gap: 12
   },
   iconTexto: {
      fontSize: 20, marginRight: 8
   },
   nombre: {
      fontSize: 16,
      fontWeight: 'bold',
      flex: 1
   },
   direccion: {
      fontSize: 13,
      color: colors.input,
      paddingLeft: 30
   },
   mapaImagen: {
      width: '100%',
      height: 160,
      borderRadius: 8,
      marginBottom: 12
   },
   botonLlegar: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      paddingVertical: 12,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10
   },
   textoBoton: {
      color: 'white',
      fontSize: 15,
      fontWeight: 'bold'
   }
});

export default CentrosSaludScreen;