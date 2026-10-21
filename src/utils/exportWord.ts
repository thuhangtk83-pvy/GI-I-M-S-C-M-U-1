import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
} from 'docx';
import { QuizData, StudentInfo, Question, OptionItem } from '../types';

// Map of Unicode subscripts and superscripts (including n, m for alkene formulas like CₙH₂ₙ)
const UNICODE_SUBSCRIPTS: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
  '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
  '₊': '+', '₋': '-',
  'ₙ': 'n', 'ₘ': 'm', 'ᵢ': 'i', 'ⱼ': 'j', 'ₖ': 'k',
  'ₐ': 'a', 'ₑ': 'e', 'ₒ': 'o', 'ₓ': 'x', 'ₚ': 'p',
};

const UNICODE_SUPERSCRIPTS: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  '⁺': '+', '⁻': '-',
};

interface BaseTextStyle {
  bold?: boolean;
  color?: string;
  size?: number;
  font?: string;
  italics?: boolean;
}

/**
 * Strips any trailing cipher/color brackets such as [Ký tự -màu], [Ký tự - màu], [T - Đỏ],
 * [Ký tự: T - Đỏ], [Ký tự T - màu Đỏ], (Ký tự - màu), etc. for the Word export.
 */
export function cleanQuestionTextForWord(rawText: string): string {
  if (!rawText) return '';
  let cleaned = rawText;

  // 1. Remove explicit variations of [Ký tự - màu] or [Ký tự -màu] anywhere
  cleaned = cleaned.replace(/\[\s*Ký\s*tự(?:\s*mật\s*mã)?\s*[:\-–—]?\s*(?:màu\s*)?[^\]]*\]/gi, '');

  // 2. Remove trailing bracketed cipher/color pattern e.g. [T - Đỏ], [T - màu Đỏ], [A - Xanh lá]
  cleaned = cleaned.replace(/\s*\[\s*(?:Ký\s*tự\s*[:\-–—]?\s*)?[A-Za-z0-9\s]*[-–—:]\s*(?:màu\s*)?[^\]]+\]\s*$/gi, '');

  // 3. Remove parenthesized variations e.g. (Ký tự - màu), (Ký tự: T - Đỏ), (T - Đỏ)
  cleaned = cleaned.replace(/\s*\(\s*(?:Ký\s*tự\s*[:\-–—]?\s*)?[A-Za-z0-9\s]*[-–—:]\s*(?:màu\s*)?[^\)]+\)\s*$/gi, '');

  // 4. Any leftover brackets containing 'màu' or 'Ký tự' at the end of the text
  cleaned = cleaned.replace(/\s*\[\s*[^\]]*(?:màu|Ký tự)[^\]]*\]\s*$/gi, '');
  cleaned = cleaned.replace(/\s*\(\s*[^\)]*(?:màu|Ký tự)[^\)]*\)\s*$/gi, '');

  return cleaned.trim();
}

/**
 * Parses text containing chemical formulas, unicode subscripts, or ASCII formulas (e.g. CH₄, C₂H₆, Cu(OH)2/OH-)
 * into properly formatted docx TextRun array with subScript and superScript.
 */
