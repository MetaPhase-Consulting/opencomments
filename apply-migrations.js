import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL) {
  console.error('SUPABASE_URL environment variable is required')
  process.exit(1)
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_KEY environment variable is required')
  process.exit(1)
}

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