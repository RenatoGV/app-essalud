import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/styles';

export const MOCK_HISTORIAL = [
  {
    id: 'historial-001',
    fecha: 'Miércoles, 9 de Setiembre del 2026',
    hora: '10:30 a.m.',
    especialidad: 'Cardiología',
    doctor: 'Dr. Carlos Mendoza',
    centroSalud: 'Hospital Nacional Edgardo Rebagliati Martins',
  },
  {
    id: 'historial-002',
    fecha: 'Lunes, 24 de Agosto del 2026',
    hora: '08:00 a.m.',
    especialidad: 'Medicina interna',
    doctor: 'Dra. Patricia Salazar',
    centroSalud: 'Policlínico Pablo Bermúdez',
  },
  {
    id: 'historial-003',
    fecha: 'Jueves, 13 de Agosto del 2026',
    hora: '03:15 p.m.',
    especialidad: 'Traumatología',
    doctor: 'Dr. Javier Rojas',
    centroSalud: 'Hospital Guillermo Almenara Irigoyen',
  },
];

export default function HistorialMedicoScreen() {
  const renderItem = ({ item }) => {
    return (
      <View style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <View style={styles.documentIconContainer}>
            <Ionicons color={colors.primary} name="document-text-outline" size={27} />
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{item.fecha}</Text>
            <Text style={styles.timeText}>{item.hora}</Text>
          </View>
        </View>

        <View style={styles.doctorCard}>
          <Ionicons color={colors.primary} name="person-circle-outline" size={44} />
          <View style={styles.doctorDetails}>
            <View style={styles.specialtyBadge}>
              <Text style={styles.specialtyText}>{item.especialidad}</Text>
            </View>
            <Text style={styles.doctorName}>{item.doctor}</Text>
            <Text style={styles.healthCenter} numberOfLines={2}>
              {item.centroSalud}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={MOCK_HISTORIAL}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  listContent: {
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  recordCard: {
    backgroundColor: 'white',
    borderColor: colors.input,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
    padding: 16,
  },
  recordHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 16,
  },
  documentIconContainer: {
    alignItems: 'center',
    backgroundColor: colors.softBackground,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  timeText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 3,
  },
  doctorCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.softBackground,
    borderRadius: 10,
    flexDirection: 'row',
    padding: 14,
    borderColor: colors.primary,
    borderWidth: 1
  },
  doctorDetails: {
    flex: 1,
    marginLeft: 12,
  },
  specialtyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary,
    borderRadius: 4,
    marginBottom: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  specialtyText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  healthCenter: {
    color: colors.input,
    fontSize: 13,
    lineHeight: 18,
  },
});
