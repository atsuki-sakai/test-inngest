import { NextResponse } from "next/server";
import { inngest } from "@/src/inngest/client";

// Opt out of caching; every request should send a new event
export const dynamic = "force-dynamic";

interface GenerateRequest {
  // 旧形式（商品説明生成用）
  menuName?: string;
  category?: string;
  targetGender?: string;
  menuDescription?: string;
  menuPrice?: string;
  query?: string;
  tone?: string;
  
  // 新形式（SNS投稿生成用）
  prompt?: string;
  platform?: string;
  keywords?: string;
  targetAudience?: string;
  postType?: string;
  frameworks?: string[];
}

// Create a simple async Next.js API route handler
export async function POST(request: Request) {
  try {
    const body = await request.json() as GenerateRequest;
    
    // 新形式（SNS投稿生成）かどうかを判定
    const isSNSGeneration = body.prompt !== undefined;
    
    if (isSNSGeneration) {
      // SNS投稿生成の場合
      const { prompt, platform, keywords, targetAudience, postType, frameworks } = body;
      
      if (!prompt) {
        return NextResponse.json({ message: "prompt is required" }, { status: 400 });
      }
      
      // 新しいSNS投稿生成イベントを送信
      const response = await inngest.send({
        name: "generateSNSPost",
        data: {
          prompt,
          platform: platform || "",
          keywords: keywords || "",
          targetAudience: targetAudience || "",
          postType: postType || "",
          frameworks: frameworks || []
        },
      });

      return NextResponse.json({ 
        message: "SNS Post generation started",
        eventId: response.ids?.[0] || null
      }, { status: 200 });
      
    } else {
      // 旧形式（商品説明生成）の場合
      const { menuName, category, targetGender, menuDescription, menuPrice, query, platform, tone } = body;
      
      if (!menuName) {
        return NextResponse.json({ message: "menuName is required" }, { status: 400 });
      }
      
      // 従来の商品説明生成イベントを送信
      const response = await inngest.send({
        name: "generate",
        data: {
          menuName,
          category: category || "",
          targetGender: targetGender || "",
          menuDescription: menuDescription || "",
          menuPrice: menuPrice || "",
          query: query || "",
          platform: platform || "",
          tone: tone || ""
        },
      });

      return NextResponse.json({ 
        message: "Event sent successfully",
        eventId: response.ids?.[0] || null
      }, { status: 200 });
    }
    
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}