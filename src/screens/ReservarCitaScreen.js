import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Pressable } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../constants/styles';
import { Host, DatePickerDialog } from '@expo/ui/jetpack-compose';
import { formatDate } from '../helpers/Formatter';
import { useAppData } from '../context/AppDataContext';
import SearchableSelector from '../components/SearchableSelector';

const HORARIO_MANANA = [
  { hora: '08:30', periodo: 'a.m.' },
  { hora: '09:15', periodo: 'a.m.', ocupado: true },
  { hora: '10:00', periodo: 'a.m.' },
  { hora: '11:15', periodo: 'a.m.' },
  { hora: '11:45', periodo: 'a.m.' },
  { hora: '12:00', periodo: 'p.m.' },
];

const HORARIO_TARDE = [
  { hora: '02:00', periodo: 'p.m.' },
  { hora: '03:15', periodo: 'p.m.', ocupado: true },
  { hora: '04:00', periodo: 'p.m.' },
  { hora: '04:45', periodo: 'p.m.', ocupado: true  },
  { hora: '05:00', periodo: 'p.m.' },
  { hora: '05:45', periodo: 'p.m.', ocupado: true  }
]

export default function ReservarCitaScreen() {
  const { specialties, medicalCenters } = useAppData();

  const [especialidad, setEspecialidad] = useState(null)
  const [centro, setCentro] = useState(null)

  const [showPicker, setShowPicker] = useState(false)
  const [date, setDate] = useState(new Date())

  const [horario, setHorario] = useState(HORARIO_MANANA)
  const [turno, setTurno] = useState('manana')

  const [horaSeleccionada, setHoraSeleccionada] = useState(null)

  useEffect(() => {
    if(turno === 'manana') setHorario(HORARIO_MANANA)
    else setHorario(HORARIO_TARDE)

    setHoraSeleccionada(null)
  }, [turno])

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        <Text style={styles.title}>
          Reservación de nueva cita{'\n'}médica
        </Text>

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

        <View>
          <Text style={styles.label}>Seleccione fecha</Text>
          <Pressable style={styles.selector} onPress={() => setShowPicker(true)}>
            <Text style={styles.selectorText} numberOfLines={1}>{formatDate(date)}</Text>
            <Ionicons name='calendar-outline' size={20} color={colors.input} />
          </Pressable>
          {showPicker && (
            <Host>
              <DatePickerDialog
                initialDate={date.toISOString()}
                onDateSelected={(selectedDate) => {
                    setDate(selectedDate);
                    setShowPicker(false);
                }}
                onDismissRequest={() => setShowPicker(false)}
                color={colors.primary}
                selectableDates={{start: new Date()}}
              />
            </Host>
          )}
        </View>

        <Text style={styles.label}>Seleccione horario disponible</Text>
        <View style={styles.turnoContainer}>
          <TouchableOpacity
            style={[styles.turnoTab, turno === 'manana' && styles.turnoTabActive]}
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
                (08:00 - 12:30)
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.turnoTab, turno === 'tarde' && styles.turnoTabActive]}
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
                (14:00 - 18:30)
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.horasGrid}>
          {horario.map((item) => {
            const seleccionada = horaSeleccionada === item.hora;

            return (
              <Pressable key={item.hora} disabled={item.ocupado} style={[styles.horaCard, item.ocupado && styles.horaOcupado, seleccionada && styles.horaSeleccionada ]} onPress={() => setHoraSeleccionada(item.hora)}>
                <Text style={[styles.horaText, item.ocupado && styles.textMuted, seleccionada && styles.horaTextSeleccionada]}>
                  {item.hora}
                </Text>

                <Text style={[styles.periodoText, item.ocupado && styles.textMuted, seleccionada && styles.horaTextSeleccionada]}>
                  {item.periodo}
                </Text>
              </Pressable>
            );
          })}
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

        <TouchableOpacity style={styles.submitButton} activeOpacity={0.85}>
          <Text style={styles.submitButtonText}>Registrar cita</Text>
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