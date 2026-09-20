import { inventario } from '../services/inventario.js'
import { envios } from '../services/envios.js'
import { notificaciones } from '../services/notificaciones.js'

/**
 * EJERCICIO 2 — Facade
 *
 * Esconde la coordinación de 4 servicios detrás de una sola llamada:
 * procesarPedido(pedido).
 */
export class FachadaPedidos {
  constructor(pago) {
    this.pago = pago // instancia de IPago: AdapterPasarelaX o AdapterPasarelaY
  }

  async procesarPedido(pedido) {
    //Reservar inventario
    await inventario.reservar(pedido.items)

    //Cobrar con el Adapter inyectado (la Fachada no sabe si es X o Y)
    const resultado = await this.pago.procesar(pedido.total)

    //Si el pago falla, se corta el flujo y no hay envio ni notificacion
    if (!resultado.exito) {
      throw new Error('El pago fue rechazado. El pedido no se procesó.')
    }

    // 4. Pago OK: programar envío y confirmar al cliente
    await envios.programar(pedido.direccion)
    await notificaciones.confirmar(pedido.cliente)
  }
}