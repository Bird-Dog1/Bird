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
          vehicle_id: string | null;
          monthly_budget: number | null;
          primary_use: string | null;
          transportation_needs: string | null;
          driver_license_path: string | null;
          insurance_document_path: string | null;
          applicant_phone: string | null;
          applicant_city: string | null;
          applicant_state: string | null;
          desired_start_date: string | null;
          employment_status: string | null;
          notes: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          vehicle_id?: string | null;
          monthly_budget?: number | null;
          primary_use?: string | null;
          transportation_needs?: string | null;
          driver_license_path?: string | null;
          insurance_document_path?: string | null;
          applicant_phone?: string | null;
          applicant_city?: string | null;
          applicant_state?: string | null;
          desired_start_date?: string | null;
          employment_status?: string | null;
          notes?: string | null;
        };
        Update: {
          vehicle_id?: string | null;
          monthly_budget?: number | null;
          primary_use?: string | null;
          transportation_needs?: string | null;
          driver_license_path?: string | null;
          insurance_document_path?: string | null;
          applicant_phone?: string | null;
          applicant_city?: string | null;
          applicant_state?: string | null;
          desired_start_date?: string | null;
          employment_status?: string | null;
          notes?: string | null;
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
          city: string | null;
          state: string | null;
          vehicle_type: string | null;
          photo_urls: string[];
          deposit_amount: number | null;
          mileage_limit: number | null;
          insurance_required: boolean;
          minimum_age: number;
          rideshare_allowed: boolean;
          dealership_name: string | null;
          dealership_phone: string | null;
          dealership_email: string | null;
          description: string | null;
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
          city?: string | null;
          state?: string | null;
          vehicle_type?: string | null;
          photo_urls?: string[];
          deposit_amount?: number | null;
          mileage_limit?: number | null;
          insurance_required?: boolean;
          minimum_age?: number;
          rideshare_allowed?: boolean;
          dealership_name?: string | null;
          dealership_phone?: string | null;
          dealership_email?: string | null;
          description?: string | null;
          status?: string;
        };
        Update: {
          vin?: string;
          year?: number;
          make?: string;
          model?: string;
          inventory_type?: string;
          monthly_price?: number | null;
          mileage?: number | null;
          city?: string | null;
          state?: string | null;
          vehicle_type?: string | null;
          photo_urls?: string[];
          deposit_amount?: number | null;
          mileage_limit?: number | null;
          insurance_required?: boolean;
          minimum_age?: number;
          rideshare_allowed?: boolean;
          dealership_name?: string | null;
          dealership_phone?: string | null;
          dealership_email?: string | null;
          description?: string | null;
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
