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