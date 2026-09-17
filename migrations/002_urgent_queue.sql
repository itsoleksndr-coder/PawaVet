CREATE TABLE IF NOT EXISTS urgent_requests (
  id text PRIMARY KEY, clinic_id text NOT NULL, pet_id text NOT NULL,
  submitted_by text NOT NULL REFERENCES users(id), reason text NOT NULL,
  status text NOT NULL DEFAULT 'Requested' CHECK (status IN ('Requested','Accepted','Declined','Completed')),
  priority integer CHECK (priority BETWEEN 1 AND 3), version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(pet_id,clinic_id) REFERENCES pets(id,clinic_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS one_active_urgent_request ON urgent_requests(clinic_id,pet_id) WHERE status IN ('Requested','Accepted');
INSERT INTO schema_migrations(version) VALUES (2) ON CONFLICT DO NOTHING;
