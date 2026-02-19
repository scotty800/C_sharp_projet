import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productsApi } from '../../api/products';
import './EditProduct.css';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    const data = await productsApi.getProductById(id);
    setProduct(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await productsApi.updateProduct(id, product);
      navigate(`/product/${id}`);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="edit-product-page"
    >
      <div className="container">
        <h1>Modifier le produit</h1>
        {/* Formulaire d'édition */}
      </div>
    </motion.div>
  );
};

export default EditProduct;