/* En este archivo se definen datos de ejemplo para las citas se usa en la pantalla MisCitas. 
Cuando se conecte el servidor, este archivo se eliminará y se reemplazará por la base de datos.
*/
const ejemplos = [
  {
    id: 'cita-001',
    diasDesdeHoy: 1,
    hora: '10:30',
    doctor: 'Dr. Carlos Mendoza',
    especialidad: 'Cardiología',
    centroSalud: 'Hospital Nacional Edgardo Rebagliati Martins',
  },
  {
    id: 'cita-002',
    diasDesdeHoy: 3,
    hora: '08:00',
    doctor: 'Dra. Patricia Salazar',
    especialidad: 'Medicina interna',
    centroSalud: 'Policlínico Pablo Bermúdez',
  },
  {
    id: 'cita-003',
    diasDesdeHoy: 7,
    hora: '15:15',
    doctor: 'Dr. Javier Rojas',
    especialidad: 'Traumatología',
    centroSalud: 'Hospital Guillermo Almenara Irigoyen',
  },
];

export function crearCitasMock(fechaReferencia) {
  const [anio, mes, dia] = fechaReferencia.split('-').map(Number);

  return ejemplos.map(({ diasDesdeHoy, ...cita }) => ({
    ...cita,
    fecha: new Date(Date.UTC(anio, mes - 1, dia + diasDesdeHoy)).toISOString().slice(0, 10),
  }));
}
