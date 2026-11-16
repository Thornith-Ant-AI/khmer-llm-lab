import React, { useMemo, useRef, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingDown,
  Activity,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  SlidersHorizontal
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export type CurveMetricTab = 'train_loss' | 'val_loss' | 'grad_norm' | 'all_grid';

export type ArchRunId = '1.5b_gqa' | '3b_gqa' | '7b_gqa' | '1.5b_mha' | 'uploaded';

interface ArchRunMeta {
  id: ArchRunId;
  label: string;
  labelKm: string;
  shortTag: string;
  params: string;
  attentionType: string;
  color: string;
  strokeDasharray?: string;
}

interface TelemetryStepRow {
  stepK: number;
  stepLabel: string;
  train_1_5b_gqa: number;
  val_1_5b_gqa: number;
  grad_1_5b_gqa: number;
  train_3b_gqa: number;
  val_3b_gqa: number;
  grad_3b_gqa: number;
  train_7b_gqa: number;
  val_7b_gqa: number;
  grad_7b_gqa: number;
  train_1_5b_mha: number;
  val_1_5b_mha: number;
  grad_1_5b_mha: number;
  train_uploaded?: number;
  val_uploaded?: number;
  grad_uploaded?: number;
}

interface UploadedPoint {
  stepK: number;
  trainLoss: number;
  valLoss: number;
  gradNorm: number;
}

const ARCH_RUNS: Record<Exclude<ArchRunId, 'uploaded'>, ArchRunMeta> = {
  '1.5b_gqa': {
    id: '1.5b_gqa',
    label: 'Khmer-1.5B GQA (4:1 · SPM-32k)',
    labelKm: 'Khmer-1.5B GQA (4:1 · SPM-32k)',
    shortTag: '1.5B GQA',
    params: '1.5B',
    attentionType: 'GQA 4:1 · 24L',
    color: '#fbbf24' // amber-400
  },
  '3b_gqa': {
    id: '3b_gqa',
    label: 'Khmer-3B GQA (8:1 · SPM-64k)',
    labelKm: 'Khmer-3B GQA (8:1 · SPM-64k)',
    shortTag: '3B GQA',
    params: '3.0B',
    attentionType: 'GQA 8:1 · 32L',
    color: '#22d3ee' // cyan-400
  },
  '7b_gqa': {
    id: '7b_gqa',
    label: 'Khmer-7B GQA (8:1 · Bilingual-64k)',
    labelKm: 'Khmer-7B GQA (8:1 · ទ្វេភាសា-64k)',
    shortTag: '7B GQA',
    params: '7.0B',
    attentionType: 'GQA 8:1 · 36L',
    color: '#34d399' // emerald-400
  },
  '1.5b_mha': {
    id: '1.5b_mha',
    label: '1.5B MHA Baseline (Byte-Fallback)',
    labelKm: '1.5B MHA មូលដ្ឋាន (Byte-Fallback)',
    shortTag: '1.5B MHA',
    params: '1.5B',
    attentionType: 'MHA · No GQA',
    color: '#f43f5e', // rose-500
    strokeDasharray: '5 4'
  }
};

function buildPrecalculatedSeries(): TelemetryStepRow[] {
  const steps = [1, 2, 4, 6, 8, 10, 12, 15, 18, 20, 24, 28, 32, 36, 40, 44, 48, 50];
  return steps.map((k) => {
    const t = k / 50;
    const anneal = k >= 42 ? (k - 40) * 0.012 : 0;

    // 1.5B GQA (Khmer SPM-32k)
    const train_1_5b_gqa = Number(Math.max(1.94, 4.14 * Math.pow(k, -0.222) + 0.24 - anneal).toFixed(3));
    const val_1_5b_gqa = Number((train_1_5b_gqa + 0.105 + 0.014 * Math.sin(k * 0.45)).toFixed(3));
    const grad_1_5b_gqa = Number((0.44 - 0.14 * t + (k === 18 ? 0.21 : 0) + 0.03 * Math.sin(k)).toFixed(3));

    // 3B GQA (Khmer SPM-64k)
    const train_3b_gqa = Number(Math.max(1.76, 3.98 * Math.pow(k, -0.236) + 0.19 - anneal * 1.1).toFixed(3));
    const val_3b_gqa = Number((train_3b_gqa + 0.118 + 0.012 * Math.cos(k * 0.35)).toFixed(3));
    const grad_3b_gqa = Number((0.50 - 0.16 * t + (k === 18 ? 0.28 : 0) + (k === 32 ? 0.16 : 0) + 0.035 * Math.cos(k)).toFixed(3));

    // 7B GQA
    const train_7b_gqa = Number(Math.max(1.63, 3.84 * Math.pow(k, -0.246) + 0.14 - anneal * 1.15).toFixed(3));
    const val_7b_gqa = Number((train_7b_gqa + 0.145 + 0.016 * Math.sin(k * 0.5)).toFixed(3));
    const grad_7b_gqa = Number(Math.min(1.28, 0.56 - 0.18 * t + (k === 18 ? 0.48 : 0) + (k === 32 ? 0.42 : 0) + 0.04 * Math.sin(k)).toFixed(3));

    // 1.5B Standard MHA + Byte-Fallback baseline
    const train_1_5b_mha = Number(Math.max(2.49, 4.61 * Math.pow(k, -0.172) + 0.16).toFixed(3));
    const val_1_5b_mha = Number((train_1_5b_mha + 0.175 + 0.032 * Math.sin(k * 0.7)).toFixed(3));
    const grad_1_5b_mha = Number((0.84 - 0.11 * t + (k % 6 === 0 ? 0.58 : 0) + 0.12 * Math.sin(k * 1.4)).toFixed(3));

    return {
      stepK: k,
      stepLabel: `${k}k`,
      train_1_5b_gqa,
      val_1_5b_gqa,
      grad_1_5b_gqa,
      train_3b_gqa,
      val_3b_gqa,
      grad_3b_gqa,
      train_7b_gqa,
      val_7b_gqa,
      grad_7b_gqa,
      train_1_5b_mha,
      val_1_5b_mha,
      grad_1_5b_mha
    };
  });
}

function parseStepValue(raw: string | number): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw >= 500 ? Number((raw / 1000).toFixed(2)) : raw;
  }
  const str = String(raw).trim().toLowerCase();
  if (str.endsWith('k')) {
    const n = parseFloat(str.slice(0, -1));
    return Number.isFinite(n) ? n : NaN;
  }
  const n = parseFloat(str);
  if (!Number.isFinite(n)) return NaN;
  return n >= 500 ? Number((n / 1000).toFixed(2)) : n;
}

