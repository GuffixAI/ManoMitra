// web/app/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useAuthStore } from "@/store/auth.store";
import { ROLES } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ShieldCheck,
  Users,
  Bot,
  FileLock,
  HeartHandshake,
  UserPlus,
  Compass,
  ArrowRight,
  Brain,
  Globe,
  Clock,
  BarChart3,
  Headphones,
  BookOpen,
  MessageCircle,
  Calendar,
  TrendingUp,
  Heart,
  Zap,
  Star,
  CheckCircle,
  Play,
  Volume2,
  Languages,
  Shield,
  Users2,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// --- Enhanced Reusable Components for the Landing Page ---

// Enhanced Feature Card Component with hover effects
const FeatureCard = ({ icon: Icon, title, description, gradient }: { icon: React.ElementType; title: string; description: string; gradient?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -5, transition: { duration: 0.3 } }}
    className="bg-card p-6 rounded-xl border text-center flex flex-col items-center hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${gradient || 'bg-gradient-to-br from-primary to-blue-600'}`} />
    <motion.div 
      whileHover={{ scale: 1.1, rotate: 5 }}
      className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 relative z-10"
    >
      <Icon className="h-7 w-7" />
    </motion.div>
    <h3 className="text-xl font-semibold mb-2 relative z-10">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed relative z-10">{description}</p>
  </motion.div>
);

// Enhanced How It Works Step Component
const HowItWorksStep = ({ icon: Icon, title, description, stepNumber }: { icon: React.ElementType; title: string; description: string; stepNumber: number }) => (
  <div className="flex flex-col items-center text-center relative">
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary mb-4 relative"
    >
      <Icon className="h-8 w-8" />
      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
        {stepNumber}
      </span>
    </motion.div>
    <h3 className="font-semibold">{title}</h3>
    <p className="text-sm text-muted-foreground mt-1">{description}</p>
  </div>
);

