-- ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE lead_status AS ENUM (
  'interested',
  'not_interested',
  'follow_up',
  'converted',
  'lost'
);
CREATE TYPE activity_type AS ENUM ('status_change', 'note_added');

-- USERS
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'user',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- LEADS
CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  business_name   VARCHAR(255),
  contact         VARCHAR(50) NOT NULL,
  email           VARCHAR(255),
  city            VARCHAR(100),
  niche           VARCHAR(100),
  address         TEXT,
  source          VARCHAR(100) DEFAULT 'Unknown',
  status          lead_status NOT NULL DEFAULT 'follow_up',
  assigned_to     UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at     TIMESTAMPTZ,
  is_hot_lead     BOOLEAN NOT NULL DEFAULT false,
  upload_batch_id UUID,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- LEAD ACTIVITIES
CREATE TABLE lead_activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id       UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  comment       TEXT NOT NULL,
  old_status    VARCHAR(50),
  new_status    VARCHAR(50),
  updated_by    UUID NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- CSV UPLOAD BATCHES
CREATE TABLE csv_uploads (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by    UUID NOT NULL REFERENCES users(id),
  filename       VARCHAR(255) NOT NULL,
  total_rows     INTEGER NOT NULL DEFAULT 0,
  valid_rows     INTEGER NOT NULL DEFAULT 0,
  duplicate_rows INTEGER NOT NULL DEFAULT 0,
  status         VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- LEAD ASSIGNMENT AUDIT LOG
CREATE TABLE lead_assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id       UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  assigned_from UUID REFERENCES users(id),
  assigned_to   UUID NOT NULL REFERENCES users(id),
  assigned_by   UUID NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- INDEXES
CREATE INDEX ON leads(status);
CREATE INDEX ON leads(assigned_to);
CREATE INDEX ON leads(created_at);
CREATE INDEX ON leads(updated_at);
CREATE INDEX ON lead_activities(lead_id);
CREATE INDEX ON lead_activities(created_at);
CREATE INDEX ON lead_assignments(lead_id);
