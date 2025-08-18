export interface DatabaseConfig {
  type: 'mysql' | 'postgresql' | 'sqlserver' | 'oracle' | 'mongodb';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  timeout?: number;
  connectionLimit?: number;
}

export interface DatabaseConnection {
  id: string;
  config: DatabaseConfig;
  status: 'connected' | 'disconnected' | 'error';
  lastTest: Date;
  tables: DatabaseTable[];
}

export interface DatabaseTable {
  name: string;
  type: 'table' | 'view' | 'procedure';
  size: number;
  rows: number;
  lastModified: Date;
}

export interface QueryResult {
  success: boolean;
  data?: any[];
  error?: string;
  executionTime: number;
  rowsAffected: number;
}

export interface DatabaseStats {
  totalConnections: number;
  activeConnections: number;
  totalQueries: number;
  averageResponseTime: number;
  errors: number;
}
