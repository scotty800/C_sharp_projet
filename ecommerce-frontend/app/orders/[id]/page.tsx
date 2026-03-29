'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/api/orders';
import { generateInvoice } from '@/services/api/invoice';
import { OrderResponseDto } from '@/types/order';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiDownload, FiCreditCard } from 'react-icons/fi';
import { formatPrice, formatDate } from '@/services/utils/formatters';
import { getImageUrl } from '@/utils/imageUtils';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrderById(Number(id));
        setOrder(data);
      } catch (error) {
        console.error('Erreur chargement commande:', error);
        toast.error('Impossible de charger la commande');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, user, router]);

  const handleDownloadInvoice = () => {
    if (!order || !user) return;
    
    try {
      generateInvoice(order, user);
      toast.success('Facture téléchargée');
    } catch (error) {
      console.error('Erreur génération facture:', error);
      toast.error('Erreur lors de la génération de la facture');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <FiCheckCircle className="text-green-500" size={24} />;
      case 'Shipped':
        return <FiTruck className="text-blue-500" size={24} />;
      case 'Processing':
        return <FiPackage className="text-yellow-500" size={24} />;
      case 'Pending':
        return <FiClock className="text-gray-500" size={24} />;
      default:
        return <FiClock className="text-gray-500" size={24} />;
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      'Pending': 'En attente',
      'Processing': 'En traitement',
      'Shipped': 'Expédiée',
      'Delivered': 'Livrée',
      'Cancelled': 'Annulée',
    };
    return map[status] || status;
  };

  const steps = [
    { key: 'Pending', label: 'Commande confirmée' },
    { key: 'Processing', label: 'En préparation' },
    { key: 'Shipped', label: 'Expédiée' },
    { key: 'Delivered', label: 'Livrée' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order?.status);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Commande non trouvée</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Fil d'Ariane */}
        <div className="mb-6">
          <Link href="/orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary">
            <FiArrowLeft />
            Retour à mes commandes
          </Link>
        </div>

        {/* En-tête avec bouton de téléchargement */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Commande #{order.orderNumber}</h1>
              <p className="text-gray-600">
                Passée le {formatDate(order.createdAt, 'long')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1
                ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'}`}>
                {getStatusIcon(order.status)}
                {getStatusText(order.status)}
              </span>
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              >
                <FiDownload size={18} />
                Télécharger la facture
              </button>
            </div>
          </div>
        </div>

        {/* Timeline de suivi */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6">Suivi de commande</h2>
          <div className="relative">
            {/* Barre de progression */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(((currentStepIndex + 1) / steps.length) * 100, 100)}%` }}
              />
            </div>
            
            {/* Étapes */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <div key={step.key} className="text-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2
                      ${isCompleted ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {index === 0 && <FiCheckCircle size={20} />}
                      {index === 1 && <FiPackage size={20} />}
                      {index === 2 && <FiTruck size={20} />}
                      {index === 3 && <FiCheckCircle size={20} />}
                    </div>
                    <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : 'text-gray-500'}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Articles commandés */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Articles commandés</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={getImageUrl(item.productImage) ||'/images/product-placeholder.svg'}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/product-placeholder.svg';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Link href={`/product/${item.productId}`} className="font-medium hover:text-primary">
                    {item.productName}
                  </Link>
                  <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                  <p className="text-sm font-semibold text-primary mt-1">
                    {formatPrice(item.totalPrice)}
                  </p>
                </div>
                {item.shopName && (
                  <div className="text-right text-sm text-gray-500">
                    <span className="block">Vendu par</span>
                    <Link href={`/shop/${item.shopId}`} className="hover:text-primary">
                      {item.shopName}
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Récapitulatif et paiement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Récapitulatif des prix */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Récapitulatif</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TVA (20%)</span>
                <span>{formatPrice(order.taxAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-4 border-t">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.finalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Informations de paiement */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Paiement</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Méthode de paiement</span>
                <span className="font-medium">
                  {order.paymentMethod === 'Card' ? 'Carte bancaire' : order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Statut du paiement</span>
                <span className={`font-medium ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus === 'Paid' ? 'Payé' : 'En attente'}
                </span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payé le</span>
                  <span className="font-medium">{formatDate(order.paidAt)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 mt-4 p-3 bg-gray-50 rounded-lg">
                <FiCreditCard className="text-primary" size={20} />
                <span className="text-sm text-gray-600">Paiement sécurisé par Stripe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Adresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-2">Adresse de livraison</h2>
            <p className="text-gray-600">
              {order.shippingAddress}<br />
              {order.shippingPostalCode} {order.shippingCity}<br />
              {order.shippingCountry}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-2">Adresse de facturation</h2>
            <p className="text-gray-600">
              {order.billingAddress}<br />
              {order.billingPostalCode} {order.billingCity}<br />
              {order.billingCountry}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}