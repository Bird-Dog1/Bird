export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: Database["public"]["Enums"]["user_role"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      dealerships: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          city: string;
          state: string;
          zip: string | null;
          phone: string | null;
          website: string | null;
          approved: boolean;
          suspended: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          city: string;
          state: string;
          zip?: string | null;
          phone?: string | null;
          website?: string | null;
          approved?: boolean;
          suspended?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          city?: string;
          state?: string;
          zip?: string | null;
          phone?: string | null;
          website?: string | null;
          approved?: boolean;
          suspended?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      dealer_users: {
        Row: {
          id: string;
          dealership_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          dealership_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          dealership_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dealer_users_dealership_id_fkey";
            columns: ["dealership_id"];
            isOneToOne: false;
            referencedRelation: "dealerships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dealer_users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      vehicles: {
        Row: {
          id: string;
          dealership_id: string;
          vin: string;
          year: number;
          make: string;
          model: string;
          trim: string | null;
          vehicle_type: string | null;
          monthly_price: number;
          deposit: number;
          mileage_limit: number | null;
          city: string;
          state: string;
          rideshare_allowed: boolean;
          insurance_required: boolean;
          minimum_age: number;
          status: Database["public"]["Enums"]["vehicle_status"];
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dealership_id: string;
          vin: string;
          year: number;
          make: string;
          model: string;
          trim?: string | null;
          vehicle_type?: string | null;
          monthly_price: number;
          deposit?: number;
          mileage_limit?: number | null;
          city: string;
          state: string;
          rideshare_allowed?: boolean;
          insurance_required?: boolean;
          minimum_age?: number;
          status?: Database["public"]["Enums"]["vehicle_status"];
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dealership_id?: string;
          vin?: string;
          year?: number;
          make?: string;
          model?: string;
          trim?: string | null;
          vehicle_type?: string | null;
          monthly_price?: number;
          deposit?: number;
          mileage_limit?: number | null;
          city?: string;
          state?: string;
          rideshare_allowed?: boolean;
          insurance_required?: boolean;
          minimum_age?: number;
          status?: Database["public"]["Enums"]["vehicle_status"];
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vehicles_dealership_id_fkey";
            columns: ["dealership_id"];
            isOneToOne: false;
            referencedRelation: "dealerships";
            referencedColumns: ["id"];
          },
        ];
      };
      vehicle_photos: {
        Row: {
          id: string;
          vehicle_id: string;
          photo_url: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          photo_url: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          photo_url?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vehicle_photos_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      rental_applications: {
        Row: {
          id: string;
          vehicle_id: string;
          customer_id: string;
          dealership_id: string;
          status: Database["public"]["Enums"]["application_status"];
          customer_notes: string | null;
          dealer_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          customer_id: string;
          dealership_id?: string;
          status?: Database["public"]["Enums"]["application_status"];
          customer_notes?: string | null;
          dealer_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          customer_id?: string;
          dealership_id?: string;
          status?: Database["public"]["Enums"]["application_status"];
          customer_notes?: string | null;
          dealer_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rental_applications_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rental_applications_dealership_id_fkey";
            columns: ["dealership_id"];
            isOneToOne: false;
            referencedRelation: "dealerships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rental_applications_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      application_documents: {
        Row: {
          id: string;
          application_id: string;
          document_type: Database["public"]["Enums"]["document_type"];
          file_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          document_type: Database["public"]["Enums"]["document_type"];
          file_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          document_type?: Database["public"]["Enums"]["document_type"];
          file_url?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "rental_applications";
            referencedColumns: ["id"];
          },
        ];
      };
      rentals: {
        Row: {
          id: string;
          vehicle_id: string;
          customer_id: string;
          dealership_id: string;
          application_id: string | null;
          start_date: string;
          end_date: string | null;
          monthly_rate: number;
          deposit: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          customer_id: string;
          dealership_id?: string;
          application_id?: string | null;
          start_date: string;
          end_date?: string | null;
          monthly_rate: number;
          deposit?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          customer_id?: string;
          dealership_id?: string;
          application_id?: string | null;
          start_date?: string;
          end_date?: string | null;
          monthly_rate?: number;
          deposit?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rentals_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "rental_applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rentals_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rentals_dealership_id_fkey";
            columns: ["dealership_id"];
            isOneToOne: false;
            referencedRelation: "dealerships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rentals_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      assert_dealer_cannot_toggle_dealership_flags: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      can_access_application: {
        Args: { p_application_id: string };
        Returns: boolean;
      };
      can_access_dealership: {
        Args: { p_dealership_id: string };
        Returns: boolean;
      };
      can_manage_application: {
        Args: { p_application_id: string };
        Returns: boolean;
      };
      can_manage_vehicle: {
        Args: { p_vehicle_id: string };
        Returns: boolean;
      };
      can_view_public_listings: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: Database["public"]["Enums"]["user_role"];
      };
      create_dealership_for_current_dealer: {
        Args: {
          p_name: string;
          p_address: string;
          p_city: string;
          p_state: string;
          p_zip: string;
          p_phone: string;
          p_website: string;
        };
        Returns: string;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_dealership_public: {
        Args: { p_dealership_id: string };
        Returns: boolean;
      };
      is_vehicle_public: {
        Args: { p_vehicle_id: string };
        Returns: boolean;
      };
      storage_path_first_uuid: {
        Args: { p_path: string };
        Returns: string | null;
      };
      user_has_dealership: {
        Args: { p_dealership_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      application_status: "submitted" | "under_review" | "approved" | "denied" | "cancelled";
      document_type: "license" | "insurance" | "other";
      user_role: "customer" | "dealer" | "admin";
      vehicle_status: "available" | "pending" | "rented" | "unavailable";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type PublicSchema = Database["public"];

export type Tables<
  TableName extends keyof PublicSchema["Tables"],
> = PublicSchema["Tables"][TableName]["Row"];

export type TablesInsert<
  TableName extends keyof PublicSchema["Tables"],
> = PublicSchema["Tables"][TableName]["Insert"];

export type TablesUpdate<
  TableName extends keyof PublicSchema["Tables"],
> = PublicSchema["Tables"][TableName]["Update"];

export type Enums<EnumName extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][EnumName];
