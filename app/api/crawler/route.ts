import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/src/inngest/client';

export async function POST(request: NextRequest) {
  try {
    const { areaUrl } = await request.json();
    
    if (!areaUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'エリアURLが必要です' 
      }, { status: 400 });
    }
    
    console.log('Sending Inngest event with areaUrl:', areaUrl);
    
    // Inngest関数を呼び出してスクレイピングを実行
    const result = await inngest.send({
      name: 'scrapeHotPepper',
      data: {
        areaUrl
      }
    });
    
    console.log('Inngest send result:', result);
    
    // Inngestが非同期処理中であることを通知
    return NextResponse.json({ 
      success: true, 
      message: 'スクレイピング処理を開始しました。結果は非同期で処理されます。',
      eventId: result.ids[0],
      results: [] // 空の結果を返し、後でInngestから結果を取得
    });
    
  } catch (error) {
    console.error('クローラーAPIエラー:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'データ収集中にエラーが発生しました' 
    }, { status: 500 });
  }
}