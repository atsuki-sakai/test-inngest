import { useState, useCallback, useMemo } from 'react';
import {
  calculateOptimalFramework,
  getABTestFrameworks,
  type Platform,
  type TargetAudience,
  type PostType,
  type Framework,
  type OptimizationResult
} from '@/lib/optimization';

export interface OptimizationHookResult {
  // 最適化結果
  optimization: OptimizationResult | null;
  
  // 推奨フレームワーク
  recommendedFrameworks: Framework[];
  
  // A/Bテスト用フレームワーク
  abTestFrameworks: Framework[];
  
  // 最適化実行
  optimize: (platform: Platform, targetAudience: TargetAudience, postType: PostType) => void;
  
  // 状態
  isOptimizing: boolean;
  error: string | null;
  
  // フレームワーク情報
  getFrameworkLabel: (framework: Framework) => string;
  getFrameworkDescription: (framework: Framework) => string;
}

/**
 * パラメーター最適化フック
 */
export function useOptimization(): OptimizationHookResult {
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // フレームワークのラベル
  const frameworkLabels: Record<Framework, string> = {
    aida: 'AIDA',
    pas: 'PAS',
    prep: 'PREP',
    quest: 'QUEST',
    scamper: 'SCAMPER',
    storytelling: 'ストーリーテリング'
  };

  // フレームワークの詳細説明
  const frameworkDescriptions: Record<Framework, string> = {
    aida: 'Attention(注目) → Interest(関心) → Desire(欲求) → Action(行動) の順序で構成',
    pas: 'Problem(問題提起) → Agitation(問題の煽り) → Solution(解決策) で訴求',
    prep: 'Point(結論) → Reason(理由) → Example(具体例) → Point(結論) の論理構成',
    quest: 'Question(質問) → Understand(理解) → Educate(教育) → Stimulate(刺激) → Transition(行動)',
    scamper: '創造的思考法：代替・結合・適応・修正・転用・除去・逆転の7つの視点',
    storytelling: '物語形式で感情に訴えかける構成。起承転結を意識した展開'
  };

  const optimize = useCallback((platform: Platform, targetAudience: TargetAudience, postType: PostType) => {
    setIsOptimizing(true);
    setError(null);
    
    try {
      const result = calculateOptimalFramework(platform, targetAudience, postType);
      setOptimization(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '最適化処理でエラーが発生しました');
      setOptimization(null);
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  // 推奨フレームワーク
  const recommendedFrameworks = useMemo(() => {
    if (!optimization) return [];
    return [optimization.primary, ...optimization.alternatives].map(rec => rec.framework);
  }, [optimization]);

  // A/Bテスト用フレームワーク
  const abTestFrameworks = useMemo(() => {
    if (!optimization) return [];
    // 上位2つのフレームワークを返す
    return [optimization.primary, optimization.alternatives[0]].map(rec => rec.framework);
  }, [optimization]);

  const getFrameworkLabel = useCallback((framework: Framework) => {
    return frameworkLabels[framework];
  }, []);

  const getFrameworkDescription = useCallback((framework: Framework) => {
    return frameworkDescriptions[framework];
  }, []);

  return {
    optimization,
    recommendedFrameworks,
    abTestFrameworks,
    optimize,
    isOptimizing,
    error,
    getFrameworkLabel,
    getFrameworkDescription
  };
}