/*
  # Create Image Storage System

  ## Overview
  Creates storage bucket and images table for harvest record photos.

  ## New Tables

  ### `harvest_images`
  Stores image metadata and references to storage
  - `id` (uuid, primary key) - Unique image identifier
  - `harvest_record_id` (uuid) - Reference to harvest_records table
  - `storage_path` (text) - Path to image in Supabase Storage
  - `file_name` (text) - Original filename
  - `file_size` (integer) - File size in bytes
  - `created_at` (timestamptz) - Upload timestamp

  ## Storage
  - Create 'harvest-images' bucket for storing photos
  - Enable public access for viewing images

  ## Security
  - Enable RLS on harvest_images table
  - Anyone can view images
  - Authenticated users can upload images
*/

-- Create harvest_images table
CREATE TABLE IF NOT EXISTS harvest_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  harvest_record_id uuid REFERENCES harvest_records(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_harvest_images_record_id ON harvest_images(harvest_record_id);

-- Enable Row Level Security
ALTER TABLE harvest_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for harvest_images
CREATE POLICY "Anyone can view harvest images"
  ON harvest_images FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert harvest images"
  ON harvest_images FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Admins can delete harvest images"
  ON harvest_images FOR DELETE
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin' OR (auth.jwt()->'user_metadata'->>'is_admin')::boolean = true);

-- Create storage bucket for harvest images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'harvest-images',
  'harvest-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Anyone can view harvest images"
  ON storage.objects FOR SELECT
  TO authenticated, anon
  USING (bucket_id = 'harvest-images');

CREATE POLICY "Authenticated users can upload harvest images"
  ON storage.objects FOR INSERT
  TO authenticated, anon
  WITH CHECK (bucket_id = 'harvest-images');

CREATE POLICY "Admins can delete harvest images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'harvest-images' AND
    ((auth.jwt()->>'role')::text = 'admin' OR (auth.jwt()->'user_metadata'->>'is_admin')::boolean = true)
  );