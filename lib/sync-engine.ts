import { db } from "@/db";
import { prospects, syncHistory } from "@/db/schema";
import { eq } from "drizzle-orm";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function runProspectingSync(query: string = "clínicas estéticas en Córdoba Argentina") {
    if (!GOOGLE_MAPS_API_KEY) {
        console.error("No Google Maps API key found");
        return { success: false, error: "Missing API Key" };
    }

    const queries = [
        "clínicas estéticas en Córdoba Argentina",
        "estética avanzada en Córdoba Argentina",
        "clínicas médicas privadas en Córdoba Argentina",
        "estudios jurídicos corporativos en Córdoba Argentina",
        "inmobiliarias de lujo en Córdoba Argentina",
        "concesionarias de autos de alta gama en Córdoba Argentina"
    ];

    let totalLeadsAdded = 0;

    try {
        for (const q of queries) {
            const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&key=${GOOGLE_MAPS_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === "OK") {
                for (const result of data.results) {
                    // Filter: Rating > 4.0
                    if (result.rating && result.rating > 4.0) {

                        // Check if it has a website (need Place Details for more accuracy, but textsearch returns some info)
                        // Or better, we fetch Place Details for each high-rated candidate to check website
                        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&fields=name,formatted_phone_number,website,rating,types,editorial_summary&key=${GOOGLE_MAPS_API_KEY}`;
                        const detailsRes = await fetch(detailsUrl);
                        const details = await detailsRes.json();

                        if (details.status === "OK") {
                            const place = details.result;

                            // Only businesses WITHOUT website
                            if (!place.website) {
                                // Deduplication
                                const existing = await db.query.prospects.findFirst({
                                    where: eq(prospects.googleMapsId, result.place_id),
                                });

                                if (!existing) {
                                    await db.insert(prospects).values({
                                        name: place.name,
                                        businessName: place.name,
                                        phone: place.formatted_phone_number || 'S/D',
                                        industry: place.types?.[0] || 'Business',
                                        rating: place.rating || 0,
                                        hasWebsite: false,
                                        googleMapsId: result.place_id,
                                        status: 'cold',
                                    });
                                    totalLeadsAdded++;
                                }
                            }
                        }
                    }
                }
            }
        }

        await db.insert(syncHistory).values({
            status: 'success',
            leadsFound: totalLeadsAdded,
        });

        return { success: true, leadsAdded: totalLeadsAdded };
    } catch (error) {
        console.error("Sync error:", error);
        await db.insert(syncHistory).values({
            status: 'failed',
            leadsFound: 0,
        });
        return { success: false, error: String(error) };
    }
}
