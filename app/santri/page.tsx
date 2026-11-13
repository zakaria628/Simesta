
"use client";

import { useState } from "react";

type Santri = {
  id: number;
  nis: string;
  nama: string;
  jk: string;
  kelas: string;
  kamar: string;
  status: string;
};

export default function DataSantri() {
  const [data, setData] = useState<Santri[]>([]);
  const [cari, setCari] = useState("");
  const [formBuka, setFormBuka] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState({
    nis: "",
    nama: "",
    jk: "Laki-laki",
    kelas: "",
    kamar: "",
    status: "Aktif",
  });

  function simpan() {
    if (!form.nis || !form.nama) {
      alert("NIS dan nama santri wajib diisi!");
      return;
    }

    if (editId !== null) {
      setData((lama) =>
        lama.map((item) =>
          item.id === editId ? { ...form, id: editId } : item
        )
      );
    } else {
      setData((lama) => [
        ...lama,
        { ...form, id: Date.now() },
      ]);
    }

    setForm({
      nis: "",
      nama: "",
      jk: "Laki-laki",
      kelas: "",
      kamar: "",
      status: "Aktif",
    });

    setEditId(null);
    setFormBuka(false);
  }

  function edit(item: Santri) {
    setForm({
      nis: item.nis,
      nama: item.nama,
      jk: item.jk,
      kelas: item.kelas,
      kamar: item.kamar,
      status: item.status,
    });
    setEditId(item.id);
    setFormBuka(true);
  }

  function hapus(id: number) {
    if (confirm("Yakin ingin menghapus data santri ini?")) {
      setData((lama) => lama.filter((item) => item.id !== id));
    }
  }

  const hasil = data.filter(
    (item) =>
      item.nama.toLowerCase().includes(cari.toLowerCase()) ||
      item.nis.toLowerCase().includes(cari.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-100 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="text-sm text-emerald-700">
            SIMESTA / Manajemen Pesantren
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Data Santri
          </h1>
          <p className="mt-2 text-slate-500">
            Kelola data seluruh santri pesantren.
          </p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Santri</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">{data.length}</h2>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Santri Aktif</p>
            <h2 className="mt-2 text-3xl font-bold text-emerald-600">
              {data.filter((s) => s.status === "Aktif").length}
            </h2>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Santri Nonaktif</p>
            <h2 className="mt-2 text-3xl font-bold text-red-500">
              {data.filter((s) => s.status === "Nonaktif").length}
            </h2>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">Daftar Santri</h2>

            <button
              onClick={() => {
                setForm({
                  nis: "",
                  nama: "",
                  jk: "Laki-laki",
                  kelas: "",
                  kamar: "",
                  status: "Aktif",
                });
                setEditId(null);
                setFormBuka(true);
              }}
              className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              + Tambah Santri
            </button>
          </div>

          <input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari nama atau NIS santri..."
            className="mb-5 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-500"
          />

          {formBuka && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <h3
  className="mb-4 font-bold text-lg"
  style={{ color: "#111827", opacity: 1 }}
>
  {editId !== null ? "Edit Data Santri" : "Tambah Santri Baru"}
</h3>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <input
                  placeholder="NIS Santri *"
                  value={form.nis}
                  onChange={(e) => setForm({ ...form, nis: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400"
                />

                <input
                  placeholder="Nama Lengkap *"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400"
                />

                <select
                  value={form.jk}
                  onChange={(e) => setForm({ ...form, jk: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400"
                >
                  <option>Laki-laki</option>
                  <option>Perempuan</option>
                </select>

                <input
                  placeholder="Kelas"
                  value={form.kelas}
                  onChange={(e) => setForm({ ...form, kelas: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400"
                />

                <input
                  placeholder="Kamar / Asrama"
                  value={form.kamar}
                  onChange={(e) => setForm({ ...form, kamar: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400"
                />

                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400"
                >
                  <option>Aktif</option>
                  <option>Nonaktif</option>
                </select>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={simpan}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-white"
                >
                  Simpan Data
                </button>

                <button
                  onClick={() => setFormBuka(false)}
                  className="rounded-lg bg-slate-300 px-5 py-2 text-slate-800"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-3">No.</th>
                  <th className="p-3">NIS</th>
                  <th className="p-3">Nama Santri</th>
                  <th className="p-3">Jenis Kelamin</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Kamar</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>

              <tbody style={{ color: "#334155", opacity: 1 }}>
                {hasil.map((item, index) => (
                  <tr 
                  key={item.id} className="border-b">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{item.nis}</td>
                    <td className="p-3 font-medium">{item.nama}</td>
                    <td className="p-3">{item.jk}</td>
                    <td className="p-3">{item.kelas || "-"}</td>
                    <td className="p-3">{item.kamar || "-"}</td><tr
  key={item.id}
  className="border-b"
  style={{ color: "#334155", opacity: 1 }}
>
                    <td className="p-3">{item.status}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => edit(item)}
                          className="text-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => hapus(item.id)}
                          className="text-red-600"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {hasil.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Belum ada data santri. Silakan tambahkan data baru.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </main>
  );
}
