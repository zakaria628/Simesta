export type Database = {
  public: {
    Tables: {
      pengurus: {
        Row: {
          id: string;
          kode_pengurus: string;
          nama_lengkap: string;
          nik: string;
          jenis_kelamin: "Laki-laki" | "Perempuan";
          tempat_lahir: string;
          tanggal_lahir: string;
          alamat: string;
          nomor_hp: string;
          foto_path: string | null;
          jabatan: string;
          bagian: string;
          tanggal_mulai: string;
          status: "Aktif" | "Nonaktif";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          kode_pengurus?: string;
          nama_lengkap: string;
          nik: string;
          jenis_kelamin: "Laki-laki" | "Perempuan";
          tempat_lahir: string;
          tanggal_lahir: string;
          alamat: string;
          nomor_hp: string;
          foto_path?: string | null;
          jabatan: string;
          bagian: string;
          tanggal_mulai: string;
          status: "Aktif" | "Nonaktif";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          kode_pengurus?: string;
          nama_lengkap?: string;
          nik?: string;
          jenis_kelamin?: "Laki-laki" | "Perempuan";
          tempat_lahir?: string;
          tanggal_lahir?: string;
          alamat?: string;
          nomor_hp?: string;
          foto_path?: string | null;
          jabatan?: string;
          bagian?: string;
          tanggal_mulai?: string;
          status?: "Aktif" | "Nonaktif";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      santri: {
        Row: {
          id: number;
          nis: string;
          nama: string;
          jk: string;
          kelas: string;
          kamar: string;
          status: string;
          created_at?: string;
        };
        Insert: {
          id?: number;
          nis: string;
          nama: string;
          jk: string;
          kelas: string;
          kamar: string;
          status: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          nis?: string;
          nama?: string;
          jk?: string;
          kelas?: string;
          kamar?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};