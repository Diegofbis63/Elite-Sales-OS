import { db } from "@/db";
import { prospects, syncHistory } from "@/db/schema";
import { eq } from "drizzle-orm";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function runProspectingSync(query: string = "negocios Córdoba Argentina") {
    console.log("Starting Prospecting Sync (Broad Mode)...");

    if (!GOOGLE_MAPS_API_KEY) {
        console.error("No Google Maps API key found");
        return { success: false, error: "Missing API Key" };
    }

    const queries = [
        "restaurantes Córdoba Argentina",
        "hoteles Córdoba Argentina",
        "salones de belleza Córdoba Argentina",
        "concesionarias Córdoba Argentina",
        "inmobiliarias Córdoba Argentina"
    ];

    let totalLeadsAdded = 0;

    try {
        for (const q of queries) {
            console.log(`Searching for: ${q}`);
            const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&key=${GOOGLE_MAPS_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === "OK" && data.results) {
                console.log(`Found ${data.results.length} results for ${q}`);
                for (const result of data.results) {

                    // Deduplication check early by place_id
                    const existing = await db.query.prospects.findFirst({
                        where: eq(prospects.googleMapsId, result.place_id),
                    });

                    if (existing) continue;

                    // Fetch details
                    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&fields=name,formatted_phone_number,website,rating,types&key=${GOOGLE_MAPS_API_KEY}`;
                    const detailsRes = await fetch(detailsUrl);
                    const details = await detailsRes.json();

                    if (details.status === "OK" && details.result) {
                        const place = details.result;

                        // Broad logic: Add businesses without website OR low rating (< 4.2)
                        // User wants high-value, but for demo let's add those who NEED help
                        if (!place.website || (place.rating && place.rating < 4.2)) {
                            await db.insert(prospects).values({
                                name: place.name || "Empresa",
                                businessName: place.name || "Empresa",
                                phone: place.formatted_phone_number || "S/D",
                                industry: place.types?.[0] || "Business",
                                rating: place.rating || 0,
                                hasWebsite: !!place.website,
                                googleMapsId: result.place_id,
                                status: 'cold',
                            });
                            totalLeadsAdded++;
                        }
                    }

                    // Limit per query to avoid hitting limits too fast in one go
                    if (totalLeadsAdded > 30) break;
                }
            }
            if (totalLeadsAdded > 50) break;
        }

        await db.insert(syncHistory).values({
            status: 'success',
            leadsFound: totalLeadsAdded,
        });

        return { success: true, leadsAdded: totalLeadsAdded };
    } catch (error) {
        console.error("Sync error in engine:", error);
        return { success: false, error: String(error) };
    }
}
