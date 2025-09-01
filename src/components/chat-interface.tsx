'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { answerCollegeLifeQuestions } from '@/ai/flows/answer-college-life-questions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Bot, Send, User, BotMessageSquare } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const quickReplies = [
    'My Timetable',
    'Fee Details',
    'Upcoming Assignments'
]

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await answerCollegeLifeQuestions({ question: messageContent });
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground pt-16 animate-fade-in-up">
              <BotMessageSquare className="mx-auto h-12 w-12 mb-4" />
              <h2 className="text-2xl font-semibold font-headline">Welcome to Cera.AI</h2>
              <p>Ask me anything about college life!</p>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="w-8 h-8 border">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-sm md:max-w-md rounded-xl px-4 py-3 text-sm shadow-md',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <Avatar className="w-8 h-8 border">
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
              <Avatar className="w-8 h-8 border">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
              </Avatar>
              <div className="max-w-md rounded-xl px-4 py-3 text-sm bg-card shadow-md">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-background">
        <div className="max-w-3xl mx-auto">
             {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 mb-2 justify-center">
                    {quickReplies.map(reply => (
                        <Button 
                            key={reply} 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleSendMessage(reply)}
                            disabled={isLoading}
                        >
                            {reply}
                        </Button>
                    ))}
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about clubs, courses, or campus life..."
                className="flex-1"
                disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                <Send className="w-4 h-4" />
            </Button>
            </form>
        </div>
      </div>
    </div>
  );
}
