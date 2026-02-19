import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ShopCard from '../components/shops/ShopCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Spinner from '../components/common/Spinner';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { shopsApi } from '../api/shops';
import './ShopList.css';

const ShopList = () => {
  // États
  const [shops, setShops] = useState([]); // Initialisé à un tableau vide
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sort: 'trending'
  });

  // Fonction pour récupérer les boutiques
  const fetchShops = useCallback(async (reset = false) => {
    // Gestion des états de chargement
    if (reset) {
      setLoading(true);
      setShops([]); // Réinitialisation explicite
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const currentPage = reset ? 1 : page;
      const response = await shopsApi.getShops({
        page: currentPage,
        pageSize: 12,
        ...filters
      });

      // ✅ ÉTAPE CRITIQUE : Validation et normalisation des données
      // L'API pourrait retourner { data: [...] } ou directement [...]
      let shopsData = [];
      if (response && response.data) {
        shopsData = response.data;
      } else if (Array.isArray(response)) {
        shopsData = response;
      } else if (response && response.items) {
        shopsData = response.items; // Autre format possible
      }

      // ✅ Vérification que shopsData est bien un tableau
      if (!Array.isArray(shopsData)) {
        console.error('shopsData is not an array:', shopsData);
        shopsData = []; // Fallback sûr
      }

      // Mise à jour des états
      if (reset) {
        setShops(shopsData);
      } else {
        setShops(prevShops => {
          // Vérification que prevShops est un tableau
          const currentShops = Array.isArray(prevShops) ? prevShops : [];
          return [...currentShops, ...shopsData];
        });
      }

      // Déterminer s'il y a plus de résultats
      setHasMore(shopsData.length === 12);
      
      // Mise à jour du numéro de page
      if (!reset) {
        setPage(prev => prev + 1);
      } else {
        setPage(2);
      }

    } catch (err) {
      console.error('Error fetching shops:', err);
      setError('Impossible de charger les boutiques. Veuillez réessayer.');
      // En cas d'erreur, on s'assure que shops reste un tableau vide si reset
      if (reset) {
        setShops([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page, filters]); // Dépendances

  // Effet pour le chargement initial et les changements de filtres
  useEffect(() => {
    fetchShops(true);
  }, [filters, fetchShops]);

  // Configuration de l'infinite scroll
  const { lastElementRef } = useInfiniteScroll(
    () => fetchShops(false),
    hasMore && !loading && !loadingMore
  );

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ search: '', category: '', sort: 'trending' });
  };

  // Catégories pour le filtre
  const categories = [
    'Mode', 'Électronique', 'Maison', 'Beauté',
    'Sports', 'Livres', 'Artisanat', 'Vintage'
  ];

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="shop-list-loading">
        <div className="container">
          <div className="shops-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="shop-card-skeleton">
                <div className="skeleton-image" />
                <div className="skeleton-content">
                  <div className="skeleton-logo" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop-list-error">
        <div className="container">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <h2>Une erreur est survenue</h2>
            <p>{error}</p>
            <Button onClick={() => fetchShops(true)}>
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ RENDU PRINCIPAL
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="shop-list-page"
    >
      {/* Header */}
      <div className="shop-list-header">
        <div className="container">
          <h1 className="shop-list-title">Toutes les boutiques</h1>
          <p className="shop-list-subtitle">
            Découvrez des milliers de boutiques uniques et leurs créations
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="shop-list-filters">
        <div className="container">
          <div className="filters-grid">
            <div className="filter-group">
              <Input
                type="text"
                placeholder="Rechercher une boutique..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="search-filter"
              />
            </div>

            <div className="filter-group">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="filter-select"
              >
                <option value="trending">Tendances</option>
                <option value="newest">Plus récentes</option>
                <option value="popular">Plus populaires</option>
                <option value="name">Nom (A-Z)</option>
                <option value="products">Plus de produits</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grille des boutiques */}
      <div className="shop-list-content">
        <div className="container">
          {/* ✅ Vérification critique : shops doit être un tableau et avoir du contenu */}
          {!Array.isArray(shops) || shops.length === 0 ? (
            <div className="no-results">
              <span className="no-results-icon">🏪</span>
              <h3>Aucune boutique trouvée</h3>
              <p>Essayez de modifier vos filtres de recherche</p>
              <Button 
                variant="outline" 
                onClick={handleResetFilters}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <>
              <div className="shops-grid">
                {shops.map((shop, index) => (
                  <div
                    key={shop.id}
                    ref={index === shops.length - 1 ? lastElementRef : null}
                  >
                    {/* Vérification que shop est défini */}
                    {shop && <ShopCard shop={shop} />}
                  </div>
                ))}
              </div>

              {/* Indicateur de chargement pour le scroll infini */}
              {loadingMore && (
                <div className="loading-more">
                  <Spinner />
                </div>
              )}

              {/* Message de fin */}
              {!hasMore && shops.length > 0 && (
                <div className="no-more-results">
                  <p>Vous avez vu toutes les boutiques</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ShopList;