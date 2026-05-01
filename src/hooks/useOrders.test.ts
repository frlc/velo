import { describe, it, expect, vi } from 'vitest';
import { dbOrderToOrder, DbOrder } from './useOrders';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {}
}));

describe('useOrders utilities', () => {
  describe('dbOrderToOrder', () => {
    it('should correctly map a complete database order to local order format', () => {
      const dbOrder: DbOrder = {
        id: 'uuid-123',
        order_number: 'VLO-123456',
        color: 'glacier-blue',
        wheel_type: 'sport',
        optionals: ['precision-park', 'flux-capacitor'],
        customer_name: 'John Doe Silva',
        customer_email: 'john@example.com',
        customer_phone: '123456789',
        customer_cpf: '123.456.789-00',
        payment_method: 'avista',
        total_price: 50500,
        status: 'APROVADO',
        created_at: '2026-05-01T00:00:00Z',
        updated_at: '2026-05-01T00:00:00Z',
      };

      const order = dbOrderToOrder(dbOrder);

      expect(order.id).toBe('VLO-123456');
      expect(order.configuration.exteriorColor).toBe('glacier-blue');
      expect(order.configuration.interiorColor).toBe('cream'); // Default hardcoded in dbOrderToOrder
      expect(order.configuration.wheelType).toBe('sport');
      expect(order.configuration.optionals).toEqual(['precision-park', 'flux-capacitor']);
      expect(order.totalPrice).toBe(50500);
      expect(order.paymentMethod).toBe('avista');
      expect(order.status).toBe('APROVADO');
      expect(order.createdAt).toBe('2026-05-01T00:00:00Z');
      
      // Checking name splitting
      expect(order.customer.name).toBe('John');
      expect(order.customer.surname).toBe('Doe Silva');
      expect(order.customer.email).toBe('john@example.com');
      expect(order.customer.phone).toBe('123456789');
      expect(order.customer.cpf).toBe('123.456.789-00');
      expect(order.customer.store).toBe(''); // Default hardcoded
    });

    it('should handle null optionals by returning an empty array', () => {
      const dbOrder: DbOrder = {
        id: 'uuid-124',
        order_number: 'VLO-654321',
        color: 'midnight-black',
        wheel_type: 'aero',
        optionals: null,
        customer_name: 'Maria',
        customer_email: 'maria@example.com',
        customer_phone: '987654321',
        customer_cpf: '098.765.432-11',
        payment_method: 'financiamento',
        total_price: 40000,
        status: 'EM_ANALISE',
        created_at: '2026-05-01T01:00:00Z',
        updated_at: '2026-05-01T01:00:00Z',
      };

      const order = dbOrderToOrder(dbOrder);

      expect(order.configuration.optionals).toEqual([]);
      expect(order.customer.name).toBe('Maria');
      expect(order.customer.surname).toBe('');
    });
  });
});
