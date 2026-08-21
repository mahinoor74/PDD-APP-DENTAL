import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  ArrowRight,
  Play,
  RotateCcw,
} from 'lucide-react';
import { apiService } from '../api/apiService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Toast } from '../components/Toast';

export const AssessmentPage = () => {
  const navigate = useNavigate();
  const { user, setLatestAssessment } = useAuth();
  const { t } = useLanguage();

  const [responses, setResponses] = useState({
    hasBraces: false,
    bleedingGums: false,
    recededGums: false,
    hasImplants: false,
    heavySmoker: false,
    aggressiveBrusher: false,
    sensitivity: false,
    manualDexterity: false,
    preventative: false,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const questions = [
    { key: 'hasBraces', title: 'Fixed Braces or Archwires', desc: 'Do you have orthodontic metal or clear brackets attached to your teeth?', icon: '😬' },
    { key: 'bleedingGums', title: 'Bleeding or Tender Gums', desc: 'Do your gums bleed, look red, or swell when brushing or flossing?', icon: '🩸' },
    { key: 'recededGums', title: 'Gum Recession & Exposed Roots', desc: 'Have your gums pulled back, exposing tooth roots or sensitive root surfaces?', icon: '🦷' },
    { key: 'hasImplants', title: 'Dental Implants, Crowns or Bridges', desc: 'Do you have titanium implants, fixed porcelain bridges, or artificial crowns?', icon: '💎' },
    { key: 'sensitivity', title: 'Thermal Tooth Sensitivity', desc: 'Do you experience sharp discomfort when eating hot or cold foods/drinks?', icon: '❄️' },
    { key: 'aggressiveBrusher', title: 'Firm Pressure / Hard Bristles', desc: 'Do you scrub firmly or use medium/hard toothbrush bristles?', icon: '⚡' },
    { key: 'heavySmoker', title: 'Tobacco Use or Tough Stains', desc: 'Do you smoke, vape, or frequently notice heavy tartar/tea/coffee staining?', icon: '🚬' },
    { key: 'manualDexterity', title: 'Limited Manual Dexterity', desc: 'Do you find it difficult to maneuver a toothbrush around your back molars?', icon: '🖐️' },
    { key: 'preventative', title: 'Standard Maintenance', desc: 'Looking for a general healthy routine to keep plaque away daily?', icon: '✨' },
  ];

  const toggleKey = (key) => {
    setResponses((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiService.submitAssessment(user?.id || 1, responses);
      setResult(data);
      setLatestAssessment(data);
      setToastMessage({ message: 'Diagnostic analysis complete!', type: 'success' });
    } catch (err) {
      console.warn("Assessment submission error:", err);
      let fallbackTech = "Modified Bass Technique";
      let desc = "Gold-standard sulcular cleaning method targeting subgingival plaque.";

      if (responses.hasBraces) {
        fallbackTech = "Orthodontic Charters Technique";
        desc = "Formulated explicitly by Dr. W.J. Charters for orthodontic bracket cleaning.";
      } else if (responses.recededGums || responses.sensitivity) {
        fallbackTech = "Modified Stillman Technique";
        desc = "Tissue-protective technique designed for sensitive roots and gum recession.";
      }

      const fallbackResult = {
        success: true,
        technique: fallbackTech,
        description: desc,
        whatItIs: `Clinical routine specifically chosen based on your answers.`,
        howItWorks: `Angled bristles and controlled sweeping motions clear biofilm efficiently.`,
        whySuggested: `Selected according to your oral health survey parameters.`,
        precautions: [
          'Use soft end-rounded bristles only.',
          'Avoid hard horizontal scrubbing across the dental arch.',
          'Brush for 2 minutes twice daily.'
        ],
        steps: [
          'Place brush bristles at 45 degree angle near gumline.',
          'Execute short gentle vibratory pulses.',
          'Sweep brush head toward chewing edges.',
          'Finish by cleaning chewing tops and tongue.'
        ],
        videoUrl: 'https://www.youtube.com/embed/4iIGhqi57es'
      };

      setResult(fallbackResult);
      setLatestAssessment(fallbackResult);
      setToastMessage({ message: 'Diagnostic routine matched.', type: 'info' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Main Survey Title Card */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl text-center max-w-4xl mx-auto mb-6 space-y-2 backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-black shadow-sm">
          <ClipboardCheck className="w-4 h-4 text-indigo-400" />
          <span>{t('assess_tag')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          {t('assess_title')}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto font-medium">
          {t('assess_desc')}
        </p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((q) => {
              const isChecked = responses[q.key];
              return (
                <div
                  key={q.key}
                  onClick={() => toggleKey(q.key)}
                  className={`rounded-2xl p-6 transition-all cursor-pointer flex items-center justify-between ${
                    isChecked
                      ? 'bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border-2 border-indigo-400 shadow-2xl shadow-indigo-500/30'
                      : 'bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-indigo-400/80 shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl shrink-0 mt-0.5">{q.icon}</span>
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-white">
                        {q.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        {q.desc}
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="accent-indigo-400 w-5 h-5 cursor-pointer shrink-0 ml-3"
                  />
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-black text-base shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 transition cursor-pointer transform hover:scale-[1.01]"
          >
            <span>{loading ? t('btn_processing') : t('assess_btn_analyze')}</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        </form>
      ) : (
        /* Diagnostic Results Card */
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-200 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold uppercase tracking-wider">
                  {t('assess_match_result')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {result.technique}
                </h2>
                <p className="text-xs sm:text-sm text-teal-700 font-extrabold">
                  {result.description}
                </p>
              </div>

              <button
                onClick={() => setResult(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('btn_retake_survey')}</span>
              </button>
            </div>

            {/* Why Suggested & Clinical Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-extrabold text-teal-800 uppercase tracking-wider">
                  📖 {t('assess_what_it_is')}
                </span>
                <p className="text-slate-700 leading-relaxed font-semibold">{result.whatItIs}</p>
                <p className="text-slate-600 leading-relaxed">{result.howItWorks}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-extrabold text-emerald-800 uppercase tracking-wider">
                  🎯 {t('assess_why_suggested')}
                </span>
                <p className="text-slate-700 leading-relaxed font-semibold">{result.whySuggested}</p>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            {result.steps && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  {t('assess_step_guide')}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {result.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                    >
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => navigate('/smart-mirror')}
                className="w-full sm:flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{t('btn_practice_mirror')}</span>
              </button>

              <button
                onClick={() => navigate('/prescription')}
                className="w-full sm:flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm flex items-center justify-center gap-2"
              >
                <span>{t('btn_view_prescription')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
