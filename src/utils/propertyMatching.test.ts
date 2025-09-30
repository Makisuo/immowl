import { describe, expect, test } from "bun:test";
import type { Doc } from "convex/_generated/dataModel";
import {
	calculateAmenitiesScore,
	calculateBathroomScore,
	calculateBedroomScore,
	calculateDistance,
	calculateFurnishedScore,
	calculateLocationScore,
	calculateMatchScore,
	calculatePetFriendlyScore,
	calculatePriceScore,
	calculatePropertyTypeScore,
	calculateSizeScore,
	type UserPreferences,
	type CriteriaWeights,
} from "./propertyMatching";

// Helper function to create a mock property
function createMockProperty(overrides?: Partial<Doc<"properties">>): Doc<"properties"> {
	return {
		_id: "test-id" as any,
		_creationTime: Date.now(),
		title: "Test Property",
		description: "A test property",
		propertyType: "apartment",
		address: {
			street: "Test Street",
			houseNumber: "123",
			city: "Amsterdam",
			postalCode: "1234AB",
			country: "Netherlands",
			latitude: 52.3676,
			longitude: 4.9041,
		},
		monthlyRent: { cold: 1000, warm: 1200 },
		squareMeters: 50,
		rooms: { bedrooms: 2, bathrooms: 1 },
		furnished: false,
		petFriendly: false,
		amenities: [],
		availableFrom: Date.now(),
		externalSource: null,
		externalId: null,
		...overrides,
	} as Doc<"properties">;
}

// Helper function to create empty preferences
function createEmptyPreferences(): UserPreferences {
	return {
		maxBudget: null,
		minBudget: null,
		desiredBedrooms: null,
		desiredBathrooms: null,
		preferredCity: null,
		preferredLatitude: null,
		preferredLongitude: null,
		maxDistanceKm: null,
		preferredPropertyType: null,
		requiresPetFriendly: false,
		prefersFurnished: false,
		desiredAmenities: [],
		minSquareMeters: null,
		maxSquareMeters: null,
	};
}

describe("Price Scoring", () => {
	test("returns null when no maxBudget is set", () => {
		const score = calculatePriceScore(1000, null, null);
		expect(score).toBe(null);
	});

	test("returns 100 for rent in sweet spot (70-85% of max budget)", () => {
		const score = calculatePriceScore(750, null, 1000);
		expect(score).toBe(100);
	});

	test("returns high score for rent at max budget", () => {
		const score = calculatePriceScore(1000, null, 1000);
		expect(score).toBeGreaterThanOrEqual(90);
	});

	test("penalizes rent over budget", () => {
		const score = calculatePriceScore(1100, null, 1000);
		expect(score).toBeLessThan(90);
	});

	test("returns null for rent = 0 (missing data)", () => {
		const score = calculatePriceScore(0, null, 1000);
		expect(score).toBe(null);
	});

	test("penalizes suspiciously cheap rent below minBudget", () => {
		const score = calculatePriceScore(400, 600, 1000);
		expect(score).toBeLessThan(100);
		expect(score).toBeGreaterThanOrEqual(50);
	});
});

describe("Bedroom Scoring", () => {
	test("returns null when no desired bedrooms set", () => {
		const score = calculateBedroomScore(2, null);
		expect(score).toBe(null);
	});

	test("returns 100 for exact match", () => {
		const score = calculateBedroomScore(2, 2);
		expect(score).toBe(100);
	});

	test("returns 100 for more bedrooms (having more is always good)", () => {
		const score = calculateBedroomScore(3, 2);
		expect(score).toBe(100);
	});

	test("returns 100 for many more bedrooms", () => {
		const score = calculateBedroomScore(5, 2);
		expect(score).toBe(100);
	});

	test("penalizes fewer bedrooms", () => {
		const score = calculateBedroomScore(1, 2);
		expect(score).toBeLessThan(100);
	});
});

describe("Bathroom Scoring", () => {
	test("returns null when no desired bathrooms set", () => {
		const score = calculateBathroomScore(1, null);
		expect(score).toBe(null);
	});

	test("returns 100 for exact match", () => {
		const score = calculateBathroomScore(1, 1);
		expect(score).toBe(100);
	});

	test("returns 100 for more bathrooms", () => {
		const score = calculateBathroomScore(2, 1);
		expect(score).toBe(100);
	});

	test("penalizes fewer bathrooms", () => {
		const score = calculateBathroomScore(1, 2);
		expect(score).toBeLessThan(100);
	});
});

