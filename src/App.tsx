import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PeriodSelectPage } from './pages/PeriodSelectPage';
import { PeriodDetailPage } from './pages/PeriodDetailPage';

type Page = 'dashboard' | 'students' | 'settings' | 'period-select' | 'period-detail';

interface NavigationState {
  page: Page;
  classNumber?: number;
  periodId?: string;
  month?: number;
  year?: number;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [navState, setNavState] = useState<NavigationState>({ page: 'dashboard' });

  const handleNavigate = (page: string, classNumber?: number) => {
    setNavState({ page: page as Page, classNumber });
  };

  const handleSelectPeriod = (periodId: string, month: number, year: number) => {
    setNavState({
      page: 'period-detail',
      classNumber: navState.classNumber,
      periodId,
      month,
      year
    });
  };

  const handleBackToDashboard = () => {
    setNavState({ page: 'dashboard' });
  };

  const handleBackToPeriodSelect = () => {
    setNavState({
      page: 'period-select',
      classNumber: navState.classNumber
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-gray-600">Memuat...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  switch (navState.page) {
    case 'students':
      return (
        <StudentsPage
          classNumber={navState.classNumber!}
          onBack={handleBackToDashboard}
        />
      );
    case 'settings':
      return (
        <SettingsPage
          classNumber={navState.classNumber!}
          onBack={handleBackToDashboard}
        />
      );
    case 'period-select':
      return (
        <PeriodSelectPage
          classNumber={navState.classNumber!}
          onBack={handleBackToDashboard}
          onSelectPeriod={handleSelectPeriod}
        />
      );
    case 'period-detail':
      return (
        <PeriodDetailPage
          periodId={navState.periodId!}
          classNumber={navState.classNumber!}
          month={navState.month!}
          year={navState.year!}
          onBack={handleBackToPeriodSelect}
        />
      );
    default:
      return (
        <DashboardPage
          onSelectClass={(classNumber) => handleNavigate('period-select', classNumber)}
          onNavigate={handleNavigate}
        />
      );
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
