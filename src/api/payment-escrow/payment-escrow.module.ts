import { Module } from '@nestjs/common';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

// Services
import { PaymentService } from 'src/services/payment-service/payment.service';
import { OrderService } from 'src/services/order-service/order.service';
import { PayoutService } from 'src/services/payout-service/payout.service';
import { PlatformSettingsService } from 'src/services/platform-settings-service/platform-settings.service';
import { PaymentGatewayService } from 'src/services/payment-gateway-service/payment-gateway.service';
import { OrderGateway } from 'src/gateways/order.gateway';

// Controllers — Payment
import { CheckoutController } from './payment/checkout/checkout.controller';
import { VerifyPaymentController } from './payment/verify-payment/verify-payment.controller';
import { WebhookController } from './payment/webhook/webhook.controller';
import { ListMyPaymentsController } from './payment/list-my-payments/list-my-payments.controller';
import { GetPaymentController } from './payment/get-payment/get-payment.controller';

// Controllers — Order
import { ListMyOrdersController } from './order/list-my-orders/list-my-orders.controller';
import { ListOrdersController } from './order/list-orders/list-orders.controller';
import { GetOrderController } from './order/get-order/get-order.controller';
import { UpdateOrderStatusController } from './order/update-order-status/update-order-status.controller';
import { AssignDeliveryPartnerController } from './order/assign-delivery-partner/assign-delivery-partner.controller';

// Controllers — Payout
import { ListMyPayoutsController } from './payout/list-my-payouts/list-my-payouts.controller';
import { ListPayoutsController } from './payout/list-payouts/list-payouts.controller';
import { ReleasePayoutController } from './payout/release-payout/release-payout.controller';

// Controllers — Settings
import { GetSettingsController } from './settings/get-settings/get-settings.controller';
import { UpdateSettingsController } from './settings/update-settings/update-settings.controller';

// Modules
import { ServiceModule } from 'src/services/service.module';
import { RepositoryModule } from 'src/repositories/repository.module';

@Module({
    imports: [
        ServiceModule,
        RepositoryModule,
    ],
    controllers: [
        // Literal sub-paths before /payments/:id
        ListMyPaymentsController,
        CheckoutController,
        VerifyPaymentController,
        WebhookController,
        GetPaymentController,

        // Literal sub-paths before /orders/:id
        ListMyOrdersController,
        ListOrdersController,
        GetOrderController,
        UpdateOrderStatusController,
        AssignDeliveryPartnerController,

        // Literal sub-paths before /payouts/:id
        ListMyPayoutsController,
        ListPayoutsController,
        ReleasePayoutController,

        GetSettingsController,
        UpdateSettingsController,
    ],
    providers: [
        PaymentService,
        OrderService,
        PayoutService,
        PlatformSettingsService,
        PaymentGatewayService,
        OrderGateway,
        JwtAuthGuard,
        RoleGuard,
    ],
    exports: [
        PaymentService,
        OrderService,
        PayoutService,
        PlatformSettingsService,
        OrderGateway,
    ],
})
export class PaymentEscrowModule { }
