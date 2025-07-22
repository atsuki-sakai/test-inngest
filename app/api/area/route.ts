import { NextResponse } from 'next/server';
import { processAreaSelection } from '@/controller/areaController';

export async function POST() {
  try {
    const areaResult = await processAreaSelection();
    
    if (areaResult) {
      return NextResponse.json({ 
        success: true, 
        area: areaResult 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'エリア選択が完了しませんでした' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('エリア選択APIエラー:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'エリア選択中にエラーが発生しました' 
    }, { status: 500 });
  }
}