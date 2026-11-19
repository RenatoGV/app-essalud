import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/styles';
import { useCallback, useEffect, useState } from 'react';
import { getMedicalHistory } from '../services/medicalHistoryService';

const formatDate = (value) => {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
};

const formatTime = (value) => {
  if (!value) return '';
  const [hours, minutes] = value.split(':').map(Number);
  const suffix = hours < 12 ? 'a.m.' : 'p.m.';
  const displayHour = hours % 12 || 12;
  return `${String(displayHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

const getHistoryDisplayData = (item) => {
  const doctor = item.doctor;
  const specialties = doctor?.doctor_especialidad ?? [];
  const specialty = specialties
    .map((entry) => entry.especialidad?.especialidad)
    .filter(Boolean)
    .join(', ');
  const center = item.centro_medico || 'Centro médico';

  return {
    fecha: formatDate(item.fecha),
    hora: formatTime(item.hora),
    especialidad: specialty || 'Especialidad no especificada',
    doctor: [doctor?.nombres, doctor?.apaterno, doctor?.amaterno].filter(Boolean).join(' ') || 'Médico',
    centroSalud: center,
  };
};

export default function HistorialMedicoScreen() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setHistorial(await getMedicalHistory());
    } catch (loadError) {
      console.error('Error al cargar el historial médico:', loadError);
      setError(loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const renderItem = ({ item }) => {
    const displayData = getHistoryDisplayData(item);

    return (
      <View style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <View style={styles.documentIconContainer}>
            <Ionicons color={colors.primary} name="document-text-outline" size={27} />
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{displayData.fecha}</Text>
            <Text style={styles.timeText}>{displayData.hora}</Text>
          </View>
        </View>

        <View style={styles.doctorCard}>
          <Ionicons color={colors.primary} name="person-circle-outline" size={44} />
          <View style={styles.doctorDetails}>
            <View style={styles.specialtyBadge}>
              <Text style={styles.specialtyText}>{displayData.especialidad}</Text>
            </View>
            <Text style={styles.doctorName}>{displayData.doctor}</Text>
            <Text style={styles.healthCenter} numberOfLines={2}>
              {displayData.centroSalud}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <FlatList
        contentContainerStyle={[styles.listContent, historial.length === 0 && styles.emptyListContent]}
        data={historial}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshing={loading && historial.length > 0}
        onRefresh={loadHistory}
        ListEmptyComponent={loading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.stateText}>Cargando historial médico...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>No se pudo cargar el historial médico.</Text>
            <Pressable onPress={loadHistory} style={styles.retryButton}>
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>Aún no tienes registros en tu historial médico.</Text>
          </View>
        )}
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
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  stateText: {
    color: colors.input,
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: {
    color: 'white',
    fontWeight: '700',
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