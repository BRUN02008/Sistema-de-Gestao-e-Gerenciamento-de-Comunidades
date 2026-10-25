/** Calcula a idade respeitando o aniversário deste ano. Datas inválidas geram null. */
export function calcularIdade(dataNascimento?: string | null, hoje = new Date()): number | null {
  if (!dataNascimento) return null;
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataNascimento);
  let nascimento: Date;
  if (partes) {
    const ano = Number(partes[1]);
    const mes = Number(partes[2]);
    const dia = Number(partes[3]);
    nascimento = new Date(ano, mes - 1, dia);
    if (nascimento.getFullYear() !== ano || nascimento.getMonth() !== mes - 1 || nascimento.getDate() !== dia) return null;
  } else {
    const parsed = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dataNascimento);
    if (!parsed) return null;
    const dia = Number(parsed[1]);
    const mes = Number(parsed[2]);
    const ano = Number(parsed[3]);
    nascimento = new Date(ano, mes - 1, dia);
    if (nascimento.getFullYear() !== ano || nascimento.getMonth() !== mes - 1 || nascimento.getDate() !== dia) return null;
  }
  if (nascimento > hoje) return null;
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  if (hoje.getMonth() < nascimento.getMonth() || (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())) idade--;
  return idade;
}
