/**
 * 最適化されたプロンプト生成システム
 * フレームワークと最適化インサイトに基づいてプロンプトを動的生成
 */

import { type Platform, type TargetAudience, type PostType, type Framework } from './optimization';

export interface OptimizedPromptResult {
  prompt: string;
  systemPrompt: string;
  guidelines: string[];
  examples: string[];
}

/**
 * フレームワーク別プロンプトテンプレート
 */
const frameworkPrompts: Record<Framework, {
  structure: string;
  guidelines: string[];
  examples: string[];
}> = {
  aida: {
    structure: `以下のAIDA構造で投稿を作成してください：

1. **Attention（注目）**: 読者の注意を引く魅力的な開始
2. **Interest（関心）**: 興味を持続させる情報や価値提案
3. **Desire（欲求）**: 欲求を喚起する具体的なベネフィット
4. **Action（行動）**: 明確で実行しやすい行動喚起`,
    guidelines: [
      '冒頭で強烈なフックを設置',
      '感情に訴える言葉選び',
      '具体的なベネフィットを明示',
      '明確なCTAで締めくくり'
    ],
    examples: [
      '「たった30秒で人生が変わる」→興味深い情報→「今すぐできる」→「リンクをクリック」',
      '「見逃すと後悔する」→価値ある内容→「限定特典」→「今すぐ申し込み」'
    ]
  },
  pas: {
    structure: `以下のPAS構造で投稿を作成してください：

1. **Problem（問題）**: ターゲットが抱える問題を明確に提示
2. **Agitation（煽り）**: 問題の深刻さや緊急性を強調
3. **Solution（解決）**: 具体的で実行可能な解決策を提示`,
    guidelines: [
      '共感できる問題から開始',
      '問題の深刻性を具体的に描写',
      '解決策の即効性を強調',
      '信頼性のある根拠を提示'
    ],
    examples: [
      '「時間が足りない」→「このままでは機会損失」→「効率化ツールで解決」',
      '「売上が伸びない」→「競合に差をつけられる」→「新戦略で売上倍増」'
    ]
  },
  prep: {
    structure: `以下のPREP構造で投稿を作成してください：

1. **Point（結論）**: 主張や結論を最初に明示
2. **Reason（理由）**: 結論を支える論理的根拠
3. **Example（具体例）**: 実例やデータで補強
4. **Point（結論）**: 再度結論を強調して締めくくり`,
    guidelines: [
      '冒頭で結論を明確に提示',
      '論理的で説得力のある理由',
      '具体的な事例やデータ活用',
      '一貫性のある主張'
    ],
    examples: [
      '「〇〇が最適解」→「3つの理由」→「成功事例」→「だから〇〇を選ぶべき」',
      '「今が最適なタイミング」→「市場分析」→「実績データ」→「今すぐ行動を」'
    ]
  },
  quest: {
    structure: `以下のQUEST構造で投稿を作成してください：

1. **Question（質問）**: 関心を引く質問で開始
2. **Understand（理解）**: 読者の状況や悩みに共感
3. **Educate（教育）**: 有益な情報や知識を提供
4. **Stimulate（刺激）**: 行動への意欲を喚起
5. **Transition（移行）**: 具体的な次のステップを提示`,
    guidelines: [
      '興味深い質問で読者を引き込み',
      '読者の立場に立った共感',
      '教育的価値の高い情報提供',
      '段階的な理解促進'
    ],
    examples: [
      '「なぜ成功する人は...?」→「同じ悩みを持つあなたへ」→「成功の秘訣」→「今すぐ実践」',
      '「本当に効果的な方法は?」→「多くの人が困っている」→「専門家の見解」→「実践方法」'
    ]
  },
  scamper: {
    structure: `以下のSCAMPER手法で創造的な投稿を作成してください：

- **Substitute（代用）**: 従来の方法に代わる新しいアプローチ
- **Combine（結合）**: 異なる要素を組み合わせた斬新な提案
- **Adapt（適応）**: 他業界の成功事例を応用
- **Modify（修正）**: 既存のものを改良・改善
- **Put to other use（転用）**: 別の用途での活用法
- **Eliminate（除去）**: 不要な要素を取り除く
- **Reverse（逆転）**: 常識を覆す逆転の発想`,
    guidelines: [
      '常識を疑う視点',
      '異分野からの発想転換',
      '意外性のある組み合わせ',
      '革新的なアプローチ'
    ],
    examples: [
      '「常識の逆をやってみたら」→「意外な結果」→「新しい可能性」',
      '「A業界の成功法をB業界に」→「驚きの効果」→「応用方法」'
    ]
  },
  storytelling: {
    structure: `以下のストーリーテリング構造で投稿を作成してください：

1. **起（導入）**: 魅力的な主人公や状況設定
2. **承（展開）**: 課題や困難な状況の発生
3. **転（転換）**: 転機となる出来事や発見
4. **結（結論）**: 解決と学び、読者への示唆`,
    guidelines: [
      '共感しやすい主人公設定',
      '感情移入できるストーリー',
      '起承転結の流れを意識',
      'メッセージ性のある結末'
    ],
    examples: [
      '「ある日の出来事」→「困難な状況」→「転機の瞬間」→「学んだこと」',
      '「お客様の体験談」→「課題発生」→「解決過程」→「成功の結果」'
    ]
  }
};

