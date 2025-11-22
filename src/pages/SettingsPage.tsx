import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save } from 'lucide-react';

interface ClassSetting {
  id: string;
  class: string;
  weekly_amount: number;
}

interface SettingsPageProps {
  classNumber: number;
  onBack: () => void;
}

export function SettingsPage({ classNumber, onBack }: SettingsPageProps) {
  const [setting, setSetting] = useState<ClassSetting | null>(null);
  const [weeklyAmount, setWeeklyAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSetting();
  }, [classNumber]);

  const loadSetting = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('class_settings')
      .select('*')
      .eq('class', classNumber.toString())
      .maybeSingle();

    if (!error && data) {
      setSetting(data);
      setWeeklyAmount(data.weekly_amount.toString());
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const amount = parseInt(weeklyAmount);
      if (isNaN(amount) || amount < 0) {
        setMessage('Nominal harus berupa angka positif');
        setSaving(false);
        return;
      }

      if (setting) {
        const { error } = await supabase
          .from('class_settings')
          .update({ weekly_amount: amount, updated_at: new Date().toISOString() })
          .eq('id', setting.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('class_settings')
          .insert({ class: classNumber.toString(), weekly_amount: amount });

        if (error) throw error;
      }

      setMessage('Pengaturan berhasil disimpan!');
      loadSetting();
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const formatRupiah = (value: string) => {
    const number = value.replace(/\D/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setWeeklyAmount(value);
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Pengaturan Kas Kelas {classNumber}</h2>
          <p className="text-gray-600 mt-1">Atur nominal kas mingguan untuk kelas {classNumber}</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
            Memuat pengaturan...
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nominal Kas Mingguan
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={formatRupiah(weeklyAmount)}
                    onChange={handleAmountChange}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg font-medium"
                    placeholder="0"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Nominal ini akan digunakan untuk menghitung pemasukan berdasarkan jumlah minggu yang dibayar
                </p>
              </div>

              {message && (
                <div
                  className={`px-4 py-3 rounded-lg text-sm ${
                    message.includes('berhasil')
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Informasi</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Perubahan nominal akan berlaku untuk periode-periode selanjutnya</li>
                <li>• Data periode yang sudah ada akan tetap menggunakan nominal lama</li>
                <li>• Pastikan nominal sudah sesuai sebelum membuat periode baru</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
