export const formatIndianDate = (dateString: string) => {
  if (!dateString) return '';

  const date = new Date(dateString);

  return date
    .toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .replace(',', '');
};

export const data = () => {};
