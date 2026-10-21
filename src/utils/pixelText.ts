import { MatrixGridConfig, Question } from '../types';

/**
 * 3x5 and 5x5 pixel bitmap font for rendering text into matrix grids
 */

// Simple 3x5 bitmap font representation for uppercase A-Z, 0-9, and spaces
export const PIXEL_FONT_3x5: Record<string, number[][]> = {
  'A': [
    [0, 1, 0],
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
  ],
  'B': [
    [1, 1, 0],
    [1, 0, 1],
    [1, 1, 0],
    [1, 0, 1],
    [1, 1, 0],
  ],
  'C': [
    [0, 1, 1],
    [1, 0, 0],
    [1, 0, 0],
    [1, 0, 0],
    [0, 1, 1],
  ],
  'D': [
    [1, 1, 0],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 0],
  ],
  'E': [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 0],
    [1, 0, 0],
    [1, 1, 1],
  ],
  'F': [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 0],
    [1, 0, 0],
    [1, 0, 0],
  ],
  'G': [
    [0, 1, 1],
    [1, 0, 0],
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 1],
  ],
  'H': [
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
  ],
  'I': [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1],
  ],
  'J': [
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
    [1, 0, 1],
    [0, 1, 0],
  ],
  'K': [
    [1, 0, 1],
    [1, 1, 0],
    [1, 0, 0],
    [1, 1, 0],
    [1, 0, 1],
  ],
  'L': [
    [1, 0, 0],
    [1, 0, 0],
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 1],
  ],
  'M': [
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
  ],
  'N': [
    [1, 1, 0],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
  ],
  'O': [
    [0, 1, 0],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 0],
  ],
  'P': [
    [1, 1, 0],
    [1, 0, 1],
    [1, 1, 0],
    [1, 0, 0],
    [1, 0, 0],
  ],
  'Q': [
    [0, 1, 0],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
  ],
  'R': [
    [1, 1, 0],
    [1, 0, 1],
    [1, 1, 0],
    [1, 0, 1],
    [1, 0, 1],
  ],
  'S': [
    [0, 1, 1],
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 0],
  ],
  'T': [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
  ],
  'U': [
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 0],
  ],
  'V': [
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 0],
  ],
  'W': [
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
  ],
  'X': [
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 0],
    [1, 0, 1],
    [1, 0, 1],
  ],
  'Y': [
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
  ],
  'Z': [
    [1, 1, 1],
    [0, 0, 1],
    [0, 1, 0],
    [1, 0, 0],
    [1, 1, 1],
  ],
  '0': [
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  '1': [
    [0, 1, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1],
  ],
  '2': [
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
  ],
  '3': [
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  '4': [
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
  ],
  '5': [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  '6': [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  '7': [
    [1, 1, 1],
    [0, 0, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
  ],
  '8': [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  '9': [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  ' ': [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
  '-': [
    [0, 0, 0],
    [0, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
    [0, 0, 0],
  ],
  '!': [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [0, 0, 0],
    [0, 1, 0],
  ],
  '♥': [
    [1, 0, 1],
    [1, 1, 1],
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0],
  ],
};

// Remove Vietnamese accents to match pixel font glyphs
export function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export interface QuestionCipherRef {
  order: number;
  cipherLetter: string;
  name: string;
  hex: string;
}

export interface Generated2LineResult {
  grid: string[][];
  cellQuestionOrders: (number | null)[][];
}

/**
 * Automatically computes optimal matrix grid dimensions (rows x cols)
 * to perfectly fit the specified text lines with balanced margins.
 */
export function calculateOptimalMatrixSize(
  line1: string,
  line2: string
): { rows: number; cols: number; width1: number; width2: number; totalWidth: number } {
  const clean1 = removeVietnameseAccents((line1 || '').trim().toUpperCase());
  const clean2 = removeVietnameseAccents((line2 || '').trim().toUpperCase());

  const getLineWidth = (text: string): number => {
    if (!text) return 0;
    let width = 0;
    for (const char of text) {
      const bitmap = PIXEL_FONT_3x5[char] || PIXEL_FONT_3x5[' '];
      const charWidth = bitmap ? bitmap[0].length : 3;
      width += charWidth + 1; // 1 space gap between glyphs
    }
    return width > 0 ? width - 1 : 0;
  };

  const width1 = getLineWidth(clean1);
  const width2 = getLineWidth(clean2);
  const maxTextWidth = Math.max(width1, width2);

  if (maxTextWidth === 0) {
    return { rows: 14, cols: 16, width1: 0, width2: 0, totalWidth: 0 };
  }

  // Horizontal padding: 2 cells on left, 2 cells on right (4 total)
  // Ensure cols dynamically fits the text completely so no letters are ever cut off
  const cols = Math.max(12, maxTextWidth + 4);

  // Vertical layout:
  // Each character is 5 pixels high.
  // 2 lines: 5 (line1) + 1 (line spacing) + 5 (line2) = 11 pixels high.
  // With 2 top and 2 bottom padding: 11 + 4 = 15 rows.
  // 1 line: 5 pixels high. With 2 top/bottom padding: 5 + 4 = 9 to 10 rows.
  const textHeight = clean1 && clean2 ? 11 : clean1 || clean2 ? 5 : 8;
  const rows = Math.max(10, textHeight + 4);

  return { rows, cols, width1, width2, totalWidth: maxTextWidth };
}

/**
 * Creates a matrix grid with 2 lines of text rendered in pixel font.
 * Automatically distributes the characters across available questions
 * so each question unlocks its specific letters in its designated color!
 */
export function generate2LineTextMatrix(
  line1: string,
  line2: string,
  targetRows: number,
  targetCols: number,
  defaultCipherLetter: string,
  fillerLetters: string[],
  questionsList?: QuestionCipherRef[]
): Generated2LineResult {
  const clean1 = removeVietnameseAccents(line1.trim().toUpperCase());
  const clean2 = removeVietnameseAccents(line2.trim().toUpperCase());

  // Automatically guarantee dimensions are at least large enough to fit all characters
  const optimal = calculateOptimalMatrixSize(line1, line2);
  const actualCols = Math.max(targetCols, optimal.totalWidth + 2);
  const actualRows = Math.max(targetRows, (clean1 && clean2 ? 11 : 5) + 2);

  // Initialize grid with random fillers
  const grid: string[][] = Array.from({ length: actualRows }, () =>
    Array.from({ length: actualCols }, () =>
      fillerLetters[Math.floor(Math.random() * fillerLetters.length)]
    )
  );

  const cellQuestionOrders: (number | null)[][] = Array.from({ length: actualRows }, () =>
    Array.from({ length: actualCols }, () => null)
  );

  // Count total non-space characters across both lines
  const totalLetters1 = clean1.replace(/\s+/g, '').length;
  const totalLetters2 = clean2.replace(/\s+/g, '').length;
  const totalLetters = totalLetters1 + totalLetters2;

  let currentLetterCounter = 0;

  // Function to render one line of text centered at a given startRow
  const renderLine = (text: string, startRow: number) => {
    if (!text) return;

    // Calculate total width of characters
    let totalWidth = 0;
    const charItems: { char: string; bitmap: number[][] }[] = [];

    for (const char of text) {
      const bitmap = PIXEL_FONT_3x5[char] || PIXEL_FONT_3x5[' '];
      charItems.push({ char, bitmap });
      const charWidth = bitmap[0].length;
      totalWidth += charWidth + 1; // 1 space between chars
    }
    if (totalWidth > 0) totalWidth -= 1; // remove trailing space

    // Center horizontally
    let startCol = Math.max(0, Math.floor((actualCols - totalWidth) / 2));

    for (const item of charItems) {
      const { char, bitmap } = item;
      const charWidth = bitmap[0].length;

      let assignedQuestion: QuestionCipherRef | null = null;
      if (char !== ' ' && questionsList && questionsList.length > 0) {
        const qIdx = Math.min(
          questionsList.length - 1,
          Math.floor((currentLetterCounter * questionsList.length) / Math.max(1, totalLetters))
        );
        assignedQuestion = questionsList[qIdx];
        currentLetterCounter++;
      }

      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < charWidth; c++) {
          if (bitmap[r]?.[c] === 1) {
            const gridR = startRow + r;
            const gridC = startCol + c;
            if (gridR >= 0 && gridR < actualRows && gridC >= 0 && gridC < actualCols) {
              // The letter displayed in this cell:
              // Use assigned question's cipher letter so all letters needing color are displayed on the grid!
              grid[gridR][gridC] = assignedQuestion ? assignedQuestion.cipherLetter : (char !== ' ' ? char : defaultCipherLetter);
              // Link to question order
              if (assignedQuestion) {
                cellQuestionOrders[gridR][gridC] = assignedQuestion.order;
              }
            }
          }
        }
      }
      startCol += charWidth + 1;
    }
  };

  // Position line 1 and line 2 vertically
  if (clean1 && clean2) {
    const spacing = 1;
    const totalHeight = 5 + spacing + 5;
    const startRow = Math.max(1, Math.floor((actualRows - totalHeight) / 2));
    renderLine(clean1, startRow);
    renderLine(clean2, startRow + 5 + spacing);
  } else if (clean1) {
    const startRow = Math.max(1, Math.floor((actualRows - 5) / 2));
    renderLine(clean1, startRow);
  } else if (clean2) {
    const startRow = Math.max(1, Math.floor((actualRows - 5) / 2));
    renderLine(clean2, startRow);
  }

  return { grid, cellQuestionOrders };
}

/**
 * Ensures that EVERY question in the quiz has its cipher letter present and colorable in the matrix.
 * If any question has 0 cells in the matrix, places them onto available background cells.
 */
export function ensureAllQuestionsInMatrix(
  matrix: MatrixGridConfig,
  questions: Question[]
): MatrixGridConfig {
  if (!questions || questions.length === 0) return matrix;

  const rows = matrix.rows || matrix.grid.length || 16;
  const cols = matrix.cols || matrix.grid[0]?.length || 16;
  // Ensure grid has full rows and cols
  const FILLERS = ['P', 'U', 'Q', 'E', 'K', 'W', 'G', 'X', 'Z', 'J', 'F', 'V', 'M', 'D', 'S', 'L'];
  const newGrid: string[][] = [];
  const newOrders: (number | null)[][] = [];

  for (let r = 0; r < rows; r++) {
    const rowLetters: string[] = [];
    const rowOrders: (number | null)[] = [];
    for (let c = 0; c < cols; c++) {
      const origChar = matrix.grid?.[r]?.[c];
      const validChar = origChar && origChar.trim() ? origChar.toUpperCase() : FILLERS[(r * cols + c) % FILLERS.length];
      rowLetters.push(validChar);
      const origOrder = matrix.cellQuestionOrders?.[r]?.[c];
      rowOrders.push(origOrder !== undefined ? origOrder : null);
    }
    newGrid.push(rowLetters);
    newOrders.push(rowOrders);
  }

  // Count existing cells for each question
  const questionCellCount: Record<number, number> = {};
  questions.forEach((q) => {
    questionCellCount[q.order] = 0;
  });

  // Step 1: Count cells explicitly linked by order
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ord = newOrders[r][c];
      if (ord !== null && questionCellCount[ord] !== undefined) {
        questionCellCount[ord]++;
      }
    }
  }

  // Step 2: For any question with 0 or few cells, check if existing grid cells match its cipher letter
  questions.forEach((q) => {
    const letter = q.cipherLetter.toUpperCase();
    if (questionCellCount[q.order] < 2) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (newOrders[r][c] === null && newGrid[r][c] === letter) {
            newOrders[r][c] = q.order;
            questionCellCount[q.order]++;
            if (questionCellCount[q.order] >= 3) break;
          }
        }
        if (questionCellCount[q.order] >= 3) break;
      }
    }
  });

  // Step 3: Find remaining background positions (cells with no question assigned)
  const bgPositions: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newOrders[r][c] === null) {
        bgPositions.push([r, c]);
      }
    }
  }

  // Step 4: For any question that still has fewer than 3 cells, place its cipher letter
  // onto background cells and link its order, ensuring ALL cipher letters are visible on the grid!
  questions.forEach((q) => {
    const targetCount = Math.min(4, Math.max(2, Math.floor(bgPositions.length / Math.max(1, questions.length))));
    while (questionCellCount[q.order] < targetCount && bgPositions.length > 0) {
      // Pick a random background index to scatter natural distribution
      const idx = Math.floor(Math.random() * bgPositions.length);
      const [r, c] = bgPositions.splice(idx, 1)[0];
      newGrid[r][c] = q.cipherLetter.toUpperCase();
      newOrders[r][c] = q.order;
      questionCellCount[q.order]++;
    }
  });

  // Ensure cipherColors contains all questions' cipher letters
  const cipherColors = { ...(matrix.cipherColors || {}) };
  questions.forEach((q) => {
    cipherColors[q.cipherLetter] = {
      name: q.cipherColorName,
      hex: q.cipherColorHex,
    };
  });

  return {
    ...matrix,
    rows,
    cols,
    grid: newGrid,
    cellQuestionOrders: newOrders,
    cipherColors,
  };
}

