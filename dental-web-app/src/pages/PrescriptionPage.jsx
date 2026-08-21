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
      <div className="bg-white p-6 rounded-3xl border border-teal-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-500 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">{t('rx_title')}</h1>
            <p className="text-xs text-slate-500 font-medium">
              {t('rx_desc')}
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs flex items-center gap-2 transition shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4 text-teal-700" />
          <span>{t('btn_print_pdf')}</span>
        </button>
      </div>

      {/* Printable Prescription Document */}
      <div className="bg-white border border-teal-100 p-6 sm:p-10 rounded-3xl space-y-8 shadow-sm print:shadow-none print:border-none print:p-0">
        {/* Document Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-6 print:border-gray-300">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600 animate-pulse" />
              <span className="text-lg font-black tracking-tight text-slate-900">
                {t('rx_header_brand')}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Diagnostic Hygiene Rx #TM-2026-{(user?.id || 1).toString().padStart(4, '0')}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs font-black text-slate-900">
              Patient: {user?.name || 'Mahin'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Date: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Matched Technique Hero Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-800 text-white space-y-2 shadow-xl shadow-teal-900/20 border border-teal-400/30">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-300" />
            <span className="text-xs font-black text-teal-200 uppercase tracking-wider">
              {t('rx_banner_tag')}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            {technique.name}
          </h2>
          <p className="text-xs sm:text-sm text-teal-100 leading-relaxed font-medium">
            {technique.description}
          </p>
        </div>

        {/* Prescribed Hardware & Products Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-600 tracking-wider">
            {t('rx_specs_title')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50/50 border border-teal-200/90 space-y-1.5 shadow-xs">
              <span className="font-black text-teal-900 text-sm flex items-center gap-1.5">🪥 {t('rx_brush_spec_title')}</span>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                {t('rx_brush_spec_val')}
              </p>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                Designed to reach sulcular margins without causing root abrasion or tissue trauma.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/90 space-y-1.5 shadow-xs">
              <span className="font-black text-emerald-900 text-sm flex items-center gap-1.5">🧪 {t('rx_paste_spec_title')}</span>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                {t('rx_paste_spec_val')}
              </p>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                Provides nerve desensitization for exposed root dentin while reinforcing enamel matrix.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50/50 border border-indigo-200/90 space-y-1.5 shadow-xs">
              <span className="font-black text-indigo-900 text-sm flex items-center gap-1.5">💧 {t('rx_rinse_spec_title')}</span>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                {t('rx_rinse_spec_val')}
              </p>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                Reduces gingival biofilm load and eliminates halitosis-causing volatile sulfur compounds.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-teal-50/50 border border-sky-200/90 space-y-1.5 shadow-xs">
              <span className="font-black text-teal-900 text-sm flex items-center gap-1.5">⏱️ {t('rx_duration_spec_title')}</span>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                {t('rx_duration_spec_val')}
              </p>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                Equal 20-second duration allocation per tooth arch quadrant.
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-600 tracking-wider">
            {t('assess_step_guide')}
          </h3>
          <div className="space-y-2.5 text-xs">
            {technique.steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-slate-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end print:hidden">
          <button
            onClick={() => navigate('/smart-mirror')}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-teal-600/20 transform hover:scale-[1.02] transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{t('btn_practice_mirror')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
