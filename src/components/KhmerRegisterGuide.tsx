import React from 'react';
import { KHMER_REGISTERS } from '../data/khmerResources';
import { useLanguage } from '../contexts/LanguageContext';
import { Heart, Sparkles } from 'lucide-react';

export const KhmerRegisterGuide: React.FC = () => {
  const { isKm, tr } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
          <span>{tr('LINGUISTIC REGISTERS & POST-TRAINING ALIGNMENT', 'កម្រិតភាសា និងការតម្រឹមក្រោយការបង្វឹក')}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{tr('SFT & DPO GUIDELINES', 'គោលការណ៍ណែនាំ SFT & DPO')}</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl font-bold text-white tracking-tight ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
          {tr('Khmer Honorific Registers & Cultural Alignment', 'កម្រិតគោរមងារភាសាខ្មែរ និងការតម្រឹមវប្បធម៌')}
        </h2>
        <p className={`text-sm text-slate-300 max-w-3xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
          {tr(
            'Unlike English, Khmer possesses deeply codified societal registers. A model that uses colloquial verbs when discussing Buddhist monks or the monarchy is considered profoundly uneducated and offensive in Cambodia.',
            'ខុសពីភាសាអង់គ្លេស ភាសាខ្មែរមានកម្រិតភាសាសង្គមយ៉ាងច្បាស់លាស់។ ម៉ូដែលដែលប្រើកិរិយាសព្ទសាមញ្ញពេលនិយាយអំពីព្រះសង្ឃ ឬព្រះមហាក្សត្រ ត្រូវបានចាត់ទុកថាមិនសមរម្យ និងខ្វះសីលធម៌នៅកម្ពុជា។'
          )}
        </p>
      </div>

      {/* The 4 Register Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {KHMER_REGISTERS.map((reg, idx) => (
          <div key={idx} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-amber-400 uppercase">
                {tr(`REGISTER 0${idx + 1}`, `កម្រិតភាសា ០${idx + 1}`)}
              </span>
              <h3 className="text-base font-bold text-white font-khmer">
                {isKm ? reg.levelKm : reg.level}
              </h3>
              <p className={`text-xs text-slate-400 ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
                {isKm ? reg.usageKm : reg.usage}
              </p>
            </div>

            {/* Pronouns and Key Verbs Matrix */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60 gap-2">
                <span className={`text-slate-500 font-mono ${isKm ? 'font-khmer' : ''}`}>
                  {tr('First Person (I/Me):', 'សព្វនាមបុរិសៈទី១ (ខ្ញុំ)៖')}
                </span>
                <span className="font-khmer text-amber-300 text-right">
                  {isKm ? reg.firstPersonKm : reg.firstPerson}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 gap-2">
                <span className={`text-slate-500 font-mono ${isKm ? 'font-khmer' : ''}`}>
                  {tr('Second Person (You):', 'សព្វនាមបុរិសៈទី២ (អ្នក)៖')}
                </span>
                <span className="font-khmer text-cyan-300 text-right">{reg.secondPerson}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 gap-2">
                <span className={`text-slate-500 font-mono ${isKm ? 'font-khmer' : ''}`}>
                  {tr('Verb "To Eat":', 'កិរិយាសព្ទ «បរិភោគ»៖')}
                </span>
                <span className="font-khmer text-emerald-300 font-bold text-right">
                  {isKm ? reg.eatVerbKm : reg.eatVerb}
                </span>
              </div>
              <div className="flex justify-between py-1 gap-2">
                <span className={`text-slate-500 font-mono ${isKm ? 'font-khmer' : ''}`}>
                  {tr('Verb "To Sleep":', 'កិរិយាសព្ទ «ដេក»៖')}
                </span>
                <span className="font-khmer text-violet-300 font-bold text-right">
                  {isKm ? reg.sleepVerbKm : reg.sleepVerb}
                </span>
              </div>
            </div>

            <div className={`text-[11px] text-slate-300 flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{isKm ? reg.importanceKm : reg.importance}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Polite Particles Guide */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <h3 className={`text-base font-bold text-white flex items-center gap-2 ${isKm ? 'font-khmer' : ''}`}>
          <Heart className="w-4 h-4 text-rose-400" />
          <span>{tr('Politeness Particles & Gender Handling in SFT', 'ភាគល្អិតគួរសម និងការគ្រប់គ្រងភេទក្នុង SFT')}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
            <div className="font-bold text-amber-300 font-khmer text-sm">
              {tr('ភាគល្អិតគួរសម៖ បាទ (Baat) vs ចាស (Chaa)', 'ភាគល្អិតគួរសម៖ បាទ ទល់នឹង ចាស')}
            </div>
            <p className={`leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
              {tr(
                'In Cambodian culture, affirmative responses and politeness suffixes are strictly gender-coded:',
                'នៅក្នុងវប្បធម៌ខ្មែរ ពាក្យឆ្លើយតបវិជ្ជមាន និងភាគល្អិតគួរសមត្រូវបានបែងចែកតាមភេទយ៉ាងច្បាស់លាស់៖'
              )}
            </p>
            <ul className={`list-disc pl-4 space-y-1 text-slate-400 ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
              <li>
                <strong className="text-white">បាទ (Baat):</strong>{' '}
                {tr(
                  'Spoken by males. Standard polite affirmative or greeting prefix.',
                  'ប្រើដោយបុរស។ ពាក្យឆ្លើយតបគួរសមស្តង់ដារ ឬពាក្យចាប់ផ្តើមការសន្ទនា។'
                )}
              </li>
              <li>
                <strong className="text-white">ចាស (Chaa):</strong>{' '}
                {tr('Spoken by females.', 'ប្រើដោយស្ត្រី។')}
              </li>
              <li>
                <strong className="text-amber-300">{tr('SFT Recommendation:', 'អនុសាសន៍ SFT៖')}</strong>{' '}
                {isKm ? (
                  <>
                    ជាទូទៅ សូមកំណត់ System Prompt ឱ្យប្រើឃ្លាគួរសមអព្យាក្រឹតសកល (ឧ. <span className="font-khmer text-white">«សូមស្វាគមន៍»</span>, <span className="font-khmer text-white">«អរគុណ»</span>, <span className="font-khmer text-white">«រីករាយជួយបកស្រាយ»</span>) លើកលែងតែអ្នកប្រើប្រាស់បញ្ជាក់ភេទរបស់ជំនួយការ AI ច្បាស់លាស់។
                  </>
                ) : (
                  <>
                    By default, configure system prompts to use universal neutral polite phrasing (e.g., <span className="font-khmer text-white">«សូមស្វាគមន៍»</span>, <span className="font-khmer text-white">«អរគុណ»</span>, <span className="font-khmer text-white">«រីករាយជួយបកស្រាយ»</span>) unless the user persona explicitly specifies male or female persona.
                  </>
                )}
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
            <div className="font-bold text-cyan-300 font-khmer text-sm">
              {tr('Cambodian Cultural Entities Localization', 'ការធ្វើមូលដ្ឋានីយកម្មតួអង្គ និងបរិបទវប្បធម៌កម្ពុជា')}
            </div>
            <p className={`leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
              {tr(
                'When adapting English instruction datasets (like UltraChat or GSM8K) into Khmer:',
                'នៅពេលសម្របទិន្នន័យណែនាំជាភាសាអង់គ្លេស (ដូចជា UltraChat ឬ GSM8K) មកជាភាសាខ្មែរ៖'
              )}
            </p>
            <ul className={`list-disc pl-4 space-y-1 text-slate-400 ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
              <li>
                <strong className="text-white">{tr('Currency:', 'រូបិយប័ណ្ណ៖')}</strong>{' '}
                {isKm ? (
                  <>
                    បម្លែងប្រាក់ដុល្លារ ($) ទៅជាប្រាក់រៀលកម្ពុជា (<span className="font-khmer text-amber-300">៛</span>) ដោយប្រើក្រដាសប្រាក់ខ្មែរស្តង់ដារ (១,០០០៛, ៥,០០០៛, ១០,០០០៛)។
                  </>
                ) : (
                  <>
                    Translate Dollars ($) to Cambodian Riel (<span className="font-khmer text-amber-300">៛</span>) using standard Cambodian denominations (1,000៛, 5,000៛, 10,000៛).
                  </>
                )}
              </li>
              <li>
                <strong className="text-white">{tr('Names:', 'ឈ្មោះមនុស្ស៖')}</strong>{' '}
                {tr(
                  'Replace Alice & Bob with native names (សុខា, បុប្ផា, រិទ្ធី, ចាន់ណា).',
                  'ជំនួសឈ្មោះ Alice និង Bob ដោយឈ្មោះខ្មែរដើម (សុខា, បុប្ផា, រិទ្ធី, ចាន់ណា)។'
                )}
              </li>
              <li>
                <strong className="text-white">{tr('Holidays:', 'ពិធីបុណ្យជាតិ៖')}</strong>{' '}
                {tr(
                  'Anchor seasonal examples to Pchum Ben (បុណ្យភ្ជុំបិណ្ឌ), Khmer New Year (បុណ្យចូលឆ្នាំខ្មែរ), and the Water Festival (បុណ្យអុំទូក).',
                  'ភ្ជាប់ឧទាហរណ៍តាមរដូវកាលទៅនឹងបុណ្យភ្ជុំបិណ្ឌ បុណ្យចូលឆ្នាំខ្មែរ និងព្រះរាជពិធីបុណ្យអុំទូក។'
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

