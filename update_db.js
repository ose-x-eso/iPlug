const { Client } = require('pg');

async function run() {
  const connectionString = 'postgresql://postgres:tmP-S3LDQz2%2A%2FbX@db.rkmpegyazjazhlyltuzh.supabase.co:5432/postgres';
  
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check if column exists
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='plugs' and column_name='portfolio_url';
    `);

    if (res.rows.length === 0) {
      console.log('Adding portfolio_url column...');
      await client.query('ALTER TABLE plugs ADD COLUMN portfolio_url TEXT;');
      console.log('Column added successfully.');
    } else {
      console.log('Column already exists.');
    }
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
  }
}

run();