export function parseChemicalFormulaToRuns(
  rawText: string,
  baseStyle: BaseTextStyle = {}
): TextRun[] {
  if (!rawText) return [];

  const font = baseStyle.font || 'Arial';
  const size = baseStyle.size || 20;
  const runs: TextRun[] = [];

  // We scan the text character by character or chunk by chunk
  let currentBuffer = '';

  const flushBuffer = () => {
    if (currentBuffer) {
      runs.push(
        new TextRun({
          ...baseStyle,
          font,
          size,
          text: currentBuffer,
        })
      );
      currentBuffer = '';
    }
  };

  let i = 0;
  while (i < rawText.length) {
    const char = rawText[i];

    // Check for Unicode Subscript (e.g. ₄, ₂, ₆)
    if (UNICODE_SUBSCRIPTS[char]) {
      flushBuffer();
      runs.push(
        new TextRun({
          ...baseStyle,
          font,
          size,
          text: UNICODE_SUBSCRIPTS[char],
          subScript: true,
        })
      );
      i++;
      continue;
    }

    // Check for Unicode Superscript (e.g. ⁺, ⁻)
    if (UNICODE_SUPERSCRIPTS[char]) {
      flushBuffer();
      runs.push(
        new TextRun({
          ...baseStyle,
          font,
          size,
          text: UNICODE_SUPERSCRIPTS[char],
          superScript: true,
        })
      );
      i++;
      continue;
    }

    // Check for ASCII chemical subscript pattern: e.g. "C2H6", "CH4", "Cu(OH)2"
    // If previous char is an element symbol or closing parenthesis, and current is a digit
    // not followed by a letter or decimal point
    const prevChar = i > 0 ? rawText[i - 1] : '';
    const isPrevLetterOrParen = /[A-Za-z\)]/.test(prevChar);
    const isCurrentDigit = /\d/.test(char);
    const nextChar = i + 1 < rawText.length ? rawText[i + 1] : '';
    const isNextSpaceOrSymbol = /[\s\.,\-\/\+\)\(\]]/.test(nextChar) || nextChar === '';

    // If it's a chemical number like in CH4, C2H6
    if (isPrevLetterOrParen && isCurrentDigit && isNextSpaceOrSymbol && !prevChar.match(/\d/)) {
      flushBuffer();
      runs.push(
        new TextRun({
          ...baseStyle,
          font,
          size,
          text: char,
          subScript: true,
        })
      );
      i++;
      continue;
    }

    // Normal character
    currentBuffer += char;
    i++;
  }

  flushBuffer();
  return runs;
}

/**
 * Exports a Microsoft Word (.docx) document formatted identically to the online game:
 * 1. Clean student info and header
 * 2. Full-frame matrix table
 * 3. Cipher color legend with colored bullets (● T-Đỏ  ● R-Vàng ...) matching online layout
 * 4. 2-column answer options grid matching online option pill buttons
 */
