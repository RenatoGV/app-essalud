
import { supabase } from "../supabase/supabaseClient";

const SCHEDULE_TABLE = "horario_medico";
const APPOINTMENT_TABLE = "citas";

const formatTime = (time) => time.slice(0, 5);

const formatDate = (date) => {
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, "0");
   const day = String(date.getDate()).padStart(2, "0");

   return `${year}-${month}-${day}`;
};

// Las horas de atención pertenecen a Perú, aunque el teléfono esté en otra zona.
export const isFutureSlot = (date, time) => {
   if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
       !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?$/.test(time)) return false;
   const calendarDate = new Date(`${date}T00:00:00Z`);
   if (Number.isNaN(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== date) return false;
   return new Date(`${date}T${time.length === 5 ? `${time}:00` : time}-05:00`).getTime() > Date.now();
};

// Genera los horarios respetando la duración de cada cita.
const generateSlots = (schedule) => {
   const slots = [];

   const [startHour, startMinute] = schedule.hora_inicio.split(":").map(Number);
   const [endHour, endMinute] = schedule.hora_fin.split(":").map(Number);

   const start = startHour * 60 + startMinute;
   const end = endHour * 60 + endMinute;
   const duration = Number(schedule.duracion_minutos);

   if (!duration || duration <= 0) return slots;

   for (let minutes = start; minutes + duration <= end; minutes += duration) {
      const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
      const remainingMinutes = String(minutes % 60).padStart(2, "0");

      slots.push(`${hours}:${remainingMinutes}`);
   }

   return slots;
};

// Obtiene los horarios semanales activos del médico.
export const getDoctorSchedules = async (doctorId) => {
   const { data, error } = await supabase
      .from(SCHEDULE_TABLE)
      .select("dia_semana, hora_inicio, hora_fin, duracion_minutos")
      .eq("doctor", doctorId)
      .eq("activo", true);

   if (error) throw error;

   return data ?? [];
};

// Obtiene las citas que bloquean horarios en una fecha.
export const getDoctorAppointments = async (doctorId, date) => {
   const { data, error } = await supabase
      .from(APPOINTMENT_TABLE)
      .select("hora")
      .eq("doctor", doctorId)
      .eq("fecha", date)
      .in("estado", ["pendiente", "confirmada"]);

   if (error) throw error;

   return data ?? [];
};

// Calcula los horarios libres de una fecha y turno.
export const getAvailableSlots = async (doctorId, date, turno) => {
   const dayOfWeek = new Date(`${date}T12:00:00`).getDay();

   const [schedules, appointments] = await Promise.all([getDoctorSchedules(doctorId), getDoctorAppointments(doctorId, date)]);

   const occupiedTimes = new Set(appointments.map((appointment) => formatTime(appointment.hora)));

   const slots = schedules
      .filter((schedule) => Number(schedule.dia_semana) === dayOfWeek)
      .flatMap((schedule) => generateSlots(schedule))
      .filter((time) => {
         const hour = Number(time.split(":")[0]);
         const belongsToShift = turno === "manana" ? hour < 14 : hour >= 14;

         return belongsToShift && isFutureSlot(date, time);
      });

   return [...new Set(slots)]
      .sort()
      .map((time) => ({
         hora: time,
         ocupado: occupiedTimes.has(time),
      }));
};

// Obtiene las fechas que tienen al menos un horario libre.
export const getAvailableDates = async (doctorId, startDate, endDate) => {
   const schedules = await getDoctorSchedules(doctorId);

   if (schedules.length === 0) return [];

   const { data: appointments, error } = await supabase
      .from(APPOINTMENT_TABLE)
      .select("fecha, hora")
      .eq("doctor", doctorId)
      .gte("fecha", startDate)
      .lte("fecha", endDate)
      .in("estado", ["pendiente", "confirmada"]);

   if (error) throw error;

   const occupiedByDate = new Map();

   for (const appointment of appointments ?? []) {
      const occupied = occupiedByDate.get(appointment.fecha) ?? new Set();

      occupied.add(formatTime(appointment.hora));
      occupiedByDate.set(appointment.fecha, occupied);
   }

   const availableDates = [];

   const currentDate = new Date(`${startDate}T12:00:00`);
   const lastDate = new Date(`${endDate}T12:00:00`);

   while (currentDate <= lastDate) {
      const date = formatDate(currentDate);
      const dayOfWeek = currentDate.getDay();

      const daySchedules = schedules.filter((schedule) => Number(schedule.dia_semana) === dayOfWeek);

      const occupied = occupiedByDate.get(date) ?? new Set();

      const hasAvailableSlot = daySchedules.some((schedule) =>
         generateSlots(schedule).some((slot) => !occupied.has(slot) && isFutureSlot(date, slot))
      );

      if (hasAvailableSlot) {
         availableDates.push(date);
      }

      currentDate.setDate(currentDate.getDate() + 1);
   }

   return availableDates;
};
