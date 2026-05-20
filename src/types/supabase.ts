import { type AppRole } from "@/types/app";

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
          email: string | null;
          full_name: string | null;
          role: AppRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          role?: AppRole;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          role?: AppRole;
        };
      };
      customer_applications: {
        Row: {
          id: string;
          customer_id: string;
          monthly_budget: number | null;
          primary_use: string | null;
          transportation_needs: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          customer_id: string;
          monthly_budget?: number | null;
          primary_use?: string | null;
          transportation_needs?: string | null;
        };
        Update: {
          monthly_budget?: number | null;
          primary_use?: string | null;
          transportation_needs?: string | null;
          status?: string;
        };
      };
      dealer_vehicles: {
        Row: {
          id: string;
          dealer_id: string;
          vin: string;
          year: number;
          make: string;
          model: string;
          inventory_type: string;
          monthly_price: number | null;
          mileage: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          dealer_id: string;
          vin: string;
          year: number;
          make: string;
          model: string;
          inventory_type: string;
          monthly_price?: number | null;
          mileage?: number | null;
        };
        Update: {
          vin?: string;
          year?: number;
          make?: string;
          model?: string;
          inventory_type?: string;
          monthly_price?: number | null;
          mileage?: number | null;
          status?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
