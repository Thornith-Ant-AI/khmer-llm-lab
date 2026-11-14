import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Flame, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export interface RegisterHeatmapData {
  registerId: string;
  name: string;
  nameKm: string;
  khmerName: string;
  description: string;
  descriptionKm: string;
  sampleText: string;
  scores: {
    vocabSize: number;
    vocabLabel: string;
    compressionRatio: number; // e.g. 4.8x
    fertilityRate: number; // tokens per word
    embeddingParamsM: number; // Millions of parameters
    embeddingVramMB: number; // MB in BF16
    verdict: 'under_segmented' | 'acceptable' | 'optimal' | 'diminishing_returns';
  }[];
}

export const REGISTER_HEATMAP_DATA: RegisterHeatmapData[] = [
  {
    registerId: 'royal',
    name: 'Royal Register (រាជសព្ទ)',
    nameKm: 'រាជសព្ទ (ព្រះមហាក្សត្រ)',
    khmerName: 'រាជសព្ទ ព្រះមហាក្សត្រ',
    description: 'Ancient Pali-Sanskrit polysyllabic royal compounds, ornate prefixes, and ceremonial titles.',
    descriptionKm: 'ពាក្យផ្សំបាលី-សំស្ក្រឹតបុរាណពហុព្យាង្គ បុព្វបទក្បោះក្បាយ និងគោរមងារព្រះមហាក្សត្រ។',
    sampleText: 'ព្រះករុណាជាអម្ចាស់ជីវិតលើត្បូង ព្រះបាទសម្តេចព្រះបរមនាថ នរោត្តម សីហមុនី ទ្រង់សព្វព្រះរាជហឫទ័យប្រោសព្រះរាជទាននូវព្រះរាជសារលិខិតអបអរសាទរ។',
    scores: [
      { vocabSize: 8000, vocabLabel: '8k', compressionRatio: 2.1, fertilityRate: 3.4, embeddingParamsM: 16.4, embeddingVramMB: 32.8, verdict: 'under_segmented' },
      { vocabSize: 16000, vocabLabel: '16k', compressionRatio: 3.1, fertilityRate: 2.3, embeddingParamsM: 32.8, embeddingVramMB: 65.5, verdict: 'acceptable' },
      { vocabSize: 32000, vocabLabel: '32k', compressionRatio: 4.4, fertilityRate: 1.6, embeddingParamsM: 65.5, embeddingVramMB: 131.1, verdict: 'optimal' },
      { vocabSize: 48000, vocabLabel: '48k', compressionRatio: 4.9, fertilityRate: 1.4, embeddingParamsM: 98.3, embeddingVramMB: 196.6, verdict: 'optimal' },
      { vocabSize: 64000, vocabLabel: '64k', compressionRatio: 5.2, fertilityRate: 1.3, embeddingParamsM: 131.1, embeddingVramMB: 262.1, verdict: 'diminishing_returns' },
      { vocabSize: 96000, vocabLabel: '96k', compressionRatio: 5.3, fertilityRate: 1.3, embeddingParamsM: 196.6, embeddingVramMB: 393.2, verdict: 'diminishing_returns' }
    ]
  },
  {
    registerId: 'monastic',
    name: 'Buddhist Monastic (សង្ឃសព្ទ)',
    nameKm: 'សង្ឃសព្ទ (ព្រះពុទ្ធសាសនា)',
    khmerName: 'សង្ឃសព្ទ និងព្រះត្រៃបិដក',
    description: 'Tripitaka exegesis, Pali moral poetry (Chbap), and monastic conversational honorifics.',
    descriptionKm: 'អធិប្បាយព្រះត្រៃបិដក កំណាព្យច្បាប់បុរាណ និងសំនួនវោហារសង្ឃសព្ទ។',
    sampleText: 'អាត្មាភាពសូមចម្រើនពរដល់ញាតិញោមពុទ្ធបរិស័ទជិតឆ្ងាយ ដែលបានចូលរួមបំពេញកុសលកសាងមហាវិហារ និងទ្រទ្រង់វិស័យព្រះពុទ្ធសាសនា។',
    scores: [
      { vocabSize: 8000, vocabLabel: '8k', compressionRatio: 2.2, fertilityRate: 3.3, embeddingParamsM: 16.4, embeddingVramMB: 32.8, verdict: 'under_segmented' },
      { vocabSize: 16000, vocabLabel: '16k', compressionRatio: 3.3, fertilityRate: 2.2, embeddingParamsM: 32.8, embeddingVramMB: 65.5, verdict: 'acceptable' },
      { vocabSize: 32000, vocabLabel: '32k', compressionRatio: 4.6, fertilityRate: 1.5, embeddingParamsM: 65.5, embeddingVramMB: 131.1, verdict: 'optimal' },
      { vocabSize: 48000, vocabLabel: '48k', compressionRatio: 5.1, fertilityRate: 1.4, embeddingParamsM: 98.3, embeddingVramMB: 196.6, verdict: 'optimal' },
      { vocabSize: 64000, vocabLabel: '64k', compressionRatio: 5.3, fertilityRate: 1.3, embeddingParamsM: 131.1, embeddingVramMB: 262.1, verdict: 'diminishing_returns' },
      { vocabSize: 96000, vocabLabel: '96k', compressionRatio: 5.4, fertilityRate: 1.3, embeddingParamsM: 196.6, embeddingVramMB: 393.2, verdict: 'diminishing_returns' }
    ]
  },
  {
    registerId: 'legal',
    name: 'Legal & Administrative (រដ្ឋបាល/ច្បាប់)',
    nameKm: 'រដ្ឋបាល និងច្បាប់ (រាជកិច្ច)',
    khmerName: 'រាជកិច្ច ក្រមរដ្ឋប្បវេណី និងអនុក្រឹត្យ',
    description: 'Official statutory texts, civil/criminal codes, and ministerial decrees with repetitive formal phrases.',
    descriptionKm: 'អត្ថបទច្បាប់ផ្លូវការ ក្រមរដ្ឋប្បវេណី និងអនុក្រឹត្យដែលមានឃ្លាផ្លូវការជាក់លាក់។',
    sampleText: 'រាជរដ្ឋាភិបាលកម្ពុជាបានចេញអនុក្រឹត្យស្តីពីការរៀបចំនិងការប្រព្រឹត្តទៅនៃក្រសួងសេដ្ឋកិច្ចនិងហិរញ្ញវត្ថុ ស្របតាមរដ្ឋធម្មនុញ្ញជាធរមាន។',
    scores: [
      { vocabSize: 8000, vocabLabel: '8k', compressionRatio: 2.5, fertilityRate: 3.0, embeddingParamsM: 16.4, embeddingVramMB: 32.8, verdict: 'under_segmented' },
      { vocabSize: 16000, vocabLabel: '16k', compressionRatio: 3.6, fertilityRate: 2.0, embeddingParamsM: 32.8, embeddingVramMB: 65.5, verdict: 'acceptable' },
      { vocabSize: 32000, vocabLabel: '32k', compressionRatio: 4.8, fertilityRate: 1.5, embeddingParamsM: 65.5, embeddingVramMB: 131.1, verdict: 'optimal' },
      { vocabSize: 48000, vocabLabel: '48k', compressionRatio: 5.2, fertilityRate: 1.4, embeddingParamsM: 98.3, embeddingVramMB: 196.6, verdict: 'optimal' },
      { vocabSize: 64000, vocabLabel: '64k', compressionRatio: 5.4, fertilityRate: 1.3, embeddingParamsM: 131.1, embeddingVramMB: 262.1, verdict: 'diminishing_returns' },
      { vocabSize: 96000, vocabLabel: '96k', compressionRatio: 5.5, fertilityRate: 1.3, embeddingParamsM: 196.6, embeddingVramMB: 393.2, verdict: 'diminishing_returns' }
    ]
  },
  {
    registerId: 'technical',
    name: 'Technical & Academic (វិទ្យាសាស្ត្រ/STEM)',
    nameKm: 'វិទ្យាសាស្ត្រ និងបច្ចេកទេស (STEM)',
    khmerName: 'បច្ចេកវិទ្យា វិស្វកម្ម និងវេជ្ជសាស្ត្រ',
    description: 'Transliterated foreign technical loans, scientific compound nouns, and university theses vocabulary.',
    descriptionKm: 'ពាក្យកម្ចីបច្ចេកទេស នាមផ្សំវិទ្យាសាស្ត្រ និងវាក្យសព្ទនិក្ខេបបទសាកលវិទ្យាល័យ។',
    sampleText: 'ការបង្វឹកបណ្តាញណឺរ៉ូនសិប្បនិម្មិតខ្នាតធំទាមទារនូវក្បួនដោះស្រាយបង្កើនល្បឿន និងអង្គចងចាំដែលមានកម្រិតបញ្ជូនខ្ពស់។',
    scores: [
      { vocabSize: 8000, vocabLabel: '8k', compressionRatio: 2.3, fertilityRate: 3.2, embeddingParamsM: 16.4, embeddingVramMB: 32.8, verdict: 'under_segmented' },
      { vocabSize: 16000, vocabLabel: '16k', compressionRatio: 3.2, fertilityRate: 2.2, embeddingParamsM: 32.8, embeddingVramMB: 65.5, verdict: 'acceptable' },
      { vocabSize: 32000, vocabLabel: '32k', compressionRatio: 4.3, fertilityRate: 1.7, embeddingParamsM: 65.5, embeddingVramMB: 131.1, verdict: 'optimal' },
      { vocabSize: 48000, vocabLabel: '48k', compressionRatio: 4.7, fertilityRate: 1.5, embeddingParamsM: 98.3, embeddingVramMB: 196.6, verdict: 'optimal' },
      { vocabSize: 64000, vocabLabel: '64k', compressionRatio: 5.0, fertilityRate: 1.4, embeddingParamsM: 131.1, embeddingVramMB: 262.1, verdict: 'diminishing_returns' },
      { vocabSize: 96000, vocabLabel: '96k', compressionRatio: 5.1, fertilityRate: 1.4, embeddingParamsM: 196.6, embeddingVramMB: 393.2, verdict: 'diminishing_returns' }
    ]
  },
  {
    registerId: 'journalistic',
    name: 'Standard Journalistic (សារព័ត៌មាន)',
    nameKm: 'សារព័ត៌មានស្តង់ដារ',
    khmerName: 'សារព័ត៌មានជាតិ និងអន្តរជាតិ',
    description: 'Contemporary broadcast news, geopolitical reporting, and modern public discourse prose.',
    descriptionKm: 'ព័ត៌មានផ្សព្វផ្សាយសហសម័យ របាយការណ៍ភូមិសាស្ត្រនយោបាយ និងសំណេរសាធារណៈ។',
    sampleText: 'សន្និសីទកំពូលអាស៊ានបានបិទបញ្ចប់ដោយជោគជ័យ ជាមួយនឹងការអនុម័តសេចក្តីថ្លែងការណ៍រួមស្តីពីកិច្ចសហប្រតិបត្តិការសេដ្ឋកិច្ចតំបន់។',
    scores: [
      { vocabSize: 8000, vocabLabel: '8k', compressionRatio: 2.7, fertilityRate: 2.7, embeddingParamsM: 16.4, embeddingVramMB: 32.8, verdict: 'under_segmented' },
      { vocabSize: 16000, vocabLabel: '16k', compressionRatio: 3.8, fertilityRate: 1.9, embeddingParamsM: 32.8, embeddingVramMB: 65.5, verdict: 'acceptable' },
      { vocabSize: 32000, vocabLabel: '32k', compressionRatio: 4.9, fertilityRate: 1.5, embeddingParamsM: 65.5, embeddingVramMB: 131.1, verdict: 'optimal' },
      { vocabSize: 48000, vocabLabel: '48k', compressionRatio: 5.3, fertilityRate: 1.4, embeddingParamsM: 98.3, embeddingVramMB: 196.6, verdict: 'optimal' },
      { vocabSize: 64000, vocabLabel: '64k', compressionRatio: 5.5, fertilityRate: 1.3, embeddingParamsM: 131.1, embeddingVramMB: 262.1, verdict: 'diminishing_returns' },
      { vocabSize: 96000, vocabLabel: '96k', compressionRatio: 5.6, fertilityRate: 1.3, embeddingParamsM: 196.6, embeddingVramMB: 393.2, verdict: 'diminishing_returns' }
    ]
  },
  {
    registerId: 'colloquial',
    name: 'Colloquial & Dialogue (សាមញ្ញ/សន្ទនា)',
    nameKm: 'ភាសាសាមញ្ញ និងសន្ទនា',
    khmerName: 'ភាសានិយាយប្រចាំថ្ងៃ និងសន្ទនា',
    description: 'Everyday dialogue, short monosyllabic words, polite conversational particles (បាទ/ចាស), and social slang.',
    descriptionKm: 'ការសន្ទនាប្រចាំថ្ងៃ ពាក្យឯកព្យាង្គខ្លីៗ ពាក្យគួរសម (បាទ/ចាស) និងភាសាសង្គមទូទៅ។',
    sampleText: 'តើបងឯងបានញ៉ាំបាយហើយឬនៅ? ថ្ងៃនេះការងារច្រើនណាស់ ចាំល្ងាចជួបគ្នានៅហាងកាហ្វេ។',
    scores: [
      { vocabSize: 8000, vocabLabel: '8k', compressionRatio: 3.0, fertilityRate: 2.4, embeddingParamsM: 16.4, embeddingVramMB: 32.8, verdict: 'acceptable' },
      { vocabSize: 16000, vocabLabel: '16k', compressionRatio: 4.0, fertilityRate: 1.8, embeddingParamsM: 32.8, embeddingVramMB: 65.5, verdict: 'optimal' },
      { vocabSize: 32000, vocabLabel: '32k', compressionRatio: 4.7, fertilityRate: 1.5, embeddingParamsM: 65.5, embeddingVramMB: 131.1, verdict: 'optimal' },
      { vocabSize: 48000, vocabLabel: '48k', compressionRatio: 5.0, fertilityRate: 1.4, embeddingParamsM: 98.3, embeddingVramMB: 196.6, verdict: 'optimal' },
      { vocabSize: 64000, vocabLabel: '64k', compressionRatio: 5.1, fertilityRate: 1.4, embeddingParamsM: 131.1, embeddingVramMB: 262.1, verdict: 'diminishing_returns' },
      { vocabSize: 96000, vocabLabel: '96k', compressionRatio: 5.2, fertilityRate: 1.4, embeddingParamsM: 196.6, embeddingVramMB: 393.2, verdict: 'diminishing_returns' }
    ]
  }
];

