import { format, isWithinInterval, parse, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
};

export const formatDay = (date) => {
  return format(new Date(date), 'EEEE', { locale: fr });
};

export const formatDisplayDate = (date) => {
  return format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr });
};

export const getDaysBetweenDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = [];
  let currentDate = start;

  while (currentDate <= end) {
    days.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return days;
};

export const filterSchedulesByDay = (schedules, date) => {
  const dayOfWeek = format(new Date(date), 'EEEE', { locale: fr });
  return schedules.filter(schedule => schedule.joursCirculation.includes(dayOfWeek));
};

export const calculateDuration = (departureTime, arrivalTime) => {
  const dep = parse(departureTime, 'HH:mm', new Date());
  const arr = parse(arrivalTime, 'HH:mm', new Date());
  const diffInMinutes = (arr.getHours() * 60 + arr.getMinutes()) - 
                       (dep.getHours() * 60 + dep.getMinutes());
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
};
