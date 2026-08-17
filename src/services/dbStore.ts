import localforage from 'localforage';

export interface PersistedDatabase {
  type: 'sample' | 'custom_csv' | 'custom_sql';
  sampleId?: string; 
  filename?: string; 
  content?: string;  
}

export const saveActiveDatabase = async (dbData: PersistedDatabase) => {
  try {
    await localforage.setItem('lsql_active_db', dbData);
  } catch (error) {
    console.error('Error saving active database to localforage:', error);
  }
};

export const getActiveDatabase = async (): Promise<PersistedDatabase | null> => {
  try {
    return await localforage.getItem<PersistedDatabase>('lsql_active_db');
  } catch (error) {
    console.error('Error retrieving active database from localforage:', error);
    return null;
  }
};
