import { TimelineView } from '@/components/timeline/timeline-view';

export const metadata = {
  title: 'Günlük Plan | ULGEN',
  description: 'Tüm board\'lardan görevleri zaman çizelgesinde planlayın',
};

export default function TimelinePage() {
  return <TimelineView />;
}
