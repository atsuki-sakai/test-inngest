  "use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, Wand2, Search, Download, Globe, Bot, MapPin, Users, Hash, Brain, CheckSquare, Clock } from "lucide-react";
import { AREA_URL_MAP } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import TaskProgress from "@/components/TaskProgress";
import OptimizationGuide from "@/components/OptimizationGuide";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Switch } from "@/components/ui/switch"

export default function Home() {
  // SNS生成ツール用の状態
  const [prompt, setPrompt] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [keywords, setKeywords] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [targetAudience, setTargetAudience] = useState("");
  const [postType, setPostType] = useState("");
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Doc<"generate"> | null>(null);

  // リスト収集ツール用の状態
  const [selectedMainArea, setSelectedMainArea] = useState<string>("");
  const [selectedSubArea, setSelectedSubArea] = useState<string>("");
  const [selectedDetailArea, setSelectedDetailArea] = useState<string>("");
  const [subAreas, setSubAreas] = useState<{name: string, url: string}[]>([]);
  const [detailAreas, setDetailAreas] = useState<{name: string, url: string}[]>([]);
  const [isLoadingSubAreas, setIsLoadingSubAreas] = useState(false);
  const [isLoadingDetailAreas, setIsLoadingDetailAreas] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [collectedList, setCollectedList] = useState<any[]>([]);

  // ファイル管理用の状態
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [files, setFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // RAGチャットボット用の状態
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  const snsPosts = useQuery(api.generate.query.list);


  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          platform: selectedPlatform,
          keywords,
          targetAudience,
          postType,
          frameworks: selectedFrameworks
        })
      });
      const data = await response.json();
      
      if (!data.eventId) {
        toast.error("イベント送信に失敗しました");
        return;
      }
     
      toast.success("投稿を生成しました");
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setInterval(() => {
        setIsGenerating(false);
      }, 2000)
      setPrompt('')
      setPostType('')
      setSelectedPlatform('')
      setTargetAudience('')
    }
  };

  const platformOptions = [
    { value: "twitter", label: "Twitter / X", limit: 280 },
    { value: "instagram", label: "Instagram", limit: 2200 },
    { value: "facebook", label: "Facebook", limit: 63206 },
    { value: "linkedin", label: "LinkedIn", limit: 3000 },
    { value: "tiktok", label: "TikTok", limit: 2200 },
    { value: "youtube", label: "YouTube", limit: 5000 }
  ];

  const targetAudienceOptions = [
    { value: "teens", label: "10代" },
    { value: "twenties", label: "20代" },
    { value: "thirties", label: "30代" },
    { value: "forties", label: "40代" },
    { value: "fifties", label: "50代" },
    { value: "seniors", label: "60代以上" }
  ];

  const postTypeOptions = [
    { value: "promotion", label: "商品・サービス宣伝" },
    { value: "educational", label: "教育・啓発" },
    { value: "entertainment", label: "エンターテイメント" },
    { value: "news", label: "ニュース・お知らせ" },
    { value: "lifestyle", label: "ライフスタイル" },
    { value: "brand_awareness", label: "ブランド認知向上" }
  ];

  const frameworkOptions = [
    { 
      value: "aida", 
      label: "AIDA", 
      description: "注意→関心→欲求→行動の流れで構成", 
      detail: "読者の注意を引き、関心を持たせ、欲求を喚起し、行動を促す"
    },
    { 
      value: "pas", 
      label: "PAS", 
      description: "問題→煽り→解決の構造", 
      detail: "問題を提示し、その深刻さを煽り、解決策を提示する"
    },
    { 
      value: "prep", 
      label: "PREP", 
      description: "結論→理由→例→結論で論理的に", 
      detail: "結論を先に述べ、理由と具体例で補強し、再度結論を示す"
    },
    { 
      value: "quest", 
      label: "QUEST", 
      description: "質問→理解→教育→刺激→移行", 
      detail: "質問で関心を引き、理解を深め、教育し、行動を刺激する"
    },
    { 
      value: "scamper", 
      label: "SCAMPER", 
      description: "創造的な発想で差別化", 
      detail: "代用・結合・応用・修正・他用途・除去・逆転の視点で新しいアイデア"
    },
    { 
      value: "storytelling", 
      label: "ストーリーテリング", 
      description: "起承転結で物語性を重視", 
      detail: "導入→展開→転換→結論の流れで感情に訴える"
    }
  ];

  const getCharacterLimit = () => {
    const platform = platformOptions.find(p => p.value === selectedPlatform);
    return platform ? platform.limit : null;
  };
  const handleFrameworkToggle = (frameworkValue: string) => {
    setSelectedFrameworks(prev => {
      // 既に選択されている場合は削除
      if (prev.includes(frameworkValue)) {
        return prev.filter(fw => fw !== frameworkValue);
      }
      // 選択されていない場合は追加（最大3つまで）
      return prev.length < 3 ? [...prev, frameworkValue] : prev;
    });
  };

  const handleMainAreaChange = async (areaName: string) => {
    setSelectedMainArea(areaName);
    setSelectedSubArea("");
    setSelectedDetailArea("");
    setSubAreas([]);
    setDetailAreas([]);
    
    if (areaName) {
      setIsLoadingSubAreas(true);
      try {
        const response = await fetch('/api/subareas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ areaUrl: AREA_URL_MAP[areaName] })
        });
        const data = await response.json();
        if (data.success) {
          setSubAreas(data.subAreas || []);
        }
      } catch (error) {
        console.error('サブエリア取得エラー:', error);
      } finally {
        setIsLoadingSubAreas(false);
      }
    }
  };

  const handleSubAreaChange = async (subAreaUrl: string) => {
    setSelectedSubArea(subAreaUrl);
    setSelectedDetailArea("");
    setDetailAreas([]);
    
    if (subAreaUrl) {
      setIsLoadingDetailAreas(true);
      try {
        const response = await fetch('/api/detailareas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subAreaUrl })
        });
        const data = await response.json();
        if (data.success) {
          setDetailAreas(data.detailAreas || []);
        }
      } catch (error) {
        console.error('詳細エリア取得エラー:', error);
      } finally {
        setIsLoadingDetailAreas(false);
      }
    }
  };

  const handleCollectList = async () => {
    // エリアが選択されているかチェック
    if (!selectedMainArea) {
      alert('エリアを選択してください');
      return;
    }
    
    setIsCollecting(true);
    try {
      // 使用するURLを決定（優先順位: 詳細エリア > サブエリア > メインエリア）
      let targetUrl = "";
      if (selectedDetailArea) {
        targetUrl = selectedDetailArea;
      } else if (selectedSubArea) {
        targetUrl = selectedSubArea;
      } else if (selectedMainArea) {
        targetUrl = AREA_URL_MAP[selectedMainArea];
      }
      
      const response = await fetch('/api/crawler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          areaUrl: targetUrl 
        })
      });
      const data = await response.json();
      setCollectedList(data.results || []);
    } catch (error) {
      console.error('収集エラー:', error);
      setCollectedList([]);
    } finally {
      setInterval(() => {
        setIsCollecting(false);
      }, 10000);
     
    }
  };

  const downloadCSV = () => {
    if (collectedList.length === 0) return;
    
    const headers = Object.keys(collectedList[0]).join(',');
    const rows = collectedList.map(item => 
      Object.values(item).map(val => `"${val}"`).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hotpepper_list.csv`;
    link.click();
  };

  // ファイル一覧を取得
  const loadFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const response = await fetch('/api/files/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('ファイル一覧の取得に失敗:', error);
      setFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // ファイルをダウンロード
  const downloadFileGetUrl = async (storageId: string, fileName: string) => {
    try {
      const response = await fetch('/api/files/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storageId, fileName, useHttpAction: false })
      });
      const data = await response.json();
      
      if (data.success && data.url) {
        console.log(`ダウンロード方式: ${data.method}`);
        
        // 適切なダウンロード処理
        const link = document.createElement('a');
        link.href = data.url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('ダウンロードに失敗しました: ' + data.error);
      }
    } catch (error) {
      console.error('ダウンロードエラー:', error);
      alert('ダウンロードに失敗しました');
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col p-8 min-h-screen overflow-hidden">
      <h1 className="text-2xl font-bold mb-8">自動化ツールデモサイト</h1>
      
      <Tabs defaultValue="generate" className="w-full">
        <div className="w-full overflow-x-auto">
          <TabsList className="flex w-max min-w-full">
            <TabsTrigger value="generate" className="flex items-center gap-1 text-xs sm:text-sm sm:gap-2">
              <Wand2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">SNS投稿生成</span>
              <span className="sm:hidden">SNS生成</span>
            </TabsTrigger>
            <TabsTrigger value="collect" className="flex items-center gap-1 text-xs sm:text-sm sm:gap-2">
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">営業リスト収集</span>
              <span className="sm:hidden">リスト収集</span>
            </TabsTrigger>
            <TabsTrigger value="rag" className="flex items-center gap-1 text-xs sm:text-sm sm:gap-2">
              <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">RAGチャットボット</span>
              <span className="sm:hidden">チャット</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="generate" className="space-y-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  SNS投稿生成ツール
                </CardTitle>
                <CardDescription>
                  プラットフォームに最適化されたSNS投稿を生成します
                </CardDescription>
              </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    プラットフォーム
                  </label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="プラットフォームを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {platformOptions.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          {platform.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    ターゲット層
                  </label>
                  <Select value={targetAudience} onValueChange={setTargetAudience}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="ターゲット層を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {targetAudienceOptions.map((audience) => (
                        <SelectItem key={audience.value} value={audience.value}>
                          {audience.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    投稿タイプ
                  </label>
                  <Select value={postType} onValueChange={setPostType}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="投稿タイプを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {postTypeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Brain className="h-4 w-4" />
                    <p>思考フレームワーク</p>
                  </div>
                  {
                    selectedFrameworks.length > 0 ? (
                      <div className="flex items-center gap-2">
                        {selectedFrameworks.map((framework) => (
                          <Badge key={framework} className="text-xs uppercase" variant="default">
                            {framework}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <Badge className="text-xs uppercase" variant="outline">
                        {selectedFrameworks[0] ? selectedFrameworks[0] : "未選択"}
                      </Badge>
                    )
                  }
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {frameworkOptions.map((framework) => (
                    <div
                      key={framework.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-blue-300 ${
                        selectedFrameworks.includes(framework.value)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                      onClick={() => handleFrameworkToggle(framework.value)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          {selectedFrameworks.includes(framework.value) ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <div className="h-4 w-4 border border-gray-300 rounded-sm" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{framework.label}</div>
                          <div className="text-xs text-gray-500 mt-1">{framework.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  キーワード
                </label>
                <Input
                  placeholder="関連するキーワードをカンマ区切りで入力（例: 旅行, グルメ, 東京）"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">プロンプト</label>
                  {selectedPlatform && (
                    <Badge variant="outline" className="text-xs">
                      {selectedPlatform}: 最大{getCharacterLimit()}文字
                    </Badge>
                  )}
                </div>
                <Textarea
                  placeholder="生成したいSNS投稿の内容を説明してください..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* 最適化ガイド */}
              <OptimizationGuide
                platform={selectedPlatform}
                targetAudience={targetAudience}
                postType={postType}
                onFrameworkSelect={(frameworks) => setSelectedFrameworks(frameworks)}
                className="mt-4"
              />


                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full"
                >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    生成する
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          </motion.div>
          <TaskProgress taskType="sns_generation" />
              
          <AnimatePresence>
            {snsPosts && snsPosts.length > 0 && snsPosts.map((post) => (
            <motion.div 
              key={post._id} 
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    生成結果
                    <div className="flex items-center gap-2">
                      {post.platform && (
                        <Badge variant="secondary" className="text-xs">
                          {post.platform}
                        </Badge>
                      )}
                      {post.platform && (
                        <Badge variant="outline" className="text-xs">
                          {post.result.length}/{
                            platformOptions.find(p => p.value === post.platform)?.limit || '?'
                          }文字
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                  
                  {/* 生成パラメータ表示 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {post.targetAudience && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">ターゲット:</span>
                        <span className="font-medium">
                          {targetAudienceOptions.find(opt => opt.value === post.targetAudience)?.label || post.targetAudience}
                        </span>
                      </div>
                    )}
                    {post.postType && (
                      <div className="flex items-center gap-1">
                        <Bot className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">投稿タイプ:</span>
                        <span className="font-medium">
                          {postTypeOptions.find(opt => opt.value === post.postType)?.label || post.postType}
                        </span>
                      </div>
                    )}
                    {post.frameworks && post.frameworks.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Brain className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">フレームワーク:</span>
                        <span className="font-medium">
                          {post.frameworks.map(fw => 
                            frameworkOptions.find(opt => opt.value === fw)?.label || fw
                          ).join(", ")}
                        </span>
                      </div>
                    )}
                    {post.keywords && (
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">キーワード:</span>
                        <span className="font-medium text-blue-600">
                          {post.keywords}
                        </span>
                      </div>
                    )}
                    {post.createdAt && (
                      <div className="flex items-center gap-1 md:col-span-2">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">生成日時:</span>
                        <span className="font-medium">
                          {new Date(post.createdAt).toLocaleString('ja-JP')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded-lg mb-4">
                    {post.result.slice(0, 150)}...
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => {
                      setIsOpen(true)
                      setSelectedPost(post)
                    }}>詳細を見る</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          </AnimatePresence>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        生成結果詳細
                        {selectedPost?.platform && (
                          <Badge variant="secondary">{selectedPost.platform}</Badge>
                        )}
                      </DialogTitle>
                      
                      {/* 生成パラメータ詳細 */}
                      {selectedPost && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg text-sm">
                          {selectedPost.platform && (
                            <div>
                              <span className="font-medium text-gray-600">プラットフォーム:</span>
                              <div className="mt-1">
                                {platformOptions.find(opt => opt.value === selectedPost.platform)?.label || selectedPost.platform}
                              </div>
                            </div>
                          )}
                          {selectedPost.targetAudience && (
                            <div>
                              <span className="font-medium text-gray-600">ターゲット層:</span>
                              <div className="mt-1">
                                {targetAudienceOptions.find(opt => opt.value === selectedPost.targetAudience)?.label || selectedPost.targetAudience}
                              </div>
                            </div>
                          )}
                          {selectedPost.postType && (
                            <div>
                              <span className="font-medium text-gray-600">投稿タイプ:</span>
                              <div className="mt-1">
                                {postTypeOptions.find(opt => opt.value === selectedPost.postType)?.label || selectedPost.postType}
                              </div>
                            </div>
                          )}
                          {selectedPost.frameworks && selectedPost.frameworks.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-600">フレームワーク:</span>
                              <div className="mt-1">
                                {selectedPost.frameworks.map(fw => 
                                  frameworkOptions.find(opt => opt.value === fw)?.label || fw
                                ).join(", ")}
                              </div>
                            </div>
                          )}
                          {selectedPost.keywords && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-600">キーワード:</span>
                              <div className="mt-1 text-blue-600">
                                {selectedPost.keywords}
                              </div>
                            </div>
                          )}
                          {selectedPost.createdAt && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-600">生成日時:</span>
                              <div className="mt-1">
                                {new Date(selectedPost.createdAt).toLocaleString('ja-JP')}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Switch checked={showJson} onCheckedChange={setShowJson} />
                        <span className="text-sm">JSON表示</span>
                      </div>
                    </DialogHeader>
                    
                    <div className="mt-4">
                      {showJson ? (
                        <div className="whitespace-pre-wrap bg-gray-100 p-4 rounded-lg text-sm font-mono">
                          {selectedPost?.contextJson}
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap bg-white border p-4 rounded-lg">
                          {selectedPost?.result}
                        </div>
                      )}
                    </div>
                    
                    <DialogFooter className="mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => navigator.clipboard.writeText(showJson ? selectedPost?.contextJson || "" : selectedPost?.result || "")}
                      >
                        コピー
                      </Button>
                      <Button onClick={() => setIsOpen(false)}>閉じる</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">使い方のヒント</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-700 space-y-2">
              <p>• プラットフォームを選択すると、そのプラットフォームに最適化された投稿が生成されます</p>
              <p>• ターゲット層と投稿タイプを設定すると、より効果的な内容になります</p>
              <p>• キーワードを設定すると、関連するハッシュタグや内容が含まれます</p>
              <p>• 文字数制限を意識した投稿が自動で生成されます</p>
            </CardContent>
          </Card>
          
        </TabsContent>
        
        <TabsContent value="collect" className="space-y-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  営業リスト収集ツール
                </CardTitle>
                <CardDescription>
                  ホットペッパーから営業先のリストを自動収集します
                </CardDescription>
              </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <label className="text-sm font-semibold">
                  ホットペッパーエリア選択
                </label>
                
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-2">
                    <label className="text-xs  text-gray-600">
                      都道府県・地域
                    </label>
                    <Select value={selectedMainArea} onValueChange={handleMainAreaChange}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="地域を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(AREA_URL_MAP).map((areaName) => (
                          <SelectItem key={areaName} value={areaName}>
                            {areaName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600">
                      サブエリア
                    </label>
                    <Select 
                      value={selectedSubArea} 
                      onValueChange={handleSubAreaChange}
                      disabled={!selectedMainArea || isLoadingSubAreas}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder={
                          isLoadingSubAreas ? "読み込み中..." : "サブエリアを選択"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {subAreas.map((subArea) => (
                          <SelectItem key={subArea.url} value={subArea.url}>
                            {subArea.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600">
                      詳細エリア
                    </label>
                    <Select 
                      value={selectedDetailArea} 
                      onValueChange={setSelectedDetailArea}
                      disabled={!selectedSubArea || isLoadingDetailAreas}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder={
                          isLoadingDetailAreas ? "読み込み中..." : "詳細エリアを選択"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {detailAreas.map((detailArea) => (
                          <SelectItem key={detailArea.url} value={detailArea.url}>
                            {detailArea.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {(selectedMainArea || selectedSubArea || selectedDetailArea) && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex flex-col md:flex-row items-start gap-2 text-sm text-blue-800">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium text-xs">選択中のエリア:</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {selectedMainArea + " > "}
                        <br />
                        {selectedSubArea && subAreas.find(s => s.url === selectedSubArea) && 
                          `${subAreas.find(s => s.url === selectedSubArea)?.name} > `
                        }
                        <br />
                        {selectedDetailArea && detailAreas.find(d => d.url === selectedDetailArea) && 
                          `${detailAreas.find(d => d.url === selectedDetailArea)?.name}`
                        }
                      </span>
                    </div>
                  </div>
                )}
                
              </div>

                <Button 
                  onClick={handleCollectList}
                  disabled={!selectedMainArea || isCollecting}
                  className="w-full sm:w-auto"
                >
                {isCollecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    収集中...
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    リスト収集開始
                  </>
                )}
              </Button>
              
            </CardContent>
          </Card>
          </motion.div>

          <TaskProgress taskType="scraping" />

          <AnimatePresence>
            {collectedList.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  収集結果 ({collectedList.length}件)
                  <Button variant="outline" size="sm" onClick={downloadCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    CSV保存
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {collectedList.slice(0, 5).map((item, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded border">
                        <div className="font-medium text-sm">{item.name || '店舗名'}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {item.address || '住所情報'} | {item.phone || '電話番号'}
                        </div>
                      </div>
                    ))}
                    {collectedList.length > 5 && (
                      <div className="text-center text-sm text-gray-500 py-2">
                        ...他{collectedList.length - 5}件
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
              </motion.div>
            )}
          </AnimatePresence>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                ファイル管理
              </CardTitle>
              <CardDescription>
                生成されたCSVファイルの一覧とダウンロード
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Button onClick={loadFiles} disabled={isLoadingFiles}>
                  {isLoadingFiles ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      読み込み中...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      ファイル一覧を更新
                    </>
                  )}
                </Button>
              </div>
              
              <div className="space-y-2">
                {files.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    アップロードされたファイルはありません
                  </p>
                ) : (
                  files.map((file, index) => (
                    <div key={file.storageId || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{file.fileName}</div>
                        <div className="text-xs text-gray-500">
                          {file.metadata?.recordCount ? `${file.metadata.recordCount}件` : ''} 
                          {file.metadata?.scrapedAt ? ` • ${new Date(file.metadata.scrapedAt).toLocaleDateString('ja-JP')}` : ''}
                          {file.size ? ` • ${Math.round(file.size / 1024)}KB` : ''}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadFileGetUrl(file.storageId, file.fileName)}
                          title="getUrl方式でダウンロード"
                        >
                          <Download className="h-3 w-3" />
                          <span className="ml-1 text-xs">ダウンロード</span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">使い方のヒント</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-green-700 space-y-2">
              <p>• エリアを選択してからリスト収集を開始してください</p>
              <p>• より詳細なエリアを選択すると、絞り込まれた結果が得られます</p>
              <p>• 収集したデータはCSV形式でダウンロードできます</p>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="rag" className="space-y-6 mt-6">
        <div className="relative iframe-container">
                {!isIframeLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg border" style={{minHeight: "700px"}}>
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      <p className="text-gray-500">チャットボットを読み込み中...</p>
                    </div>
                  </div>
                )}
                <iframe
                  src="https://udify.app/chatbot/GlZ3tnzKc5WvGufT"
                  style={{
                    width: "100%", 
                    height: "100%", 
                    minHeight: "700px",
                    border: "none",
                    borderRadius: "1rem"
                  }}
                  allow="microphone"
                  onLoad={() => setIsIframeLoaded(true)}>
                </iframe>
                {/* Overlay to hide branding */}
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-white pointer-events-none"
                  style={{ height: "60px", borderBottomLeftRadius: "0.5rem", borderBottomRightRadius: "0.5rem" }}
                />
              </div>
         </TabsContent>
      </Tabs>
    </div>
  );
}