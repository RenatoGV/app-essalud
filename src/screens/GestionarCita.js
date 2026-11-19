import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, usePreventRemove } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SearchableSelector from '../components/SearchableSelector';
import { colors } from '../constants/styles';
import { formatDate, formatTime, getDateInPeru } from '../helpers/Formatter';
import { getAvailableDates, getAvailableSlots } from '../services/availabilityService';
import {
  AppointmentError, canManageAppointment, cancelAppointment,
  getPatientAppointment, rescheduleAppointment,
} from '../services/appointmentService';

// Consulta fechas por bloques para evitar descargar toda la agenda del médico.
const DAYS_PER_PAGE = 30;

function ActionButton({ children, onPress, disabled = false, secondary = false }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }}
      disabled={disabled} onPress={onPress}
      style={[styles.button, secondary && styles.secondaryButton, disabled && styles.disabled]}>
      <Text style={styles.buttonText}>{children}</Text>
    </Pressable>
  );
}

export default function GestionarCita({ route, navigation }) {
  const citaId = route.params?.citaId;
  const [cita, setCita] = useState(/** @type {import('../services/appointmentService').PatientAppointment|null} */ (null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [page, setPage] = useState(0);
  const [dates, setDates] = useState([]);
  const [date, setDate] = useState(null);
  const [loadingDates, setLoadingDates] = useState(false);
  const [datesError, setDatesError] = useState(false);
  const [shift, setShift] = useState('manana');
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(false);
  const [availabilityVersion, setAvailabilityVersion] = useState(0);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const submitting = useRef(false);
  const focused = useRef(false);
  const startDate = getDateInPeru(new Date(), page * DAYS_PER_PAGE);
  const endDate = getDateInPeru(new Date(), (page + 1) * DAYS_PER_PAGE - 1);
  const manageable = canManageAppointment(cita);

  usePreventRemove(saving, () => {
    Alert.alert('Guardando cambios', 'Espera a que termine la operación antes de volver.');
  });

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    focused.current = true;
    setLoading(true);
    setError('');
    setCita(null);
    setDate(null);
    setTime(null);
    setPage(0);
    setSuccess('');
    getPatientAppointment(citaId, { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setCita(data); })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err instanceof AppointmentError
          ? err.message : 'No pudimos cargar la cita. Comprueba tu conexión e inténtalo nuevamente.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => { focused.current = false; controller.abort(); };
  // reload permite reintentar la consulta aun cuando el ID no cambió.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citaId, reload]));

  useEffect(() => {
    let active = true;
    const loadDates = async () => {
      setDates([]);
      setDate(null);
      setTime(null);
      setDatesError(false);
      setLoadingDates(false);
      if (!manageable || !cita?.doctorId || success) return;
      setLoadingDates(true);
      try {
        const data = await getAvailableDates(cita.doctorId, startDate, endDate);
        if (active) setDates(data.map((id) => ({ id })));
      } catch {
        if (active) setDatesError(true);
      } finally {
        if (active) setLoadingDates(false);
      }
    };
    void loadDates();
    return () => { active = false; };
  }, [cita?.doctorId, manageable, startDate, endDate, availabilityVersion, success]);

  useEffect(() => {
    let active = true;
    const loadSlots = async () => {
      setSlots([]);
      setTime(null);
      setSlotsError(false);
      setLoadingSlots(false);
      if (!date || !manageable || !cita?.doctorId || success) return;
      setLoadingSlots(true);
      try {
        const data = await getAvailableSlots(cita.doctorId, date.id, shift);
        if (active) setSlots(data);
      } catch {
        if (active) setSlotsError(true);
      } finally {
        if (active) setLoadingSlots(false);
      }
    };
    void loadSlots();
    return () => { active = false; };
  }, [cita?.doctorId, date, shift, manageable, success]);

  const refreshAvailability = () => setAvailabilityVersion((value) => value + 1);

  const save = async (cancel) => {
    // El ref bloquea dos confirmaciones incluso antes del siguiente render.
    if (submitting.current || !focused.current) return;
    submitting.current = true;
    setSaving(true);
    try {
      if (cancel) await cancelAppointment(cita);
      else await rescheduleAppointment(cita, { date: date.id, time });
      if (focused.current) setSuccess(cancel
        ? 'Tu cita se canceló correctamente.'
        : `Tu cita se reprogramó para el ${formatDate(date.id)} a las ${formatTime(time)}.`);
    } catch (err) {
      if (focused.current) {
        Alert.alert('No se pudo guardar', err instanceof AppointmentError ? err.message
          : 'No pudimos confirmar el cambio. Vuelve a Mis citas para comprobar el estado antes de intentarlo nuevamente.');
        setTime(null);
        refreshAvailability();
      }
    } finally {
      submitting.current = false;
      if (focused.current) setSaving(false);
    }
  };

  const confirm = (cancel) => {
    if (submitting.current) return;
    Alert.alert(cancel ? '¿Cancelar esta cita?' : '¿Reprogramar esta cita?', cancel
      ? `${formatDate(cita.fecha)} · ${formatTime(cita.hora)}\n${cita.doctor}\n\nSe liberará tu horario. Para atenderte después, deberás reservar otra cita.`
      : `${cita.doctor}\nNueva fecha: ${formatDate(date.id)}\nNueva hora: ${formatTime(time)}\n\nSe liberará tu horario anterior.`, [
      { text: 'Volver', style: 'cancel' },
      { text: cancel ? 'Sí, cancelar cita' : 'Confirmar cambio', style: cancel ? 'destructive' : 'default', onPress: () => { void save(cancel); } },
    ]);
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? <View style={styles.message}><ActivityIndicator color={colors.primary} /><Text>Cargando tu cita...</Text></View>
          : error ? <View style={styles.message}>
            <Text accessibilityRole="alert" style={styles.description}>{error}</Text>
            <ActionButton onPress={() => setReload((value) => value + 1)}>Reintentar</ActionButton>
          </View>
            : success ? <View style={styles.message}>
              <Ionicons name="checkmark-circle-outline" size={52} color={colors.primary} />
              <Text style={styles.title}>Cambio guardado</Text>
              <Text style={styles.description}>{success}</Text>
              <ActionButton onPress={() => navigation.goBack()}>Volver a Mis citas</ActionButton>
            </View> : cita && <>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Cita actual</Text>
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                  <View style={styles.flex}>
                    <Text style={styles.label}>{formatDate(cita.fecha)}</Text>
                    <Text style={styles.time}>{formatTime(cita.hora)}</Text>
                  </View>
                </View>
                <View style={styles.doctorBox}>
                  <Ionicons name="person-circle" size={32} color={colors.primary} />
                  <View style={styles.flex}>
                    <Text style={styles.label}>{cita.doctor}</Text>
                    <Text style={styles.description}>Especialidades: {cita.especialidades.join(', ') || 'No disponibles'}</Text>
                    <Text style={styles.description}>{cita.centroSalud}</Text>
                  </View>
                </View>
              </View>

              {!manageable ? <Text style={styles.description}>Esta cita ya no se puede modificar. Solo puedes gestionar citas activas que aún no hayan comenzado.</Text> : <>
                <View style={styles.card} pointerEvents={saving ? 'none' : 'auto'}>
                  <Text style={styles.title}>Reprogramar cita</Text>
                  <Text style={styles.description}>Elige una nueva fecha y hora. Mantendrás el mismo médico y centro de salud.</Text>
                  <Text style={styles.label}>Fechas disponibles</Text>
                  <Text style={styles.description}>{formatDate(startDate)} – {formatDate(endDate)}</Text>
                  <View style={styles.row}>
                    <ActionButton disabled={page === 0 || saving} secondary onPress={() => setPage((value) => value - 1)}>Anteriores</ActionButton>
                    <ActionButton disabled={saving} secondary onPress={() => setPage((value) => value + 1)}>Siguientes</ActionButton>
                  </View>
                  {loadingDates ? <ActivityIndicator color={colors.primary} /> : datesError ? <>
                    <Text style={styles.description}>No pudimos consultar las fechas disponibles.</Text>
                    <ActionButton onPress={refreshAvailability}>Reintentar fechas</ActionButton>
                  </> : dates.length === 0 ? <Text style={styles.description}>No hay fechas disponibles en este período. Puedes consultar el siguiente.</Text> :
                    <SearchableSelector label="Seleccione la nueva fecha" data={dates} selectedItem={date}
                      onSelect={(value) => { setTime(null); setDate(value); }}
                      getLabel={(item) => formatDate(item.id)} placeholder="Seleccione una fecha" />}

                  {date && <>
                    <Text style={styles.label}>Horario disponible</Text>
                    <View style={styles.row}>
                      {['manana', 'tarde'].map((value) => (
                        <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: shift === value, disabled: saving }}
                          disabled={saving} style={[styles.shift, shift === value && styles.selectedShift]}
                          onPress={() => { setTime(null); setShift(value); }}>
                          <Ionicons name={value === 'manana' ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.primary} />
                          <Text style={styles.label}>{value === 'manana' ? 'Mañana' : 'Tarde'}</Text>
                        </Pressable>
                      ))}
                    </View>
                    {loadingSlots ? <ActivityIndicator color={colors.primary} /> : slotsError ? <>
                      <Text style={styles.description}>No pudimos consultar los horarios.</Text>
                      <ActionButton onPress={() => setDate({ ...date })}>Reintentar horarios</ActionButton>
                    </> : <>
                      {!slots.some((slot) => !slot.ocupado) && <Text style={styles.description}>No hay horarios libres en este turno. Prueba otra fecha o turno.</Text>}
                      <View style={styles.slotGrid}>{slots.map((slot) => (
                        <Pressable key={slot.hora} accessibilityRole="button"
                          accessibilityLabel={`${formatTime(slot.hora)}${slot.ocupado ? ', ocupado' : ''}`}
                          accessibilityState={{ disabled: slot.ocupado || saving, selected: time === slot.hora }}
                          disabled={slot.ocupado || saving} onPress={() => setTime(slot.hora)}
                          style={[styles.slot, time === slot.hora && styles.selectedSlot, slot.ocupado && styles.disabled]}>
                          <Text style={[styles.slotText, time === slot.hora && styles.buttonText]}>{formatTime(slot.hora)}</Text>
                          {slot.ocupado && <Text style={styles.description}>Ocupado</Text>}
                        </Pressable>
                      ))}</View>
                    </>}
                  </>}
                  <ActionButton disabled={!date || !time || loadingDates || loadingSlots || saving} onPress={() => confirm(false)}>Confirmar reprogramación</ActionButton>
                </View>
                <View style={styles.card}>
                  <Text style={styles.title}>Cancelar cita</Text>
                  <Text style={styles.description}>Si ya no asistirás, libera el horario para que otro paciente pueda reservarlo.</Text>
                  <ActionButton secondary disabled={saving} onPress={() => confirm(true)}>Cancelar esta cita</ActionButton>
                </View>
                {saving && <View style={styles.message} accessibilityLiveRegion="polite"><ActivityIndicator color={colors.primary} /><Text>Guardando cambios...</Text></View>}
              </>}
            </>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { flexGrow: 1, padding: 20, paddingTop: 12, gap: 20, paddingBottom: 28 },
  card: { borderWidth: 1.5, borderColor: colors.input, borderRadius: 9, padding: 14, gap: 12 },
  title: { fontSize: 18, fontWeight: '700' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.primary },
  label: { fontSize: 14, fontWeight: '700' },
  description: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  time: { color: colors.primary, fontSize: 17, marginTop: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  doctorBox: { flexDirection: 'row', gap: 8, padding: 10, backgroundColor: colors.softBackground, borderRadius: 8 },
  flex: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: { backgroundColor: colors.primary, borderRadius: 24, minHeight: 44, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  secondaryButton: { backgroundColor: colors.secondary },
  buttonText: { color: 'white', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  disabled: { opacity: 0.4 },
  shift: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: colors.input, borderRadius: 8 },
  selectedShift: { backgroundColor: colors.softBackground, borderColor: colors.primary },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { minWidth: 100, minHeight: 48, padding: 10, borderWidth: 1, borderColor: colors.input, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  slotText: { fontSize: 14, color: colors.primary },
  selectedSlot: { backgroundColor: colors.primary, borderColor: colors.primary },
  message: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 16 },
});
