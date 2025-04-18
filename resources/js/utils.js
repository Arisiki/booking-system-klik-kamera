

export const formatRupiah = (value) => {
  if (isNaN(value)) return null;

  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);

  return formatted;
};


