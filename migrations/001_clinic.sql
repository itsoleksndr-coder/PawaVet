CREATE TABLE IF NOT EXISTS schema_migrations (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS clinics (id text PRIMARY KEY, data jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY, email text NOT NULL UNIQUE, password_hash text NOT NULL, data jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS memberships (
  user_id text NOT NULL REFERENCES users(id), clinic_id text NOT NULL REFERENCES clinics(id),
  role text NOT NULL CHECK (role IN ('CLINIC_ADMIN','VETERINARIAN','TECHNICIAN','RECEPTIONIST','PET_OWNER')),
  status text NOT NULL CHECK (status IN ('Active','Suspended','Pending_Invite')),
  PRIMARY KEY(user_id, clinic_id)
);
CREATE TABLE IF NOT EXISTS sessions (
  id text PRIMARY KEY, token_hash text NOT NULL UNIQUE, user_id text NOT NULL,
  clinic_id text NOT NULL, expires_at timestamptz NOT NULL, locked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (user_id, clinic_id) REFERENCES memberships(user_id, clinic_id)
);
CREATE TABLE IF NOT EXISTS owners (
  id text NOT NULL, clinic_id text NOT NULL REFERENCES clinics(id), user_id text REFERENCES users(id), data jsonb NOT NULL,
  PRIMARY KEY (id, clinic_id), UNIQUE(user_id, clinic_id)
);
CREATE TABLE IF NOT EXISTS pets (
  id text NOT NULL, clinic_id text NOT NULL, owner_id text NOT NULL, data jsonb NOT NULL,
  PRIMARY KEY(id, clinic_id), FOREIGN KEY(owner_id, clinic_id) REFERENCES owners(id, clinic_id)
);
CREATE TABLE IF NOT EXISTS audit_events (
  id text PRIMARY KEY, clinic_id text NOT NULL REFERENCES clinics(id), data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS login_attempts (key text PRIMARY KEY, count integer NOT NULL, reset_at timestamptz NOT NULL);
INSERT INTO schema_migrations(version) VALUES (1) ON CONFLICT DO NOTHING;
