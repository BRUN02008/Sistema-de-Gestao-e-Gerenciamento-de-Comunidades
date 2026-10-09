export function onlyDigits(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

export function formatCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (base: string, factor: number) => {
    const sum = [...base].reduce((total, char) => total + Number(char) * factor--, 0);
    const result = (sum * 10) % 11;
    return result === 10 ? 0 : result;
  };
  return digit(cpf.slice(0, 9), 10) === Number(cpf[9]) &&
    digit(cpf.slice(0, 10), 11) === Number(cpf[10]);
}

export function formatBrazilianPhone(value: string): string {
  let allDigits = onlyDigits(value);
  if ((allDigits.length === 12 || allDigits.length === 13) && allDigits.startsWith('55')) allDigits = allDigits.slice(2);
  const limite = allDigits.length >= 3 && allDigits[2] !== '9' ? 10 : 11;
  const digits = allDigits.slice(0, limite);
  if (!digits) return '';
  const ddd = digits.slice(0, 2);
  const number = digits.slice(2);
  if (digits.length <= 2) return `(${ddd}`;
  if (number.length <= 4) return `(${ddd}) ${number}`;
  if (number.length <= 8) return `(${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`;
  return `(${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`;
}

export function formatRg(value: string): string {
  return onlyDigits(value).slice(0, 30);
}

export function isValidBrazilianPhone(value: string): boolean {
  let digits = onlyDigits(value);
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) digits = digits.slice(2);
  if (!digits) return true;
  if (digits.length !== 10 && digits.length !== 11) return false;
  const ddd = Number(digits.slice(0, 2));
  const number = digits.slice(2);
  return ddd >= 11 && ddd <= 99 && (number.length === 8 ? /^[2-5]/.test(number) : /^9/.test(number));
}
