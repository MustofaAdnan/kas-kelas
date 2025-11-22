import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface Student {
  id: string;
  name: string;
}

interface Payment {
  id: string;
  student_id: string;
  week: number;
  paid: boolean;
}

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
}

interface PeriodDetailPageProps {
  periodId: string;
  classNumber: number;
  month: number;
  year: number;
  onBack: () => void;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function PeriodDetailPage({ periodId, classNumber, month, year, onBack }: PeriodDetailPageProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [weeklyAmount, setWeeklyAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [addingExpense, setAddingExpense] = useState(false);

  useEffect(() => {
    loadData();
  }, [periodId, classNumber]);

  const loadData = async () => {
    setLoading(true);

    const [studentsRes, paymentsRes, expensesRes, settingsRes] = await Promise.all([
      supabase.from('students').select('*').eq('class', classNumber.toString()).order('name'),
      supabase.from('payments').select('*').eq('period_id', periodId),
      supabase.from('expenses').select('*').eq('period_id', periodId).order('date', { ascending: false }),
      supabase.from('class_settings').select('weekly_amount').eq('class', classNumber.toString()).maybeSingle()
    ]);

    if (!studentsRes.error && studentsRes.data) {
      setStudents(studentsRes.data);
    }

    if (!paymentsRes.error && paymentsRes.data) {
      setPayments(paymentsRes.data);
    }

    if (!expensesRes.error && expensesRes.data) {
      setExpenses(expensesRes.data);
    }

    if (!settingsRes.error && settingsRes.data) {
      setWeeklyAmount(settingsRes.data.weekly_amount);
    }

    setLoading(false);
  };

  const handlePaymentToggle = async (studentId: string, week: number, currentPaid: boolean) => {
    const existingPayment = payments.find(p => p.student_id === studentId && p.week === week);

    if (existingPayment) {
      const { error } = await supabase
        .from('payments')
        .update({ paid: !currentPaid, updated_at: new Date().toISOString() })
        .eq('id', existingPayment.id);

      if (!error) {
        loadData();
      }
    } else {
      const { error } = await supabase
        .from('payments')
        .insert({
          period_id: periodId,
          student_id: studentId,
          week: week,
          paid: true
        });

      if (!error) {
        loadData();
      }
    }
  };

  const getPaymentStatus = (studentId: string, week: number) => {
    const payment = payments.find(p => p.student_id === studentId && p.week === week);
    return payment?.paid || false;
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingExpense(true);

    try {
      const amount = parseInt(expenseAmount);
      if (isNaN(amount) || amount <= 0) {
        alert('Nominal harus berupa angka positif');
        setAddingExpense(false);
        return;
      }

      const { error } = await supabase
        .from('expenses')
        .insert({
          period_id: periodId,
          date: expenseDate,
          description: expenseDesc,
          amount: amount
        });

      if (!error) {
        setExpenseDate(new Date().toISOString().split('T')[0]);
        setExpenseDesc('');
        setExpenseAmount('');
        loadData();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setAddingExpense(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Yakin ingin menghapus pengeluaran ini?')) return;

    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) {
      loadData();
    }
  };

  const calculateTotals = () => {
    let totalIncome = 0;
    students.forEach(student => {
      for (let week = 1; week <= 4; week++) {
        if (getPaymentStatus(student.id, week)) {
          totalIncome += weeklyAmount;
        }
      }
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const balance = totalIncome - totalExpenses;

    return { totalIncome, totalExpenses, balance };
  };

  const totals = calculateTotals();

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatInputRupiah = (value: string) => {
    const number = value.replace(/\D/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-gray-600">Memuat data...</div>
      </div>
    );
  }

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Kas Kelas {classNumber} - {MONTHS[month - 1]} {year}
          </h2>
          <p className="text-gray-600 mt-1">Kelola pembayaran kas mingguan dan pengeluaran</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Pemasukan</p>
            <p className="text-2xl font-bold text-green-600">{formatRupiah(totals.totalIncome)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Pengeluaran</p>
            <p className="text-2xl font-bold text-red-600">{formatRupiah(totals.totalExpenses)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Saldo Akhir</p>
            <p className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatRupiah(totals.balance)}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Pembayaran Kas Mingguan</h3>
              <p className="text-sm text-gray-600 mt-1">Nominal per minggu: {formatRupiah(weeklyAmount)}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nama Siswa</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Minggu 1</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Minggu 2</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Minggu 3</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Minggu 4</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Belum ada siswa. Tambahkan siswa terlebih dahulu di menu Kelola Siswa.
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => {
                      const paidWeeks = [1, 2, 3, 4].filter(week => getPaymentStatus(student.id, week)).length;
                      const studentTotal = paidWeeks * weeklyAmount;

                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">{student.name}</td>
                          {[1, 2, 3, 4].map((week) => {
                            const isPaid = getPaymentStatus(student.id, week);
                            return (
                              <td key={week} className="px-6 py-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={isPaid}
                                  onChange={() => handlePaymentToggle(student.id, week, isPaid)}
                                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                              </td>
                            );
                          })}
                          <td className="px-6 py-4 text-right text-sm font-medium text-gray-800">
                            {formatRupiah(studentTotal)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Pengeluaran</h3>
            </div>
            <div className="p-6 border-b border-gray-200">
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                    <input
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                    <input
                      type="text"
                      value={expenseDesc}
                      onChange={(e) => setExpenseDesc(e.target.value)}
                      required
                      placeholder="Contoh: Beli alat tulis"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nominal</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                        <input
                          type="text"
                          value={formatInputRupiah(expenseAmount)}
                          onChange={(e) => setExpenseAmount(e.target.value.replace(/\D/g, ''))}
                          required
                          placeholder="0"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={addingExpense}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium disabled:opacity-50 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Tambah
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tanggal</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Deskripsi</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Nominal</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Belum ada pengeluaran
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(expense.date).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">{expense.description}</td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-gray-800">
                          {formatRupiah(expense.amount)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
