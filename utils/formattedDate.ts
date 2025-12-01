import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/ja';

dayjs.extend(utc);
dayjs.locale('ja');

const currentYear = dayjs().year();
export const formattedDate = (
  date: string | Date | null | undefined,
  format: "datetime" | "date" | "time" | "day" = "datetime"
): string => {
  if (!date) return "N/A";
  const d = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'datetime':
      if (d.getFullYear() === currentYear) {
        return dayjs(d).format("MM/DD(ddd) HH:mm");
      } else {
        return dayjs(d).format("YYYY/MM/DD(ddd) HH:mm");
      }
    case 'date':
      if (d.getFullYear() === currentYear) {
        return dayjs(d).format("MM/DD(ddd)");
      } else {
        return dayjs(d).format("YYYY/MM/DD(ddd)");
      }
    case 'time':
      return dayjs(d).format("HH:mm");
    case 'day':
       return dayjs(d).format("MM/DD");
    default:
      return dayjs(d).format("YYYY/MM/DD(ddd) HH:mm");
  }
};
