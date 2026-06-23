import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Face } from '@/components/Face';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useGetApiEntries } from '@/external/api';
import { cn } from '@/lib/utils';
import { getWeatherIcon } from '@/lib/weather-icon';

const WEEKDAYS = [
  { label: '日', className: 'text-red-500' },
  { label: '月', className: 'text-foreground' },
  { label: '火', className: 'text-foreground' },
  { label: '水', className: 'text-foreground' },
  { label: '木', className: 'text-foreground' },
  { label: '金', className: 'text-foreground' },
  { label: '土', className: 'text-blue-500' },
];

type DayInfo = { weather: string | null; level: number };
type Cell = { day: number; currentMonth: boolean };

function buildCells(year: number, month: number): Cell[] {
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells: Cell[] = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ day: daysInPrevMonth - startWeekday + 1 + i, currentMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, currentMonth: true });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay++, currentMonth: false });
  }
  return cells;
}

function DayCell({
  day,
  currentMonth,
  isToday,
  isSelected,
  info,
  onPress,
}: {
  day: number;
  currentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  info?: DayInfo;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={!currentMonth}
      onPress={onPress}
      className={cn(
        'h-14 w-[14.28%] gap-1 border p-1',
        currentMonth ? 'bg-card' : 'bg-muted/40',
        isSelected ? 'border-primary bg-primary/40' : 'border-border',
      )}
    >
      <View className="flex-row items-center justify-between bg-transparent">
        <Text
          className={cn('text-xs', isToday ? 'font-body-bold text-primary' : 'text-foreground/60')}
        >
          {day}
        </Text>
        {info?.weather && (
          <Icon
            as={getWeatherIcon(info.weather)}
            size={16}
            fill="currentColor"
            className="text-muted-foreground"
          />
        )}
      </View>
      {info && (
        <View className="items-center bg-transparent">
          <Face level={info.level} size={20} />
        </View>
      )}
    </Pressable>
  );
}

export default function CalendarTab() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { data: res } = useGetApiEntries({ year, month: month + 1 });

  const entriesByDay = useMemo(() => {
    const map: Record<number, DayInfo> = {};
    const entries = res?.status === 200 ? res.data : [];
    for (const entry of entries) {
      const day = new Date(entry.createdAt).getDate();
      const current = map[day];
      if (!current || entry.conditionLevel > current.level) {
        map[day] = { weather: entry.weather, level: entry.conditionLevel };
      }
    }
    return map;
  }, [res]);

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
    setSelectedDay(null);
  };

  const isToday = (cell: Cell) =>
    cell.currentMonth &&
    year === today.getFullYear() &&
    month === today.getMonth() &&
    cell.day === today.getDate();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="mx-5 my-3 h-8 flex-row items-center justify-between">
        <Text className="font-body-bold text-xl">カレンダー</Text>
        <View className="flex-row items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onPress={() => shiftMonth(-1)}
          >
            <Icon as={ChevronLeft} size={18} className="text-muted-foreground" />
          </Button>
          <Text className="font-body-medium text-base">
            {year}年{month + 1}月
          </Text>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onPress={() => shiftMonth(1)}
          >
            <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
          </Button>
        </View>
      </View>

      <View className="mx-5 mb-2 mt-3 flex-row bg-transparent">
        {WEEKDAYS.map((weekday) => (
          <Text
            key={weekday.label}
            className={cn('w-[14.28%] text-center text-xs', weekday.className)}
          >
            {weekday.label}
          </Text>
        ))}
      </View>

      <View className="mx-5 flex-row flex-wrap overflow-hidden rounded-2xl bg-transparent">
        {buildCells(year, month).map((cell, i) => (
          <DayCell
            key={i}
            day={cell.day}
            currentMonth={cell.currentMonth}
            isToday={isToday(cell)}
            isSelected={cell.currentMonth && cell.day === selectedDay}
            info={cell.currentMonth ? entriesByDay[cell.day] : undefined}
            onPress={() => setSelectedDay(cell.day)}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}
