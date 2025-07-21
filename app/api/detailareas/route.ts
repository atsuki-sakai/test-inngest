import { NextRequest, NextResponse } from 'next/server';
import { fetchDetailAreas } from '@/services/crawler';

export async function POST(request: NextRequest) {
  try {
    const { subAreaUrl } = await request.json();
    
    if (!subAreaUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'サブエリアURLが必要です' 
      }, { status: 400 });
    }
    
    const detailAreas = await fetchDetailAreas(subAreaUrl);
    
    return NextResponse.json({ 
      success: true, 
      detailAreas 
    });
  } catch (error) {
    console.error('詳細エリア取得APIエラー:', error);
    return NextResponse.json({ 
      success: false, 
      error: '詳細エリア取得中にエラーが発生しました' 
    }, { status: 500 });
  }
}