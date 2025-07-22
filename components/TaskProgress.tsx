"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Play, 
  Trash2, 
  RefreshCw,
  Bot,
  Search,
  Loader2
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

type TaskType = Doc<"task">;

interface TaskProgressProps {
  showCompleted?: boolean;
  taskType?: "sns_generation" | "scraping" | "all";
}

export const TaskProgress: React.FC<TaskProgressProps> = ({ 
  showCompleted = false, 
  taskType = "all" 
}) => {
  const tasks = useQuery(api.task.query.getAllTasks, { status: showCompleted ? "completed" : "in_progress" });
  const deleteTask = useMutation(api.task.mutation.deleteTaskById);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // 1秒ごとに現在時刻を更新して経過時間をリアルタイム表示
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // フィルタリング
  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];
    
    let filtered = tasks;
    
    // タスクタイプでフィルタ
    if (taskType !== "all") {
      filtered = filtered.filter(task => task.taskType === taskType);
    }
    
    // 完了タスクの表示制御
    if (!showCompleted) {
      filtered = filtered.filter(task => 
        task.status !== "completed" && task.status !== "failed"
      );
    }
    
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }, [tasks, taskType, showCompleted]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "in_progress":
        return <Play className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      failed: "destructive",
      in_progress: "secondary",
      pending: "outline"
    } as const;

    const labels = {
      completed: "完了",
      failed: "失敗",
      in_progress: "実行中",
      pending: "待機中"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case "sns_generation":
        return <Bot className="h-4 w-4" />;
      case "scraping":
        return <Search className="h-4 w-4" />;
      default:
        return <RefreshCw className="h-4 w-4" />;
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case "sns_generation":
        return "SNS投稿生成";
      case "scraping":
        return "スクレイピング";
      default:
        return type;
    }
  };

  const calculateProgress = (task: TaskType) => {
    const completedSteps = task.stepDetails.filter(step => step.status === "completed").length;
    return Math.round((completedSteps / task.totalSteps) * 100);
  };

  const formatDuration = (task: TaskType) => {
    const duration = task.stepDetails.reduce((total, step) => {
      if (step.startTime && step.endTime) {
        return total + (step.endTime - step.startTime);
      }
      return total;
    }, 0);

    if (duration === 0) return "-";
    return `${Math.round(duration / 1000)}秒`;
  };

  // 実行中タスクの経過時間を計算
  const calculateElapsedTime = (task: TaskType) => {
    if (task.status !== "in_progress") return null;
    
    // 最初に開始されたステップの開始時間を取得
    const startedSteps = task.stepDetails.filter(step => step.startTime);
    if (startedSteps.length === 0) return null;
    
    const taskStartTime = Math.min(...startedSteps.map(step => step.startTime!));
    const elapsedMs = currentTime - taskStartTime;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}分${seconds}秒`;
    } else {
      return `${seconds}秒`;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask({ id: taskId as Id<"task"> });
    } catch (error) {
      console.error("タスクの削除に失敗しました:", error);
    }
  };

  if (!tasks) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">タスクを読み込み中...</span>
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            {showCompleted ? "タスクがありません" : "進行中のタスクがありません"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredTasks.map((task) => {
        const progress = calculateProgress(task);
        const inProgressStep = task.stepDetails.find(step => step.status === "in_progress");
        const elapsedTime = calculateElapsedTime(task);
        
        return (
          <Card key={task._id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getTaskTypeIcon(task.taskType)}
                  {getTaskTypeLabel(task.taskType)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(task.status)}
                  {elapsedTime && (
                    <Badge variant="outline" className="text-xs">
                      経過: {elapsedTime}
                    </Badge>
                  )}
                  {(task.status === "completed" || task.status === "failed") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {task.metadata && (
                <CardDescription className="text-xs">
                  {task.metadata.platform && `プラットフォーム: ${task.metadata.platform}`}
                  {task.metadata.areaName && `エリア: ${task.metadata.areaName}`}
                  {task.metadata.prompt && (
                    <div className="mt-1 truncate max-w-md">
                      プロンプト: {task.metadata.prompt}
                    </div>
                  )}
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* 全体の進捗 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>全体の進捗</span>
                  <span className="text-muted-foreground">
                    {task.currentStep}/{task.totalSteps} ステップ ({progress}%)
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                {inProgressStep && (
                  <div className="text-xs text-blue-600 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      実行中: {inProgressStep.name}
                    </div>
                   
                  </div>
                )}
              </div>

              <Separator />

              {/* ステップ詳細 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">ステップ詳細</h4>
                <div className="grid gap-2">
                  {task.stepDetails.map((step, index) => (
                    <div
                      key={step.stepId}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono w-6 text-center">
                          {index + 1}
                        </span>
                        {getStatusIcon(step.status)}
                        <span className="text-sm">{step.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {step.startTime && step.endTime && (
                          <span>
                            {Math.round((step.endTime - step.startTime) / 1000)}秒
                          </span>
                        )}
                        {step.status === "in_progress" && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        {step.error && (
                          <Badge variant="destructive" className="text-xs">
                            エラー
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* エラー詳細 */}
              {task.stepDetails.some(step => step.error) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-red-600">エラー詳細</h4>
                    {task.stepDetails
                      .filter(step => step.error)
                      .map(step => (
                        <div key={step.stepId} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          <strong>{step.name}:</strong> {step.error}
                        </div>
                      ))}
                  </div>
                </>
              )}

              {/* タスク情報 */}
              <Separator />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>作成日時: {new Date(task.createdAt).toLocaleString('ja-JP')}</span>
                <span>実行時間: {formatDuration(task)}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TaskProgress;