import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Shield, Zap, CheckCircle2, ArrowRight, Lock, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-xl flex items-center justify-center shadow-md">
              <FileText className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PDF Studio
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Sign In
            </Link>
            <Link to="/register" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="h-3.5 w-3.5" /> Client-Side Privacy & High Performance
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto mb-6">
            Edit PDFs directly in your browser with absolute privacy.
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            PDF Studio lets you view, annotate, whiteout, sign, and modify PDFs instantly without uploading sensitive files to external servers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-xl font-medium shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-base transition"
            >
              Start Editing Free <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-3.5 rounded-xl font-medium shadow-sm transition"
            >
              Sign In to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
              Everything you need to manage and edit PDFs
            </h2>
            <p className="text-slate-600 text-lg">
              Designed for speed, security, and professional document workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-xl w-fit mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">100% Client-Side Privacy</h3>
              <p className="text-slate-600">
                Your PDFs are processed locally in your browser using PDF.js and pdf-lib. Your confidential data never leaves your device during editing.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl w-fit mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Powerful Editing Tools</h3>
              <p className="text-slate-600">
                Add text, whiteout sensitive information with permanent PDF rectangles, and draw or upload professional signatures effortlessly.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl w-fit mb-6">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Secure Cloud Sync</h3>
              <p className="text-slate-600">
                Authenticate with JWT security, save your document history, manage your library, and access your files securely anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-bold">PDF Studio</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} PDF Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}