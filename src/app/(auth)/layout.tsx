import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="relative bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] min-h-[calc(100vh-3.5rem)]">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <div className="relative max-w-container mx-auto px-4 py-10 md:py-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">

            {/* Left side — branding pitch (hidden on mobile) */}
            <div className="hidden md:block text-white">
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">
                India's College Application Platform
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-4">
                Apply to verified colleges. Free. Direct admission.
              </h2>
              <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-md">
                Fill one application. Apply to dozens of colleges. Get WhatsApp + email status updates at every step.
              </p>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center text-success text-xs">✓</span>
                  100% free for students
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center text-success text-xs">✓</span>
                  UGC-recognised colleges only
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center text-success text-xs">✓</span>
                  DPDP Act 2023 compliant
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center text-success text-xs">✓</span>
                  No agent fees · no hidden charges
                </li>
              </ul>
            </div>

            {/* Right side — actual auth form (children) */}
            <div className="w-full">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
