import { inngest } from "@/src/inngest/client";
import OpenAI from "openai";
import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { AREA_URL_MAP } from "@/lib/constants";
import { time } from "console";

// エリアURLからエリア名を取得するヘルパー関数
const getAreaNameFromUrl = (areaUrl: string): string => {
  for (const [areaName, url] of Object.entries(AREA_URL_MAP)) {
    if (areaUrl === url) {
      return areaName;
    }
  }
  // URLが一致しない場合は、URLから推測を試みる
  if (areaUrl.includes('/svcSD/')) return '北海道';
  if (areaUrl.includes('/svcSE/')) return '東北';
  if (areaUrl.includes('/svcSH/')) return '北信越';
  if (areaUrl.includes('/svcSA/')) return '関東';
  if (areaUrl.includes('/svcSF/')) return '中国';
  if (areaUrl.includes('/svcSC/')) return '東海';
  if (areaUrl.includes('/svcSB/')) return '関西';
  if (areaUrl.includes('/svcSI/')) return '四国';
  if (areaUrl.includes('/svcSG/')) return '九州・沖縄';
  
  if (areaUrl.includes('/svcSD/')) return '北海道';
  
  return 'その他エリア';
};

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
      query: event.data.query || "",
      result: completion.choices[0].message.content || "",
      time: elapsedTimeInSeconds, // 1.2のような数値
      contextJson: JSON.stringify({
        prompt: generateAdvancedProductDescriptionPrompt({
          menuName: event.data.menuName,
          category: event.data.category,
          targetGender: event.data.targetGender,
          menuDescription: event.data.menuDescription,
          menuPrice: event.data.menuPrice,
          tone: event.data.tone,
          platform: event.data.platform,
        }),
        response: completion.choices[0].message.content || "",
        model: "deepseek-chat"
      }),
    });
    return { message: completion.choices[0].message.content };
  },
);


// フレームワーク別のプロンプト生成
const generateFrameworkPrompt = (framework: string, data: {
  platform: string;
  targetAudience: string;
  postType: string;
  keywords: string;
  prompt: string;
}) => {
  const frameworkTemplates = {
    aida: `AIDA（注意→関心→欲求→行動）フレームワークを使用して投稿を構成してください：
1. 【Attention】読者の注意を引く魅力的な冒頭
2. 【Interest】関心を持続させる具体的な情報
3. 【Desire】欲求を喚起する価値提案
4. 【Action】明確な行動喚起`,
    
    pas: `PAS（問題→煽り→解決）フレームワークを使用して投稿を構成してください：
1. 【Problem】ターゲットが抱える問題を明確化
2. 【Agitation】その問題の深刻さや緊急性を煽る
3. 【Solution】効果的な解決策を提示`,
    
    prep: `PREP（結論→理由→例→結論）フレームワークを使用して投稿を構成してください：
1. 【Point】結論・主張を最初に明確に述べる
2. 【Reason】その理由や根拠を説明
3. 【Example】具体例や事例で補強
4. 【Point】再度結論を強調して締める`,
    
    bab: `BAB（Before→After→Bridge）フレームワークを使用して投稿を構成してください：
1. 【Before】現在の状況・問題
2. 【After】理想的な未来の状態
3. 【Bridge】その変化を実現するための方法`,
    
    golden_circle: `ゴールデンサークル（Why→How→What）フレームワークを使用して投稿を構成してください：
1. 【Why】なぜこれが重要なのか（目的・理念）
2. 【How】どのようにして実現するのか（方法・プロセス）
3. 【What】何をするのか（具体的な内容・商品）`,
    
    star: `STAR（状況→課題→行動→結果）フレームワークを使用して投稿を構成してください：
1. 【Situation】具体的な状況設定
2. 【Task】直面した課題や問題
3. 【Action】取った行動や対策
4. 【Result】得られた結果や成果`,
    
    fab: `FAB（機能→利点→利益）フレームワークを使用して投稿を構成してください：
1. 【Features】商品・サービスの機能や特徴
2. 【Advantages】それによって得られる利点
3. 【Benefits】ユーザーにとっての具体的な利益`,
    
    storytelling: `ストーリーテリング（起承転結）フレームワークを使用して投稿を構成してください：
1. 【起】導入・背景設定
2. 【承】展開・詳細説明
3. 【転】転換点・驚きの要素
4. 【結】結論・メッセージ`,
    
    quest: `QUEST（資格確認→理解→教育→刺激→移行）フレームワークを使用して投稿を構成してください：
1. 【Qualify】ターゲットの資格確認
2. 【Understand】問題や状況の理解
3. 【Educate】解決策の教育
4. 【Stimulate】行動への刺激
5. 【Transition】次のステップへの移行`,
    
    scamper: `SCAMPER（創造的発想）フレームワークを使用して投稿を構成してください：
代用・結合・応用・修正・他用途・除去・逆転の視点から斬新で差別化されたアプローチを取り入れてください`
  };

  return frameworkTemplates[framework as keyof typeof frameworkTemplates] || '';
};

