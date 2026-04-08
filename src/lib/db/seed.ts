import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { nanoid } from "nanoid";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create sample users
  const creatorId = nanoid();
  const buyerId = nanoid();
  const adminId = nanoid();

  await db.insert(schema.user).values([
    {
      id: creatorId,
      name: "Demo Creator",
      email: "creator@example.com",
      emailVerified: true,
      image: null,
      role: "creator",
      stripeCustomerId: null,
      stripeConnectId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: buyerId,
      name: "Demo Buyer",
      email: "buyer@example.com",
      emailVerified: true,
      image: null,
      role: "buyer",
      stripeCustomerId: null,
      stripeConnectId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: adminId,
      name: "Admin User",
      email: "admin@example.com",
      emailVerified: true,
      image: null,
      role: "admin",
      stripeCustomerId: null,
      stripeConnectId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log("✅ Created sample users");

  // Create sample templates
  const template1Id = nanoid();
  const template2Id = nanoid();
  const template3Id = nanoid();

  await db.insert(schema.templates).values([
    {
      id: template1Id,
      creatorId: creatorId,
      title: "Customer Support AI Workflow",
      slug: "customer-support-ai",
      description: "Automated customer support workflow that handles common inquiries and routes complex issues to human agents.",
      category: "support",
      tags: ["customer-support", "ai", "automation"],
      price: 4999, // $49.99
      pricingModel: "one_time",
      workflowJson: {
        nodes: [],
        edges: [],
      },
      documentation: "# Customer Support AI Workflow\n\nThis workflow handles...",
      previewImages: [],
      integrations: ["slack", "openai"],
      complexity: "intermediate",
      certificationStatus: "certified",
      certificationBadge: "gold",
      certificationNotes: "Excellent documentation and test coverage",
      rating: 48, // 4.8 stars (stored as 48 for precision)
      reviewCount: 12,
      purchaseCount: 45,
      status: "published",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: template2Id,
      creatorId: creatorId,
      title: "Sales Lead Qualification",
      slug: "sales-lead-qualification",
      description: "Automatically qualify sales leads based on email responses and website behavior.",
      category: "sales",
      tags: ["sales", "lead-gen", "automation"],
      price: 2999, // $29.99
      pricingModel: "one_time",
      workflowJson: {
        nodes: [],
        edges: [],
      },
      documentation: "# Sales Lead Qualification\n\nThis workflow helps...",
      previewImages: [],
      integrations: ["hubspot", "openai"],
      complexity: "beginner",
      certificationStatus: "certified",
      certificationBadge: "silver",
      certificationNotes: "Good workflow, minor documentation improvements needed",
      rating: 42, // 4.2 stars
      reviewCount: 8,
      purchaseCount: 23,
      status: "published",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: template3Id,
      creatorId: creatorId,
      title: "Social Media Content Generator",
      slug: "social-media-content-generator",
      description: "Generate and schedule social media posts across multiple platforms.",
      category: "marketing",
      tags: ["social-media", "content", "automation"],
      price: 0, // Free
      pricingModel: "one_time",
      workflowJson: {
        nodes: [],
        edges: [],
      },
      documentation: "# Social Media Content Generator\n\nThis workflow...",
      previewImages: [],
      integrations: ["twitter", "linkedin", "openai"],
      complexity: "advanced",
      certificationStatus: "pending",
      certificationBadge: "none",
      certificationNotes: null,
      rating: 0,
      reviewCount: 0,
      purchaseCount: 0,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log("✅ Created sample templates");

  // Create a sample purchase
  const purchaseId = nanoid();
  await db.insert(schema.purchases).values([
    {
      id: purchaseId,
      userId: buyerId,
      templateId: template1Id,
      pricePaid: 4999,
      stripePaymentIntentId: "pi_sample_123",
      licenseKey: nanoid(),
      status: "active",
      createdAt: new Date(),
    },
  ]);

  console.log("✅ Created sample purchase");

  // Create a sample review
  await db.insert(schema.reviews).values([
    {
      id: nanoid(),
      userId: buyerId,
      templateId: template1Id,
      purchaseId: purchaseId,
      rating: 5,
      title: "Excellent workflow, saved me hours!",
      content: "This workflow is exactly what I needed. The documentation is clear and the setup was straightforward. Highly recommended!",
      verifiedPurchase: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log("✅ Created sample review");

  console.log("🎉 Database seeding completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