describe("Location Scoring", () => {
	test("returns null when no preferred city is set", () => {
		const score = calculateLocationScore("Amsterdam", undefined, undefined, null, null, null, null);
		expect(score).toBe(null);
	});

	test("returns 100 for exact city match", () => {
		const score = calculateLocationScore(
			"Amsterdam",
			undefined,
			undefined,
			"Amsterdam",
			null,
			null,
			null,
		);
		expect(score).toBe(100);
	});

	test("returns 60 for different city without coordinates", () => {
		const score = calculateLocationScore(
			"Rotterdam",
			undefined,
			undefined,
			"Amsterdam",
			null,
			null,
			null,
		);
		expect(score).toBe(60);
	});

	test("calculates distance-based score with coordinates", () => {
		// Amsterdam center coordinates
		const score = calculateLocationScore(
			"Amsterdam",
			52.3676,
			4.9041,
			"Amsterdam",
			52.3676,
			4.9041,
			50,
		);
		expect(score).toBe(100); // Same coordinates = 0 distance
	});

	test("penalizes properties beyond max distance", () => {
		// Amsterdam to Utrecht is ~40km
		const score = calculateLocationScore(
			"Utrecht",
			52.0907,
			5.1214,
			"Amsterdam",
			52.3676,
			4.9041,
			10, // 10km max
		);
		expect(score).toBeLessThan(60);
	});
});

describe("Property Type Scoring", () => {
	test("returns null when no preferred type set", () => {
		const score = calculatePropertyTypeScore("apartment", null);
		expect(score).toBe(null);
	});

	test("returns 100 for exact match", () => {
		const score = calculatePropertyTypeScore("apartment", "apartment");
		expect(score).toBe(100);
	});

	test("uses similarity matrix for similar types", () => {
		const score = calculatePropertyTypeScore("apartment", "flat");
		expect(score).toBeGreaterThanOrEqual(90);
	});

	test("returns lower score for dissimilar types", () => {
		const score = calculatePropertyTypeScore("apartment", "house");
		expect(score).toBeLessThanOrEqual(50);
	});
});

describe("Size Scoring", () => {
	test("returns null when no size preferences set", () => {
		const score = calculateSizeScore(50, null, null);
		expect(score).toBe(null);
	});

	test("returns 100 when size meets minSquareMeters", () => {
		const score = calculateSizeScore(50, 40, null);
		expect(score).toBe(100);
	});

	test("returns 100 when size is within maxSquareMeters", () => {
		const score = calculateSizeScore(50, null, 60);
		expect(score).toBe(100);
	});

	test("returns 100 when size is within min and max range", () => {
		const score = calculateSizeScore(50, 40, 60);
		expect(score).toBe(100);
	});

	test("penalizes size below minimum", () => {
		const score = calculateSizeScore(30, 50, null);
		expect(score).toBeLessThan(100);
	});

	test("penalizes size above maximum", () => {
		const score = calculateSizeScore(80, null, 50);
		expect(score).toBeLessThan(100);
		expect(score).toBeGreaterThanOrEqual(50);
	});
});

describe("Pet Friendly Scoring", () => {
	test("returns null when not required", () => {
		const score = calculatePetFriendlyScore(false, false);
		expect(score).toBe(null);
	});

	test("returns 100 when required and available", () => {
		const score = calculatePetFriendlyScore(true, true);
		expect(score).toBe(100);
	});

	test("returns 0 when required but not available", () => {
		const score = calculatePetFriendlyScore(false, true);
		expect(score).toBe(0);
	});
});

describe("Furnished Scoring", () => {
	test("returns null when not preferred", () => {
		const score = calculateFurnishedScore(false, false);
		expect(score).toBe(null);
	});

	test("returns 100 when preferred and available", () => {
		const score = calculateFurnishedScore(true, true);
		expect(score).toBe(100);
	});

	test("returns 50 when preferred but not available", () => {
		const score = calculateFurnishedScore(false, true);
		expect(score).toBe(50);
	});
});

describe("Amenities Scoring", () => {
	test("returns null when no desired amenities", () => {
		const score = calculateAmenitiesScore(["gym", "pool"], []);
		expect(score).toBe(null);
	});

	test("returns base score when property has no amenities", () => {
		const score = calculateAmenitiesScore([], ["gym", "pool"]);
		expect(score).toBe(60);
	});

	test("returns higher score for partial matches", () => {
		const score = calculateAmenitiesScore(["gym"], ["gym", "pool"]);
		expect(score).toBeGreaterThan(60);
		expect(score).toBeLessThan(100);
	});

	test("returns 100 for all amenities matched", () => {
		const score = calculateAmenitiesScore(["gym", "pool"], ["gym", "pool"]);
		expect(score).toBe(100);
	});
});

