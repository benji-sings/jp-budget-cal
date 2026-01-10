import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2, Bot, User, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: "Konnichiwa! I'm your Japan travel assistant. Ask me anything about planning your trip to Japan - from JR Pass tips to the best ramen spots!",
};

function getSessionId(): string {
  const key = "japan-travel-chat-session";
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
}

function clearSessionId(): void {
  localStorage.removeItem("japan-travel-chat-session");
}

export function Chatbot() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string>(() => getSessionId());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: historyData, isLoading: historyLoading } = useQuery<{ messages: Message[] }>({
    queryKey: ["/api/chat", sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/chat/${sessionId}`);
      if (!response.ok) throw new Error("Failed to load history");
      return response.json();
    },
    enabled: !!sessionId && isOpen,
    staleTime: 0,
  });

  const persistedMessages = historyData?.messages ?? [];
  const displayMessages = [WELCOME_MESSAGE, ...persistedMessages, ...localMessages];

  const chatMutation = useMutation({
    mutationFn: async (allMessages: Message[]) => {
      const response = await apiRequest("POST", "/api/chat", { 
        messages: allMessages,
        sessionId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setLocalMessages([]);
      queryClient.invalidateQueries({ queryKey: ["/api/chat", sessionId] });
    },
    onError: () => {
      setLocalMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayMessages.length, chatMutation.isPending]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setLocalMessages((prev) => [...prev, userMessage]);
    setInput("");

    const allMessages = [...persistedMessages, ...localMessages, userMessage];
    chatMutation.mutate(allMessages.slice(-10));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    clearSessionId();
    const newSessionId = getSessionId();
    setSessionId(newSessionId);
    setLocalMessages([]);
    queryClient.removeQueries({ queryKey: ["/api/chat"] });
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        {!isOpen && (
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg"
            onClick={() => setIsOpen(true)}
            data-testid="button-open-chatbot"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        )}

        {isOpen && (
          <Card className="w-[525px] sm:w-[600px] shadow-xl border-card-border">
            <CardHeader className="flex flex-row items-center justify-between gap-2 py-3 px-4 border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bot className="h-5 w-5 text-primary" />
                Japan Travel Assistant
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleClearChat}
                  title="Clear chat history"
                  data-testid="button-clear-chat"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  data-testid="button-close-chatbot"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[525px] p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {historyLoading ? (
                    <div className="flex items-center justify-center py-6 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span className="text-sm">Loading chat history...</span>
                    </div>
                  ) : (
                    <>
                      {displayMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {message.role === "assistant" && (
                            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                            data-testid={`message-${message.role}-${index}`}
                          >
                            {message.role === "assistant" ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none break-words overflow-hidden
                                prose-p:my-1.5 prose-p:leading-relaxed
                                prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5
                                prose-headings:my-2 prose-headings:font-semibold
                                prose-h1:text-base prose-h2:text-sm prose-h3:text-sm
                                prose-strong:font-semibold prose-strong:text-foreground
                                prose-a:text-primary prose-a:underline prose-a:underline-offset-2 prose-a:break-all
                                prose-code:bg-muted-foreground/20 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none prose-code:break-all
                                prose-pre:bg-muted-foreground/10 prose-pre:p-3 prose-pre:rounded-md prose-pre:overflow-x-auto prose-pre:max-w-full
                                prose-blockquote:border-l-2 prose-blockquote:border-primary/50 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-muted-foreground
                                [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4
                                [&_li]:marker:text-muted-foreground [&_*]:max-w-full">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              </div>
                            ) : (
                              message.content
                            )}
                          </div>
                          {message.role === "user" && (
                            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                              <User className="h-4 w-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                      {chatMutation.isPending && (
                        <div className="flex gap-2 justify-start">
                          <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                          <div className="bg-muted rounded-lg px-3 py-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about Japan travel..."
                    disabled={chatMutation.isPending || historyLoading}
                    data-testid="input-chat-message"
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!input.trim() || chatMutation.isPending || historyLoading}
                    data-testid="button-send-message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
