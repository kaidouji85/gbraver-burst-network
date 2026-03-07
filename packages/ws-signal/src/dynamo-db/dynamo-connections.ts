import { Connection, ConnectionSchema } from "../core/connection";

/**
 * DynamoDB スキーマ connections
 * パーティションキー connectionId
 */
export type DynamoConnections = Connection;

/** DynamoConnections zodスキーマ */
export const DynamoConnectionsSchema = ConnectionSchema;
