import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/ja';

dayjs.extend(utc);
dayjs.locale('ja');

const currentYear = dayjs().year();
export const formattedDate = (date: string | null | undefined, formatType: 'datetime' | 'date' | 'time' | 'day' = 'datetime') => {
  if (!date) return 'N/A';
  const d = dayjs.utc(date);

  switch (formatType) {
    case 'datetime':
      if (d.year() === currentYear) {
        return d.format("MM/DD(ddd) HH:mm");
      } else {
        return d.format("YYYY/MM/DD(ddd) HH:mm");
      }
    case 'date':
      if (d.year() === currentYear) {
        return d.format("MM/DD(ddd)");
      } else {
        return d.format("YYYY/MM/DD(ddd)");
      }
    case 'time':
      return d.format("HH:mm");
    case 'day':
       return d.format("MM/DD");
    default:
      return d.format("YYYY/MM/DD(ddd) HH:mm");
  }
};