describe("Distance Calculation", () => {
	test("calculates distance correctly", () => {
		// Distance from Amsterdam to Utrecht is approximately 34km
		const distance = calculateDistance(52.3676, 4.9041, 52.0907, 5.1214);
		expect(distance).toBeGreaterThan(30);
		expect(distance).toBeLessThan(40);
	});

	test("returns 0 for same coordinates", () => {
		const distance = calculateDistance(52.3676, 4.9041, 52.3676, 4.9041);
		expect(distance).toBe(0);
	});
});

describe("Overall Match Score - No Filters Set", () => {
	test("handles completely empty preferences", () => {
		const property = createMockProperty();
		const preferences = createEmptyPreferences();
		const result = calculateMatchScore(property, preferences);

		// Should not crash and should handle gracefully
		expect(result).toBeDefined();
		expect(result.overall).toBeGreaterThanOrEqual(0);
		expect(result.overall).toBeLessThanOrEqual(100);
	});

	test("returns 0 when no preferences are set (BUG: should be handled better)", () => {
		const property = createMockProperty();
		const preferences = createEmptyPreferences();
		const result = calculateMatchScore(property, preferences);

		// This is the current buggy behavior - it returns 0
		expect(result.overall).toBe(0);
		// All breakdowns should be null
		expect(result.breakdown.price).toBe(null);
		expect(result.breakdown.bedrooms).toBe(null);
		expect(result.breakdown.location).toBe(null);
	});
});

describe("Overall Match Score - Single Filter", () => {
	test("correctly scores when only price filter is set", () => {
		const property = createMockProperty({ monthlyRent: { cold: 700, warm: 900 } });
		const preferences = createEmptyPreferences();
		preferences.maxBudget = 1000;

		const result = calculateMatchScore(property, preferences);

		expect(result.overall).toBeGreaterThan(0);
		expect(result.breakdown.price).not.toBe(null);
		// Only price should be scored
		expect(result.breakdown.bedrooms).toBe(null);
		expect(result.breakdown.location).toBe(null);
	});

	test("correctly scores when only bedroom filter is set", () => {
		const property = createMockProperty({ rooms: { bedrooms: 2, bathrooms: 1 } });
		const preferences = createEmptyPreferences();
		preferences.desiredBedrooms = 2;

		const result = calculateMatchScore(property, preferences);

		expect(result.overall).toBe(100); // Exact match
		expect(result.breakdown.bedrooms).toBe(100);
		expect(result.breakdown.price).toBe(null);
	});

	test("correctly scores when only location filter is set", () => {
		const property = createMockProperty();
		const preferences = createEmptyPreferences();
		preferences.preferredCity = "Amsterdam";

		const result = calculateMatchScore(property, preferences);

		expect(result.overall).toBe(100); // City matches
		expect(result.breakdown.location).toBe(100);
		expect(result.breakdown.price).toBe(null);
	});
});

describe("Overall Match Score - Multiple Filters", () => {
	test("correctly weights multiple criteria", () => {
		const property = createMockProperty({
			monthlyRent: { cold: 800, warm: 1000 },
			rooms: { bedrooms: 2, bathrooms: 1 },
		});
		const preferences = createEmptyPreferences();
		preferences.maxBudget = 1200;
		preferences.desiredBedrooms = 2;

		const result = calculateMatchScore(property, preferences);

		expect(result.overall).toBeGreaterThan(90); // Both should score high
		expect(result.breakdown.price).toBeGreaterThan(90);
		expect(result.breakdown.bedrooms).toBe(100);
	});

	test("handles partial matches across criteria", () => {
		const property = createMockProperty({
			monthlyRent: { cold: 1500, warm: 1700 }, // Over budget
			rooms: { bedrooms: 2, bathrooms: 1 }, // Perfect
		});
		const preferences = createEmptyPreferences();
		preferences.maxBudget = 1000;
		preferences.desiredBedrooms = 2;

		const result = calculateMatchScore(property, preferences);

		expect(result.overall).toBeLessThan(100);
		expect(result.breakdown.price).toBeLessThan(75); // Over budget
		expect(result.breakdown.bedrooms).toBe(100); // Perfect match
	});
});

