import { NextRequest, NextResponse } from 'next/server';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export async function POST(request: NextRequest) {
  try {
    const files = await fetchMutation(api.files.listFiles, {});
    
    return NextResponse.json({ 
      success: true, 
      files 
    });
    
  } catch (error) {
    console.error('ファイル一覧取得エラー:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'ファイル一覧の取得中にエラーが発生しました' 
    }, { status: 500 });
  }
}