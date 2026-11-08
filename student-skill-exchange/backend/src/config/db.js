/**
 * Test TiDB Cloud database connectivity
 */
export const testConnection = async () => {
  if (!pool) {
    throw new Error('Database pool is not initialized');
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.query('SELECT 1');
    isLiveMySQL = true;
    console.log('Successfully connected to TiDB Cloud!');
    return true;
  } catch (error) {
    isLiveMySQL = false;
    console.error('TiDB connection failed:', error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Execute database queries
 */
export const query = async (sqlText, params = []) => {
  if (isLiveMySQL && pool) {
    try {
      const [rows] = await pool.query(sqlText, params);
      return [rows];
    } catch (error) {
      console.error('[TiDB Query Error]:', error.message);
      throw error;
    }
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Database is not connected. Cannot execute production queries.'
    );
  }

  return executeMemoryQuery(sqlText, params);
};

export const getMemoryStore = () => memoryStore;

export default {
  query,
  testConnection,
  getMemoryStore,
};