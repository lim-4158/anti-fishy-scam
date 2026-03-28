import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Header } from './components/Header';
import { InputArea } from './components/InputArea';
import { FollowUpForm } from './components/FollowUpForm';
import { Dashboard } from './components/Dashboard';
import { VerdictBanner } from './components/VerdictBanner';
import { WaveBackground } from './components/WaveBackground';
import { useAnalysis } from './hooks/useAnalysis';

function App() {
  const { state, analyze, submitFollowUp, reset } = useAnalysis();
  const { phase, checks, verdict, classification, followUpQuestions, userMessage, error } = state;

  const isInputPhase = phase === 'input';
  const isFollowUp = phase === 'follow_up';
  const isAnalyzing = phase === 'analyzing';
  const isVerdict = phase === 'verdict';

  const showCompactInput = isFollowUp || isAnalyzing || isVerdict;
  const showDashboard = isAnalyzing || isVerdict;

  return (
    <div className="bg-gradient-animated min-h-screen relative">
      <WaveBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <Header compact={showCompactInput} />

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center px-4 pb-8">
          <AnimatePresence mode="wait">
            {/* Landing / Input phase */}
            {isInputPhase && (
              <motion.div
                key="input-landing"
                className="flex-1 flex flex-col items-center justify-center w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
              >
                {/* Hero text */}
                <motion.div
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                    Is it a <span className="text-cyan-400">scam</span>?
                  </h2>
                  <p className="text-slate-400 text-lg max-w-md mx-auto">
                    Paste anything suspicious. We'll investigate it with AI-powered verification checks.
                  </p>
                </motion.div>

                <InputArea
                  onSubmit={analyze}
                  isLoading={state.isStreaming}
                />
              </motion.div>
            )}

            {/* Follow-up phase */}
            {isFollowUp && (
              <motion.div
                key="followup"
                className="w-full mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Compact input bar */}
                <div className="mb-6">
                  <InputArea
                    onSubmit={() => {}}
                    isLoading
                    compact
                    initialMessage={userMessage}
                  />
                </div>

                <FollowUpForm
                  questions={followUpQuestions}
                  classificationSummary={classification?.summary}
                  onSubmit={submitFollowUp}
                  onSkip={() => submitFollowUp({})}
                  isLoading={state.isStreaming}
                />
              </motion.div>
            )}

            {/* Analyzing + Verdict phase */}
            {showDashboard && !isFollowUp && (
              <motion.div
                key="dashboard"
                className="w-full mt-6 space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Compact input bar */}
                <InputArea
                  onSubmit={() => {}}
                  isLoading
                  compact
                  initialMessage={userMessage}
                />

                {/* Classification badge */}
                {classification && (
                  <motion.div
                    className="flex justify-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-800/80 border border-navy-600/30">
                      <span className="text-xs text-slate-400">Detected:</span>
                      <span className="text-xs font-semibold text-cyan-400 capitalize">
                        {classification.scamType.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({Math.round(classification.confidence * 100)}%)
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Verdict banner */}
                <AnimatePresence>
                  {isVerdict && verdict && (
                    <VerdictBanner
                      overall={verdict.overall}
                      score={verdict.score}
                      summary={verdict.summary}
                      checksSummary={verdict.checksSummary}
                    />
                  )}
                </AnimatePresence>

                {/* Check cards */}
                <Dashboard checks={checks} />

                {/* Error display */}
                {error && (
                  <motion.div
                    className="max-w-3xl mx-auto glass-card rounded-xl border border-danger/30 p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-sm text-danger">{error}</p>
                  </motion.div>
                )}

                {/* New scan button */}
                {(isVerdict || error) && (
                  <motion.div
                    className="flex justify-center pt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <motion.button
                      onClick={reset}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm
                        bg-navy-800/80 border border-navy-600/50 text-slate-300
                        hover:border-cyan-500/30 hover:text-cyan-400
                        transition-all duration-200"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <RotateCcw className="w-4 h-4" />
                      New Scan
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="relative z-10 py-4 text-center">
          <p className="text-xs text-slate-600">
            Built with TinyFish + OpenAI | AntiFishy Hackathon 2026
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
