import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import './NotFound.css';

const NotFound = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="not-found-page"
    >
      <div className="not-found-content">
        <div className="not-found-animation">
          <span className="number">4</span>
          <span className="zero">0</span>
          <span className="number">4</span>
        </div>
        
        <h1>Page non trouvée</h1>
        <p>
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="not-found-actions">
          <Button onClick={() => window.history.back()}>
            Page précédente
          </Button>
          <Link to="/">
            <Button variant="outline">
              Accueil
            </Button>
          </Link>
        </div>

        <div className="not-found-suggestions">
          <h2>Vous pourriez être intéressé par :</h2>
          <div className="suggestions-links">
            <Link to="/shops">Boutiques</Link>
            <Link to="/products">Produits</Link>
            <Link to="/categories">Catégories</Link>
            <Link to="/deals">Promotions</Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotFound;