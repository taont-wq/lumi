/**
 * SeoJsonLd — dữ liệu có cấu trúc cho Google (ItemList căn hộ).
 * File mới 100%, không sửa logic cũ. Render 1 lần trên trang chủ.
 */

import React from 'react';
import { ApartmentUnit } from '../types';

interface SeoJsonLdProps {
  apartments: ApartmentUnit[];
}

export const SeoJsonLd: React.FC<SeoJsonLdProps> = ({ apartments }) => {
  if (!apartments || apartments.length === 0) return null;
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : '';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Danh sách căn hộ tra cứu',
    numberOfItems: apartments.length,
    itemListElement: apartments.slice(0, 100).map((apt, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: origin + '/?unit=' + encodeURIComponent(apt.unitCode),
      name: `${apt.unitTypeName} ${apt.unitCode} - ${apt.projectName}`,
    })),
  };
  return (
    <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
  );
};
