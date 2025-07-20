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
  const [query, setQuery] = useState("あなた美容サロンのオーナーです。この商品の魅力的な商品説明を生成してください。");
  const [selectedContent, setSelectedContent] = useState<Doc<"generate"> | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
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
    try{
      setIsExporting(true);
      toast.success("Exported!");
    } catch (error) {
      console.error(error);
      toast.error("Error exporting!" + error);
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
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
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('/api/whisper', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setQuery(prev => prev + (prev ? ' ' : '') + data.text);
        toast.success('音声が正常に変換されました');
      } else {
        throw new Error('音声変換に失敗しました');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('音声変換に失敗しました');
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
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-4 row-start-2 items-center sm:items-start max-w-lg mx-auto">
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
              <div className="grid grid-cols-2 gap-2">
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
                <div className="flex flex-col gap-2 col-span-2">
                  <Label className="text-sm font-bold">Menu Description</Label>
                  <Textarea rows={4} className="resize-none h-[200px]" value={generateConfig.menuDescription} onChange={(e) => setGenerateConfig({ ...generateConfig, menuDescription: e.target.value })} />
                </div>
              
              <div className="flex flex-col gap-2 col-span-2">
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
                        <MicOff className="w-4 h-4 text-red-500" />
                        <span className="text-red-500">停止</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>音声入力</span>
                      </>
                    )}
                  </Button>
                </div>
                <Textarea rows={12} className="resize-none h-[200px] " disabled={isGenerating || isInterval} value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 mt-4 w-full  items-start justify-start  gap-2 col-span-1">
              <Button className="w-full" variant="default" onClick={handleGenerate} disabled={isGenerating || isInterval}>
                {isGenerating ? <>
                  <Loader2 className="animate-spin" />
                  <span>Generating...</span>
                </> : isInterval ?  <>
                  <LockIcon className="w-4 h-4" />
                  <span>Interval...</span>
                </> : <>
                  <Send className="w-4 h-4" />
                  <span>Generate</span>
               </>}
              </Button>
              <Button className="w-full" variant="outline" onClick={handleExport} disabled={isExporting || isInterval}>
                {isExporting ? <>
                  <Loader2 className="animate-spin" />
                  <span>Exporting...</span>
                </> : isInterval ? <>
                  <LockIcon className="w-4 h-4" />
                  <span>Interval...</span>
                </> : <>
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </>}
              </Button>
              </div>
            </div>
          </div>
          </div>
        </div>
      <div className="flex flex-col gap-4">
        {generateContents?.map((content) => (
          <div key={content._id} className="relative flex flex-col gap-2 border-b border-slate-200 pb-4">
            {
              content.checked ? null : (
                <div className="absolute top-0 z-10 right-0">
                  <Button variant="outline" size="icon" onClick={() => handleCheck(content._id)}>
                    <CheckIcon className="w-4 h-4 text-green-500" />
                  </Button>
                </div>
              )
            }
            <div className="flex items-center gap-2 bg-indigo-50 p-2 rounded-md">
              <InfoIcon className="w-4 h-4 text-indigo-500" />
              <p className="text-sm font-bold">生成プロンプト：{content.query.slice(0, 100)}...</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-800">生成結果：{content.result.slice(0, 100)}...</p>
        
            </div>
            <div className="flex w-full items-center justify-between">
              <p className="text-xs text-slate-500">{new Date(content.time).toLocaleString()}</p>
              <Button variant="link" className="cursor-pointer hover:underline" onClick={() => handleViewMore(content)}>View more</Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        
          <DialogContent className="max-w-2xl pt-10">
            <DialogHeader>  
              <DialogTitle className="text-sm font-bold text-slate-600">Prompt</DialogTitle>
              <DialogDescription className="text-sm font-bold text-slate-800">{selectedContent?.query}</DialogDescription>
            </DialogHeader>
            <p className="text-sm text-slate-800">{selectedContent?.result}</p>
            <DialogFooter className="flex justify-between items-center">  
              <Button variant="outline" onClick={() => navigator.clipboard.writeText(selectedContent?.result || "")}>Copy</Button>
              <Button onClick={() => setIsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
      </Dialog> 
      </main>
    </div>
  );
}
