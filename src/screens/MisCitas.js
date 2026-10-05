import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CitaCard from '../components/CitaCard';
import { colors } from '../constants/styles';
import { crearCitasMock } from '../data/citasMock';

const formatoDiaPeru = new Intl.DateTimeFormat('es-PE', {
  timeZone: 'America/Lima',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const formatoFecha = new Intl.DateTimeFormat('es-PE', {
  timeZone: 'UTC',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/* Fecha */
export function obtenerFechaEnPeru(ahora = new Date()) {
  const partes = Object.fromEntries(
    formatoDiaPeru.formatToParts(ahora).map(({ type, value }) => [type, value]),
  );

  return `${partes.year}-${partes.month}-${partes.day}`;
}

/* Citas */
export function prepararCitas(citas) {
  return [...citas]
    .sort((a, b) => `${a.fecha}T${a.hora}`.localeCompare(`${b.fecha}T${b.hora}`))
    .map((cita) => {
      const [anio, mes, dia] = cita.fecha.split('-').map(Number);
      const [hora, minutos] = cita.hora.split(':');
      const fecha = formatoFecha.format(new Date(Date.UTC(anio, mes - 1, dia)));

      return {
        ...cita,
        fechaTexto: fecha.charAt(0).toUpperCase() + fecha.slice(1),
        horaTexto: `${Number(hora) % 12 || 12}:${minutos} ${Number(hora) < 12 ? 'a.m.' : 'p.m.'}`,
      };
    });
}

/* Compara días calendario; una cita pasada no implica que haya sido atendida.*/
export function contarCitasManana(citas, fechaHoy) {
  const [anio, mes, dia] = fechaHoy.split('-').map(Number);
  const manana = new Date(Date.UTC(anio, mes - 1, dia + 1)).toISOString().slice(0, 10);

  return citas.filter((cita) => cita.fecha === manana).length;
}

function SeparadorCitas() {
  return <View style={styles.separator} />;
}

export default function MisCitas() {
  const [fechaHoy, setFechaHoy] = useState(obtenerFechaEnPeru);

  useFocusEffect(useCallback(() => {
    // Actualiza el recordatorio al volver a la pantalla y si cambia el día
    const actualizarFecha = () => setFechaHoy(obtenerFechaEnPeru());
    actualizarFecha();
    const intervalo = setInterval(actualizarFecha, 60_000);
    return () => clearInterval(intervalo);
  }, []));

  // Punto de sustitución de los datos de ejemplo cuando se conecte el servidor
  const citas = prepararCitas(crearCitasMock(fechaHoy));
  const citasManana = contarCitasManana(citas, fechaHoy);

  /**id */
  const handleVerDetalles = (id) => {
    const cita = citas.find((item) => item.id === id);
    if (!cita) return;

  // Muestra un mensaje de demostración. Se cambiará la pantalla cuando se implemente la pantalla de detalles de cita.
    Alert.alert(
      'Ver detalles · Demostración',
      `${cita.especialidad}\n${cita.doctor}\n${cita.fechaTexto} · ${cita.horaTexto}\n${cita.centroSalud}\n\nLa pantalla de detalles estará disponible en un próximo avance.`,
      [{ text: 'Entendido' }],
    );
  };

// Muestra un mensaje de demostración. Se cambiará la pantalla cuando se implemente la pantalla de gestión de cita.
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
    // El navegador protege el borde superior con su encabezado.
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
