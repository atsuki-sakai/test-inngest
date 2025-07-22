/**
 * パラメーター最適化システム
 * プラットフォーム、ターゲット層、投稿タイプに基づいて最適なフレームワークを推奨
 */

export type Platform = 'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'youtube';
export type TargetAudience = 'teens' | 'twenties' | 'thirties' | 'forties' | 'fifties' | 'seniors';
export type PostType = 'promotion' | 'educational' | 'entertainment' | 'news' | 'lifestyle' | 'brand_awareness';
export type Framework = 'aida' | 'pas' | 'prep' | 'quest' | 'scamper' | 'storytelling';

// 重み付けマトリクス
const optimizationMatrix: Record<Platform, Record<TargetAudience, Record<PostType, Record<Framework, number>>>> = {
  twitter: {
    teens: {
      promotion: { aida: 0.7, pas: 0.5, prep: 0.3, quest: 0.6, scamper: 0.4, storytelling: 0.8 },
      educational: { aida: 0.4, pas: 0.3, prep: 0.9, quest: 0.8, scamper: 0.6, storytelling: 0.5 },
      entertainment: { aida: 0.6, pas: 0.4, prep: 0.3, quest: 0.5, scamper: 0.8, storytelling: 0.9 },
      news: { aida: 0.3, pas: 0.2, prep: 0.8, quest: 0.7, scamper: 0.3, storytelling: 0.4 },
      lifestyle: { aida: 0.5, pas: 0.6, prep: 0.4, quest: 0.6, scamper: 0.7, storytelling: 0.8 },
      brand_awareness: { aida: 0.8, pas: 0.7, prep: 0.4, quest: 0.5, scamper: 0.5, storytelling: 0.9 }
    },
    twenties: {
      promotion: { aida: 0.8, pas: 0.7, prep: 0.4, quest: 0.6, scamper: 0.5, storytelling: 0.7 },
      educational: { aida: 0.5, pas: 0.4, prep: 0.9, quest: 0.8, scamper: 0.6, storytelling: 0.6 },
      entertainment: { aida: 0.6, pas: 0.5, prep: 0.4, quest: 0.6, scamper: 0.8, storytelling: 0.8 },
      news: { aida: 0.4, pas: 0.3, prep: 0.8, quest: 0.8, scamper: 0.4, storytelling: 0.5 },
      lifestyle: { aida: 0.6, pas: 0.7, prep: 0.5, quest: 0.6, scamper: 0.7, storytelling: 0.8 },
      brand_awareness: { aida: 0.9, pas: 0.8, prep: 0.5, quest: 0.6, scamper: 0.6, storytelling: 0.8 }
    },
    thirties: {
      promotion: { aida: 0.9, pas: 0.8, prep: 0.6, quest: 0.7, scamper: 0.5, storytelling: 0.6 },
      educational: { aida: 0.6, pas: 0.5, prep: 0.9, quest: 0.8, scamper: 0.6, storytelling: 0.7 },
      entertainment: { aida: 0.5, pas: 0.4, prep: 0.5, quest: 0.6, scamper: 0.7, storytelling: 0.7 },
      news: { aida: 0.5, pas: 0.4, prep: 0.9, quest: 0.8, scamper: 0.4, storytelling: 0.6 },
      lifestyle: { aida: 0.7, pas: 0.8, prep: 0.6, quest: 0.7, scamper: 0.6, storytelling: 0.7 },
      brand_awareness: { aida: 0.9, pas: 0.8, prep: 0.6, quest: 0.7, scamper: 0.5, storytelling: 0.7 }
    },
    forties: {
      promotion: { aida: 0.9, pas: 0.9, prep: 0.7, quest: 0.7, scamper: 0.4, storytelling: 0.5 },
      educational: { aida: 0.7, pas: 0.6, prep: 0.9, quest: 0.8, scamper: 0.5, storytelling: 0.6 },
      entertainment: { aida: 0.4, pas: 0.3, prep: 0.6, quest: 0.5, scamper: 0.6, storytelling: 0.6 },
      news: { aida: 0.6, pas: 0.5, prep: 0.9, quest: 0.8, scamper: 0.3, storytelling: 0.5 },
      lifestyle: { aida: 0.8, pas: 0.8, prep: 0.7, quest: 0.7, scamper: 0.5, storytelling: 0.6 },
      brand_awareness: { aida: 0.9, pas: 0.9, prep: 0.7, quest: 0.7, scamper: 0.4, storytelling: 0.6 }
    },
    fifties: {
      promotion: { aida: 0.9, pas: 0.9, prep: 0.8, quest: 0.7, scamper: 0.3, storytelling: 0.4 },
      educational: { aida: 0.8, pas: 0.7, prep: 0.9, quest: 0.8, scamper: 0.4, storytelling: 0.5 },
      entertainment: { aida: 0.3, pas: 0.2, prep: 0.6, quest: 0.4, scamper: 0.5, storytelling: 0.5 },
      news: { aida: 0.7, pas: 0.6, prep: 0.9, quest: 0.8, scamper: 0.2, storytelling: 0.4 },
      lifestyle: { aida: 0.8, pas: 0.8, prep: 0.8, quest: 0.7, scamper: 0.4, storytelling: 0.5 },
      brand_awareness: { aida: 0.9, pas: 0.9, prep: 0.8, quest: 0.7, scamper: 0.3, storytelling: 0.5 }
    },
    seniors: {
      promotion: { aida: 0.9, pas: 0.9, prep: 0.8, quest: 0.6, scamper: 0.2, storytelling: 0.3 },
      educational: { aida: 0.8, pas: 0.7, prep: 0.9, quest: 0.7, scamper: 0.3, storytelling: 0.4 },
      entertainment: { aida: 0.2, pas: 0.1, prep: 0.5, quest: 0.3, scamper: 0.4, storytelling: 0.4 },
      news: { aida: 0.7, pas: 0.6, prep: 0.9, quest: 0.7, scamper: 0.1, storytelling: 0.3 },
      lifestyle: { aida: 0.8, pas: 0.8, prep: 0.8, quest: 0.6, scamper: 0.3, storytelling: 0.4 },
      brand_awareness: { aida: 0.9, pas: 0.9, prep: 0.8, quest: 0.6, scamper: 0.2, storytelling: 0.4 }
    }
  },
  instagram: {
    teens: {
      promotion: { aida: 0.6, pas: 0.5, prep: 0.3, quest: 0.5, scamper: 0.7, storytelling: 0.9 },
      educational: { aida: 0.4, pas: 0.3, prep: 0.8, quest: 0.7, scamper: 0.8, storytelling: 0.6 },
      entertainment: { aida: 0.5, pas: 0.4, prep: 0.3, quest: 0.4, scamper: 0.9, storytelling: 0.9 },
      news: { aida: 0.2, pas: 0.1, prep: 0.6, quest: 0.5, scamper: 0.4, storytelling: 0.5 },
      lifestyle: { aida: 0.6, pas: 0.7, prep: 0.4, quest: 0.5, scamper: 0.8, storytelling: 0.9 },
      brand_awareness: { aida: 0.7, pas: 0.6, prep: 0.3, quest: 0.4, scamper: 0.7, storytelling: 0.9 }
    },
    twenties: {
      promotion: { aida: 0.7, pas: 0.6, prep: 0.4, quest: 0.5, scamper: 0.7, storytelling: 0.8 },
      educational: { aida: 0.5, pas: 0.4, prep: 0.8, quest: 0.7, scamper: 0.8, storytelling: 0.7 },
      entertainment: { aida: 0.6, pas: 0.5, prep: 0.4, quest: 0.5, scamper: 0.8, storytelling: 0.9 },
      news: { aida: 0.3, pas: 0.2, prep: 0.6, quest: 0.6, scamper: 0.5, storytelling: 0.6 },
      lifestyle: { aida: 0.7, pas: 0.8, prep: 0.5, quest: 0.6, scamper: 0.8, storytelling: 0.9 },
      brand_awareness: { aida: 0.8, pas: 0.7, prep: 0.4, quest: 0.5, scamper: 0.7, storytelling: 0.9 }
    },
    thirties: {
      promotion: { aida: 0.8, pas: 0.7, prep: 0.5, quest: 0.6, scamper: 0.6, storytelling: 0.7 },
      educational: { aida: 0.6, pas: 0.5, prep: 0.8, quest: 0.7, scamper: 0.7, storytelling: 0.7 },
      entertainment: { aida: 0.5, pas: 0.4, prep: 0.4, quest: 0.5, scamper: 0.7, storytelling: 0.8 },
      news: { aida: 0.4, pas: 0.3, prep: 0.7, quest: 0.6, scamper: 0.4, storytelling: 0.6 },
      lifestyle: { aida: 0.8, pas: 0.8, prep: 0.6, quest: 0.6, scamper: 0.7, storytelling: 0.8 },
      brand_awareness: { aida: 0.8, pas: 0.8, prep: 0.5, quest: 0.6, scamper: 0.6, storytelling: 0.8 }
    },
    forties: {
      promotion: { aida: 0.8, pas: 0.8, prep: 0.6, quest: 0.6, scamper: 0.5, storytelling: 0.6 },
      educational: { aida: 0.7, pas: 0.6, prep: 0.8, quest: 0.7, scamper: 0.6, storytelling: 0.6 },
      entertainment: { aida: 0.4, pas: 0.3, prep: 0.5, quest: 0.4, scamper: 0.6, storytelling: 0.7 },
      news: { aida: 0.5, pas: 0.4, prep: 0.7, quest: 0.6, scamper: 0.3, storytelling: 0.5 },
      lifestyle: { aida: 0.8, pas: 0.8, prep: 0.6, quest: 0.6, scamper: 0.6, storytelling: 0.7 },
      brand_awareness: { aida: 0.8, pas: 0.8, prep: 0.6, quest: 0.6, scamper: 0.5, storytelling: 0.7 }
    },
    fifties: {
      promotion: { aida: 0.8, pas: 0.8, prep: 0.7, quest: 0.6, scamper: 0.4, storytelling: 0.5 },
      educational: { aida: 0.7, pas: 0.6, prep: 0.8, quest: 0.7, scamper: 0.5, storytelling: 0.5 },
      entertainment: { aida: 0.3, pas: 0.2, prep: 0.5, quest: 0.3, scamper: 0.5, storytelling: 0.6 },
      news: { aida: 0.6, pas: 0.5, prep: 0.7, quest: 0.6, scamper: 0.2, storytelling: 0.4 },
      lifestyle: { aida: 0.8, pas: 0.8, prep: 0.7, quest: 0.6, scamper: 0.5, storytelling: 0.6 },
      brand_awareness: { aida: 0.8, pas: 0.8, prep: 0.7, quest: 0.6, scamper: 0.4, storytelling: 0.6 }
    },
    seniors: {
      promotion: { aida: 0.8, pas: 0.8, prep: 0.7, quest: 0.5, scamper: 0.3, storytelling: 0.4 },
      educational: { aida: 0.7, pas: 0.6, prep: 0.8, quest: 0.6, scamper: 0.4, storytelling: 0.4 },
      entertainment: { aida: 0.2, pas: 0.1, prep: 0.4, quest: 0.2, scamper: 0.4, storytelling: 0.5 },
      news: { aida: 0.6, pas: 0.5, prep: 0.7, quest: 0.5, scamper: 0.1, storytelling: 0.3 },
      lifestyle: { aida: 0.8, pas: 0.8, prep: 0.7, quest: 0.5, scamper: 0.4, storytelling: 0.5 },
      brand_awareness: { aida: 0.8, pas: 0.8, prep: 0.7, quest: 0.5, scamper: 0.3, storytelling: 0.5 }
    }
  },
  // 他のプラットフォームも同様の構造で実装
  facebook: {
    teens: {
      promotion: { aida: 0.5, pas: 0.4, prep: 0.3, quest: 0.4, scamper: 0.5, storytelling: 0.7 },
      educational: { aida: 0.4, pas: 0.3, prep: 0.8, quest: 0.7, scamper: 0.6, storytelling: 0.6 },
      entertainment: { aida: 0.4, pas: 0.3, prep: 0.3, quest: 0.4, scamper: 0.7, storytelling: 0.8 },
      news: { aida: 0.3, pas: 0.2, prep: 0.7, quest: 0.6, scamper: 0.3, storytelling: 0.4 },
      lifestyle: { aida: 0.5, pas: 0.6, prep: 0.4, quest: 0.5, scamper: 0.6, storytelling: 0.8 },
      brand_awareness: { aida: 0.6, pas: 0.5, prep: 0.3, quest: 0.4, scamper: 0.5, storytelling: 0.8 }
    },
    // 他の年代も同様...
    twenties: { promotion: { aida: 0.7, pas: 0.6, prep: 0.4, quest: 0.5, scamper: 0.5, storytelling: 0.7 }, educational: { aida: 0.5, pas: 0.4, prep: 0.8, quest: 0.7, scamper: 0.6, storytelling: 0.6 }, entertainment: { aida: 0.5, pas: 0.4, prep: 0.4, quest: 0.5, scamper: 0.7, storytelling: 0.8 }, news: { aida: 0.4, pas: 0.3, prep: 0.7, quest: 0.7, scamper: 0.4, storytelling: 0.5 }, lifestyle: { aida: 0.6, pas: 0.7, prep: 0.5, quest: 0.6, scamper: 0.6, storytelling: 0.8 }, brand_awareness: { aida: 0.7, pas: 0.6, prep: 0.4, quest: 0.5, scamper: 0.5, storytelling: 0.8 } },
    thirties: { promotion: { aida: 0.8, pas: 0.7, prep: 0.5, quest: 0.6, scamper: 0.5, storytelling: 0.6 }, educational: { aida: 0.6, pas: 0.5, prep: 0.8, quest: 0.7, scamper: 0.6, storytelling: 0.6 }, entertainment: { aida: 0.5, pas: 0.4, prep: 0.4, quest: 0.5, scamper: 0.6, storytelling: 0.7 }, news: { aida: 0.5, pas: 0.4, prep: 0.8, quest: 0.7, scamper: 0.3, storytelling: 0.5 }, lifestyle: { aida: 0.7, pas: 0.8, prep: 0.6, quest: 0.6, scamper: 0.6, storytelling: 0.7 }, brand_awareness: { aida: 0.8, pas: 0.7, prep: 0.5, quest: 0.6, scamper: 0.5, storytelling: 0.7 } },
    forties: { promotion: { aida: 0.8, pas: 0.8, prep: 0.6, quest: 0.6, scamper: 0.4, storytelling: 0.5 }, educational: { aida: 0.7, pas: 0.6, prep: 0.8, quest: 0.7, scamper: 0.5, storytelling: 0.6 }, entertainment: { aida: 0.4, pas: 0.3, prep: 0.5, quest: 0.4, scamper: 0.5, storytelling: 0.6 }, news: { aida: 0.6, pas: 0.5, prep: 0.8, quest: 0.7, scamper: 0.3, storytelling: 0.4 }, lifestyle: { aida: 0.8, pas: 0.8, prep: 0.6, quest: 0.6, scamper: 0.5, storytelling: 0.6 }, brand_awareness: { aida: 0.8, pas: 0.8, prep: 0.6, quest: 0.6, scamper: 0.4, storytelling: 0.6 } },
    fifties: { promotion: { aida: 0.8, pas: 0.8, prep: 0.7, quest: 0.6, scamper: 0.3, storytelling: 0.4 }, educational: { aida: 0.7, pas: 0.6, prep: 0.8, quest: 0.7, scamper: 0.4, storytelling: 0.5 }, entertainment: { aida: 0.3, pas: 0.2, prep: 0.5, quest: 0.3, scamper: 0.4, storytelling: 0.5 }, news: { aida: 0.7, pas: 0.6, prep: 0.8, quest: 0.7, scamper: 0.2, storytelling: 0.3 }, lifestyle: { aida: 0.8, pas: 0.8, prep: 0.7, quest: 0.6, scamper: 0.4, storytelling: 0.5 }, brand_awareness: { aida: 0.8, pas: 0.8, prep: 0.7, quest: 0.6, scamper: 0.3, storytelling: 0.5 } },
    seniors: { promotion: { aida: 0.8, pas: 0.8, prep: 0.7, quest: 0.5, scamper: 0.2, storytelling: 0.3 }, educational: { aida: 0.7, pas: 0.6, prep: 0.8, quest: 0.6, scamper: 0.3, storytelling: 0.4 }, entertainment: { aida: 0.2, pas: 0.1, prep: 0.4, quest: 0.2, scamper: 0.3, storytelling: 0.4 }, news: { aida: 0.7, pas: 0.6, prep: 0.8, quest: 0.6, scamper: 0.1, storytelling: 0.2 }, lifestyle: { aida: 0.8, pas: 0.8, prep: 0.7, quest: 0.5, scamper: 0.3, storytelling: 0.4 }, brand_awareness: { aida: 0.8, pas: 0.8, prep: 0.7, quest: 0.5, scamper: 0.2, storytelling: 0.4 } }
  },
  tiktok: {
    teens: { promotion: { aida: 0.5, pas: 0.4, prep: 0.2, quest: 0.4, scamper: 0.9, storytelling: 0.9 }, educational: { aida: 0.3, pas: 0.2, prep: 0.6, quest: 0.5, scamper: 0.9, storytelling: 0.7 }, entertainment: { aida: 0.4, pas: 0.3, prep: 0.2, quest: 0.3, scamper: 0.9, storytelling: 0.9 }, news: { aida: 0.1, pas: 0.1, prep: 0.4, quest: 0.3, scamper: 0.6, storytelling: 0.5 }, lifestyle: { aida: 0.4, pas: 0.5, prep: 0.3, quest: 0.4, scamper: 0.9, storytelling: 0.9 }, brand_awareness: { aida: 0.5, pas: 0.4, prep: 0.2, quest: 0.3, scamper: 0.8, storytelling: 0.9 } },
    twenties: { promotion: { aida: 0.6, pas: 0.5, prep: 0.3, quest: 0.4, scamper: 0.8, storytelling: 0.8 }, educational: { aida: 0.4, pas: 0.3, prep: 0.6, quest: 0.6, scamper: 0.8, storytelling: 0.7 }, entertainment: { aida: 0.5, pas: 0.4, prep: 0.3, quest: 0.4, scamper: 0.9, storytelling: 0.9 }, news: { aida: 0.2, pas: 0.1, prep: 0.5, quest: 0.4, scamper: 0.6, storytelling: 0.6 }, lifestyle: { aida: 0.5, pas: 0.6, prep: 0.4, quest: 0.5, scamper: 0.8, storytelling: 0.9 }, brand_awareness: { aida: 0.6, pas: 0.5, prep: 0.3, quest: 0.4, scamper: 0.8, storytelling: 0.9 } },
    thirties: { promotion: { aida: 0.6, pas: 0.5, prep: 0.4, quest: 0.5, scamper: 0.7, storytelling: 0.7 }, educational: { aida: 0.5, pas: 0.4, prep: 0.7, quest: 0.6, scamper: 0.7, storytelling: 0.6 }, entertainment: { aida: 0.4, pas: 0.3, prep: 0.3, quest: 0.4, scamper: 0.8, storytelling: 0.8 }, news: { aida: 0.3, pas: 0.2, prep: 0.6, quest: 0.5, scamper: 0.5, storytelling: 0.5 }, lifestyle: { aida: 0.6, pas: 0.6, prep: 0.5, quest: 0.5, scamper: 0.7, storytelling: 0.8 }, brand_awareness: { aida: 0.6, pas: 0.6, prep: 0.4, quest: 0.5, scamper: 0.7, storytelling: 0.8 } },
    forties: { promotion: { aida: 0.5, pas: 0.5, prep: 0.5, quest: 0.5, scamper: 0.6, storytelling: 0.6 }, educational: { aida: 0.5, pas: 0.4, prep: 0.7, quest: 0.6, scamper: 0.6, storytelling: 0.5 }, entertainment: { aida: 0.3, pas: 0.2, prep: 0.4, quest: 0.3, scamper: 0.6, storytelling: 0.6 }, news: { aida: 0.4, pas: 0.3, prep: 0.6, quest: 0.5, scamper: 0.4, storytelling: 0.4 }, lifestyle: { aida: 0.6, pas: 0.6, prep: 0.5, quest: 0.5, scamper: 0.6, storytelling: 0.7 }, brand_awareness: { aida: 0.6, pas: 0.5, prep: 0.5, quest: 0.5, scamper: 0.6, storytelling: 0.7 } },
    fifties: { promotion: { aida: 0.4, pas: 0.4, prep: 0.5, quest: 0.4, scamper: 0.5, storytelling: 0.5 }, educational: { aida: 0.5, pas: 0.4, prep: 0.7, quest: 0.6, scamper: 0.5, storytelling: 0.4 }, entertainment: { aida: 0.2, pas: 0.1, prep: 0.3, quest: 0.2, scamper: 0.5, storytelling: 0.5 }, news: { aida: 0.4, pas: 0.3, prep: 0.6, quest: 0.5, scamper: 0.3, storytelling: 0.3 }, lifestyle: { aida: 0.5, pas: 0.5, prep: 0.5, quest: 0.4, scamper: 0.5, storytelling: 0.6 }, brand_awareness: { aida: 0.5, pas: 0.4, prep: 0.5, quest: 0.4, scamper: 0.5, storytelling: 0.6 } },
    seniors: { promotion: { aida: 0.3, pas: 0.3, prep: 0.4, quest: 0.3, scamper: 0.4, storytelling: 0.4 }, educational: { aida: 0.4, pas: 0.3, prep: 0.6, quest: 0.5, scamper: 0.4, storytelling: 0.3 }, entertainment: { aida: 0.1, pas: 0.1, prep: 0.2, quest: 0.1, scamper: 0.4, storytelling: 0.4 }, news: { aida: 0.3, pas: 0.2, prep: 0.5, quest: 0.4, scamper: 0.2, storytelling: 0.2 }, lifestyle: { aida: 0.4, pas: 0.4, prep: 0.4, quest: 0.3, scamper: 0.4, storytelling: 0.5 }, brand_awareness: { aida: 0.4, pas: 0.3, prep: 0.4, quest: 0.3, scamper: 0.4, storytelling: 0.5 } }
  },
  linkedin: {
    teens: { promotion: { aida: 0.6, pas: 0.5, prep: 0.7, quest: 0.8, scamper: 0.3, storytelling: 0.4 }, educational: { aida: 0.7, pas: 0.6, prep: 0.9, quest: 0.9, scamper: 0.5, storytelling: 0.6 }, entertainment: { aida: 0.2, pas: 0.1, prep: 0.3, quest: 0.2, scamper: 0.4, storytelling: 0.3 }, news: { aida: 0.5, pas: 0.4, prep: 0.8, quest: 0.8, scamper: 0.3, storytelling: 0.4 }, lifestyle: { aida: 0.4, pas: 0.3, prep: 0.6, quest: 0.5, scamper: 0.3, storytelling: 0.4 }, brand_awareness: { aida: 0.7, pas: 0.6, prep: 0.7, quest: 0.7, scamper: 0.4, storytelling: 0.5 } },
    twenties: { promotion: { aida: 0.8, pas: 0.7, prep: 0.8, quest: 0.8, scamper: 0.4, storytelling: 0.5 }, educational: { aida: 0.8, pas: 0.7, prep: 0.9, quest: 0.9, scamper: 0.6, storytelling: 0.7 }, entertainment: { aida: 0.3, pas: 0.2, prep: 0.4, quest: 0.3, scamper: 0.4, storytelling: 0.4 }, news: { aida: 0.6, pas: 0.5, prep: 0.8, quest: 0.8, scamper: 0.4, storytelling: 0.5 }, lifestyle: { aida: 0.5, pas: 0.4, prep: 0.6, quest: 0.6, scamper: 0.4, storytelling: 0.5 }, brand_awareness: { aida: 0.8, pas: 0.7, prep: 0.8, quest: 0.8, scamper: 0.5, storytelling: 0.6 } },
    thirties: { promotion: { aida: 0.9, pas: 0.8, prep: 0.8, quest: 0.8, scamper: 0.5, storytelling: 0.6 }, educational: { aida: 0.8, pas: 0.7, prep: 0.9, quest: 0.9, scamper: 0.6, storytelling: 0.7 }, entertainment: { aida: 0.3, pas: 0.2, prep: 0.4, quest: 0.3, scamper: 0.4, storytelling: 0.4 }, news: { aida: 0.7, pas: 0.6, prep: 0.9, quest: 0.8, scamper: 0.4, storytelling: 0.5 }, lifestyle: { aida: 0.6, pas: 0.5, prep: 0.7, quest: 0.6, scamper: 0.4, storytelling: 0.5 }, brand_awareness: { aida: 0.9, pas: 0.8, prep: 0.8, quest: 0.8, scamper: 0.5, storytelling: 0.6 } },
    forties: { promotion: { aida: 0.9, pas: 0.9, prep: 0.9, quest: 0.8, scamper: 0.4, storytelling: 0.5 }, educational: { aida: 0.8, pas: 0.8, prep: 0.9, quest: 0.9, scamper: 0.5, storytelling: 0.6 }, entertainment: { aida: 0.2, pas: 0.1, prep: 0.3, quest: 0.2, scamper: 0.3, storytelling: 0.3 }, news: { aida: 0.8, pas: 0.7, prep: 0.9, quest: 0.8, scamper: 0.3, storytelling: 0.4 }, lifestyle: { aida: 0.6, pas: 0.6, prep: 0.7, quest: 0.6, scamper: 0.3, storytelling: 0.4 }, brand_awareness: { aida: 0.9, pas: 0.9, prep: 0.9, quest: 0.8, scamper: 0.4, storytelling: 0.5 } },
    fifties: { promotion: { aida: 0.9, pas: 0.9, prep: 0.9, quest: 0.8, scamper: 0.3, storytelling: 0.4 }, educational: { aida: 0.8, pas: 0.8, prep: 0.9, quest: 0.9, scamper: 0.4, storytelling: 0.5 }, entertainment: { aida: 0.1, pas: 0.1, prep: 0.2, quest: 0.1, scamper: 0.2, storytelling: 0.2 }, news: { aida: 0.8, pas: 0.7, prep: 0.9, quest: 0.8, scamper: 0.2, storytelling: 0.3 }, lifestyle: { aida: 0.6, pas: 0.6, prep: 0.7, quest: 0.6, scamper: 0.3, storytelling: 0.3 }, brand_awareness: { aida: 0.9, pas: 0.9, prep: 0.9, quest: 0.8, scamper: 0.3, storytelling: 0.4 } },
    seniors: { promotion: { aida: 0.9, pas: 0.9, prep: 0.9, quest: 0.7, scamper: 0.2, storytelling: 0.3 }, educational: { aida: 0.8, pas: 0.8, prep: 0.9, quest: 0.8, scamper: 0.3, storytelling: 0.4 }, entertainment: { aida: 0.1, pas: 0.1, prep: 0.1, quest: 0.1, scamper: 0.1, storytelling: 0.1 }, news: { aida: 0.8, pas: 0.7, prep: 0.9, quest: 0.7, scamper: 0.1, storytelling: 0.2 }, lifestyle: { aida: 0.6, pas: 0.6, prep: 0.7, quest: 0.5, scamper: 0.2, storytelling: 0.2 }, brand_awareness: { aida: 0.9, pas: 0.9, prep: 0.9, quest: 0.7, scamper: 0.2, storytelling: 0.3 } }
  },
  youtube: {
    teens: { promotion: { aida: 0.6, pas: 0.5, prep: 0.4, quest: 0.5, scamper: 0.7, storytelling: 0.9 }, educational: { aida: 0.5, pas: 0.4, prep: 0.8, quest: 0.8, scamper: 0.7, storytelling: 0.8 }, entertainment: { aida: 0.4, pas: 0.3, prep: 0.3, quest: 0.4, scamper: 0.8, storytelling: 0.9 }, news: { aida: 0.3, pas: 0.2, prep: 0.7, quest: 0.6, scamper: 0.4, storytelling: 0.6 }, lifestyle: { aida: 0.5, pas: 0.6, prep: 0.5, quest: 0.5, scamper: 0.7, storytelling: 0.9 }, brand_awareness: { aida: 0.7, pas: 0.6, prep: 0.4, quest: 0.5, scamper: 0.6, storytelling: 0.9 } },
    twenties: { promotion: { aida: 0.7, pas: 0.6, prep: 0.5, quest: 0.6, scamper: 0.7, storytelling: 0.8 }, educational: { aida: 0.6, pas: 0.5, prep: 0.8, quest: 0.8, scamper: 0.7, storytelling: 0.8 }, entertainment: { aida: 0.5, pas: 0.4, prep: 0.4, quest: 0.5, scamper: 0.8, storytelling: 0.9 }, news: { aida: 0.4, pas: 0.3, prep: 0.7, quest: 0.7, scamper: 0.5, storytelling: 0.6 }, lifestyle: { aida: 0.6, pas: 0.7, prep: 0.5, quest: 0.6, scamper: 0.7, storytelling: 0.9 }, brand_awareness: { aida: 0.8, pas: 0.7, prep: 0.5, quest: 0.6, scamper: 0.6, storytelling: 0.9 } },
    thirties: { promotion: { aida: 0.8, pas: 0.7, prep: 0.6, quest: 0.6, scamper: 0.6, storytelling: 0.7 }, educational: { aida: 0.7, pas: 0.6, prep: 0.8, quest: 0.8, scamper: 0.7, storytelling: 0.8 }, entertainment: { aida: 0.5, pas: 0.4, prep: 0.5, quest: 0.5, scamper: 0.7, storytelling: 0.8 }, news: { aida: 0.5, pas: 0.4, prep: 0.8, quest: 0.7, scamper: 0.4, storytelling: 0.6 }, lifestyle: { aida: 0.7, pas: 0.7, prep: 0.6, quest: 0.6, scamper: 0.6, storytelling: 0.8 }, brand_awareness: { aida: 0.8, pas: 0.8, prep: 0.6, quest: 0.6, scamper: 0.6, storytelling: 0.8 } },
    forties: { promotion: { aida: 0.8, pas: 0.8, prep: 0.7, quest: 0.7, scamper: 0.5, storytelling: 0.6 }, educational: { aida: 0.7, pas: 0.7, prep: 0.8, quest: 0.8, scamper: 0.6, storytelling: 0.7 }, entertainment: { aida: 0.4, pas: 0.3, prep: 0.5, quest: 0.4, scamper: 0.6, storytelling: 0.7 }, news: { aida: 0.6, pas: 0.5, prep: 0.8, quest: 0.7, scamper: 0.3, storytelling: 0.5 }, lifestyle: { aida: 0.7, pas: 0.8, prep: 0.7, quest: 0.6, scamper: 0.5, storytelling: 0.7 }, brand_awareness: { aida: 0.8, pas: 0.8, prep: 0.7, quest: 0.7, scamper: 0.5, storytelling: 0.7 } },
    fifties: { promotion: { aida: 0.8, pas: 0.8, prep: 0.8, quest: 0.7, scamper: 0.4, storytelling: 0.5 }, educational: { aida: 0.7, pas: 0.7, prep: 0.8, quest: 0.8, scamper: 0.5, storytelling: 0.6 }, entertainment: { aida: 0.3, pas: 0.2, prep: 0.5, quest: 0.3, scamper: 0.5, storytelling: 0.6 }, news: { aida: 0.7, pas: 0.6, prep: 0.8, quest: 0.7, scamper: 0.2, storytelling: 0.4 }, lifestyle: { aida: 0.7, pas: 0.8, prep: 0.7, quest: 0.6, scamper: 0.4, storytelling: 0.6 }, brand_awareness: { aida: 0.8, pas: 0.8, prep: 0.8, quest: 0.7, scamper: 0.4, storytelling: 0.6 } },
    seniors: { promotion: { aida: 0.8, pas: 0.8, prep: 0.8, quest: 0.6, scamper: 0.3, storytelling: 0.4 }, educational: { aida: 0.7, pas: 0.7, prep: 0.8, quest: 0.7, scamper: 0.4, storytelling: 0.5 }, entertainment: { aida: 0.2, pas: 0.1, prep: 0.4, quest: 0.2, scamper: 0.4, storytelling: 0.5 }, news: { aida: 0.7, pas: 0.6, prep: 0.8, quest: 0.6, scamper: 0.1, storytelling: 0.3 }, lifestyle: { aida: 0.7, pas: 0.8, prep: 0.7, quest: 0.5, scamper: 0.3, storytelling: 0.5 }, brand_awareness: { aida: 0.8, pas: 0.8, prep: 0.8, quest: 0.6, scamper: 0.3, storytelling: 0.5 } }
  }
};

