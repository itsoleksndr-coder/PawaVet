import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Sparkles,
  Stethoscope,
  FileText,
  CheckCircle2,
  Play,
  Copy,
  Building2,
} from "lucide-react";

export const TelemedAndAiView: React.FC = () => {
  const { currentUser, isVeterinarian, activeClinic } = useAuth();
  const { pets, addMedicalRecord } = useData();

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isAiListening, setIsAiListening] = useState(false);
  const [transcript, setTranscript] = useState(
    "Owner states Barnaby was playing fetch at the park yesterday and suddenly yelped and held his left hind leg up. He is bearing 20% weight today. Heart rate auscults 92 bpm with no murmurs. Left stifle joint has mild effusion and anterior drawer sign is positive. Suspect partial cranial cruciate ligament rupture. Plan for bilateral stifle radiographs and prescribe Carprofen 75mg daily with strict rest."
  );

  const [generatedSoap, setGeneratedSoap] = useState<{
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  } | null>(null);

  const handleSynthesizeAi = () => {
    setIsAiListening(true);
    setTimeout(() => {
      setGeneratedSoap({
        subjective:
          "Acute onset left hindlimb non-weight bearing lameness after ball fetch. Sudden yelp reported by owner. Appetite and hydration normal.",
        objective:
          "BAR. Cardiopulmonary auscultation clear. Left stifle demonstrates mild joint effusion, joint pain on full extension, and positive cranial drawer laxity.",
        assessment:
          "Primary Differential: Left Cranial Cruciate Ligament (CCL) sprain/partial rupture. Secondary: Meniscal tear.",
        plan:
          "1. Orthopedic stifle radiographs. 2. Rx: Rimadyl (Carprofen) 75mg PO q24h x 14d. 3. Leash walks only, zero stairs or running.",
      });
      setIsAiListening(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-teal-400 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-800/60 font-mono uppercase">
              Telemedicine & Clinical AI Scribe
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">Encrypted WebRTC Stream</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Virtual Exam Room & Ambient AI Scribe</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time HD audio/video consultation with ambient AI speech-to-SOAP generation.
          </p>
        </div>
      </div>

      {/* Main Grid: Video Room & AI Scribe Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Video Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-xl">
            {isVideoOn ? (
              <img
                src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80"
                alt="Patient Telehealth Video"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-slate-500 space-y-2">
                <VideoOff className="w-10 h-10 mx-auto" />
                <p className="text-xs">Camera Feed Paused</p>
              </div>
            )}

            {/* Doctor PIP overlay */}
            <div className="absolute top-4 right-4 w-32 h-24 rounded-2xl bg-slate-900 border-2 border-teal-500 overflow-hidden shadow-2xl">
              <img
                src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80"}
                alt="Attending DVM"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 left-1.5 text-[9px] font-bold text-white bg-slate-950/80 px-1 rounded">
                You (DVM)
              </div>
            </div>

            {/* In-Call Status Overlay */}
            <div className="absolute top-4 left-4 flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-mono text-white text-[11px]">Live: Barnaby (David Chen)</span>
            </div>

            {/* Controls Bar */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center space-x-3">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-2xl backdrop-blur-md transition-all shadow-lg ${
                  isMicOn ? "bg-slate-800/90 text-white" : "bg-rose-600 text-white"
                }`}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-2xl backdrop-blur-md transition-all shadow-lg ${
                  isVideoOn ? "bg-slate-800/90 text-white" : "bg-rose-600 text-white"
                }`}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Ambient AI Scribe Assistant (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Ambient AI Clinical Scribe</h3>
                  <p className="text-xs text-slate-400">Automated veterinary voice-to-SOAP generation</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Live Consultation Transcript
              </label>
              <textarea
                rows={4}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed font-mono"
              />
            </div>

            <button
              onClick={handleSynthesizeAi}
              disabled={isAiListening}
              className="w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center justify-center space-x-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAiListening ? "Synthesizing SOAP Record..." : "Generate Structured SOAP Chart"}</span>
            </button>

            {/* Generated SOAP Result */}
            {generatedSoap && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-purple-900/60 space-y-2.5 text-xs animate-in fade-in">
                <div className="flex items-center justify-between font-bold text-purple-300 border-b border-slate-800 pb-1.5">
                  <span className="font-mono text-[11px]">PARSED SOAP DOCUMENTATION</span>
                  <span className="text-[10px] text-emerald-400">✓ AI Confidence: 99.4%</span>
                </div>

                <div>
                  <span className="font-bold text-teal-400 font-mono">S: </span>
                  <span className="text-slate-300">{generatedSoap.subjective}</span>
                </div>
                <div>
                  <span className="font-bold text-blue-400 font-mono">O: </span>
                  <span className="text-slate-300">{generatedSoap.objective}</span>
                </div>
                <div>
                  <span className="font-bold text-purple-400 font-mono">A: </span>
                  <span className="text-slate-300">{generatedSoap.assessment}</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400 font-mono">P: </span>
                  <span className="text-slate-300">{generatedSoap.plan}</span>
                </div>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 text-center font-mono">
            Powered by Gemini Multi-Modal Veterinary Intelligence
          </div>
        </div>
      </div>
    </div>
  );
};
