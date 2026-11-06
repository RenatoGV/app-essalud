import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../constants/styles';
import { Host, DatePickerDialog } from '@expo/ui/jetpack-compose';
import { formatDate, formatDateForDatabase } from '../helpers/Formatter';
import { useAppData } from '../context/AppDataContext';
import SearchableSelector from '../components/SearchableSelector';
import { getDoctorsByMedicalCenterAndSpecialty } from '../services/doctorService';
import { getAvailableSlots } from '../services/availabilityService';
import { createAppointment } from '../services/appointmentService';

export default function ReservarCitaScreen() {
  const { specialties, medicalCenters } = useAppData();
  const [doctors, setDoctors] = useState([]);

  const [especialidad, setEspecialidad] = useState(null);
  const [centro, setCentro] = useState(null);
  const [doctor, setDoctor] = useState(null);

  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [doctorError, setDoctorError] = useState(false);

  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(false);

  const [dateSelected, setDateSelected] = useState(false);
  const [turno, setTurno] = useState('manana');
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);

  const [loadingAppointment, setLoadingAppointment] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadDoctors = async () => {
      if (!centro?.id || !especialidad?.id) {
        setDoctors([]);
        setDoctor(null);
        setLoadingDoctors(false);
        return;
      }

      setDoctor(null);
      setDoctors([]);
      setDoctorError(false);
      setLoadingDoctors(true);

      try {
        const data = await getDoctorsByMedicalCenterAndSpecialty(
          centro.id,
          especialidad.id
        );

        if (isMounted) {
          setDoctors(data);
        }
      } catch (error) {
        console.error('Error al cargar médicos:', error);

        if (isMounted) {
          setDoctorError(true);
        }
      } finally {
        if (isMounted) {
          setLoadingDoctors(false);
        }
      }
    };

    void loadDoctors();

    return () => {
      isMounted = false;
    };
  }, [centro?.id, especialidad?.id]);

  useEffect(() => {
    if (specialties.length > 0 && !especialidad) {
      setEspecialidad(specialties[0]);
    }
  }, [specialties, especialidad]);

  useEffect(() => {
    if (medicalCenters.length > 0 && !centro) {
      setCentro(medicalCenters[0]);
    }
  }, [medicalCenters, centro]);

  useEffect(() => {
    if (!doctor || !dateSelected) {
      setAvailableSlots([]);
      return;
    }

    let isMounted = true;

    const loadAvailableSlots = async () => {
      setLoadingSlots(true);
      setSlotsError(false);
      setAvailableSlots([]);
      setHoraSeleccionada(null);

      try {
        const formattedDate = formatDateForDatabase(date);

        const slots = await getAvailableSlots(doctor.id, formattedDate, turno);

        if (isMounted) {
          setAvailableSlots(slots);
        }
      } catch (error) {
        console.error("Error al consultar horarios:", error);

        if (isMounted) {
          setSlotsError(true);
        }
      } finally {
        if (isMounted) {
          setLoadingSlots(false);
        }
      }
    };

    void loadAvailableSlots();

    return () => {
      isMounted = false;
    };
  }, [doctor, date, dateSelected, turno]);

  const handleRegisterAppointment = async () => {
    if (!doctor || !dateSelected || !horaSeleccionada) {
      Alert.alert('Atención', 'Completa todos los campos para registrar la cita.');
      return;
    }

    try {
      setLoadingAppointment(true);

      await createAppointment({
        doctorId: doctor.id,
        date: formatDateForDatabase(date),
        time: horaSeleccionada
      });

      Alert.alert('Cita registrada', 'Tu cita se registró correctamente.');

      setHoraSeleccionada(null);
      setDateSelected(false);
      setAvailableSlots([]);
    } catch (error) {
      console.error('Error al registrar la cita:', error);

      Alert.alert('Error', 'No se pudo registrar la cita. Es posible que el horario ya esté ocupado.');
    } finally {
      setLoadingAppointment(false);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        <Text style={styles.title}>
          Reservación de nueva cita{'\n'}médica
        </Text>

        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Seleccione el centro de salud</Text>
          <SearchableSelector
            label="Seleccione el centro de salud"
            data={medicalCenters}
            selectedItem={centro}
            onSelect={setCentro}
            getLabel={(item) => item.centro_medico}
            placeholder="Seleccione el centro de salud"
          />
        </View>

        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Seleccione la especialidad</Text>
          <SearchableSelector
            label="Seleccione la especialidad"
            data={specialties}
            selectedItem={especialidad}
            onSelect={setEspecialidad}
            getLabel={(item) => item.especialidad}
            placeholder="Seleccione una especialidad"
          />
        </View>

        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Seleccione el médico</Text>

          {loadingDoctors ? (
            <View style={styles.doctorMessage}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.doctorMessageText}>
                Buscando médicos disponibles...
              </Text>
            </View>
          ) : doctorError ? (
            <View style={styles.doctorMessage}>
              <Text style={styles.doctorErrorText}>
                No se pudieron cargar los médicos. Intente nuevamente.
              </Text>
            </View>
          ) : doctors.length > 0 ? (
            <SearchableSelector
              label="Seleccione el médico"
              data={doctors}
              selectedItem={doctor}
              onSelect={(selectedDoctor) => {
                setDoctor(selectedDoctor);
                setDate(new Date());
                setDateSelected(false);
                setHoraSeleccionada(null);
                setAvailableSlots([]);
                setSlotsError(false);
              }}
              getLabel={(item) => `${item.nombres} ${item.apaterno} ${item.amaterno}`}
              placeholder="Seleccione un médico"
            />
          ) : (
            <View style={styles.doctorMessage}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={colors.disabled}
              />
              <Text style={styles.doctorMessageText}>
                No hay médicos disponibles.
              </Text>
            </View>
          )}
        </View>

        <View>
          <Text style={styles.label}>Seleccione fecha</Text>
          <Pressable
            disabled={!doctor}
            style={[
              styles.selector,
              !doctor && { opacity: 0.5 },
            ]}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.selectorText} numberOfLines={1}>
              {dateSelected ? formatDate(date) : 'Seleccione una fecha'}
            </Text>

            <Ionicons name="calendar-outline" size={20} color={colors.input} />
          </Pressable>

          {showPicker && (
            <Host>
              <DatePickerDialog
                initialDate={date.toISOString()}
                onDateSelected={(selectedDate) => {
                  setDate(selectedDate);
                  setDateSelected(true);
                  setShowPicker(false);
                }}
                onDismissRequest={() => setShowPicker(false)}
                color={colors.primary}
                selectableDates={{ start: new Date() }}
              />
            </Host>
          )}
        </View>

        <Text style={styles.label}>Seleccione horario disponible</Text>
        <View style={styles.turnoContainer}>
          <TouchableOpacity
            disabled={!doctor}
            style={[styles.turnoTab, turno === 'manana' && styles.turnoTabActive, !doctor && { opacity: 0.5 }]}
            onPress={() => setTurno('manana')}
            activeOpacity={0.8}
          >
            <Feather
              name="sun"
              size={18}
              color={turno === 'manana' ? colors.input : colors.disabled}
              style={styles.turnoIcon}
            />

            <View>
              <Text style={[styles.turnoTitle, turno === 'manana' ? styles.textActive : styles.textInactive]}>
                Mañana
              </Text>

              <Text style={[styles.turnoSub, turno === 'manana' ? styles.textActive : styles.textInactive]}>
                (Antes de las 14:00)
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!doctor}
            style={[styles.turnoTab, turno === 'tarde' && styles.turnoTabActive, !doctor && { opacity: 0.5 }]}
            onPress={() => setTurno('tarde')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="moon"
              size={16}
              color={turno === 'tarde' ? colors.input : colors.disabled}
              style={styles.turnoIcon}
            />

            <View>
              <Text style={[styles.turnoTitle, turno === 'tarde' ? styles.textActive : styles.textInactive]}>
                Tarde
              </Text>

              <Text style={[styles.turnoSub, turno === 'tarde' ? styles.textActive : styles.textInactive]}>
                (Desde las 14:00)
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View>
          {!doctor || !dateSelected ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Feather name="calendar" size={28} color="#999" />

              <Text style={[styles.doctorMessageText, { marginTop: 8 }]}>
                Selecciona un médico y la fecha para consultar sus horarios.
              </Text>
            </View>
          ) : loadingSlots ? (
            <ActivityIndicator color={colors.primary} />
          ) : slotsError ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Feather name="calendar" size={28} color="#999" />

              <Text style={[styles.doctorMessageText, { marginTop: 8 }]}>
                No se pudieron cargar los horarios.
              </Text>

              <Text style={[
                styles.doctorMessageText,
                { textAlign: 'center', marginTop: 4 },
              ]}>
                Inténtalo nuevamente.
              </Text>
            </View>
          ) : availableSlots.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Feather name="calendar" size={28} color="#999" />

              <Text style={[styles.doctorMessageText, { marginTop: 8 }]}>
                Sin horarios disponibles
              </Text>

              <Text style={[
                styles.doctorMessageText,
                { textAlign: 'center', marginTop: 4 },
              ]}>
                El médico no tiene horarios disponibles para esta fecha y turno.
              </Text>
            </View>
          ) : (
            <View style={styles.horasGrid}>
              {availableSlots.map((slot) => {
                const isOccupied = slot.ocupado;
                const isSelected = horaSeleccionada === slot.hora;

                return (
                  <TouchableOpacity
                    key={slot.hora}
                    disabled={isOccupied}
                    style={[styles.horaCard, isOccupied && styles.horaOcupado, isSelected && styles.horaSeleccionada]}
                    onPress={() => setHoraSeleccionada(slot.hora)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.horaText,
                      isOccupied && styles.textMuted,
                      isSelected && styles.horaTextSeleccionada,
                    ]}>
                      {slot.hora}
                    </Text>
                    
                    {isOccupied && (
                      <Text style={[styles.periodoText, styles.textMuted]}>
                        Ocupado
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Requisitos obligatorios para la atención:
            </Text>
            <Text style={styles.infoText}>
              Presentar DNI físico original y verificar condición de asegurado activo.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          disabled={!doctor || !dateSelected || !horaSeleccionada || loadingAppointment}
          onPress={handleRegisterAppointment}
          style={[
            styles.submitButton,
            (!doctor || !dateSelected || !horaSeleccionada || loadingAppointment) && { opacity: 0.5 },
          ]}
          activeOpacity={0.85}
        >
          {
            loadingAppointment ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Registrar cita</Text>
            )
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 16,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
  },
  selector: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.input,
  },
  selectorText: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  dropdownContainer: {
    marginBottom: 4,
  },
  doctorMessage: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: colors.input,
    borderRadius: 9,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  doctorMessageText: {
    flex: 1,
    fontSize: 13,
    color: colors.disabled
  },
  doctorErrorText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
  },
  turnoContainer: {
    flexDirection: 'row',
    backgroundColor: colors.input,
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  turnoTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  turnoTabActive: {
    backgroundColor: 'white',
    elevation: 2,
  },
  turnoIcon: {
    marginRight: 7,
  },
  turnoTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  turnoSub: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 1,
  },
  textActive: {
    color: colors.input,
  },
  textInactive: {
    color: colors.disabled,
  },
  horasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  horaCard: {
    width: '31%',
    height: 52,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.input,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  horaOcupado: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  horaSeleccionada: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  horaText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.input,
  },
  horaTextSeleccionada: {
    color: 'white',
  },
  periodoText: {
    fontSize: 10.5,
    color: colors.input,
    marginTop: 1,
  },
  textMuted: {
    color: '#BAC7D5',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.softBackground,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.primary,
    padding: 12,
    marginTop: 6,
    marginBottom: 18,
  },
  infoContent: {
    flex: 1,
    marginLeft: 9,
  },
  infoTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  infoText: {
    fontSize: 11,
    color: colors.input,
    lineHeight: 15,
  },
  submitButton: {
    height: 48,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
});