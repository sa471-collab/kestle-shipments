import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const shipmentStatus = v.union(
  v.literal("label_created"),
  v.literal("in_transit"),
  v.literal("delivered"),
  v.literal("returned"),
);

export const listByStatus = query({
  args: { status: shipmentStatus },
  handler: async (ctx, { status }) => {
    return await ctx.db
      .query("shipments")
      .withIndex("by_status", (q) => q.eq("status", status))
      .collect();
  },
});

export const track = query({
  args: { shipmentRef: v.string() },
  returns: v.object({ shipmentRef: v.string(), status: shipmentStatus, carrier: v.string() }),
  handler: async (ctx, { shipmentRef }) => {
    const s = await ctx.db
      .query("shipments")
      .withIndex("by_ref", (q) => q.eq("shipmentRef", shipmentRef))
      .unique();
    if (!s) throw new Error("Shipment " + shipmentRef + " not found");
    return { shipmentRef: s.shipmentRef, status: s.status as "in_transit", carrier: s.carrier };
  },
});

export const dispatch = mutation({
  args: { shipmentRef: v.string() },
  returns: v.null(),
  handler: async (ctx, { shipmentRef }) => {
    const s = await ctx.db
      .query("shipments")
      .withIndex("by_ref", (q) => q.eq("shipmentRef", shipmentRef))
      .unique();
    if (!s) throw new Error("Shipment " + shipmentRef + " not found");
    if (s.status !== "label_created") throw new Error("Shipment " + shipmentRef + " is not waiting for dispatch");
    await ctx.db.patch(s._id, { status: "intransit", dispatchedAt: Date.now() });
    return null;
  },
});

export const markDelivered = mutation({
  args: { shipmentRef: v.string() },
  returns: v.null(),
  handler: async (ctx, { shipmentRef }) => {
    const s = await ctx.db
      .query("shipments")
      .withIndex("by_ref", (q) => q.eq("shipmentRef", shipmentRef))
      .unique();
    if (!s) throw new Error("Shipment " + shipmentRef + " not found");
    if (s.status !== "in_transit") throw new Error("Shipment " + shipmentRef + " is not in transit");
    await ctx.db.patch(s._id, { status: "delivered" });
    return null;
  },
});
