import { EventEmitter } from 'events';
import Aedes from 'aedes';
import { createServer, Server } from 'net';

// Content push message type
export interface ContentPushMessage {
  messageType: 'content';
  content: {
    id: string;
    title: string;
    type: 'image' | 'video' | 'text' | 'audio' | 'slideshow';
    url?: string;
    content?: string;
    duration?: number;
    size?: number;
  };
  schedule?: {
    startTime: string;
    endTime: string;
    priority: number;
  };
}

// Connected device type
export interface ConnectedDevice {
  id: string;
  clientId: string;
  ipAddress?: string;
  lastSeen: Date;
  status: 'online' | 'offline';
}

/**
 * Complete MQTT Service - Based on Aedes implementation
 */
export default class MQTTService extends EventEmitter {
  private port: number;
  private isRunning: boolean = false;
  private connectedDevices: Map<string, ConnectedDevice> = new Map();
  private broker: any;
  private server: Server;

  constructor(port: number = 1883) {
    super();
    this.port = port;
    this.broker = new Aedes();
    this.server = createServer(this.broker.handle);
    this.setupEventHandlers();
  }

  /**
   * Setup MQTT event handlers
   */
  private setupEventHandlers(): void {
    // Client connection event
    this.broker.on('client', (client: any) => {
      console.log(`📱 MQTT client connected: ${client.id}`);
      
      // Record connected device
      const device: ConnectedDevice = {
        id: client.id,
        clientId: client.id,
        ipAddress: client.conn?.remoteAddress,
        lastSeen: new Date(),
        status: 'online'
      };
      
      this.connectedDevices.set(client.id, device);
      this.emit('clientConnected', device);
    });

    // Client disconnect event
    this.broker.on('clientDisconnect', (client: any) => {
      console.log(`📱 MQTT client disconnected: ${client.id}`);
      
      // Update device status
      const device = this.connectedDevices.get(client.id);
      if (device) {
        device.status = 'offline';
        device.lastSeen = new Date();
        this.connectedDevices.set(client.id, device);
      }
      
      this.emit('clientDisconnected', client.id);
    });

    // Message publish event
    this.broker.on('publish', (packet: any, client: any) => {
      if (client) {
        console.log(`📨 Message received from ${client.id}: ${packet.topic}`);
        
        // Update device last active time
        const device = this.connectedDevices.get(client.id);
        if (device) {
          device.lastSeen = new Date();
          this.connectedDevices.set(client.id, device);
        }
        
        this.emit('messageReceived', {
          clientId: client.id,
          topic: packet.topic,
          payload: packet.payload,
          timestamp: new Date()
        });
      }
    });

    // Subscribe event
    this.broker.on('subscribe', (subscriptions: any, client: any) => {
      console.log(`📺 Client ${client.id} subscribed to topics:`, subscriptions.map((s: any) => s.topic));
    });

    // Unsubscribe event
    this.broker.on('unsubscribe', (unsubscriptions: any, client: any) => {
      console.log(`📺 Client ${client.id} unsubscribed from topics:`, unsubscriptions);
    });
  }

  /**
   * Start MQTT server
   */
  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, () => {
        this.isRunning = true;
        console.log(`🚀 MQTT Server (Aedes) started successfully on port: ${this.port}`);
        console.log(`📍 MQTT connection address: tcp://localhost:${this.port}`);
        console.log(`✅ Full MQTT functionality enabled - supports real device connections`);
        console.log(`📋 Supported topic patterns:`);
        console.log(`   - device/{deviceId}/register - Device registration`);
        console.log(`   - device/{deviceId}/heartbeat - Heartbeat detection`);
        console.log(`   - device/{deviceId}/status - Status updates`);
        console.log(`   - content/{deviceId}/push - Content push`);
        console.log(`   - command/{deviceId}/send - Command sending`);
        this.emit('started');
        resolve();
      });

      this.server.on('error', (error) => {
        console.error('❌ MQTT server startup failed:', error);
        reject(error);
      });
    });
  }

  /**
   * Stop MQTT server
   */
  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server && this.isRunning) {
        this.server.close(() => {
          this.isRunning = false;
          console.log('🛑 MQTT server stopped');
          this.emit('stopped');
          resolve();
        });
      } else {
        this.isRunning = false;
        this.emit('stopped');
        resolve();
      }
    });
  }

  /**
   * Send message to specific device
   */
  public publishToDevice(clientId: string, topic: string, message: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const packet = {
        topic: topic,
        payload: JSON.stringify(message),
        qos: 1,
        retain: false
      };

      this.broker.publish(packet, (error: any) => {
        if (error) {
          console.error(`❌ Failed to send message to device ${clientId}:`, error);
          reject(error);
        } else {
          console.log(`📤 Message sent to device ${clientId}, topic: ${topic}`);
          resolve();
        }
      });
    });
  }

  /**
   * Broadcast message to all devices
   */
  public broadcastMessage(topic: string, message: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const packet = {
        topic: topic,
        payload: JSON.stringify(message),
        qos: 1,
        retain: false
      };

      this.broker.publish(packet, (error: any) => {
        if (error) {
          console.error(`❌ Broadcast message failed:`, error);
          reject(error);
        } else {
          console.log(`📢 Broadcast message, topic: ${topic}`);
          resolve();
        }
      });
    });
  }

  /**
   * Get connected devices list
   */
  public getConnectedDevices(): ConnectedDevice[] {
    return Array.from(this.connectedDevices.values());
  }

  /**
   * Push content to specific device
   */
  public async pushContentToDevice(deviceId: string, message: ContentPushMessage): Promise<boolean> {
    try {
      const topic = `content/${deviceId}/push`;
      await this.publishToDevice(deviceId, topic, message);
      console.log(`📤 Content pushed to device ${deviceId}:`, message.content.title);
      return true;
    } catch (error) {
      console.error(`❌ Content push failed:`, error);
      return false;
    }
  }

  /**
   * Send command to specific device
   */
  public async sendCommandToDevice(deviceId: string, command: any): Promise<boolean> {
    try {
      const topic = `command/${deviceId}/send`;
      await this.publishToDevice(deviceId, topic, command);
      console.log(`📤 Command sent to device ${deviceId}:`, command);
      return true;
    } catch (error) {
      console.error(`❌ Command send failed:`, error);
      return false;
    }
  }

  /**
   * Broadcast message to all devices
   */
  public broadcastToAllDevices(message: any): void {
    const topic = 'broadcast/all';
    this.broadcastMessage(topic, message).catch(error => {
      console.error(`❌ Broadcast failed:`, error);
    });
    console.log(`📢 Broadcast message to all devices:`, message);
  }

  /**
   * Get connected clients list
   */
  public getConnectedClients(): any[] {
    return Array.from(this.connectedDevices.values());
  }

  /**
   * Get server statistics
   */
  public getStats() {
    return {
      port: this.port,
      isRunning: this.isRunning,
      serverRunning: this.isRunning,
      connectedClients: this.connectedDevices.size,
      clientsCount: this.connectedDevices.size,
      totalConnectedDevices: this.connectedDevices.size,
      mode: 'aedes'
    };
  }

  /**
   * Check if server is running
   */
  public isAlive(): boolean {
    return this.isRunning;
  }
}
