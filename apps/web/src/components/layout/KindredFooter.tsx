import React from 'react';
import { Link } from 'react-router';
import { HorizonLogo } from '../common/HorizonLogo';
import { ShieldCheck, Lock, ExternalLink, CheckCircle2 } from 'lucide-react';

export const KindredFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#FFFFFF] border-t border-[#E5E5E5] text-neutral-600 text-xs py-16 px-6 sm:px-8">
      <div className="max-w-[1120px] mx-auto space-y-12">
        
        {/* Top: Brand info and System Operational Status Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-neutral-100">
          <Link to="/" className="flex items-center gap-2.5">
            <HorizonLogo size={28} />
            <span className="text-lg font-bold tracking-tight text-[#0A0A0A] font-sans">
              Horizon
            </span>
          </Link>

          {/* Status: All systems operational • MST Block #... */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAFAF9] border border-[#E5E5E5] text-[#0A0A0A] text-xs font-mono font-medium shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>All systems operational &bull; MST Block #4819203</span>
          </div>
        </div>

        {/* 4 Requested Columns: PLATFORM / AI & MODELS / GOVERNANCE / NETWORK */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Column 1: PLATFORM */}
          <div className="space-y-3">
            <div className="font-semibold text-neutral-900 text-xs uppercase tracking-wider font-mono">
              PLATFORM
            </div>
            <ul className="space-y-2 text-xs">
              <li><Link to="/dashboard" className="hover:text-black transition-colors">Command Center</Link></li>
              <li><Link to="/topology" className="hover:text-black transition-colors">Topological DAG Mesh</Link></li>
              <li><Link to="/recovery" className="hover:text-black transition-colors">Recovery Orchestrator</Link></li>
              <li><Link to="/observability" className="hover:text-black transition-colors">Live Telemetry &amp; APM</Link></li>
              <li><Link to="/dashboard" className="hover:text-black transition-colors">Incident War Room</Link></li>
            </ul>
          </div>

          {/* Column 2: AI & MODELS */}
          <div className="space-y-3">
            <div className="font-semibold text-neutral-900 text-xs uppercase tracking-wider font-mono">
              AI &amp; MODELS
            </div>
            <ul className="space-y-2 text-xs">
              <li><Link to="/architect" className="hover:text-black transition-colors">Sarvam-105B Reasoning</Link></li>
              <li><Link to="/architect" className="hover:text-black transition-colors">Autonomous Flow Architect</Link></li>
              <li><Link to="/docs" className="hover:text-black transition-colors">Model Context Protocol (MCP)</Link></li>
              <li><Link to="/dashboard" className="hover:text-black transition-colors">Natural Language Copilot</Link></li>
              <li><Link to="/docs" className="hover:text-black transition-colors">Heuristic Root-Cause Models</Link></li>
            </ul>
          </div>

          {/* Column 3: GOVERNANCE */}
          <div className="space-y-3">
            <div className="font-semibold text-neutral-900 text-xs uppercase tracking-wider font-mono">
              GOVERNANCE
            </div>
            <ul className="space-y-2 text-xs">
              <li><Link to="/audit" className="hover:text-black transition-colors">Immutable Audit Vault</Link></li>
              <li><Link to="/subscription" className="hover:text-black transition-colors">ZXPASS Token-Gating</Link></li>
              <li><Link to="/patents" className="hover:text-black transition-colors">US Patent Citations</Link></li>
              <li><Link to="/policies" className="hover:text-black transition-colors">Security &amp; SLA Policies</Link></li>
              <li><Link to="/docs" className="hover:text-black transition-colors">BridgeKey EIP-712 Gates</Link></li>
            </ul>
          </div>

          {/* Column 4: NETWORK */}
          <div className="space-y-3">
            <div className="font-semibold text-neutral-900 text-xs uppercase tracking-wider font-mono">
              NETWORK
            </div>
            <ul className="space-y-2 text-xs">
              <li className="font-mono text-[11px] text-neutral-500">MST Testnet (91562037)</li>
              <li><Link to="/audit" className="hover:text-black transition-colors">Smart Contract Registry</Link></li>
              <li><Link to="/docs" className="hover:text-black transition-colors">JSON-RPC 2.0 Endpoints</Link></li>
              <li><Link to="/topology" className="hover:text-black transition-colors">Kubernetes VPC Bridge</Link></li>
              <li><Link to="/audit" className="hover:text-black transition-colors">Merkle Root Attestations</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-400 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} Horizon Autonomous Infrastructure Recovery Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/policies" className="hover:text-neutral-700 transition-colors">Privacy</Link>
            <Link to="/policies" className="hover:text-neutral-700 transition-colors">Terms of Service</Link>
            <Link to="/patents" className="hover:text-neutral-700 transition-colors">Patent Disclosures</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default KindredFooter;

