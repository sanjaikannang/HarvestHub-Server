import { Server, Socket } from 'socket.io';
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';

// Pushes newly-created in-app notifications to whoever's online (requirement.md:
// "in-app... notifications"). One room per user — clients join with { userId }
// (their own, from the logged-in session) and receive notification-received
// events; see BiddingGateway for the identical pattern and the reasoning
// behind the permissive CORS/no-socket-auth setup here.
@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class NotificationGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('join-notifications')
    handleJoin(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket): void {
        client.join(this.room(data.userId));
    }

    @SubscribeMessage('leave-notifications')
    handleLeave(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket): void {
        client.leave(this.room(data.userId));
    }

    emitNotificationReceived(userId: string, payload: unknown): void {
        this.server?.to(this.room(userId)).emit('notification-received', payload);
    }

    private room(userId: string): string {
        return `user:${userId}`;
    }

}
