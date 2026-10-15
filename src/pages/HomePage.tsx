import React, { useState, useEffect } from 'react';
import '../css/HomePage.css';

interface StatItem {
  number: string;
  label: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface PricingPackage {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  buttonText: string;
}

const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'features', 'pricing', 'contact'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (currentSection) setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // İstatistikler
  const stats: StatItem[] = [
    { number: "10,000+", label: "Çözülmüş Hata" },
    { number: "500+", label: "Mutlu Müşteri" },
    { number: "24/7", label: "Destek" },
    { number: "99.9%", label: "Uptime" }
  ];

  // Özellikler
  const features: Feature[] = [
    {
      icon: "💾",
      title: "Kapsamlı Hata Veritabanı",
      description: "Binlerce hata kodu ve çözümü içeren geniş veritabanımızdan anında sonuç alın"
    },
    {
      icon: "⚡",
      title: "Hızlı Arama",
      description: "Hata kodunuzu girin, saniyeler içinde detaylı çözüm önerilerini görün"
    },
    {
      icon: "🛡️",
      title: "Güvenli Platform",
      description: "Verileriniz SSL şifreleme ile korunur, gizliliğiniz önceliğimizdir"
    },
    {
      icon: "🔧",
      title: "Makine Uyumluluğu",
      description: "Tüm popüler laser kesim makinesi markalarıyla uyumlu hata kodu veritabanı"
    },
    {
      icon: "⚙️",
      title: "Kolay Kullanım",
      description: "Basit arayüz ile hata kodlarını hızlıca sorgulayın ve çözümleyin"
    },
    {
      icon: "🎯",
      title: "Detaylı Çözümler",
      description: "Her hata kodu için adım adım çözüm kılavuzları ve öneriler"
    }
  ];

