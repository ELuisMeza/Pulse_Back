import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UseGuards } from "@nestjs/common";
import { WsJwtGuard } from "../modules/auth/ws-jwt.guard";
import { JwtService } from "@nestjs/jwt";
import { MessageDto } from "../modules/message/dto/message.dto";
import { ChannelDto } from "../modules/channel/dto/channel.dto";

@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true,
    },
})
@UseGuards(WsJwtGuard)
export class WskGateway {
    @WebSocketServer()
    server: Server

    constructor(private jwtService: JwtService) {}

    afterInit(server: Server) {
        server.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) throw new Error('No token');

            const payload = await this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_SECRET || 'superSecretKey',
            });

            socket.data.user = payload;
            next();
        } catch (err) {
            next(new Error('Unauthorized'));
        }
        });
    }


    handleConnection(client: Socket) {
        const user = client.data.user;
        console.log('Cliente conectado', client.id, 'Usuario:', user?.email || user?.sub)
    }

    handleDisconnect(client: Socket) {
        const user = client.data.user;
        console.log('Cliente desconectado', client.id, 'Usuario:', user?.email || user?.sub)
    }

    @SubscribeMessage('join_room')
    handleJoinRoom(
        @MessageBody() data: {room: string},
        @ConnectedSocket() client: Socket
    ){
        const user = client.data.user;
        client.join(data.room)
        client.emit('joined_room', `Te has unido a la sala ${data.room}`)
        console.log(`Usuario ${user?.email || user?.sub} se unió a la sala ${data.room}`)
    }

    @SubscribeMessage('leave_room')
    handleLeaveRoom(
        @MessageBody() data: {room: string},
        @ConnectedSocket() client: Socket
    ){
        const user = client.data.user;
        client.leave(data.room)
        client.emit('leaved_room', `Te has salido de la sala ${data.room}`)
        console.log(`Usuario ${user?.email || user?.sub} salió de la sala ${data.room}`)
    }

    notifyRoomMessage(roomId: string, payload: MessageDto) {
        console.log(`Notificando mensaje en la sala ${roomId}:`, payload);
        this.server.to(roomId).emit('room_message', {channelId: roomId, message: payload});
    }

    notifyRoomUpdate(roomId: string, payload: ChannelDto) {
        console.log(`Notificando mensaje en la sala ${roomId}:`, payload);
        this.server.to(roomId).emit('room_update', payload);
    }

}