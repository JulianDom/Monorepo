# MercadoPago Integration

Integración con la API de MercadoPago para procesamiento de pagos.

## Configuración

Variables de entorno requeridas:

```env
MERCADOPAGO_ACCESS_TOKEN=your_access_token
```

## Uso

```typescript
@Injectable()
export class MercadoPagoService implements IPaymentService {
  private client: MercadoPagoClient;

  constructor(private configService: ConfigService) {
    this.client = new MercadoPagoClient({
      accessToken: configService.get('MERCADOPAGO_ACCESS_TOKEN'),
    });
  }

  async processPayment(data: PaymentDto): Promise<PaymentResult> {
    // Implementación
  }
}
```

## Referencias

- [Documentación MercadoPago SDK](https://github.com/mercadopago/sdk-nodejs)
- [API Reference](https://www.mercadopago.com.br/developers/en/reference)
