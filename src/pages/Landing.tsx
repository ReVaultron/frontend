import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Shield, 
  TrendingUp, 
  Zap, 
  Bot, 
  BarChart3, 
  Lock,
  ChevronRight,
  Activity,
  Cpu,
  PieChart,
  Check,
  ArrowRight,
  Users,
  Sparkles,
  CircleDollarSign,
  TrendingDown,
  Globe,
  Github,
  Twitter,
  MessageCircle
} from "lucide-react";
import { useState } from "react";
import { WalletButton } from "@/components/wallet/WalletButton";
import { useWallet } from "@/hooks/useHederaWallet";
import { ThemeToggle } from "@/components/ThemeToggle";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Landing() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const {isConnected} = useWallet();
  const faqs = [
    {
      question: "How does ReVaultron protect my assets?",
      answer: "Your assets remain in your custody at all times. ReVaultron uses smart contracts on Hedera for transparent, auditable operations. You maintain full control with the ability to withdraw anytime."
    },
    {
      question: "What are the fees?",
      answer: "ReVaultron charges a 1% annual management fee and a 10% performance fee on profits. Thanks to Hedera's low transaction costs, gas fees are minimal (typically under $0.01 per transaction)."
    },
    {
      question: "Can I customize my vault strategy?",
      answer: "Absolutely! You can set custom token allocations, adjust volatility thresholds, configure rebalancing frequency, and define your own risk parameters. Our AI agents execute your strategy autonomously."
    },
    {
      question: "Which tokens are supported?",
      answer: "ReVaultron currently supports major tokens on Hedera including HBAR, USDC, USDT, and other HTS tokens. We're continuously adding support for more tokens based on community demand."
    },
    {
      question: "How often does rebalancing occur?",
      answer: "Rebalancing is triggered automatically when market volatility exceeds your configured thresholds. You can set thresholds from 5% to 50%, with agents monitoring markets 24/7 to optimize your portfolio."
    },
    {
      question: "Is there a minimum deposit?",
      answer: "The minimum deposit is 100 HBAR to ensure efficient rebalancing operations. There's no maximum limit—our infrastructure scales to handle portfolios of any size."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary to-accent w-10 h-10 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ReVaultron</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">How It Works</a>
            <a href="#agents" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Agents</a>
            <a href="#faq" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">FAQ</a>
            <ThemeToggle />
            <WalletButton />
            <Link to="/dashboard">
              <Button variant="default" className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                Launch App <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </nav>
          <Link to="/dashboard" className="md:hidden">
            <Button size="sm" className="gap-2">
              Launch App <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 md:py-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>
        
        <motion.div 
          className="max-w-5xl mx-auto text-center space-y-8"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div 
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Powered by Multi-Agent AI on Hedera
            </span>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold leading-tight tracking-tight"
          >
            Autonomous Portfolio Management,{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Redefined
            </span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Harness the power of AI-driven autonomous agents working 24/7 to optimize your crypto portfolio. Built on Hedera's lightning-fast blockchain for instant rebalancing with near-zero fees.
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <Link to="/dashboard">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 h-14">
                Get Started Free <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-2">
                Watch Demo
              </Button>
            </a>
          </motion.div>

          <motion.div 
            variants={fadeInUp}
            className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>100% non-custodial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>Enterprise security</span>
            </div>
          </motion.div>
          
          <motion.div 
            variants={fadeInUp}
            className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">$2.4M+</div>
              <div className="text-sm text-muted-foreground mt-2">Total Value Locked</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">1,247</div>
              <div className="text-sm text-muted-foreground mt-2">Active Vaults</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">24/7</div>
              <div className="text-sm text-muted-foreground mt-2">AI Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">99.9%</div>
              <div className="text-sm text-muted-foreground mt-2">Uptime</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Social Proof Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/10">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4 border-primary/30">
                <Users className="h-3 w-3 mr-1" /> Trusted by Investors
              </Badge>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Join Thousands of Smart Investors
              </h3>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-2">
                <CircleDollarSign className="h-12 w-12 mx-auto text-primary" />
                <div className="text-3xl font-bold">32%</div>
                <p className="text-sm text-muted-foreground">Average Annual Returns</p>
              </div>
              <div className="text-center space-y-2">
                <TrendingDown className="h-12 w-12 mx-auto text-primary" />
                <div className="text-3xl font-bold">-15%</div>
                <p className="text-sm text-muted-foreground">Reduced Volatility</p>
              </div>
              <div className="text-center space-y-2">
                <Zap className="h-12 w-12 mx-auto text-primary" />
                <div className="text-3xl font-bold">&lt;3s</div>
                <p className="text-sm text-muted-foreground">Avg Rebalancing Time</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-gradient-to-b from-secondary/20 to-background">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="mb-4 border-primary/30">
            <Sparkles className="h-3 w-3 mr-1" /> Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose ReVaultron?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced AI-powered features designed for both novice and experienced crypto investors
          </p>
        </motion.div>
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <Card className="p-8 hover:shadow-2xl transition-all duration-300 h-full border-2 hover:border-primary/20 group">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Multi-Agent AI System</h3>
              <p className="text-muted-foreground leading-relaxed">
                Four specialized AI agents collaborate in real-time to monitor volatility, assess risk, optimize your portfolio, and execute trades autonomously. Each agent brings unique expertise to maximize your returns.
              </p>
            </Card>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Card className="p-8 hover:shadow-2xl transition-all duration-300 h-full border-2 hover:border-primary/20 group">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Lightning-Fast Rebalancing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Automatic portfolio adjustments triggered by real-time market volatility thresholds. Powered by Hedera's fast consensus, rebalancing happens in seconds, ensuring optimal asset allocation at all times.
            </p>
            </Card>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Card className="p-8 hover:shadow-2xl transition-all duration-300 h-full border-2 hover:border-primary/20 group">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Enterprise-Grade Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                Built on Hedera's enterprise-grade network with aBFT consensus, instant finality, minimal fees ($0.0001 per transaction), and carbon-negative operations. Your assets remain in your custody.
            </p>
            </Card>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Card className="p-8 hover:shadow-2xl transition-all duration-300 h-full border-2 hover:border-primary/20 group">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">24/7 Market Monitoring</h3>
              <p className="text-muted-foreground leading-relaxed">
                Continuous market analysis using advanced volatility detection algorithms. Our AI agents never sleep, constantly scanning for opportunities and threats across all your portfolio tokens.
            </p>
            </Card>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Card className="p-8 hover:shadow-2xl transition-all duration-300 h-full border-2 hover:border-primary/20 group">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Advanced Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Comprehensive performance metrics, historical data visualization, and actionable insights. Track every rebalancing event, portfolio change, and profit/loss in real-time with beautiful dashboards.
            </p>
            </Card>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Card className="p-8 hover:shadow-2xl transition-all duration-300 h-full border-2 hover:border-primary/20 group">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <PieChart className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Fully Customizable</h3>
              <p className="text-muted-foreground leading-relaxed">
                Design your perfect investment strategy with custom token allocations, risk parameters, and volatility thresholds. You maintain full control while AI handles the execution.
            </p>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="mb-4 border-primary/30">
            <Cpu className="h-3 w-3 mr-1" /> Simple Process
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes with our simple 4-step process
          </p>
        </motion.div>
        <motion.div 
          className="max-w-5xl mx-auto space-y-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="flex gap-8 items-start relative">
            <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary to-accent opacity-20 hidden md:block" />
            <div className="bg-gradient-to-br from-primary to-accent text-white w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-2xl shadow-lg relative z-10">
              1
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-2xl font-semibold mb-3">Connect & Configure</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Connect your Hedera wallet (HashPack or Blade) and create your vault. Choose your tokens, set custom allocations, and define volatility thresholds that match your risk tolerance. No complex setup—just a few clicks.
              </p>
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="flex gap-8 items-start relative">
            <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary to-accent opacity-20 hidden md:block" />
            <div className="bg-gradient-to-br from-primary to-accent text-white w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-2xl shadow-lg relative z-10">
              2
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-2xl font-semibold mb-3">AI Agents Activate</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Four specialized AI agents immediately start working: Volatility Oracle monitors markets, Portfolio Manager optimizes allocations, Risk Assessment evaluates safety, and Execution Agent handles trades—all coordinated via Hedera Consensus Service for maximum transparency.
              </p>
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="flex gap-8 items-start relative">
            <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary to-accent opacity-20 hidden md:block" />
            <div className="bg-gradient-to-br from-primary to-accent text-white w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-2xl shadow-lg relative z-10">
              3
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-2xl font-semibold mb-3">Automated Optimization</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                When market volatility breaches your thresholds, agents instantly spring into action. They analyze conditions, calculate optimal trades, assess risks, and execute rebalancing—all within seconds. Completely automated, perfectly optimized.
              </p>
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="flex gap-8 items-start relative">
            <div className="bg-gradient-to-br from-primary to-accent text-white w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-2xl shadow-lg relative z-10">
              4
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-2xl font-semibold mb-3">Monitor & Profit</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Watch your portfolio performance in real-time with detailed analytics. View transaction history, agent activity logs, profit/loss charts, and performance metrics. Withdraw anytime—you're always in control of your assets.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Agents Section */}
      <section id="agents" className="container mx-auto px-4 py-20 bg-gradient-to-b from-secondary/20 to-background">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="mb-4 border-primary/30">
            <Bot className="h-3 w-3 mr-1" /> AI Powered
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Meet Your AI Agents</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four specialized AI agents working in perfect harmony via Hedera Consensus Service
          </p>
        </motion.div>
        <motion.div 
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <Card className="p-8 h-full border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-background hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-500/10 w-14 h-14 rounded-xl flex items-center justify-center border-2 border-blue-500/20">
                  <Activity className="h-7 w-7 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Volatility Oracle</h3>
                  <Badge variant="outline" className="mt-1 text-xs border-blue-500/30">
                    Market Intelligence
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Continuously monitors market volatility across all portfolio tokens using real-time price feeds and advanced statistical models. Publishes threshold breach alerts to HCS, triggering coordinated rebalancing actions when needed.
              </p>
            </Card>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Card className="p-8 h-full border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-background hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-purple-500/10 w-14 h-14 rounded-xl flex items-center justify-center border-2 border-purple-500/20">
                  <Cpu className="h-7 w-7 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Portfolio Manager</h3>
                  <Badge variant="outline" className="mt-1 text-xs border-purple-500/30">
                    Strategy Optimizer
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Analyzes current portfolio composition against target allocations. Calculates optimal rebalancing strategies that minimize slippage and trading costs while maintaining desired risk profiles. Publishes execution plans to HCS for review.
              </p>
            </Card>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Card className="p-8 h-full border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-background hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-orange-500/10 w-14 h-14 rounded-xl flex items-center justify-center border-2 border-orange-500/20">
                  <Shield className="h-7 w-7 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Risk Assessment</h3>
                  <Badge variant="outline" className="mt-1 text-xs border-orange-500/30">
                    Safety Guardian
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Evaluates all proposed rebalancing actions for potential risks including market impact, liquidity constraints, and correlation exposure. Approves or rejects execution plans based on comprehensive risk analysis. Your safety net.
              </p>
            </Card>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Card className="p-8 h-full border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-background hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-green-500/10 w-14 h-14 rounded-xl flex items-center justify-center border-2 border-green-500/20">
                  <Zap className="h-7 w-7 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Execution Agent</h3>
                  <Badge variant="outline" className="mt-1 text-xs border-green-500/30">
                    Trade Executor
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Executes approved trades on decentralized exchanges with intelligent routing to minimize slippage. Implements advanced order types and slippage protection. Records all transactions on-chain for complete transparency and auditability.
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30">
              <MessageCircle className="h-3 w-3 mr-1" /> FAQ
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about ReVaultron
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <Card 
                  className={`p-6 cursor-pointer transition-all duration-300 ${
                    activeFaq === index ? 'border-primary/50 shadow-lg' : 'hover:border-primary/30'
                  }`}
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold">{faq.question}</h3>
                    <ChevronRight 
                      className={`h-5 w-5 text-primary flex-shrink-0 transition-transform ${
                        activeFaq === index ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                  {activeFaq === index && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-muted-foreground mt-4 leading-relaxed"
                    >
                      {faq.answer}
                    </motion.p>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-12 md:p-16 text-center bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/5" />
            <div className="relative z-10">
              <Badge variant="outline" className="mb-6 border-primary/30">
                <Sparkles className="h-3 w-3 mr-1" /> Get Started Today
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Automate Your{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Portfolio?
                </span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                Join thousands of investors using AI-powered autonomous rebalancing on Hedera. 
                Create your first vault in under 2 minutes—no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/dashboard">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 h-14">
                    Launch ReVaultron <ChevronRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-2">
                  View Live Demo
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Withdraw anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Full asset custody</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-secondary/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-primary to-accent w-8 h-8 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ReVaultron</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Autonomous portfolio management powered by AI agents on Hedera blockchain.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <Twitter className="h-4 w-4 text-primary" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <Github className="h-4 w-4 text-primary" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <Globe className="h-4 w-4 text-primary" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
                <li><a href="#agents" className="hover:text-primary transition-colors">AI Agents</a></li>
                <li><Link to="/analytics" className="hover:text-primary transition-colors">Analytics</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Audit Reports</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 ReVaultron. Built on Hedera Hashgraph. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span>Audited & Secure</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}