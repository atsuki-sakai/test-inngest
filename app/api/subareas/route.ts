import { NextRequest, NextResponse } from 'next/server';
import { fetchSubAreas } from '@/services/crawler';

export async function POST(request: NextRequest) {
  try {
    const { areaUrl } = await request.json();
    
    if (!areaUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'エリアURLが必要です' 
      }, { status: 400 });
    }
    
    const subAreas = await fetchSubAreas(areaUrl);
    
    return NextResponse.json({ 
      success: true, 
      subAreas 
    });
  } catch (error) {
    console.error('サブエリア取得APIエラー:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'サブエリア取得中にエラーが発生しました' 
    }, { status: 500 });
  }
}