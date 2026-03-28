import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Link,
  ShoppingCart,
  Search,
  Shield,
  Globe,
  DollarSign,
  Users,
  Star,
  Lock,
  FileText,
  Tag,
  Phone,
  Store,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { skills } from '../data/skills';
import type { Skill, SkillCheck } from '../data/skills';

const iconMap: Record<string, React.ElementType> = {
  briefcase: Briefcase,
  link: Link,
  'shopping-cart': ShoppingCart,
  search: Search,
  shield: Shield,
  globe: Globe,
  'dollar-sign': DollarSign,
  users: Users,
  star: Star,
  lock: Lock,
  'file-text': FileText,
  tag: Tag,
  phone: Phone,
  store: Store,
};

function getIcon(name: string) {
  return iconMap[name] || Shield;
}

function CriteriaRow({ label, color, text }: { label: string; color: string; text: string }) {
  const colorMap: Record<string, { bg: string; border: string; text: string; icon: React.ElementType }> = {
    green: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle2 },
    yellow: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: AlertCircle },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: XCircle },
  };
  const style = colorMap[color] || colorMap.green;
  const Icon = style.icon;

  return (
    <div className={`flex items-start gap-2 p-2.5 rounded-lg ${style.bg} border ${style.border}`}>
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${style.text}`} />
      <div>
        <span className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}>{label}</span>
        <p className="text-xs text-slate-300 mt-0.5">{text}</p>
      </div>
    </div>
  );
}

function CheckDetail({ check }: { check: SkillCheck }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = getIcon(check.icon);

  return (
    <motion.div
      className="glass-card rounded-xl border border-navy-600/30 overflow-hidden"
      layout
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-navy-700/30 transition-colors"
      >
        <div className="p-2 rounded-lg bg-navy-700/50">
          <Icon className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white">{check.name}</h4>
          <p className="text-xs text-slate-400 truncate">{check.description}</p>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              <p className="text-xs text-slate-300 mb-3">{check.description}</p>

              <CriteriaRow label="Safe" color="green" text={check.greenCriteria} />
              <CriteriaRow label="Suspicious" color="yellow" text={check.yellowCriteria} />
              <CriteriaRow label="Scam" color="red" text={check.redCriteria} />

              {check.dataSources.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs text-slate-500 font-medium">Data sources: </span>
                  <span className="text-xs text-slate-400">
                    {check.dataSources.join(' · ')}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SkillCard({ skill, isSelected, onClick }: { skill: Skill; isSelected: boolean; onClick: () => void }) {
  const Icon = getIcon(skill.icon);

  return (
    <motion.button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
        isSelected
          ? 'glass-card border-cyan-500/40 shadow-lg shadow-cyan-500/5'
          : 'bg-navy-800/40 border-navy-600/20 hover:border-navy-500/30 hover:bg-navy-800/60'
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-3">
        <div
          className="p-2.5 rounded-lg"
          style={{ backgroundColor: `${skill.color}15`, border: `1px solid ${skill.color}30` }}
        >
          <Icon className="w-5 h-5" style={{ color: skill.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white">{skill.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {skill.checks.length} checks · {skill.criticalRedFlags.length} red flags
          </p>
        </div>
        <ChevronRight
          className={`w-4 h-4 transition-transform duration-200 ${
            isSelected ? 'text-cyan-400 rotate-90' : 'text-slate-600'
          }`}
        />
      </div>
    </motion.button>
  );
}

interface SkillsPageProps {
  onBack: () => void;
}

export function SkillsPage({ onBack }: SkillsPageProps) {
  const [selectedSkillId, setSelectedSkillId] = useState<string>(skills[0].id);
  const selectedSkill = skills.find((s) => s.id === selectedSkillId) || skills[0];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Back button + Title */}
      <motion.div
        className="flex items-center gap-4 mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm
            text-slate-400 hover:text-cyan-400 hover:bg-navy-800/60
            border border-transparent hover:border-navy-600/30
            transition-all duration-200"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>
        <div>
          <h2 className="text-2xl font-bold text-white">
            Detection <span className="text-cyan-400">Skills</span>
          </h2>
          <p className="text-sm text-slate-400">
            Pre-built verification workflows that power AntiFishy's scam detection engine
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Skill selector */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 mb-2">
            Available Skills ({skills.length})
          </h3>
          {skills.map((skill, i) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <SkillCard
                skill={skill}
                isSelected={selectedSkillId === skill.id}
                onClick={() => setSelectedSkillId(skill.id)}
              />
            </motion.div>
          ))}

          {/* Architecture note */}
          <motion.div
            className="mt-4 p-3 rounded-xl bg-navy-800/30 border border-navy-600/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs text-slate-500">
              Each skill is an autonomous OpenAI Agent with access to TinyFish web agents.
              Skills run independently and can be composed in parallel.
            </p>
          </motion.div>
        </div>

        {/* Right: Skill detail */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSkill.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Skill header */}
              <div className="glass-card rounded-xl border border-navy-600/30 p-5">
                <div className="flex items-start gap-4">
                  <div
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: `${selectedSkill.color}15`, border: `1px solid ${selectedSkill.color}30` }}
                  >
                    {(() => { const Icon = getIcon(selectedSkill.icon); return <Icon className="w-6 h-6" style={{ color: selectedSkill.color }} />; })()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedSkill.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{selectedSkill.description}</p>
                  </div>
                </div>
              </div>

              {/* Verification Checks */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  Verification Checks ({selectedSkill.checks.length})
                </h3>
                <div className="space-y-3">
                  {selectedSkill.checks.map((check, i) => (
                    <motion.div
                      key={check.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <CheckDetail check={check} />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Critical Red Flags */}
              <div className="glass-card rounded-xl border border-red-500/20 p-5">
                <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Critical Red Flags
                </h3>
                <ul className="space-y-2">
                  {selectedSkill.criticalRedFlags.map((flag, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-2 text-xs text-slate-300"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-500/70" />
                      {flag}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Scoring Rules */}
              <div className="glass-card rounded-xl border border-navy-600/30 p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Verdict Scoring</h3>
                <div className="space-y-2">
                  <CriteriaRow label="Likely Safe" color="green" text={selectedSkill.scoringRules.likelySafe} />
                  <CriteriaRow label="Suspicious" color="yellow" text={selectedSkill.scoringRules.suspicious} />
                  <CriteriaRow label="Likely Scam" color="red" text={selectedSkill.scoringRules.likelyScam} />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
