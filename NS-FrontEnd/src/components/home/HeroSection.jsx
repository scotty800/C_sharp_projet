import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import './HeroSection.css';

const HeroSection = () => {
    return (
        <section className="hero">
            <div className="hero-background">
                <div className="hero-overlay"></div>
                <img
                  src="/hero-bg.jpg"
                  alt="Hero background"
                  className="hero-image"
                />
            </div>

            <div className="hero-content">
                <div className="hero-text">
                    <h1 className="hero-tile">
                        Découvrez des boutiques <span className="hero-highlight">uniques</span>
                    </h1>
                    <p className="hero-subtitle">
                        Des milliers de produits artisanaux, vintage et créatifs, 
                        directement des vendeurs indépendants
                    </p>

                    <div className="hero-actions">
                        <Button size='lg' onClick={() => window.location.href = '/shops'}>
                            Explorer les boutiques
                        </Button>
                        <Button variant='outiline' size='lg' onClick={() => window.location.href = '/how-it-works'}>
                            Comment ça marche ?
                        </Button>
                    </div>

                    <div className='hero-stats'>
                        <div className='stat-item'>
                            <span className='stat-number'>10k+</span>
                            <span className='stat-label'>Boutiques</span>
                        </div>
                        <div className='stat-item'>
                            <span className='stat-number'>50k+</span>
                            <span className='stat-label'>Produits</span>
                        </div>
                        <div className='stat-item'>
                            <span className='stat-number'>100k+</span>
                            <span className='stat-label'>Acheteurs</span>
                        </div>
                    </div>
                </div>

                <div className='hero-featured'>
                    <div className='featured-card'>
                        <span className='featured-badge'>À la une</span>
                        <img src='/featured-shop.jpg' alt='Featured shop' />
                        <div className='featured-info'>
                            <h3>Créez votre boutique</h3>
                            <p>Rejoignez notre communauté de vendeurs</p>
                            <Link to="/create-shop" className="featured-link">
                                Vendre maintenant →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className="hero-wave">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">*
                <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 
                67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 
                120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
                fill="white"/>
                </svg>
            </div>
        </section>
    );
};

export default HeroSection;