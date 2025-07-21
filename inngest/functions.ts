import { inngest } from "@/src/inngest/client";
import OpenAI from "openai";
import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";

// より高度なプロンプトテンプレート（役割とコンテキストを強化）
const generateAdvancedProductDescriptionPrompt = (data: {
  menuName: string;
  category?: string;
  targetGender?: string;
  menuDescription?: string;
  menuPrice?: string;
  query?: string;
  tone?: 'casual' | 'formal' | 'luxury';
  platform?: 'ec' | 'sns' | 'menu';
}) => {
  const toneMap = {
    casual: 'カジュアルで親しみやすい',
    formal: 'フォーマルで信頼感のある',
    luxury: '高級感があり洗練された'
  };

  const platformMap = {
    ec: 'ECサイト用（SEOを意識）',
    sns: 'SNS投稿用（共感と拡散を意識）',
    menu: 'メニュー表用（簡潔で分かりやすく）'
  };

  return `あなたは${data.category}専門の経験豊富なコピーライターです。
以下の商品について、${toneMap[data.tone || 'formal']}トーンで、
${platformMap[data.platform || 'ec']}の説明文を作成してください。

===商品詳細===
商品名: ${data.menuName}
カテゴリ: ${data.category}
価格: ¥${data.menuPrice}
ターゲット層: ${data.targetGender}
基本説明: ${data.menuDescription}

===作成ガイドライン===
1. ターゲット層の心理を理解し、共感を得る表現を使用
2. 価格帯に応じた価値提案（コスパ or プレミアム感）
3. ${data.category}ならではの専門用語を適切に使用
4. 感覚に訴える描写（味、香り、食感、見た目など）
5. 購買後の満足感やライフスタイルの変化を想起させる

${data.query ? `===カスタム要求===\n${data.query}\n` : ''}

===出力フォーマット===
（商品の魅力的なキャッチコピーを一文）

（商品説明を150-250文字で魅力を凝縮）

【こだわりポイント】
- ポイント1
- ポイント2
- ポイント3

【おすすめのシーン】
- シーン1
- シーン2

【お客様の声イメージ】
「〜」（想定される感想を1つ）`;
};

const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey) {
  throw new Error("DEEPSEEK_API_KEY is not set");
}

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: apiKey
});


export const generate = inngest.createFunction(
  { id: "generate" }, 
  { event: "generate" },
  async ({ event}) => {

    const startTime = performance.now();

    const prompt = generateAdvancedProductDescriptionPrompt({
      menuName: event.data.menuName,
      category: event.data.category,
      targetGender: event.data.targetGender,
      menuDescription: event.data.menuDescription,
      menuPrice: event.data.menuPrice,
      tone: event.data.tone,
      platform: event.data.platform,
    });


    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "deepseek-chat",
    });
    const elapsedTime = performance.now() - startTime;
    const elapsedTimeInSeconds = Math.round(elapsedTime / 100) / 10; // ミリ秒を秒に変換し、小数点以下1桁で四捨五入
    await fetchMutation(api.generate.mutation.create, {
      eventId: event.id || "ERROR",
      query: event.data.query,
      result: completion.choices[0].message.content || "",
      time: elapsedTimeInSeconds, // 1.2のような数値
    });
    return { message: completion.choices[0].message.content };
  },
);


