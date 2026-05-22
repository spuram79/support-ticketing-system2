import Link from 'next/link';
import { Ticket, Users, BarChart3, Shield, Zap, Globe } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Ticket className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">Support Ticketing System</h1>
            </div>
            <Link
              href="/login"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Enterprise-Grade Ticketing & Issue Management
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A scalable, multi-channel support system for Hardware & Software support operations.
            Handles 5,000+ tickets/day with sub-500ms API latency.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Multi-Channel Support</h3>
            <p className="text-gray-600">
              Ingest tickets from email, phone, WhatsApp, SMS, and web portal with intelligent deduplication.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Automation</h3>
            <p className="text-gray-600">
              AI-powered categorization, auto-routing, and SLA management with escalation workflows.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
            <p className="text-gray-600">
              GDPR & ISO 27001 compliant with role-based access control and audit trails.
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white rounded-xl p-8 shadow-md mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">5,000+</div>
              <div className="text-gray-600">Tickets/day</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">50+</div>
              <div className="text-gray-600">Concurrent Agents</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">&lt;500ms</div>
              <div className="text-gray-600">API Latency (p95)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">99.5%</div>
              <div className="text-gray-600">Availability</div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
          >
            Get Started
          </Link>
          <a
            href="/api"
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            API Documentation
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Support Ticketing System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}