export interface OptimizationRecommendation {
  framework: Framework;
  score: number;
  reason: string;
}

export interface OptimizationResult {
  primary: OptimizationRecommendation;
  alternatives: OptimizationRecommendation[];
  confidence: number;
  insights: string[];
}

/**
 * 最適なフレームワークを計算
 */
export function calculateOptimalFramework(
  platform: Platform,
  targetAudience: TargetAudience,
  postType: PostType
): OptimizationResult {
  const weights = optimizationMatrix[platform]?.[targetAudience]?.[postType];
  
  if (!weights) {
    throw new Error(`Optimization data not found for ${platform}-${targetAudience}-${postType}`);
  }

  // フレームワークの説明
  const frameworkDescriptions: Record<Framework, string> = {
    aida: 'Attention → Interest → Desire → Action - 注目を集めて行動を促す',
    pas: 'Problem → Agitation → Solution - 問題を明確化して解決策を提示',
    prep: 'Point → Reason → Example → Point - 論理的で説得力のある構成',
    quest: 'Question → Understand → Educate → Stimulate → Transition - 質問で始まり教育的内容',
    scamper: 'Substitute → Combine → Adapt → Modify → Put to other use → Eliminate → Reverse - 創造的思考',
    storytelling: 'ストーリーテリング - 物語形式で感情に訴える'
  };

  // スコア順でソート
  const sortedFrameworks = Object.entries(weights)
    .map(([framework, score]) => ({
      framework: framework as Framework,
      score,
      reason: frameworkDescriptions[framework as Framework]
    }))
    .sort((a, b) => b.score - a.score);

  const primary = sortedFrameworks[0];
  const alternatives = sortedFrameworks.slice(1, 4); // 上位3つの代替案

  // 信頼度計算（最高スコアと2番目のスコア差が大きいほど信頼度が高い）
  const confidence = sortedFrameworks.length > 1 
    ? Math.min(95, Math.round((primary.score - sortedFrameworks[1].score) * 100 + 70))
    : 90;

  // インサイト生成
  const insights = generateInsights(platform, targetAudience, postType, primary.framework);

  return {
    primary,
    alternatives,
    confidence,
    insights
  };
}

