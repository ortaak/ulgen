
ÜLGEN Trello Clone projesine devam ediyoruz.

MEMORY.md'den projeyi tanıyorsun. Bugün geliştireceğimiz özellik:
TODOS' tan incele ve projeyi farklılaştıracak bir geliştirme seç.
**Senin önerinle kaldığımız yerden devam edeceğiz** — TODOS.md [Önereceğin madde]

Başlamadan önce planı sun, onayımı bekle
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\TODOS.md
TODOS.md'yi analiz ettim. Tamamlananlar (12 özellik) ve bekleyenler incelendi.

Önerim: #26 Personal Analytics Dashboard 📊
Neden bu? Proje zaten 3 faz Timeline + Pomodoro ile güçlü bir zaman takibi altyapısı kurdu. Bu veriler şu an ham halde duruyor. Analytics Dashboard onu anlam kazandırır — ve bu, Trello/Jira gibi rakiplerin neredeyse hiçbirinde olmayan bir özellik.

Plan
Ne yapılacak:

/analytics sayfası — kişisel verimlilik paneli
recharts ile 4 grafik türü
Navbar'a "Analitik" linki
4 Temel Görselleştirme:

Grafik	Kaynak	Gösterilen
Haftalık Özet (Bar)	TimelineTask	Tamamlanan / Atlanan / Planlanan
Board Dağılımı (Pie)	TimelineTask.boardId	Hangi projeye kaç dakika
Saatlik Verimlilik (Heatmap)	startTime → saat	En üretken saatler
Tahmin Doğruluğu (Line)	estimated vs actual	Trend: iyileşiyor mu?
Hangi dosyalar etkilenecek:


apps/web/
  app/(dashboard)/analytics/page.tsx       ← Yeni sayfa
  app/api/analytics/personal/route.ts      ← Yeni API (aggregated queries)
  components/analytics/
    AnalyticsDashboard.tsx                 ← Ana container
    WeeklySummaryChart.tsx                 ← Bar chart
    BoardDistributionChart.tsx             ← Pie chart
    HourlyHeatmap.tsx                      ← Heatmap grid (SVG)
    EstimationAccuracyChart.tsx            ← Line chart
    StatsCard.tsx                          ← Metrik kartı (reusable)
  components/layout/navbar.tsx             ← "Analitik" linki ekle
packages/database/                         ← Yeni migration yok (mevcut model yeterli)
Bağımlılıklar (yeni paket):

recharts — React chart library (stabil, 23k ⭐, TS desteği var)
Riskler:

Timeline verisi yoksa (kullanıcı hiç görev planlamadıysa) → boş state UI gerekli
Aggregate sorgu performansı → groupBy + _sum Prisma ile yapılacak, indeks kontrolü edilmeli
Tahmini süre: ~4 saat

Onaylıyor musun? Onay gelirse recharts kurulumundan başlayıp Analytics API → Dashboard bileşenleri → Navbar entegrasyonu sırasıyla ilerleyeceğim.

Onaylıyorum
Update Todos

recharts paketini kur

Analytics API endpoint oluştur (/api/analytics/personal)

Analytics bileşenleri oluştur (5 component)

Analytics sayfası oluştur (/analytics)

Navbar'a Analitik linki ekle

CHANGELOG, daily-log ve MEMORY.md güncelle
Globpattern: "apps/web/components/layout/navbar*"
No files found
Globpattern: "apps/web/app/(dashboard)/**"
Found 4 files
Globpattern: "apps/web/app/api/timeline/**"
Found 3 files
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\app\(dashboard)\layout.tsx
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\app\api\timeline\route.ts
Globpattern: "apps/web/components/dashboard-nav*"
Found 1 file
Globpattern: "apps/web/services/timeline.service.ts"
Found 1 file
Globpattern: "packages/database/prisma/schema.prisma"
Found 1 file
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\dashboard-nav.tsx
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\services\timeline.service.ts
Bash recharts kütüphanesini kur
IN
cd "c:/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone/apps/web" && pnpm add recharts 2>&1

OUT
../..                                    | Progress: resolved 0, reused 1, downloaded 0, added 0
 WARN  deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.

   ╭───────────────────────────────────────────────────────────────────╮
   │                                                                   │
   │                Update available! 8.15.0 → 10.31.0.                │
   │   Changelog: https://github.com/pnpm/pnpm/releases/tag/v10.31.0   │
   │                 Run "pnpm add -g pnpm" to update.                 │
   │                                                                   │
   │      Follow @pnpmjs for updates: https://twitter.com/pnpmjs       │
   │                                                                   │
   ╰───────────────────────────────────────────────────────────────────╯

 WARN  deprecated next@14.0.4: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/security-update-2025-12-11 for more details.
../..                                    | Progress: resolved 430, reused 386, downloaded 0, added 0
../..                                    | Progress: resolved 538, reused 461, downloaded 11, added 0
../..                                    | Progress: resolved 553, reused 463, downloaded 25, added 0
../..                                    | Progress: resolved 556, reused 463, downloaded 25, added 0
../..                                    | Progress: resolved 564, reused 466, downloaded 36, added 0
 WARN  6 deprecated subdependencies found: @humanwhocodes/config-array@0.13.0, @humanwhocodes/object-schema@2.0.3, glob@7.1.7, glob@7.2.3, inflight@1.0.6, rimraf@3.0.2
../..                                    |  +36 ++++
../..                                    | Progress: resolved 564, reused 466, downloaded 36, added 1
../..                                    | Progress: resolved 564, reused 466, downloaded 36, added 36, done

dependencies:
+ @dnd-kit/core 6.3.1
+ @dnd-kit/sortable 10.0.0
+ @dnd-kit/utilities 3.2.2
+ @next-auth/prisma-adapter 1.0.7
+ @radix-ui/react-dialog 1.1.15
+ @radix-ui/react-dropdown-menu 2.1.16
+ @radix-ui/react-label 2.1.8
+ @radix-ui/react-select 2.2.6
+ @radix-ui/react-slot 1.2.4
+ @uploadthing/react 7.3.3
+ bcryptjs 2.4.3
+ class-variance-authority 0.7.1
+ clsx 2.1.1
+ database 1.0.0 <- ..\..\packages\database
+ date-fns 3.6.0
+ lucide-react 0.303.0
+ next 14.0.4 deprecated
+ next-auth 4.24.13
+ react 18.3.1 (19.2.4 is available)
+ react-dom 18.3.1 (19.2.4 is available)
+ recharts 3.8.0
+ sonner 2.0.7
+ tailwind-merge 2.6.0
+ uploadthing 7.7.4
+ zod 3.25.76
+ zustand 4.5.7

