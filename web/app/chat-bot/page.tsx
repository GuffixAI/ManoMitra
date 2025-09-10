"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Action, Actions } from "@/components/ai-elements/actions";
import React, { useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Response } from "@/components/ai-elements/response";
import { CopyIcon, Mic } from "lucide-react";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Loader } from "@/components/ai-elements/loader";
import { Loader2, CheckCircle2, CopyCheckIcon } from "lucide-react";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useCreateAIReport } from "@/hooks/api/useAIReports";

const ChatInterface = () => {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();
  const router = useRouter();
  const createReportMutation = useCreateAIReport();

  const [reportLoading, setReportLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  const steps = [
    "Analyzing emotions and risk…",
    "Estimating screening scores…",
    "Summarizing your conversation…",
    "Finding helpful resources…",
    "Preparing your report…",
    "Redirectig to the report page....",
  ];

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();

    setReportLoading(true);
    setOpenModal(true);
    setCurrentStep(0);

    const conversationText = messages
      .map((m) => {
        const textPart = m.parts.find((part) => part.type === "text");
        const content = textPart ? textPart.text : "";

        if (content) {
          const speaker = m.role === "user" ? "Student" : "Chatbot";
          return `${speaker}: ${content}`;
        }
        return null;
      })
      .filter(Boolean)
      .join("\n\n");

    createReportMutation.mutate(conversationText, {
      onSuccess: (response) => {
        const newReportId = response.data._id;
        setReportLoading(false);
        setOpenModal(false);
        setCurrentStep(5);
        router.push(`/student/ai-reports/${newReportId}`);
      },
    });
  };

  // Auto-progress steps
  useEffect(() => {
    if (reportLoading && currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (currentStep === steps.length) {
      // ✅ finished steps
      setTimeout(() => {
        setReportLoading(false);
        setOpenModal(false);
      }, 6000);
    }
  }, [reportLoading, currentStep]);

  return (
    <div className="relative max-w-4xl mx-auto p-6 relative size-full h-screen">
      <div className="flex flex-col h-full">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === "assistant" &&
                  message.parts.filter((part) => part.type === "source-url")
                    .length > 0 && (
                    <Sources>
                      <SourcesTrigger
                        count={
                          message.parts.filter(
                            (part) => part.type === "source-url"
                          ).length
                        }
                      />
                      {message.parts
                        .filter((part) => part.type === "source-url")
                        .map((part, i) => (
                          <SourcesContent key={`${message.id}-${i}`}>
                            <Source
                              key={`${message.id}-${i}`}
                              href={part.url}
                              title={part.url}
                            />
                          </SourcesContent>
                        ))}
                    </Sources>
                  )}
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <React.Fragment key={`${message.id}-${i}`}>
                          <Message from={message.role}>
                            <MessageContent>
                              <Response>{part.text}</Response>
                            </MessageContent>
                          </Message>
                          {message.role === "assistant" &&
                            i === messages.length - 1 && (
                              <Actions className="mt-2">
                                <Action className="cursor-pointer"
                                  onClick={() =>
                                    navigator.clipboard.writeText(part.text)
                                  }
                                  label="Copy"
                                >
                                  <CopyIcon className="size-3" />
                                </Action>
                                <Action className="cursor-pointer"
                                  onClick={() => {
                                    const utterance =
                                      new SpeechSynthesisUtterance(part.text);
                                    utterance.lang = "en-US";
                                    window.speechSynthesis.speak(utterance);
                                  }}
                                  label="Listen"
                                >
                                  <Mic className="size-3" />
                                </Action>
                              </Actions>
                            )}
                        </React.Fragment>
                      );
                    case "reasoning":
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={
                            status === "streaming" &&
                            i === message.parts.length - 1 &&
                            message.id === messages.at(-1)?.id
                          }
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            ))}
            {status === "submitted" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <PromptInput onSubmit={handleSubmit} className="w-full">
              <PromptInputTextarea
                onChange={(e) => setInput(e.target.value)}
                value={input}
                className="min-h-[60px] resize-none"
                placeholder="Type your message here..."
              />
              <PromptInputToolbar className="px-3 py-2">
                <PromptInputSubmit
                  disabled={
                    !input || reportLoading || createReportMutation.isPending
                  }
                  status={status}
                  className="cursor-pointer"
                />
                {messages.length > 10 && (
                  <button
                    disabled={reportLoading || createReportMutation.isPending}
                    onClick={handleGenerateReport}
                    className="rounded-lg bg-white text-gray-800 flex gap-2 shadow-md hover:bg-gray-200 px-4 py-2 cursor-pointer"
                  >
                    {createReportMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> <small><b>Generating...</b></small>
                      </>
                    ) : (
                      <small> <b>Generate Report</b> </small>
                    )}
                  </button>
                )}
              </PromptInputToolbar>
            </PromptInput>
          </div>
        </div>
      </div>

      <Dialog
        open={openModal}
        onOpenChange={(val) => {
          if (!reportLoading) setOpenModal(val);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">
              Generating Your Report
            </DialogTitle>
          </DialogHeader>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-2 bg-blue-500"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

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
};

export default ChatInterface;
