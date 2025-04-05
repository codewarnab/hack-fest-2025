import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.GOOGLE_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body.query;
    
    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }
    
    const components = "country:IN";
    const types = "route";
    const language = "en"; 
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}&components=${components}&types=${types}&language=${language}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(data);
    
    return NextResponse.json({ predictions: data.predictions || [] });
  } catch (error) {
    console.error('Error in address API:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}