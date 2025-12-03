"use client";

import React, { useState } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '#' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Why Bitcoin', href: '#why-bitcoin' },
    { label: 'Login', href: '#' },
    { label: 'FAQs', href: '#faqs' },
  ];

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>
          <img src="/images/logo.svg" alt="Logo" style={styles.logoImage} />
        </div>

        <div style={styles.hamburger} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <div style={styles.line}></div>
          <div style={styles.line}></div>
          <div style={styles.line}></div>
        </div>

        {isMenuOpen && (
          <div style={styles.dropdownMenu}>
            <button style={styles.closeButton} onClick={() => setIsMenuOpen(false)}>×</button>
            {navItems.map((item) => (
              <a key={item.label} href={item.href} style={styles.dropdownLink}>{item.label}</a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.headline}>
            <div style={styles.headlineLine1}>Empowering Chamas to Save</div>
            <div style={styles.headlineLine2}>Grow & Thrive</div>
          </div>

          <div style={styles.subtitle}>
            <div style={styles.subtitleLine1}>Manage contributions, track savings,</div>
            <div style={styles.subtitleLine2}>and build financial growth together</div>
          </div>

          <div style={styles.buttons}>
            <div style={styles.buttonRow}>
              <button style={styles.signUpButton}>Sign Up</button>
              <button style={styles.loginButton}>Login</button>
            </div>
            <button style={styles.bitcoinButton}>Learn About Bitcoin</button>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: 'white' },
  navbar: {
    backgroundColor: 'white', padding: '16px 24px', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center', position: 'fixed',
    top: 0, left: 0, right: 0, zIndex: 1000, borderBottom: '1px solid #e5e7eb'
  },
  logo: { display: 'flex', alignItems: 'center' },
  logoImage: { width: '40px', height: '40px', objectFit: 'contain' },
  hamburger: { display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer', padding: '8px' },
  line: { width: '24px', height: '2px', backgroundColor: '#374151', borderRadius: '1px' },
  dropdownMenu: {
    position: 'absolute', top: '70px', right: '24px', backgroundColor: '#059669',
    borderRadius: '12px', padding: '16px', minWidth: '200px', zIndex: 1001
  },
  closeButton: {
    position: 'absolute', top: '8px', right: '12px', backgroundColor: 'transparent',
    border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer'
  },
  dropdownLink: {
    display: 'block', padding: '12px 16px', color: 'white', textDecoration: 'none',
    fontSize: '16px', borderRadius: '8px', marginBottom: '4px'
  },
  heroSection: {
    padding: '140px 20px 80px', textAlign: 'center',
    background: 'linear-gradient(to right, #F6E9C5 0%, #F6E9C5 30%, #5CB79A 70%, #5CB79A 100%)'
  },
  heroContent: { maxWidth: '800px', margin: '0 auto' },
  headline: { marginBottom: '24px' },
  headlineLine1: { fontSize: '56px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' },
  headlineLine2: { fontSize: '56px', fontWeight: 'bold', color: '#111827' },
  subtitle: { marginBottom: '48px' },
  subtitleLine1: { fontSize: '20px', color: '#6B7280', lineHeight: '1.6' },
  subtitleLine2: { fontSize: '20px', color: '#6B7280', lineHeight: '1.6' },
  buttons: { display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' },
  buttonRow: { display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' },
  signUpButton: {
    padding: '16px 40px', backgroundColor: '#059669', color: 'white', border: 'none',
    borderRadius: '8px', fontSize: '18px', fontWeight: '600', cursor: 'pointer'
  },
  loginButton: {
    padding: '16px 40px', backgroundColor: 'transparent', color: '#059669',
    border: '2px solid #059669', borderRadius: '8px', fontSize: '18px', fontWeight: '600', cursor: 'pointer'
  },
  bitcoinButton: {
    padding: '16px 40px', backgroundColor: '#FFF7ED', color: '#F7931A',
    border: '2px solid #F7931A', borderRadius: '8px', fontSize: '18px', fontWeight: '600', cursor: 'pointer'
  },
};
