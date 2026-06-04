import { AwardTier, TIER_META } from '../../utils/awardTiers';

export interface CertificateInput {
  studentName: string;
  topicName: string;
  subjectName: string;
  tier: AwardTier;
  issuedAt: number;
  certificateId: string;
}

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDate = (ts: number): string => {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const buildCertificateHtml = (input: CertificateInput): string => {
  const meta = TIER_META[input.tier];
  const date = formatDate(input.issuedAt);
  const safeName = escapeHtml(input.studentName || 'Student');
  const safeTopic = escapeHtml(input.topicName);
  const safeSubject = escapeHtml(input.subjectName);
  const safeId = escapeHtml(input.certificateId);
  const tierBadge = `Tier ${meta.ordinal} — ${meta.title}`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>LabZero Certificate — ${safeTopic}</title>
  <style>
    @page { size: A4 landscape; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: #f5f1e8;
      color: #2a2520;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 297mm;
      min-height: 210mm;
      padding: 14mm 18mm;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      background:
        radial-gradient(circle at 12% 20%, rgba(180, 83, 9, 0.06) 0%, transparent 35%),
        radial-gradient(circle at 88% 80%, rgba(3, 105, 161, 0.06) 0%, transparent 35%),
        #fbf8f0;
    }
    .frame-outer {
      position: absolute;
      inset: 6mm;
      border: 4px double #b45309;
      border-radius: 4px;
      pointer-events: none;
    }
    .frame-inner {
      position: absolute;
      inset: 9mm;
      border: 1px solid #b45309;
      border-radius: 2px;
      pointer-events: none;
    }
    .corner {
      position: absolute;
      width: 22mm;
      height: 22mm;
      pointer-events: none;
    }
    .corner svg { width: 100%; height: 100%; }
    .corner.tl { top: 11mm; left: 11mm; }
    .corner.tr { top: 11mm; right: 11mm; transform: scaleX(-1); }
    .corner.bl { bottom: 11mm; left: 11mm; transform: scaleY(-1); }
    .corner.br { bottom: 11mm; right: 11mm; transform: scale(-1, -1); }
    .content {
      width: 100%;
      max-width: 1050px;
      text-align: center;
      position: relative;
      z-index: 2;
    }
    .brand {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      letter-spacing: 0.6em;
      text-transform: uppercase;
      color: #b45309;
      font-weight: 600;
      margin-bottom: 6mm;
    }
    .seal-line {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6mm;
      margin-bottom: 5mm;
    }
    .seal-line .rule {
      flex: 1;
      max-width: 90mm;
      height: 1px;
      background: linear-gradient(90deg, transparent, #b45309, transparent);
    }
    .seal {
      width: 28mm;
      height: 28mm;
      border-radius: 50%;
      background: ${meta.sealGradient};
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18), inset 0 0 0 2px rgba(255,255,255,0.4);
      color: #fff;
      font-weight: 700;
      flex-direction: column;
      font-family: 'Helvetica Neue', Arial, sans-serif;
    }
    .seal .tier-num { font-size: 18pt; line-height: 1; }
    .seal .tier-label { font-size: 6.5pt; letter-spacing: 0.18em; margin-top: 2px; }
    h1 {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-style: italic;
      font-size: 38pt;
      font-weight: 400;
      color: #2a2520;
      margin: 0 0 4mm 0;
    }
    .presented-to {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 10pt;
      letter-spacing: 0.4em;
      text-transform: uppercase;
      color: #6b5d4a;
      margin-bottom: 3mm;
    }
    .recipient {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 32pt;
      font-weight: 700;
      color: #1a1714;
      border-bottom: 2px solid #b45309;
      display: inline-block;
      padding: 0 12mm 2mm 12mm;
      margin-bottom: 5mm;
      min-width: 60%;
    }
    .body-text {
      font-size: 12pt;
      line-height: 1.6;
      color: #3a342a;
      max-width: 720px;
      margin: 0 auto 6mm auto;
    }
    .body-text strong {
      color: #1a1714;
      font-weight: 700;
    }
    .achievement {
      display: inline-flex;
      align-items: center;
      gap: 4mm;
      padding: 3mm 8mm;
      border-radius: 999px;
      background: ${meta.ribbonGradient};
      color: #fff;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-weight: 700;
      font-size: 11pt;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      margin-bottom: 7mm;
    }
    .footer {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12mm;
      align-items: end;
      margin-top: 6mm;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 9pt;
      color: #6b5d4a;
    }
    .footer .cell {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .footer .sig {
      font-family: 'Brush Script MT', 'Lucida Handwriting', cursive;
      font-size: 22pt;
      color: #1a1714;
      border-top: 1px solid #b45309;
      width: 100%;
      padding-top: 2mm;
      margin-bottom: 2mm;
    }
    .footer .label {
      text-transform: uppercase;
      letter-spacing: 0.25em;
      font-size: 7.5pt;
    }
    .footer .value {
      font-size: 10pt;
      color: #2a2520;
      font-weight: 600;
      margin-top: 1mm;
    }
    .cert-id {
      position: absolute;
      bottom: 14mm;
      right: 22mm;
      font-family: 'Courier New', monospace;
      font-size: 7pt;
      color: #8a7d6a;
      letter-spacing: 0.1em;
    }
    @media print {
      body { background: #fbf8f0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="frame-outer"></div>
    <div class="frame-inner"></div>
    <div class="corner tl"><svg viewBox="0 0 100 100"><path d="M5 50 Q 5 5 50 5" stroke="#b45309" stroke-width="2" fill="none"/><circle cx="5" cy="5" r="4" fill="#b45309"/></svg></div>
    <div class="corner tr"><svg viewBox="0 0 100 100"><path d="M5 50 Q 5 5 50 5" stroke="#b45309" stroke-width="2" fill="none"/><circle cx="5" cy="5" r="4" fill="#b45309"/></svg></div>
    <div class="corner bl"><svg viewBox="0 0 100 100"><path d="M5 50 Q 5 5 50 5" stroke="#b45309" stroke-width="2" fill="none"/><circle cx="5" cy="5" r="4" fill="#b45309"/></svg></div>
    <div class="corner br"><svg viewBox="0 0 100 100"><path d="M5 50 Q 5 5 50 5" stroke="#b45309" stroke-width="2" fill="none"/><circle cx="5" cy="5" r="4" fill="#b45309"/></svg></div>
    <div class="content">
      <div class="brand">LabZero &middot; Online Lab Visualization</div>
      <div class="seal-line">
        <div class="rule"></div>
        <div class="seal"><span class="tier-num">${meta.ordinal}</span><span class="tier-label">TIER</span></div>
        <div class="rule"></div>
      </div>
      <h1>Certificate of Achievement</h1>
      <div class="presented-to">This is presented to</div>
      <div class="recipient">${safeName}</div>
      <div class="body-text">
        for successfully completing the <strong>${safeTopic}</strong> laboratory
        in <strong>${safeSubject}</strong> and demonstrating hands-on mastery
        of the underlying concepts through the LabZero interactive environment.
      </div>
      <div class="achievement">${tierBadge} &middot; ${meta.subtitle}</div>
      <div class="footer">
        <div class="cell">
          <div class="sig">A. Curie</div>
          <div class="label">Issued by</div>
          <div class="value">LabZero Academic Office</div>
        </div>
        <div class="cell">
          <div class="sig">${date}</div>
          <div class="label">Date awarded</div>
        </div>
        <div class="cell">
          <div class="sig">L. Director</div>
          <div class="label">Verified by</div>
          <div class="value">Programme Director</div>
        </div>
      </div>
    </div>
    <div class="cert-id">Certificate ID: ${safeId}</div>
  </div>
</body>
</html>`;
};

export const openCertificatePrintWindow = (input: CertificateInput): void => {
  if (typeof window === 'undefined') return;
  const html = buildCertificateHtml(input);
  const printWindow = window.open('', '_blank', 'width=1280,height=900');
  if (!printWindow) {
    console.warn('[Certificate] Popup blocked.');
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  const trigger = () => {
    try {
      printWindow.print();
    } catch (err) {
      console.warn('[Certificate] Print failed', err);
    }
  };
  if (printWindow.document.readyState === 'complete') {
    setTimeout(trigger, 250);
  } else {
    printWindow.addEventListener('load', () => setTimeout(trigger, 250), { once: true });
  }
};
