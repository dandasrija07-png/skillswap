/**
 * Test MySQL / TiDB database connectivity
 */
export const testConnection = async () => {
  if (!pool) {
    console.error('❌ Database connection pool is not initialized.');
    return false;
  }

  let connection;

  try {
    connection = await pool.getConnection();

    await connection.ping();

    isLiveMySQL = true;

    console.log('✅ Connected to MySQL / TiDB database successfully.');

    return true;
  } catch (err) {
    isLiveMySQL = false;

    console.error('❌ MySQL / TiDB connection failed.');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);

    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};