import React, { useState, useRef } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Copy,
  Eye,
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cpu,
  Layers,
  Sparkles,
  X,
  Image as ImageIcon,
  Scale,
  BarChart2,
  Zap,
  ChevronDown,
  Info
} from 'lucide-react';
import { HardwareAnimationType, QuestionItem } from '../../types/quiz';
import { HardwareAnimation } from '../animations/HardwareAnimation';

const ANIMATION_TYPES: HardwareAnimationType[] = [
  'RESISTOR',
  'CAPACITOR',
  'LED',
  'TRANSISTOR',
  'DIODE',
  'RELAY',
  'ARDUINO',
  'ESP32',
  'ULTRASONIC_SENSOR',
  'IR_SENSOR',
  'LDR',
  'SERVO',
  'DC_MOTOR',
  'BUZZER',
  'IC',
  'LOGIC_GATE',
  'PCB',
  'OSCILLOSCOPE',
  'BREADBOARD',
];

interface AdminQuestionsProps {
  questions: QuestionItem[];
  onSaveQuestion: (question: Partial<QuestionItem>) => Promise<void>;
  onDeleteQuestion: (questionId: string) => Promise<void>;
  onSeedQuestions: () => Promise<void>;
  onBatchImportQuestions?: (questions: Partial<QuestionItem>[]) => Promise<void>;
}

/**
 * Escapes values for standard RFC 4180 CSV compliance
 */
function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Generates CSV string representing questions or starter template
 */