  // Fiyatlandırma paketleri
  const packages: PricingPackage[] = [
    {
      name: "Temel",
      price: "₺299",
      period: "/ay",
      description: "Küçük işletmeler için",
      features: [
        "1 makine seçimi",
        "Ücretsiz paketteki tüm özellikler",
        "Öncelikli destek",
        "Detaylı raporlama",
        "API erişimi"
      ],
      popular: false,
      buttonText: "Paketi Seç"
    },
    {
      name: "Pro",
      price: "₺799",
      period: "/ay",
      description: "Büyüyen işletmeler için",
      features: [
        "3 makine seçimi",
        "Temel paketteki tüm özellikler",
        "Gelişmiş analitik",
        "Özel entegrasyonlar",
        "7/24 destek"
      ],
      popular: true,
      buttonText: "Paketi Seç"
    },
    {
      name: "Kurumsal",
      price: "Özel",
      period: "fiyat",
      description: "Büyük organizasyonlar için",
      features: [
        "Sınırsız hata kodu sorgulama",
        "Tüm makine markası desteği",
        "Öncelikli teknik destek",
        "API erişimi",
        "Özel entegrasyonlar"
      ],
      popular: false,
      buttonText: "İletişime Geçin"
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleLogin = () => {
    // Login sayfasına yönlendirme
    window.location.href = '/login';
  };

  const handleSignup = () => {
    // Kayıt sayfasına yönlendirme
    window.location.href = '/register';
  };

  return (
    <div className="homepage">
      {/* Header */}
      <header className="header">
        <div className="nav-container">
          <a href="#hero" className="logo" onClick={() => scrollToSection('hero')}>
            <div className="logo-icon">⚡</div>
            LaserCode Pro
          </a>

          {/* Desktop Navigation */}
          <nav className="nav-menu">
            <a 
              href="#hero" 
              className={activeSection === 'hero' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('hero');
              }}
            >
              Ana Sayfa
            </a>
            <a 
              href="#features" 
              className={activeSection === 'features' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('features');
              }}
            >
              Özellikler
            </a>
            <a 
              href="#pricing" 
              className={activeSection === 'pricing' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('pricing');
              }}
            >
              Fiyatlandırma
            </a>
            <a 
              href="#contact" 
              className={activeSection === 'contact' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('contact');
              }}
            >
              İletişim
            </a>
          </nav>

          <div className="nav-buttons">
            <button className="btn btn-outline" onClick={handleLogin}>
              Sisteme Giriş
            </button>
            <button className="btn btn-primary" onClick={handleSignup}>
              Ücretsiz Deneyin
            </button>
          </div>

          {/* Mobile menu button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="mobile-menu active">
              <div className="mobile-nav">
                <a href="#hero" onClick={() => scrollToSection('hero')}>Ana Sayfa</a>
                <a href="#features" onClick={() => scrollToSection('features')}>Özellikler</a>
                <a href="#pricing" onClick={() => scrollToSection('pricing')}>Fiyatlandırma</a>
                <a href="#contact" onClick={() => scrollToSection('contact')}>İletişim</a>
                <div className="mobile-buttons">
                  <button className="btn btn-outline" onClick={handleLogin}>
                    Sisteme Giriş
                  </button>
                  <button className="btn btn-primary" onClick={handleSignup}>
                    Ücretsiz Deneyin
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="hero">
        <div className="hero-overlay"></div>
        
        <div className="hero-content">
          <div className="hero-left">
            
            
            <h1 className="hero-title">
              <span className="hero-title-line1">Makine</span>
              <span className="hero-title-line2">Hatalarını</span>
              <span className="hero-title-line3">Kolayca <span className="hero-title-highlight">Çözün</span></span>
            </h1>
            
            <p className="hero-description">
              Üretim hattınızı hızlandırın ve maliyetleri düşürün.
            </p>

            <div className="hero-buttons">
              <button className="btn btn-primary btn-large" onClick={handleLogin}>
                Demo Başlat
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section">
        <div className="section-header">
          <h2 className="section-title">Neden LaserCode Pro?</h2>
          <p className="section-subtitle">
            Kapsamlı veritabanı ve kullanıcı dostu arayüzümüz ile laser kesim süreçlerinizi optimize edin
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section">
        <div className="section-header">
          <h2 className="section-title">Size Uygun Paketi Seçin</h2>
          <p className="section-subtitle">
            İhtiyacınıza göre esnek fiyatlandırma seçenekleri
          </p>
        </div>

        <div className="pricing-grid">
          {packages.map((pkg, index) => (
            <div key={index} className={`price-card ${pkg.popular ? 'popular' : ''}`}>
              {pkg.popular && (
                <div className="popular-badge">En Popüler</div>
              )}
              
              <div className="price-header">
                <h3 className="price-name">{pkg.name}</h3>
                <p className="price-description">{pkg.description}</p>
                <div className="price-amount">
                  <span className="price-value">{pkg.price}</span>
                  <span className="price-period">{pkg.period}</span>
                </div>
              </div>

              <ul className="price-features">
                {pkg.features.map((feature, featureIndex) => (
                  <li key={featureIndex}>
                    <span className="check-icon">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                className={`btn ${pkg.popular ? 'btn-primary' : 'btn-outline'} btn-large`}
                style={{ width: '100%' }}
                onClick={() => {
                  if (pkg.name === 'Kurumsal') {
                    scrollToSection('contact');
                  } else {
                    handleSignup();
                  }
                }}
              >
                {pkg.buttonText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section">
        <div className="contact-content">
          <h2 className="contact-title">Hemen Başlayın</h2>
          <p className="contact-description">
            Laser kesim süreçlerinizi optimize etmeye hazır mısınız?
          </p>
          
          <div className="contact-buttons">
            <button className="btn btn-outline btn-large">
              Satış Ekibi ile Görüşün
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <a href="#hero" className="logo" onClick={() => scrollToSection('hero')}>
            <div className="logo-icon">⚡</div>
            LaserCode Pro
          </a>
          
          <div className="footer-links">
            <a href="#">Gizlilik</a>
            <a href="#">Şartlar</a>
            <a href="#">Destek</a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 LaserCode Pro. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;