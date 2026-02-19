import React from 'react';
import { Link } from 'react-router-dom';
import './RecentOrders.css';

const RecentOrders = ({ orders }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger'
    };
    return colors[status?.toLowerCase()] || 'secondary';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return labels[status?.toLowerCase()] || status;
  };

  return (
    <div className="recent-orders">
      <div className="recent-orders-header">
        <h4>Commandes récentes</h4>
        <Link to="/dashboard/orders" className="view-all">
          Voir tout
        </Link>
      </div>

      {!orders?.length ? (
        <div className="no-orders">
          <p>Aucune commande récente</p>
        </div>
      ) : (
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>N° Commande</th>
                <th>Date</th>
                <th>Client</th>
                <th>Total</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="order-number">#{order.orderNumber}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>{order.userName || 'Client'}</td>
                  <td className="order-total">{order.finalAmount?.toFixed(2)}€</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td>
                    <Link to={`/dashboard/orders/${order.id}`} className="order-action">
                      Détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;