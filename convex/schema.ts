import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  shipments: defineTable({
    shipmentRef: v.string(),
    customer: v.string(),
    carrier: v.string(),
    // legacy: still a plain string in storage, the allowed values live in shipmentStatus
    status: v.string(),
    weightKg: v.number(),
    dispatchedAt: v.optional(v.number()),
  })
    .index("by_ref", ["shipmentRef"])
    .index("by_status", ["status"]),
});
