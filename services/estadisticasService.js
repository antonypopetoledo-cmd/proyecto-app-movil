export const calcularEstadisticas = (eventos) => {
  const conteos = eventos.reduce((categorias, evento) => {
    const categoria = evento.categoria?.trim() || "Sin categoría";
    categorias[categoria] = (categorias[categoria] || 0) + 1;
    return categorias;
  }, {});
  const porCategoria = Object.entries(conteos)
    .map(([categoria, cantidad]) => ({ categoria, cantidad }))
    .sort((primero, segundo) => segundo.cantidad - primero.cantidad || primero.categoria.localeCompare(segundo.categoria));
  return { total: eventos.length, porCategoria, principal: porCategoria[0] || null };
};
