import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Printer,
  Sparkles,
  CheckCircle2,
  Play,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getTechniqueById } from '../data/clinicalTechniques';

export const PrescriptionPage = () => {
  const navigate = useNavigate();
  const { user, latestAssessment } = useAuth();
  const { t } = useLanguage();

  const techniqueId = latestAssessment?.techniqueId || 'modified_bass';
  const technique = getTechniqueById(techniqueId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print:py-0 print:px-0">
      {/* Header & Print Control */}
      <div className="bg-slate-900/90 border border-indigo-500/30 p-6 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">{t('rx_title')}</h1>
            <p className="text-xs text-slate-400 font-medium">
              {t('rx_desc')}
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 font-bold text-xs flex items-center gap-2 transition shadow-md cursor-pointer"
        >
          <Printer className="w-4 h-4 text-indigo-300" />
          <span>{t('btn_print_pdf')}</span>
        </button>
      </div>

      {/* Printable Prescription Document */}
      <div className="bg-slate-900/90 border border-indigo-500/30 p-6 sm:p-10 rounded-3xl space-y-8 shadow-2xl print:shadow-none print:border-none print:p-0 print:bg-white print:text-slate-900 backdrop-blur-xl text-slate-100">
        {/* Document Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6 print:border-gray-300">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span className="text-lg font-black tracking-tight text-white print:text-slate-900">
                {t('rx_header_brand')}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium print:text-slate-600">
              Diagnostic Hygiene Rx #TM-2026-{(user?.id || 1).toString().padStart(4, '0')}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs font-black text-white print:text-slate-900">
              Patient: {user?.name || 'Mahin'}
            </div>
            <div className="text-[11px] text-slate-400 font-medium print:text-slate-600">
              Date: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Matched Technique Hero Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-600 to-violet-700 text-white space-y-2 shadow-2xl shadow-indigo-950/40 border border-indigo-400/30">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-200" />
            <span className="text-xs font-black text-purple-200 uppercase tracking-wider">
              {t('rx_banner_tag')}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            {technique.name}
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
            {technique.description}
          </p>
        </div>

        {/* Prescribed Hardware & Products Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider print:text-slate-600">
            {t('rx_specs_title')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-slate-800/90 border border-indigo-500/30 space-y-1.5 shadow-lg">
              <span className="font-black text-indigo-300 text-sm flex items-center gap-1.5">🪥 {t('rx_brush_spec_title')}</span>
              <p className="font-extrabold text-white text-xs sm:text-sm">
                {t('rx_brush_spec_val')}
              </p>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Designed to reach sulcular margins without causing root abrasion or tissue trauma.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/90 border border-purple-500/30 space-y-1.5 shadow-lg">
              <span className="font-black text-purple-300 text-sm flex items-center gap-1.5">🧪 {t('rx_paste_spec_title')}</span>
              <p className="font-extrabold text-white text-xs sm:text-sm">
                {t('rx_paste_spec_val')}
              </p>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Provides nerve desensitization for exposed root dentin while reinforcing enamel matrix.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/90 border border-violet-500/30 space-y-1.5 shadow-lg">
              <span className="font-black text-violet-300 text-sm flex items-center gap-1.5">💧 {t('rx_rinse_spec_title')}</span>
              <p className="font-extrabold text-white text-xs sm:text-sm">
                {t('rx_rinse_spec_val')}
              </p>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Reduces gingival biofilm load and eliminates halitosis-causing volatile sulfur compounds.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/90 border border-indigo-500/30 space-y-1.5 shadow-lg">
              <span className="font-black text-indigo-300 text-sm flex items-center gap-1.5">⏱️ {t('rx_duration_spec_title')}</span>
              <p className="font-extrabold text-white text-xs sm:text-sm">
                {t('rx_duration_spec_val')}
              </p>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Equal 20-second duration allocation per tooth arch quadrant.
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider print:text-slate-600">
            {t('assess_step_guide')}
          </h3>
          <div className="space-y-2.5 text-xs">
            {technique.steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-slate-200 font-medium print:text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end print:hidden">
          <button
            onClick={() => navigate('/smart-mirror')}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-indigo-500/30 transform hover:scale-[1.02] transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{t('btn_practice_mirror')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