/**
 * インサイト生成
 */
function generateInsights(
  platform: Platform,
  targetAudience: TargetAudience,
  postType: PostType,
  framework: Framework
): string[] {
  const insights: string[] = [];

  // プラットフォーム特有のインサイト
  const platformInsights: Record<Platform, string[]> = {
    twitter: [
      '短文で簡潔に',
      'ハッシュタグを効果的に活用',
      'リアルタイム性を重視'
    ],
    instagram: [
      'ビジュアル重視のコンテンツ',
      'ストーリーズも活用',
      'インフルエンサー要素を考慮'
    ],
    facebook: [
      '詳細な説明文が効果的',
      'コミュニティ要素を活用',
      'シェアしやすい内容'
    ],
    tiktok: [
      '動画前半でのフック重要',
      'トレンドを意識',
      'エンターテイメント性重視'
    ],
    linkedin: [
      'プロフェッショナル性重視',
      '専門性と信頼性',
      'ビジネス価値を明確に'
    ],
    youtube: [
      'サムネイルとタイトル重要',
      '長尺コンテンツ対応',
      'エンゲージメント維持'
    ]
  };

  // ターゲット層別インサイト
  const audienceInsights: Record<TargetAudience, string[]> = {
    teens: ['トレンド重視', '感情的アプローチ', 'シンプルな言葉遣い'],
    twenties: ['ライフスタイル重視', '体験価値', '社会性'],
    thirties: ['実用性重視', '時間効率', 'コストパフォーマンス'],
    forties: ['信頼性重視', '実績重視', '安定性'],
    fifties: ['品質重視', '伝統重視', '詳細説明'],
    seniors: ['分かりやすさ重視', '安心感', '信頼できる情報源']
  };

  // フレームワーク別インサイト
  const frameworkInsights: Record<Framework, string[]> = {
    aida: ['強いフック文で注目獲得', '感情に訴える内容', '明確なCTA'],
    pas: ['問題の共感ポイント', '解決策の具体性', '緊急性の演出'],
    prep: ['論理的構成', 'データと事例', '説得力のある結論'],
    quest: ['質問で関心喚起', '教育的価値', '段階的理解'],
    scamper: ['創造性重視', '新しい視点', '驚きの要素'],
    storytelling: ['感情移入しやすい主人公', '起承転結', '共感できる体験']
  };

  insights.push(...platformInsights[platform]);
  insights.push(...audienceInsights[targetAudience]);
  insights.push(...frameworkInsights[framework]);

  return insights.slice(0, 5); // 上位5つのインサイト
}

/**
 * A/Bテスト用の複数フレームワーク推奨
 */
export function getABTestFrameworks(
  platform: Platform,
  targetAudience: TargetAudience,
  postType: PostType,
  count: number = 2
): Framework[] {
  const result = calculateOptimalFramework(platform, targetAudience, postType);
  const frameworks = [result.primary, ...result.alternatives]
    .slice(0, count)
    .map(rec => rec.framework);
  
  return frameworks;
}

/**
 * 成果データからの学習機能（将来拡張用）
 */
export function updateOptimizationWeights(
  platform: Platform,
  targetAudience: TargetAudience,
  postType: PostType,
  framework: Framework,
  performance: number
): void {
  // 将来的にはここで実際の成果データから重みを調整
  // 現在は実装の準備のみ
  console.log('Performance data received:', {
    platform,
    targetAudience,
    postType,
    framework,
    performance
  });
}