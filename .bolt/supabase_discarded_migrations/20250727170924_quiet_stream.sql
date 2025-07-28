/*
  # Seed Reference Data for Agency System

  This migration adds initial reference data:
  1. Common docket tags for categorization
  2. Default agency settings
  3. Example data for development
*/

-- Insert common docket tags
INSERT INTO tags (name, description, color) VALUES
  ('Budget', 'Budget proposals and financial planning', '#10B981'),
  ('Transportation', 'Roads, transit, and transportation infrastructure', '#3B82F6'),
  ('Housing', 'Housing development and zoning', '#F59E0B'),
  ('Environment', 'Environmental impact and sustainability', '#059669'),
  ('Public Safety', 'Police, fire, and emergency services', '#DC2626'),
  ('Parks & Recreation', 'Parks, recreation facilities, and programs', '#65A30D'),
  ('Zoning', 'Land use and zoning regulations', '#7C3AED'),
  ('Economic Development', 'Business development and economic policy', '#EA580C'),
  ('Health', 'Public health and healthcare services', '#DB2777'),
  ('Education', 'Schools and educational programs', '#2563EB'),
  ('Utilities', 'Water, sewer, and utility services', '#0891B2'),
  ('Planning', 'Urban planning and development', '#7C2D12')
ON CONFLICT (name) DO NOTHING;

-- Function to create default agency settings when agency is created
CREATE OR REPLACE FUNCTION create_default_agency_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO agency_settings (agency_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create settings for new agencies
DROP TRIGGER IF EXISTS create_agency_settings_trigger ON agencies;
CREATE TRIGGER create_agency_settings_trigger
  AFTER INSERT ON agencies
  FOR EACH ROW
  EXECUTE FUNCTION create_default_agency_settings();

-- Constraint to ensure at least one owner per agency
CREATE OR REPLACE FUNCTION ensure_agency_has_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a delete or role change from owner, check if there's still an owner
  IF (TG_OP = 'DELETE' AND OLD.role = 'owner') OR 
     (TG_OP = 'UPDATE' AND OLD.role = 'owner' AND NEW.role != 'owner') THEN
    
    -- Count remaining owners for this agency
    IF (SELECT COUNT(*) FROM agency_users 
        WHERE agency_id = COALESCE(OLD.agency_id, NEW.agency_id) 
        AND role = 'owner' 
        AND id != COALESCE(OLD.id, NEW.id)) = 0 THEN
      
      RAISE EXCEPTION 'Cannot remove last owner from agency. Agency must have at least one owner.';
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce at least one owner per agency
DROP TRIGGER IF EXISTS ensure_owner_trigger ON agency_users;
CREATE TRIGGER ensure_owner_trigger
  BEFORE UPDATE OR DELETE ON agency_users
  FOR EACH ROW
  EXECUTE FUNCTION ensure_agency_has_owner();