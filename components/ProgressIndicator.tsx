"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

export interface ProgressStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  description?: string;
  duration?: number;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  isVisible: boolean;
  title: string;
  onComplete?: () => void;
}

export function ProgressIndicator({ steps, isVisible, title, onComplete }: ProgressIndicatorProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const runningStepIndex = steps.findIndex(step => step.status === 'running');
    if (runningStepIndex >= 0) {
      setCurrentStep(runningStepIndex);
    }
  }, [steps]);

  useEffect(() => {
    const allCompleted = steps.every(step => step.status === 'completed' || step.status === 'failed');
    if (allCompleted && onComplete) {
      onComplete();
    }
  }, [steps, onComplete]);

  const getIcon = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'running':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-6 border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                {title}
                <Badge variant="outline" className="text-xs">
                  {completedSteps}/{steps.length}
                </Badge>
              </CardTitle>
              <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent className="space-y-3">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                    step.status === 'running' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(step.status)}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getIcon(step.status)}
                      <span className={`font-medium ${
                        step.status === 'completed' ? 'text-green-700' : 
                        step.status === 'running' ? 'text-blue-700' :
                        step.status === 'failed' ? 'text-red-700' : 'text-gray-600'
                      }`}>
                        {step.name}
                      </span>
                    </div>
                    {step.description && (
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    )}
                    {step.duration && step.status === 'completed' && (
                      <p className="text-xs text-gray-500 mt-1">完了時間: {step.duration}秒</p>
                    )}
                  </div>
                  {step.status === 'running' && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-3 h-3 bg-blue-500 rounded-full"
                    />
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}