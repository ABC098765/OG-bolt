import React from 'react';

interface ProductStructuredDataProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price?: number;
    displayPrice?: string;
    category?: string;
    imageUrls?: string[];
    image_urls?: string[];
    image?: string;
    rating?: number;
    reviewCount?: number;
    inStock?: boolean;
    stock?: number;
    brand?: string;
    sku?: string;
  };
}

const ProductStructuredData: React.FC<ProductStructuredDataProps> = ({ product }) => {
  // Get product images
  const productImages = product.imageUrls || product.image_urls || (product.image ? [product.image] : []);
  const primaryImage = productImages.length > 0 ? productImages[0] : null;
  
  // Extract numeric price
  const numericPrice = (() => {
    if (product.displayPrice && typeof product.displayPrice === 'string') {
      const numericPart = product.displayPrice.replace(/[^\d.]/g, '');
      return parseFloat(numericPart) || product.price || 0;
    }
    return product.price || 0;
  })();

  // Determine availability
  const isInStock = product.inStock !== false && (product.stock === undefined || product.stock > 0);
  const availability = isInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

  // Create structured data
  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `Fresh ${product.name} available for delivery from Super Fruit Center`,
    "image": primaryImage ? [primaryImage] : [],
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Super Fruit Center"
    },
    "category": product.category || "Fresh Fruits",
    "sku": product.sku || product.id,
    "offers": {
      "@type": "Offer",
      "price": numericPrice.toString(),
      "priceCurrency": "INR",
      "availability": availability,
      "seller": {
        "@type": "Organization",
        "name": "Super Fruit Center",
        "url": "https://superfruitcenter.netlify.app"
      },
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "INR"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 2,
            "maxValue": 4,
            "unitCode": "HUR"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 2,
            "unitCode": "DAY"
          }
        }
      }
    }
  };

  // Add aggregate rating if available
  if (product.rating && product.rating > 0) {
    structuredData.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.rating.toString(),
      "bestRating": "5",
      "worstRating": "1",
      "reviewCount": product.reviewCount?.toString() || "1"
    };
  }

  // Add additional images if available
  if (productImages.length > 1) {
    structuredData.image = productImages;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default ProductStructuredData;