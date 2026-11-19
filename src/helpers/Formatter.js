/** Acepta fechas del calendario (Date) y fechas de la BD (AAAA-MM-DD). */
export function formatDate(date) {
   const isDatabaseDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
   // Una fecha de atención no es un instante UTC: debe conservar su día en cualquier teléfono.
   const value = isDatabaseDate ? new Date(`${date}T00:00:00Z`) : date;

   if (!(value instanceof Date) || Number.isNaN(value.getTime())) return 'Fecha no disponible';
   if (isDatabaseDate && value.toISOString().slice(0, 10) !== date) return 'Fecha no disponible';

   return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      ...(isDatabaseDate ? { timeZone: 'UTC' } : {}),
   }).format(value);
}

export function formatDateForDatabase(date) {
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const day = String(date.getDate()).padStart(2, '0');

   return `${year}-${month}-${day}`;
}

/** Convierte la hora local de la BD (HH:mm o HH:mm:ss) sin cambiar de uso horario. */
export function formatTime(time) {
   const parts = typeof time === 'string' && time.match(/^(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/);
   if (!parts) return 'Hora no disponible';

   const hours = Number(parts[1]);
   const minutes = Number(parts[2]);
   if (hours > 23 || minutes > 59 || Number(parts[3] ?? 0) > 59) return 'Hora no disponible';

   return `${hours % 12 || 12}:${parts[2]} ${hours < 12 ? 'a.m.' : 'p.m.'}`;
}

// Devuelve AAAA-MM-DD según el calendario de Perú. El desplazamiento suma días calendario.
export function getDateInPeru(date = new Date(), offsetDays = 0) {
   const parts = Object.fromEntries(new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
   }).formatToParts(date).map(({ type, value }) => [type, value]));

   return new Date(Date.UTC(
      Number(parts.year), Number(parts.month) - 1, Number(parts.day) + offsetDays,
   )).toISOString().slice(0, 10);
}