export async function exportQuizAsWordDocx(
  quiz: QuizData,
  studentInfo?: StudentInfo,
  includeAnswerKey = false
) {
  const { title, subject, grade, secretMessage, matrix, questions } = quiz;
  const rows = matrix.rows || 16;
  const cols = matrix.cols || 16;
  const cipherColors = matrix.cipherColors || {};

  // Cell width in dxa (Standard printable width ~8800 dxa = 15.5 cm)
  const cellWidthDxa = Math.floor(8800 / cols);

  // 1. Build Matrix Table for Word
  const tableRows: TableRow[] = [];

  for (let r = 0; r < rows; r++) {
    const tableCells: TableCell[] = [];
    for (let c = 0; c < cols; c++) {
      const letter = (matrix.grid[r]?.[c] || ' ').toUpperCase();
      const cellQOrder = matrix.cellQuestionOrders?.[r]?.[c];
      const linkedQuestion = cellQOrder ? questions.find((q) => q.order === cellQOrder) : undefined;

      // Color shading if answer key mode
      let shadingObj = undefined;
      let isCellColored = false;
      if (includeAnswerKey) {
        let hex = linkedQuestion ? linkedQuestion.cipherColorHex : cipherColors[letter]?.hex;
        if (hex) {
          isCellColored = true;
          shadingObj = {
            fill: hex.replace('#', ''),
            type: ShadingType.CLEAR,
            color: 'auto',
          };
        }
      }

      tableCells.push(
        new TableCell({
          width: { size: cellWidthDxa, type: WidthType.DXA },
          shading: shadingObj,
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: isCellColored ? '444444' : 'CCCCCC' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: isCellColored ? '444444' : 'CCCCCC' },
            left: { style: BorderStyle.SINGLE, size: 1, color: isCellColored ? '444444' : 'CCCCCC' },
            right: { style: BorderStyle.SINGLE, size: 1, color: isCellColored ? '444444' : 'CCCCCC' },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 20, after: 20 },
              children: [
                new TextRun({
                  text: letter,
                  bold: true,
                  size: cols > 18 ? 15 : 18,
                  color: isCellColored ? 'FFFFFF' : '1F2937',
                  font: 'Arial',
                }),
              ],
            }),
          ],
        })
      );
    }
    tableRows.push(new TableRow({ children: tableCells }));
  }

  const matrixTable = new Table({
    rows: tableRows,
    alignment: AlignmentType.CENTER,
  });

  // 2. Build Cipher Legend Paragraphs matching online format:
  // "● T-Đỏ   ● R-Vàng   ● I-Xanh lá   ● A-Đỏ   ● N-Xanh lá   ● H-Tím   ● Y-Cam   ● C-Xanh dương   ● O-Hồng   ● B-Đỏ"
  const cipherLegendRuns: TextRun[] = [];
  questions.forEach((q, idx) => {
    const cleanHex = (q.cipherColorHex || '#ef4444').replace('#', '');

    // Colored circle bullet ●
    cipherLegendRuns.push(
      new TextRun({
        text: '● ',
        bold: true,
        size: 20,
        color: cleanHex,
        font: 'Arial',
      })
    );

    // Letter and Color name
    cipherLegendRuns.push(
      new TextRun({
        text: `${q.cipherLetter}-${q.cipherColorName}${idx < questions.length - 1 ? '    ' : ''}`,
        bold: true,
        size: 18,
        color: '374151',
        font: 'Arial',
      })
    );
  });

  const cipherLegendParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 140, after: 180 },
    children: [
      new TextRun({
        text: 'BẢNG MẬT MÃ MÀU:  ',
        bold: true,
        size: 18,
        color: '047857',
        font: 'Arial',
      }),
      ...cipherLegendRuns,
    ],
  });

  // 3. Build Questions and 2-Column Options Table matching online UI
  const questionBlocks: (Paragraph | Table)[] = [];

  questions.forEach((q) => {
    const cleanColorHex = (q.cipherColorHex || '#ef4444').replace('#', '');

    // Question header with online-style title without cipher badge
    const cleanedText = cleanQuestionTextForWord(q.questionText);
    const questionTextRuns = parseChemicalFormulaToRuns(cleanedText, {
      bold: true,
      size: 21,
      color: '111827',
      font: 'Arial',
    });

    questionBlocks.push(
      new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({
            text: `Câu ${q.order}. `,
            bold: true,
            color: '0369A1',
            size: 22,
            font: 'Arial',
          }),
          ...questionTextRuns,
        ],
      })
    );

    // Helper to render an option cell matching online pill button
    const renderOptionCell = (opt?: OptionItem, optIdx = 0): TableCell => {
      if (!opt) {
        return new TableCell({
          width: { size: 4400, type: WidthType.DXA },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [new Paragraph({})],
        });
      }

      const isCorrect = includeAnswerKey && q.correctOptionIndex === optIdx;
      const optLetter = opt.cipherLetter || String.fromCharCode(65 + optIdx);

      const optionContentRuns = parseChemicalFormulaToRuns(cleanQuestionTextForWord(opt.text), {
        size: 19,
        color: isCorrect ? '065F46' : '1F2937',
        bold: isCorrect,
        font: 'Arial',
      });

      return new TableCell({
        width: { size: 4400, type: WidthType.DXA },
        shading: {
          fill: isCorrect ? 'ECFDF5' : 'F9FAFB',
          type: ShadingType.CLEAR,
          color: 'auto',
        },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: isCorrect ? '059669' : 'D1D5DB' },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: isCorrect ? '059669' : 'D1D5DB' },
          left: { style: BorderStyle.SINGLE, size: 1, color: isCorrect ? '059669' : 'D1D5DB' },
          right: { style: BorderStyle.SINGLE, size: 1, color: isCorrect ? '059669' : 'D1D5DB' },
        },
        margins: {
          top: 80,
          bottom: 80,
          left: 140,
          right: 140,
        },
        children: [
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              // Circular badge like online: ( M ) or ( K )
              new TextRun({
                text: `( ${optLetter} ) `,
                bold: true,
                size: 20,
                color: isCorrect ? '047857' : '2563EB',
                font: 'Arial',
              }),
              ...optionContentRuns,
              ...(isCorrect
                ? [
                    new TextRun({
                      text: '  ✓',
                      bold: true,
                      size: 20,
                      color: '059669',
                      font: 'Arial',
                    }),
                  ]
                : []),
            ],
          }),
        ],
      });
    };

    // 2x2 grid of options (A, B on row 1; C, D on row 2) matching online question panel
    const optionsTable = new Table({
      width: { size: 8900, type: WidthType.DXA },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [
            renderOptionCell(q.options[0], 0),
            renderOptionCell(q.options[1], 1),
          ],
        }),
        new TableRow({
          children: [
            renderOptionCell(q.options[2], 2),
            renderOptionCell(q.options[3], 3),
          ],
        }),
      ],
    });

    questionBlocks.push(optionsTable);
  });

  // 4. Assemble Complete Document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 inch (1.27 cm)
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children: [
          // Header Student Info Row
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: 'Họ và tên: ................................................................    Lớp: ........................',
                bold: true,
                size: 20,
                color: '374151',
                font: 'Arial',
              }),
            ],
          }),

          // Main Header Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: includeAnswerKey
                  ? 'ĐÁP ÁN & MA TRẬN MÀU: GIẢI MÃ SẮC MÀU'
                  : 'PHIẾU HỌC TẬP: GIẢI MÃ SẮC MÀU',
                bold: true,
                size: 28,
                color: 'DC2626',
                font: 'Arial',
              }),
            ],
          }),

          // Lesson Subtitle Banner
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: title ? title.toUpperCase() : 'BÀI TẬP GIẢI MÃ SẮC MÀU',
                bold: true,
                size: 22,
                color: '1E40AF',
                font: 'Arial',
              }),
              new TextRun({
                text: subject || grade ? `  -  Môn: ${subject || '...'} (${grade || '...'})` : '',
                italics: true,
                size: 20,
                color: '4B5563',
                font: 'Arial',
              }),
            ],
          }),

          // Section I: Matrix Header
          new Paragraph({
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({
                text: includeAnswerKey
                  ? 'I. BẢNG MA TRẬN ĐÃ GIẢI MÃ HOÀN CHỈNH:'
                  : 'I. BẢNG MA TRẬN KÝ TỰ (Tô màu theo đáp án đúng bằng bút chì màu):',
                bold: true,
                size: 21,
                color: '047857',
                font: 'Arial',
              }),
            ],
          }),

          // The Matrix Table (Full-frame table)
          matrixTable,

          // The Cipher Color Legend (Identical to online format)
          cipherLegendParagraph,

          // Secret message banner if in answer key mode
          ...(includeAnswerKey && secretMessage
            ? [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 160 },
                  children: [
                    new TextRun({
                      text: `★ THÔNG ĐIỆP BÍ MẬT: "${secretMessage}" ★`,
                      bold: true,
                      size: 22,
                      color: 'B91C1C',
                      font: 'Arial',
                    }),
                  ],
                }),
              ]
            : []),

          // Section II: Question List Header
          new Paragraph({
            spacing: { before: 160, after: 80 },
            children: [
              new TextRun({
                text: 'II. CÂU HỎI TRẮC NGHIỆM (Chọn đáp án đúng để tô màu ma trận):',
                bold: true,
                size: 21,
                color: '047857',
                font: 'Arial',
              }),
            ],
          }),

          // 2-Column Question Cards
          ...questionBlocks,
        ],
      },
    ],
  });

  // Pack document to Blob and download
  const blob = await Packer.toBlob(doc);
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;

  const safeSubject = (subject || 'bai-tap')
    .replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/gi, '_')
    .toLowerCase();
  const filePrefix = includeAnswerKey ? 'dap-an' : 'phieu-bai-tap';
  a.download = `giai-ma-sac-mau-${filePrefix}-${safeSubject}.docx`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