/**
 * プラットフォーム別の制約とガイドライン
 */
const platformConstraints: Record<Platform, {
  characterLimit: number;
  guidelines: string[];
  tone: string;
}> = {
  twitter: {
    characterLimit: 280,
    guidelines: [
      '簡潔で印象的な表現',
      'ハッシュタグを効果的に活用',
      'リアルタイム性を重視',
      '短時間で伝わる内容'
    ],
    tone: 'カジュアルで親しみやすく、スピード感のある'
  },
  instagram: {
    characterLimit: 2200,
    guidelines: [
      'ビジュアルとの連動を意識',
      'ストーリー性のある内容',
      'エモーショナルな表現',
      'コミュニティ感を重視'
    ],
    tone: 'おしゃれで感情豊かな'
  },
  facebook: {
    characterLimit: 63206,
    guidelines: [
      '詳細な説明が可能',
      'コミュニティでの議論を促進',
      '長文でも読みやすい構成',
      'シェアしやすい内容'
    ],
    tone: '丁寧で信頼感のある'
  },
  tiktok: {
    characterLimit: 2200,
    guidelines: [
      '動画との連動重視',
      'エンターテイメント性',
      'トレンドを意識',
      '若い世代にアピール'
    ],
    tone: '楽しくてエネルギッシュな'
  },
  linkedin: {
    characterLimit: 3000,
    guidelines: [
      'プロフェッショナルな内容',
      'ビジネス価値を明確に',
      '専門性と信頼性',
      'ネットワーキング要素'
    ],
    tone: 'プロフェッショナルで価値提供する'
  },
  youtube: {
    characterLimit: 5000,
    guidelines: [
      '動画内容との連動',
      '詳細な説明文',
      'SEOを意識したキーワード',
      'エンゲージメント促進'
    ],
    tone: '詳細で情報豊富な'
  }
};

/**
 * ターゲット層別の言葉遣いとアプローチ
 */
const audienceStyles: Record<TargetAudience, {
  tone: string;
  vocabulary: string;
  approach: string;
}> = {
  teens: {
    tone: 'カジュアルで親しみやすい',
    vocabulary: '若者言葉やトレンド用語を適度に',
    approach: '感情的で直感的なアプローチ'
  },
  twenties: {
    tone: 'フレンドリーで共感性の高い',
    vocabulary: 'バランスの取れた現代的な表現',
    approach: 'ライフスタイルや体験を重視'
  },
  thirties: {
    tone: '実用的で信頼できる',
    vocabulary: '分かりやすく実践的な言葉',
    approach: '効率性とコストパフォーマンスを重視'
  },
  forties: {
    tone: '安定感があり信頼性の高い',
    vocabulary: '丁寧で落ち着いた表現',
    approach: '実績と安心感を重視'
  },
  fifties: {
    tone: '上品で品格のある',
    vocabulary: '正統的で洗練された言葉遣い',
    approach: '品質と伝統を重視'
  },
  seniors: {
    tone: '分かりやすく親切な',
    vocabulary: '馴染みやすい表現',
    approach: '安心感と信頼性を最重視'
  }
};

