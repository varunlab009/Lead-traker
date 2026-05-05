-- Run this AFTER schema.sql
-- All passwords: admin123

INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin User',   'admin@leadtrack.com',  '$2a$10$iwkBoUdOJfEANHxcqmgcn.AIb3st682pWLaxwD8vNViesbmEkv3im', 'admin'),
  ('Priya Sharma', 'priya@leadtrack.com',  '$2a$10$iwkBoUdOJfEANHxcqmgcn.AIb3st682pWLaxwD8vNViesbmEkv3im', 'user'),
  ('Rahul Singh',  'rahul@leadtrack.com',  '$2a$10$iwkBoUdOJfEANHxcqmgcn.AIb3st682pWLaxwD8vNViesbmEkv3im', 'user');

INSERT INTO leads (name, contact, email, source, status, assigned_to) VALUES
  ('Amit Verma',   '9876543210', 'amit@example.com',  'Website',  'interested',    (SELECT id FROM users WHERE email='priya@leadtrack.com')),
  ('Sneha Joshi',  '9876543211', 'sneha@example.com', 'Referral', 'follow_up',     (SELECT id FROM users WHERE email='priya@leadtrack.com')),
  ('Raj Malhotra', '9876543212', 'raj@example.com',   'Ad',       'not_interested',(SELECT id FROM users WHERE email='rahul@leadtrack.com')),
  ('Kiran Nair',   '9876543213', 'kiran@example.com', 'Website',  'converted',     (SELECT id FROM users WHERE email='rahul@leadtrack.com')),
  ('Deepa Iyer',   '9876543214', 'deepa@example.com', 'Referral', 'follow_up',     (SELECT id FROM users WHERE email='priya@leadtrack.com')),
  ('Vikram Patel', '9876543215', 'vikram@example.com','Ad',       'interested',    (SELECT id FROM users WHERE email='rahul@leadtrack.com')),
  ('Anita Das',    '9876543216', 'anita@example.com', 'Website',  'lost',          (SELECT id FROM users WHERE email='priya@leadtrack.com'));
