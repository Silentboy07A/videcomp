import React from 'react';
import SourceBadges from './SourceBadges';

const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className="w-full flex flex-col mb-4 border border-[#3C3C3C] bg-[#252526] text-xs font-mono">
      
      {/* Log Header Bar */}
      <div className="border-b border-[#3C3C3C] bg-[#1E1E1E] px-3 py-1.5 flex justify-between items-center text-[10px] text-slate-500 select-none">
        <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wider">
          <span className={isUser ? "text-[#E95420]" : "text-indigo-400"}>
            {isUser ? 'PROMPT_INPUT' : 'RESPONSE_LOG'}
          </span>
        </div>
        <span>{message.timestamp}</span>
      </div>

      {/* Log Text Content */}
      <div className="p-3 text-slate-200 leading-relaxed whitespace-pre-wrap select-text break-words">
        {message.text}

        {/* Citations & memory footers for system responses */}
        {!isUser && (
          <>
            {/* Citations badges list */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-3.5 border-t border-[#3C3C3C] pt-2.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                  CITATIONS_BACKING
                </span>
                <SourceBadges sources={message.sources} />
              </div>
            )}

            {/* Memory units footprint */}
            {message.memory_size !== undefined && (
              <div className="mt-2.5 border-t border-[#3C3C3C]/60 pt-2 flex items-center space-x-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider select-none">
                <span>COMPARISON_MEMORY_DEPTH:</span>
                <span className="text-[#E95420] font-bold font-mono">
                  {message.memory_size} UNITS
                </span>
              </div>
            )}
          </>
        )}
      </div>
      
    </div>
  );
};

export default MessageBubble;