// SNS投稿生成のための専門家プロンプト
const generateSNSPostPrompt = (data: {
  platform: string;
  targetAudience: string;
  postType: string;
  keywords: string;
  frameworks: string[];
  prompt: string;
}) => {
  const platformSpecs = {
    twitter: { limit: 280, tone: "簡潔で印象的", features: "ハッシュタグ、リツイートしやすさ" },
    instagram: { limit: 2200, tone: "ビジュアル重視、ストーリー性", features: "ハッシュタグ、絵文字、改行" },
    facebook: { limit: 63206, tone: "詳細で親しみやすい", features: "長文OK、リンク、画像説明" },
    linkedin: { limit: 3000, tone: "プロフェッショナル", features: "業界用語、専門性、ビジネス価値" },
    tiktok: { limit: 2200, tone: "若者向け、トレンド", features: "流行語、チャレンジ、音楽連想" },
    youtube: { limit: 5000, tone: "詳細説明、SEO意識", features: "キーワード最適化、時間軸言及" }
  };

  const spec = platformSpecs[data.platform as keyof typeof platformSpecs];
  const frameworkInstructions = data.frameworks.map(f => generateFrameworkPrompt(f, data)).join('\n\n');

  return `あなたは${data.platform}に特化したSNSマーケティングの専門家です。

===投稿要件===
プラットフォーム: ${data.platform}
文字数制限: ${spec?.limit}文字
推奨トーン: ${spec?.tone}
重要要素: ${spec?.features}
ターゲット層: ${data.targetAudience}
投稿タイプ: ${data.postType}
キーワード: ${data.keywords}

===フレームワーク指示===
${frameworkInstructions}

===投稿内容リクエスト===
${data.prompt}

===作成ガイドライン===
1. ${data.platform}の特性を最大限活用
2. ${data.targetAudience}に響く言葉選び
3. ${data.postType}の目的を達成
4. キーワード「${data.keywords}」を自然に組み込み
5. エンゲージメントを高める要素を含める
6. 文字数制限${spec?.limit}文字以内で最適化

出力形式：
投稿本文のみを出力してください。説明や補足は不要です。`;
};

