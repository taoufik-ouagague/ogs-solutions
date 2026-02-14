import { useState, useEffect, useRef } from 'react';
import { X, Send, User as UserIcon, Bot } from 'lucide-react';
import { playClickSound, playNotificationSound } from '../utils/soundEffects';

const IconIA = () => (
  <Bot className="w-6 h-6" />
);

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatAgentProps {
  onNavigate: (page: string) => void;
}

export default function AIChatAgent({ }: AIChatAgentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm your LLC formation assistant. I can help you understand our services, recommend the right package, or answer any questions about forming an LLC. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!input.trim()) return;

    playClickSound();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    setTimeout(() => {
      playNotificationSound();
      const response = generateResponse(input.toLowerCase());
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const generateResponse = (input: string): string => {
    if (input.includes('price') || input.includes('cost') || input.includes('package')) {
      return "We offer three packages:\n\n• New Mexico ($99) - Essential LLC registration and document filing\n• Wyoming ($299) - Everything in New Mexico plus EIN and registered agent service\n• Colorado ($499) - Complete business setup with priority support\n\nAll prices are plus state filing fees. Would you like to see more details about any package?";
    }

    if (input.includes('state') || input.includes('where')) {
      return "We can help you form an LLC in any U.S. state! Each state has different requirements and fees. Delaware, Wyoming, and Nevada are popular choices for their business-friendly laws. Would you like help choosing the right state for your business?";
    }

    if (input.includes('time') || input.includes('how long') || input.includes('fast')) {
      return "Processing times vary by package:\n\n• New Mexico: 5-7 business days\n• Wyoming: 3-5 business days\n• Colorado: 1-2 business days (expedited)\n\nThese times don't include state processing, which varies by location. Would you like to get started?";
    }

    if (input.includes('ein') || input.includes('tax')) {
      return "An EIN (Employer Identification Number) is a federal tax ID for your business. It's required if you plan to hire employees or have multiple members. Our Wyoming and Colorado packages include EIN registration. Would you like to know more about these packages?";
    }

    if (input.includes('agent') || input.includes('registered')) {
      return "A registered agent receives legal documents on behalf of your LLC. It's required in all states. Our Wyoming and Colorado packages include 1 year of registered agent service. This ensures you never miss important legal notices.";
    }

    if (input.includes('difference') || input.includes('compare')) {
      return "The main differences between packages:\n\n• New Mexico: Core filing services\n• Wyoming: Adds EIN + registered agent service\n• Colorado: Includes everything plus bank account setup and priority support\n\nMost customers choose Wyoming for the best value. Which features are most important to you?";
    }

    if (input.includes('recommend') || input.includes('which') || input.includes('best')) {
      return "I'd be happy to recommend a package! Can you tell me:\n\n1. Will you have employees or multiple members?\n2. Do you need urgent processing?\n3. Would you like help with bank account setup?\n\nThis will help me suggest the perfect package for your needs.";
    }

    if (input.includes('start') || input.includes('begin') || input.includes('get started')) {
      return "Great! I can help you get started. The process is simple:\n\n1. Choose your state\n2. Select a package\n3. Fill out our easy form\n4. We handle the rest!\n\nWould you like me to take you to our Get Started page?";
    }

    if (input.includes('contact') || input.includes('support') || input.includes('help')) {
      return "You can reach our support team:\n\n• Email: support@ogssolution.com\n• Phone: +212 69 11 81 00 2\n• WhatsApp: Click the green button\n\nWe're available 24/7! Would you like to visit our contact page?";
    }

    return "I'd be happy to help you with that! I can assist with:\n\n• Explaining our packages and pricing\n• Helping you choose the right state\n• Answering questions about LLCs\n• Guiding you through the formation process\n\nWhat would you like to know more about?";
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => {
            playClickSound();
            setIsOpen(true);
          }}
          className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all hover:scale-110 group animate-pulse"
          aria-label="Open chat"
        >
          <IconIA />
          <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Chat with AI Assistant
          </span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 left-6 z-40 w-96 max-w-[calc(100vw-3rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col transition-colors overflow-hidden">
          <div className="bg-blue-600 dark:bg-blue-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <IconIA />
              </div>
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-xs text-blue-100">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => {
                playClickSound();
                setIsOpen(false);
              }}
              className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-96 bg-gray-50 dark:bg-gray-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <UserIcon className="h-4 w-4" />
                    ) : (
                      <div className="h-4 w-4 scale-75">
                        <IconIA />
                      </div>
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
