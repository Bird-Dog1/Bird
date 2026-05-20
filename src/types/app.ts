export const appRoles = ["customer", "dealer", "admin"] as const;

export type AppRole = (typeof appRoles)[number];

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
  created_at: string;
  updated_at: string;
};

export type DealerVehicle = {
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

export type CustomerApplication = {
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