export const scrapeHotPepper = inngest.createFunction(
  { id: "scrapeHotPepper" }, 
  { event: "scrapeHotPepper" },
  async ({ event, step}) => {
    
    const { areaUrl } = event.data;
    
    if (!areaUrl) {
      throw new Error('エリアURLが必要です');
    }
    
    // ステップ1: エリアのスクレイピング準備
    const startTime = await step.run("prepare-scraping", async () => {
      return performance.now();
    });
    
    // ステップ2: データの収集
    const results = await step.run("scrape-data", async () => {
      const { getAllSalons, extractSalonDetails } = await import('@/services/crawler');
      
      console.log('Starting comprehensive scraping for areaUrl:', areaUrl);
      
      // 全ページからサロン一覧を取得
      const salonList = await getAllSalons(areaUrl);
      console.log(`Found ${salonList.length} salons, collecting detailed info...`);
      
      const scrapedResults = [];
      
      // 全サロンの詳細情報を取得
      for (let i = 0; i < salonList.length; i++) {
        const salon = salonList[i];
        console.log(`Collecting details for: ${salon.name} (${i + 1}/${salonList.length})`);
        
        try {
          const details = await extractSalonDetails(salon.url);
          
          if (details) {
            scrapedResults.push({
              name: details.name || salon.name,
              address: details.address || '',
              phone: details.phone || '',
              url: salon.url,
              cstt: salon.cstt,
              access: details.access || '',
              businessHours: details.businessHours || '',
              closedDays: details.closedDays || '',
              paymentMethods: details.paymentMethods || '',
              cutPrice: details.cutPrice || '',
              staffCount: details.staffCount || '',
              features: details.features || '',
              remarks: details.remarks || '',
              other: details.other || ''
            });
          } else {
            // 詳細取得失敗時は基本情報のみ
            scrapedResults.push({
              name: salon.name,
              address: '',
              phone: '',
              url: salon.url,
              cstt: salon.cstt
            });
          }
        } catch (error) {
          console.error(`Failed to get details for ${salon.name}:`, error);
          // エラー時は基本情報のみ
          scrapedResults.push({
            name: salon.name,
            address: '',
            phone: '',
            url: salon.url,
            cstt: salon.cstt
          });
        }
      }
      
      console.log(`Scraped ${scrapedResults.length} salons with full detailed records`);
      
      return scrapedResults;
    });
    
    // ステップ3: Instagram情報の収集
    const enrichedResults = await step.run("collect-instagram", async () => {
      const { generateInstagramSearchQueries, extractInstagramFromSearchItem } = await import('@/services/instagramExtractor');
      
      console.log('Starting Instagram collection for salons...');
      
      const enrichedSalons = [];
      
      // 全サロンのInstagram情報を収集
      for (let i = 0; i < results.length; i++) {
        const salon = results[i];
        console.log(`Processing Instagram for: ${salon.name} (${i + 1}/${results.length})`);
        
        try {
          // Google検索用のクエリを生成
          const queries = generateInstagramSearchQueries(salon.name);
          
          // ダミーの検索結果（実際のGoogle検索APIが必要）
          const dummySearchResults = [
            {
              title: `${salon.name} - Instagram`,
              link: `https://instagram.com/sample_${i + 1}`,
              snippet: `${salon.name}の公式Instagramアカウント`
            }
          ];
          
          let instagramUrl = '';
          for (const searchItem of dummySearchResults) {
            const extracted = extractInstagramFromSearchItem(searchItem, salon.name);
            if (extracted && extracted.relevance > 0.3) {
              instagramUrl = extracted.url;
              break;
            }
          }
          
          enrichedSalons.push({
            ...salon,
            instagram: instagramUrl || '',
            queries: queries
          });
          
        } catch (error) {
          console.error(`Instagram collection failed for ${salon.name}:`, error);
          enrichedSalons.push({
            ...salon,
            instagram: '',
            queries: []
          });
        }
      }
      
      console.log(`Instagram collection completed for ${results.length} salons`);
      
      return enrichedSalons;
    });

    // ステップ4: 処理時間の記録
    const endTime = await step.run("calculate-duration", async () => {
      const elapsed = performance.now() - startTime;
      return Math.round(elapsed / 100) / 10; // 秒単位に変換
    });
    
    // ステップ5: CSVファイル生成とアップロード
    const csvFileUrl = await step.run("generate-and-upload-csv", async () => {
      // CSVデータを生成
      const csvHeaders = [
        'サロン名', '住所', '電話番号', 'URL', 'CSTT', 'Instagram',
        'アクセス', '営業時間', '定休日', '支払い方法',
        'カット価格', 'スタッフ数', 'こだわり条件', '備考', 'その他'
      ];
      
      const csvRows = enrichedResults.map(salon => {
        const salonData = salon as {
          name?: string;
          address?: string;
          phone?: string;
          url?: string;
          cstt?: string;
          instagram?: string;
          access?: string;
          businessHours?: string;
          closedDays?: string;
          paymentMethods?: string;
          cutPrice?: string;
          staffCount?: string;
          features?: string;
          remarks?: string;
          other?: string;
        };
        
        return [
          salonData.name || '',
          salonData.address || '',
          salonData.phone || '',
          salonData.url || '',
          salonData.cstt || '',
          salonData.instagram || '',
          salonData.access || '',
          salonData.businessHours || '',
          salonData.closedDays || '',
          salonData.paymentMethods || '',
          salonData.cutPrice || '',
          salonData.staffCount || '',
          salonData.features || '',
          salonData.remarks || '',
          salonData.other || ''
        ].map(value => {
          // CSVエスケープ処理（ダブルクォートとカンマを処理）
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',');
      });
      
      // UTF-8 BOMを追加してExcelで正しく開けるようにする
      const BOM = '\uFEFF';
      const csvHeaderRow = csvHeaders.map(header => `"${header}"`).join(',');
      const csvContent = BOM + [csvHeaderRow, ...csvRows].join('\n');
      const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      
      // Convexのファイルストレージにアップロード
      const api = (await import('@/convex/_generated/api')).api;
      
      try {
        // アップロードURL生成
        const uploadUrl = await fetchMutation(api.files.generateUploadUrl, {});
        
        // ファイルをアップロード
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `hotpepper-scraping-${timestamp}.csv`;
        
        // Convex公式推奨：BlobまたはFileを直接bodyに指定
        const csvFile = new File([csvBlob], fileName, { 
          type: 'text/csv;charset=utf-8' 
        });
        
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 
            "Content-Type": "text/csv;charset=utf-8" 
          },
          body: csvFile, // FormDataではなくFileを直接指定
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }
        
        const { storageId } = await uploadResponse.json();
        
        // ファイルメタデータをConvexに保存
        await fetchMutation(api.files.saveFile, {
          storageId,
          fileName,
          fileType: 'text/csv',
          size: csvBlob.size,
          metadata: {
            eventId: event.id || "unknown",
            areaUrl,
            recordCount: enrichedResults.length,
            duration: endTime,
            scrapedAt: new Date().toISOString()
          }
        });
        
        console.log(`CSV file uploaded successfully: ${fileName} (${enrichedResults.length} records)`);
        return { storageId, fileName, recordCount: enrichedResults.length };
        
      } catch (error) {
        console.error('CSV upload failed:', error);
        // アップロード失敗時もローカルCSVは生成済みなので続行
        return { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    // ステップ6: 結果をConvexに保存
    await step.run("save-to-convex", async () => {
      try {
        await fetchMutation(api.scraping.create, {
          eventId: event.id || "ERROR",
          areaUrl,
          results: enrichedResults.slice(0, 100), // 大量データの場合は先頭100件のみ保存
          duration: endTime,
          totalCount: enrichedResults.length,
          csvFileInfo: csvFileUrl
        });
        console.log('Results saved to Convex successfully');
      } catch (error) {
        console.error('Failed to save results to Convex:', error);
        // エラーでも処理は継続
      }
    });
    
    return {
      success: true,
      results: enrichedResults,
      duration: endTime,
      count: enrichedResults.length
    };
  },
);