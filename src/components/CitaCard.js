import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/styles';

// Presenta una cita, la pantalla decide qué hacer con cada acción
 
export default function CitaCard({ cita, onVerDetalles, onGestionarCita }) {
  const descripcionCita = `${cita.especialidad}, ${cita.fechaTexto}, ${cita.horaTexto}, con ${cita.doctor}`;

  return (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <Ionicons
          accessible={false}
          color={colors.primary}
          name="calendar-outline"
          size={28}
          style={styles.calendarIcon}
        />
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{cita.fechaTexto}</Text>
          <Text style={styles.timeText}>{cita.horaTexto}</Text>
        </View>
      </View>

      <View style={styles.doctorCard}>
        <Ionicons
          accessible={false}
          color={colors.primary}
          name="person-circle-outline"
          size={32}
        />
        <View style={styles.doctorDetails}>
          <View style={styles.specialtyBadge}>
            <Text style={styles.specialtyText}>{cita.especialidad}</Text>
          </View>
          <Text style={styles.doctorName}>{cita.doctor}</Text>
          <Text style={styles.healthCenter}>{cita.centroSalud}</Text>
        </View>
      </View>

      <Pressable
        accessibilityLabel={`Ver detalles de la cita de ${descripcionCita}`}
        accessibilityRole="button"
        onPress={() => onVerDetalles(cita.id)}
        style={({ pressed }) => [
          styles.actionButton,
          styles.detailsButton,
          pressed && styles.pressedButton,
        ]}
      >
        <Text style={styles.buttonText}>Ver detalles</Text>
      </Pressable>

      <Pressable
        accessibilityLabel={`Cancelar o reprogramar cita de ${descripcionCita}`}
        accessibilityRole="button"
        onPress={() => onGestionarCita(cita.id)}
        style={({ pressed }) => [
          styles.actionButton,
          styles.manageButton,
          pressed && styles.pressedButton,
        ]}
      >
        <Text style={styles.buttonText}>Cancelar o reprogramar cita</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  appointmentCard: {
    backgroundColor: 'white',
    borderColor: colors.input,
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
  },
  appointmentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 14,
  },
  calendarIcon: {
    marginRight: 10,
  },
  dateContainer: {
    flex: 1,
    minWidth: 0,
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
    borderColor: colors.primary,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 12,
  },
  doctorDetails: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },
  specialtyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary,
    borderRadius: 4,
    marginBottom: 7,
    maxWidth: '100%',
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
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 24,
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  detailsButton: {
    backgroundColor: colors.primary,
  },
  manageButton: {
    backgroundColor: colors.secondary,
  },
  pressedButton: {
    opacity: 0.75,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
