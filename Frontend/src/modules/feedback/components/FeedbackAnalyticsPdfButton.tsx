import { useCallback, useState } from 'react';
import { FileDown } from 'lucide-react';

export interface PdfSection {
  title: string;
  subtitle?: string;
  content: string;
  chartId?: string;
  chartImage?: string;
  chartCaption?: string;
}

const buildPrintableHtml = (title: string, sections: PdfSection[], generatedAt?: string) => {
  const sectionsHtml = sections
    .map(
      (section) => `
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">${escapeHtml(section.title)}</h2>
        ${section.subtitle ? `<p class="section-subtitle">${escapeHtml(section.subtitle)}</p>` : ''}
      </div>
      ${section.chartImage ? `<div class="chart-image-wrap"><img src="${section.chartImage}" alt="${escapeHtml(section.chartCaption ?? section.title)}" /></div>` : ''}
      <div class="section-content">${section.content}</div>
    </div>
  `
    )
    .join('');

  const now = generatedAt ?? new Date().toLocaleString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4; margin: 14mm 14mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
      font-size: 10pt;
    }
    .doc-header {
      padding-bottom: 10px;
      border-bottom: 3px solid #4f46e5;
      margin-bottom: 14px;
    }
    .doc-header h1 {
      font-size: 18pt;
      font-weight: 800;
      color: #0f172a;
    }
    .doc-header .meta {
      font-size: 8pt;
      color: #64748b;
      margin-top: 3px;
    }
    .section {
      margin-top: 14px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .section-header {
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 8px;
    }
    .section-title {
      font-size: 12pt;
      font-weight: 800;
      color: #0f172a;
    }
    .section-subtitle {
      font-size: 8.5pt;
      color: #64748b;
      margin-top: 2px;
    }
    .section-content { font-size: 10pt; }
    .chart-image-wrap {
      margin: 8px 0 10px;
      padding: 6px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #ffffff;
      text-align: center;
    }
    .chart-image-wrap img {
      max-width: 100%;
      max-height: 280px;
      height: auto;
      display: inline-block;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 8px;
    }
    .metric-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
      background: #f8fafc;
    }
    .metric-label {
      font-size: 8pt;
      color: #64748b;
      font-weight: 600;
    }
    .metric-value {
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      margin-top: 3px;
    }
    .metric-detail {
      font-size: 7.5pt;
      color: #94a3b8;
      margin-top: 3px;
    }
    .sentiment-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 8px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
      background: #f8fafc;
    }
    .sentiment-cell { text-align: center; }
    .sentiment-label { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; }
    .sentiment-value { font-size: 18pt; font-weight: 800; color: #0f172a; margin-top: 3px; }
    .sentiment-cell.positive .sentiment-value { color: #059669; }
    .sentiment-cell.neutral .sentiment-value { color: #64748b; }
    .sentiment-cell.negative .sentiment-value { color: #e11d48; }
    .keywords-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .keyword-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #eef2ff;
      color: #4338ca;
      border: 1px solid #c7d2fe;
      border-radius: 999px;
      padding: 3px 10px;
      font-size: 9pt;
      font-weight: 600;
    }
    .keyword-pill .count {
      background: #4f46e5;
      color: white;
      border-radius: 999px;
      padding: 0 6px;
      font-size: 7.5pt;
      font-weight: 700;
    }
    .question-block {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 8px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .question-prompt {
      font-size: 10pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 2px;
    }
    .question-meta {
      font-size: 8pt;
      color: #64748b;
      margin-bottom: 6px;
    }
    .chart-wrap { width: 100%; }
    .chart-wrap svg { width: 100% !important; height: auto !important; max-height: 200px; }
    .chart-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .choice-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
    }
    .choice-table th, .choice-table td {
      text-align: left;
      padding: 5px 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .choice-table th { background: #f8fafc; font-weight: 700; color: #475569; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.05em; }
    .choice-table td.count { text-align: right; font-weight: 700; color: #0f172a; }
    .bar-cell { width: 60%; }
    .bar-track { background: #e2e8f0; border-radius: 4px; height: 8px; overflow: hidden; }
    .bar-fill { background: #4f46e5; height: 100%; border-radius: 4px; }
    .word-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 6px;
    }
    .word-cloud .word {
      padding: 3px 8px;
      border-radius: 6px;
      background: #f1f5f9;
      color: #334155;
    }
    .word-cloud .word.lg { font-size: 14pt; font-weight: 800; color: #0f172a; }
    .word-cloud .word.md { font-size: 11pt; font-weight: 700; color: #1e293b; }
    .word-cloud .word.sm { font-size: 9pt; }
    .footer {
      margin-top: 14px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      font-size: 7.5pt;
      color: #94a3b8;
      text-align: center;
    }
    @media print {
      .section, .question-block, .metric-card, .sentiment-grid { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="doc-header">
    <h1>${escapeHtml(title)}</h1>
    <p class="meta">Generated ${escapeHtml(now)}</p>
  </div>
  ${sectionsHtml}
  <div class="footer">LabZero &mdash; Feedback Analytics Report</div>
</body>
</html>`;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const serializeSvgElement = (svg: SVGElement): string => {
  const clone = svg.cloneNode(true) as SVGElement;
  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  if (!clone.getAttribute('xmlns:xlink')) {
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  }
  let widthAttr = clone.getAttribute('width');
  let heightAttr = clone.getAttribute('height');
  if (!widthAttr || !heightAttr) {
    const viewBox = clone.getAttribute('viewBox');
    if (viewBox) {
      const [, , w, h] = viewBox.split(/\s+/).map(Number);
      if (!widthAttr && w) clone.setAttribute('width', String(w));
      if (!heightAttr && h) clone.setAttribute('height', String(h));
    }
  }
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .recharts-cartesian-axis-tick-value { font-size: 11px; fill: #475569; }
    .recharts-tooltip-wrapper { display: none; }
  `;
  clone.insertBefore(styleEl, clone.firstChild);
  return new XMLSerializer().serializeToString(clone);
};

export const svgToPngDataUrl = (svg: SVGElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const rect = svg.getBoundingClientRect();
      const width = Math.max(400, Math.ceil(rect.width || 600));
      const height = Math.max(200, Math.ceil(rect.height || 320));
      const scale = 2;
      const serialized = serializeSvgElement(svg);
      const svgBlob = new Blob([serialized], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
};

export const captureChartById = async (
  chartId: string,
): Promise<string | null> => {
  const container = document.querySelector(`[data-pdf-chart-id="${chartId}"]`);
  if (!container) return null;
  const svg = container.querySelector('svg');
  if (!svg) return null;
  return svgToPngDataUrl(svg);
};

export const captureChartsByIds = async (
  chartIds: string[],
): Promise<Record<string, string>> => {
  const results = await Promise.all(
    chartIds.map(async (id) => {
      try {
        const dataUrl = await captureChartById(id);
        return [id, dataUrl] as const;
      } catch {
        return [id, null] as const;
      }
    }),
  );
  const out: Record<string, string> = {};
  for (const [id, dataUrl] of results) {
    if (dataUrl) out[id] = dataUrl;
  }
  return out;
};

const openPrintWindow = (html: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 700);
};

interface DownloadButtonProps {
  title: string;
  sections: PdfSection[];
  generatedAt?: string;
  className?: string;
  label?: string;
}

export const FeedbackAnalyticsPdfButton = ({
  title,
  sections,
  generatedAt,
  className,
  label = 'Download PDF',
}: DownloadButtonProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const handleDownload = useCallback(async () => {
    setIsCapturing(true);
    try {
      const chartIds = sections
        .map((s) => s.chartId)
        .filter((id): id is string => Boolean(id));
      const chartImages = chartIds.length
        ? await captureChartsByIds(chartIds)
        : {};
      const enriched = sections.map((section) => {
        if (section.chartId && chartImages[section.chartId]) {
          return { ...section, chartImage: chartImages[section.chartId] };
        }
        return section;
      });
      const html = buildPrintableHtml(title, enriched, generatedAt);
      openPrintWindow(html);
    } catch {
      const html = buildPrintableHtml(title, sections, generatedAt);
      openPrintWindow(html);
    } finally {
      setIsCapturing(false);
    }
  }, [title, sections, generatedAt]);

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isCapturing}
      className={
        className ??
        'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
      }
    >
      <FileDown size={16} className={isCapturing ? 'animate-spin' : undefined} />
      {isCapturing ? 'Preparing PDF…' : label}
    </button>
  );
};

export const buildRatingSection = (
  stats: Array<{
    prompt?: string;
    sectionTitle?: string;
    ratingDistribution?: Record<string, number>;
    averageRating?: number;
  }>,
) => {
  const rows = stats
    .map((s) => {
      const dist = s.ratingDistribution ?? {};
      const total = Object.values(dist).reduce((a, b) => a + Number(b), 0);
      const max = Math.max(1, ...Object.values(dist).map((v) => Number(v)));
      const cells = [1, 2, 3, 4, 5]
        .map((rating) => {
          const count = Number(dist[String(rating)] ?? 0);
          const pct = total > 0 ? (count / total) * 100 : 0;
          return `<td>
            <div style="font-weight:700;color:#0f172a">${count}</div>
            <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:#f59e0b"></div></div>
            <div style="font-size:7.5pt;color:#94a3b8;margin-top:1px">${pct.toFixed(0)}%</div>
          </td>`;
        })
        .join('');
      return `<tr>
        <td><div style="font-weight:600;color:#0f172a">${escapeHtml(s.prompt ?? 'Untitled question')}</div>${s.sectionTitle ? `<div style="font-size:7.5pt;color:#94a3b8">${escapeHtml(s.sectionTitle)}</div>` : ''}</td>
        <td style="text-align:center;font-weight:700">${s.averageRating?.toFixed(2) ?? '0.00'}</td>
        ${cells}
      </tr>`;
    })
    .join('');

  return `
    <table class="choice-table">
      <thead>
        <tr>
          <th>Question</th>
          <th style="text-align:center">Avg</th>
          <th style="text-align:center">1★</th>
          <th style="text-align:center">2★</th>
          <th style="text-align:center">3★</th>
          <th style="text-align:center">4★</th>
          <th style="text-align:center">5★</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

export const buildChoiceSection = (
  stats: Array<{
    prompt?: string;
    sectionTitle?: string;
    type: string;
    optionCounts?: Record<string, number>;
  }>,
) => {
  const blocks = stats
    .map((s) => {
      const counts = s.optionCounts ?? {};
      const entries = Object.entries(counts).sort(([, a], [, b]) => Number(b) - Number(a));
      const total = entries.reduce((acc, [, v]) => acc + Number(v), 0);
      const max = Math.max(1, ...entries.map(([, v]) => Number(v)));
      const palette = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#c026d3', '#e11d48', '#475569', '#7c3aed', '#0ea5e9', '#10b981'];
      const rows = entries
        .map(([label, count], idx) => {
          const pct = total > 0 ? (Number(count) / total) * 100 : 0;
          const color = palette[idx % palette.length];
          return `<tr>
            <td><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color};margin-right:6px;vertical-align:middle"></span>${escapeHtml(label)}</td>
            <td class="count">${count}</td>
            <td class="bar-cell"><div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div></td>
            <td style="text-align:right;color:#64748b;font-size:8.5pt">${pct.toFixed(0)}%</td>
          </tr>`;
        })
        .join('');
      return `<div class="question-block">
        <div class="question-prompt">${escapeHtml(s.prompt ?? 'Untitled question')}</div>
        <div class="question-meta">${escapeHtml(s.sectionTitle ?? '')} · ${escapeHtml(s.type)} question · ${total} responses</div>
        <table class="choice-table">
          <thead><tr><th>Option</th><th class="count">Count</th><th class="bar-cell">Distribution</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    })
    .join('');

  return blocks;
};

export const buildSummaryMetrics = (
  metrics: Array<{ label: string; value: string | number; detail?: string }>,
) => {
  const cards = metrics
    .map(
      (m) => `<div class="metric-card">
        <div class="metric-label">${escapeHtml(m.label)}</div>
        <div class="metric-value">${escapeHtml(String(m.value))}</div>
        ${m.detail ? `<div class="metric-detail">${escapeHtml(m.detail)}</div>` : ''}
      </div>`,
    )
    .join('');
  return `<div class="metric-grid">${cards}</div>`;
};

export const buildSentimentBlock = (
  sentiment: { positive: number; neutral: number; negative: number; averageScore: number; satisfactionPercentage: number },
  totalResponses: number,
) => {
  return `
    <div style="margin-bottom: 6px; font-size: 8.5pt; color: #64748b;">
      ${totalResponses} text responses analyzed &middot; <strong>${sentiment.satisfactionPercentage}% positive satisfaction</strong>
    </div>
    <div class="sentiment-grid">
      <div class="sentiment-cell positive">
        <div class="sentiment-label">Positive</div>
        <div class="sentiment-value">${sentiment.positive}</div>
      </div>
      <div class="sentiment-cell neutral">
        <div class="sentiment-label">Neutral</div>
        <div class="sentiment-value">${sentiment.neutral}</div>
      </div>
      <div class="sentiment-cell negative">
        <div class="sentiment-label">Negative</div>
        <div class="sentiment-value">${sentiment.negative}</div>
      </div>
      <div class="sentiment-cell">
        <div class="sentiment-label">Avg Score</div>
        <div class="sentiment-value">${sentiment.averageScore.toFixed(2)}</div>
      </div>
    </div>
  `;
};

export const buildKeywordsBlock = (
  keywords: Array<{ keyword: string; count: number; score: number }>,
) => {
  const pills = keywords
    .slice(0, 20)
    .map(
      (k) => `<span class="keyword-pill">${escapeHtml(k.keyword)}<span class="count">${k.count}</span></span>`,
    )
    .join('');
  return `<div class="keywords-list">${pills}</div>`;
};

export const buildWordCloudBlock = (
  words: Array<{ word: string; count: number }>,
) => {
  if (!words.length) {
    return '<div style="font-size:9pt;color:#94a3b8;font-style:italic">No words to display.</div>';
  }
  const max = Math.max(...words.map((w) => w.count));
  const items = words
    .slice(0, 40)
    .map((w) => {
      const ratio = w.count / max;
      const sizeClass = ratio > 0.6 ? 'lg' : ratio > 0.3 ? 'md' : 'sm';
      return `<span class="word ${sizeClass}">${escapeHtml(w.word)} <span style="color:#94a3b8;font-size:0.7em">${w.count}</span></span>`;
    })
    .join('');
  return `<div class="word-cloud">${items}</div>`;
};

export const buildTextQuestionBlock = (
  question: {
    questionId: string;
    prompt: string;
    responseCount: number;
    keywords: Array<{ keyword: string; count: number; score: number }>;
    wordFrequencies: Array<{ word: string; count: number }>;
    sentiment: { positive: number; neutral: number; negative: number; averageScore: number; satisfactionPercentage: number };
  },
) => {
  return `
    <div class="question-block">
      <div class="question-prompt">${escapeHtml(question.prompt)}</div>
      <div class="question-meta">${question.responseCount} text responses &middot; ${question.sentiment.satisfactionPercentage}% positive</div>
      <div class="chart-grid">
        <div>
          <div style="font-size:9pt;font-weight:700;color:#475569;margin-bottom:4px">Top keywords</div>
          ${buildKeywordsBlock(question.keywords)}
        </div>
        <div>
          <div style="font-size:9pt;font-weight:700;color:#475569;margin-bottom:4px">Word cloud</div>
          ${buildWordCloudBlock(question.wordFrequencies)}
        </div>
      </div>
    </div>
  `;
};

export default FeedbackAnalyticsPdfButton;
