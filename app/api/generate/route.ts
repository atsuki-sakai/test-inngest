import { NextResponse } from "next/server";
import { inngest } from "@/src/inngest/client";

// Opt out of caching; every request should send a new event
export const dynamic = "force-dynamic";

interface GenerateRequest {
  menuName: string;
  category: string;
  targetGender: string;
  menuDescription: string;
  menuPrice: string;
  query: string; // 生成プロンプト
  platform: string;
  tone: string;
}

// Create a simple async Next.js API route handler
export async function POST(request: Request) {
  try {
    const { menuName, category, targetGender, menuDescription, menuPrice, query, platform, tone } = await request.json() as GenerateRequest;
    if (!menuName ) {
      return NextResponse.json({ message: "menuName is required" }, { status: 400 });
    }
    
    // Send your event payload to Inngest
    const response = await inngest.send({
      name: "generate",
      data: {
        menuName: menuName,
        category: category,
        targetGender: targetGender,
        menuDescription: menuDescription,
        menuPrice: menuPrice,
        query: query,
        platform: platform,
        tone: tone
      },
    });

    return NextResponse.json({ 
      message: "Event sent successfully",
      eventId: response.ids?.[0] || null // Inngestのevent IDを返す
    }, { status: 200 });
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}