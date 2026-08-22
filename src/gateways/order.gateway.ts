import { Server, Socket } from 'socket.io';
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';

// Broadcasts live delivery-status updates to whoever's watching an order
// (requirement.md: "Buyer's dashboard reflects status changes in real time").
// One room per order — clients join with { orderId } and receive
// order-status-updated events; see BiddingGateway for the identical pattern
// and the reasoning behind the permissive CORS setup here.
@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class OrderGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('join-order')
    handleJoin(@MessageBody() data: { orderId: string }, @ConnectedSocket() client: Socket): void {
        client.join(this.room(data.orderId));
    }

    @SubscribeMessage('leave-order')
    handleLeave(@MessageBody() data: { orderId: string }, @ConnectedSocket() client: Socket): void {
        client.leave(this.room(data.orderId));
    }

    emitStatusUpdated(orderId: string, payload: unknown): void {
        this.server?.to(this.room(orderId)).emit('order-status-updated', payload);
    }

    private room(orderId: string): string {
        return `order:${orderId}`;
    }

}
