import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CitaCard from '../components/CitaCard';
import { colors } from '../constants/styles';

const citas = [
  {
    id: 'cita-001',
    diasDesdeHoy: 1,
    fecha: new Date('2026-10-4'),
    hora: '10:30 a.m.',
    doctor: 'Dr. Carlos Mendoza',
    especialidad: 'Cardiología',
    centroSalud: 'Hospital Nacional Edgardo Rebagliati Martins',
  },
  {
    id: 'cita-002',
    diasDesdeHoy: 3,
    fecha: new Date('2026-10-7'),
    hora: '08:00 a.m.',
    doctor: 'Dra. Patricia Salazar',
    especialidad: 'Medicina interna',
    centroSalud: 'Policlínico Pablo Bermúdez',
  },
  {
    id: 'cita-003',
    diasDesdeHoy: 7,
    fecha: new Date('2026-10-3'),
    hora: '15:15 p.m.',
    doctor: 'Dr. Javier Rojas',
    especialidad: 'Traumatología',
    centroSalud: 'Hospital Guillermo Almenara Irigoyen',
  },
]

function SeparadorCitas() {
  return <View style={styles.separator} />;
}

export default function MisCitas() {
  const navigation = useNavigation()

  const [citasManana, setCitasManana] = useState(3)

  const handleVerDetalles = (id) => {
    navigation.navigate('DetalleCita')
  };

  const handleGestionarCita = (id) => {
    const cita = citas.find((item) => item.id === id);
    if (!cita) return;

    Alert.alert(
      'Gestionar cita · Demostración',
      `${cita.especialidad} con ${cita.doctor}\n${cita.fechaTexto} · ${cita.horaTexto}\n\nLa cancelación y reprogramación estarán disponibles en un próximo avance. Tu cita no se ha modificado.`,
      [{ text: 'Entendido' }],
    );
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={citas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CitaCard
            cita={item}
            onVerDetalles={handleVerDetalles}
            onGestionarCita={handleGestionarCita}
          />
        )}
        ItemSeparatorComponent={SeparadorCitas}
        ListHeaderComponent={citasManana > 0 ? (
          <View style={styles.reminder}>
            <Ionicons name="notifications" size={22} color={colors.primary} />
            <View style={styles.reminderContent}>
              <Text style={styles.reminderTitle}>
                {citasManana === 1
                  ? 'Tienes una cita programada para mañana'
                  : `Tienes ${citasManana} citas programadas para mañana`}
              </Text>
              <Text style={styles.reminderText}>
                Por favor preséntese 30 minutos antes con su DNI en físico.
              </Text>
            </View>
          </View>
        ) : null}
        ListEmptyComponent={(
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={42} color={colors.primary} />
            <Text style={styles.emptyTitle}>No tienes citas programadas</Text>
            <Text style={styles.emptyText}>Cuando reserves una cita, aparecerá aquí.</Text>
          </View>
        )}
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
    flexGrow: 1,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  separator: {
    height: 16,
  },
  reminder: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.softBackground,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 28,
  },
  reminderContent: {
    flex: 1,
    marginLeft: 10,
  },
  reminderTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },
  reminderText: {
    color: colors.muted,
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },
});
