// app/page.tsx
"use client";
import { useState, useCallback, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import CameraPreview from "../components/CameraPreview";
import { Loader2, CheckCircle2, CopyCheckIcon } from "lucide-react";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Human message bubble
const HumanMessage = ({ text }: { text: string }) => (
  <div className="flex gap-3 items-start">
    <Avatar className="h-8 w-8">
      <AvatarImage src="/avatars/human.png" alt="Human" />
      <AvatarFallback>H</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-gray-200">You</p>
      </div>
      <div className="rounded-lg bg-[#161b22] px-3 py-2 text-sm text-gray-200 border border-[#30363d]">
        {text}
      </div>
    </div>
  </div>
);

// Gemini (AI) message bubble
const GeminiMessage = ({ text }: { text: string }) => (
  <div className="flex gap-3 items-start">
    <Avatar className="h-8 w-8 bg-blue-600">
      <AvatarImage src="/avatars/gemini.png" alt="Gemini" />
      <AvatarFallback>AI</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-gray-200">Mitra</p>
      </div>
      <div className="rounded-lg bg-[#161b22] px-3 py-2 text-sm text-gray-200 border border-[#30363d] shadow-sm">
        {text}
      </div>
    </div>
  </div>
);

export default function Home() {
  const [messages, setMessages] = useState<
    { type: "human" | "gemini"; text: string }[]
  >([]);

  const [conLoading, setConLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleTranscription = useCallback((transcription: string) => {
    setMessages((prev) => [...prev, { type: "gemini", text: transcription }]);
  }, []);

  const steps = [
    "Analyzing emotions and risk…",
    "Estimating screening scores…",
    "Summarizing your conversation…",
    "Finding helpful resources…",
    "Preparing your report…",
  ];

  const handleConGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();

    setConLoading(true);
    setOpenModal(true);
    setCurrentStep(0);
  };

  console.log(messages);

  // Auto-progress steps
  useEffect(() => {
    if (conLoading && currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (currentStep === steps.length) {
      // ✅ finished steps
      setTimeout(() => {
        setConLoading(false);
        setOpenModal(false);
      }, 1500);
    }
  }, [conLoading, currentStep]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-gray-200">
      {/* Main Layout */}
      <main className="flex-1 flex gap-8 p-8 overflow-hidden">
        {/* Camera Section */}
        <div className="flex-shrink-0">
          <CameraPreview onTranscription={handleTranscription} />

          {messages.length > -1 && (
            <button
              disabled={conLoading}
              onClick={handleConGenerateReport}
              className="rounded-lg bg-white text-gray-800 shadow-md hover:bg-gray-200 px-4 py-2 cursor-pointer"
            >
              <small>Generate Report</small>
            </button>
          )}
        </div>

        {/* Chat Section */}
        <div className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg shadow-sm flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <GeminiMessage text="Hi there, I'm Mitra, from the student wellness center. Thanks for reaching out. What's been on your mind lately? I'm here to listen." />
              {messages.map((message, index) =>
                message.type === "human" ? (
                  <HumanMessage key={`msg-${index}`} text={message.text} />
                ) : (
                  <GeminiMessage key={`msg-${index}`} text={message.text} />
                )
              )}
            </div>
          </ScrollArea>
        </div>
      </main>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-md rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">
              Generating Your Report
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-6">
            {steps.map((step, i) => {
              const isDone = i < currentStep;
              const isActive = i === currentStep;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  {isDone ? (
                    <CheckCircle2 className="text-green-500 w-5 h-5" />
                  ) : isActive ? (
                    <Loader2 className="text-blue-500 w-5 h-5 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-gray-300"></div>
                  )}

                  <p
                    className={`text-sm ${
                      isDone
                        ? "text-gray-500 line-through"
                        : isActive
                        ? "font-medium text-gray-800"
                        : "text-gray-400"
                    }`}
                  >
                    {step}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