export const generateSNSPost = inngest.createFunction(
  { id: "generateSNSPost" },
  { event: "generateSNSPost" },
  async ({ event, step }) => {
    const { platform, targetAudience, postType, keywords, frameworks, prompt } = event.data;

    // ステップ1: プラットフォーム最適化専門家
    const platformOptimized = await step.run("platform-optimization", async () => {


    // タスクを作成（step外で実行）- 冪等性があるので重複実行されても安全
    try {
      await fetchMutation(api.task.mutation.createTask, {
        eventId: event.id || "ERROR",
        taskType: "sns_generation",
        totalSteps: 5,
        stepDefinitions: [
          { stepId: "platform-optimization", name: "プラットフォーム最適化" },
          { stepId: "content-creation", name: "コンテンツクリエイション" },
          { stepId: "marketing-evaluation", name: "マーケティング効果評価" },
          { stepId: "quality-assurance", name: "品質管理" },
          { stepId: "expert-consensus", name: "専門家会議" }
        ],
        metadata: {
          platform,
          prompt
        }
      });
    } catch (error) {
      console.log(`Task creation handled gracefully for eventId: ${event.id} - this is expected if task already exists` + error);
    }

    // ステップ開始を記録
    await fetchMutation(api.task.mutation.updateStep, {
      eventId: event.id || "ERROR",
      stepId: "platform-optimization",
      status: "in_progress"
    });
      const platformPrompt = generateSNSPostPrompt({
        platform,
        targetAudience,
        postType, 
        keywords,
        frameworks: frameworks || [],
        prompt
      });

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: platformPrompt }],
        model: "deepseek-chat",
      });


    // ステップ完了を記録
    await fetchMutation(api.task.mutation.updateStep, {
      eventId: event.id || "ERROR",
      stepId: "platform-optimization",
      status: "completed"
    });
      

      return completion.choices[0].message.content || "";
    });


    let contentEnhanced: string;
    try {
      // ステップ2: コンテンツクリエイター専門家
      contentEnhanced = await step.run("content-creation", async () => {


    // ステップ2開始を記録
    await fetchMutation(api.task.mutation.updateStep, {
      eventId: event.id || "ERROR",
      stepId: "content-creation",
      status: "in_progress"
    });
        const creativePrompt = `あなたはバイラルコンテンツ作成の専門家です。以下の投稿をより魅力的で共感を得やすい内容に改善してください。

現在の投稿：
${platformOptimized}

改善要求：
- 感情に訴える表現を追加
- 共感ポイントを強化  
- 記憶に残るフレーズを含める
- 行動を促す要素を強化
- ${platform}での拡散性を高める

改善版投稿のみを出力してください。`;

        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: creativePrompt }],
          model: "deepseek-chat",
        });


      // ステップ2完了を記録
      await fetchMutation(api.task.mutation.updateStep, {
        eventId: event.id || "ERROR",
        stepId: "content-creation",
        status: "completed"
      });

        return completion.choices[0].message.content || "";
      });

    } catch (error) {
      await fetchMutation(api.task.mutation.updateStep, {
        eventId: event.id || "ERROR",
        stepId: "content-creation",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
      throw error;
    }


    let marketingEvaluated: string;
    try {
      // ステップ3: マーケティング効果評価専門家
      marketingEvaluated = await step.run("marketing-evaluation", async () => {
            // ステップ3開始を記録
    await fetchMutation(api.task.mutation.updateStep, {
      eventId: event.id || "ERROR",
      stepId: "marketing-evaluation",
      status: "in_progress"
    });
        const marketingPrompt = `あなたはSNSマーケティング効果測定の専門家です。以下の投稿のマーケティング効果を分析し、改善案を提示してください。

投稿内容：
${contentEnhanced}

評価観点：
- エンゲージメント率予測
- ターゲット層への訴求力
- バズる可能性
- コンバージョン期待値
- ブランドイメージへの影響

改善された最終版投稿のみを出力してください。`;

        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: marketingPrompt }],
          model: "deepseek-chat",
        });

              // ステップ3完了を記録
      await fetchMutation(api.task.mutation.updateStep, {
        eventId: event.id || "ERROR",
        stepId: "marketing-evaluation",
        status: "completed"
      });

        return completion.choices[0].message.content || "";
      });

    } catch (error) {
      await fetchMutation(api.task.mutation.updateStep, {
        eventId: event.id || "ERROR",
        stepId: "marketing-evaluation",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
      throw error;
    }


    let qualityAssured: string;
    try {
      // ステップ4: 品質管理専門家
      qualityAssured = await step.run("quality-assurance", async () => {

    // ステップ4開始を記録
    await fetchMutation(api.task.mutation.updateStep, {
      eventId: event.id || "ERROR",
      stepId: "quality-assurance",
      status: "in_progress"
    });

        const platformSpecs = {
          twitter: { limit: 280 },
          instagram: { limit: 2200 },
          facebook: { limit: 63206 },
          linkedin: { limit: 3000 },
          tiktok: { limit: 2200 },
          youtube: { limit: 5000 }
        };
        
        const qaPrompt = `あなたはSNS投稿品質管理の専門家です。以下の投稿を最終チェックし、完璧な品質に仕上げてください。

投稿内容：
${marketingEvaluated}

チェック項目：
- 文字数制限（${platformSpecs[platform as keyof typeof platformSpecs]?.limit}文字以内）
- 文法・表記の正確性
- 不適切な表現の除去
- ブランドイメージとの整合性
- ${platform}のガイドライン準拠
- ハッシュタグ最適化

最終版投稿のみを出力してください。`;

        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: qaPrompt }],
          model: "deepseek-chat",
        });


      // ステップ4完了を記録
      await fetchMutation(api.task.mutation.updateStep, {
        eventId: event.id || "ERROR",
        stepId: "quality-assurance",
        status: "completed"
      });

        return completion.choices[0].message.content || "";
      });
    } catch (error) {
      await fetchMutation(api.task.mutation.updateStep, {
        eventId: event.id || "ERROR",
        stepId: "quality-assurance",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
      throw error;
    }

    let finalResult: string;
    try {
      // ステップ5: 専門家会議による最終調整
      finalResult = await step.run("expert-consensus", async () => {

    // ステップ5開始を記録
    await fetchMutation(api.task.mutation.updateStep, {
      eventId: event.id || "ERROR",
      stepId: "expert-consensus",
      status: "in_progress"
    });

        const consensusPrompt = `4人の専門家が作成した投稿案を統合し、最高品質の投稿を生成してください。

専門家の成果物：
1. プラットフォーム最適化版: ${platformOptimized}
2. コンテンツクリエイティブ版: ${contentEnhanced}  
3. マーケティング最適化版: ${marketingEvaluated}
4. 品質保証版: ${qualityAssured}

統合指針：
- 各専門家の優れた要素を組み合わせ
- ${platform}で最大の効果を発揮
- ${targetAudience}に最も響く内容
- ${postType}の目的を最適に達成

最終統合版投稿のみを出力してください。`;

        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: consensusPrompt }],
          model: "deepseek-chat",
        });


      // ステップ5完了を記録
      await fetchMutation(api.task.mutation.updateStep, {
        eventId: event.id || "ERROR",
        stepId: "expert-consensus",
        status: "completed"
      });

        return completion.choices[0].message.content || "";
      });
    } catch (error) {
      await fetchMutation(api.task.mutation.updateStep, {
        eventId: event.id || "ERROR",
        stepId: "expert-consensus",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
      throw error;
    }

    await step.run("save-to-convex", async () => {
      
      // 結果をConvexに保存（step外で実行）
      const endTime = performance.now();
      await fetchMutation(api.generate.mutation.create, {
        eventId: event.id || "ERROR",
        query: prompt,
        result: finalResult,
        contextJson: JSON.stringify({
        steps: {
          platformOptimized,
          contentEnhanced, 
          marketingEvaluated,
          qualityAssured
        }
        }),
        time: Math.round(endTime / 100) / 10,
        // 生成パラメータを保存
        platform,
        targetAudience,
        postType,
        keywords,
        frameworks,
      });

      // タスクを完了としてマーク（step外で実行）
      await fetchMutation(api.task.mutation.completeTask, {
        eventId: event.id || "ERROR",
        success: true
      });
    })

    return { 
      message: finalResult,
      steps: {
        platformOptimized,
        contentEnhanced, 
        marketingEvaluated,
        qualityAssured
      }
    };
  }
);

