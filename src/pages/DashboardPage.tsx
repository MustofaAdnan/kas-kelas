import { useAuth } from '../contexts/AuthContext';
import { LogOut, Users, Settings, Calendar } from 'lucide-react';

interface DashboardPageProps {
  onSelectClass: (classNumber: number) => void;
  onNavigate: (page: string, classNumber?: number) => void;
}

export function DashboardPage({ onSelectClass, onNavigate }: DashboardPageProps) {
  const { signOut, user } = useAuth();

  const classes = [1, 2, 3, 4, 5, 6];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">Manajemen Kas Kelas SD</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Bendahara</h2>
          <p className="text-gray-600">Pilih kelas untuk mengelola kas kelas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classNum) => (
            <div
              key={classNum}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-blue-600">Kelas {classNum}</h3>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => onNavigate('period-select', classNum)}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                >
                  <Calendar className="w-4 h-4" />
                  Kelola Periode & Kas
                </button>
                <button
                  onClick={() => onNavigate('students', classNum)}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                >
                  <Users className="w-4 h-4" />
                  Kelola Siswa
                </button>
                <button
                  onClick={() => onNavigate('settings', classNum)}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                >
                  <Settings className="w-4 h-4" />
                  Pengaturan Kas
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