function generateCsvContent(questionsToExport: QuestionItem[], templateOnly = false): string {
  const headers = [
    'id',
    'questionText',
    'optionA',
    'optionB',
    'optionC',
    'optionD',
    'correctAnswer',
    'category',
    'difficulty',
    'animationType',
    'explanation',
    'imageUrl'
  ];

  if (templateOnly || questionsToExport.length === 0) {
    const sampleRows = [
      [
        escapeCsvCell('q_sample_01'),
        escapeCsvCell('What is the forward voltage drop of a standard red 5mm LED?'),
        escapeCsvCell('0.7V'),
        escapeCsvCell('1.8V to 2.2V'),
        escapeCsvCell('3.3V'),
        escapeCsvCell('5.0V'),
        escapeCsvCell('B'),
        escapeCsvCell('Semiconductors'),
        escapeCsvCell('EASY'),
        escapeCsvCell('LED'),
        escapeCsvCell('Standard red gallium arsenide phosphide LEDs operate with a 1.8V to 2.2V forward drop.'),
        escapeCsvCell('')
      ].join(','),
      [
        escapeCsvCell('q_sample_02'),
        escapeCsvCell('Which pin on an ATmega328P (Arduino Uno) supports hardware PWM output?'),
        escapeCsvCell('Pin 2'),
        escapeCsvCell('Pin 4'),
        escapeCsvCell('Pin 9'),
        escapeCsvCell('Pin 12'),
        escapeCsvCell('C'),
        escapeCsvCell('Microcontrollers'),
        escapeCsvCell('MEDIUM'),
        escapeCsvCell('ARDUINO'),
        escapeCsvCell('Pins 3, 5, 6, 9, 10, and 11 provide 8-bit PWM output via timer compare registers.'),
        escapeCsvCell('')
      ].join(','),
      [
        escapeCsvCell('q_sample_03'),
        escapeCsvCell('In high-speed PCB routing, what is the critical characteristic impedance for USB 2.0 differential pairs?'),
        escapeCsvCell('50 Ohms single-ended'),
        escapeCsvCell('75 Ohms single-ended'),
        escapeCsvCell('90 Ohms differential'),
        escapeCsvCell('120 Ohms differential'),
        escapeCsvCell('C'),
        escapeCsvCell('PCB & Prototyping'),
        escapeCsvCell('HARD'),
        escapeCsvCell('PCB'),
        escapeCsvCell('USB 2.0 D+/D- lines require a tightly coupled 90 Ohm (+/-15%) differential impedance.'),
        escapeCsvCell('')
      ].join(',')
    ];
    return [headers.join(','), ...sampleRows].join('\r\n');
  }

  const rows = questionsToExport.map((q) =>
    [
      escapeCsvCell(q.id || ''),
      escapeCsvCell(q.questionText || ''),
      escapeCsvCell(q.optionA || ''),
      escapeCsvCell(q.optionB || ''),
      escapeCsvCell(q.optionC || ''),
      escapeCsvCell(q.optionD || ''),
      escapeCsvCell(q.correctAnswer || 'A'),
      escapeCsvCell(q.category || 'General Hardware'),
      escapeCsvCell(q.difficulty || 'MEDIUM'),
      escapeCsvCell(q.animationType || 'IC'),
      escapeCsvCell(q.explanation || ''),
      escapeCsvCell(q.imageUrl || '')
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Browser file download helper
 */
function triggerBrowserDownload(csvText: string, filename: string) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Robust RFC 4180 CSV parser handling multiline strings & quoted commas
 */
function parseCsv(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // Skip escaped quote
        } else {
          insideQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        // Carriage return ignored
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  return rows.filter((r) => r.length > 0 && r.some((cell) => cell.length > 0));
}

export const AdminQuestions: React.FC<AdminQuestionsProps> = ({
  questions,
  onSaveQuestion,
  onDeleteQuestion,
  onSeedQuestions,
  onBatchImportQuestions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');
  const [editingQuestion, setEditingQuestion] = useState<Partial<QuestionItem> | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<QuestionItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // CSV Template & Bulk Upload State
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [parsedImportQuestions, setParsedImportQuestions] = useState<Partial<QuestionItem>[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(questions.map((q) => q.category).filter(Boolean)))];

  // Difficulty distribution telemetry
  const totalQuestions = questions.length;
  const easyCount = questions.filter((q) => q.difficulty === 'EASY').length;
  const mediumCount = questions.filter((q) => q.difficulty === 'MEDIUM').length;
  const hardCount = questions.filter((q) => q.difficulty === 'HARD').length;

  const easyPct = totalQuestions > 0 ? Math.round((easyCount / totalQuestions) * 100) : 0;
  const mediumPct = totalQuestions > 0 ? Math.round((mediumCount / totalQuestions) * 100) : 0;
  const hardPct = totalQuestions > 0 ? Math.max(0, 100 - easyPct - mediumPct) : 0;

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === 'ALL' || q.category === filterCategory;
    const matchesDiff = filterDifficulty === 'ALL' || q.difficulty === filterDifficulty;
    return matchesSearch && matchesCat && matchesDiff;
  });

  const handleStartCreate = () => {
    setIsNew(true);
    setEditingQuestion({
      id: `q_${Date.now()}`,
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      category: 'Passive Components',
      difficulty: 'EASY',
      animationType: 'RESISTOR',
      active: true,
      explanation: '',
    });
  };

  const handleStartEdit = (q: QuestionItem) => {
    setIsNew(false);
    setEditingQuestion({ ...q });
  };

  const handleDuplicate = (q: QuestionItem) => {
    setIsNew(true);
    setEditingQuestion({
      ...q,
      id: `q_${Date.now()}`,
      questionText: `${q.questionText} (Copy)`,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingQuestion) return;

    // Read as Data URL for local preview and storage
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setEditingQuestion((prev) => (prev ? { ...prev, imageUrl: result } : null));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !editingQuestion.questionText) return;

    try {
      setSaving(true);
      await onSaveQuestion(editingQuestion);
      setEditingQuestion(null);
      setIsNew(false);
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerSeed = async () => {
    try {
      setSeeding(true);
      await onSeedQuestions();
    } finally {
      setSeeding(false);
    }
  };

  // ----------------------------------------------------
  // CSV TEMPLATE DOWNLOAD & BULK IMPORT LOGIC
  // ----------------------------------------------------

  const handleDownloadFullBankCsv = () => {
    const csv = generateCsvContent(questions, false);
    triggerBrowserDownload(csv, `AEC_Hardware_Question_Bank_${questions.length}_Questions.csv`);
    setDownloadMenuOpen(false);
  };

  const handleDownloadBlankTemplate = () => {
    const csv = generateCsvContent([], true);
    triggerBrowserDownload(csv, 'AEC_Hardware_Question_Bank_Template.csv');
    setDownloadMenuOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      try {
        const rawRows = parseCsv(text);
        if (rawRows.length < 2) {
          alert('CSV file appears empty or missing question rows.');
          return;
        }

        const headers = rawRows[0].map((h) => h.toLowerCase().replace(/[^a-z]/g, ''));
        const findCol = (...names: string[]) => {
          for (const name of names) {
            const idx = headers.indexOf(name);
            if (idx !== -1) return idx;
          }
          return -1;
        };

        const colText = findCol('questiontext', 'question', 'text', 'title');
        const colA = findCol('optiona', 'a', 'choicea');
        const colB = findCol('optionb', 'b', 'choiceb');
        const colC = findCol('optionc', 'c', 'choicec');
        const colD = findCol('optiond', 'd', 'choiced');
        const colAnswer = findCol('correctanswer', 'answer', 'correct', 'ans');
        const colCategory = findCol('category', 'cat', 'topic');
        const colDifficulty = findCol('difficulty', 'diff', 'level');
        const colAnim = findCol('animationtype', 'animation', 'component');
        const colExplanation = findCol('explanation', 'reason', 'solution');
        const colId = findCol('id', 'qid');

        if (colText === -1 || colA === -1 || colB === -1 || colC === -1 || colD === -1) {
          alert(
            'Missing essential columns in CSV! Ensure columns for questionText, optionA, optionB, optionC, optionD exist.'
          );
          return;
        }

        const parsed: Partial<QuestionItem>[] = [];
        const errors: string[] = [];

        for (let i = 1; i < rawRows.length; i++) {
          const row = rawRows[i];
          const questionText = row[colText]?.trim();
          const optionA = row[colA]?.trim();
          const optionB = row[colB]?.trim();
          const optionC = row[colC]?.trim();
          const optionD = row[colD]?.trim();

          if (!questionText) {
            continue; // Skip blank rows
          }

          if (!optionA || !optionB || !optionC || !optionD) {
            errors.push(`Row ${i + 1}: Question "${questionText.slice(0, 30)}..." is missing one or more options.`);
            continue;
          }

          // Normalize answer
          let rawAns = (colAnswer !== -1 ? row[colAnswer] : 'A')?.trim().toUpperCase();
          if (!['A', 'B', 'C', 'D'].includes(rawAns)) {
            rawAns = 'A';
          }
          const correctAnswer = rawAns as 'A' | 'B' | 'C' | 'D';

          // Normalize difficulty
          let rawDiff = (colDifficulty !== -1 ? row[colDifficulty] : 'MEDIUM')?.trim().toUpperCase();
          if (!['EASY', 'MEDIUM', 'HARD'].includes(rawDiff)) {
            rawDiff = 'MEDIUM';
          }
          const difficulty = rawDiff as 'EASY' | 'MEDIUM' | 'HARD';

          // Normalize animation type
          let rawAnim = (colAnim !== -1 ? row[colAnim] : 'IC')?.trim().toUpperCase() as HardwareAnimationType;
          if (!ANIMATION_TYPES.includes(rawAnim)) {
            rawAnim = 'IC';
          }

          const category = (colCategory !== -1 ? row[colCategory] : 'Hardware General')?.trim() || 'General Hardware';
          const explanation = (colExplanation !== -1 ? row[colExplanation] : '')?.trim();
          const id = (colId !== -1 && row[colId]?.trim()) || `q_${Date.now()}_${i}`;

          parsed.push({
            id,
            questionText,
            optionA,
            optionB,
            optionC,
            optionD,
            correctAnswer,
            category,
            difficulty,
            animationType: rawAnim,
            explanation,
            active: true,
          });
        }

        setParsedImportQuestions(parsed);
        setImportErrors(errors);
        setImportModalOpen(true);
      } catch (err: any) {
        alert(`Failed to parse CSV file: ${err.message || 'Unknown format error'}`);
      }
    };
    reader.readAsText(file);

    // Reset file input value so user can re-upload same file if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (parsedImportQuestions.length === 0) return;

    try {
      setIsImporting(true);
      if (onBatchImportQuestions) {
        await onBatchImportQuestions(parsedImportQuestions);
      } else {
        // Fallback sequential save
        for (const q of parsedImportQuestions) {
          await onSaveQuestion(q);
        }
      }
      setImportModalOpen(false);
      setParsedImportQuestions([]);
      alert(`Successfully imported ${parsedImportQuestions.length} questions into the Question Bank!`);
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for CSV upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv,text/csv"
        className="hidden"
      />

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
        <div>
          <h1 className="text-2xl font-black text-white uppercase">Question Bank</h1>
          <p className="font-mono text-xs text-slate-400 mt-1">
            Total Bank: {questions.length} Questions (25 randomly drawn per attempt)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Download CSV Template Split Button */}
          <div className="relative">
            <button
              onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 text-xs font-mono text-emerald-300 hover:text-emerald-200 transition cursor-pointer shadow-sm"
              title="Download question bank or starter template as CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>DOWNLOAD CSV TEMPLATE</span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
            </button>

            {downloadMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#090f14] border border-emerald-500/30 p-2 shadow-2xl z-40 text-xs font-mono space-y-1">
                <button
                  onClick={handleDownloadFullBankCsv}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-950/40 text-slate-200 hover:text-emerald-300 transition flex items-start gap-2.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Current Question Bank CSV</span>
                    <span className="text-[10px] text-slate-400">
                      Exports all {questions.length} questions formatted as spreadsheet template
                    </span>
                  </div>
                </button>

                <button
                  onClick={handleDownloadBlankTemplate}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-950/40 text-slate-200 hover:text-emerald-300 transition flex items-start gap-2.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Blank Starter Template</span>
                    <span className="text-[10px] text-slate-400">
                      Headers with 3 reference sample rows (Easy, Med, Hard)
                    </span>
                  </div>
                </button>

                <div className="border-t border-slate-800 my-1 pt-1">
                  <button
                    onClick={() => {
                      setDownloadMenuOpen(false);
                      setShowGuideModal(true);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition flex items-center gap-2 cursor-pointer text-[11px]"
                  >
                    <Info className="w-3.5 h-3.5 text-amber-400" />
                    <span>View CSV Column Schema & Rules</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Upload CSV Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 hover:border-cyan-400 text-xs font-mono text-cyan-300 hover:text-cyan-200 transition cursor-pointer shadow-sm"
            title="Upload CSV questions spreadsheet from Excel or Google Sheets"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>IMPORT CSV</span>
          </button>

          {/* Re-seed 42 Defaults */}
          <button
            onClick={handleTriggerSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-mono text-slate-300 hover:text-white transition disabled:opacity-50 cursor-pointer"
            title="Seed 42 comprehensive hardware questions"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{seeding ? 'SEEDING...' : 'RE-SEED 42'}</span>
          </button>

          {/* Add Single Question */}
          <button
            onClick={handleStartCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs tracking-wider transition shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ADD QUESTION</span>
          </button>
        </div>
      </div>

      {/* Visual Difficulty Distribution & Bank Balance Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#090f14] border border-emerald-500/25 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider block">
                DIFFICULTY DISTRIBUTION & BALANCE RADAR
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                {totalQuestions} Active Questions • Authoritative Pool Health
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">TARGET RATIO:</span>
            <span className="text-emerald-400 font-bold">30% EASY</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-bold">50% MED</span>
            <span className="text-slate-600">•</span>
            <span className="text-rose-400 font-bold">20% HARD</span>
          </div>
        </div>

        {/* Visual Segmented Progress Bar */}
        <div className="w-full h-4 rounded-full bg-slate-950 overflow-hidden flex p-0.5 gap-0.5 border border-slate-800 shadow-inner mb-4">
          {easyPct > 0 && (
            <div
              style={{ width: `${easyPct}%` }}
              className="h-full rounded-l-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all duration-500"
              title={`Easy: ${easyCount} questions (${easyPct}%)`}
            />
          )}
          {mediumPct > 0 && (
            <div
              style={{ width: `${mediumPct}%` }}
              className={`h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-all duration-500 ${
                easyPct === 0 ? 'rounded-l-full' : ''
              } ${hardPct === 0 ? 'rounded-r-full' : ''}`}
              title={`Medium: ${mediumCount} questions (${mediumPct}%)`}
            />
          )}
          {hardPct > 0 && (
            <div
              style={{ width: `${hardPct}%` }}
              className="h-full rounded-r-full bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.5)] transition-all duration-500"
              title={`Hard: ${hardCount} questions (${hardPct}%)`}
            />
          )}
        </div>

        {/* Interactive Color-Coded Filter Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          {/* Easy Pill */}
          <button
            type="button"
            onClick={() => setFilterDifficulty(filterDifficulty === 'EASY' ? 'ALL' : 'EASY')}
            className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer select-none ${
              filterDifficulty === 'EASY'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400'
                : 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60 text-slate-300'
            }`}
            title="Click to filter repository to EASY questions"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
              <div>
                <span className="font-bold text-emerald-400 block">EASY (LV.1)</span>
                <span className="text-[10px] text-slate-400">Fundamental concepts</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black text-white text-base">{easyCount}</span>
              <span className="text-[10px] text-slate-400 block font-semibold">{easyPct}%</span>
            </div>
          </button>

          {/* Medium Pill */}
          <button
            type="button"
            onClick={() => setFilterDifficulty(filterDifficulty === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
            className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer select-none ${
              filterDifficulty === 'MEDIUM'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-400'
                : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60 text-slate-300'
            }`}
            title="Click to filter repository to MEDIUM questions"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]" />
              <div>
                <span className="font-bold text-amber-400 block">MEDIUM (LV.2)</span>
                <span className="text-[10px] text-slate-400">Applied circuit analysis</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black text-white text-base">{mediumCount}</span>
              <span className="text-[10px] text-slate-400 block font-semibold">{mediumPct}%</span>
            </div>
          </button>

          {/* Hard Pill */}
          <button
            type="button"
            onClick={() => setFilterDifficulty(filterDifficulty === 'HARD' ? 'ALL' : 'HARD')}
            className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer select-none ${
              filterDifficulty === 'HARD'
                ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)] ring-1 ring-rose-400'
                : 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60 text-slate-300'
            }`}
            title="Click to filter repository to HARD questions"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_10px_#f43f5e]" />
              <div>
                <span className="font-bold text-rose-400 block">HARD (LV.3)</span>
                <span className="text-[10px] text-slate-400">Complex timings & MCUs</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black text-white text-base">{hardCount}</span>
              <span className="text-[10px] text-slate-400 block font-semibold">{hardPct}%</span>
            </div>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions or categories..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080d12] border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-[#080d12] border border-slate-800 text-slate-300 font-mono text-xs focus:outline-none focus:border-emerald-400"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'ALL' ? 'All Categories' : c}
            </option>
          ))}
        </select>

        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-[#080d12] border border-slate-800 text-slate-300 font-mono text-xs focus:outline-none focus:border-emerald-400"
        >
          <option value="ALL">All Difficulties</option>
          <option value="EASY">EASY</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HARD">HARD</option>
        </select>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center bg-[#080d12] rounded-2xl border border-slate-800">
            <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-mono text-xs text-slate-500">NO QUESTIONS MATCH CRITERIA</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isEasy = q.difficulty === 'EASY';
            const isMedium = q.difficulty === 'MEDIUM';
            const isHard = q.difficulty === 'HARD';

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl bg-[#080d12] border border-slate-800/80 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isEasy
                    ? 'border-l-4 border-l-emerald-400'
                    : isMedium
                    ? 'border-l-4 border-l-amber-400'
                    : 'border-l-4 border-l-rose-500'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {q.category}
                    </span>

                    {/* Color-Coded Difficulty Indicator Badge */}
                    {isEasy ? (
                      <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 font-bold flex items-center gap-1.5 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>EASY • LV.1</span>
                      </span>
                    ) : isMedium ? (
                      <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/35 font-bold flex items-center gap-1.5 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>MEDIUM • LV.2</span>
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/35 font-bold flex items-center gap-1.5 shadow-[0_0_8px_rgba(244,63,94,0.2)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                        <span>HARD • LV.3</span>
                      </span>
                    )}

                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-500/30">
                      ANIM: {q.animationType}
                    </span>
                    {q.imageUrl && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> IMAGE
                      </span>
                    )}
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">
                      ANSWER: {q.correctAnswer}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-white leading-relaxed">{q.questionText}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-slate-400">
                    <span className={q.correctAnswer === 'A' ? 'text-emerald-400 font-bold' : ''}>
                      A: {q.optionA}
                    </span>
                    <span className={q.correctAnswer === 'B' ? 'text-emerald-400 font-bold' : ''}>
                      B: {q.optionB}
                    </span>
                    <span className={q.correctAnswer === 'C' ? 'text-emerald-400 font-bold' : ''}>
                      C: {q.optionC}
                    </span>
                    <span className={q.correctAnswer === 'D' ? 'text-emerald-400 font-bold' : ''}>
                      D: {q.optionD}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                  <button
                    onClick={() => setPreviewQuestion(q)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
                    title="Live Simulation Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(q)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
                    title="Duplicate Question"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStartEdit(q)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 transition cursor-pointer"
                    title="Edit Question"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteQuestion(q.id)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-400 transition cursor-pointer"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit / Create Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-[#090f14] border border-emerald-500/30 p-6 text-slate-100 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="font-mono text-sm font-bold text-white uppercase">
                {isNew ? 'CREATE NEW HARDWARE MCQ' : 'EDIT MCQ SPECIFICATION'}
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-1 hover:text-rose-400 text-slate-400 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 uppercase mb-1">Question Statement</label>
                <textarea
                  required
                  rows={3}
                  value={editingQuestion.questionText || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                  placeholder="Enter the question text..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Option A</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.optionA || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, optionA: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Option B</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.optionB || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, optionB: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Option C</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.optionC || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, optionC: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Option D</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.optionD || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, optionD: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Correct Answer & Difficulty & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Correct Answer</label>
                  <select
                    value={editingQuestion.correctAnswer || 'A'}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        correctAnswer: e.target.value as 'A' | 'B' | 'C' | 'D',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold font-mono text-xs"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase mb-1">Difficulty Level</label>
                  <select
                    value={editingQuestion.difficulty || 'MEDIUM'}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        difficulty: e.target.value as 'EASY' | 'MEDIUM' | 'HARD',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-bold font-mono text-xs"
                  >
                    <option value="EASY">EASY (LV.1)</option>
                    <option value="MEDIUM">MEDIUM (LV.2)</option>
                    <option value="HARD">HARD (LV.3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase mb-1">Category / Domain</label>
                  <input
                    type="text"
                    value={editingQuestion.category || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                    placeholder="e.g. Microcontrollers"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Animation Preset Selection & Tinkercad / 3D Asset URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Hardware 3D Model Preset</label>
                  <select
                    value={editingQuestion.animationType || 'IC'}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        animationType: e.target.value as HardwareAnimationType,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs"
                  >
                    {ANIMATION_TYPES.map((anim) => (
                      <option key={anim} value={anim}>
                        {anim}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase mb-1">
                    Tinkercad 3D Embed / GLTF Source (Optional)
                  </label>
                  <input
                    type="url"
                    value={editingQuestion.animationAssetUrl || ''}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        animationAssetUrl: e.target.value || undefined,
                      })
                    }
                    placeholder="https://www.tinkercad.com/embed/... or .glb"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Optional Circuit Image Upload */}
              <div>
                <label className="block text-slate-400 uppercase mb-1">Circuit Schematic Image (Optional)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-mono file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer"
                  />
                  {editingQuestion.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setEditingQuestion({ ...editingQuestion, imageUrl: undefined })}
                      className="text-xs text-rose-400 hover:underline cursor-pointer"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
                {editingQuestion.imageUrl && (
                  <div className="mt-2 p-2 bg-slate-950 rounded-xl border border-slate-800 max-w-xs">
                    <img
                      src={editingQuestion.imageUrl}
                      alt="Schematic Preview"
                      className="max-h-32 object-contain rounded"
                    />
                  </div>
                )}
              </div>

              {/* Explanation for admin review */}
              <div>
                <label className="block text-slate-400 uppercase mb-1">Technical Explanation</label>
                <input
                  type="text"
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  placeholder="Reference formulas, pinouts, or theory..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 font-mono text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs tracking-wider cursor-pointer"
                >
                  {saving ? 'SAVING...' : 'SAVE QUESTION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Import Review Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-[#090f14] border border-cyan-500/40 p-6 text-slate-100 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-mono text-sm font-bold text-white uppercase">
                    CSV BULK IMPORT REVIEW // {importFileName}
                  </h3>
                  <p className="font-mono text-xs text-slate-400">
                    Verify parsed questions and difficulty balance before writing to repository
                  </p>
                </div>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1 hover:text-rose-400 text-slate-400 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Import Summary & Telemetry */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">TOTAL VALID</span>
                <span className="text-xl font-bold text-white">{parsedImportQuestions.length} MCQs</span>
              </div>
              <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/30">
                <span className="text-emerald-400 block text-[10px] uppercase">EASY (LV.1)</span>
                <span className="text-xl font-bold text-emerald-300">
                  {parsedImportQuestions.filter((q) => q.difficulty === 'EASY').length}
                </span>
              </div>
              <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-500/30">
                <span className="text-amber-400 block text-[10px] uppercase">MEDIUM (LV.2)</span>
                <span className="text-xl font-bold text-amber-300">
                  {parsedImportQuestions.filter((q) => q.difficulty === 'MEDIUM').length}
                </span>
              </div>
              <div className="p-3 bg-rose-950/30 rounded-xl border border-rose-500/30">
                <span className="text-rose-400 block text-[10px] uppercase">HARD (LV.3)</span>
                <span className="text-xl font-bold text-rose-300">
                  {parsedImportQuestions.filter((q) => q.difficulty === 'HARD').length}
                </span>
              </div>
            </div>

            {/* Warnings if any rows skipped */}
            {importErrors.length > 0 && (
              <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl text-xs font-mono text-amber-300 space-y-1 max-h-32 overflow-y-auto">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importErrors.length} Rows skipped or formatted improperly:</span>
                </div>
                <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-amber-200/80">
                  {importErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Table of Parsed Questions */}
            <div className="border border-slate-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto bg-slate-950">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#0b1218] text-slate-400 uppercase text-[10px] sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Question Statement</th>
                    <th className="p-2.5">Options</th>
                    <th className="p-2.5">Ans</th>
                    <th className="p-2.5">Difficulty</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Animation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {parsedImportQuestions.map((q, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/60">
                      <td className="p-2.5 text-slate-500">{idx + 1}</td>
                      <td className="p-2.5 text-white max-w-xs truncate" title={q.questionText}>
                        {q.questionText}
                      </td>
                      <td className="p-2.5 text-slate-400 text-[11px] max-w-xs truncate">
                        A: {q.optionA} | B: {q.optionB} | C: {q.optionC} | D: {q.optionD}
                      </td>
                      <td className="p-2.5 text-emerald-400 font-bold">{q.correctAnswer}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            q.difficulty === 'EASY'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : q.difficulty === 'HARD'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-300 text-[11px]">{q.category}</td>
                      <td className="p-2.5 text-cyan-300 text-[10px]">{q.animationType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                disabled={isImporting}
                className="py-2.5 px-4 rounded-xl border border-slate-700 font-mono text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isImporting || parsedImportQuestions.length === 0}
                className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs tracking-wider transition cursor-pointer disabled:opacity-50"
              >
                {isImporting ? 'IMPORTING...' : `CONFIRM & IMPORT ${parsedImportQuestions.length} MCQS`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Schema Specifications & Guidelines Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl bg-[#090f14] border border-emerald-500/30 p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-400" />
                <h3 className="font-mono text-sm font-bold text-white uppercase">
                  CSV TEMPLATE COLUMN SPECIFICATION
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 hover:text-rose-400 text-slate-400 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs text-slate-300">
              <p>
                The CSV template is compatible with Microsoft Excel, Google Sheets, Apple Numbers, and LibreOffice Calc.
              </p>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#0c151c] text-emerald-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-2">Column Header</th>
                      <th className="p-2">Required</th>
                      <th className="p-2">Allowed Values / Format</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="p-2 font-bold text-white">id</td>
                      <td className="p-2 text-slate-500">Optional</td>
                      <td className="p-2">Unique ID (e.g. <code>q_01</code>) or leave blank for auto-ID</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white">questionText</td>
                      <td className="p-2 text-emerald-400 font-bold">Yes</td>
                      <td className="p-2">Full text of MCQ question</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white">optionA, B, C, D</td>
                      <td className="p-2 text-emerald-400 font-bold">Yes</td>
                      <td className="p-2">The four multiple choice answers</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white">correctAnswer</td>
                      <td className="p-2 text-emerald-400 font-bold">Yes</td>
                      <td className="p-2">Single letter: <code>A</code>, <code>B</code>, <code>C</code>, or <code>D</code></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white">category</td>
                      <td className="p-2 text-slate-400">Optional</td>
                      <td className="p-2">e.g. Semiconductors, Microcontrollers, Sensors</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white">difficulty</td>
                      <td className="p-2 text-emerald-400 font-bold">Yes</td>
                      <td className="p-2"><code>EASY</code>, <code>MEDIUM</code>, or <code>HARD</code></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white">animationType</td>
                      <td className="p-2 text-slate-400">Optional</td>
                      <td className="p-2">
                        <code>RESISTOR</code>, <code>CAPACITOR</code>, <code>LED</code>, <code>ARDUINO</code>, <code>ESP32</code>, <code>IC</code>, etc.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white">explanation</td>
                      <td className="p-2 text-slate-500">Optional</td>
                      <td className="p-2">Detailed technical rationale/formula for question solution</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleDownloadBlankTemplate}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs hover:bg-emerald-500/30 transition cursor-pointer"
              >
                DOWNLOAD BLANK CSV TEMPLATE
              </button>
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-mono text-xs hover:text-white transition cursor-pointer"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Live Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-[#090f14] border border-cyan-500/40 p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="font-mono text-xs font-bold text-white uppercase">
                  SIMULATION PREVIEW // {previewQuestion.animationType}
                </h3>
              </div>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="p-1 hover:text-rose-400 text-slate-400 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <HardwareAnimation
                type={previewQuestion.animationType}
                customAssetUrl={previewQuestion.animationAssetUrl}
                size="lg"
                showLabel={true}
              />

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <p className="text-sm font-semibold text-white mb-2">{previewQuestion.questionText}</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                  <span>A: {previewQuestion.optionA}</span>
                  <span>B: {previewQuestion.optionB}</span>
                  <span>C: {previewQuestion.optionC}</span>
                  <span>D: {previewQuestion.optionD}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800 text-xs font-mono text-emerald-400">
                  Correct Answer: Option {previewQuestion.correctAnswer}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
