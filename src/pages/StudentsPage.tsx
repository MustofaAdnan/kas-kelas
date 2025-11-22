import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Plus, Pencil, Trash2, X } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  class: string;
}

interface StudentsPageProps {
  classNumber: number;
  onBack: () => void;
}

export function StudentsPage({ classNumber, onBack }: StudentsPageProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formName, setFormName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [classNumber]);

  const loadStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class', classNumber.toString())
      .order('name');

    if (!error && data) {
      setStudents(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingStudent) {
        const { error } = await supabase
          .from('students')
          .update({ name: formName })
          .eq('id', editingStudent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('students')
          .insert({ name: formName, class: classNumber.toString() });

        if (error) throw error;
      }

      setFormName('');
      setEditingStudent(null);
      setShowForm(false);
      loadStudents();
    } catch (error) {
      console.error('Error saving student:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormName(student.name);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus siswa ini?')) return;

    const { error } = await supabase.from('students').delete().eq('id', id);

    if (!error) {
      loadStudents();
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingStudent(null);
    setFormName('');
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Manajemen Siswa Kelas {classNumber}</h2>
            <p className="text-gray-600 mt-1">Kelola data siswa kelas {classNumber}</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Tambah Siswa
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingStudent ? 'Edit Siswa' : 'Tambah Siswa Baru'}
                </h3>
                <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Siswa
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Masukkan nama siswa"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Memuat data...</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Belum ada siswa. Tambahkan siswa baru untuk memulai.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">No</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nama Siswa</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">{student.name}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
