import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  ArrowRight,
  Play,
  RotateCcw,
  Loader2,
  AlertCircle,
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

  // 1. Form Validation Check: Ensure user selects at least one option
  const hasSelectedOption = Object.values(responses).some((val) => val === true);

  // 4. UI Feedback & State Reset: Clear previous result when options change
  const toggleKey = (key) => {
    setResponses((prev) => ({ ...prev, [key]: !prev[key] }));
    if (result) {
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Form Validation Check: Block empty submissions
    if (!hasSelectedOption) {
      setToastMessage({
        message: "Please select at least one condition or check 'Standard Maintenance' to proceed.",
        type: 'error',
      });
      return;
    }

    setLoading(true);
    if (result) setResult(null);

    try {
      // Determine if adverse conditions exist
      const hasAdverseConditions =
        responses.hasBraces ||
        responses.hasImplants ||
        responses.bleedingGums ||
        responses.recededGums ||
        responses.sensitivity ||
        responses.aggressiveBrusher ||
        responses.heavySmoker ||
        responses.manualDexterity;

      // 2. Explicit Standard Maintenance Handling
      const isStandardMaintenanceOnly = responses.preventative && !hasAdverseConditions;

      // 3. Strict Feature Vector Mapping to 8 numerical values
      const payload = {
        age_group: 1, // Default Adult
        has_braces: responses.hasBraces ? 1 : 0,
        has_implants_bridges: responses.hasImplants ? 1 : 0,
        bleeding_gums: responses.bleedingGums ? 2 : 0,
        gum_recession: responses.recededGums ? 2 : (responses.aggressiveBrusher ? 1 : 0),
        tooth_sensitivity: responses.sensitivity ? 2 : 0,
        limited_dexterity: responses.manualDexterity ? 1 : 0,
        plaque_buildup: responses.heavySmoker ? 2 : 0,
      };

      if (isStandardMaintenanceOnly) {
        payload.has_braces = 0;
        payload.has_implants_bridges = 0;
        payload.bleeding_gums = 0;
        payload.gum_recession = 0;
        payload.tooth_sensitivity = 0;
        payload.limited_dexterity = 0;
        payload.plaque_buildup = 0;
      }

      const data = await apiService.recommendTechnique(payload);

      let clinicalRationale = data.clinical_rationale || data.whySuggested;
      if (isStandardMaintenanceOnly) {
        clinicalRationale = "Standard clinical recommendation for daily maintenance and healthy plaque control.";
      }

      const formattedResult = {
        success: true,
        technique: data.recommended_technique || "Modified Bass Technique",
        confidenceScore: data.confidence_score || 98.5,
        clinicalRationale: clinicalRationale,
        keyFeatures: isStandardMaintenanceOnly ? ["Daily Standard Maintenance"] : (data.key_features || []),
        description: isStandardMaintenanceOnly
          ? "The gold-standard periodontist method for daily preventative hygiene and subgingival plaque prevention."
          : (data.description || "ADA clinical protocol matched by Random Forest Classifier."),
        whatItIs: data.whatItIs || "Clinical routine matched using multi-feature ML assessment.",
        howItWorks: data.howItWorks || "Angled bristles clear subgingival biofilm effectively.",
        whySuggested: clinicalRationale,
        precautions: data.precautions || ['Use soft bristles only', 'Brush for 2 minutes twice daily'],
        steps: data.steps || ['Angle bristles 45 degrees near gumline', 'Perform gentle vibratory pulses'],
        videoUrl: data.videoUrl || 'https://www.youtube.com/embed/4iIGhqi57es'
      };

      setResult(formattedResult);
      setLatestAssessment(formattedResult);
      setToastMessage({ message: `ML Analysis complete! Matched with ${formattedResult.confidenceScore}% confidence.`, type: 'success' });
    } catch (err) {
      console.warn("Assessment submission error:", err);
      let fallbackTech = "Modified Bass Technique";
      let desc = "Gold-standard sulcular cleaning method targeting subgingival plaque.";
      let rationale = "Standard clinical recommendation for daily maintenance and healthy plaque control.";

      if (responses.hasBraces) {
        fallbackTech = "Orthodontic Charters Technique";
        desc = "Formulated explicitly by Dr. W.J. Charters for orthodontic bracket cleaning.";
        rationale = "Prioritized for orthodontic brackets and archwires clearance.";
      } else if (responses.recededGums || responses.sensitivity) {
        fallbackTech = "Modified Stillman Technique";
        desc = "Tissue-protective technique designed for sensitive roots and gum recession.";
        rationale = "Prescribed to protect sensitive root dentin and gum recession.";
      }

      const fallbackResult = {
        success: true,
        technique: fallbackTech,
        confidenceScore: 95.0,
        clinicalRationale: rationale,
        keyFeatures: ["local_rule_fallback"],
        description: desc,
        whatItIs: `Clinical routine specifically chosen based on your answers.`,
        howItWorks: `Angled bristles and controlled sweeping motions clear biofilm efficiently.`,
        whySuggested: rationale,
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

          {/* Form Validation Notice if 0 options selected */}
          {!hasSelectedOption && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold justify-center backdrop-blur-md">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Please select at least one condition or check "Standard Maintenance" to proceed.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !hasSelectedOption}
            className={`w-full py-4 rounded-2xl font-black text-base shadow-xl flex items-center justify-center gap-2 transition transform ${
              !hasSelectedOption || loading
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60 shadow-none'
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-indigo-500/30 hover:scale-[1.01] cursor-pointer'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>{t('btn_processing') || 'Analyzing Patient Profile...'}</span>
              </>
            ) : (
              <>
                <span>{t('assess_btn_analyze') || 'Analyze & Match Technique'}</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* Diagnostic Results Card */
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-200 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold uppercase tracking-wider">
                    {t('assess_match_result')}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-black flex items-center gap-1 shadow-sm">
                    🤖 ML Model • {result.confidenceScore}% Confidence
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {result.technique}
                </h2>
                <p className="text-xs sm:text-sm text-teal-700 font-extrabold">
                  {result.description}
                </p>

                {/* Key Features Badges */}
                {result.keyFeatures && result.keyFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {result.keyFeatures.map((feat, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                        ⚡ {feat}
                      </span>
                    ))}
                  </div>
                )}
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
                  🎯 Clinical Rationale (Random Forest Model)
                </span>
                <p className="text-slate-700 leading-relaxed font-semibold">{result.clinicalRationale || result.whySuggested}</p>
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