describe("Overall Match Score - Custom Weights", () => {
	test("applies custom weights correctly", () => {
		const property = createMockProperty({
			monthlyRent: { cold: 1500, warm: 1700 }, // Poor price
			rooms: { bedrooms: 2, bathrooms: 1 }, // Perfect bedrooms
		});
		const preferences = createEmptyPreferences();
		preferences.maxBudget = 1000;
		preferences.desiredBedrooms = 2;

		// Heavy weight on bedrooms, low weight on price
		const weights: Partial<CriteriaWeights> = {
			price: 10,
			bedrooms: 90,
		};

		const result = calculateMatchScore(property, preferences, weights);

		// Should score high because bedrooms are weighted heavily
		expect(result.overall).toBeGreaterThan(90);
	});

	test("handles all weights set to 0 (BUG: should be handled)", () => {
		const property = createMockProperty();
		const preferences = createEmptyPreferences();
		preferences.maxBudget = 1000;
		preferences.desiredBedrooms = 2;

		const weights: Partial<CriteriaWeights> = {
			price: 0,
			bedrooms: 0,
		};

		const result = calculateMatchScore(property, preferences, weights);

		// This will cause totalWeight = 0, resulting in score of 0
		expect(result.overall).toBe(0);
	});

	test("handles undefined weights (uses defaults instead of causing NaN)", () => {
		const property = createMockProperty({
			monthlyRent: { cold: 1100, warm: 1110 },
			squareMeters: 86,
			rooms: { bedrooms: 3, bathrooms: 1 },
			address: {
				...createMockProperty().address,
				city: "Berlin",
			},
		});
		const preferences = createEmptyPreferences();
		preferences.maxBudget = 3000;
		preferences.minSquareMeters = 50;
		preferences.desiredBedrooms = 3;
		preferences.preferredCity = "Berlin";

		// Simulate what happens in PropertyMatchScore component when no weights are set
		const weights: Partial<CriteriaWeights> = {
			price: undefined,
			location: undefined,
			bedrooms: undefined,
			bathrooms: undefined,
			propertyType: undefined,
			petFriendly: undefined,
			furnished: undefined,
			amenities: undefined,
			size: undefined,
		};

		const result = calculateMatchScore(property, preferences, weights);

		// Should NOT be NaN - should use default weights
		expect(result.overall).not.toBe(NaN);
		expect(Number.isNaN(result.overall)).toBe(false);
		expect(result.overall).toBeGreaterThan(0);
		expect(result.overall).toBeLessThanOrEqual(100);
	});
});

describe("Overall Match Score - Edge Cases", () => {
	test("handles property with missing optional fields", () => {
		const property = createMockProperty({
			amenities: undefined as any,
			furnished: undefined as any,
			petFriendly: undefined as any,
		});
		const preferences = createEmptyPreferences();
		preferences.desiredAmenities = ["gym"];
		preferences.prefersFurnished = true;
		preferences.requiresPetFriendly = true;

		const result = calculateMatchScore(property, preferences);

		expect(result).toBeDefined();
		expect(result.overall).toBeGreaterThanOrEqual(0);
	});

	test("perfect match scores 100%", () => {
		const property = createMockProperty({
			monthlyRent: { cold: 700, warm: 800 }, // 80% of budget = sweet spot
			rooms: { bedrooms: 2, bathrooms: 1 },
			address: {
				...createMockProperty().address,
				city: "Amsterdam",
			},
		});
		const preferences = createEmptyPreferences();
		preferences.maxBudget = 1000;
		preferences.desiredBedrooms = 2;
		preferences.preferredCity = "Amsterdam";

		const result = calculateMatchScore(property, preferences);

		expect(result.overall).toBe(100);
	});

	test("complete mismatch scores low", () => {
		const property = createMockProperty({
			monthlyRent: { cold: 2000, warm: 2200 }, // Way over budget
			rooms: { bedrooms: 1, bathrooms: 1 }, // Wrong bedrooms
			address: {
				...createMockProperty().address,
				city: "Rotterdam",
			},
		});
		const preferences = createEmptyPreferences();
		preferences.maxBudget = 1000;
		preferences.desiredBedrooms = 3;
		preferences.preferredCity = "Amsterdam";

		const result = calculateMatchScore(property, preferences);

		expect(result.overall).toBeLessThan(60);
	});
});
