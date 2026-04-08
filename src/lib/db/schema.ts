import { pgTable, text, timestamp, boolean, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["buyer", "creator", "admin"]);
export const templateCategoryEnum = pgEnum("template_category", [
  "support",
  "sales",
  "marketing",
  "operations",
  "development",
]);
export const templateStatusEnum = pgEnum("template_status", [
  "draft",
  "published",
  "archived",
]);
export const certificationStatusEnum = pgEnum("certification_status", [
  "pending",
  "testing",
  "certified",
  "rejected",
]);
export const certificationBadgeEnum = pgEnum("certification_badge", [
  "none",
  "bronze",
  "silver",
  "gold",
]);
export const pricingModelEnum = pgEnum("pricing_model", [
  "one_time",
  "subscription",
]);
export const complexityEnum = pgEnum("complexity", [
  "beginner",
  "intermediate",
  "advanced",
]);
export const purchaseStatusEnum = pgEnum("purchase_status", [
  "active",
  "refunded",
  "disputed",
]);

// Better-auth tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  role: userRoleEnum("role").default("buyer").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeConnectId: text("stripe_connect_id"),
  // Notification preferences
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  notifyPurchases: boolean("notify_purchases").default(true).notNull(),
  notifyCertification: boolean("notify_certification").default(true).notNull(),
  notifyReviews: boolean("notify_reviews").default(true).notNull(),
  notifyMarketing: boolean("notify_marketing").default(false).notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// Marketplace tables
export const templates = pgTable("templates", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  category: templateCategoryEnum("category").notNull(),
  tags: text("tags").array().default([]).notNull(),
  price: integer("price").notNull().default(0), // in cents, 0 = free
  pricingModel: pricingModelEnum("pricing_model").default("one_time").notNull(),
  workflowJson: jsonb("workflow_json").notNull(),
  documentation: text("documentation").default("").notNull(),
  previewImages: text("preview_images").array().default([]).notNull(),
  integrations: text("integrations").array().default([]).notNull(),
  complexity: complexityEnum("complexity").default("beginner").notNull(),
  certificationStatus: certificationStatusEnum("certification_status").default("pending").notNull(),
  certificationBadge: certificationBadgeEnum("certification_badge").default("none").notNull(),
  certificationNotes: text("certification_notes"),
  rating: integer("rating").default(0).notNull(),
  reviewCount: integer("review_count").default(0).notNull(),
  purchaseCount: integer("purchase_count").default(0).notNull(),
  status: templateStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const purchases = pgTable("purchases", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  templateId: text("template_id")
    .notNull()
    .references(() => templates.id, { onDelete: "cascade" }),
  pricePaid: integer("price_paid").notNull(), // in cents
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  licenseKey: text("license_key").notNull().unique(),
  status: purchaseStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  templateId: text("template_id")
    .notNull()
    .references(() => templates.id, { onDelete: "cascade" }),
  purchaseId: text("purchase_id")
    .notNull()
    .references(() => purchases.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5
  title: text("title").notNull(),
  content: text("content").notNull(),
  verifiedPurchase: boolean("verified_purchase").default(true).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const certificationTests = pgTable("certification_tests", {
  id: text("id").primaryKey(),
  templateId: text("template_id")
    .notNull()
    .references(() => templates.id, { onDelete: "cascade" }),
  testCases: jsonb("test_cases").notNull().default("[]"),
  testResults: jsonb("test_results").notNull().default("[]"),
  overallStatus: certificationStatusEnum("overall_status").default("pending").notNull(),
  securityScanResults: jsonb("security_scan_results"),
  performanceMetrics: jsonb("performance_metrics"),
  reviewedBy: text("reviewed_by").references(() => user.id),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
  purchases: many(purchases),
  templates: many(templates),
}));

export const templatesRelations = relations(templates, ({ one, many }) => ({
  creator: one(user, {
    fields: [templates.creatorId],
    references: [user.id],
  }),
  purchases: many(purchases),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(user, {
    fields: [purchases.userId],
    references: [user.id],
  }),
  template: one(templates, {
    fields: [purchases.templateId],
    references: [templates.id],
  }),
}));
