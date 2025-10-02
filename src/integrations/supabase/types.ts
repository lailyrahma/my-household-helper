export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      anggota_rumah: {
        Row: {
          id_anggota: number
          id_pengguna: number
          id_rumah: number
          peran: Database["public"]["Enums"]["peran_enum"]
          status: Database["public"]["Enums"]["anggota_status_enum"]
          tanggal_dibuat: string
          tanggal_dihapus: string | null
          tanggal_diupdate: string | null
        }
        Insert: {
          id_anggota?: never
          id_pengguna: number
          id_rumah: number
          peran: Database["public"]["Enums"]["peran_enum"]
          status: Database["public"]["Enums"]["anggota_status_enum"]
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
        }
        Update: {
          id_anggota?: never
          id_pengguna?: number
          id_rumah?: number
          peran?: Database["public"]["Enums"]["peran_enum"]
          status?: Database["public"]["Enums"]["anggota_status_enum"]
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anggota_rumah_id_pengguna_fkey"
            columns: ["id_pengguna"]
            isOneToOne: false
            referencedRelation: "pengguna"
            referencedColumns: ["id_pengguna"]
          },
          {
            foreignKeyName: "anggota_rumah_id_rumah_fkey"
            columns: ["id_rumah"]
            isOneToOne: false
            referencedRelation: "rumah"
            referencedColumns: ["id_rumah"]
          },
        ]
      }
      barang: {
        Row: {
          ambang_batas: number
          estimasi_habis: string | null
          id_barang: number
          id_katalog: number
          id_pengguna: number
          id_rumah: number
          nama_barang: string
          satuan: string
          stok: number
          tanggal_beli: string | null
          tanggal_dibuat: string
          tanggal_dihapus: string | null
          tanggal_diupdate: string | null
          tanggal_kedaluwarsa: string | null
        }
        Insert: {
          ambang_batas?: number
          estimasi_habis?: string | null
          id_barang?: never
          id_katalog: number
          id_pengguna: number
          id_rumah: number
          nama_barang: string
          satuan: string
          stok?: number
          tanggal_beli?: string | null
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
          tanggal_kedaluwarsa?: string | null
        }
        Update: {
          ambang_batas?: number
          estimasi_habis?: string | null
          id_barang?: never
          id_katalog?: number
          id_pengguna?: number
          id_rumah?: number
          nama_barang?: string
          satuan?: string
          stok?: number
          tanggal_beli?: string | null
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
          tanggal_kedaluwarsa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "barang_id_katalog_fkey"
            columns: ["id_katalog"]
            isOneToOne: false
            referencedRelation: "katalog_produk"
            referencedColumns: ["id_katalog"]
          },
          {
            foreignKeyName: "barang_id_pengguna_fkey"
            columns: ["id_pengguna"]
            isOneToOne: false
            referencedRelation: "pengguna"
            referencedColumns: ["id_pengguna"]
          },
          {
            foreignKeyName: "barang_id_rumah_fkey"
            columns: ["id_rumah"]
            isOneToOne: false
            referencedRelation: "rumah"
            referencedColumns: ["id_rumah"]
          },
        ]
      }
      daftar_belanja: {
        Row: {
          id_daftar: number
          id_rumah: number
          status: Database["public"]["Enums"]["daftar_status_enum"]
          tanggal_dibuat: string
          tanggal_dihapus: string | null
          tanggal_diupdate: string | null
          tanggal_rencana: string | null
          tanggal_selesai: string | null
        }
        Insert: {
          id_daftar?: never
          id_rumah: number
          status: Database["public"]["Enums"]["daftar_status_enum"]
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
          tanggal_rencana?: string | null
          tanggal_selesai?: string | null
        }
        Update: {
          id_daftar?: never
          id_rumah?: number
          status?: Database["public"]["Enums"]["daftar_status_enum"]
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
          tanggal_rencana?: string | null
          tanggal_selesai?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daftar_belanja_id_rumah_fkey"
            columns: ["id_rumah"]
            isOneToOne: false
            referencedRelation: "rumah"
            referencedColumns: ["id_rumah"]
          },
        ]
      }
      katalog_produk: {
        Row: {
          gambar_url: string | null
          id_katalog: number
          id_kategori: number
          nama_produk: string
          satuan: string
          tanggal_dibuat: string
          tanggal_dihapus: string | null
          tanggal_diupdate: string | null
        }
        Insert: {
          gambar_url?: string | null
          id_katalog?: never
          id_kategori: number
          nama_produk: string
          satuan: string
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
        }
        Update: {
          gambar_url?: string | null
          id_katalog?: never
          id_kategori?: number
          nama_produk?: string
          satuan?: string
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "katalog_produk_id_kategori_fkey"
            columns: ["id_kategori"]
            isOneToOne: false
            referencedRelation: "kategori_produk"
            referencedColumns: ["id_kategori"]
          },
        ]
      }
      kategori_produk: {
        Row: {
          id_kategori: number
          nama_kategori: string
        }
        Insert: {
          id_kategori?: never
          nama_kategori: string
        }
        Update: {
          id_kategori?: never
          nama_kategori?: string
        }
        Relationships: []
      }
      langganan: {
        Row: {
          id_langganan: number
          id_pengguna: number
          jenis_paket: Database["public"]["Enums"]["paket_enum"]
          metode_bayar: string
          referensi_pembayaran: string | null
          status: Database["public"]["Enums"]["langganan_status_enum"]
          tanggal_berakhir: string
          tanggal_dibuat: string
          tanggal_dihapus: string | null
          tanggal_diupdate: string | null
          tanggal_mulai: string
        }
        Insert: {
          id_langganan?: never
          id_pengguna: number
          jenis_paket: Database["public"]["Enums"]["paket_enum"]
          metode_bayar: string
          referensi_pembayaran?: string | null
          status: Database["public"]["Enums"]["langganan_status_enum"]
          tanggal_berakhir: string
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
          tanggal_mulai: string
        }
        Update: {
          id_langganan?: never
          id_pengguna?: number
          jenis_paket?: Database["public"]["Enums"]["paket_enum"]
          metode_bayar?: string
          referensi_pembayaran?: string | null
          status?: Database["public"]["Enums"]["langganan_status_enum"]
          tanggal_berakhir?: string
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
          tanggal_mulai?: string
        }
        Relationships: [
          {
            foreignKeyName: "langganan_id_pengguna_fkey"
            columns: ["id_pengguna"]
            isOneToOne: false
            referencedRelation: "pengguna"
            referencedColumns: ["id_pengguna"]
          },
        ]
      }
      pengguna: {
        Row: {
          email_pengguna: string
          id_pengguna: number
          kata_sandi: string
          nama_pengguna: string
          tanggal_dibuat: string
          tanggal_dihapus: string | null
          tanggal_diupdate: string | null
        }
        Insert: {
          email_pengguna: string
          id_pengguna?: never
          kata_sandi: string
          nama_pengguna: string
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
        }
        Update: {
          email_pengguna?: string
          id_pengguna?: never
          kata_sandi?: string
          nama_pengguna?: string
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
        }
        Relationships: []
      }
      promo: {
        Row: {
          deskripsi: string | null
          id_barang: number
          id_promo: number
          jenis_promo: string
          sumber: string | null
          tanggal_berakhir: string
          tanggal_dibuat: string
          tanggal_dihapus: string | null
          tanggal_diupdate: string | null
          tanggal_mulai: string
          tautan: string | null
        }
        Insert: {
          deskripsi?: string | null
          id_barang: number
          id_promo?: never
          jenis_promo: string
          sumber?: string | null
          tanggal_berakhir: string
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
          tanggal_mulai: string
          tautan?: string | null
        }
        Update: {
          deskripsi?: string | null
          id_barang?: number
          id_promo?: never
          jenis_promo?: string
          sumber?: string | null
          tanggal_berakhir?: string
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
          tanggal_mulai?: string
          tautan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_id_barang_fkey"
            columns: ["id_barang"]
            isOneToOne: false
            referencedRelation: "barang"
            referencedColumns: ["id_barang"]
          },
        ]
      }
      rekomendasi_belanja: {
        Row: {
          id_barang: number
          id_daftar: number
          id_rekomendasi: number
          jumlah_disarankan: number
          metode: Database["public"]["Enums"]["metode_enum"]
          status: Database["public"]["Enums"]["rekom_status_enum"]
          tanggal_dibuat: string
          tanggal_dihapus: string | null
          tanggal_diupdate: string | null
          tautan_belanja: string | null
        }
        Insert: {
          id_barang: number
          id_daftar: number
          id_rekomendasi?: never
          jumlah_disarankan: number
          metode: Database["public"]["Enums"]["metode_enum"]
          status: Database["public"]["Enums"]["rekom_status_enum"]
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
          tautan_belanja?: string | null
        }
        Update: {
          id_barang?: number
          id_daftar?: number
          id_rekomendasi?: never
          jumlah_disarankan?: number
          metode?: Database["public"]["Enums"]["metode_enum"]
          status?: Database["public"]["Enums"]["rekom_status_enum"]
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
          tautan_belanja?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rekomendasi_belanja_id_barang_fkey"
            columns: ["id_barang"]
            isOneToOne: false
            referencedRelation: "barang"
            referencedColumns: ["id_barang"]
          },
          {
            foreignKeyName: "rekomendasi_belanja_id_daftar_fkey"
            columns: ["id_daftar"]
            isOneToOne: false
            referencedRelation: "daftar_belanja"
            referencedColumns: ["id_daftar"]
          },
        ]
      }
      riwayat_stok: {
        Row: {
          id_barang: number
          id_pengguna: number
          id_riwayat: number
          jenis: Database["public"]["Enums"]["riwayat_jenis_enum"]
          jumlah_perubahan: number
          sumber_perubahan: Database["public"]["Enums"]["sumber_perubahan_enum"]
          tanggal_dibuat: string
          tanggal_dihapus: string | null
          tanggal_diupdate: string | null
        }
        Insert: {
          id_barang: number
          id_pengguna: number
          id_riwayat?: never
          jenis: Database["public"]["Enums"]["riwayat_jenis_enum"]
          jumlah_perubahan: number
          sumber_perubahan: Database["public"]["Enums"]["sumber_perubahan_enum"]
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
        }
        Update: {
          id_barang?: number
          id_pengguna?: number
          id_riwayat?: never
          jenis?: Database["public"]["Enums"]["riwayat_jenis_enum"]
          jumlah_perubahan?: number
          sumber_perubahan?: Database["public"]["Enums"]["sumber_perubahan_enum"]
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "riwayat_stok_id_barang_fkey"
            columns: ["id_barang"]
            isOneToOne: false
            referencedRelation: "barang"
            referencedColumns: ["id_barang"]
          },
          {
            foreignKeyName: "riwayat_stok_id_pengguna_fkey"
            columns: ["id_pengguna"]
            isOneToOne: false
            referencedRelation: "pengguna"
            referencedColumns: ["id_pengguna"]
          },
        ]
      }
      rumah: {
        Row: {
          id_pengguna: number
          id_rumah: number
          nama_rumah: string
          tanggal_dibuat: string
          tanggal_dihapus: string | null
          tanggal_diupdate: string | null
        }
        Insert: {
          id_pengguna: number
          id_rumah?: never
          nama_rumah: string
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
        }
        Update: {
          id_pengguna?: number
          id_rumah?: never
          nama_rumah?: string
          tanggal_dibuat?: string
          tanggal_dihapus?: string | null
          tanggal_diupdate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rumah_id_pengguna_fkey"
            columns: ["id_pengguna"]
            isOneToOne: false
            referencedRelation: "pengguna"
            referencedColumns: ["id_pengguna"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_house_admin: {
        Args: { house_id: number; user_id: number }
        Returns: boolean
      }
      is_house_member: {
        Args: { house_id: number; user_id: number }
        Returns: boolean
      }
    }
    Enums: {
      anggota_status_enum: "aktif" | "nonaktif"
      daftar_status_enum: "draft" | "proses" | "selesai"
      langganan_status_enum: "aktif" | "kadaluarsa" | "batal"
      metode_enum: "online" | "offline"
      paket_enum: "gratis" | "premium"
      peran_enum: "admin" | "member"
      rekom_status_enum: "belum" | "dibeli"
      riwayat_jenis_enum: "+" | "-"
      sumber_perubahan_enum: "pembelian" | "konsumsi" | "kadaluarsa" | "promo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      anggota_status_enum: ["aktif", "nonaktif"],
      daftar_status_enum: ["draft", "proses", "selesai"],
      langganan_status_enum: ["aktif", "kadaluarsa", "batal"],
      metode_enum: ["online", "offline"],
      paket_enum: ["gratis", "premium"],
      peran_enum: ["admin", "member"],
      rekom_status_enum: ["belum", "dibeli"],
      riwayat_jenis_enum: ["+", "-"],
      sumber_perubahan_enum: ["pembelian", "konsumsi", "kadaluarsa", "promo"],
    },
  },
} as const
