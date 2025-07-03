export function formatNumberWithCommas(number: number | null) {
  return number?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
