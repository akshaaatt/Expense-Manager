import { pgTable, text, timestamp, boolean, serial, integer, numeric } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------

// Spending categories (e.g. Food, Rent, Travel). Each user has their own set.
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  // A hex color used in charts / badges, e.g. "#16a34a"
  color: text('color').notNull().default('#16a34a'),
  // A lucide icon name for the category, e.g. "utensils"
  icon: text('icon').notNull().default('tag'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Individual expenses (spends). Optionally tied to a category and/or a card.
export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  description: text('description').notNull(),
  // Stored as numeric to preserve precision for currency.
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  categoryId: integer('categoryId'),
  cardId: integer('cardId'),
  // "cash" | "card" | "upi" | "bank"
  paymentMethod: text('paymentMethod').notNull().default('cash'),
  spentAt: timestamp('spentAt').notNull().defaultNow(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Debts: tracks money owed to the user and money the user owes.
export const debts = pgTable('debts', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  // The other party's name.
  person: text('person').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  // "owed_to_me" = they owe me, "i_owe" = I owe them
  direction: text('direction').notNull().default('owed_to_me'),
  description: text('description'),
  // Optional due date for settling the debt.
  dueDate: timestamp('dueDate'),
  settled: boolean('settled').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Credit cards with billing/payment deadlines.
export const cards = pgTable('cards', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  // Issuer / network, e.g. "HDFC", "Visa".
  issuer: text('issuer'),
  // Last 4 digits for display only.
  lastFour: text('lastFour'),
  creditLimit: numeric('creditLimit', { precision: 12, scale: 2 }),
  // Current outstanding balance on the card.
  currentBalance: numeric('currentBalance', { precision: 12, scale: 2 }).notNull().default('0'),
  // Day of month (1-31) the statement is generated.
  statementDay: integer('statementDay'),
  // Day of month (1-31) the payment is due.
  dueDay: integer('dueDay'),
  color: text('color').notNull().default('#0f172a'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
