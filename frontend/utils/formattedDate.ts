import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
const currentYear = dayjs().year();
export const formattedDate = (date: string) => {
  if (dayjs.utc(date).year() === currentYear) {
    return dayjs.utc(date).format("MM/DD HH:mm");
  } else {
    return dayjs.utc(date).format("YYYY/MM/DD HH:mm");
  }
};
