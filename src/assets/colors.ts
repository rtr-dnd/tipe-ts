export interface Theme {
  isDark: boolean,
  text: string,
  textGrey: string,
  textGreyDarker: string,
  border: string,
  borderDarker: string,
  background: string,
  backgroundTransparent: string,
}

export const light: Theme = {
  isDark: false,
  text: 'rgba(0, 0, 0, 0.7)',
  textGrey: 'rgba(0, 0, 0, 0.4)',
  textGreyDarker: 'rgba(0, 0, 0, 0.6)',
  border: 'rgba(0, 0, 0, 0.1)',
  borderDarker: 'rgba(0, 0, 0, 0.2)',
  background: '#fff',
  backgroundTransparent: 'rgba(255, 255, 255, 0.95)'
}

export const dark: Theme = {
  isDark: true,
  text: 'rgba(255, 255, 255, 0.83)',
  textGrey: 'rgba(255, 255, 255, 0.51)',
  textGreyDarker: 'rgba(255, 255, 255, 0.7)',
  border: 'rgba(255, 255, 255, 0.16)',
  borderDarker: 'rgba(255, 255, 255, 0.25)',
  background: '#000',
  backgroundTransparent: 'rgba(0, 0, 0, 0.9)'
}
