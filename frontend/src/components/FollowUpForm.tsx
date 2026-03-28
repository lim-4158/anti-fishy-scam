import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, HelpCircle } from 'lucide-react';
import type { FollowUpQuestion } from '../types';

interface FollowUpFormProps {
  questions: FollowUpQuestion[];
  classificationSummary?: string;
  onSubmit: (answers: Record<string, string>) => void;
  onSkip: () => void;
  isLoading: boolean;
}

export function FollowUpForm({
  questions,
  classificationSummary,
  onSubmit,
  onSkip,
  isLoading,
}: FollowUpFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const hasAnswers = Object.values(answers).some((v) => v.trim() !== '');

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Classification summary */}
      {classificationSummary && (
        <motion.div
          className="glass-card rounded-xl p-4 mb-5 border-l-4 border-l-cyan-400"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-200 mb-1">Initial Assessment</p>
              <p className="text-sm text-slate-400 leading-relaxed">{classificationSummary}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Form header */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-slate-100">
          A few more details will help us dig deeper
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Optional — skip if you don't have this info
        </p>
      </motion.div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, i) => (
          <motion.div
            key={q.field}
            className="glass-card rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {q.label}
            </label>
            {q.input_type === 'select' && q.options ? (
              <select
                value={answers[q.field] || ''}
                onChange={(e) => handleChange(q.field, e.target.value)}
                className="w-full bg-navy-900/80 border border-navy-600/50 rounded-lg px-3 py-2.5 text-sm text-slate-200
                  focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20
                  transition-all duration-200"
                disabled={isLoading}
              >
                <option value="">Select...</option>
                {q.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={answers[q.field] || ''}
                onChange={(e) => handleChange(q.field, e.target.value)}
                placeholder="Type here..."
                className="w-full bg-navy-900/80 border border-navy-600/50 rounded-lg px-3 py-2.5 text-sm text-slate-200
                  placeholder-slate-600
                  focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20
                  transition-all duration-200"
                disabled={isLoading}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <motion.div
        className="flex items-center justify-between mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={onSkip}
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-200"
          disabled={isLoading}
        >
          Skip, analyze now
        </button>
        <motion.button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm
            bg-gradient-to-r from-cyan-500 to-cyan-600 text-white
            hover:from-cyan-400 hover:to-cyan-500
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200 shadow-lg shadow-cyan-500/20"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {hasAnswers ? 'Continue Analysis' : 'Analyze Without Context'}
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
