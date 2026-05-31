import React from 'react';

const SourceBadges = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {sources.map((source, index) => {
        const isYoutube = source.video_id === 'A' || source.video_id?.toLowerCase() === 'youtube' || source.video_id?.toLowerCase() === 'a';
        
        return (
          <div
            key={index}
            className="inline-flex items-center space-x-1 border border-[#3C3C3C] bg-[#1E1E1E] px-2 py-0.5 text-[10px] font-mono text-slate-300 rounded-sm select-none"
          >
            <span className={isYoutube ? "text-red-400 font-bold" : "text-pink-400 font-bold"}>
              Video {source.video_id}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">
              Chunk {source.chunk_id}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SourceBadges;
