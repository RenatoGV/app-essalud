import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../constants/styles';

const CAMPOS = [
  { label: 'Seleccione la especialidad', val: 'Cardiología', icon: 'chevron-down' },
  { label: 'Seleccione centro de salud', val: 'Hospital Nacional Edgardo Rebagliati ...', icon: 'chevron-down' },
  { label: 'Seleccione fecha', val: '04 de Setiembre del 2026', icon: 'calendar-outline', size: 20 },
];

const HORAS = [
  { hora: '08:30', periodo: 'a.m.' },
  { hora: '09:15', periodo: 'ocupado', ocupado: true },
  { hora: '10:00', periodo: 'a.m.' },
  { hora: '11:15', periodo: 'a.m.' },
  { hora: '11:45', periodo: 'a.m.' },
  { hora: '12:00', periodo: 'p.m.' },
];

export default function ReservarCitaScreen() {
  const [turno, setTurno] = useState('manana');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          Reservación de nueva cita{'\n'}médica
        </Text>

        {CAMPOS.map((campo) => (
          <View key={campo.label}>
            <Text style={styles.label}>{campo.label}</Text>
            <View style={styles.selector}>
              <Text style={styles.selectorText} numberOfLines={1}>{campo.val}</Text>
              <Ionicons name={campo.icon} size={campo.size || 18} color="#94A3B8" />
            </View>
          </View>
        ))}

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
              color={turno === 'manana' ? '#8FA0B5' : '#3C4D6B'}
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
              color={turno === 'tarde' ? '#8FA0B5' : '#3C4D6B'}
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
          {HORAS.map((item) => (
            <View
              key={item.hora}
              style={[styles.horaCard, item.ocupado && styles.horaOcupado]}
            >
              <Text style={[styles.horaText, item.ocupado && styles.textMuted]}>
                {item.hora}
              </Text>
              <Text style={[styles.periodoText, item.ocupado && styles.textMuted]}>
                {item.periodo}
              </Text>
            </View>
          ))}
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
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 28,
    marginBottom: 16,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
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
    borderColor: '#CBD5E1',
    backgroundColor: '#ffffff',
  },
  selectorText: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
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
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
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
    color: '#6B7F9E',
  },
  textInactive: {
    color: '#384860',
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
    borderColor: '#CBD5E1',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  horaOcupado: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  horaText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#6B7F9E',
  },
  periodoText: {
    fontSize: 10.5,
    color: '#8FA0B5',
    marginTop: 1,
  },
  textMuted: {
    color: '#BAC7D5',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#DEF1FB',
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#70B9DE',
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
    color: '#0F172A',
    marginBottom: 3,
  },
  infoText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  submitButton: {
    height: 48,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});