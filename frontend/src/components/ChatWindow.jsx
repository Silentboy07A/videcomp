import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ messages, onSendMessage, isIngested, loadingAsk }) => {
  const [question, setQuestion] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingAsk]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || !isIngested || loadingAsk) return;

    onSendMessage(question.trim());
    setQuestion('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border border-[#3C3C3C] bg-[#252526] text-slate-200 select-none overflow-hidden relative">
      
      {/* Workspace Header toolbar */}
      <div className="border-b border-[#3C3C3C] bg-[#1E1E1E] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="h-3.5 w-3.5 text-[#E95420]" />
          <span className="font-mono font-bold text-xs uppercase tracking-wider text-slate-350">
            Interactive Workspace
          </span>
        </div>
      </div>

      {/* Main chat terminal buffer log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#1E1E1E]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2 font-mono">
            <Terminal className="h-8 w-8 text-slate-700 animate-pulse" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400">CONSOLE_ACTIVE</p>
              <p className="text-[11px] text-slate-650 max-w-xs leading-relaxed">
                {isIngested 
                  ? 'Memory index mapped. Type comparative questions below to search video frames and transcripts.' 
                  : 'Awaiting source compilation targets on the left sidebar configuration.'}
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))
        )}

        {/* System drafting query loading block */}
        {loadingAsk && (
          <div className="w-full flex flex-col mb-4 border border-[#3C3C3C] bg-[#252526] text-xs font-mono animate-pulse">
            <div className="border-b border-[#3C3C3C] bg-[#1E1E1E] px-3 py-1.5 flex justify-between items-center text-[10px] text-slate-500">
              <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wider">
                <Loader2 className="h-3 w-3 animate-spin text-[#E95420]" />
                <span className="text-[#E95420]">PROCESSING_QUERY</span>
              </div>
            </div>
            <div className="p-3 text-slate-500 text-[11px] flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Scanning comparative vector database indices. Synthesizing answer reports...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Strict terminal locked prompt overlay */}
      {!isIngested && (
        <div className="absolute inset-0 bg-[#1E1E1E]/95 z-30 flex flex-col items-center justify-center p-6 text-center select-none font-mono">
          <div className="border border-[#3C3C3C] bg-[#252526] p-6 max-w-sm flex flex-col items-center space-y-3.5 shadow-2xl">
            <div className="h-10 w-10 border border-[#3C3C3C] bg-[#1E1E1E] flex items-center justify-center text-amber-500">
              <Terminal className="h-5 w-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-300">CONSOLE_LOCKED</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Comparison target has not been compiled. Ingest source streams on the left config panel to release query console lock.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Terminal prompt input panel */}
      <div className="border-t border-[#3C3C3C] bg-[#252526] p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-grow">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isIngested || loadingAsk}
              rows={2}
              placeholder={isIngested ? "Compare details (e.g. Which video has higher density of explanations?)..." : "Ingest source configuration first..."}
              className="block w-full rounded-none border border-[#3C3C3C] bg-[#1E1E1E] p-3 text-xs text-white placeholder-slate-700 font-mono focus:border-[#E95420] focus:outline-none disabled:opacity-50 transition-all custom-scrollbar resize-none"
            />
            
            {/* Terminal RUN button */}
            <button
              type="submit"
              disabled={!question.trim() || !isIngested || loadingAsk}
              className="absolute right-2.5 bottom-2.5 px-3 py-1.5 border border-[#3C3C3C] bg-[#252526] hover:bg-[#3C3C3C] disabled:bg-[#252526]/50 disabled:text-slate-700 disabled:border-[#252526]/50 text-white font-mono text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 cursor-pointer select-none active:scale-95"
            >
              <Send className="h-3 w-3" />
              <span>RUN</span>
            </button>
          </div>
        </form>
        <div className="mt-2 flex items-center justify-between text-[9px] text-slate-500 font-mono select-none">
          <span>HOTKEYS: ENTER = SUBMIT • SHIFT+ENTER = NEWLINE</span>
          <span className="flex items-center space-x-1 font-bold text-slate-500">
            <span>READY_FOR_QUERY</span>
          </span>
        </div>
      </div>

    </div>
  );
};

export default ChatWindow;
