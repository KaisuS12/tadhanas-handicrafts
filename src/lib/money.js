// Bouquet prices are whole pesos; null/blank means "no price shown"
export const hasPrice = (n) => typeof n === 'number' && n > 0
export const peso = (n) => '₱' + Math.round(n).toLocaleString('en-PH')