interface RegisterHeatmapChartProps {
  onSelectSampleText: (text: string) => void;
}

export const RegisterHeatmapChart: React.FC<RegisterHeatmapChartProps> = ({ onSelectSampleText }) => {
  const { language, isKm, tr } = useLanguage();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedVocabSize, setSelectedVocabSize] = useState<number>(32000);
  const [hoveredCell, setHoveredCell] = useState<{
    register: RegisterHeatmapData;
    score: RegisterHeatmapData['scores'][0];
  } | null>(null);

  const vocabLabels = ['8k', '16k', '32k', '48k', '64k', '96k'];

  // D3 Heatmap Rendering
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 690;
    const height = 310;
    const margin = { top: 35, right: 25, bottom: 35, left: 175 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(vocabLabels)
      .range([0, innerWidth])
      .padding(0.06);

    const y = d3
      .scaleBand()
      .domain(REGISTER_HEATMAP_DATA.map(d => (isKm ? d.nameKm : d.name)))
      .range([0, innerHeight])
      .padding(0.08);

    // Color Scale: Deep Indigo/Slate (2.0x) -> Warm Amber (3.5x) -> Vibrant Emerald (4.8x) -> Brilliant Cyan (5.6x)
    const colorScale = d3
      .scaleLinear<string>()
      .domain([2.0, 3.2, 4.4, 5.6])
      .range(['#1e1b4b', '#b45309', '#059669', '#06b6d4'])
      .interpolate(d3.interpolateRgb);

    // Render cells
    REGISTER_HEATMAP_DATA.forEach((reg) => {
      const regLabel = isKm ? reg.nameKm : reg.name;
      reg.scores.forEach((s) => {
        const isColumnActive = s.vocabSize === selectedVocabSize;
        const cellX = x(s.vocabLabel) || 0;
        const cellY = y(regLabel) || 0;
        const cellW = x.bandwidth();
        const cellH = y.bandwidth();

        const cellG = g
          .append('g')
          .attr('class', 'heatmap-cell')
          .style('cursor', 'pointer')
          .on('mouseenter', () => {
            setHoveredCell({ register: reg, score: s });
          })
          .on('click', () => {
            setSelectedVocabSize(s.vocabSize);
            onSelectSampleText(reg.sampleText);
          });

        // Rect
        cellG
          .append('rect')
          .attr('x', cellX)
          .attr('y', cellY)
          .attr('width', cellW)
          .attr('height', cellH)
          .attr('rx', 5)
          .attr('fill', colorScale(s.compressionRatio))
          .attr('stroke', isColumnActive ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)')
          .attr('stroke-width', isColumnActive ? 2 : 1)
          .attr('opacity', isColumnActive ? 1 : 0.88);

        // Value text
        cellG
          .append('text')
          .attr('x', cellX + cellW / 2)
          .attr('y', cellY + cellH / 2 + 4)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .attr('font-family', 'JetBrains Mono, monospace')
          .text(`${s.compressionRatio.toFixed(1)}×`);
      });
    });

    // Top X-Axis Header (Vocab Size)
    const xAxis = g.append('g').call(d3.axisTop(x).tickSize(0));
    xAxis.select('.domain').remove();
    xAxis
      .selectAll('.tick text')
      .attr('fill', d => (d === `${selectedVocabSize / 1000}k` ? '#f59e0b' : '#cbd5e1'))
      .attr('font-size', '11px')
      .attr('font-weight', d => (d === `${selectedVocabSize / 1000}k` ? 'bold' : 'normal'))
      .attr('font-family', 'JetBrains Mono, monospace');

    // Left Y-Axis (Linguistic Register)
    const yAxis = g.append('g').call(d3.axisLeft(y).tickSize(0));
    yAxis.select('.domain').remove();
    yAxis
      .selectAll('.tick text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'Kantumruy Pro, Plus Jakarta Sans, sans-serif')
      .attr('text-anchor', 'end')
      .attr('dx', -8);

    // Label on top
    svg
      .append('text')
      .attr('x', width / 2 + 65)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', isKm ? 'Kantumruy Pro, JetBrains Mono, sans-serif' : 'JetBrains Mono, monospace')
      .text(isKm ? 'ទំហំវាក្យសព្ទគោលដៅ TOKENIZER (MERGES)' : 'TARGET TOKENIZER VOCABULARY SIZE (MERGES)');
  }, [selectedVocabSize, language, isKm, onSelectSampleText]);

  // Active column summary metrics
  const activeColScores = REGISTER_HEATMAP_DATA.map(r =>
    r.scores.find(s => s.vocabSize === selectedVocabSize)!
  );
  const avgCompression = Number(
    (activeColScores.reduce((a, b) => a + b.compressionRatio, 0) / activeColScores.length).toFixed(2)
  );
  const avgFertility = Number(
    (activeColScores.reduce((a, b) => a + b.fertilityRate, 0) / activeColScores.length).toFixed(2)
  );
  const embeddingVram = activeColScores[0]?.embeddingVramMB || 131;

  const verdictLabel = (v: RegisterHeatmapData['scores'][0]['verdict']) => {
    switch (v) {
      case 'optimal':
        return tr('OPTIMAL', 'ប្រសើរបំផុត');
      case 'acceptable':
        return tr('ACCEPTABLE', 'ទទួលយកបាន');
      case 'under_segmented':
        return tr('UNDER SEGMENTED', 'បំបែកមិនគ្រប់គ្រាន់');
      case 'diminishing_returns':
        return tr('DIMINISHING RETURNS', 'ចំណេញថយចុះ');
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className={`text-base font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
              {tr('D3 Linguistic Register Compression Heatmap', 'ផែនទីកម្ដៅការបង្រួមកម្រិតភាសាខ្មែរ (D3)')}
            </h3>
          </div>
          <p className={`text-xs text-slate-400 ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
            {isKm ? (
              <>
                ប្រៀបធៀបប្រសិទ្ធភាពការបង្រួមថូខិន (<strong className="text-white">បៃ Llama-3 ÷ ថូខិន Khmer SPM</strong>) ឆ្លងកាត់កម្រិតភាសាក្នុងសង្គម ដើម្បីកំណត់ទំហំវាក្យសព្ទសមស្របបំផុត។
              </>
            ) : (
              <>
                Compare token compression efficiency (<strong className="text-white">Llama-3 Bytes ÷ Khmer SPM Tokens</strong>) across societal registers to identify the optimal vocabulary size.
              </>
            )}
          </p>
        </div>

        {/* Vocab Size Quick Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <span className="text-[11px] font-mono text-slate-500 px-1.5">{tr('Vocab:', 'វាក្យសព្ទ៖')}</span>
          {[8000, 16000, 32000, 48000, 64000, 96000].map(size => {
            const label = `${size / 1000}k`;
            const isActive = selectedVocabSize === size;
            return (
              <button
                key={size}
                onClick={() => setSelectedVocabSize(size)}
                className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Heatmap D3 Visual Stage */}
      <div className="w-full overflow-x-auto rounded-xl bg-slate-950/80 border border-slate-800/80 p-3 flex justify-center">
        <svg
          ref={svgRef}
          viewBox="0 0 690 310"
          className="w-full max-w-2xl h-auto"
          style={{ minWidth: '540px' }}
        />
      </div>

      {/* Color Scale Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-4 pt-1">
        <div className="flex items-center gap-2">
          <span>{tr('Compression Scale:', 'មាត្រដ្ឋានបង្រួម៖')}</span>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-3 rounded bg-[#1e1b4b] inline-block" />
            <span className="text-[11px]">2.0×</span>
            <span className="w-4 h-3 rounded bg-[#b45309] inline-block" />
            <span className="text-[11px]">3.5×</span>
            <span className="w-4 h-3 rounded bg-[#059669] inline-block" />
            <span className="text-[11px]">4.5×</span>
            <span className="w-4 h-3 rounded bg-[#06b6d4] inline-block" />
            <span className="text-[11px]">5.5×+</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full border border-amber-400 bg-amber-400/20" />
          <span>
            {tr('Active Column:', 'ជួរឈរសកម្ម៖')}{' '}
            <strong className="text-amber-400 font-bold">
              {selectedVocabSize / 1000}k {tr('Vocabulary', 'វាក្យសព្ទ')}
            </strong>
          </span>
        </div>
      </div>

      {/* Hover or Selected Callout Inspector */}
      {hoveredCell ? (
        <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm font-khmer">
                {isKm ? hoveredCell.register.nameKm : hoveredCell.register.name}
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-amber-400 font-semibold">
                {hoveredCell.score.vocabLabel} {tr('Vocab', 'វាក្យសព្ទ')}
              </span>
            </div>
            <span className="font-mono text-emerald-400 font-bold text-sm">
              {hoveredCell.score.compressionRatio.toFixed(1)}× {tr('Compression', 'ការបង្រួម')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-slate-300 font-mono text-[11px]">
            <div>
              <span className="text-slate-500 block">{tr('FERTILITY RATE:', 'អត្រាបំបែក៖')}</span>
              <span className="text-white font-bold">
                {hoveredCell.score.fertilityRate} {tr('tokens/word', 'ថូខិន/ពាក្យ')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">{tr('EMBEDDING VRAM (BF16):', 'អង្គចងចាំ VRAM (BF16)៖')}</span>
              <span className="text-white font-bold">{hoveredCell.score.embeddingVramMB} MB</span>
            </div>
            <div>
              <span className="text-slate-500 block">{tr('EMBEDDING PARAMS:', 'ប៉ារ៉ាម៉ែត្រ EMBEDDING៖')}</span>
              <span className="text-white font-bold">{hoveredCell.score.embeddingParamsM}M</span>
            </div>
            <div>
              <span className="text-slate-500 block">{tr('STATUS:', 'ស្ថានភាព៖')}</span>
              <span className={`font-bold uppercase ${
                hoveredCell.score.verdict === 'optimal'
                  ? 'text-emerald-400'
                  : hoveredCell.score.verdict === 'acceptable'
                  ? 'text-cyan-400'
                  : hoveredCell.score.verdict === 'under_segmented'
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`}>
                {verdictLabel(hoveredCell.score.verdict)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 gap-3">
            <p className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
              {isKm ? hoveredCell.register.descriptionKm : hoveredCell.register.description}
            </p>
            <button
              onClick={() => onSelectSampleText(hoveredCell.register.sampleText)}
              className="flex items-center gap-1 text-[11px] font-mono text-amber-400 hover:underline shrink-0"
            >
              <span>{tr('Load sample text into lab', 'ផ្ទុកអត្ថបទគំរូចូលមន្ទីរពិសោធន៍')}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        /* Default Active Vocab Column Summary */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[11px] font-mono text-slate-400">
              {tr('AVG COMPRESSION (ALL REGISTERS)', 'ការបង្រួមមធ្យម (គ្រប់កម្រិតភាសា)')}
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {avgCompression}×
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {tr(
                `Tokens compressed by ${Math.round((1 - 1 / avgCompression) * 100)}%`,
                `បង្រួមថូខិនបាន ${Math.round((1 - 1 / avgCompression) * 100)}%`
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[11px] font-mono text-slate-400">
              {tr('AVG FERTILITY RATE', 'អត្រាបំបែកមធ្យម')}
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {avgFertility}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {tr('Tokens per Khmer word (Llama is 6.5+)', 'ថូខិនក្នុងមួយពាក្យខ្មែរ (Llama គឺ 6.5+)')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[11px] font-mono text-slate-400">
              {tr('EMBEDDING TABLE VRAM (BF16)', 'VRAM តារាង EMBEDDING (BF16)')}
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
              {embeddingVram} MB
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {tr(
                `${(selectedVocabSize * 2048 / 1e6).toFixed(1)}M parameters at 2048 hidden dim`,
                `${(selectedVocabSize * 2048 / 1e6).toFixed(1)}M ប៉ារ៉ាម៉ែត្រ នៅវិមាត្រ 2048`
              )}
            </div>
          </div>
        </div>
      )}

      {/* Architectural Recommendation Box */}
      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2 text-xs">
        <div className={`flex items-center gap-2 text-amber-400 font-semibold ${isKm ? 'font-khmer' : ''}`}>
          <Sparkles className="w-4 h-4" />
          <span>{tr('Optimal Vocabulary Recommendation for Khmer LLM Pretraining', 'អនុសាសន៍ទំហំវាក្យសព្ទប្រសើរបំផុតសម្រាប់ការបង្វឹកដំបូង LLM ខ្មែរ')}</span>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300 leading-relaxed pt-1 ${isKm ? 'font-khmer' : ''}`}>
          <div>
            <strong className="text-white block mb-1">{tr('Under-Segmented (< 16k):', 'បំបែកមិនគ្រប់គ្រាន់ (< 16k)៖')}</strong>
            <p className="text-[11px] text-slate-400">
              {tr(
                'Lacks coverage for formal Pali-Khmer legal and royal compounds. Tokens are fragmented into single syllables, degrading reasoning.',
                'ខ្វះការគ្របដណ្តប់ពាក្យផ្សំបាលី-ខ្មែរផ្នែកច្បាប់ និងរាជសព្ទ។ ថូខិនត្រូវបានកាត់ផ្តាច់ជាព្យាង្គទោល ដែលធ្វើឱ្យការគិតហេតុផលចុះខ្សោយ។'
              )}
            </p>
          </div>

          <div>
            <strong className="text-emerald-400 block mb-1">{tr('Sweet Spot (32,000 – 48,000):', 'កម្រិតសមស្របបំផុត (32,000 – 48,000)៖')}</strong>
            <p className="text-[11px] text-slate-400">
              {tr(
                'Captures complete morphological prefixes, roots, and common administrative words while keeping embedding table VRAM under 150MB.',
                'ចាប់យកបុព្វបទ ឫសពាក្យ និងពាក្យរដ្ឋបាលញឹកញាប់បានពេញលេញ ខណៈរក្សា VRAM តារាង Embedding ក្រោម 150MB។'
              )}
            </p>
          </div>

          <div>
            <strong className="text-rose-400 block mb-1">{tr('Diminishing Returns (> 64k):', 'ចំណេញថយចុះ (> 64k)៖')}</strong>
            <p className="text-[11px] text-slate-400">
              {tr(
                'Only yields a +0.2× compression gain while inflating parameters and creating rare tokens that suffer from severe undertraining.',
                'ផ្តល់ផលចំណេញបង្រួមត្រឹមតែ +0.2× ប៉ុណ្ណោះ ខណៈបង្កើនប៉ារ៉ាម៉ែត្រធំ និងបង្កើតថូខិនកម្រដែលបង្វឹកមិនគ្រប់គ្រាន់។'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
