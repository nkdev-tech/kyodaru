import { ChevronLeft, ChevronRight, Gauge, Thermometer } from 'lucide-react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { Directions, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { SlideInLeft, SlideInRight } from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConditionLabel, Face } from '@/components/entries/condition';
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

const DAYS_IN_WEEK = 7;
// 月送りで高さが変動しないよう、常に6週（42セル）に固定する
const TOTAL_CELLS = DAYS_IN_WEEK * 6;
// 遡れる下限は2016年1月（month index 0）。上限は当月（実行時に算出）。
const MIN_MONTH_SERIAL = 2016 * 12;

// 外枠の rounded-2xl + overflow-hidden に合わせ、四隅のセルだけ角丸にする
// （選択枠が角丸ラインで途切れて見えるのを防ぐ）
function cornerClassName(index: number, total: number): string | undefined {
  if (index === 0) return 'rounded-tl-2xl'; // 先頭 = 左上
  if (index === DAYS_IN_WEEK - 1) return 'rounded-tr-2xl'; // 1行目末尾 = 右上
  if (index === total - DAYS_IN_WEEK) return 'rounded-bl-2xl'; // 最終行先頭 = 左下
  if (index === total - 1) return 'rounded-br-2xl'; // 末尾 = 右下
  return undefined;
}

type DayInfo = { weather: string | null; level: number };
type Cell = { day: number; currentMonth: boolean };

function buildCells(year: number, month: number): Cell[] {
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // 日曜始まりの月は前月が1日も出ず、次月が1週間以上表示される。
  // その月だけ前月を1週間分見せる（7日単位なので当月初日の曜日列は不変）。
  let leading = startWeekday;
  if (startWeekday === 0) {
    leading = DAYS_IN_WEEK;
  }

  const cells: Cell[] = [];
  for (let i = 0; i < leading; i++) {
    cells.push({ day: daysInPrevMonth - leading + 1 + i, currentMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, currentMonth: true });
  }
  let nextDay = 1;
  while (cells.length < TOTAL_CELLS) {
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
  cornerClassName,
  onPress,
}: {
  day: number;
  currentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  info?: DayInfo;
  cornerClassName?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={!currentMonth}
      onPress={onPress}
      className={cn(
        'h-14 w-[14.28%] gap-1 border p-1',
        currentMonth ? 'bg-card' : 'bg-muted/40',
        isSelected ? 'border-primary bg-primary/10' : 'border-border',
        cornerClassName,
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
  // 滑り込みアニメの向き（翌月=右から / 前月=左から）
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const { data: res } = useGetApiEntries({ year, month: month + 1 });
  const entries = res?.status === 200 ? res.data : [];
  const entriesByDay: Record<number, DayInfo> = {};
  for (const entry of entries) {
    const day = new Date(entry.createdAt).getDate();
    if (!entriesByDay[day]) {
      entriesByDay[day] = { weather: entry.weather, level: entry.conditionLevel };
    }
  }

  // 選択日の詳細は entries から算出する（state に持たず、再フェッチに追従させる）
  const details = selectedDay
    ? entries.filter(
        (item) =>
          new Date(item.createdAt).toDateString() ===
          new Date(year, month, selectedDay).toDateString(),
      )
    : [];

  // year*12 + month の通し番号で範囲を判定する
  const currentSerial = year * 12 + month;
  const maxMonthSerial = today.getFullYear() * 12 + today.getMonth();
  const canGoPrev = currentSerial > MIN_MONTH_SERIAL;
  const canGoNext = currentSerial < maxMonthSerial;

  const shiftMonth = (delta: number) => {
    const nextSerial = currentSerial + delta;
    if (nextSerial < MIN_MONTH_SERIAL || nextSerial > maxMonthSerial) return;
    setDirection(delta > 0 ? 'next' : 'prev');
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

  const cells = buildCells(year, month);

  // 左フリック→翌月 / 右フリック→前月。ジェスチャのコールバックはUIスレッドで
  // 動くため、runOnJS でReactのstateを更新する shiftMonth を呼ぶ。
  const swipeMonth = Gesture.Race(
    Gesture.Fling()
      .direction(Directions.LEFT)
      .onEnd(() => runOnJS(shiftMonth)(1)),
    Gesture.Fling()
      .direction(Directions.RIGHT)
      .onEnd(() => runOnJS(shiftMonth)(-1)),
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="mx-5 my-3 h-8 flex-row items-center justify-between">
        <Text className="font-body-bold text-xl">カレンダー</Text>
        <View className="flex-row items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            disabled={!canGoPrev}
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
            disabled={!canGoNext}
            onPress={() => shiftMonth(1)}
          >
            <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
          </Button>
        </View>
      </View>

      <GestureDetector gesture={swipeMonth}>
        <View collapsable={false} className="bg-transparent">
          {/* key で月ごとに作り直し、スワイプ方向から滑り込ませる */}
          <Animated.View
            key={`${year}-${month}`}
            entering={(direction === 'next' ? SlideInRight : SlideInLeft).duration(220)}
          >
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
              {cells.map((cell, i) => (
                <DayCell
                  key={i}
                  day={cell.day}
                  currentMonth={cell.currentMonth}
                  isToday={isToday(cell)}
                  isSelected={cell.currentMonth && cell.day === selectedDay}
                  info={cell.currentMonth ? entriesByDay[cell.day] : undefined}
                  cornerClassName={cornerClassName(i, cells.length)}
                  onPress={() => setSelectedDay(cell.day)}
                />
              ))}
            </View>
          </Animated.View>
        </View>
      </GestureDetector>

      <View className="mx-5 mt-3 flex-1">
        <Text className="py-2 font-body-medium">
          {selectedDay && format(new Date(year, month, selectedDay), 'M月d日(E)', { locale: ja })}
        </Text>
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-2 pb-2"
          showsVerticalScrollIndicator={false}
        >
          {details.map((detail) => (
            <View
              key={detail.id}
              className="gap-1 rounded-2xl bg-card px-4 py-3 shadow-sm shadow-black/5"
            >
              <View className="flex-row items-center justify-between bg-transparent">
                <View className="flex-row items-center gap-2 bg-transparent">
                  <Face level={detail.conditionLevel} size={32} />
                  <ConditionLabel level={detail.conditionLevel} />
                </View>
                <View className="bg-transparent">
                  <Text className="text-xs text-muted-foreground">
                    {format(new Date(detail.createdAt), 'HH:mm', { locale: ja })}
                  </Text>
                </View>
              </View>
              {detail.weather && (
                <View className="flex-row items-center gap-2 bg-transparent">
                  <View className="flex-row items-center gap-1 bg-transparent">
                    <Icon
                      as={getWeatherIcon(detail.weather)}
                      size={14}
                      fill="currentColor"
                      className="text-muted-foreground"
                    />
                    <Text className="text-sm text-muted-foreground">{detail.weather}</Text>
                  </View>
                  <View className="flex-row items-center gap-1 bg-transparent">
                    <Icon as={Thermometer} size={12} className="text-muted-foreground" />
                    <Text className="text-sm text-muted-foreground">
                      {detail.temperature} <Text className="text-xs text-muted-foreground">℃</Text>
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1 bg-transparent">
                    <Icon as={Gauge} size={12} className="text-muted-foreground" />
                    <Text className="text-sm text-muted-foreground">
                      {detail.pressure} <Text className="text-xs text-muted-foreground">hPa</Text>
                    </Text>
                  </View>
                </View>
              )}
              <View className="bg-transparent">
                <Text>{detail.summary}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
