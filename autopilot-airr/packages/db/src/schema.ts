import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const prospects = sqliteTable('prospects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  title: text('title').notNull(),
  institution: text('institution').notNull(),
  location: text('location'),
  size: text('size'),
  currentStack: text('current_stack'),
  signals: text('signals'),
  temperature: text('temperature'),
  channel: text('channel'),
  campaignId: integer('campaign_id').references(() => campaigns.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const research = sqliteTable('research', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  prospectId: integer('prospect_id').references(() => prospects.id).notNull(),
  brief: text('brief'),
  pains: text('pains'),
  hook: text('hook'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  prospectId: integer('prospect_id').references(() => prospects.id).notNull(),
  channel: text('channel').notNull(),
  type: text('type').notNull(),
  content: text('content'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const replies = sqliteTable('replies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  prospectId: integer('prospect_id').references(() => prospects.id).notNull(),
  inbound: text('inbound').notNull(),
  outbound: text('outbound'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const campaigns = sqliteTable('campaigns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  config: text('config'),
  status: text('status').default('draft'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export type Setting = typeof settings.$inferSelect;
export type Prospect = typeof prospects.$inferSelect;
export type Research = typeof research.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Reply = typeof replies.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
