import Peer, { DataConnection } from 'peerjs';
import { Packet } from './Protocol';

export class NetworkManager {
    private peer: Peer;
    private connections: Map<string, DataConnection> = new Map();
    private isHost: boolean = false;
    private myId: string = '';
    
    public onPacketReceived: (packet: Packet, senderId: string) => void = () => {};
    public onPeerConnected: (conn: DataConnection) => void = () => {};
    public onIdAssigned: (id: string) => void = () => {};

    constructor() {
        this.peer = new Peer();
        
        this.peer.on('open', (id: string) => {
            this.myId = id;
            console.log('My Peer ID is: ' + id);
            this.onIdAssigned(id);
        });

        this.peer.on('connection', (conn: DataConnection) => {
            this.handleConnection(conn);
        });
    }

    public getMyId(): string {
        return this.myId;
    }

    public setHost(isHost: boolean) {
        this.isHost = isHost;
    }

    public isHostUser(): boolean {
        return this.isHost;
    }

    public connectToHost(hostId: string) {
        const conn = this.peer.connect(hostId);
        this.handleConnection(conn);
    }

    private handleConnection(conn: DataConnection) {
        conn.on('open', () => {
            console.log('Connected to: ' + conn.peer);
            this.connections.set(conn.peer, conn);
            this.onPeerConnected(conn);
        });

        conn.on('data', (data: unknown) => {
            this.onPacketReceived(data as Packet, conn.peer);
        });

        conn.on('close', () => {
            console.log('Connection closed: ' + conn.peer);
            this.connections.delete(conn.peer);
        });
    }

    public send(packet: Packet, targetId?: string) {
        if (targetId) {
            const conn = this.connections.get(targetId);
            if (conn && conn.open) {
                conn.send(packet);
            }
        } else {
            // Broadcast
            this.connections.forEach(conn => {
                if (conn.open) {
                    conn.send(packet);
                }
            });
        }
    }
}
