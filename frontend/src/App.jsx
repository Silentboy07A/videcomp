import React, { useState } from 'react';
import Navbar from './components/Navbar';
import IngestForm from './components/IngestForm';
import ChatWindow from './components/ChatWindow';
import AnalysisPanel from './components/AnalysisPanel';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import { askQuestion } from './services/api';
import { Video, Compass, Layers, Shield, Search, BarChart4, ArrowRight, Code } from 'lucide-react';

function App() {
  const [view, setView] = useState('landing'); // 'landing' or 'workspace'
  const [ingested, setIngested] = useState(false);
  const [ingestData, setIngestData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingAsk, setLoadingAsk] = useState(false);
  const [retrievedChunks, setRetrievedChunks] = useState([]);

  const handleIngestSuccess = (data) => {
    setIngested(true);
    setIngestData(data);
    
    // Strict developer log greeting instead of visual emojis or flashy alerts
    const systemWelcome = {
      sender: 'assistant',
      text: `SYSTEM INIT COMPLETE: Comparative indexing matrix successfully mapped.

Ingestion statistics compiled:
• YouTube Source segments: ${data.youtube_chunks}
• Instagram Source segments: ${data.instagram_chunks}
• Total vector indices loaded: ${data.youtube_chunks + data.instagram_chunks} Chunks
• Memory cache block: ACTIVE

The comparison engine is ready to accept structural and contextual prompts. Submit queries below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      memory_size: data.youtube_chunks + data.instagram_chunks
    };
    
    setMessages([systemWelcome]);
    setRetrievedChunks([]); // Reset retrieved chunks on new ingestion
  };

  const handleSendMessage = async (questionText) => {
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const userMsg = {
      sender: 'user',
      text: questionText,
      timestamp: timestampStr
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setLoadingAsk(true);

    try {
      const data = await askQuestion(questionText);
      
      // Update Right Panel retrieved chunks state dynamically
      setRetrievedChunks(data.sources || []);

      const assistantMsg = {
        sender: 'assistant',
        text: data.answer,
        sources: data.sources || [],
        memory_size: data.memory_size,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        sender: 'assistant',
        text: `FATAL EXCEPTION: ${err.message || 'Execution aborted.'}\n\nPlease check server binds at http://127.0.0.1:8000 and ensure connection routes are active.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoadingAsk(false);
    }
  };

  const scrollToArchitecture = () => {
    const element = document.getElementById('architecture-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-slate-200 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* Top utility toolbar header */}
      <Navbar ingested={ingested} currentView={view} onViewChange={setView} />

      {/* Stage 1: Landing Page */}
      {view === 'landing' && (
        <div className="flex-grow flex flex-col justify-start">
          
          {/* Hero Section */}
          <section className="max-w-[1400px] w-full mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-[#3C3C3C]">
            
            {/* Hero technical details */}
            <div className="lg:col-span-6 space-y-6">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white font-mono uppercase">
                VidComp
              </h1>
              <p className="text-sm sm:text-base font-bold text-[#E95420] tracking-wide uppercase font-mono">
                Cross-Platform Video Analysis and Comparison
              </p>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans max-w-xl">
                Compare YouTube videos and Instagram reels using transcript extraction, semantic search, vector retrieval, and LLM-powered reasoning. VidComp maps target structures to evaluate content pace, semantic overlapping, and factual alignment across video streams.
              </p>
              
              <div className="flex flex-wrap gap-3 font-mono text-xs pt-1">
                <button
                  onClick={() => setView('workspace')}
                  className="px-5 py-2.5 bg-[#E95420] hover:bg-[#d84a16] text-white font-bold transition-colors cursor-pointer select-none rounded-none uppercase tracking-wider flex items-center gap-1.5"
                >
                  Launch Workspace
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </button>
                <button
                  onClick={scrollToArchitecture}
                  className="px-5 py-2.5 border border-[#3C3C3C] bg-[#252526] hover:bg-[#3C3C3C] text-slate-350 font-bold transition-all cursor-pointer select-none rounded-none uppercase tracking-wider"
                >
                  Explore Architecture
                </button>
              </div>
            </div>

            {/* Visual Workspace blueprint wireframe mockup */}
            <div className="lg:col-span-6 border border-[#3C3C3C] bg-[#252526] p-4 font-mono text-[10px] text-slate-500 rounded-sm shadow-2xl relative select-none">
              <div className="absolute top-2.5 right-3 h-2 w-2 rounded-full bg-emerald-500" />
              <div className="border-b border-[#3C3C3C] pb-2 mb-3 flex items-center space-x-1">
                <span className="text-white font-bold">WORKSPACE_BLUEPRINT</span>
                <span>• v1.0-schematic</span>
              </div>
              <div className="grid grid-cols-12 gap-2 h-40">
                {/* Left Panel wireframe */}
                <div className="col-span-4 border border-[#3C3C3C] bg-[#1E1E1E] p-2 space-y-1.5">
                  <div className="h-3 bg-[#3C3C3C] w-full" />
                  <div className="h-2 bg-[#252526] w-5/6" />
                  <div className="h-2 bg-[#252526] w-4/6" />
                  <div className="h-3.5 bg-[#E95420]/20 border border-[#E95420]/30 w-full" />
                </div>
                {/* Center Panel wireframe */}
                <div className="col-span-5 border border-[#3C3C3C] bg-[#1E1E1E] p-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="h-3 bg-indigo-500/10 border border-indigo-500/20 w-full" />
                    <div className="h-5 bg-[#252526] w-full" />
                  </div>
                  <div className="h-3 bg-[#252526] border border-[#3C3C3C] w-full" />
                </div>
                {/* Right Panel wireframe */}
                <div className="col-span-3 border border-[#3C3C3C] bg-[#1E1E1E] p-2 space-y-1.5">
                  <div className="h-3 bg-[#3C3C3C] w-full" />
                  <div className="h-5 bg-[#252526] w-full" />
                  <div className="h-5 bg-[#252526] w-full" />
                </div>
              </div>
              <div className="border-t border-[#3C3C3C] pt-2 mt-3 flex justify-between items-center text-[8px] text-slate-655 select-none">
                <span>LOCAL_PORT: 5173</span>
                <span>STATE: SYSTEM_READY</span>
              </div>
            </div>

          </section>

          {/* Technical Capabilities grid - 8 Cards */}
          <section className="max-w-[1400px] w-full mx-auto px-6 py-12 md:py-16 border-b border-[#3C3C3C]">
            <div className="mb-8 font-mono">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">SPECIFICATIONS</span>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">System Technical Capabilities</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
              
              {/* Card 1: Multi-Video Analysis */}
              <div className="border border-[#3C3C3C] bg-[#252526] p-5 rounded-none hover:border-[#E95420]/30 transition-colors">
                <Video className="h-5 w-5 text-[#E95420] mb-3 shrink-0" />
                <h3 className="font-bold text-slate-200 uppercase mb-1">Multi-Video Analysis</h3>
                <p className="text-[11px] text-slate-500 leading-normal">Extract transcripts and pacing across YouTube and Instagram Reels to align multi-source semantic content structures.</p>
              </div>

              {/* Card 2: Semantic Retrieval */}
              <div className="border border-[#3C3C3C] bg-[#252526] p-5 rounded-none hover:border-[#E95420]/30 transition-colors">
                <Search className="h-5 w-5 text-[#E95420] mb-3 shrink-0" />
                <h3 className="font-bold text-slate-200 uppercase mb-1">Semantic Retrieval</h3>
                <p className="text-[11px] text-slate-500 leading-normal">Retrieve relevant transcription context from deep vector coordinates to back system answers factually.</p>
              </div>

              {/* Card 3: Conversation Memory */}
              <div className="border border-[#3C3C3C] bg-[#252526] p-5 rounded-none hover:border-[#E95420]/30 transition-colors">
                <Layers className="h-5 w-5 text-[#E95420] mb-3 shrink-0" />
                <h3 className="font-bold text-slate-200 uppercase mb-1">Conversation Memory</h3>
                <p className="text-[11px] text-slate-500 leading-normal">Maintain semantic query context dynamically across question threads to preserve active comparison states.</p>
              </div>

              {/* Card 4: Metadata Analytics */}
              <div className="border border-[#3C3C3C] bg-[#252526] p-5 rounded-none hover:border-[#E95420]/30 transition-colors">
                <BarChart4 className="h-5 w-5 text-[#E95420] mb-3 shrink-0" />
                <h3 className="font-bold text-slate-200 uppercase mb-1">Metadata Analytics</h3>
                <p className="text-[11px] text-slate-500 leading-normal">Parse and compare duration headers, creator info, view aggregates, and segment counts dynamically.</p>
              </div>

              {/* Card 5: Source Attribution */}
              <div className="border border-[#3C3C3C] bg-[#252526] p-5 rounded-none hover:border-[#E95420]/30 transition-colors">
                <Compass className="h-5 w-5 text-[#E95420] mb-3 shrink-0" />
                <h3 className="font-bold text-slate-200 uppercase mb-1">Source Attribution</h3>
                <p className="text-[11px] text-slate-500 leading-normal">Pinpoint exact segment indices and platform target origins supporting each comparative answer.</p>
              </div>

              {/* Card 6: Prompt Injection Resistance */}
              <div className="border border-[#3C3C3C] bg-[#252526] p-5 rounded-none hover:border-[#E95420]/30 transition-colors">
                <Shield className="h-5 w-5 text-[#E95420] mb-3 shrink-0" />
                <h3 className="font-bold text-slate-200 uppercase mb-1">Injection Resistance</h3>
                <p className="text-[11px] text-slate-500 leading-normal">Enforce strict system instructions and index scoping rules to prevent model context hijacking.</p>
              </div>

              {/* Card 7: Vector Search */}
              <div className="border border-[#3C3C3C] bg-[#252526] p-5 rounded-none hover:border-[#E95420]/30 transition-colors">
                <Code className="h-5 w-5 text-[#E95420] mb-3 shrink-0" />
                <h3 className="font-bold text-slate-200 uppercase mb-1">Vector Search</h3>
                <p className="text-[11px] text-slate-500 leading-normal">Execute cosine similarity matches on high-dimensional text embeddings against compiled Qdrant stores.</p>
              </div>

              {/* Card 8: Cross-Platform Comparison */}
              <div className="border border-[#3C3C3C] bg-[#252526] p-5 rounded-none hover:border-[#E95420]/30 transition-colors">
                <Video className="h-5 w-5 text-[#E95420] mb-3 shrink-0" />
                <h3 className="font-bold text-slate-200 uppercase mb-1">Cross-Platform</h3>
                <p className="text-[11px] text-slate-500 leading-normal">Map similarities, semantic discrepancies, and structural pacing shifts between YouTube and Instagram datasets.</p>
              </div>

            </div>
          </section>

          {/* Pipeline Diagram */}
          <section id="architecture-section" className="max-w-[1400px] w-full mx-auto px-6 py-12 md:py-16">
            <div className="mb-6 font-mono">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">FLOWCHART_SCHEMATICS</span>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">System Architecture</h2>
            </div>
            
            <ArchitectureDiagram />
          </section>

          {/* Footer bar */}
          <footer className="border-t border-[#3C3C3C] bg-[#252526] py-6 text-center text-slate-600 text-[10px] font-bold tracking-wider uppercase font-mono mt-auto">
            <span>© {new Date().getFullYear()} VIDCOMP • Canonical-Inspired Production Stack</span>
          </footer>

        </div>
      )}

      {/* Stage 2: 3-Column Engineering Workspace */}
      {view === 'workspace' && (
        <div className="flex-grow flex flex-col justify-start overflow-hidden">
          
          {/* Main Workspace 3-Column grid */}
          <div className="flex-grow max-w-[1600px] w-full mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch overflow-hidden">
            
            {/* Left Sidebar Panel (col-span-3) */}
            <div className="lg:col-span-3 flex flex-col min-h-0">
              <IngestForm onIngestSuccess={handleIngestSuccess} isIngested={ingested} />
            </div>

            {/* Center Console Workspace Panel (col-span-6) */}
            <div className="lg:col-span-6 flex flex-col min-h-0">
              <ChatWindow 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isIngested={ingested}
                loadingAsk={loadingAsk}
              />
            </div>

            {/* Right Analysis Workspace Monitor Panel (col-span-3) */}
            <div className="lg:col-span-3 flex flex-col min-h-0">
              <AnalysisPanel 
                ingestData={ingestData} 
                retrievedChunks={retrievedChunks}
                isIngested={ingested}
                messages={messages}
              />
            </div>

          </div>

          {/* Factual IDE status bar */}
          <footer className="h-6 w-full border-t border-[#3C3C3C] bg-[#252526] px-4 flex items-center justify-between text-[10px] font-mono text-[#B0B0B0] select-none shrink-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>BACKEND: ONLINE</span>
              </div>
              <span className="text-[#3C3C3C]">|</span>
              <div className="flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E95420]" />
                <span>VECTOR DATABASE: ACTIVE</span>
              </div>
              <span className="text-[#3C3C3C]">|</span>
              <div className="flex items-center space-x-1.5">
                <span>MEMORY:</span>
                <span className="text-white font-bold">
                  {ingested ? `${ingestData?.youtube_chunks + ingestData?.instagram_chunks} CHUNKS` : 'UNMAPPED'}
                </span>
              </div>
              <span className="text-[#3C3C3C]">|</span>
              <div className="flex items-center space-x-1.5">
                <span>INDEX STATUS:</span>
                <span className={ingested ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                  {ingested ? 'INDEXED' : 'UNMAPPED'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span>PORT: 5173</span>
              <span className="text-[#3C3C3C]">|</span>
              <span>PROTOCOL: REST_API</span>
              <span className="text-[#3C3C3C]">|</span>
              <span className="text-slate-650">UTF-8</span>
            </div>
          </footer>

        </div>
      )}

    </div>
  );
}

export default App;