// Enhanced Testimonial Card Component
const TestimonialCard = ({ avatar, name, role, quote, rating }: { avatar: string; name: string; role: string; quote: string; rating: number }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="group"
  >
    <Card className="bg-muted/50 border-0 hover:shadow-md transition-all duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardContent className="pt-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Avatar className="ring-2 ring-primary/20">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="bg-primary/10 text-primary">{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
          </div>
          <div className="flex">
            {[...Array(rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>
        <blockquote className="italic text-foreground">"{quote}"</blockquote>
      </CardContent>
    </Card>
  </motion.div>
);

// New Stats Card Component
const StatsCard = ({ number, label, icon: Icon }: { number: string; label: string; icon: React.ElementType }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="text-center"
  >
    <div className="flex justify-center mb-2">
      <Icon className="h-8 w-8 text-primary" />
    </div>
    <div className="text-3xl font-bold text-primary mb-1">{number}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </motion.div>
);

// New Service Highlight Component
const ServiceHighlight = ({ icon: Icon, title, description, features }: { icon: React.ElementType; title: string; description: string; features: string[] }) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="flex flex-col md:flex-row items-center gap-8 py-12 border-b border-muted last:border-b-0"
  >
    <div className="flex-shrink-0">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
        <Icon className="h-10 w-10" />
      </div>
    </div>
    <div className="flex-1 text-center md:text-left">
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center justify-center md:justify-start gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  </motion.div>
);

// --- Main Enhanced Landing Page Component ---

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  // This effect handles client-side redirection after the initial auth check
  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardUrl = user.role === ROLES.STUDENT ? '/pre-dashboard' : `/${user.role}`;
      router.replace(dashboardUrl);
    }
  }, [isAuthenticated, user, router]);

  // Render a loading/redirecting state to prevent the landing page from flashing for logged-in users
  if (isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground font-medium">Redirecting to your dashboard...</p>
            <p className="text-sm text-muted-foreground/70">Setting up your personalized experience</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-background text-foreground">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-xl font-bold">Mitra</span>
              <span className="text-xs text-muted-foreground block leading-none">Mental Wellness</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden md:flex items-center gap-1 text-xs">
              <Activity className="h-3 w-3" />
              24/7 Support
            </Badge>
            <Link href="/login" passHref >
              <Button variant="ghost" className="cursor-pointer">Login</Button>
            </Link>
            <Link href="/register" passHref>
              <Button className="cursor-pointer bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="py-20 md:py-32 text-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-600/5"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex justify-center mb-6">
              <Badge variant="outline" className="py-2 px-4 border-primary/50 text-primary bg-primary/5 backdrop-blur-sm">
                <Heart className="h-4 w-4 mr-2" />
                Your Safe Space for Mental Wellness
              </Badge>
            </div>
            <h1 className="mt-4 text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
              Find Your Strength.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                We're Here to Listen.
              </span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
              Mitra is a comprehensive digital psychological intervention system offering students free access to 
              <span className="text-primary font-medium"> AI-guided support</span>, 
              <span className="text-primary font-medium"> professional counsellors</span>, 
              <span className="text-primary font-medium"> peer communities</span>, and 
              <span className="text-primary font-medium"> culturally-aware resources</span> in regional languages.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" passHref>
                <Button size="lg" className="text-lg py-6 px-8 cursor-pointer bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 group">
                  Start Your Wellness Journey
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg py-6 px-8 group">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            
            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
            >
              <StatsCard number="24/7" label="AI Support Available" icon={Bot} />
              <StatsCard number="500+" label="Students Supported" icon={Users} />
              <StatsCard number="50+" label="Professional Counsellors" icon={HeartHandshake} />
              <StatsCard number="98%" label="User Satisfaction" icon={TrendingUp} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-20 bg-muted/30 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">Core Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              A Comprehensive Digital Psychological Intervention System
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Built specifically for higher education institutions with cultural context, regional language support, 
              and institution-specific customization capabilities.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={Bot}
              title="AI-Guided First-Aid Support"
              description="Interactive chatbot offering immediate coping strategies with PHQ-9, GAD-7, and GHQ screening tools integration."
              gradient="bg-gradient-to-br from-blue-500 to-purple-600"
            />
            <FeatureCard
              icon={Calendar}
              title="Confidential Booking System"
              description="Secure appointment scheduling with on-campus counsellors and mental health helplines with complete privacy."
              gradient="bg-gradient-to-br from-green-500 to-teal-600"
            />
            <FeatureCard
              icon={BookOpen}
              title="Psychoeducational Hub"
              description="Videos, relaxation audio, and mental wellness guides available in multiple regional languages."
              gradient="bg-gradient-to-br from-orange-500 to-red-600"
            />
            <FeatureCard
              icon={Users2}
              title="Moderated Peer Support"
              description="Anonymous peer-to-peer forums with trained student volunteers ensuring safe, supportive discussions."
              gradient="bg-gradient-to-br from-pink-500 to-rose-600"
            />
            <FeatureCard
              icon={BarChart3}
              title="Admin Analytics Dashboard"
              description="Real-time anonymous data analytics for institutions to identify trends and plan targeted interventions."
              gradient="bg-gradient-to-br from-indigo-500 to-blue-600"
            />
            <FeatureCard
              icon={FileLock}
              title="Safe Incident Reporting"
              description="Confidential reporting system for academic stress, bullying, or other concerns with proper escalation protocols."
              gradient="bg-gradient-to-br from-yellow-500 to-orange-600"
            />
            <FeatureCard
              icon={Languages}
              title="Cultural Context Integration"
              description="Region-specific content and culturally appropriate mental health approaches tailored to Indian students."
              gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
            />
            <FeatureCard
              icon={Clock}
              title="24/7 Crisis Support"
              description="Round-the-clock availability with immediate crisis detection and professional intervention capabilities."
              gradient="bg-gradient-to-br from-violet-500 to-purple-600"
            />
          </div>
        </div>
      </section>

      {/* New Service Highlights Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Comprehensive Support System</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything You Need for Mental Wellness
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Our platform integrates multiple support mechanisms to provide holistic mental health care.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <ServiceHighlight
              icon={Brain}
              title="AI-Powered Mental Health Screening"
              description="Advanced AI algorithms provide initial assessment using standardized psychological tools, ensuring early detection and appropriate care pathways."
              features={[
                "PHQ-9 Depression Screening",
                "GAD-7 Anxiety Assessment", 
                "GHQ General Health Questionnaire",
                "Intelligent risk stratification"
              ]}
            />
            
            <ServiceHighlight
              icon={Headphones}
              title="Professional Counselling Network"
              description="Connect with licensed mental health professionals through secure video calls, chat sessions, or phone consultations."
              features={[
                "Licensed counsellors available",
                "Specialized therapy sessions",
                "Crisis intervention protocols",
                "Follow-up care planning"
              ]}
            />
            
            <ServiceHighlight
              icon={Globe}
              title="Culturally Aware Resource Library"
              description="Extensive collection of mental wellness content designed for Indian students, available in multiple regional languages."
              features={[
                "Hindi, Bengali, Tamil, Telugu support",
                "Culturally appropriate coping strategies",
                "Meditation and mindfulness in regional contexts",
                "Academic stress management techniques"
              ]}
            />
            
            <ServiceHighlight
              icon={Shield}
              title="Anonymous Peer Support Communities"
              description="Join topic-specific support groups moderated by trained volunteers, maintaining complete anonymity while building connections."
              features={[
                "Topic-based support rooms",
                "Trained volunteer moderators",
                "Complete anonymity protection",
                "Real-time peer interaction"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4">Simple Process</Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Getting Started is Easy</h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Begin your mental wellness journey in just three simple steps, with complete privacy and professional support.
          </p>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Enhanced Connector Lines */}
            <div className="hidden md:block absolute top-8 left-0 w-full">
              <div className="flex items-center justify-center">
                <div className="w-1/3 h-px bg-gradient-to-r from-transparent via-primary/50 to-primary/30"></div>
                <div className="w-1/3 h-px bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30"></div>
                <div className="w-1/3 h-px bg-gradient-to-r from-primary/30 via-primary/50 to-transparent"></div>
              </div>
            </div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
              <HowItWorksStep 
                icon={UserPlus} 
                title="Create Your Secure Account" 
                description="Quick, private registration with institutional verification. Your data is encrypted and completely confidential."
                stepNumber={1}
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
              <HowItWorksStep 
                icon={Compass} 
                title="Complete Initial Assessment" 
                description="Take a brief, scientifically-validated screening to help us understand your needs and recommend appropriate support."
                stepNumber={2}
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }}>
              <HowItWorksStep 
                icon={ShieldCheck} 
                title="Access Your Support Network" 
                description="Connect with AI guidance, book counsellor sessions, join peer groups, or explore resources - all at your own pace."
                stepNumber={3}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">Student Success Stories</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">You're Not Alone in This Journey</h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Hear from students who have found support, community, and healing through Mitra's comprehensive platform.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <TestimonialCard
              avatar="/placeholder-avatar-1.jpg"
              name="Priya S."
              role="2nd Year Engineering"
              quote="The AI screening helped me understand my anxiety levels, and booking a counsellor was so easy. The regional language resources made me feel truly understood."
              rating={5}
            />
            <TestimonialCard
              avatar="/placeholder-avatar-2.jpg"
              name="Aman K."
              role="3rd Year Arts"
              quote="The peer support rooms are incredible. Knowing others face similar challenges and having trained moderators made all the difference in my healing journey."
              rating={5}
            />
            <TestimonialCard
              avatar="/placeholder-avatar-3.jpg"
              name="Sneha R."
              role="1st Year Medical"
              quote="The 24/7 AI support was there when I needed it most during exam stress. The crisis detection feature connected me with help immediately when I was struggling."
              rating={5}
            />
          </motion.div>
        </div>
      </section>

      {/* Enhanced FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Frequently Asked Questions</Badge>
            <h2 className="text-3xl font-bold tracking-tight">Everything You Need to Know</h2>
            <p className="mt-4 text-muted-foreground">
              Common questions about our digital psychological intervention system.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border rounded-lg mb-4 px-6 bg-background/50">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  Is this service really free for all students?
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-4">
                Yes, Mitra is completely free for all verified students of participating institutions. Our mission is to make comprehensive mental health support accessible to everyone, including AI screening tools, counsellor sessions, and peer support platforms.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border rounded-lg mb-4 px-6 bg-background/50">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  How secure is my personal information and mental health data?
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-4">
                Your privacy is our top priority. All communications are end-to-end encrypted, psychological assessments are anonymized for analytics, and we follow strict HIPAA-equivalent standards for mental health data protection. You can read our detailed Privacy Policy for complete transparency.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border rounded-lg mb-4 px-6 bg-background/50">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  Can I remain anonymous in peer support rooms?
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-4">
                Absolutely. Peer support rooms are designed for complete anonymity. You'll be assigned a random display name that changes across different sessions, ensuring your privacy while allowing meaningful connections with other students facing similar challenges.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border rounded-lg mb-4 px-6 bg-background/50">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-primary" />
                  How accurate are the AI screening tools like PHQ-9 and GAD-7?
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-4">
                Our AI uses clinically validated screening instruments (PHQ-9 for depression, GAD-7 for anxiety, GHQ for general health) that are widely used by mental health professionals. While these provide valuable insights, they're designed to complement, not replace, professional assessment and care.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5" className="border rounded-lg mb-4 px-6 bg-background/50">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Languages className="h-5 w-5 text-primary" />
                  Which regional languages are supported?
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-4">
                Currently, we support Hindi, Bengali, Tamil, Telugu, Marathi, and Gujarati, with more regional languages being added based on institutional needs. All content is culturally contextualized to ensure relevance and effectiveness for Indian students.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6" className="border rounded-lg mb-4 px-6 bg-background/50">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  How does the admin dashboard help institutions?
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-4">
                The admin dashboard provides anonymized analytics to help institutions identify mental health trends, peak stress periods, and areas needing intervention. This data-driven approach enables better resource allocation and targeted mental wellness programs while maintaining complete student privacy.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Enhanced Final CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-blue-600/10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-6 bg-primary/5 border-primary/20">
              <Heart className="h-4 w-4 mr-2" />
              Join Thousands of Students
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Ready to Transform Your 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                <br />Mental Wellness Journey?
              </span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-3xl mx-auto">
              Join a comprehensive digital psychological intervention system designed specifically for students. 
              Get AI-powered support, connect with professionals, and become part of a caring community - all completely free.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" passHref>
                <Button size="lg" className="text-lg py-6 px-10 cursor-pointer bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 group shadow-lg">
                  Start Your Free Journey Today
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login" passHref>
                <Button size="lg" variant="outline" className="text-lg py-6 px-10 cursor-pointer group border-2">
                  Already Have an Account?
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>100% Free for Students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Complete Privacy Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>24/7 AI Support Available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Regional Language Support</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t bg-muted/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <span className="text-xl font-bold">Mitra</span>
                  <span className="text-sm text-muted-foreground block leading-none">Digital Psychological Intervention System</span>
                </div>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                A comprehensive mental health platform designed for higher education institutions, 
                providing culturally-aware, AI-powered psychological support to students across India.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <Badge variant="outline" className="text-xs">
                  <Activity className="h-3 w-3 mr-1" />
                  24/7 Available
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  HIPAA Compliant
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  6+ Languages
                </Badge>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Platform Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features/ai-support" className="hover:text-primary transition-colors">AI Mental Health Screening</Link></li>
                <li><Link href="/features/counselling" className="hover:text-primary transition-colors">Professional Counselling</Link></li>
                <li><Link href="/features/peer-support" className="hover:text-primary transition-colors">Peer Support Communities</Link></li>
                <li><Link href="/features/resources" className="hover:text-primary transition-colors">Psychoeducational Resources</Link></li>
                <li><Link href="/features/analytics" className="hover:text-primary transition-colors">Institution Analytics</Link></li>
              </ul>
            </div>
            
            {/* Support Links */}
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Support & Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-primary transition-colors">Data Security</Link></li>
                <li><Link href="/accessibility" className="hover:text-primary transition-colors">Accessibility</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 mt-8 border-t border-border text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Mitra - Digital Psychological Intervention System. All rights reserved.</p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <span className="text-xs">Built for Higher Education Institutions</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}