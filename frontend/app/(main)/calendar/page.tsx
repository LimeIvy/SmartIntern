'use client';
import FullCalendar from '@fullcalendar/react';
import { EventContentArg, EventClickArg } from '@fullcalendar/core';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import dayGridPlugin from '@fullcalendar/daygrid';
import jaLocale from '@fullcalendar/core/locales/ja';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { companiesAtom } from '@/store/companies';
import { selectionFilterAtom } from '@/store/filter-atom';
import { useRouter } from 'next/navigation';
import { formattedDate } from '@/utils/formattedDate';
import { ExternalLink, MapPin, FileText, CalendarClock } from 'lucide-react';
import useWindowSize from '@/hooks/use-window-size';
import dayjs from 'dayjs';

function Calendar() {
  const router = useRouter();
  const { width } = useWindowSize();
  const isMobile = width ? width < 768 : false;
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  const today = new Date();
  const filter = useAtomValue(selectionFilterAtom);
  const companiesData = useAtomValue(companiesAtom);
  const companies = companiesData.data ?? [];

  // 選考タイプで企業情報をフィルタリング
  const filteredCompanies =
    filter === "ALL"
      ? companies
      : companies
          .map((company) => ({
            ...company,
            selections: company.selections?.filter(
              (selection) => selection.type === filter
            ),
          }))
          .filter(
            (company) => company.selections && company.selections.length > 0
          );

  const realEvents = filteredCompanies.flatMap((company) =>
    company.selections?.flatMap((selection) =>
      selection.schedules?.map((schedule) => ({
        id: schedule.id,
        title: schedule.title,
        start: schedule.startDate,
        end: schedule.endDate,
        extendedProps: {
          companyId: company.id,
          companyName: company.name,
          selectionName: selection.name,
          location: schedule.location,
          url: schedule.url,
          note: schedule.note,
        },
        backgroundColor: activeEventId === schedule.id ? '#0077B3' : '#009FE3',
        borderColor: activeEventId === schedule.id ? '#0077B3' : '#009FE3',
        textColor: 'white',
      })) ?? []
    ) ?? []
  );

  const datesWithEvents = new Set<string>();
  realEvents.forEach(event => {
    let current = dayjs(event.start);
    const end = dayjs(event.end);
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      datesWithEvents.add(current.format('YYYY-MM-DD'));
      current = current.add(1, 'day');
    }
  });

  const placeholderEvents = [];
  for (let i = 0; i < 7; i++) {
    const date = dayjs().add(i, 'day');
    if (!datesWithEvents.has(date.format('YYYY-MM-DD'))) {
      placeholderEvents.push({
        date: date.format('YYYY-MM-DD'),
        display: 'background'
      });
    }
  }

  const events = [...realEvents, ...placeholderEvents];
  
  const handleEventClick = (clickInfo: EventClickArg | EventContentArg) => {
    const companyId = clickInfo.event.extendedProps.companyId;
    if (companyId) {
      router.push(`/companies/${companyId}`);
    }
  };
  
  const renderEventContent = (eventInfo: EventContentArg) => {
    const { extendedProps } = eventInfo.event;
    const startTime = formattedDate(eventInfo.event.start, 'time');
    const endTime = formattedDate(eventInfo.event.end, 'time');
    const startDate = formattedDate(eventInfo.event.start, 'date');
    const endDate = formattedDate(eventInfo.event.end, 'date');
    
    return (
      <Popover onOpenChange={(open) => {
        if (open) {
          setActiveEventId(eventInfo.event.id);
        } else {
          setActiveEventId(null);
        }
      }}>
        <PopoverTrigger asChild>
          <div className={`w-full h-full cursor-pointer overflow-hidden p-1 ${eventInfo.view.type === 'listWeekFromToday' ? 'text-black' : 'text-white'}`}>
            <div className="font-semibold truncate flex items-center">
              <span className="truncate">{eventInfo.event.title} <span className="text-xs">({extendedProps.companyName} / {extendedProps.selectionName})</span></span>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 z-[9999]" onClick={(e) => e.stopPropagation()}>
          <div className="grid gap-4">
            <div className="space-y-1">
              <h4 
                className="font-bold text-lg leading-none cursor-pointer hover:underline"
                onClick={() => handleEventClick(eventInfo)}
              >
                {eventInfo.event.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {extendedProps.companyName} / {extendedProps.selectionName}
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-semibold">
                <CalendarClock className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span>{startDate} {startTime} - {endDate} {endTime}</span>
              </div>
              {extendedProps.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span>{extendedProps.location}</span>
                </div>
              )}
              {extendedProps.url && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <a href={extendedProps.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    リンク
                  </a>
                </div>
              )}
              {extendedProps.note && (
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                  <p className="text-muted-foreground whitespace-pre-wrap">{extendedProps.note}</p>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };
  
  if (companiesData.isPending) {
    return <div className="text-center p-8">読み込み中...</div>;
  }

  if (companiesData.error) {
    return <div className="text-center text-red-600 p-8">エラーが発生しました: {companiesData.error.message}</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 p-8">
      <div className="flex-1 mt-10 sm:mt-0">
        <FullCalendar
          height="100%"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={isMobile ? 'listWeekFromToday' : 'dayGridMonth'}
          views={{
            listWeekFromToday: {
              type: 'list',
              duration: { days: 7 },
            }
          }}
          buttonText={{
            today: '今日',
            month: '月',
            week: '週',
            day: '日',
            prev: '<',
            next: '>',
            listWeekFromToday: '週'
          }}
          locales={[jaLocale]}
          locale="ja"
          headerToolbar={{
            start: "prev,next",
            center: "title",
            end: isMobile ? '' : "dayGridMonth,listWeekFromToday",
          }}
          eventDisplay="block"
          fixedWeekCount={false}
          initialDate={today.toISOString().split("T")[0]}
          events={events}
          eventContent={renderEventContent}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          dayMaxEvents={3}
        />
      </div>
    </div>
  );
}

export default Calendar;