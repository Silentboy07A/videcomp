import React from 'react';
import { Database, Cpu, Layers, MessageSquare } from 'lucide-react';

const AnalysisPanel = ({ ingestData, retrievedChunks, isIngested, messages }) => {
  // Extract cited sources from the latest system response
  const lastAssistantMessage = [...messages].reverse().find(msg => msg.sender === 'assistant');
  const activeSources = lastAssistantMessage?.sources || [];

  return (
    <div className="w-full bg-[#252526] border border-[#3C3C3C] text-slate-200 select-none font-mono text-xs flex flex-col h-full space-y-4 p-4 rounded-none">
      
      {/* SECTION 1: Retrieved Chunks */}
      <div className="border border-[#3C3C3C] bg-[#1E1E1E] p-3 rounded-sm flex-grow flex flex-col min-h-[200px]">
        <span className="font-bold text-[10px] text-slate-500 uppercase tracking-widest block border-b border-[#3C3C3C] pb-1.5 mb-2 select-none">
          Retrieved Chunks
        </span>
        
        <div className="flex-grow overflow-y-auto space-y-2 custom-scrollbar text-[11px]">
          {retrievedChunks && retrievedChunks.length > 0 ? (
            retrievedChunks.map((chunk, index) => {
              const isYoutube = chunk.video_id === 'A' || chunk.video_id?.toLowerCase() === 'youtube' || chunk.video_id?.toLowerCase() === 'a';
              
              return (
                <div key={index} className="border border-[#3C3C3C] bg-[#252526] p-2 rounded-sm space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className={isYoutube ? "text-red-400 font-bold" : "text-pink-400 font-bold"}>
                      VIDEO_{chunk.video_id}
                    </span>
                    <span className="text-slate-500 font-bold">CHUNK_{chunk.chunk_id}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 bg-[#1E1E1E] p-1 border border-[#3C3C3C]/40 leading-normal select-all">
                    Extracted transcript chunk retrieved via similarity matching.
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex items-center justify-center text-center text-slate-600 py-8 leading-normal select-none">
              <span>Awaiting similarity search vectors. Ask a question to query Qdrant indexes.</span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Source References */}
      <div className="border border-[#3C3C3C] bg-[#1E1E1E] p-3 rounded-sm shrink-0">
        <span className="font-bold text-[10px] text-slate-500 uppercase tracking-widest block border-b border-[#3C3C3C] pb-1.5 mb-2 select-none">
          Source References
        </span>
        
        <div className="space-y-1.5 max-h-[100px] overflow-y-auto custom-scrollbar text-[11px]">
          {activeSources.length > 0 ? (
            activeSources.map((source, index) => {
              const isYoutube = source.video_id === 'A' || source.video_id?.toLowerCase() === 'youtube' || source.video_id?.toLowerCase() === 'a';
              return (
                <div key={index} className="flex justify-between items-center border border-[#3C3C3C]/60 bg-[#252526] px-2 py-1 rounded-sm text-[10px]">
                  <span className="text-slate-400 font-bold">Video {source.video_id}</span>
                  <span className="text-slate-600">•</span>
                  <span className={isYoutube ? "text-red-400 font-bold" : "text-pink-400 font-bold"}>
                    Chunk {source.chunk_id}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-slate-600 leading-normal select-none">
              No references loaded for the current message state.
            </p>
          )}
        </div>
      </div>

      {/* SECTION 3: Conversation Memory */}
      <div className="border border-[#3C3C3C] bg-[#1E1E1E] p-3 rounded-sm space-y-2 shrink-0">
        <span className="font-bold text-[10px] text-slate-500 uppercase tracking-widest block border-b border-[#3C3C3C] pb-1 select-none">
          Conversation Memory
        </span>
        <div className="space-y-1.5 text-[11px] text-slate-400">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px]">
              <MessageSquare className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              ACTIVE_THREAD:
            </span>
            <span className="text-white font-bold">{messages.length} Nodes</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px]">
              <Layers className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              INDEXED_UNITS:
            </span>
            <span className="text-white font-bold">
              {isIngested && ingestData ? `${ingestData.youtube_chunks + ingestData.instagram_chunks} Chunks` : 'UNMAPPED'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 4: Backend Status */}
      <div className="border border-[#3C3C3C] bg-[#1E1E1E] p-3 rounded-sm space-y-2 shrink-0">
        <span className="font-bold text-[10px] text-slate-500 uppercase tracking-widest block border-b border-[#3C3C3C] pb-1 select-none">
          Backend Status
        </span>
        <div className="space-y-1.5 text-[11px] text-slate-400">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px]">
              <Database className="h-3.5 w-3.5 text-[#E95420] shrink-0" />
              QDRANT_NODE:
            </span>
            <span className="text-emerald-500 font-bold">ACTIVE</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px]">
              <Cpu className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              GROQ_CLIENT:
            </span>
            <span className="text-emerald-500 font-bold">ONLINE</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AnalysisPanel;
