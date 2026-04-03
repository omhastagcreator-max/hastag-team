import { motion, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LandingScene } from '@/components/LandingScene';
import { ArrowRight, BarChart3, Briefcase, Users, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';

export default function Landing() {
  const navigate = useNavigate();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background overflow-hidden flex flex-col relative text-foreground">
        
        {/* Navigation Bar */}
        <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Logo" className="h-8 w-8 object-contain" />
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                Hastag-Team
              </span>
            </div>
            <Button variant="ghost" onClick={() => navigate('/login')} className="font-semibold text-primary hover:bg-primary/10">
              Sign In
            </Button>
          </div>
        </nav>

        {/* 3D Background */}
        <div className="absolute inset-0 top-16 z-0">
          <LandingScene />
        </div>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col z-10 relative mt-16">
          <section className="flex-1 flex flex-col items-center justify-center min-h-[85vh] px-6 text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="max-w-4xl mx-auto space-y-8"
            >
              <motion.div variants={itemVariants} className="inline-block">
                <span className="bg-primary/10 tracking-widest text-primary text-xs font-bold uppercase px-3 py-1 rounded-full border border-primary/20">
                  Agency Operating System
                </span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-sm">
                Scale Your Agency<br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500">
                  Without The Chaos
                </span>
              </motion.h1>

              <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                The ultimate productivity system uniting sales tracking, complex project management, and transparent client reporting in one modern interface.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" onClick={() => navigate('/login')} className="h-14 px-8 text-lg font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 rounded-xl w-full sm:w-auto">
                  Access Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="secondary" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="h-14 px-8 text-lg font-bold border rounded-xl w-full sm:w-auto bg-background/50 backdrop-blur">
                  Explore Features
                </Button>
              </motion.div>
            </motion.div>
          </section>

          {/* Features Grid */}
          <section id="features" className="py-24 bg-gradient-to-b from-transparent to-muted/30 border-t border-border/50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to execute.</h2>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">Stop bouncing between five different tools. Manage the entire agency lifecycle natively.</p>
              </div>

              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {[
                  { title: "Dynamic Sales Pipeline", desc: "Convert leads into deals and pipe them directly into active production projects.", icon: <BarChart3 className="text-green-500"/>, shadow: "shadow-green-500/10" },
                  { title: "Project Scaffolding", desc: "Assign specific roles natively, track development tasks, and orchestrate web/ads.", icon: <Briefcase className="text-blue-500" />, shadow: "shadow-blue-500/10" },
                  { title: "Live Client Portal", desc: "Give clients a read-only, beautifully formatted view of their KPIs and dev progress.", icon: <Users className="text-purple-500" />, shadow: "shadow-purple-500/10" },
                  { title: "Real-time Visibility", desc: "Managers can optionally watch real-time WebRTC streams to collaborate securely.", icon: <LayoutDashboard className="text-orange-500"/>, shadow: "shadow-orange-500/10" },
                  { title: "Role-Based Access", desc: "Strict RLS bounds Admin, Employee, Sales, and Client data completely securely.", icon: <ShieldCheck className="text-red-500"/>, shadow: "shadow-red-500/10" },
                  { title: "Insanely Fast UI", desc: "Built entirely with strict DOM containment and reactive optimistic UI states.", icon: <svg className="w-6 h-6 text-yellow-500" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, shadow: "shadow-yellow-500/10" },
                ].map((feature, i) => (
                  <motion.div 
                    key={i}
                    variants={itemVariants}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm shadow-xl ${feature.shadow}`}
                  >
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4 border">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Workflow Flow */}
          <section className="py-24 bg-background">
             <div className="max-w-5xl mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold tracking-tight mb-12">The Perfect Workflow</h2>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                   {['Sales Target', 'Project Execution', 'Client Reporting'].map((step, idx) => (
                     <div key={idx} className="flex flex-col md:flex-row items-center w-full">
                       <motion.div whileHover={{ scale: 1.05 }} className="w-full md:w-auto flex-1 p-6 rounded-2xl border bg-muted/20 backdrop-blur shadow-sm relative">
                          <div className="absolute -top-3 -left-3 h-8 w-8 bg-primary rounded-full text-primary-foreground font-bold flex items-center justify-center">{idx + 1}</div>
                          <h4 className="font-bold text-lg">{step}</h4>
                       </motion.div>
                       {idx !== 2 && <ArrowRight className="hidden md:block h-8 w-8 text-muted-foreground/50 mx-4" />}
                     </div>
                   ))}
                </div>
             </div>
          </section>

          {/* Bottom CTA */}
          <section className="py-32 relative overflow-hidden">
             <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full" />
             <div className="max-w-4xl mx-auto text-center relative z-10 px-6">
                <h2 className="text-4xl font-extrabold mb-6 drop-shadow-sm">Ready to systematize your operations?</h2>
                <Button size="lg" onClick={() => navigate('/login')} className="h-16 px-10 text-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 rounded-2xl">
                  Sign In To Your Workspace
                </Button>
             </div>
          </section>

        </main>

        <footer className="border-t border-border/50 py-8 bg-muted/20">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground font-medium">
            <p>© {new Date().getFullYear()} Hastag-Team Operating System.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
