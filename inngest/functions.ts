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

（商品説明を250-400文字で魅力を凝縮）

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