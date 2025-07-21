import { NextRequest, NextResponse } from 'next/server';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export async function POST(request: NextRequest) {
  try {
    const { storageId, fileName, useHttpAction } = await request.json();
    
    if (!storageId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ストレージIDが必要です' 
      }, { status: 400 });
    }
    
    if (useHttpAction) {
      // ConvexのHTTPエンドポイントを使用
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
      if (!convexUrl) {
        return NextResponse.json({ 
          success: false, 
          error: 'Convex URLが設定されていません' 
        }, { status: 500 });
      }
      
      // HTTPアクション経由でファイルダウンロードURLを生成
      const downloadUrl = `${convexUrl}/download-file?storageId=${encodeURIComponent(storageId)}&fileName=${encodeURIComponent(fileName || 'download.csv')}`;
      
      return NextResponse.json({ 
        success: true, 
        url: downloadUrl,
        method: 'httpAction'
      });
    } else {
      // 従来のgetUrlを使用
      const result = await fetchMutation(api.files.getDownloadUrl, {
        storageId
      });
      
      if (result.success && result.url) {
        return NextResponse.json({ 
          success: true, 
          url: result.url,
          method: 'getUrl'
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          error: result.error || 'ダウンロードURLの生成に失敗しました' 
        }, { status: 404 });
      }
    }
    
  } catch (error) {
    console.error('ダウンロードURL生成エラー:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'ダウンロードURL生成中にエラーが発生しました' 
    }, { status: 500 });
  }
}