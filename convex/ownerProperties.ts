import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

const propertyTypeValidator = v.union(
  v.literal("apartment"),
  v.literal("house"),
  v.literal("condo"),
  v.literal("townhouse"),
  v.literal("studio"),
);

export const createOwnerProperty = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    address: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
    }),
    propertyType: propertyTypeValidator,
    rooms: v.object({
      bedrooms: v.number(),
      bathrooms: v.number(),
    }),
    squareMeters: v.number(),
    monthlyRent: v.object({
      cold: v.optional(v.number()),
      warm: v.optional(v.number()),
    }),
    deposit: v.optional(v.number()),
    minimumLease: v.optional(v.number()),
    availableFrom: v.optional(v.number()),
    amenities: v.optional(v.array(v.string())),
    furnished: v.optional(v.boolean()),
    petFriendly: v.optional(v.boolean()),
    imageUrls: v.optional(v.array(v.string())),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
  },
  returns: v.id("properties"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) throw new Error("User not found");

    const propertyData = {
      ...args,
      address: {
        ...args.address,
        fullAddress: `${args.address.street}, ${args.address.city}, ${args.address.state} ${args.address.zipCode}`,
      },
      ownerId: user._id,
      status: "active" as const,
      isExternal: false,
    };

    return await ctx.db.insert("properties", propertyData);
  },
});

export const updateOwnerProperty = mutation({
  args: {
    propertyId: v.id("properties"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    address: v.optional(
      v.object({
        street: v.string(),
        city: v.string(),
        state: v.string(),
        zipCode: v.string(),
        country: v.string(),
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),
      }),
    ),
    propertyType: v.optional(propertyTypeValidator),
    rooms: v.optional(
      v.object({
        bedrooms: v.number(),
        bathrooms: v.number(),
      }),
    ),
    squareMeters: v.optional(v.number()),
    monthlyRent: v.optional(
      v.object({
        cold: v.optional(v.number()),
        warm: v.optional(v.number()),
      }),
    ),
    deposit: v.optional(v.number()),
    minimumLease: v.optional(v.number()),
    availableFrom: v.optional(v.number()),
    amenities: v.optional(v.array(v.string())),
    furnished: v.optional(v.boolean()),
    petFriendly: v.optional(v.boolean()),
    imageUrls: v.optional(v.array(v.string())),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const property = await ctx.db.get(args.propertyId);
    if (!property) throw new Error("Property not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user || property.ownerId !== user._id) {
      throw new Error("Unauthorized");
    }

    const { propertyId, address, ...updateData } = args;

    const patchData: any = { ...updateData };

    if (address) {
      patchData.address = {
        ...address,
        fullAddress: `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`,
      };
    }

    await ctx.db.patch(propertyId, patchData);
    return null;
  },
});

export const deleteOwnerProperty = mutation({
  args: { propertyId: v.id("properties") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const property = await ctx.db.get(args.propertyId);
    if (!property) throw new Error("Property not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user || property.ownerId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.propertyId);
    return null;
  },
});

export const togglePropertyStatus = mutation({
  args: {
    propertyId: v.id("properties"),
    status: v.union(v.literal("active"), v.literal("disabled")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const property = await ctx.db.get(args.propertyId);
    if (!property) throw new Error("Property not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user || property.ownerId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.propertyId, { status: args.status });
    return null;
  },
});

export const getOwnerProperties = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("disabled"))),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) throw new Error("User not found");

    let query = ctx.db
      .query("properties")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    return await query.order("desc").paginate(args.paginationOpts);
  },
});

export const getOwnerPropertyById = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const property = await ctx.db.get(args.propertyId);
    if (!property) throw new Error("Property not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user || property.ownerId !== user._id) {
      throw new Error("Unauthorized");
    }

    return property;
  },
});

export const getOwnerPropertyAnalytics = query({
  args: {
    timeframe: v.optional(
      v.union(v.literal("week"), v.literal("month"), v.literal("year")),
    ),
  },
  returns: v.object({
    totalProperties: v.number(),
    activeProperties: v.number(),
    totalRevenue: v.number(),
    averageRent: v.number(),
    occupancyRate: v.number(),
    topPerformingProperties: v.array(
      v.object({
        _id: v.id("properties"),
        title: v.string(),
        views: v.number(),
        inquiries: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) throw new Error("User not found");

    const properties = await ctx.db
      .query("properties")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    const activeProperties = properties.filter((p) => p.status === "active");
    const totalRevenue = activeProperties.reduce(
      (sum, p) => sum + (p.monthlyRent.warm || p.monthlyRent.cold || 0),
      0,
    );

    return {
      totalProperties: properties.length,
      activeProperties: activeProperties.length,
      totalRevenue,
      averageRent: totalRevenue / Math.max(activeProperties.length, 1),
      occupancyRate: 0.85,
      topPerformingProperties: [],
    };
  },
});