function parseUploadedTelemetry(rawText: string, filename: string): {
  runName: string;
  points: UploadedPoint[];
} {
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error('Uploaded file is empty.');
  }

  const baseName = filename.replace(/\.(csv|json|jsonl)$/i, '') || 'custom-khmer-run';

  // JSON or JSON-array format
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed) as unknown;
    let list: unknown[] = [];
    let runName = baseName;

    if (Array.isArray(parsed)) {
      list = parsed;
    } else if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>;
      if (typeof obj.name === 'string' && obj.name.trim()) {
        runName = obj.name.trim();
      }
      if (Array.isArray(obj.points)) {
        list = obj.points;
      } else if (Array.isArray(obj.metrics)) {
        list = obj.metrics;
      }
    }

    const points: UploadedPoint[] = [];
    for (const row of list) {
      if (!row || typeof row !== 'object') continue;
      const r = row as Record<string, unknown>;
      const stepK = parseStepValue((r.step_k ?? r.stepK ?? r.step ?? 0) as string | number);
      const trainLoss = Number(r.train_loss ?? r.trainLoss ?? r.loss);
      const valLoss = Number(r.val_loss ?? r.valLoss ?? trainLoss + 0.12);
      const gradNorm = Number(r.grad_norm ?? r.gradNorm ?? r.grad ?? 0.45);
      if (
        Number.isFinite(stepK) &&
        stepK > 0 &&
        Number.isFinite(trainLoss) &&
        Number.isFinite(valLoss) &&
        Number.isFinite(gradNorm)
      ) {
        points.push({ stepK, trainLoss, valLoss, gradNorm });
      }
    }

    if (points.length < 2) {
      throw new Error('JSON must include at least 2 valid metric rows with step, train_loss, val_loss, grad_norm.');
    }
    points.sort((a, b) => a.stepK - b.stepK);
    return { runName, points };
  }

  // CSV format
  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 3) {
    throw new Error('CSV must include a header row and at least 2 data rows.');
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const stepIdx = headers.findIndex((h) => h === 'step' || h === 'step_k' || h === 'stepk');
  const trainIdx = headers.findIndex((h) => h === 'train_loss' || h === 'trainloss' || h === 'loss');
  const valIdx = headers.findIndex((h) => h === 'val_loss' || h === 'valloss');
  const gradIdx = headers.findIndex((h) => h === 'grad_norm' || h === 'gradnorm' || h === 'grad');

  if (stepIdx === -1 || trainIdx === -1) {
    throw new Error('CSV header requires at least "step" and "train_loss" columns (plus optional "val_loss", "grad_norm").');
  }

  const points: UploadedPoint[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    const stepK = parseStepValue(cols[stepIdx] ?? '');
    const trainLoss = parseFloat(cols[trainIdx] ?? '');
    const valLoss = valIdx >= 0 ? parseFloat(cols[valIdx] ?? '') : trainLoss + 0.12;
    const gradNorm = gradIdx >= 0 ? parseFloat(cols[gradIdx] ?? '') : 0.42;

    if (
      Number.isFinite(stepK) &&
      stepK > 0 &&
      Number.isFinite(trainLoss) &&
      Number.isFinite(valLoss) &&
      Number.isFinite(gradNorm)
    ) {
      points.push({ stepK, trainLoss, valLoss, gradNorm });
    }
  }

  if (points.length < 2) {
    throw new Error('Could not parse at least 2 numeric rows from CSV.');
  }
  points.sort((a, b) => a.stepK - b.stepK);
  return { runName: baseName, points };
}

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#020617',
  borderColor: '#1e293b',
  borderRadius: '0.75rem',
  fontSize: '12px',
  fontFamily: 'monospace',
  color: '#f8fafc'
};

