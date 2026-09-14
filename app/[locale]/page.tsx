import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Stethoscope, BookOpen, Clock, BarChart3, FileUp, ArrowRight, Star, Users, Brain } from 'lucide-react';

// Animated background blobs
function Blobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-accent-200/30 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-primary-300/20 rounded-full blur-3xl animate-pulse-slow delay-2000" />
    </div>
  );
}

// Stats counter card
function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) {
  return (
    <div className="card p-6 text-center flex flex-col items-center gap-3 slide-in">
      <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
      <p className="text-3xl font-bold text-gradient">{value}</p>
      <p className="text-sm text-[#4b7a62] dark:text-green-400 font-medium">{label}</p>
    </div>
  );
}

// Feature card
function FeatureCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="card-hover p-6 flex flex-col gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-bold text-lg text-[#1a2e25] dark:text-green-50">{title}</h3>
      <p className="text-sm text-[#4b7a62] dark:text-green-400 leading-relaxed">{desc}</p>
    </div>
  );
}

// Year badges
const YEARS = [
  { label: '1ère', color: 'bg-primary-100 text-primary-700' },
  { label: '2ème', color: 'bg-primary-200 text-primary-800' },
  { label: '3ème', color: 'bg-primary-300 text-primary-900' },
  { label: '4ème', color: 'bg-accent-100 text-accent-700' },
  { label: '5ème', color: 'bg-accent-200 text-accent-800' },
  { label: '6ème', color: 'bg-accent-300 text-accent-900' },
  { label: '7ème', color: 'bg-primary-400 text-white' },
  { label: 'Résidanat', color: 'bg-primary-600 text-white' },
];

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="min-h-screen bg-surface-50 dark:bg-dark-bg">

      {/* ── Navbar ───────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-primary-100 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl">
              <span className="text-[#1a2e25] dark:text-green-50">Med</span>
              <span className="text-gradient">QCM</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/fr/login" className="btn-ghost text-sm">
              {t('auth.login_btn')}
            </Link>
            <Link href="/fr/register" className="btn-primary text-sm">
              {t('home.cta_register')}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <Blobs />
        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 mb-6 animate-in">
            <Star className="w-3.5 h-3.5 text-accent-500 fill-current" />
            <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">La plateforme #1 des étudiants en médecine</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-4 slide-in">
            {t('home.hero_title')}{' '}
            <span className="text-gradient">{t('home.hero_highlight')}</span>
          </h1>

          <p className="text-lg text-[#4b7a62] dark:text-green-300 max-w-2xl mx-auto mb-10 slide-in">
            {t('home.hero_subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 slide-in">
            <Link href="/fr/register" className="btn-accent px-8 py-3 text-base">
              {t('home.cta_register')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#pricing" className="btn-secondary px-8 py-3 text-base">
              {t('home.cta_offers')}
            </Link>
          </div>

          {/* Year pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-12">
            {YEARS.map((y) => (
              <span key={y.label} className={`px-3 py-1 rounded-full text-xs font-bold ${y.color} transition-transform hover:scale-105 cursor-default`}>
                {y.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard value="40 000+" label={t('home.stats_qcms')} icon={Brain} />
          <StatCard value="5 000+"  label={t('home.stats_users')} icon={Users} />
          <StatCard value="50+"     label={t('home.stats_exams')} icon={Clock} />
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white dark:bg-dark-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">{t('home.features_title')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={BookOpen} title={t('home.feature_qcm_title')}    desc={t('home.feature_qcm_desc')} />
            <FeatureCard icon={Clock}    title={t('home.feature_exam_title')}   desc={t('home.feature_exam_desc')} />
            <FeatureCard icon={BarChart3} title={t('home.feature_stats_title')} desc={t('home.feature_stats_desc')} />
            <FeatureCard icon={FileUp}   title={t('home.feature_import_title')} desc={t('home.feature_import_desc')} />
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="section-title">{t('subscribe.title')}</h2>
          <p className="section-subtitle mt-2">{t('subscribe.subtitle')}</p>
        </div>
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Free tier */}
          <div className="card p-8 flex flex-col gap-4">
            <h3 className="text-xl font-bold">{t('subscribe.free_tier')}</h3>
            <p className="text-4xl font-extrabold">0 DA</p>
            <p className="text-sm text-[#4b7a62] dark:text-green-400">
              ✓ {t('subscribe.free_includes')}
            </p>
            <Link href="/fr/register" className="btn-secondary mt-auto">
              {t('home.cta_register')}
            </Link>
          </div>
          {/* Premium tier */}
          <div className="card p-8 flex flex-col gap-4 border-2 border-primary-500 relative overflow-hidden">
            <div className="absolute top-4 right-4 badge-free">BEST</div>
            <h3 className="text-xl font-bold text-gradient">{t('subscribe.premium_tier')}</h3>
            <p className="text-4xl font-extrabold text-primary-600">— DA / an</p>
            <p className="text-sm text-[#4b7a62] dark:text-green-400">
              ✓ {t('subscribe.premium_includes')}
            </p>
            <Link href="/fr/subscribe" className="btn-primary mt-auto">
              {t('home.cta_offers')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-primary-100 dark:border-dark-border py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Stethoscope className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-lg">
              <span className="text-[#1a2e25] dark:text-green-50">Med</span>
              <span className="text-gradient">QCM</span>
            </span>
          </div>
          <p className="text-xs text-[#4b7a62] dark:text-green-600">
            © {new Date().getFullYear()} MedQCM. Tous droits réservés.
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/fr/login"    className="text-[#4b7a62] hover:text-primary-600 dark:text-green-500 dark:hover:text-primary-400 transition-colors">Connexion</Link>
            <Link href="/fr/register" className="text-[#4b7a62] hover:text-primary-600 dark:text-green-500 dark:hover:text-primary-400 transition-colors">S'inscrire</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
