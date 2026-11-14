"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type DashboardStats = {
  totalSantri: number;
  santriAktif: number;
  santriPutra: number;
  santriPutri: number;
  totalPengurus: number;
  pengurusAktif: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSantri: 0,
    santriAktif: 0,
    santriPutra: 0,
    santriPutri: 0,
    totalPengurus: 0,
    pengurusAktif: 0,
  });
  const [loading, setLoading] = useState(true);
  const [tanggalHariIni, setTanggalHariIni] = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const [santriRes, pengurusRes] = await Promise.all([
        supabase.from("santri").select("jk, status"),
        supabase.from("pengurus").select("status"),
      ]);

      const santriData = santriRes.data ?? [];
      const pengurusData = pengurusRes.data ?? [];

      const totalSantri = santriData.length;
      const santriAktif = santriData.filter(
        (s) => s.status?.toLowerCase() === "aktif"
      ).length;
      const santriPutra = santriData.filter(
        (s) =>
          s.jk?.toLowerCase() === "l" ||
          s.jk?.toLowerCase() === "laki-laki" ||
          s.jk?.toLowerCase() === "putra"
      ).length;
      const santriPutri = santriData.filter(
        (s) =>
          s.jk?.toLowerCase() === "p" ||
          s.jk?.toLowerCase() === "perempuan" ||
          s.jk?.toLowerCase() === "putri"
      ).length;

      const totalPengurus = pengurusData.length;
      const pengurusAktif = pengurusData.filter(
        (p) => p.status?.toLowerCase() === "aktif"
      ).length;

      setStats({
        totalSantri,
        santriAktif,
        santriPutra,
        santriPutri,
        totalPengurus,
        pengurusAktif,
      });
    } catch (error) {
      console.error("Gagal memuat statistik dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTanggalHariIni(
      new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date())
    );
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header / Banner Utama */}
      <header className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white shadow-md">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur-sm">
                SIMESTA • Sistem Informasi Manajemen Pesantren
              </span>
              <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                Dashboard Utama Pesantren
              </h1>
              <p className="mt-1 text-sm text-emerald-100">
                {tanggalHariIni || "Memuat tanggal..."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={fetchStats}
                disabled={loading}
                className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-50"
              >
                {loading ? "Memuat..." : "↻ Refresh Data"}
              </button>
              <Link
                href="/santri"
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
              >
                + Kelola Santri
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        {/* Kartu Statistik Real-Time */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              Ringkasan Data Real-Time
            </h2>
            <span className="text-xs text-slate-500">
              Tersinkronisasi dengan Database
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Santri */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total Santri</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading ? "..." : stats.totalSantri}
              </p>
              <p className="mt-2 text-xs font-medium text-emerald-600">
                {loading ? "Menghitung..." : `${stats.santriAktif} Santri Aktif`}
              </p>
            </div>

            {/* Total Pengurus */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total Pengurus & Ustadz
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading ? "..." : stats.totalPengurus}
              </p>
              <p className="mt-2 text-xs font-medium text-teal-600">
                {loading
                  ? "Menghitung..."
                  : `${stats.pengurusAktif} Pengurus Aktif`}
              </p>
            </div>

            {/* Santri Putra */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Santri Putra</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {loading ? "..." : stats.santriPutra}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Asrama Putra (Banin)
              </p>
            </div>

            {/* Santri Putri */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Santri Putri</p>
              <p className="mt-2 text-3xl font-bold text-rose-600">
                {loading ? "..." : stats.santriPutri}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Asrama Putri (Banat)
              </p>
            </div>
          </div>
        </section>

        {/* Menu Modul Utama */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-slate-800">
            Modul Manajemen Pesantren
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* Modul Santri - Aktif */}
            <Link
              href="/santri"
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-xl">
                  🎓
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  Aktif
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-emerald-700">
                Data Induk Santri
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Kelola NIS, biodata lengkap, penempatan kelas, kamar, dan status
                keaktifan santri.
              </p>
              <p className="mt-4 text-xs font-semibold text-emerald-600">
                Buka Modul Santri →
              </p>
            </Link>

            {/* Modul Pengurus - Aktif */}
            <Link
              href="/pengurus"
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-100 text-xl">
                  👔
                </span>
                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                  Aktif
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-teal-700">
                Data Pengurus & Ustadz
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Kelola struktur kepengurusan, jabatan, bagian tugas, foto profil,
                dan kontak pengurus.
              </p>
              <p className="mt-4 text-xs font-semibold text-teal-600">
                Buka Modul Pengurus →
              </p>
            </Link>

            {/* Modul Asrama & Kamar - Segera Hadir */}
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-100/70 p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-200 text-xl">
                  🏠
                </span>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  Tahap Berikutnya
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-700">
                Asrama & Kapasitas Kamar
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Monitoring kuota kamar, wali kamar, dan distribusi penghuni
                asrama putra maupun putri.
              </p>
            </div>

            {/* Modul Kelas & Diniyah - Segera Hadir */}
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-100/70 p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-200 text-xl">
                  📚
                </span>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  Tahap Berikutnya
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-700">
                Kelas & Madrasah Diniyah
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Pengaturan jenjang kelas, wali kelas, jadwal pelajaran, dan
                rekap absensi santri.
              </p>
            </div>

            {/* Modul Perizinan - Segera Hadir */}
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-100/70 p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-200 text-xl">
                  📝
                </span>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  Tahap Berikutnya
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-700">
                Perizinan & Pulang Santri
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Pencatatan izin keluar kompleks, pulang liburan, dan pantauan
                ketepatan waktu kembali.
              </p>
            </div>

            {/* Modul Keuangan / SPP - Segera Hadir */}
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-100/70 p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-200 text-xl">
                  💳
                </span>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  Tahap Berikutnya
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-700">
                Administrasi & Syahriah (SPP)
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Rekap pembayaran bulanan santri, tunggakan, dan laporan kas
                administrasi pesantren.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}