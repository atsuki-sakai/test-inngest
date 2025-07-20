"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useState, useRef } from "react";
import { toast } from "sonner"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Download, Send, LockIcon, InfoIcon, CheckIcon, Mic, MicOff } from "lucide-react"
import { InngestForGenerateValues } from "@/app/api/zod";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";

const categories = [
  "cut",
  "color",
  "hair",
  "nail",
  "body",
  "other",
];

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isInterval, setIsInterval] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("日本人の主婦の30~50代の女性に利用してもらえるような商品説明を生成してください。");
  const [selectedContent, setSelectedContent] = useState<Doc<"generate"> | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingDescription, setIsRecordingDescription] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [descriptionMediaRecorder, setDescriptionMediaRecorder] = useState<MediaRecorder | null>(null);
  const [generateConfig, setGenerateConfig] = useState({
    menuName: "アッシュカラー(カット付き)",
    category: "color",
    targetGender: "male",
    menuDescription: "アッシュカラーは、男性に人気のカラーです。",
    menuPrice: "10000",
    platform: "ec",
    tone: "casual",
  });
  
  const isSubmittingRef = useRef(false);

  const generateContents = useQuery(api.generate.query.list);

  const checkMutation = useMutation(api.generate.mutation.checkByRunId);

  const handleReset = () => {
    setGenerateConfig({
      platform: "ec",
      tone: "casual",
      menuName: "",
      category: "color",
      targetGender: "male",
      menuDescription: "",
      menuPrice: "",
    });
    setQuery("");
  }
  const handleGenerate = async () => {
    if (isSubmittingRef.current) {
      return;
    }
    
    try{
      if (generateConfig.menuName === "" || generateConfig.category === "") {
        toast.error("Please fill in all fields");
        return;
      }
      if (isNaN(Number(generateConfig.menuPrice))) {
        toast.error("Price must be a number");
        return; 
      }
      isSubmittingRef.current = true;
      setIsInterval(true);
      setIsGenerating(true);
      await submitInngestForGenerate({ ...generateConfig, query: query });
      toast.success("Event sent!");
    } catch (error) {
      console.error(error);
      toast.error("Error sending event!" + error);
    } finally {
      setTimeout(() => {
        setIsInterval(false);
        isSubmittingRef.current = false;
      }, 30000); // 20秒後に解除
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      if (!generateContents || generateContents.length === 0) {
        toast.error("No data to export!");
        return;
      }

      // CSVヘッダー
      const headers = [
        "ID",
        "作成日時",
        "生成時間(秒)",
        "プロンプト",
        "生成結果",
        "確認済み",
        "実行ID"
      ];

      // CSVデータ作成
      const csvData = generateContents.map(content => [
        content._id.toString(),
        new Date(content._creationTime).toLocaleString('ja-JP'),
        content.time + "sec",
        `"${content.query.replace(/"/g, '""')}"`, // ダブルクォートをエスケープ
        `"${content.result.replace(/"/g, '""')}"`, // ダブルクォートをエスケープ
        content.checked ? "はい" : "いいえ",
        content.eventId || ""
      ]);

      // ヘッダーとデータを結合
      const csvContent = [headers, ...csvData]
        .map(row => row.join(","))
        .join("\n");

      // BOM付きでUTF-8エンコーディング
      const bom = "\uFEFF";
      const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
      
      // ダウンロード
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `generate-contents-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("CSV exported successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error exporting! " + error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewMore = (content: Doc<"generate">) => {
    setSelectedContent(content);
    setIsOpen(true);
  };

  const handleCheck = async (id: Id<"generate">) => {
    await checkMutation({ id });
  };

  const startRecording = async () => {
    try {
      toast.info('音声入力を開始します');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await transcribeAudio(audioBlob, false);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('マイクへのアクセスが拒否されました');
    }
  };

  const stopRecording = () => {
    toast.success('音声入力を停止しました');
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const transcribeAudio = async (audioBlob: Blob, isDescription = false) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('/api/whisper', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (isDescription) {
          setGenerateConfig(prev => ({
            ...prev,
            menuDescription: prev.menuDescription + (prev.menuDescription ? ' ' : '') + data.text
          }));
        } else {
          setQuery(prev => prev + (prev ? ' ' : '') + data.text);
        }
        toast.success('音声が正常に変換されました');
      } else {
        throw new Error('音声変換に失敗しました');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('音声変換に失敗しました');
    }
  };

  const startDescriptionRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await transcribeAudio(audioBlob, true);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setDescriptionMediaRecorder(recorder);
      setIsRecordingDescription(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('マイクへのアクセスが拒否されました');
    }
  };

  const stopDescriptionRecording = () => {
    if (descriptionMediaRecorder && descriptionMediaRecorder.state === 'recording') {
      descriptionMediaRecorder.stop();
      setIsRecordingDescription(false);
      setDescriptionMediaRecorder(null);
    }
  };

  const submitInngestForGenerate = async (data: InngestForGenerateValues) => {
    // フォームデータの取得
    const rawData = data;

    // サーバーサイドバリデーション（クライアント側でも実施）
    if (!rawData.query) {
        return { error: "必須項目が入力されていません" };
    }

    await fetch("/api/generate", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify(rawData),
    });
}


  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-4">
      <main className="flex flex-col gap-4 row-start-2 items-center sm:items-start w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Inngest Queue Funtion</h1>
        <p className="text-sm text-gray-500">
          Are you ready to generate?
        </p>
        <div className="relative h-full w-full mt-6">
          <div className="flex flex-col gap-4 my-2">
            <div className="flex flex-col gap-4">
             <div className="flex justify-end">
             <Button variant="destructive" onClick={handleReset}>Reset</Button>
             </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 space-y-0 sm:space-y-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold">Name</Label>
                  <Input value={generateConfig.menuName} onChange={(e) => setGenerateConfig({ ...generateConfig, menuName: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold">Price</Label>
                  <Input value={generateConfig.menuPrice} onChange={(e) => setGenerateConfig({ ...generateConfig, menuPrice: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold">Category</Label>
                  <Select value={generateConfig.category} onValueChange={(value: string) => setGenerateConfig({ ...generateConfig, category: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold">Target Gender</Label>
                  <Select value={generateConfig.targetGender} onValueChange={(value: string) => setGenerateConfig({ ...generateConfig, targetGender: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a gender" />
                    </SelectTrigger>
                    <SelectContent > 
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold">Platform</Label>
                  <Select value={generateConfig.platform} onValueChange={(value: string) => setGenerateConfig({ ...generateConfig, platform: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent > 
                      <SelectItem value="ec">ec</SelectItem>
                      <SelectItem value="sns">sns</SelectItem>
                      <SelectItem value="menu">menu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold">Tone</Label>
                  <Select value={generateConfig.tone} onValueChange={(value: string) => setGenerateConfig({ ...generateConfig, tone: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a tone" />
                    </SelectTrigger>
                    <SelectContent > 
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2 col-span-1 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold">Menu Description</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={isRecordingDescription ? stopDescriptionRecording : startDescriptionRecording}
                      disabled={isGenerating || isInterval}
                      className={`${isRecordingDescription ? 'bg-red-100 border-red-300' : ''}`}
                    >
                      {isRecordingDescription ? (
                        <>
                          <MicOff className="w-4 h-4 text-red-500 animate-pulse" />
                          <span className="hidden sm:inline text-red-500 animate-pulse">Recording...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          <span className="hidden sm:inline">Record Description</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea rows={4} className="resize-none h-[120px] sm:h-[200px]" value={generateConfig.menuDescription} onChange={(e) => setGenerateConfig({ ...generateConfig, menuDescription: e.target.value })} />
                </div>
              
              <div className="flex flex-col gap-2 col-span-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold">Prompt</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isGenerating || isInterval}
                    className={`${isRecording ? 'bg-red-100 border-red-300' : ''}`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-4 h-4 text-red-500 animate-pulse" />
                        <span className="hidden sm:inline text-red-500 animate-pulse">Recording...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span className="hidden sm:inline">Record Prompt</span>
                      </>
                    )}
                  </Button>
                </div>
                <Textarea rows={12} className="resize-none h-[120px] sm:h-[200px]" disabled={isGenerating || isInterval} value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 mt-4 w-full items-start justify-start gap-2 col-span-1 sm:col-span-2">
              <Button className="w-full" variant="default" onClick={handleGenerate} disabled={isGenerating || isInterval}>
                {isGenerating ? <>
                  <Loader2 className="animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </> : isInterval ?  <>
                  <LockIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Interval...</span>
                </> : <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Generate</span>
               </>}
              </Button>
              <Button className="w-full" variant="outline" onClick={handleExport} disabled={isExporting || isInterval}>
                {isExporting ? <>
                  <Loader2 className="animate-spin" />
                  <span className="hidden sm:inline">Exporting...</span>
                </> : isInterval ? <>
                  <LockIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Interval...</span>
                </> : <>
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </>}
              </Button>
              </div>
            </div>
          </div>
          </div>
        </div>
      <div className="flex flex-col gap-4 w-full">
        {generateContents?.map((content) => (
          <div key={content._id} className="relative flex flex-col gap-2 border-b border-slate-200 pb-4 w-full">
            {
              content.checked ? null : (
                <div className="absolute top-1 z-10 right-1">
                  <Button variant="default" size="sm" className="cursor-pointer bg-emerald-600 shadow-md border-white text-white hover:bg-emerald-700 hover:border-emerald-700" onClick={() => handleCheck(content._id)}>
                    Generate Complete🎊
                  <CheckIcon className="w-6 h-6 text-white mt-1 flex-shrink-0" />
                  </Button>
                </div>
              )
            }
            <div className="flex items-start gap-2 bg-indigo-50 p-2 rounded-md">
              <InfoIcon className="w-6 h-6 text-indigo-500 mt-1 flex-shrink-0" />
              <p className="text-sm font-bold break-words">生成プロンプト：{content.query.slice(0, 32)}...</p>
            </div>
            <div className="flex flex-col my-2">
              <p className="text-sm leading-4 text-slate-800 break-words">生成結果：{content.result.slice(0, 120)}...</p>
            </div>
            <div className="flex w-full items-end justify-between  gap-2">
              <div className="scale-75 -translate-x-[10%]">
                <p className="text-xs text-slate-500">Generate Time: <strong>{content.time}sec</strong></p>
                <p className="text-xs text-slate-500">CreatedAt: <strong>{new Date(content._creationTime).toLocaleString()}</strong></p>
                <p className="text-xs text-slate-500">Event ID: <strong>{content.eventId}</strong></p>
              </div>
              <div className="w-full flex justify-end">
                <Button variant="link" className=" cursor-pointer text-indigo-500 underline text-xs sm:text-sm" onClick={() => handleViewMore(content)}>View more</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        
          <DialogContent className="max-w-[95vw] sm:max-w-2xl pt-10 max-h-[90vh] overflow-y-auto">
            <DialogHeader>  
              <DialogTitle className="text-sm font-bold text-slate-600">Prompt</DialogTitle>
              <DialogDescription className="text-sm font-bold text-slate-800 break-words">{selectedContent?.query}</DialogDescription>
            </DialogHeader>
            <p className="text-sm text-slate-800 break-words whitespace-pre-wrap">{selectedContent?.result}</p>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-center">  
              <Button variant="outline" onClick={() => navigator.clipboard.writeText(selectedContent?.result || "")} className="w-full sm:w-auto">Copy</Button>
              <Button onClick={() => setIsOpen(false)} className="w-full sm:w-auto">Close</Button>
            </DialogFooter>
          </DialogContent>
      </Dialog> 
      </main>
    </div>
  );
}
