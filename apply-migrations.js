import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = 'https://oeriotefmokcpjdqdqct.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcmlvdGVmbW9rY3BqZHFkcWN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzU1MDEwMSwiZXhwIjoyMDY5MTI2MTAxfQ.PKKg8Q7F9t-_vZWeTAKYuyTtLdNxtABVbpWKRW2av9A'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function applyMigrations() {
  try {
    console.log('Checking migration status...')
    
    // Read all migration files
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()
    
    console.log(`Found ${migrationFiles.length} migration files`)
    
    for (const file of migrationFiles) {
      console.log(`Applying migration: ${file}`)
      const migrationContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      
      // Split the migration into individual statements
      const statements = migrationContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0)
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error } = await supabase.rpc('exec_sql', { sql: statement })
            if (error) {
              console.error(`Error executing statement: ${error.message}`)
            }
          } catch (err) {
            console.error(`Error executing statement: ${err.message}`)
          }
        }
      }
    }
    
    console.log('Migrations completed!')
  } catch (error) {
    console.error('Error applying migrations:', error)
  }
}

applyMigrations() 