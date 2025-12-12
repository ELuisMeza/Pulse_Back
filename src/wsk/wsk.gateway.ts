import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UseGuards } from "@nestjs/common";
import { WsJwtGuard } from "../modules/auth/ws-jwt.guard";

@WebSocketGateway({
    cors: true
})
@UseGuards(WsJwtGuard)
export class WskGateway {
    @WebSocketServer()
    server: Server

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

    notifyNewMessageGeneral(payload: { message: string; userId: string }) {
        this.server.emit('new_message', payload);
    }

    notifyNewMessage(payload: { roomId: string; message: string; userId: string }) {
      this.server.to(payload.roomId).emit('new_message', payload);
    }

}