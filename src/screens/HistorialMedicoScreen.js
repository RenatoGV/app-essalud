import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/styles';

const screenColors = {
  ...colors,
  white: colors.white || '#FFFFFF',
  border: colors.border || '#DCE5EE',
  softBackground: colors.softBackground || '#EBF3FA',
  text: colors.text || '#1C2733',
  muted: colors.muted || colors.disabled || '#687583',
};

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

export default function HistorialMedicoScreen({ navigation }) {
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  const renderItem = ({ item }) => {
    const isSelected = selectedRecordId === item.id;

    return (
      <Pressable
        accessibilityLabel={`Historial de ${item.especialidad} con ${item.doctor}`}
        accessibilityRole="button"
        onPress={() => setSelectedRecordId(item.id)}
        style={({ pressed }) => [
          styles.recordCard,
          isSelected && styles.recordCardSelected,
          pressed && styles.recordCardPressed,
        ]}
      >
        <View style={styles.recordHeader}>
          <View style={styles.documentIconContainer}>
            <Ionicons color={screenColors.primary} name="document-text-outline" size={27} />
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{item.fecha}</Text>
            <Text style={styles.timeText}>{item.hora}</Text>
          </View>
        </View>

        <View style={styles.doctorCard}>
          <Ionicons color={screenColors.primary} name="person-circle-outline" size={44} />
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
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Volver"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <Ionicons color={screenColors.primary} name="chevron-back" size={30} />
        </Pressable>
        <Text style={styles.title}>Historial médico</Text>
      </View>

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
    backgroundColor: screenColors.background,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 68,
    paddingHorizontal: 20,
  },
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    marginRight: 8,
    width: 40,
  },
  backButtonPressed: {
    opacity: 0.65,
  },
  title: {
    color: screenColors.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  recordCard: {
    backgroundColor: screenColors.white,
    borderColor: screenColors.border,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    marginBottom: 16,
    padding: 16,
    shadowColor: screenColors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  recordCardPressed: {
    opacity: 0.9,
  },
  recordCardSelected: {
    borderColor: screenColors.primary,
  },
  recordHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 16,
  },
  documentIconContainer: {
    alignItems: 'center',
    backgroundColor: screenColors.softBackground,
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
    color: screenColors.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  timeText: {
    color: screenColors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 3,
  },
  doctorCard: {
    alignItems: 'center',
    backgroundColor: screenColors.softBackground,
    borderRadius: 10,
    flexDirection: 'row',
    padding: 14,
  },
  doctorDetails: {
    flex: 1,
    marginLeft: 12,
  },
  specialtyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: screenColors.secondary,
    borderRadius: 4,
    marginBottom: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  specialtyText: {
    color: screenColors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  doctorName: {
    color: screenColors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  healthCenter: {
    color: screenColors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