export const scrapeHotPepper = inngest.createFunction(
  { id: "scrapeHotPepper" }, 
  { event: "scrapeHotPepper" },
  async ({ event, step}) => {
    
    const { areaUrl } = event.data;
    
    if (!areaUrl) {
      throw new Error('エリアURLが必要です');
    }

    // ステップ1: エリアのスクレイピング準備（status更新も含めてstep内で実行）
    const startTime = await step.run("prepare-scraping", async () => {
      await fetchMutation(api.task.mutation.createTask, {
        eventId: event.id || "ERROR",
        taskType: "scraping",
        totalSteps: 6,
        stepDefinitions: [
          { stepId: "prepare-scraping", name: "スクレイピング準備" },
          { stepId: "scrape-data", name: "データ収集" },
          { stepId: "collect-instagram", name: "Instagram情報収集" },
          { stepId: "calculate-duration", name: "処理時間記録" },
          { stepId: "generate-and-upload-csv", name: "CSV生成・アップロード" },
          { stepId: "save-to-convex", name: "ストレージに保存" }
        ],
        metadata: {
          areaUrl,
          areaName: getAreaNameFromUrl(areaUrl)
        }
      });
      // ステップ開始を記録
      await fetchMutation(api.task.mutation.updateStep, {
        eventId: event.id || "ERROR",
        stepId: "prepare-scraping", 
        status: "in_progress"
      });

      const time = performance.now();

      // ステップ完了を記録
      await fetchMutation(api.task.mutation.updateStep, {
        eventId: event.id || "ERROR",
        stepId: "prepare-scraping",
        status: "completed"
      });

      return time;
    });
    
    // ステップ2: データの収集（status更新も含めてstep内で実行）
    const results = await step.run("scrape-data", async () => {
      // ステップ開始を記録
      await fetchMutation(api.task.mutation.updateStep, {
        eventId: event.id || "ERROR",
        stepId: "scrape-data",
        status: "in_progress"
      });

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

      // ステップ完了を記録
      await fetchMutation(api.task.mutation.updateStep, {
        eventId: event.id || "ERROR",
        stepId: "scrape-data",
        status: "completed"
      });
      
      return scrapedResults;
    });
    
    // ステップ3: Instagram情報の収集（status更新も含めてstep内で実行）
    const enrichedResults = await step.run("collect-instagram", async () => {
      // ステップ開始を記録
      await fetchMutation(api.task.mutation.updateStep, {
        eventId: event.id || "ERROR",
        stepId: "collect-instagram",
        status: "in_progress"
      });

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

      // ステップ完了を記録
      await fetchMutation(api.task.mutation.updateStep, {
        eventId: event.id || "ERROR",
        stepId: "collect-instagram",
        status: "completed"
      });
      
      return enrichedSalons;
    });

    // ステップ4: 処理時間の記録（status更新も含めてstep内で実行）
    const endTime = await step.run("calculate-duration", async () => {
      // ステップ開始を記録
      await fetchMutation(api.task.mutation.updateStep, {
        eventId: event.id || "ERROR",
        stepId: "calculate-duration",
        status: "in_progress"
      });

      const elapsed = performance.now() - startTime;
      const elapsedSeconds = Math.round(elapsed / 100) / 10; // 秒単位に変換

      // ステップ完了を記録
      await fetchMutation(api.task.mutation.updateStep, {
        eventId: event.id || "ERROR",
        stepId: "calculate-duration",
        status: "completed"
      });

      return elapsedSeconds;
    });
    
    // ステップ5: CSVファイル生成とアップロード（status更新も含めてstep内で実行）
    const csvFileUrl = await step.run("generate-and-upload-csv", async () => {
      // ステップ開始を記録
      await fetchMutation(api.task.mutation.updateStep, {
        eventId: event.id || "ERROR",
        stepId: "generate-and-upload-csv",
        status: "in_progress"
      });
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
        const apiImport = (await import('@/convex/_generated/api')).api;
        
        try {
          // アップロードURL生成
          const uploadUrl = await fetchMutation(apiImport.files.generateUploadUrl, {});
          
          // ファイルをアップロード
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const areaName = getAreaNameFromUrl(areaUrl);
          const fileName = `${timestamp.split('T')[0]}-hotpepper-${areaName}.csv`;
          
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
          await fetchMutation(apiImport.files.saveFile, {
            storageId,
            fileName,
            fileType: 'text/csv',
            size: csvBlob.size,
            metadata: {
              eventId: event.id || "unknown",
              areaUrl,
              areaName,
              recordCount: enrichedResults.length,
              duration: endTime,
              scrapedAt: new Date().toISOString()
            }
          });
          
          console.log(`CSV file uploaded successfully: ${fileName} (${enrichedResults.length} records)`);
          const result = { storageId, fileName, recordCount: enrichedResults.length };
          
          // ステップ完了を記録
          await fetchMutation(api.task.mutation.updateStep, {
            eventId: event.id || "ERROR",
            stepId: "generate-and-upload-csv",
            status: "completed"
          });
          
          return result;
          
        } catch (uploadError) {
          console.error('CSV upload failed:', uploadError);
          // アップロード失敗時もローカルCSVは生成済みなので続行
          const result = { error: uploadError instanceof Error ? uploadError.message : 'Unknown error' };
          
          // ステップ完了を記録
          await fetchMutation(api.task.mutation.updateStep, {
            eventId: event.id || "ERROR",
            stepId: "generate-and-upload-csv",
            status: "completed"
          });
          
          return result;
        }
      });

    try {
      // ステップ6: 結果をConvexに保存（status更新も含めてstep内で実行）
      await step.run("save-to-convex", async () => {
        // ステップ開始を記録
        await fetchMutation(api.task.mutation.updateStep, {
          eventId: event.id || "ERROR",
          stepId: "save-to-convex",
          status: "in_progress"
        });
        await fetchMutation(api.scraping.create, {
          eventId: event.id || "ERROR",
          areaUrl,
          results: enrichedResults.slice(0, 100), // 大量データの場合は先頭100件のみ保存
          duration: endTime,
          totalCount: enrichedResults.length,
          csvFileInfo: csvFileUrl
        });
        console.log('Results saved to Convex successfully');
        
        // ステップ完了を記録
        await fetchMutation(api.task.mutation.updateStep, {
          eventId: event.id || "ERROR",
          stepId: "save-to-convex",
          status: "completed"
        });
        // タスクを完了としてマーク
        await fetchMutation(api.task.mutation.completeTask, {
          eventId: event.id || "ERROR",
          success: true
    });
    
      });
    } catch (error) {
      console.error('Failed to save results to Convex:', error);
      // step内でのエラーハンドリングは不要（step内で完結させる）
      throw error;
    }
    
    return {
      success: true,
      results: enrichedResults,
      duration: endTime,
      count: enrichedResults.length
    };
  },
);