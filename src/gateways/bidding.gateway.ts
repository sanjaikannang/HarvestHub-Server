import { Server, Socket } from 'socket.io';
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';

// Broadcasts live bidding-session updates (requirement.md: "Real-time
// updates... broadcast via WebSocket/SSE"). One room per product — clients
// join with { productId } and receive bid-placed/session-started/session-ended
// events; they compute their own countdown locally from currentEndTime rather
// than the server ticking a clock over the socket.
//
// CORS is left permissive here (WS actions are still gated by whatever the
// caller does with them — nothing here trusts the socket for auth) rather
// than wired to ConfigService, since @WebSocketGateway's options are
// evaluated at class-decoration time, before dotenv has loaded via
// ConfigService's constructor. Tighten this if the client is ever served
// from an untrusted origin.
@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class BiddingGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('join-session')
    handleJoin(@MessageBody() data: { productId: string }, @ConnectedSocket() client: Socket): void {
        client.join(this.room(data.productId));
    }

    @SubscribeMessage('leave-session')
    handleLeave(@MessageBody() data: { productId: string }, @ConnectedSocket() client: Socket): void {
        client.leave(this.room(data.productId));
    }

    emitSessionStarted(productId: string, payload: unknown): void {
        this.server?.to(this.room(productId)).emit('session-started', payload);
    }

    emitBidPlaced(productId: string, payload: unknown): void {
        this.server?.to(this.room(productId)).emit('bid-placed', payload);
    }

    emitSessionEnded(productId: string, payload: unknown): void {
        this.server?.to(this.room(productId)).emit('session-ended', payload);
    }

    private room(productId: string): string {
        return `session:${productId}`;
    }

}
