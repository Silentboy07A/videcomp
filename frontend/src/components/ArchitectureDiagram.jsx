import React from 'react';
import { ArrowDown, Database, Cpu, Video, Film, ArrowRight } from 'lucide-react';

const ArchitectureDiagram = () => {
  return (
    <div className="w-full bg-[#252526] border border-[#3C3C3C] p-6 font-mono text-xs select-none">
      <div className="border-b border-[#3C3C3C] pb-3 mb-6 flex justify-between items-center">
        <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Database className="h-4 w-4 text-[#E95420]" />
          System Processing & Ingestion Pipeline
        </span>
        <span className="text-[10px] text-slate-500">REF: VIDCOMP_PIPELINE_v1.0</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Stage 1: Extraction Inputs */}
        <div className="md:col-span-3 space-y-4">
          <div className="border border-[#3C3C3C] bg-[#1E1E1E] p-3 text-center rounded-sm">
            <div className="flex items-center justify-center gap-1.5 text-red-400 font-bold mb-1">
              <Video className="h-4 w-4 shrink-0" />
              <span>YouTube Video</span>
            </div>
            <span className="text-[10px] text-slate-500">Primary Stream</span>
          </div>
          
          <div className="flex justify-center text-slate-650 py-0.5">
            <ArrowDown className="h-4 w-4 text-[#E95420]" />
          </div>

          <div className="border border-[#3C3C3C] bg-[#1E1E1E] p-3 text-center rounded-sm">
            <div className="flex items-center justify-center gap-1.5 text-pink-400 font-bold mb-1">
              <Film className="h-4 w-4 shrink-0" />
              <span>Instagram Reel</span>
            </div>
            <span className="text-[10px] text-slate-500">Secondary Stream</span>
          </div>
        </div>

        {/* Vector Arrow 1 */}
        <div className="md:col-span-1 flex justify-center text-[#E95420]">
          <ArrowRight className="h-6 w-6 hidden md:block" />
          <ArrowDown className="h-6 w-6 md:hidden my-2" />
        </div>

        {/* Stage 2: Splitting & Vector Indexing */}
        <div className="md:col-span-4 space-y-3">
          <div className="border border-[#3C3C3C] bg-[#1E1E1E] p-3 text-center rounded-sm">
            <div className="font-bold text-slate-350 mb-1">Transcript Extraction</div>
            <span className="text-[10px] text-slate-500">Audio Stream Parsing</span>
          </div>

          <div className="flex justify-center text-slate-650">
            <ArrowDown className="h-4 w-4" />
          </div>

          <div className="border border-[#3C3C3C] bg-[#1E1E1E] p-3 text-center rounded-sm">
            <div className="font-bold text-slate-350 mb-1">Chunking & Embeddings</div>
            <span className="text-[10px] text-slate-500">Recursive Text Splitting</span>
          </div>

          <div className="flex justify-center text-slate-650">
            <ArrowDown className="h-4 w-4" />
          </div>

          <div className="border border-[#3C3C3C] bg-[#1E1E1E] p-3 text-center rounded-sm border-l-2 border-l-[#E95420]">
            <div className="font-bold text-[#E95420] flex items-center justify-center gap-1.5">
              <Database className="h-3.5 w-3.5 shrink-0" />
              <span>Qdrant Vector Store</span>
            </div>
            <span className="text-[10px] text-slate-500">Database Index Storage</span>
          </div>
        </div>

        {/* Vector Arrow 2 */}
        <div className="md:col-span-1 flex justify-center text-[#E95420]">
          <ArrowRight className="h-6 w-6 hidden md:block" />
          <ArrowDown className="h-6 w-6 md:hidden my-2" />
        </div>

        {/* Stage 3: Query & LLM Synthesis */}
        <div className="md:col-span-3 space-y-4">
          <div className="border border-[#3C3C3C] bg-[#1E1E1E] p-3 text-center rounded-sm">
            <div className="font-bold text-slate-350 mb-1">Retrieval Layer</div>
            <span className="text-[10px] text-slate-500">Cosine Similarity Matching</span>
          </div>

          <div className="flex justify-center text-slate-650 py-0.5">
            <ArrowDown className="h-4 w-4" />
          </div>

          <div className="border border-[#3C3C3C] bg-[#1E1E1E] p-3 text-center rounded-sm border-l-2 border-l-indigo-400">
            <div className="font-bold text-indigo-400 mb-1 flex items-center justify-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 shrink-0" />
              <span>Groq LLM Engine</span>
            </div>
            <span className="text-[10px] text-slate-500">Retrieval Context Synthesis</span>
          </div>

          <div className="flex justify-center text-slate-650 py-0.5">
            <ArrowDown className="h-4 w-4 text-[#E95420]" />
          </div>

          <div className="border border-[#E95420]/30 bg-[#E95420]/5 p-2.5 text-center rounded-sm">
            <div className="font-bold text-[#E95420] text-[11px] uppercase">Answer Compiled</div>
            <span className="text-[9px] text-slate-500">Grounded Synthesis report</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ArchitectureDiagram;
