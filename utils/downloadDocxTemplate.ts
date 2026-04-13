/**
 * downloadDocxTemplate
 * Generates and downloads a sample .docx file that matches the format
 * expected by useDocxImport (H1/H2 headings = slide titles, paragraphs = bullet body).
 *
 * Uses JSZip + raw OOXML to avoid requiring the `docx` npm package.
 */

import JSZip from 'jszip';

// ── OOXML helpers ─────────────────────────────────────────────────────────────

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Heading paragraph (style "Heading1" or "Heading2") */
const heading = (text: string, level: 1 | 2 = 1) => `
  <w:p>
    <w:pPr><w:pStyle w:val="Heading${level}"/></w:pPr>
    <w:r><w:t xml:space="preserve">${esc(text)}</w:t></w:r>
  </w:p>`;

/** Normal paragraph */
const para = (text: string) => `
  <w:p>
    <w:r><w:t xml:space="preserve">${esc(text)}</w:t></w:r>
  </w:p>`;

/** Empty line */
const blank = () => `<w:p><w:r><w:t></w:t></w:r></w:p>`;

// ── Sample slides ─────────────────────────────────────────────────────────────

const SAMPLE_SLIDES = [
  {
    title: 'Slide 1: Giới thiệu — Skyverses AI Marketplace',
    bullets: [
      'Nền tảng all-in-one: 30+ ứng dụng AI trong một tài khoản',
      'Hỗ trợ 50+ model hàng đầu: Veo3, Kling, Gemini, GPT-4o, Midjourney',
      'Thanh toán nội địa, không cần thẻ quốc tế',
    ],
  },
  {
    title: 'Slide 2: Vấn đề hiện tại',
    bullets: [
      'Người dùng phải đăng ký nhiều tài khoản tốn kém',
      'Thanh toán quốc tế phức tạp và chi phí cao',
      'Không có nền tảng tích hợp AI đa năng cho thị trường Việt Nam',
    ],
  },
  {
    title: 'Slide 3: Giải pháp của chúng tôi',
    bullets: [
      'Một tài khoản — tất cả công cụ AI hàng đầu',
      'Credits dùng chung cho video, ảnh, nhạc, giọng nói, chat AI',
      'Tiết kiệm ~70% so với mua lẻ từng nền tảng',
    ],
  },
  {
    title: 'Slide 4: Tính năng nổi bật',
    bullets: [
      '🎬 AI Video: Veo3, Kling, Seedance, Sora',
      '🖼️ AI Image: Midjourney, Flux, Stable Diffusion',
      '🎵 AI Music & Voice: Suno, ElevenLabs, Fish Audio',
      '🤖 AI Chat: Gemini, GPT-4o, Grok, DeepSeek',
    ],
  },
  {
    title: 'Slide 5: Thị trường mục tiêu',
    bullets: [
      'Content creators & freelancers tại Việt Nam',
      'Doanh nghiệp vừa và nhỏ cần giải pháp AI',
      'Studios & agencies cần workflow tự động hoá',
    ],
  },
  {
    title: 'Slide 6: Kết luận & Call to Action',
    bullets: [
      'Đăng ký miễn phí — nhận Credits chào mừng ngay hôm nay',
      'Không cần thẻ quốc tế, không cần đăng ký nhiều nền tảng',
      'Truy cập: ai.skyverses.com',
    ],
  },
];

// ── Document XML ──────────────────────────────────────────────────────────────

function buildDocumentXml(): string {
  const body = SAMPLE_SLIDES.flatMap(({ title, bullets }) => [
    heading(title, 1),
    ...bullets.map(b => para(b)),
    blank(),
  ]).join('\n');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document
  xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  mc:Ignorable="w14 wp14">
  <w:body>
    ${body}
    <w:sectPr/>
  </w:body>
</w:document>`;
}

// Minimal styles XML that defines Heading1 and Heading2
const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:style w:type="paragraph" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr><w:sz w:val="24"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:pPr><w:outlineLvl w:val="0"/></w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="36"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:pPr><w:outlineLvl w:val="1"/></w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="28"/>
    </w:rPr>
  </w:style>
</w:styles>`;

const RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles"
    Target="styles.xml"/>
</Relationships>`;

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml"  ContentType="application/xml"/>
  <Override PartName="/word/document.xml"
    ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml"
    ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

const ROOT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
    Target="word/document.xml"/>
</Relationships>`;

// ── Public API ────────────────────────────────────────────────────────────────

export async function downloadDocxTemplate(filename = 'slide-template.docx'): Promise<void> {
  const zip = new JSZip();

  // OOXML package structure
  zip.file('[Content_Types].xml', CONTENT_TYPES_XML);
  zip.file('_rels/.rels', ROOT_RELS_XML);
  zip.file('word/document.xml', buildDocumentXml());
  zip.file('word/styles.xml', STYLES_XML);
  zip.file('word/_rels/document.xml.rels', RELS_XML);

  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
