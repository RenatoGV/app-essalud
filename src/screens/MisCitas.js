import { useCallback, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CitaCard from '../components/CitaCard';
import { colors } from '../constants/styles';
import { useAppData } from '../context/AppDataContext';
import { formatDate, formatTime, getDateInPeru } from '../helpers/Formatter';
import { getPatientAppointments } from '../services/appointmentService';

function SeparadorCitas() {
  return <View style={styles.separator} />;
}

export default function MisCitas({ navigation }) {
  const { profile } = useAppData();
  const patientId = profile?.id;
  const [citas, setCitas] = useState(/** @type {import('../services/appointmentService').PatientAppointment[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [fechaHoy, setFechaHoy] = useState(getDateInPeru);
  const activeRequest = useRef(/** @type {AbortController|null} */ (null));
  const isFocused = useRef(false);

  const loadAppointments = useCallback(async (refresh = false) => {
    if (!isFocused.current) return;

    // Solo la consulta más reciente puede actualizar la pantalla.
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(!refresh);
    setRefreshing(refresh);
    setError('');

    try {
      if (!patientId) throw new Error('No hay un paciente autenticado.');
      const data = await getPatientAppointments({ signal: controller.signal });
      if (!controller.signal.aborted) setCitas(data);
    } catch {
      if (!controller.signal.aborted) {
        setCitas([]);
        setError(patientId
          ? 'No se pudieron cargar tus citas. Comprueba tu conexión e inténtalo nuevamente.'
          : 'No se pudo identificar al paciente. Vuelve a iniciar sesión.');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [patientId]);

  useFocusEffect(useCallback(() => {
    isFocused.current = true;
    setCitas([]);
    const today = getDateInPeru();
    if (fechaHoy !== today) setFechaHoy(today);
    void loadAppointments();

    // Revisa el día mientras esta pantalla está activa; consulta de nuevo solo si cambia.
    const interval = setInterval(() => setFechaHoy(getDateInPeru()), 60_000);
    return () => {
      isFocused.current = false;
      activeRequest.current?.abort();
      clearInterval(interval);
    };
  }, [loadAppointments, fechaHoy]));

  const fechaManana = getDateInPeru(new Date(), 1);
  const citasManana = citas.filter((cita) => cita.fecha === fechaManana).length;

  /** @param {string|number} id */
  const handleVerDetalles = (id) => {
    const cita = citas.find((item) => item.id === id);
    if (!cita) return;

    navigation.navigate('DetalleCita', { citaId: id });
  };

  const handleGestionarCita = (id) => {
    const cita = citas.find((item) => item.id === id);
    if (!cita) return;

    navigation.navigate('GestionarCita', { citaId: id });
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={citas}
        keyExtractor={(item) => String(item.id)}
        refreshing={refreshing}
        onRefresh={() => { void loadAppointments(true); }}
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
        ListEmptyComponent={loading || refreshing ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.emptyTitle}>Cargando tus citas...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={42} color={colors.primary} />
            <Text style={styles.emptyTitle}>No pudimos consultar tus citas</Text>
            <Text style={styles.emptyText} accessibilityRole="alert">{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => { void loadAppointments(); }}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : (
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
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 20,
  },
  retryText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
});
