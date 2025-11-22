import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Plus, Calendar, X } from 'lucide-react';

interface Period {
  id: string;
  class: string;
  month: number;
  year: number;
}

interface PeriodSelectPageProps {
  classNumber: number;
  onBack: () => void;
  onSelectPeriod: (periodId: string, month: number, year: number) => void;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function PeriodSelectPage({ classNumber, onBack, onSelectPeriod }: PeriodSelectPageProps) {
  const [years, setYears] = useState<number[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [existingPeriod, setExistingPeriod] = useState<Period | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddYear, setShowAddYear] = useState(false);
  const [newYear, setNewYear] = useState('');

  useEffect(() => {
    loadYears();
  }, []);

  useEffect(() => {
    checkPeriod();
  }, [selectedMonth, selectedYear, classNumber]);

  const loadYears = async () => {
    const { data, error } = await supabase
      .from('periods')
      .select('year')
      .order('year', { ascending: false });

    if (!error && data) {
      const uniqueYears = [...new Set(data.map(p => p.year))];
      if (uniqueYears.length === 0) {
        uniqueYears.push(new Date().getFullYear());
      }
      setYears(uniqueYears);
    } else {
      setYears([new Date().getFullYear()]);
    }
  };

  const checkPeriod = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('periods')
      .select('*')
      .eq('class', classNumber.toString())
      .eq('month', selectedMonth)
      .eq('year', selectedYear)
      .maybeSingle();

    if (!error && data) {
      setExistingPeriod(data);
    } else {
      setExistingPeriod(null);
    }
    setLoading(false);
  };

  const handleCreatePeriod = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('periods')
      .insert({
        class: classNumber.toString(),
        month: selectedMonth,
        year: selectedYear
      })
      .select()
      .single();

    if (!error && data) {
      onSelectPeriod(data.id, selectedMonth, selectedYear);
    }
    setLoading(false);
  };

  const handleAddYear = async () => {
    const yearNum = parseInt(newYear);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      alert('Masukkan tahun yang valid (2000-2100)');
      return;
    }

    if (years.includes(yearNum)) {
      alert('Tahun sudah ada dalam daftar');
      return;
    }

    const updatedYears = [...years, yearNum].sort((a, b) => b - a);
    setYears(updatedYears);
    setSelectedYear(yearNum);
    setNewYear('');
    setShowAddYear(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Pilih Periode - Kelas {classNumber}</h2>
          <p className="text-gray-600 mt-1">Pilih bulan dan tahun untuk mengelola kas kelas</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bulan
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {MONTHS.map((month, index) => (
                  <option key={index + 1} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tahun
                </label>
                <button
                  onClick={() => setShowAddYear(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Tambah Tahun
                </button>
              </div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {showAddYear && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  placeholder="Contoh: 2028"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  onClick={handleAddYear}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                >
                  Tambah
                </button>
                <button
                  onClick={() => {
                    setShowAddYear(false);
                    setNewYear('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            {loading ? (
              <div className="text-center text-gray-500 py-4">Memeriksa periode...</div>
            ) : existingPeriod ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">
                      Periode {MONTHS[selectedMonth - 1]} {selectedYear} sudah ada
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Klik tombol di bawah untuk membuka periode ini
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectPeriod(existingPeriod.id, selectedMonth, selectedYear)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                >
                  <Calendar className="w-5 h-5" />
                  Buka Periode {MONTHS[selectedMonth - 1]} {selectedYear}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-900">
                      Periode {MONTHS[selectedMonth - 1]} {selectedYear} belum ada
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Buat periode baru untuk mulai mencatat kas kelas
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCreatePeriod}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Buat Periode Baru
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
