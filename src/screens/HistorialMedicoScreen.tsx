import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type RootStackParamList = {
  Login: undefined;
  HistorialMedico: undefined;
};

export interface MedicalRecord {
  id: string;
  fecha: string;
  hora: string;
  especialidad: string;
  doctor: string;
  centroSalud: string;
}

export const MOCK_HISTORIAL: MedicalRecord[] = [
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

type Props = NativeStackScreenProps<RootStackParamList, 'HistorialMedico'>;

export default function HistorialMedicoScreen({ navigation }: Props) {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const renderItem: ListRenderItem<MedicalRecord> = ({ item }) => {
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
          <Ionicons color={colors.primary} name="chevron-back" size={30} />
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

const colors = {
  background: '#F5F8FC',
  border: '#DCE5EE',
  primary: '#1B89BF',
  specialty: '#055074',
  softBlue: '#EBF3FA',
  text: '#1C2733',
  mutedText: '#687583',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  recordCardPressed: {
    opacity: 0.9,
  },
  recordCardSelected: {
    borderColor: colors.primary,
  },
  recordHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 16,
  },
  documentIconContainer: {
    alignItems: 'center',
    backgroundColor: '#E8F4FB',
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
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  timeText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 3,
  },
  doctorCard: {
    alignItems: 'center',
    backgroundColor: colors.softBlue,
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
    backgroundColor: colors.specialty,
    borderRadius: 4,
    marginBottom: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  specialtyText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  doctorName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  healthCenter: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
});