/**
 * 最適化されたプロンプトを生成
 */
export function generateOptimizedPrompt(
  platform: Platform,
  targetAudience: TargetAudience,
  postType: PostType,
  framework: Framework,
  keywords: string,
  basePrompt: string
): OptimizedPromptResult {
  const frameworkTemplate = frameworkPrompts[framework];
  const platformConstraint = platformConstraints[platform];
  const audienceStyle = audienceStyles[targetAudience];

  // システムプロンプト生成
  const systemPrompt = `あなたは${platform}専門のSNSマーケティングの専門家です。
${audienceStyle.tone}トーンで、${platformConstraint.tone}スタイルの投稿を作成してください。

【ターゲット】: ${targetAudience}
【投稿タイプ】: ${postType}
【フレームワーク】: ${framework}
【文字数制限】: ${platformConstraint.characterLimit}文字以内
【キーワード】: ${keywords}

【言葉遣い指針】:
- ${audienceStyle.vocabulary}
- ${audienceStyle.approach}

【プラットフォーム特性】:
${platformConstraint.guidelines.map(g => `- ${g}`).join('\n')}`;

  // メインプロンプト生成
  const prompt = `${frameworkTemplate.structure}

【基本内容】:
${basePrompt}

【必須要素】:
- ${framework}フレームワークに従った構成
- ${platform}の特性を活かした表現
- ${targetAudience}に響く言葉選び
- ${postType}に適した内容
- キーワード「${keywords}」を自然に組み込み
- ${platformConstraint.characterLimit}文字以内

【品質基準】:
${frameworkTemplate.guidelines.map(g => `- ${g}`).join('\n')}

最終的に、読み手が「${audienceStyle.approach}」と感じられる投稿を作成してください。`;

  return {
    prompt,
    systemPrompt,
    guidelines: [
      ...frameworkTemplate.guidelines,
      ...platformConstraint.guidelines
    ],
    examples: frameworkTemplate.examples
  };
}

/**
 * A/Bテスト用に複数のプロンプトバリエーションを生成
 */
export function generateABTestPrompts(
  platform: Platform,
  targetAudience: TargetAudience,
  postType: PostType,
  frameworks: Framework[],
  keywords: string,
  basePrompt: string
): OptimizedPromptResult[] {
  return frameworks.map(framework => 
    generateOptimizedPrompt(platform, targetAudience, postType, framework, keywords, basePrompt)
  );
}

/**
 * プロンプトの最適化スコアを計算
 */
export function calculatePromptScore(
  platform: Platform,
  targetAudience: TargetAudience,
  postType: PostType,
  framework: Framework,
  promptLength: number
): {
  score: number;
  factors: Array<{ factor: string; score: number; weight: number }>;
} {
  const factors = [
    {
      factor: 'フレームワーク適合性',
      score: 0.85, // フレームワークが適切に適用されているか
      weight: 0.3
    },
    {
      factor: 'プラットフォーム最適化',
      score: 0.9, // プラットフォーム特性に合っているか
      weight: 0.25
    },
    {
      factor: 'ターゲット適合性',
      score: 0.8, // ターゲット層に適した内容か
      weight: 0.25
    },
    {
      factor: '文字数適切性',
      score: Math.min(1.0, platformConstraints[platform].characterLimit / Math.max(promptLength, 1)),
      weight: 0.2
    }
  ];

  const score = factors.reduce((total, factor) => 
    total + (factor.score * factor.weight), 0
  );

  return { score, factors };
}