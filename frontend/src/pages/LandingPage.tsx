import { Link } from 'react-router-dom';
import { FileText, Zap, Shield, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <header className="py-6 px-8 flex justify-between items-center border-b border-surface-container">
        <div className="flex items-center gap-2">
          <FileText className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold font-sans">PrecisionOCR</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link to="/auth" className="text-on-surface hover:text-primary transition-colors">Features</Link>
          <Link to="/auth" className="text-on-surface hover:text-primary transition-colors">Pricing</Link>
          <Link to="/auth" className="text-on-surface hover:text-primary transition-colors">Sign In</Link>
          <Link to="/auth" className="bg-primary text-white px-5 py-2.5 rounded-md hover:bg-primary-container transition-colors font-medium">
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Intelligent Document Data Extraction
          </h1>
          <p className="text-xl text-on-surface/70 mb-10 max-w-2xl mx-auto">
            Transform scanned documents and images into editable, searchable data with our high-accuracy OCR engine. Fast, secure, and built for professionals.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/auth" className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-primary-container transition-all shadow-lg hover:shadow-xl">
              Start Scanning Now <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full px-8">
          <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm border border-outline-variant/30 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-surface-container flex items-center justify-center rounded-full mb-6">
              <Zap className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
            <p className="text-on-surface/70">Our optimized engine processes documents in seconds, not minutes.</p>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm border border-outline-variant/30 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-surface-container flex items-center justify-center rounded-full mb-6">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">High Accuracy</h3>
            <p className="text-on-surface/70">Advanced preprocessing algorithms ensure pristine text extraction even from noisy images.</p>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm border border-outline-variant/30 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-surface-container flex items-center justify-center rounded-full mb-6">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Secure Storage</h3>
            <p className="text-on-surface/70">Your scans are safely stored and easily manageable in your private dashboard.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
