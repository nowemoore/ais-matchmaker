import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get("input") ?? "";
  const placeId = searchParams.get("place_id");
  const sessionToken = searchParams.get("sessiontoken") ?? "";
  const key = process.env.GOOGLE_MAPS_KEY!;

  if (placeId) {
    // Place Details (New)
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "addressComponents",
        },
      }
    );
    const data = await res.json();
    console.log("Details response:", data);
    return NextResponse.json(data);
  }

  // Autocomplete (New)
  const res = await fetch(
    `https://places.googleapis.com/v1/places:autocomplete`,
    {
      method: "POST",
      headers: {
        "X-Goog-Api-Key": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input,
        includedPrimaryTypes: ["locality", "postal_town"],
        languageCode: "en",
        sessionToken,
      }),
    }
  );
  const data = await res.json();
  console.log("Autocomplete response:", data);
  return NextResponse.json(data);
}