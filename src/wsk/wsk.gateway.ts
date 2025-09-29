import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
    cors: true
})
export class WskGateway {
    @WebSocketServer()
    server: Server

    handleConnection(client: Socket) {
        console.log('Cliente conectado', client.id)
    }

    handleDisconnect(client: Socket) {
        console.log('Cliente desconectado', client.id)
    }

    @SubscribeMessage('join_room')
    handleJoinRoom(
        @MessageBody() data: {room: string},
        @ConnectedSocket() client: Socket
    ){
        client.join(data.room)
        client.emit('joined_room', `Te has unido a la sala ${data.room}`)
    }

    @SubscribeMessage('leave_room')
    handleLeaveRoom(
        @MessageBody() data: {room: string},
        @ConnectedSocket() client: Socket
    ){
        client.leave(data.room)
        client.emit('leaved_room', `Te has salido de la sala ${data.room}`)
    }

    notifyNewMessageGeneral(payload: { message: string; userId: string }) {
        this.server.emit('new_message', payload);
    }

    notifyNewMessage(payload: { roomId: string; message: string; userId: string }) {
      this.server.to(payload.roomId).emit('new_message', payload);
    }

}