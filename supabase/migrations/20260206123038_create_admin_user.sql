/*
  # Create Admin User

  ## Overview
  Creates an admin user account with email/password authentication.
  
  ## Admin Credentials
  - Email: admin@agrotech.com
  - Password: Admin@2024
  
  ## Security Notes
  - Admin user has is_admin flag in user_metadata
  - Password is securely hashed using Supabase Auth
  - User must change password on first login (recommended)

  ## Important
  This uses Supabase's auth schema to create the user properly
*/

-- Create admin user using Supabase Auth
-- Note: In production, this should be done through the Supabase Dashboard or Auth API
-- This is a simplified approach for development

DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@agrotech.com';

  -- Only create if doesn't exist
  IF admin_user_id IS NULL THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@agrotech.com',
      crypt('Admin@2024', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"is_admin": true, "name": "Administrador"}',
      now(),
      now(),
      '',
      ''
    )
    RETURNING id INTO admin_user_id;

    -- Insert into auth.identities
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      admin_user_id,
      admin_user_id::text,
      jsonb_build_object('sub', admin_user_id::text, 'email', 'admin@agrotech.com'),
      'email',
      now(),
      now(),
      now()
    );

    RAISE NOTICE 'Admin user created successfully with email: admin@agrotech.com';
  ELSE
    RAISE NOTICE 'Admin user already exists';
  END IF;
END $$;