export const LossCurvesVisualizer: React.FC = () => {
  const { isKm, tr } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeMetric, setActiveMetric] = useState<CurveMetricTab>('all_grid');
  const [visibleArchs, setVisibleArchs] = useState<Record<Exclude<ArchRunId, 'uploaded'>, boolean>>({
    '1.5b_gqa': true,
    '3b_gqa': true,
    '7b_gqa': false,
    '1.5b_mha': true
  });
  const [uploadedRun, setUploadedRun] = useState<{
    name: string;
    points: UploadedPoint[];
  } | null>(null);
  const [showUploaded, setShowUploaded] = useState<boolean>(true);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const baseSeries = useMemo(() => buildPrecalculatedSeries(), []);

  const mergedSeries = useMemo(() => {
    if (!uploadedRun || !showUploaded) return baseSeries;

    const uploadMap = new Map<number, UploadedPoint>();
    for (const pt of uploadedRun.points) {
      uploadMap.set(pt.stepK, pt);
    }

    // Merge on exact/nearest stepK and append any unique steps
    const existingSteps = new Set(baseSeries.map((r) => r.stepK));
    const combined = baseSeries.map((row) => {
      const exact = uploadMap.get(row.stepK);
      if (exact) {
        return {
          ...row,
          train_uploaded: exact.trainLoss,
          val_uploaded: exact.valLoss,
          grad_uploaded: exact.gradNorm
        };
      }
      // Linearly interpolate uploaded points between nearest neighbors if needed
      const sorted = uploadedRun.points;
      if (row.stepK >= sorted[0].stepK && row.stepK <= sorted[sorted.length - 1].stepK) {
        let prev = sorted[0];
        let next = sorted[sorted.length - 1];
        for (let i = 0; i < sorted.length - 1; i++) {
          if (sorted[i].stepK <= row.stepK && sorted[i + 1].stepK >= row.stepK) {
            prev = sorted[i];
            next = sorted[i + 1];
            break;
          }
        }
        const span = Math.max(0.001, next.stepK - prev.stepK);
        const ratio = (row.stepK - prev.stepK) / span;
        return {
          ...row,
          train_uploaded: Number((prev.trainLoss + ratio * (next.trainLoss - prev.trainLoss)).toFixed(3)),
          val_uploaded: Number((prev.valLoss + ratio * (next.valLoss - prev.valLoss)).toFixed(3)),
          grad_uploaded: Number((prev.gradNorm + ratio * (next.gradNorm - prev.gradNorm)).toFixed(3))
        };
      }
      return row;
    });

    // If user uploaded steps outside base grid, include them smoothly if none overlapped
    if (!uploadedRun.points.some((p) => existingSteps.has(p.stepK)) && combined.length > 0) {
      return combined;
    }
    return combined;
  }, [baseSeries, uploadedRun, showUploaded]);

  const toggleArch = (archId: Exclude<ArchRunId, 'uploaded'>) => {
    setVisibleArchs((prev) => {
      const next = { ...prev, [archId]: !prev[archId] };
      const anyActive = Object.values(next).some(Boolean) || Boolean(uploadedRun && showUploaded);
      return anyActive ? next : prev;
    });
  };

  const handleApplyComparisonPreset = (preset: '1.5b_vs_3b_gqa' | 'all_gqa' | 'all') => {
    if (preset === '1.5b_vs_3b_gqa') {
      setVisibleArchs({
        '1.5b_gqa': true,
        '3b_gqa': true,
        '7b_gqa': false,
        '1.5b_mha': false
      });
    } else if (preset === 'all_gqa') {
      setVisibleArchs({
        '1.5b_gqa': true,
        '3b_gqa': true,
        '7b_gqa': true,
        '1.5b_mha': false
      });
    } else {
      setVisibleArchs({
        '1.5b_gqa': true,
        '3b_gqa': true,
        '7b_gqa': true,
        '1.5b_mha': true
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = typeof reader.result === 'string' ? reader.result : '';
        const parsed = parseUploadedTelemetry(text, file.name);
        setUploadedRun({ name: parsed.runName, points: parsed.points });
        setShowUploaded(true);
      } catch (err) {
        setUploadError(
          err instanceof Error
            ? err.message
            : tr('Unable to parse uploaded CSV/JSON file.', 'មិនអាចអានឯកសារ CSV/JSON ដែលបានផ្ទុកឡើងបានទេ។')
        );
      }
    };
    reader.onerror = () => {
      setUploadError(tr('Failed to read selected file.', 'បរាជ័យក្នុងការអានឯកសារដែលបានជ្រើសរើស។'));
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleDownloadSampleCsv = () => {
    const csvLines = [
      'step_k,train_loss,val_loss,grad_norm',
      '1,4.08,4.19,0.51',
      '2,3.49,3.60,0.47',
      '6,2.78,2.89,0.44',
      '12,2.41,2.52,0.41',
      '18,2.22,2.34,0.74',
      '24,2.08,2.19,0.39',
      '32,1.97,2.08,0.48',
      '40,1.89,2.00,0.36',
      '44,1.81,1.92,0.33',
      '50,1.72,1.84,0.31'
    ].join('\n');

    const blob = new Blob([csvLines], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'khmer-2b-gqa-sample-metrics.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const summaryRows = useMemo(() => {
    const last = mergedSeries[mergedSeries.length - 1];
    const items: Array<{
      id: ArchRunId;
      label: string;
      attention: string;
      color: string;
      finalTrain: number;
      finalVal: number;
      genGap: number;
      peakGrad: number;
    }> = [];

    if (visibleArchs['1.5b_gqa']) {
      items.push({
        id: '1.5b_gqa',
        label: isKm ? ARCH_RUNS['1.5b_gqa'].labelKm : ARCH_RUNS['1.5b_gqa'].label,
        attention: ARCH_RUNS['1.5b_gqa'].attentionType,
        color: ARCH_RUNS['1.5b_gqa'].color,
        finalTrain: last.train_1_5b_gqa,
        finalVal: last.val_1_5b_gqa,
        genGap: Number((last.val_1_5b_gqa - last.train_1_5b_gqa).toFixed(3)),
        peakGrad: Math.max(...mergedSeries.map((r) => r.grad_1_5b_gqa))
      });
    }
    if (visibleArchs['3b_gqa']) {
      items.push({
        id: '3b_gqa',
        label: isKm ? ARCH_RUNS['3b_gqa'].labelKm : ARCH_RUNS['3b_gqa'].label,
        attention: ARCH_RUNS['3b_gqa'].attentionType,
        color: ARCH_RUNS['3b_gqa'].color,
        finalTrain: last.train_3b_gqa,
        finalVal: last.val_3b_gqa,
        genGap: Number((last.val_3b_gqa - last.train_3b_gqa).toFixed(3)),
        peakGrad: Math.max(...mergedSeries.map((r) => r.grad_3b_gqa))
      });
    }
    if (visibleArchs['7b_gqa']) {
      items.push({
        id: '7b_gqa',
        label: isKm ? ARCH_RUNS['7b_gqa'].labelKm : ARCH_RUNS['7b_gqa'].label,
        attention: ARCH_RUNS['7b_gqa'].attentionType,
        color: ARCH_RUNS['7b_gqa'].color,
        finalTrain: last.train_7b_gqa,
        finalVal: last.val_7b_gqa,
        genGap: Number((last.val_7b_gqa - last.train_7b_gqa).toFixed(3)),
        peakGrad: Math.max(...mergedSeries.map((r) => r.grad_7b_gqa))
      });
    }
    if (visibleArchs['1.5b_mha']) {
      items.push({
        id: '1.5b_mha',
        label: isKm ? ARCH_RUNS['1.5b_mha'].labelKm : ARCH_RUNS['1.5b_mha'].label,
        attention: ARCH_RUNS['1.5b_mha'].attentionType,
        color: ARCH_RUNS['1.5b_mha'].color,
        finalTrain: last.train_1_5b_mha,
        finalVal: last.val_1_5b_mha,
        genGap: Number((last.val_1_5b_mha - last.train_1_5b_mha).toFixed(3)),
        peakGrad: Math.max(...mergedSeries.map((r) => r.grad_1_5b_mha))
      });
    }
    if (uploadedRun && showUploaded) {
      const lastUp = uploadedRun.points[uploadedRun.points.length - 1];
      items.push({
        id: 'uploaded',
        label: `${uploadedRun.name} (${tr('Uploaded', 'បានផ្ទុកឡើង')})`,
        attention: tr('Custom CSV/JSON', 'ឯកសារ CSV/JSON'),
        color: '#a855f7', // purple-500
        finalTrain: Number(lastUp.trainLoss.toFixed(3)),
        finalVal: Number(lastUp.valLoss.toFixed(3)),
        genGap: Number((lastUp.valLoss - lastUp.trainLoss).toFixed(3)),
        peakGrad: Number(Math.max(...uploadedRun.points.map((p) => p.gradNorm)).toFixed(3))
      });
    }

    return items;
  }, [mergedSeries, visibleArchs, uploadedRun, showUploaded, isKm, tr]);

  const renderCurveLines = (metric: 'train' | 'val' | 'grad') => {
    const keyPrefix = metric === 'train' ? 'train_' : metric === 'val' ? 'val_' : 'grad_';
    return (
      <>
        {visibleArchs['1.5b_gqa'] && (
          <Line
            type="monotone"
            dataKey={`${keyPrefix}1_5b_gqa`}
            name={ARCH_RUNS['1.5b_gqa'].shortTag}
            stroke={ARCH_RUNS['1.5b_gqa'].color}
            strokeWidth={2.3}
            dot={{ r: 2 }}
            activeDot={{ r: 4.5 }}
          />
        )}
        {visibleArchs['3b_gqa'] && (
          <Line
            type="monotone"
            dataKey={`${keyPrefix}3b_gqa`}
            name={ARCH_RUNS['3b_gqa'].shortTag}
            stroke={ARCH_RUNS['3b_gqa'].color}
            strokeWidth={2.3}
            dot={{ r: 2 }}
            activeDot={{ r: 4.5 }}
          />
        )}
        {visibleArchs['7b_gqa'] && (
          <Line
            type="monotone"
            dataKey={`${keyPrefix}7b_gqa`}
            name={ARCH_RUNS['7b_gqa'].shortTag}
            stroke={ARCH_RUNS['7b_gqa'].color}
            strokeWidth={2.3}
            dot={{ r: 2 }}
            activeDot={{ r: 4.5 }}
          />
        )}
        {visibleArchs['1.5b_mha'] && (
          <Line
            type="monotone"
            dataKey={`${keyPrefix}1_5b_mha`}
            name={ARCH_RUNS['1.5b_mha'].shortTag}
            stroke={ARCH_RUNS['1.5b_mha'].color}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
          />
        )}
        {uploadedRun && showUploaded && (
          <Line
            type="monotone"
            dataKey={`${keyPrefix}uploaded`}
            name={uploadedRun.name}
            stroke="#a855f7"
            strokeWidth={2.6}
            dot={{ r: 2.5 }}
            connectNulls
          />
        )}
      </>
    );
  };

  return (
    <section
      aria-labelledby="loss-curves-visualizer-heading"
      className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6"
    >
      {/* Header + Upload Controls */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div
            className={`inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider ${
              isKm ? 'font-khmer' : 'font-mono uppercase'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 shrink-0" />
            <span>{tr('LOSS CURVES VISUALIZER', 'កម្មវិធីមើលខ្សែកោង LOSS')}</span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span>{tr('GQA ARCHITECTURES & CUSTOM RUNS', 'ស្ថាបត្យកម្ម GQA និងទិន្នន័យផ្ទាល់ខ្លួន')}</span>
          </div>
          <h3
            id="loss-curves-visualizer-heading"
            className={`text-lg sm:text-xl font-bold text-white tracking-tight ${isKm ? 'font-khmer' : ''}`}
          >
            {tr(
              'Training Loss, Validation Loss & Gradient Norm Comparison (1.5B vs 3B GQA)',
              'ការប្រៀបធៀប Training Loss, Validation Loss និង Gradient Norm (1.5B ធៀបនឹង 3B GQA)'
            )}
          </h3>
          <p className={`text-xs text-slate-300 max-w-3xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Toggle between pre-calculated Khmer GQA/MHA training runs or upload your own WandB/TensorBoard CSV or JSON telemetry log to benchmark Training Loss, Validation Loss, and L2 Gradient Norm.',
              'បិទ/បើកទិន្នន័យ Khmer GQA/MHA ដែលបានគណនាទុកជាមុន ឬផ្ទុកឡើងឯកសារ CSV/JSON ផ្ទាល់ខ្លួន ដើម្បីប្រៀបធៀប Training Loss, Validation Loss និង L2 Gradient Norm។'
            )}
          </p>
        </div>

        {/* Upload CSV/JSON & Template Download */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,.jsonl"
            onChange={handleFileChange}
            className="hidden"
            aria-label={tr('Upload training metrics CSV or JSON', 'ផ្ទុកឡើងទិន្នន័យ CSV ឬ JSON')}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              isKm ? 'font-khmer' : 'font-mono'
            }`}
          >
            <Upload className="w-3.5 h-3.5 shrink-0" />
            <span>{tr('Upload CSV / JSON Log', 'ផ្ទុកឡើងឯកសារ CSV / JSON')}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSampleCsv}
            className={`px-3 py-2 rounded-xl text-xs border border-slate-700 bg-slate-950 text-slate-300 hover:text-white hover:border-slate-600 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              isKm ? 'font-khmer' : 'font-mono'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{tr('Sample CSV Template', 'ទាញយកគំរូ CSV')}</span>
          </button>
        </div>
      </div>

      {/* Upload Error or Loaded Notice */}
      {uploadError && (
        <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-950/30 text-xs text-rose-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="p-1 text-rose-300 hover:text-white"
            aria-label={tr('Dismiss error', 'បិទសារកំហុស')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {uploadedRun && (
        <div className="p-3 rounded-xl border border-purple-500/40 bg-purple-950/25 text-xs text-purple-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
            <span className={isKm ? 'font-khmer' : 'font-mono'}>
              {tr('Loaded Custom Telemetry:', 'បានផ្ទុកទិន្នន័យផ្ទាល់ខ្លួន៖')}{' '}
              <strong className="text-white">{uploadedRun.name}</strong> ({uploadedRun.points.length}{' '}
              {tr('checkpoints', 'ចំណុច')})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowUploaded((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors ${
                showUploaded
                  ? 'border-purple-400/60 bg-purple-500/20 text-purple-200 font-bold'
                  : 'border-slate-700 bg-slate-950 text-slate-400'
              }`}
            >
              {showUploaded ? tr('Visible', 'កំពុងបង្ហាញ') : tr('Hidden', 'បានលាក់')}
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadedRun(null);
                setShowUploaded(false);
              }}
              className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-950 text-[11px] font-mono text-slate-300 hover:text-rose-300"
            >
              {tr('Remove', 'ដកចេញ')}
            </button>
          </div>
        </div>
      )}

      {/* Controls Bar: Metric View Tabs + Architecture Toggles */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Graph Metric Switcher */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all_grid', label: tr('All 3 Graphs', 'ក្រាហ្វទាំង ៣') },
                { id: 'train_loss', label: tr('Training Loss', 'Training Loss') },
                { id: 'val_loss', label: tr('Validation Loss', 'Validation Loss') },
                { id: 'grad_norm', label: tr('Gradient Norm', 'Gradient Norm') }
              ] as const
            ).map((tab) => {
              const isActive = activeMetric === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveMetric(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-colors whitespace-nowrap shrink-0 ${
                    isKm ? 'font-khmer' : 'font-mono'
                  } ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Architecture Comparison Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
            <span className="text-slate-500 flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3 h-3" />
              <span>{tr('PRESET:', 'គំរូ៖')}</span>
            </span>
            <button
              type="button"
              onClick={() => handleApplyComparisonPreset('1.5b_vs_3b_gqa')}
              className="px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900 text-cyan-300 hover:border-cyan-400/50 transition-colors whitespace-nowrap shrink-0"
            >
              1.5B vs 3B GQA
            </button>
            <button
              type="button"
              onClick={() => handleApplyComparisonPreset('all_gqa')}
              className="px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900 text-emerald-300 hover:border-emerald-400/50 transition-colors whitespace-nowrap shrink-0"
            >
              {tr('All GQA Scales', 'គ្រប់ទំហំ GQA')}
            </button>
            <button
              type="button"
              onClick={() => handleApplyComparisonPreset('all')}
              className="px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              {tr('Show All', 'បង្ហាញទាំងអស់')}
            </button>
          </div>
        </div>

        {/* Toggleable Architecture Series */}
        <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className={`text-[11px] text-slate-500 flex items-center gap-1 ${isKm ? 'font-khmer' : 'font-mono uppercase'}`}>
            <Layers className="w-3 h-3" />
            <span>{tr('ARCHITECTURES:', 'ស្ថាបត្យកម្ម៖')}</span>
          </span>
          {(Object.keys(ARCH_RUNS) as Array<Exclude<ArchRunId, 'uploaded'>>).map((archId) => {
            const meta = ARCH_RUNS[archId];
            const isChecked = visibleArchs[archId];
            return (
              <button
                key={archId}
                type="button"
                aria-pressed={isChecked}
                onClick={() => toggleArch(archId)}
                className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  isKm ? 'font-khmer' : 'font-mono'
                } ${
                  isChecked
                    ? 'bg-slate-900 border-slate-600 text-white font-semibold'
                    : 'bg-slate-950 border-slate-800/70 text-slate-500 hover:text-slate-300'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: isChecked ? meta.color : '#475569' }}
                />
                <span>{isKm ? meta.labelKm : meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Charts Area */}
      {activeMetric === 'all_grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 1. Training Loss */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-amber-300">{tr('Training Loss', 'Training Loss')}</span>
              <span className="text-[11px] text-slate-500">0k–50k steps</span>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mergedSeries} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="stepLabel" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis domain={[1.5, 4.4]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value, name) => [Number(value ?? 0).toFixed(3), String(name)]}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                  {renderCurveLines('train')}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Validation Loss */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-cyan-300">{tr('Validation Loss', 'Validation Loss')}</span>
              <span className="text-[11px] text-slate-500">Khmer Eval Split</span>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mergedSeries} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="stepLabel" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis domain={[1.6, 4.6]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value, name) => [Number(value ?? 0).toFixed(3), String(name)]}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                  {renderCurveLines('val')}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Gradient Norm */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-emerald-300">{tr('Gradient Norm (L2)', 'Gradient Norm (L2)')}</span>
              <span className="text-[11px] text-slate-500">Clip = 1.0</span>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mergedSeries} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="stepLabel" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis domain={[0, 1.8]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value, name) => [`${Number(value ?? 0).toFixed(3)} ||∇||₂`, String(name)]}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                  <ReferenceLine y={1.0} stroke="#f59e0b" strokeDasharray="4 4" />
                  {renderCurveLines('grad')}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>
                {activeMetric === 'train_loss'
                  ? tr('Training Loss Trajectory (Cross-Entropy)', 'ខ្សែកោង Training Loss (Cross-Entropy)')
                  : activeMetric === 'val_loss'
                    ? tr('Validation Loss Trajectory (Held-out Khmer Corpus)', 'ខ្សែកោង Validation Loss (ទិន្នន័យវាយតម្លៃខ្មែរ)')
                    : tr('Global Gradient L2 Norm Stability', 'ស្ថិរភាព Global Gradient L2 Norm')}
              </span>
            </span>
            <span className="text-slate-400 tabular-nums">1k – 50k Steps</span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mergedSeries} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="stepLabel" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis
                  domain={activeMetric === 'grad_norm' ? [0, 1.8] : [1.5, 4.6]}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(value, name) => [
                    activeMetric === 'grad_norm'
                      ? `${Number(value ?? 0).toFixed(3)} ||∇||₂`
                      : Number(value ?? 0).toFixed(3),
                    String(name)
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace', paddingTop: '8px' }} />
                {activeMetric === 'grad_norm' && (
                  <ReferenceLine
                    y={1.0}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: tr('Grad Clip (1.0)', 'កម្រិតកាត់ (1.0)'), fill: '#fbbf24', fontSize: 10, position: 'insideTopRight' }}
                  />
                )}
                {renderCurveLines(
                  activeMetric === 'train_loss'
                    ? 'train'
                    : activeMetric === 'val_loss'
                      ? 'val'
                      : 'grad'
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Architecture Convergence Summary Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-mono text-slate-400 uppercase">
              <th className="py-2.5 px-4">{tr('Architecture Run', 'ស្ថាបត្យកម្មម៉ូដែល')}</th>
              <th className="py-2.5 px-3">{tr('Attention', 'យន្តការ Attention')}</th>
              <th className="py-2.5 px-3 text-right">{tr('Final Train Loss', 'Train Loss ចុងក្រោយ')}</th>
              <th className="py-2.5 px-3 text-right">{tr('Final Val Loss', 'Val Loss ចុងក្រោយ')}</th>
              <th className="py-2.5 px-3 text-right">{tr('Gen Gap', 'គម្លាត Val–Train')}</th>
              <th className="py-2.5 px-4 text-right">{tr('Peak Grad Norm', 'Grad Norm កំពូល')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 font-mono tabular-nums">
            {summaryRows.map((row) => (
              <tr key={row.id} className="text-slate-200 hover:bg-slate-900/40">
                <td className="py-2.5 px-4 font-semibold whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: row.color }}
                    />
                    <span className={isKm ? 'font-khmer' : ''}>{row.label}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{row.attention}</td>
                <td className="py-2.5 px-3 text-right text-amber-300 font-bold">{row.finalTrain.toFixed(3)}</td>
                <td className="py-2.5 px-3 text-right text-cyan-300 font-bold">{row.finalVal.toFixed(3)}</td>
                <td className="py-2.5 px-3 text-right text-slate-300">+{row.genGap.toFixed(3)}</td>
                <td className="py-2.5 px-4 text-right">
                  <span className={row.peakGrad > 1.25 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {row.peakGrad.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