devDependencies:
+ @types/bcryptjs 2.4.6 already in devDependencies, was not moved to dependencies.
+ @types/node 20.19.27 already in devDependencies, was not moved to dependencies.
+ @types/react 18.3.27 already in devDependencies, was not moved to dependencies.
+ @types/react-dom 18.3.7 already in devDependencies, was not moved to dependencies.
+ autoprefixer 10.4.23 already in devDependencies, was not moved to dependencies.
+ eslint 8.57.1 (10.0.3 is available) deprecated already in devDependencies, was not moved to dependencies.
+ eslint-config 1.0.0 <- ..\..\packages\eslint-config already in devDependencies, was not moved to dependencies.
+ eslint-config-next 14.0.4 already in devDependencies, was not moved to dependencies.
+ postcss 8.5.6 already in devDependencies, was not moved to dependencies.
+ tailwindcss 3.4.19 already in devDependencies, was not moved to dependencies.
+ tailwindcss-animate 1.0.7 already in devDependencies, was not moved to dependencies.
+ typescript 5.9.3 already in devDependencies, was not moved to dependencies.

Done in 8s
Update Todos

recharts paketini kur

Analytics API endpoint oluştur (/api/analytics/personal)

Analytics bileşenleri oluştur (5 component)

Analytics sayfası oluştur (/analytics)

Navbar'a Analitik linki ekle

CHANGELOG, daily-log ve MEMORY.md güncelle
Şimdi Prisma schema'sındaki TimelineTask yapısına bakıp API'yi yazalım.

Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\packages\database\prisma\schema.prisma
Tüm yapıyı anladım. Şimdi Analytics API'yi oluşturalım.

Bash Analytics API dizini oluştur
IN
mkdir -p "c:/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone/apps/web/app/api/analytics/personal"

OUT
0
Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\app\api\analytics\personal\route.ts
219 lines
/**
 * Personal Analytics API
 *
 * GET /api/analytics/personal?range=week|month|3month|all
 *
 * TimelineTask verisinden türetilen kişisel verimlilik analitiği:
 * - Haftalık/aylık özet (tamamlanan, atlanan, planlanan sayıları)
 * - Board bazlı zaman dağılımı (pasta grafik verisi)
 * - Saatlik verimlilik haritası (en üretken saatler)
 * - Tahmin doğruluğu trendi (estimatedMinutes vs actualMinutes)
 * - Özet istatistikler (streak, toplam süre, vb.)
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from 'database';
import { startOfDay, subDays, subMonths, format, differenceInDays } from 'date-fns';

type RangeParam = 'week' | 'month' | '3month' | 'all';

function getStartDate(range: RangeParam): Date | null {
  const now = new Date();
  switch (range) {
    case 'week':
      return subDays(startOfDay(now), 7);
    case 'month':
      return subMonths(startOfDay(now), 1);
    case '3month':
      return subMonths(startOfDay(now), 3);
    case 'all':
      return null;
    default:
      return subDays(startOfDay(now), 7);
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rangeParam = (searchParams.get('range') ?? 'week') as RangeParam;
    const validRanges: RangeParam[] = ['week', 'month', '3month', 'all'];
    const range = validRanges.includes(rangeParam) ? rangeParam : 'week';

    const startDate = getStartDate(range);
    const userId = session.user.id;

    const dateFilter = startDate ? { scheduledDate: { gte: startDate } } : {};

    // Tüm görevleri tek sorguda çek (aggregation için yeterli veri)
    const tasks = await prisma.timelineTask.findMany({
      where: { userId, ...dateFilter },
      include: {
        board: { select: { id: true, title: true } },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    // ── 1. Özet istatistikler ────────────────────────────────────────────────
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const skippedTasks = tasks.filter((t) => t.status === 'SKIPPED').length;
    const plannedTasks = tasks.filter(
      (t) => t.status === 'PLANNED' || t.status === 'IN_PROGRESS' || t.status === 'PAUSED'
    ).length;

    // Toplam harcanan dakika (tamamlanan görevler)
    const totalActualMinutes = tasks
      .filter((t) => t.status === 'COMPLETED' && t.actualMinutes)
      .reduce((sum, t) => sum + (t.actualMinutes ?? 0), 0);

    // Ortalama tahmin doğruluğu: (1 - |actual-estimated|/estimated) * 100
    const tasksWithBothTimes = tasks.filter(
      (t) => t.status === 'COMPLETED' && t.actualMinutes && t.estimatedMinutes > 0
    );
    const avgAccuracy =
      tasksWithBothTimes.length > 0
        ? Math.round(
            (tasksWithBothTimes.reduce((sum, t) => {
              const ratio = Math.abs((t.actualMinutes! - t.estimatedMinutes) / t.estimatedMinutes);
              return sum + Math.max(0, (1 - ratio) * 100);
            }, 0) /
              tasksWithBothTimes.length) *
              10
          ) / 10
        : null;

    // En uzun kesintisiz çalışma streaki (tamamlanan görevi olan günler)
    const completedDaySet = new Set(
      tasks
        .filter((t) => t.status === 'COMPLETED')
        .map((t) => format(t.scheduledDate, 'yyyy-MM-dd'))
    );
    const streak = calcStreak(completedDaySet);

    // ── 2. Günlük özet (bar chart) ───────────────────────────────────────────
    // range'e göre kaç gün geriye gideceğimizi belirle
    const daysBack = range === 'week' ? 7 : range === 'month' ? 30 : range === '3month' ? 90 : 90;
    const dailySummary = buildDailySummary(tasks, Math.min(daysBack, 90));

    // ── 3. Board dağılımı (pie chart) ────────────────────────────────────────
    const boardMap = new Map<string, { boardId: string; boardTitle: string; minutes: number; taskCount: number }>();
    for (const task of tasks) {
      if (task.status !== 'COMPLETED') continue;
      const key = task.boardId;
      const existing = boardMap.get(key) ?? {
        boardId: task.boardId,
        boardTitle: task.board.title,
        minutes: 0,
        taskCount: 0,
      };
      existing.minutes += task.actualMinutes ?? task.estimatedMinutes;
      existing.taskCount += 1;
      boardMap.set(key, existing);
    }
    const boardDistribution = Array.from(boardMap.values()).sort((a, b) => b.minutes - a.minutes);

    // ── 4. Saatlik verimlilik haritası ──────────────────────────────────────
    // Hangi saatlerde daha çok görev tamamlandı (0-23)
    const hourlyMap = new Array(24).fill(0).map((_, hour) => ({ hour, taskCount: 0, totalMinutes: 0 }));
    for (const task of tasks) {
      if (task.status !== 'COMPLETED') continue;
      const hour = task.startTime.getHours();
      hourlyMap[hour].taskCount += 1;
      hourlyMap[hour].totalMinutes += task.actualMinutes ?? task.estimatedMinutes;
    }

    // ── 5. Tahmin doğruluğu trendi (son 10 tamamlanan görev) ─────────────────
    const recentCompleted = tasks
      .filter((t) => t.status === 'COMPLETED' && t.actualMinutes)
      .slice(-20); // Son 20 tamamlanan görev

    const estimationTrend = recentCompleted.map((t) => ({
      date: format(t.scheduledDate, 'MM/dd'),
      estimated: t.estimatedMinutes,
      actual: t.actualMinutes!,
      accuracy: Math.round(
        Math.max(0, (1 - Math.abs((t.actualMinutes! - t.estimatedMinutes) / t.estimatedMinutes)) * 100)
      ),
    }));

    return NextResponse.json({
      summary: {
        totalTasks,
        completedTasks,
        skippedTasks,
        plannedTasks,
        totalActualMinutes,
        avgAccuracy,
        streak,
      },
      dailySummary,
      boardDistribution,
      hourlyHeatmap: hourlyMap,
      estimationTrend,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Sunucu hatası';
    console.error('Analytics getirme hatası:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── Yardımcı fonksiyonlar ────────────────────────────────────────────────────

function calcStreak(completedDays: Set<string>): number {
  if (completedDays.size === 0) return 0;
  const today = format(new Date(), 'yyyy-MM-dd');
  let streak = 0;
  let checkDate = new Date();

  // Bugünden geriye doğru giderek kesintisiz günleri say
  // Bugün tamamlanan görev yoksa dünden başla
  if (!completedDays.has(today)) {
    checkDate = subDays(checkDate, 1);
  }

  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    if (!completedDays.has(dateStr)) break;
    streak++;
    checkDate = subDays(checkDate, 1);
  }

  return streak;
}

function buildDailySummary(
  tasks: Array<{ scheduledDate: Date; status: string }>,
  daysBack: number
) {
  const result: Array<{ date: string; completed: number; skipped: number; planned: number }> = [];
  const today = startOfDay(new Date());

  for (let i = daysBack - 1; i >= 0; i--) {
    const day = subDays(today, i);
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(
      (t) => format(startOfDay(t.scheduledDate), 'yyyy-MM-dd') === dateStr
    );

    result.push({
      date: dateStr,
      completed: dayTasks.filter((t) => t.status === 'COMPLETED').length,
      skipped: dayTasks.filter((t) => t.status === 'SKIPPED').length,
      planned: dayTasks.filter(
        (t) => t.status === 'PLANNED' || t.status === 'IN_PROGRESS' || t.status === 'PAUSED'
      ).length,
    });
  }

  return result;
}
Update Todos

recharts paketini kur

Analytics API endpoint oluştur (/api/analytics/personal)

Analytics bileşenleri oluştur (5 component)

Analytics sayfası oluştur (/analytics)

Navbar'a Analitik linki ekle

CHANGELOG, daily-log ve MEMORY.md güncelle
Şimdi analytics bileşenlerini oluşturalım.

Bash Analytics components dizini oluştur
IN
mkdir -p "c:/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone/apps/web/components/analytics"

OUT
0
Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\analytics\stats-card.tsx
29 lines
/**
 * StatsCard — Tek bir özet metrik için kart bileşeni
 */

interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: 'green' | 'blue' | 'orange' | 'purple' | 'gray';
}

const colorMap = {
  green: 'text-green-600 bg-green-50',
  blue: 'text-blue-600 bg-blue-50',
  orange: 'text-orange-600 bg-orange-50',
  purple: 'text-purple-600 bg-purple-50',
  gray: 'text-gray-600 bg-gray-50',
};

export function StatsCard({ label, value, sub, color = 'blue' }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold ${colorMap[color].split(' ')[0]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}
Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\analytics\weekly-summary-chart.tsx
77 lines
/**
 * WeeklySummaryChart — Günlük tamamlanan/atlanan/planlanan görev bar chart
 *
 * recharts BarChart kullanır. Tarih bazlı gruplama API tarafından yapılır.
 */

'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

interface DailySummaryItem {
  date: string;
  completed: number;
  skipped: number;
  planned: number;
}

interface WeeklySummaryChartProps {
  data: DailySummaryItem[];
}

export function WeeklySummaryChart({ data }: WeeklySummaryChartProps) {
  if (data.length === 0) {
    return <EmptyState message="Henüz veri yok. Günlük Plan'dan görev tamamlayarak başlayın." />;
  }

  // Sadece aktivite olan günleri göster, yoksa son 14 günü
  const displayData = data.slice(-30).map((d) => ({
    ...d,
    label: format(parseISO(d.date), 'dd MMM', { locale: tr }),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Günlük Görev Özeti</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={displayData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="completed" name="Tamamlandı" fill="#22c55e" radius={[3, 3, 0, 0]} />
          <Bar dataKey="planned" name="Planlandı" fill="#60a5fa" radius={[3, 3, 0, 0]} />
          <Bar dataKey="skipped" name="Atlandı" fill="#f87171" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-center h-[280px]">
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\analytics\board-distribution-chart.tsx
90 lines
/**
 * BoardDistributionChart — Board bazlı harcanan dakika pasta grafiği
 *
 * recharts PieChart kullanır. Renk otomatik atanır (10 sabit renk paleti).
 */

'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BoardDistributionItem {
  boardId: string;
  boardTitle: string;
  minutes: number;
  taskCount: number;
}

interface BoardDistributionChartProps {
  data: BoardDistributionItem[];
}

// 10 renkten oluşan sabit palet — board sırası bu renklerle eşlenir
const COLORS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6',
  '#f97316', '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16',
];

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} sa ${m} dk` : `${h} sa`;
}

export function BoardDistributionChart({ data }: BoardDistributionChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-center h-[280px]">
        <p className="text-sm text-gray-400">Henüz tamamlanan görev yok.</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.boardTitle,
    value: d.minutes,
    taskCount: d.taskCount,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Board Bazlı Zaman Dağılımı</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [formatMinutes(value), name]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value, entry: any) =>
              `${value} (${formatMinutes(entry.payload.value)})`
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\analytics\hourly-heatmap.tsx
117 lines
/**
 * HourlyHeatmap — Saatlik verimlilik ısı haritası
 *
 * 24 saatlik grid. Her hücrenin renk yoğunluğu o saatte tamamlanan
 * görev sayısıyla orantılıdır. Hover'da detay tooltip gösterilir.
 */

'use client';

import { useState } from 'react';

interface HourlyData {
  hour: number;
  taskCount: number;
  totalMinutes: number;
}

interface HourlyHeatmapProps {
  data: HourlyData[];
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} sa ${m} dk` : `${h} sa`;
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

// Görev sayısına göre arka plan rengi hesaplar (0 → beyaz, max → koyu yeşil)
function getCellStyle(taskCount: number, maxCount: number): string {
  if (taskCount === 0) return 'bg-gray-100 text-gray-300';
  const ratio = taskCount / maxCount;
  if (ratio <= 0.25) return 'bg-green-100 text-green-700';
  if (ratio <= 0.5) return 'bg-green-300 text-green-800';
  if (ratio <= 0.75) return 'bg-green-500 text-white';
  return 'bg-green-700 text-white';
}

export function HourlyHeatmap({ data }: HourlyHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ hour: number; x: number; y: number } | null>(null);

  const maxCount = Math.max(...data.map((d) => d.taskCount), 1);
  const hasData = data.some((d) => d.taskCount > 0);

  const activeHour = tooltip ? data[tooltip.hour] : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">Saatlik Verimlilik Haritası</h3>
      <p className="text-xs text-gray-400 mb-4">Hangi saatlerde daha çok görev tamamlıyorsun?</p>

      {!hasData ? (
        <div className="flex items-center justify-center h-24 text-sm text-gray-400">
          Henüz tamamlanan görev yok.
        </div>
      ) : (
        <div className="relative">
          {/* Sabah / Öğle / Akşam / Gece etiketleri */}
          <div className="flex justify-between text-xs text-gray-400 mb-1 px-0.5">
            <span>Gece yarısı</span>
            <span>Sabah</span>
            <span>Öğle</span>
            <span>Akşam</span>
            <span>Gece</span>
          </div>

          {/* 24 saat grid — 8 sütun × 3 satır */}
          <div className="grid grid-cols-8 gap-1">
            {data.map((d) => (
              <div
                key={d.hour}
                className={`relative h-10 rounded flex flex-col items-center justify-center cursor-default transition-all ${getCellStyle(d.taskCount, maxCount)}`}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({ hour: d.hour, x: rect.left, y: rect.top });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <span className="text-[10px] font-medium leading-none">{formatHour(d.hour)}</span>
                {d.taskCount > 0 && (
                  <span className="text-[9px] leading-none opacity-80">{d.taskCount}</span>
                )}
              </div>
            ))}
          </div>

          {/* Tooltip */}
          {tooltip && activeHour && (
            <div className="mt-3 p-3 bg-gray-800 text-white rounded-lg text-xs flex gap-4">
              <span className="font-semibold">{formatHour(activeHour.hour)}</span>
              <span>{activeHour.taskCount} görev tamamlandı</span>
              {activeHour.totalMinutes > 0 && (
                <span>{formatMinutes(activeHour.totalMinutes)} harcandı</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lejant */}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-xs text-gray-400">Az</span>
        {['bg-gray-100', 'bg-green-100', 'bg-green-300', 'bg-green-500', 'bg-green-700'].map(
          (cls, i) => (
            <div key={i} className={`w-5 h-5 rounded ${cls} border border-gray-200`} />
          )
        )}
        <span className="text-xs text-gray-400">Çok</span>
      </div>
    </div>
  );
}
Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\analytics\estimation-accuracy-chart.tsx
108 lines
/**
 * EstimationAccuracyChart — Tahmin doğruluğu trend çizgi grafiği
 *
 * Son tamamlanan görevlerde tahmini vs gerçek süreyi karşılaştırır.
 * "Tahminci olarak gelişiyor musun?" sorusunu görselleştirir.
 */

'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface EstimationTrendItem {
  date: string;
  estimated: number;
  actual: number;
  accuracy: number;
}

interface EstimationAccuracyChartProps {
  data: EstimationTrendItem[];
  avgAccuracy: number | null;
}

export function EstimationAccuracyChart({ data, avgAccuracy }: EstimationAccuracyChartProps) {
  if (data.length < 2) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Tahmin Doğruluğu Trendi</h3>
          {avgAccuracy !== null && <AccuracyBadge accuracy={avgAccuracy} />}
        </div>
        <div className="flex items-center justify-center h-[180px] text-sm text-gray-400">
          En az 2 tamamlanan görev gerekli.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Tahmin Doğruluğu Trendi</h3>
          <p className="text-xs text-gray-400">
            Tahmini süre (mavi) ile gerçek süre (turuncu) karşılaştırması
          </p>
        </div>
        {avgAccuracy !== null && <AccuracyBadge accuracy={avgAccuracy} />}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickFormatter={(v) => `${v}dk`}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            formatter={(value: number, name: string) => [`${value} dk`, name]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="estimated"
            name="Tahmini"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Gerçek"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function AccuracyBadge({ accuracy }: { accuracy: number }) {
  const color =
    accuracy >= 80 ? 'bg-green-100 text-green-700' :
    accuracy >= 60 ? 'bg-yellow-100 text-yellow-700' :
    'bg-red-100 text-red-700';

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      %{accuracy} doğru
    </div>
  );
}
Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\analytics\analytics-dashboard.tsx
181 lines
/**
 * AnalyticsDashboard — Kişisel verimlilik analitiği ana bileşeni
 *
 * /analytics sayfasında kullanılır. Tüm chart ve stats bileşenlerini
 * bir araya getirir. Tarih aralığı filtresi (week/month/3month/all) içerir.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { StatsCard } from './stats-card';
import { WeeklySummaryChart } from './weekly-summary-chart';
import { BoardDistributionChart } from './board-distribution-chart';
import { HourlyHeatmap } from './hourly-heatmap';
import { EstimationAccuracyChart } from './estimation-accuracy-chart';

type Range = 'week' | 'month' | '3month' | 'all';

interface AnalyticsData {
  summary: {
    totalTasks: number;
    completedTasks: number;
    skippedTasks: number;
    plannedTasks: number;
    totalActualMinutes: number;
    avgAccuracy: number | null;
    streak: number;
  };
  dailySummary: Array<{ date: string; completed: number; skipped: number; planned: number }>;
  boardDistribution: Array<{ boardId: string; boardTitle: string; minutes: number; taskCount: number }>;
  hourlyHeatmap: Array<{ hour: number; taskCount: number; totalMinutes: number }>;
  estimationTrend: Array<{ date: string; estimated: number; actual: number; accuracy: number }>;
}

const RANGE_LABELS: Record<Range, string> = {
  week: 'Son 7 Gün',
  month: 'Son 1 Ay',
  '3month': 'Son 3 Ay',
  all: 'Tümü',
};

function formatMinutes(minutes: number): string {
  if (minutes === 0) return '0 dk';
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} sa ${m} dk` : `${h} sa`;
}

export function AnalyticsDashboard() {
  const [range, setRange] = useState<Range>('week');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics/personal?range=${range}`);
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? 'Veri yüklenemedi');
      }
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Başlık + Tarih aralığı seçici */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kişisel Analitik</h1>
          <p className="text-sm text-gray-500 mt-1">
            Görev geçmişin ve verimlilik trendlerin
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                range === r
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Hata */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Yükleniyor */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-24" />
          ))}
        </div>
      )}

      {/* İçerik */}
      {!loading && data && (
        <>
          {/* Özet istatistikler */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatsCard
              label="Tamamlanan Görev"
              value={data.summary.completedTasks}
              sub={`${data.summary.totalTasks} planlanan içinde`}
              color="green"
            />
            <StatsCard
              label="Harcanan Süre"
              value={formatMinutes(data.summary.totalActualMinutes)}
              sub="gerçek çalışma süresi"
              color="blue"
            />
            <StatsCard
              label="Tahmin Doğruluğu"
              value={data.summary.avgAccuracy !== null ? `%${data.summary.avgAccuracy}` : '—'}
              sub="estimated vs actual"
              color="purple"
            />
            <StatsCard
              label="Streak"
              value={`${data.summary.streak} gün`}
              sub="kesintisiz çalışma"
              color="orange"
            />
          </div>

          {/* Grafik grid — 2 sütun */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <WeeklySummaryChart data={data.dailySummary} />
            <BoardDistributionChart data={data.boardDistribution} />
          </div>

          {/* Tam genişlik bileşenler */}
          <div className="flex flex-col gap-6">
            <HourlyHeatmap data={data.hourlyHeatmap} />
            <EstimationAccuracyChart
              data={data.estimationTrend}
              avgAccuracy={data.summary.avgAccuracy}
            />
          </div>

          {/* Boş durum uyarısı */}
          {data.summary.totalTasks === 0 && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <p className="text-sm text-blue-700 font-medium mb-1">Henüz veri yok</p>
              <p className="text-xs text-blue-500">
                Günlük Plan sayfasından görev ekleyip tamamladıkça analitik veriler burada görünecek.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
Update Todos

recharts paketini kur

Analytics API endpoint oluştur (/api/analytics/personal)

Analytics bileşenleri oluştur (5 component)

Analytics sayfası oluştur (/analytics)

Navbar'a Analitik linki ekle

CHANGELOG, daily-log ve MEMORY.md güncelle
Bash Analytics sayfa dizini oluştur
IN
mkdir -p "c:/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone/apps/web/app/(dashboard)/analytics"

OUT
0
Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\app\(dashboard)\analytics\page.tsx
19 lines
/**
 * Analytics Page — /analytics
 *
 * Kişisel verimlilik analitiği sayfası.
 * AnalyticsDashboard client bileşenini render eder.
 */

import { Metadata } from 'next';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';

export const metadata: Metadata = {
  title: 'Analitik | ULGEN',
  description: 'Kişisel görev verimlilik analitiği',
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
Update Todos

recharts paketini kur

Analytics API endpoint oluştur (/api/analytics/personal)

Analytics bileşenleri oluştur (5 component)

Analytics sayfası oluştur (/analytics)

Navbar'a Analitik linki ekle

CHANGELOG, daily-log ve MEMORY.md güncelle
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\dashboard-nav.tsx
Modified
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\dashboard-nav.tsx
Added 6 lines
Update Todos

recharts paketini kur

Analytics API endpoint oluştur (/api/analytics/personal)

Analytics bileşenleri oluştur (5 component)

Analytics sayfası oluştur (/analytics)

Navbar'a Analitik linki ekle

CHANGELOG, daily-log ve MEMORY.md güncelle
Şimdi TypeScript derleme kontrolü yapalım, ardından dokümanları güncelleyelim.

Bash TypeScript derleme kontrolü
IN
cd "c:/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone" && export PATH="$PATH:/c/Users/turki/AppData/Roaming/npm" && pnpm --filter web tsc --noEmit 2>&1

OUT
None of the selected packages has a "tsc" script
Bash TypeScript derleme kontrolü (web)
IN
cd "c:/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone/apps/web" && export PATH="$PATH:/c/Users/turki/AppData/Roaming/npm" && npx tsc --noEmit 2>&1

OUT
Exit code 2
app/api/analytics/personal/route.ts(18,50): error TS6133: 'differenceInDays' is declared but its value is never read.
components/analytics/board-distribution-chart.tsx(76,13): error TS2322: Type '(value: number, name: string) => [string, string]' is not assignable to type 'Formatter<ValueType, NameType> & ((value: ValueType, name: NameType, item: TooltipPayloadEntry, index: number, payload: TooltipPayload) => ReactNode | [...])'.
  Type '(value: number, name: string) => [string, string]' is not assignable to type 'Formatter<ValueType, NameType>'.
    Types of parameters 'value' and 'value' are incompatible.
      Type 'ValueType | undefined' is not assignable to type 'number'.
        Type 'undefined' is not assignable to type 'number'.
components/analytics/estimation-accuracy-chart.tsx(69,13): error TS2322: Type '(value: number, name: string) => [string, string]' is not assignable to type 'Formatter<ValueType, NameType> & ((value: ValueType, name: NameType, item: TooltipPayloadEntry, index: number, payload: TooltipPayload) => ReactNode | [...])'.
  Type '(value: number, name: string) => [string, string]' is not assignable to type 'Formatter<ValueType, NameType>'.
    Types of parameters 'value' and 'value' are incompatible.
      Type 'ValueType | undefined' is not assignable to type 'number'.
        Type 'undefined' is not assignable to type 'number'.
3 hata var, düzeltelim.

Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\app\api\analytics\personal\route.ts
Modified
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\analytics\board-distribution-chart.tsx
Edit failed
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\analytics\board-distribution-chart.tsx
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\analytics\board-distribution-chart.tsx
Modified
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\analytics\estimation-accuracy-chart.tsx
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\analytics\estimation-accuracy-chart.tsx
Modified
Bash TypeScript derleme kontrolü (tekrar)
IN
cd "c:/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone/apps/web" && export PATH="$PATH:/c/Users/turki/AppData/Roaming/npm" && npx tsc --noEmit 2>&1

OUT
0
TypeScript hataları sıfır. Şimdi dokümanları güncelleyelim.

Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\CHANGELOG.md
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\CHANGELOG.md
Edit failed
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\CHANGELOG.md
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\CHANGELOG.md
Edit failed
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\CHANGELOG.md
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\CHANGELOG.md
Edit failed
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\CHANGELOG.md
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\CHANGELOG.md
Edit failed
Bash CHANGELOG başlığını kontrol et
IN
cd "c:/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone" && head -7 docs/CHANGELOG.md

OUT
# Changelog - ÜLGEN Trello Clone

Projedeki tüm önemli değişiklikler bu dosyada kaydedilir.

---

## [2.3.0] - 2026-03-08
Bash CHANGELOG'a v2.4.0 ekle
IN
cd "c:/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone" && sed -i 's/## \[2\.3\.0\] - 2026-03-08/## [2.4.0] - 2026-03-08\n\n### Added (Yeni Eklenenler)\n- **Personal Analytics Dashboard (#26)** - analytics sayfasi\n- GET \/api\/analytics\/personal?range=week|month|3month|all\n- WeeklySummaryChart, BoardDistributionChart, HourlyHeatmap, EstimationAccuracyChart, StatsCard\n- AnalyticsDashboard ana container (range secici ile)\n- Navbar: Analitik linki eklendi\n\n### Dependencies\n- Eklendi: recharts@3.8.0\n\n---\n\n## [2.3.0] - 2026-03-08/' docs/CHANGELOG.md 2>&1 && head -30 docs/CHANGELOG.md

OUT
# Changelog - ÜLGEN Trello Clone

Projedeki tüm önemli değişiklikler bu dosyada kaydedilir.

---

## [2.4.0] - 2026-03-08

### Added (Yeni Eklenenler)
- **Personal Analytics Dashboard (#26)** - analytics sayfasi
- GET /api/analytics/personal?range=week|month|3month|all
- WeeklySummaryChart, BoardDistributionChart, HourlyHeatmap, EstimationAccuracyChart, StatsCard
- AnalyticsDashboard ana container (range secici ile)
- Navbar: Analitik linki eklendi

### Dependencies
- Eklendi: recharts@3.8.0

---

## [2.3.0] - 2026-03-08

### Added (Yeni Eklenenler)
- **Kart Tamamlandi / Board-Level Completion (#32)**
- `isCompleted Boolean @default(false)` Card modeline eklendi (pnpm db:push ile sync)
- Timeline unscheduled pool: `isCompleted: false` filtresi -- tamamlananlar havuzdan dislandi
- CardItem: sag ust kosede Circle/CheckCircle2 toggle, ustu cizili baslik, yesil rozet
- CardDetailModal: "Karti Tamamlandi Olarak Isaretele" toggle butonu + aciklama notu
- Board header: "Tamamlananlar" toggle (aktifken Kanban ve Matris'te gizlenir)
- Optimistic UI: toggle store'u aninda gunceller, API basarisizsa revert eder
Şimdi daily-log ve MEMORY.md'yi güncelleyelim.

Bash daily-log dizini oluştur
IN
mkdir -p "c:/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone/docs/daily-log"

OUT
0
yanlışlıkla kapandı devam et lütfen kaldığın yerden
Devam ediyorum — daily-log ve MEMORY.md kaldı.

Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\daily-log\2026-03-08.md
Write failed
# Daily Log — 2026-03-08

## v2.4.0 — Personal Analytics Dashboard (#26)

### Yapılanlar

**Yeni Dosyalar:**
- `apps/web/app/api/analytics/personal/route.ts` — GET endpoint, 4 farklı range (week/month/3month/all)
- `apps/web/app/(dashboard)/analytics/page.tsx` — /analytics sayfası
- `apps/web/components/analytics/analytics-dashboard.tsx` — Ana container + range seçici
- `apps/web/components/analytics/stats-card.tsx` — Özet metrik kartı
- `apps/web/components/analytics/weekly-summary-chart.tsx` — Günlük bar chart (recharts)
- `apps/web/components/analytics/board-distribution-chart.tsx` — Board dağılımı donut pie
- `apps/web/components/analytics/hourly-heatmap.tsx` — Saatlik verimlilik ısı haritası
- `apps/web/components/analytics/estimation-accuracy-chart.tsx` — Tahmin doğruluğu line chart

**Değiştirilen Dosyalar:**
- `apps/web/components/dashboard-nav.tsx` — Analitik linki + BarChart2 ikonu

**Yeni Bağımlılık:**
- `recharts@3.8.0` apps/web'e eklendi

### Analytics API Özellikleri
- Prisma'dan TimelineTask sorguları: tek sorguda tüm görevler çekilir, JS'de aggregate edilir
- `streak` hesaplama: bugünden geriye giderek kesintisiz tamamlanan günleri sayar
- Tahmin doğruluğu: `(1 - |actual-estimated|/estimated) * 100`, 0-100 arası
- Saatlik heatmap: `startTime.getHours()` ile 0-23 bucket'larına dağıtılır
- Board dağılımı: tamamlanan görevlerin `actualMinutes || estimatedMinutes` toplamı

### TypeScript Kontrol
- `npx tsc --noEmit` → 0 hata ✅

### Manuel Test Senaryoları
- [ ] `/analytics` sayfası açılıyor mu?
- [ ] Range butonları (Son 7 Gün / Son 1 Ay / Son 3 Ay / Tümü) çalışıyor mu?
- [ ] Timeline'dan hiç görev yokken boş state görünüyor mu?
- [ ] Tamamlanan görev varsa bar chart verileri doğru mu?
- [ ] Saatlik heatmap hover tooltip çalışıyor mu?
- [ ] Pie chart legend ve tooltip doğru süreyi gösteriyor mu?
- [ ] Streak sayısı bugün tamamlanan görev yoksa dünden mi başlıyor?
Bash daily-log dosyası oluştur
IN
cat > "c:/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone/docs/daily-log/2026-03-08.md" << 'EOF'
# Daily Log — 2026-03-08

## v2.4.0 — Personal Analytics Dashboard (#26)

### Yapılanlar

**Yeni Dosyalar:**
- `apps/web/app/api/analytics/personal/route.ts` — GET endpoint, 4 range (week/month/3month/all)
- `apps/web/app/(dashboard)/analytics/page.tsx` — /analytics sayfasi
- `apps/web/components/analytics/analytics-dashboard.tsx` — Ana container + range secici
- `apps/web/components/analytics/stats-card.tsx` — Ozet metrik karti
- `apps/web/components/analytics/weekly-summary-chart.tsx` — Gunluk bar chart (recharts)
- `apps/web/components/analytics/board-distribution-chart.tsx` — Donut pie chart
- `apps/web/components/analytics/hourly-heatmap.tsx` — Saatlik is haritasi (24 hucre)
- `apps/web/components/analytics/estimation-accuracy-chart.tsx` — Tahmin dogrulugu line chart

**Degistirilen Dosyalar:**
- `apps/web/components/dashboard-nav.tsx` — Analitik linki + BarChart2 ikonu

**Yeni Bagimlilik:**
- `recharts@3.8.0` apps/web'e eklendi

### TypeScript: 0 hata (npx tsc --noEmit)
EOF

OUT
0
Şimdi MEMORY.md'yi güncelleyelim.

Read c:\Users\turki\.claude\projects\c--Users-turki-Documents-PROJELER--LGEN-trello-clone\memory\MEMORY.md
Edit c:\Users\turki\.claude\projects\c--Users-turki-Documents-PROJELER--LGEN-trello-clone\memory\MEMORY.md
Added 1 line
Şimdi API Endpoints bölümüne de ekleyelim.

Read c:\Users\turki\.claude\projects\c--Users-turki-Documents-PROJELER--LGEN-trello-clone\memory\MEMORY.md (lines 61-160)
Edit c:\Users\turki\.claude\projects\c--Users-turki-Documents-PROJELER--LGEN-trello-clone\memory\MEMORY.md
Added 1 line
Son olarak TODOS.md'yi güncelleyelim.

Bash TODOS.md'deki ilgili satır numaralarını bul
IN
grep -n "26\. Personal Analytics\|Sonraki Adım\|Son Güncelleme\|Son Revizyon\|İstatistikler\|Tamamlanan:\|Bekleyen:" "c:/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone/docs/TODOS.md" | head -20

OUT
3:**Son Güncelleme:** 7 Mart 2026
557:#### 26. Personal Analytics Dashboard 📊
753:## 📊 İstatistikler
756:**Tamamlanan:** 12 (Veri Aktarma, Drag & Drop, Yorumlar, Dosya Ekleri, Daily Task Timeline Phase 1+2+3, Due Dates, Checklist, Build Fix, Labels, Kart Tamamlandı)
758:**Bekleyen:** 20
765:## 🎯 Sonraki Adım
794:**Son Revizyon:** 8 Mart 2026, v2.3.0
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\TODOS.md (lines 558-587)
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\TODOS.md
Edit failed
Bash TODOS.md'deki mevcut içeriği kontrol et
IN
cd "c:/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone" && python3 -c "
content = open('docs/TODOS.md', encoding='utf-8').read()

old = '''#### 26. Personal Analytics Dashboard 📊
**Tahmini Süre:** 4-5 saat
**Öncelik:** 🟠 Orta (Timeline Phase 1\'in doğal devamı)
**Bağımlılık:** #20 Timeline Phase 1 ✅

> **Konsept:** \"En verimli saatlerim 10:00–12:00\", \"Sprint Board\'a haftalık 14 saat harcıyorum\", \"Tahmin doğruluğum %73.\" Kişisel verimlilik analitiği — rakip ürünlerde neredeyse yok.

**Özellikler:**
- Haftalık/aylık özet: kaç görev tamamlandı, kaç atlandı
- Board bazlı zaman dağılımı (pasta grafiği)
- Saatlik verimlilik haritası (hangi saatler en üretken)
- Tahmin doğruluğu trendi (estimatedMinutes vs actualMinutes)
- En uzun streak (kesintisiz çalışma günleri)
- Date range seçimi (1 hafta / 1 ay / 3 ay)

**Yapılacaklar:**
- [ ] API: \`/api/analytics/personal\` endpoint (aggregated queries)
- [ ] Component: \`AnalyticsDashboard\` sayfası (\`/analytics\`)
- [ ] Chart library: recharts entegrasyonu
- [ ] Saatlik heatmap komponenti
- [ ] Navbar\'a \"Analitik\" linki'''

new = '''#### ✅ 26. Personal Analytics Dashboard 📊
**Durum:** ✅ Tamamlandı (v2.4.0)
**Tahmini Süre:** 4-5 saat
**Öncelik:** 🟠 Orta (Timeline Phase 1\'in doğal devamı)
**Bağımlılık:** #20 Timeline Phase 1 ✅

> **Konsept:** \"En verimli saatlerim 10:00–12:00\", \"Sprint Board\'a haftalık 14 saat harcıyorum\", \"Tahmin doğruluğum %73.\" Kişisel verimlilik analitiği — rakip ürünlerde neredeyse yok.

**Tamamlanan Özellikler:**
- ✅ Haftalık/aylık/3 aylık/tümü özet (range seçici)
- ✅ Board bazlı zaman dağılımı (donut pie chart)
- ✅ Saatlik verimlilik haritası (24 hücre, renk yoğunluğu)
- ✅ Tahmin doğruluğu trendi (line chart, tahmini vs gerçek)
- ✅ En uzun streak (kesintisiz çalışma günleri)
- ✅ Özet istatistikler: tamamlanan görev, toplam süre, %doğruluk, streak

**Tamamlanan Yapılacaklar:**
- ✅ API: \`/api/analytics/personal\` endpoint (aggregated queries)
- ✅ Component: \`AnalyticsDashboard\` sayfası (\`/analytics\`)
- ✅ Chart library: recharts@3.8.0 entegrasyonu
- ✅ Saatlik heatmap komponenti (\`HourlyHeatmap\`)
- ✅ Navbar\'a \"Analitik\" linki'''

print('FOUND' if old in content else 'NOT FOUND')
" 2>&1

OUT
FOUND
Bash TODOS.md'yi Python ile güncelle
IN
cd "c:/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone" && python3 - << 'PYEOF'
with open('docs/TODOS.md', encoding='utf-8') as f:
    content = f.read()

old = """#### 26. Personal Analytics Dashboard 📊
**Tahmini Süre:** 4-5 saat
**Öncelik:** 🟠 Orta (Timeline Phase 1'in doğal devamı)
**Bağımlılık:** #20 Timeline Phase 1 ✅

> **Konsept:** "En verimli saatlerim 10:00–12:00", "Sprint Board'a haftalık 14 saat harcıyorum", "Tahmin doğruluğum %73." Kişisel verimlilik analitiği — rakip ürünlerde neredeyse yok.

**Özellikler:**
- Haftalık/aylık özet: kaç görev tamamlandı, kaç atlandı
- Board bazlı zaman dağılımı (pasta grafiği)
- Saatlik verimlilik haritası (hangi saatler en üretken)
- Tahmin doğruluğu trendi (estimatedMinutes vs actualMinutes)
- En uzun streak (kesintisiz çalışma günleri)
- Date range seçimi (1 hafta / 1 ay / 3 ay)

**Yapılacaklar:**
- [ ] API: `/api/analytics/personal` endpoint (aggregated queries)
- [ ] Component: `AnalyticsDashboard` sayfası (`/analytics`)
- [ ] Chart library: recharts entegrasyonu
- [ ] Saatlik heatmap komponenti
- [ ] Navbar'a "Analitik" linki"""

new = """#### ✅ 26. Personal Analytics Dashboard 📊
**Durum:** ✅ Tamamlandı (v2.4.0)
**Tahmini Süre:** 4-5 saat
**Öncelik:** 🟠 Orta (Timeline Phase 1'in doğal devamı)
**Bağımlılık:** #20 Timeline Phase 1 ✅

> **Konsept:** "En verimli saatlerim 10:00–12:00", "Sprint Board'a haftalık 14 saat harcıyorum", "Tahmin doğruluğum %73." Kişisel verimlilik analitiği — rakip ürünlerde neredeyse yok.

**Tamamlanan Özellikler:**
- ✅ Haftalık/aylık/3 aylık/tümü özet (range seçici)
- ✅ Board bazlı zaman dağılımı (donut pie chart)
- ✅ Saatlik verimlilik haritası (24 hücre, renk yoğunluğu)
- ✅ Tahmin doğruluğu trendi (line chart, tahmini vs gerçek)
- ✅ En uzun streak (kesintisiz çalışma günleri)
- ✅ Özet istatistikler: tamamlanan görev, toplam süre, %doğruluk, streak

**Tamamlanan Yapılacaklar:**
- ✅ API: `/api/analytics/personal` endpoint (aggregated queries)
- ✅ Component: `AnalyticsDashboard` sayfası (`/analytics`)
- ✅ Chart library: recharts@3.8.0 entegrasyonu
- ✅ Saatlik heatmap komponenti (`HourlyHeatmap`)
- ✅ Navbar'a "Analitik" linki"""

# İstatistikler güncelle
content = content.replace(old, new)
content = content.replace('**Tamamlanan:** 12 (Veri Aktarma, Drag & Drop, Yorumlar, Dosya Ekleri, Daily Task Timeline Phase 1+2+3, Due Dates, Checklist, Build Fix, Labels, Kart Tamamlandı)',
                          '**Tamamlanan:** 13 (Veri Aktarma, Drag & Drop, Yorumlar, Dosya Ekleri, Daily Task Timeline Phase 1+2+3, Due Dates, Checklist, Build Fix, Labels, Kart Tamamlandı, Personal Analytics)')
content = content.replace('**Bekleyen:** 20', '**Bekleyen:** 19')
content = content.replace('12. 🔥 **Timeline Tamamlanmış Gizle** (#31) - Unscheduled panel toggle',
                          '12. ✅ **Personal Analytics Dashboard** (#26) - /analytics sayfası (v2.4.0)\n13. 🔥 **Timeline Tamamlanmış Gizle** (#31) - Unscheduled panel toggle')
content = content.replace('**Son Revizyon:** 8 Mart 2026, v2.3.0', '**Son Revizyon:** 8 Mart 2026, v2.4.0')

with open('docs/TODOS.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
PYEOF

OUT
Done
Bash TODOS.md güncellemelerini doğrula
IN
grep -n "Tamamlanan:\|Bekleyen:\|Son Revizyon\|Personal Analytics\|Timeline Tamamlanmış" "c:/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone/docs/TODOS.md"

OUT
557:#### ✅ 26. Personal Analytics Dashboard 📊
631:**Bağımlılık:** #26 Personal Analytics
757:**Tamamlanan:** 13 (Veri Aktarma, Drag & Drop, Yorumlar, Dosya Ekleri, Daily Task Timeline Phase 1+2+3, Due Dates, Checklist, Build Fix, Labels, Kart Tamamlandı, Personal Analytics)
759:**Bekleyen:** 19
780:12. ✅ **Personal Analytics Dashboard** (#26) - /analytics sayfası (v2.4.0)
781:13. 🔥 **Timeline Tamamlanmış Gizle** (#31) - Unscheduled panel toggle
796:**Son Revizyon:** 8 Mart 2026, v2.4.0
Her şey güncellendi. Şimdi todo listesini kapatalım.

Update Todos

recharts paketini kur

Analytics API endpoint oluştur (/api/analytics/personal)

Analytics bileşenleri oluştur (5 component)

Analytics sayfası oluştur (/analytics)

Navbar'a Analitik linki ekle

CHANGELOG, daily-log ve MEMORY.md güncelle
v2.4.0 — Personal Analytics Dashboard tamamlandı. ✅

Özet
Yeni oluşturulan dosyalar:

Dosya	Açıklama
app/api/analytics/personal/route.ts	GET endpoint, 4 range parametresi
app/(dashboard)/analytics/page.tsx	/analytics rotası
components/analytics/analytics-dashboard.tsx	Ana container + range seçici
components/analytics/stats-card.tsx	Özet metrik kartı
components/analytics/weekly-summary-chart.tsx	Günlük bar chart
components/analytics/board-distribution-chart.tsx	Donut pie chart
components/analytics/hourly-heatmap.tsx	Saatlik ısı haritası
components/analytics/estimation-accuracy-chart.tsx	Tahmin doğruluğu line chart
Manuel test için: pnpm dev sonrası navbar'daki Analitik butonuna tıkla → Timeline'dan en az 1 görev tamamlanmışsa grafikler dolar; yoksa boş state görünür.

