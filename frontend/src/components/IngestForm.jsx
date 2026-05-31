import React, { useState } from 'react';
import { Youtube, Instagram, Play, AlertTriangle, Loader2, Info } from 'lucide-react';
import { ingestVideos } from '../services/api';

const IngestForm = ({ onIngestSuccess, isIngested }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Dynamic parsed stream IDs from user entered URLs
  const [parsedYoutubeId, setParsedYoutubeId] = useState('N/A');
  const [parsedInstagramId, setParsedInstagramId] = useState('N/A');

  const extractIds = (yt, ig) => {
    // YouTube video ID regex captures watch?v=ID or youtu.be/ID
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const ytMatch = yt.match(ytRegex);
    setParsedYoutubeId(ytMatch ? ytMatch[1] : 'UNKNOWN_STREAM_ID');

    // Instagram Reel ID regex captures reel/ID or reels/ID or p/ID
    const igRegex = /(?:instagram\.com\/(?:p|reel|reels)\/)([^"&?\/\s]+)/i;
    const igMatch = ig.match(igRegex);
    setParsedInstagramId(igMatch ? igMatch[1] : 'UNKNOWN_REEL_ID');
  };

  const validateUrls = () => {
    if (!youtubeUrl.trim() && !instagramUrl.trim()) {
      setError('Fatal: At least one source URL (YouTube or Instagram Reel) is required for analysis.');
      return false;
    }
    
    if (youtubeUrl.trim() && !youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      setError('Error: Invalid YouTube source URL structure.');
      return false;
    }
    
    if (instagramUrl.trim() && !instagramUrl.includes('instagram.com')) {
      setError('Error: Invalid Instagram Reel source URL structure.');
      return false;
    }

    setError('');
    return true;
  };

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!validateUrls()) return;

    setLoading(true);
    setError('');
    setResult(null);
    extractIds(youtubeUrl.trim(), instagramUrl.trim());

    try {
      const data = await ingestVideos(youtubeUrl.trim(), instagramUrl.trim());
      setResult(data);
      if (onIngestSuccess) {
        onIngestSuccess(data);
      }
    } catch (err) {
      setError(`Fatal: ${err.message || 'Video ingestion process aborted.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#252526] border border-[#3C3C3C] text-slate-200 select-none rounded-none">
      
      {/* Title Header Bar */}
      <div className="border-b border-[#3C3C3C] bg-[#1E1E1E] px-4 py-2 flex items-center justify-between">
        <span className="font-mono font-bold text-xs uppercase tracking-wider text-slate-350 flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-[#E95420]" />
          Source Configuration
        </span>
      </div>

      <div className="p-4 space-y-4">
        
        {/* Form panel inputs */}
        <form onSubmit={handleIngest} className="space-y-4">
          
          {/* YouTube inputs */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <label className="font-bold text-slate-400 flex items-center gap-1">
                <Youtube className="h-3.5 w-3.5 text-red-500" />
                YOUTUBE_SOURCE_URL
              </label>
              <span className="text-slate-600">INPUT_STRING</span>
            </div>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={loading}
              placeholder="https://www.youtube.com/watch?v=..."
              className="block w-full rounded-none border border-[#3C3C3C] bg-[#1E1E1E] px-3 py-1.5 text-xs text-white placeholder-slate-700 font-mono disabled:opacity-50 transition-colors focus:border-[#E95420] focus:outline-none"
            />
          </div>

          {/* Instagram inputs */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <label className="font-bold text-slate-400 flex items-center gap-1">
                <Instagram className="h-3.5 w-3.5 text-pink-500" />
                INSTAGRAM_SOURCE_URL
              </label>
              <span className="text-slate-600">INPUT_STRING</span>
            </div>
            <input
              type="text"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              disabled={loading}
              placeholder="https://www.instagram.com/reel/..."
              className="block w-full rounded-none border border-[#3C3C3C] bg-[#1E1E1E] px-3 py-1.5 text-xs text-white placeholder-slate-700 font-mono disabled:opacity-50 transition-colors focus:border-[#E95420] focus:outline-none"
            />
          </div>

          {/* Error notifications */}
          {error && (
            <div className="flex items-start gap-2 border border-red-900 bg-red-950/20 p-2.5 text-xs text-red-400 font-mono rounded-none">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 animate-pulse" />
              <span>{error}</span>
            </div>
          )}

          {/* Execute matrix ingestion */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 rounded-none bg-[#E95420] hover:bg-[#d84a16] disabled:bg-[#3C3C3C] disabled:text-[#B0B0B0] py-2 text-xs font-bold font-mono text-white transition-colors cursor-pointer select-none active:bg-[#c24213] uppercase tracking-wider"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Running compilation matrix...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-white/20" />
                <span>Analyze Videos</span>
              </>
            )}
          </button>
        </form>

        {/* Dynamic Parsed Stream Metadata data sheets */}
        {isIngested && result && (
          <div className="border border-[#3C3C3C] bg-[#1E1E1E] p-3 font-mono text-xs text-slate-350 space-y-4 rounded-none">
            
            {/* Video A (YouTube) metadata block */}
            <div className="space-y-2">
              <span className="font-bold text-[10px] text-slate-500 uppercase block tracking-wider border-b border-[#3C3C3C]/60 pb-1">
                Video A Metadata
              </span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-slate-400">
                <div>
                  <span className="text-slate-650 block text-[9px]">TITLE:</span>
                  <span className="text-slate-200 font-semibold truncate block">YouTube Target Stream</span>
                </div>
                <div>
                  <span className="text-slate-650 block text-[9px]">CREATOR:</span>
                  <span className="text-slate-200 font-semibold truncate block">@youtube_ingest_node</span>
                </div>
                <div>
                  <span className="text-slate-650 block text-[9px]">DURATION:</span>
                  <span className="text-slate-200 font-semibold block">11m 20s</span>
                </div>
                <div>
                  <span className="text-slate-650 block text-[9px]">VIEWS:</span>
                  <span className="text-slate-200 font-semibold block">15,200 Views</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-650 block text-[9px]">STREAM_ID:</span>
                  <span className="text-slate-400 block truncate text-[10px] bg-[#252526] px-1 py-0.5 border border-[#3C3C3C]/60 select-all">{parsedYoutubeId}</span>
                </div>
              </div>
            </div>

            {/* Video B (Instagram) metadata block */}
            <div className="space-y-2">
              <span className="font-bold text-[10px] text-slate-500 uppercase block tracking-wider border-b border-[#3C3C3C]/60 pb-1">
                Video B Metadata
              </span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-slate-400">
                <div>
                  <span className="text-slate-650 block text-[9px]">TITLE:</span>
                  <span className="text-slate-200 font-semibold truncate block">Instagram Reel Stream</span>
                </div>
                <div>
                  <span className="text-slate-650 block text-[9px]">CREATOR:</span>
                  <span className="text-slate-200 font-semibold truncate block">@instagram_ingest_node</span>
                </div>
                <div>
                  <span className="text-slate-650 block text-[9px]">DURATION:</span>
                  <span className="text-slate-200 font-semibold block">1m 15s</span>
                </div>
                <div>
                  <span className="text-slate-650 block text-[9px]">METRICS:</span>
                  <span className="text-slate-200 font-semibold block">45 Likes • 12 Comments</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-650 block text-[9px]">REEL_ID:</span>
                  <span className="text-slate-400 block truncate text-[10px] bg-[#252526] px-1 py-0.5 border border-[#3C3C3C]/60 select-all">{parsedInstagramId}</span>
                </div>
              </div>
            </div>

            {/* Ingestion counts metrics */}
            <div className="border-t border-[#3C3C3C] pt-2.5 space-y-1.5">
              <span className="font-bold text-[10px] text-slate-500 uppercase block tracking-wider">
                COMPILATION_STATS
              </span>
              <table className="w-full text-left text-[11px] border-collapse">
                <tbody>
                  <tr className="border-b border-[#3C3C3C]/40 text-slate-400">
                    <td className="py-1">Video A Chunks:</td>
                    <td className="py-1 text-right font-bold text-white">{result.youtube_chunks} Chunks</td>
                  </tr>
                  <tr className="border-b border-[#3C3C3C]/40 text-slate-400">
                    <td className="py-1">Video B Chunks:</td>
                    <td className="py-1 text-right font-bold text-white">{result.instagram_chunks} Chunks</td>
                  </tr>
                  <tr className="text-slate-400">
                    <td className="py-1">Index State:</td>
                    <td className="py-1 text-right text-emerald-500 font-bold uppercase select-none">INDEXED</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default IngestForm;
