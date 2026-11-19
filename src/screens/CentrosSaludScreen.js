import { useEffect, useState } from 'react';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import {
   View,
   Text,
   StyleSheet,
   FlatList,
   Image,
   TouchableOpacity,
   Linking,
   ActivityIndicator,
} from 'react-native';
import { colors } from '../constants/styles';
import { getMedicalCenters } from '../services/medicalCenterService';

const CentrosSaludScreen = () => {
   const [centrosSalud, setCentrosSalud] = useState([]);
   const [loading, setLoading] = useState(true);
   const [errorMsg, setErrorMsg] = useState(null);

   useEffect(() => {
      const cargarCentros = async () => {
         try {
            setLoading(true);
            setErrorMsg(null);
            const data = await getMedicalCenters();
            setCentrosSalud(data);
         } catch (error) {
            console.error('Error al cargar centros médicos:', error);
            setErrorMsg('No se pudieron cargar los centros de salud.');
         } finally {
            setLoading(false);
         }
      };

      cargarCentros();
   }, []);

   const abrirGoogleMaps = (direccion) => {
      if (!direccion) return;
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
      void Linking.openURL(url);
   };

   const renderItem = ({ item }) => {
      const nombreCentro = item.centro_medico ?? item.nombre ?? 'Centro médico sin nombre';
      const direccionCentro = item.direccion ?? 'Dirección no disponible';

      return (
         <View style={styles.card}>
            <View style={styles.headerCard}>
               <View style={styles.titleContainer}>
                  <FontAwesome5 name="ambulance" size={24} color={colors.primary} />
                  <Text style={styles.nombre}>{nombreCentro}</Text>
               </View>
               <Text style={styles.direccion}>{direccionCentro}</Text>
            </View>

            <Image
               source={require('../../assets/map-image.jpg')}
               style={styles.mapaImagen}
               resizeMode="cover"
            />

            <TouchableOpacity
               style={styles.botonLlegar}
               onPress={() => abrirGoogleMaps(direccionCentro)}
            >
               <Ionicons name="location-sharp" size={20} color="white" />
               <Text style={styles.textoBoton}>Como llegar (Google Maps)</Text>
            </TouchableOpacity>
         </View>
      );
   };

   if (loading) {
      return (
         <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.statusText}>Cargando centros de salud...</Text>
         </View>
      );
   }

   if (errorMsg) {
      return (
         <View style={styles.centerContainer}>
            <Text style={styles.statusText}>{errorMsg}</Text>
         </View>
      );
   }

   return (
      <View style={styles.container}>
         <FlatList
            showsVerticalScrollIndicator={false}
            data={centrosSalud}
            keyExtractor={(item, index) => String(item.id ?? index)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
               <View style={styles.centerContainer}>
                  <Text style={styles.statusText}>No hay centros de salud registrados.</Text>
               </View>
            }
         />
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: 'white',
   },
   centerContainer: {
      flex: 1,
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
   },
   statusText: {
      fontSize: 15,
      color: '#555',
      marginTop: 10,
      textAlign: 'center',
   },
   listContainer: {
      padding: 16,
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
      marginBottom: 12,
   },
   titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      gap: 12,
   },
   nombre: {
      fontSize: 16,
      fontWeight: 'bold',
      flex: 1,
   },
   direccion: {
      fontSize: 13,
      color: colors.input,
      paddingLeft: 30,
   },
   mapaImagen: {
      width: '100%',
      height: 160,
      borderRadius: 8,
      marginBottom: 12,
   },
   botonLlegar: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      paddingVertical: 12,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
   },
   textoBoton: {
      color: 'white',
      fontSize: 15,
      fontWeight: 'bold',
   },
});

export default CentrosSaludScreen;