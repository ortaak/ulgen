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
