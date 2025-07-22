"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Brain, 
  Zap, 
  Star,
  Sparkles,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOptimization } from "@/hooks/useOptimization";
import { type Platform, type TargetAudience, type PostType } from "@/lib/optimization";

interface OptimizationGuideProps {
  platform: string;
  targetAudience: string;
  postType: string;
  onFrameworkSelect?: (frameworks: string[]) => void;
  className?: string;
}

export const OptimizationGuide: React.FC<OptimizationGuideProps> = ({
  platform,
  targetAudience,
  postType,
  onFrameworkSelect,
  className = ""
}) => {
  const {
    optimization,
    recommendedFrameworks,
    abTestFrameworks,
    optimize,
    isOptimizing,
    error,
    getFrameworkLabel,
    getFrameworkDescription
  } = useOptimization();

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'single' | 'ab'>('single');

  // パラメーターが変更されたら自動で最適化実行
  useEffect(() => {
    if (platform && targetAudience && postType) {
      optimize(platform as Platform, targetAudience as TargetAudience, postType as PostType);
    }
  }, [platform, targetAudience, postType, optimize]);

  // フレームワーク選択時のハンドラー
  const handleFrameworkSelect = (frameworks: string[]) => {
    onFrameworkSelect?.(frameworks);
  };

  // 信頼度に基づく色
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-green-600 bg-green-50 border-green-600";
    if (confidence >= 70) return "text-amber-600 bg-amber-50 border-amber-600";
    return "text-red-600 bg-red-50 border-red-600";
  };


  if (!platform || !targetAudience || !postType) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>プラットフォーム、ターゲット層、投稿タイプを選択すると<br />最適化ガイドが表示されます</p>
        </CardContent>
      </Card>
    );
  }

  if (isOptimizing) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-2 animate-pulse text-indigo-500" />
          <p>最適なフレームワークを分析中...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-red-600">
          <p>最適化エラー: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!optimization) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-indigo-500" />
            最適化ガイド
          </CardTitle>
         
        </div>
        <CardDescription className="text-xs md:text-sm text-gray-600">
          {platform} × {targetAudience} × {postType} に最適化された推奨
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 推奨フレームワーク */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row  md:items-center justify-between gap-2">
            <h4 className="flex items-center text-xs md:text-sm gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              推奨される思考フレームワーク
            </h4>
            <Badge className={getConfidenceColor(optimization.confidence)}>
              信頼度 {optimization.confidence}%
            </Badge>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border"
          >
            <div className="flex flex-col md:flex-row items-center justify-between mb-2">
              <span className="font-semibold text-sm text-indigo-700">
                {getFrameworkLabel(optimization.primary.framework)}
              </span>
              <div className="flex items-center gap-2">
                <Progress value={optimization.primary.score * 100} className="w-16 h-2" />
                <span className="text-xs font-medium">{Math.round(optimization.primary.score * 100)}%</span>
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mb-3">
              {optimization.primary.reason}
            </p>
            <Button
              size="sm"
              onClick={() => handleFrameworkSelect([optimization.primary.framework])}
              className=" text-xs md:text-sm bg-indigo-600 hover:bg-indigo-700"
            >
              <Zap className="h-3 w-3 mr-1 hidden md:block" />
              このフレームワークを使用
            </Button>
          </motion.div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">  <BarChart3 className="h-4 w-4 text-purple-500" />
        <span className="text-sm font-medium">フレームワークの最適化</span></div>
          <div className="flex flex-col md:flex-row gap-2">
            <Button
              variant={selectedMode === 'single' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMode('single')}
            >
              単一フレームワーク
            </Button>
            <Button
              variant={selectedMode === 'ab' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMode('ab')}
            >
              相乗効果モード
            </Button>
          </div>
        </div>

        {selectedMode === 'ab' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="space-y-2">
              <h4 className="flex items-center text-xs md:text-sm gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                相乗効果モード推奨組み合わせ
              </h4>
              <div className="grid gap-2">
                {abTestFrameworks.map((framework, index) => (
                  <div key={framework} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border">
                    <span className="font-semibold text-xs md:text-sm">
                      ・{getFrameworkLabel(framework)}
                    </span>
                    <Badge className="text-xs">
                      {Math.round((optimization.alternatives.find(alt => alt.framework === framework)?.score || optimization.primary.score) * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                variant="default"
                onClick={() => handleFrameworkSelect(abTestFrameworks)}
                className="w-full mt-2 text-xs md:text-sm"
              >
                <BarChart3 className="h-3 w-3 mr-1 hidden md:block" />
                A/Bテスト用フレームワークを使用
              </Button>
            </div>
          </motion.div>
        )}

        <Separator />

        {/* 詳細情報（展開時） */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* 代替案 */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  代替フレームワーク
                </h4>
                <div className="grid gap-2">
                  {optimization.alternatives.slice(0, 3).map((alt) => (
                    <div key={alt.framework} className="flex flex-col md:flex-row items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium text-xs md:text-sm">{getFrameworkLabel(alt.framework)}</span>
                        <p className="text-xs md:text-sm text-gray-600">{getFrameworkDescription(alt.framework)}</p>
                      </div>
                      <div className="flex items-center justify-end w-full gap-2">
                        <Progress value={alt.score * 100} className="w-12 h-1" />
                        <span className="text-xs">{Math.round(alt.score * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* インサイト */}
              <div className="space-y-2">
                <h4 className="flex items-center text-xs md:text-sm gap-2">
                  <Lightbulb className="h-4 w-4 text-orange-500" />
                  最適化インサイト
                </h4>
                <div className="grid gap-2">
                  {optimization.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 rounded text-xs md:text-sm">
                      <div className="h-1.5 w-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default OptimizationGuide;