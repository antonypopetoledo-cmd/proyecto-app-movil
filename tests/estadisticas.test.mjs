import assert from "node:assert/strict";
import test from "node:test";
import { calcularEstadisticas } from "../services/estadisticasService.js";

test("cuenta solo los eventos publicados que recibe y ordena categorías", () => {
  const resultado = calcularEstadisticas([
    { categoria: "Teatro" }, { categoria: "Tecnología" }, { categoria: "Teatro" },
  ]);
  assert.equal(resultado.total, 3);
  assert.deepEqual(resultado.principal, { categoria: "Teatro", cantidad: 2 });
  assert.deepEqual(resultado.porCategoria, [
    { categoria: "Teatro", cantidad: 2 }, { categoria: "Tecnología", cantidad: 1 },
  ]);
});

test("responde sin categoría principal cuando no hay eventos", () => {
  assert.deepEqual(calcularEstadisticas([]), { total: 0, porCategoria: [], principal: null });
});