/**
 * Creates an optimal matrix auto-sized to the secret message or topic
 * ensuring ALL questions are properly rendered and distributed.
 */
export function createAutoFittedMatrixForQuestions(
  questions: Question[],
  secretMessageOrTitle = 'ALKENE'
): MatrixGridConfig {
  const cleanMsg = removeVietnameseAccents(secretMessageOrTitle.trim().toUpperCase());
  let l1 = 'ALKENE';
  let l2 = '';

  const words = cleanMsg.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const mid = Math.ceil(words.length / 2);
    l1 = words.slice(0, mid).join(' ');
    l2 = words.slice(mid).join(' ');
  } else if (cleanMsg.length > 6) {
    const mid = Math.ceil(cleanMsg.length / 2);
    l1 = cleanMsg.slice(0, mid);
    l2 = cleanMsg.slice(mid);
  } else if (cleanMsg.length > 0) {
    l1 = cleanMsg;
    l2 = '';
  }

  const optimal = calculateOptimalMatrixSize(l1, l2);
  const questionsList: QuestionCipherRef[] = questions.map((q) => ({
    order: q.order,
    cipherLetter: q.cipherLetter,
    name: q.cipherColorName,
    hex: q.cipherColorHex,
  }));

  const FILLERS = ['P', 'U', 'Q', 'W', 'G', 'X', 'Z', 'J', 'F', 'V', 'M', 'D', 'S', 'L'];
  const { grid, cellQuestionOrders } = generate2LineTextMatrix(
    l1,
    l2,
    optimal.rows,
    optimal.cols,
    questions[0]?.cipherLetter || 'T',
    FILLERS,
    questionsList
  );

  const cipherColors: Record<string, { name: string; hex: string }> = {};
  questions.forEach((q) => {
    cipherColors[q.cipherLetter] = {
      name: q.cipherColorName,
      hex: q.cipherColorHex,
    };
  });

  const matrixConfig: MatrixGridConfig = {
    rows: optimal.rows,
    cols: optimal.cols,
    grid,
    cellQuestionOrders,
    cipherColors,
  };

  return ensureAllQuestionsInMatrix(matrixConfig, questions);
}
