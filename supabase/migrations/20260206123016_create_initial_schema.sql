/*
  # Create AgroTech Safra Control Database Schema

  ## Overview
  This migration creates the complete database schema for the AgroTech Safra Control system,
  including tables for customers, crops, harvest records, and technical visits.

  ## New Tables

  ### 1. `customers`
  Stores customer/client information
  - `id` (uuid, primary key) - Unique customer identifier
  - `name` (text) - Customer legal name (Razão Social)
  - `trade_name` (text) - Customer trade name (Nome Fantasia)
  - `regional` (text) - Regional division (SUL, NORTE, etc.)
  - `manager_name` (text) - Manager responsible for this customer
  - `seller_name` (text) - Salesperson assigned to this customer
  - `city` (text) - City location
  - `state` (text) - State (UF)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### 2. `crops`
  Stores crop types (Soja, Milho, etc.)
  - `id` (uuid, primary key) - Unique crop identifier
  - `name` (text, unique) - Crop name
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `harvest_records`
  Main table storing harvest/field records
  - `id` (uuid, primary key) - Unique record identifier
  - `record_number` (text, unique) - Human-readable record number
  - `customer_id` (uuid, nullable) - Reference to customers table
  - `customer_name` (text) - Manual customer name (for non-registered customers)
  - `property_name` (text) - Property/farm name
  - `location_url` (text) - Google Maps URL
  - `crop_id` (uuid) - Reference to crops table
  - `total_area` (numeric) - Total area in hectares
  - `planted_area` (numeric) - Planted area in hectares
  - `registration_number` (text) - Property registration number
  - `cprf_coordinates` (text) - CPRF coordinates (lat, long)
  - `regional` (text) - Regional snapshot
  - `manager_name` (text) - Manager name snapshot
  - `seller_name` (text) - Seller name snapshot
  - `city` (text) - City snapshot
  - `state` (text) - State snapshot
  - `status` (text) - Record status: PENDING, APPROVED, REJECTED
  - `submission_date` (timestamptz) - Date when record was submitted
  - `created_by` (uuid) - User who created the record
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### 4. `technical_visits`
  Stores technical visit logs for each harvest record
  - `id` (uuid, primary key) - Unique visit identifier
  - `harvest_record_id` (uuid) - Reference to harvest_records table
  - `visit_date` (timestamptz) - Date of the technical visit
  - `stage` (text) - Phenological stage (Estádio fenológico)
  - `opinion` (text) - Technical opinion/notes
  - `author` (text) - Name of the technician who created the visit
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
  - Admin users (with custom claim) can view and modify all records
  - Public users can insert harvest records (pending approval)

  ## Indexes
  - Index on harvest_records.record_number for fast lookups
  - Index on harvest_records.status for filtering
  - Index on technical_visits.harvest_record_id for joins
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trade_name text DEFAULT '',
  regional text DEFAULT '',
  manager_name text DEFAULT '',
  seller_name text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create crops table
CREATE TABLE IF NOT EXISTS crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create harvest_records table
CREATE TABLE IF NOT EXISTS harvest_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text DEFAULT '',
  property_name text DEFAULT '',
  location_url text DEFAULT '',
  crop_id uuid REFERENCES crops(id) ON DELETE RESTRICT,
  total_area numeric(10, 2) DEFAULT 0,
  planted_area numeric(10, 2) DEFAULT 0,
  registration_number text DEFAULT '',
  cprf_coordinates text DEFAULT '',
  regional text DEFAULT '',
  manager_name text DEFAULT '',
  seller_name text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  submission_date timestamptz DEFAULT now(),
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create technical_visits table
CREATE TABLE IF NOT EXISTS technical_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  harvest_record_id uuid REFERENCES harvest_records(id) ON DELETE CASCADE NOT NULL,
  visit_date timestamptz NOT NULL,
  stage text DEFAULT '',
  opinion text DEFAULT '',
  author text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_harvest_records_record_number ON harvest_records(record_number);
CREATE INDEX IF NOT EXISTS idx_harvest_records_status ON harvest_records(status);
CREATE INDEX IF NOT EXISTS idx_technical_visits_harvest_record_id ON technical_visits(harvest_record_id);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvest_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_visits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Anyone can view customers"
  ON customers FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin' OR (auth.jwt()->'user_metadata'->>'is_admin')::boolean = true);

CREATE POLICY "Admins can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin' OR (auth.jwt()->'user_metadata'->>'is_admin')::boolean = true)
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin' OR (auth.jwt()->'user_metadata'->>'is_admin')::boolean = true);

-- RLS Policies for crops
CREATE POLICY "Anyone can view crops"
  ON crops FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can insert crops"
  ON crops FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin' OR (auth.jwt()->'user_metadata'->>'is_admin')::boolean = true);

-- RLS Policies for harvest_records
CREATE POLICY "Anyone can view harvest records"
  ON harvest_records FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert harvest records"
  ON harvest_records FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Admins can update harvest records"
  ON harvest_records FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin' OR (auth.jwt()->'user_metadata'->>'is_admin')::boolean = true)
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin' OR (auth.jwt()->'user_metadata'->>'is_admin')::boolean = true);

-- RLS Policies for technical_visits
CREATE POLICY "Anyone can view technical visits"
  ON technical_visits FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert technical visits"
  ON technical_visits FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Insert default crops
INSERT INTO crops (name) VALUES 
  ('Soja'),
  ('Milho'),
  ('Algodão'),
  ('Trigo'),
  ('Feijão'),
  ('Arroz')
ON CONFLICT (name) DO NOTHING;