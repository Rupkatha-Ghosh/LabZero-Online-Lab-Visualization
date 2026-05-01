import React from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Mail, ExternalLink, Globe, Shield, Scale } from 'lucide-react';
import { Logo } from '../common/Logo';
import { Skeleton } from 'boneyard-js/react';

interface FooterProps {
  skeletonDebug?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ skeletonDebug = false }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Simulations',
      links: [
        { name: 'Physics Engine', href: '#' },
        { name: 'Chemistry Lab', href: '#' },
        { name: 'Biology Explorer', href: '#' },
        { name: 'Math Visualizer', href: '#' },
      ],
    },
    {
      title: 'Platform',
      links: [
        { name: 'Features', href: '#' },
        { name: 'Pricing', href: '#' },
        { name: 'Dashboard', href: '#' },
        { name: 'Glossary', href: '#' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '#' },
        { name: 'Tutorials', href: '#' },
        { name: 'Community', href: '#' },
        { name: 'Blog', href: '#' },
      ],
    },
  ];

  return (
    <Skeleton name="landing-footer" loading={false}>
      <footer className="relative bg-[var(--bg-deep)] border-t border-[var(--border-glass)] pt-24 pb-12 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[var(--color-primary)]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[var(--color-secondary)]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">

            {/* Brand Column */}
            <div className="lg:col-span-4 space-y-6">
              <Logo size="lg" />
              <p className="text-[var(--text-muted)] text-[15px] leading-relaxed max-w-sm">
                The world's most advanced 3D virtual laboratory. Empowering the next generation of scientists with immersive, interactive learning experiences.
              </p>
              <div className="flex items-center gap-4 pt-2">
                {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-full border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/5 transition-all"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-1" /> {/* Spacer */}

            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
              {footerLinks.map((section, i) => (
                <div key={i} className="space-y-6">
                  <h4 className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-widest">{section.title}</h4>
                  <ul className="space-y-4">
                    {section.links.map((link, j) => (
                      <li key={j}>
                        <a href={link.href} className="text-[14px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 group">
                          {link.name}
                          <ExternalLink size={12} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-12 border-t border-[var(--border-glass)] flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
              <span>© {currentYear} LabZero Analytics Inc.</span>
              <span className="hidden md:inline text-[var(--border-glass)]">•</span>
              <span className="hidden md:inline font-mono text-[10px] opacity-50 tracking-wider">SEC_ENV_ENABLED</span>
            </div>

            <div className="flex items-center gap-8 text-[13px] text-[var(--text-muted)]">
              <a href="#" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5">
                <Shield size={14} /> Privacy
              </a>
              <a href="#" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5">
                <Scale size={14} /> Terms
              </a>
              <a href="#" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5">
                <Globe size={14} /> System Status
              </a>
            </div>
          </div>
        </div>
      </footer>
    </Skeleton>
  );
};
