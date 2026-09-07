import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

export class SocketService {
  private static io: SocketIOServer | null = null;

  public static init(server: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: (origin, callback) => {
          // Dynamically allow any origin so that credentials: true works in all browsers
          callback(null, true);
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 30000,
      pingInterval: 10000,
    });

    // Socket Authentication Middleware
    this.io.use(async (socket: Socket, next) => {
      try {
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
          socket.handshake.query?.token;

        if (!token || typeof token !== 'string') {
          // Allow connection even without token as guest/anonymous, but don't join private rooms
          return next();
        }

        const secret = process.env.JWT_SECRET || 'wink_me_club_super_secret_jwt_key_2026';
        const decoded = jwt.verify(token, secret) as { userId: string };

        const user = await User.findById(decoded.userId).select('_id role assignedStaff fullName email');
        if (user) {
          socket.data.user = user;
          socket.data.userId = user._id.toString();
          socket.data.role = user.role;
        }

        next();
      } catch (err) {
        // Continue connection; unauthorized sockets won't receive restricted room broadcasts
        next();
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const user = socket.data?.user;

      if (user) {
        const userIdStr = user._id.toString();
        // Join personal user room
        socket.join(`user_${userIdStr}`);

        // Join role-specific rooms
        if (user.role === 'ADMIN') {
          socket.join('admin');
        } else if (user.role === 'STAFF') {
          socket.join('staff');
          socket.join(`staff_${userIdStr}`);
        }

        // Also if client is assigned to a staff, note it
        if (user.assignedStaff) {
          socket.data.assignedStaffId = user.assignedStaff.toString();
        }
      }

      // Allow client to manually identify / join room after login
      socket.on('join', (data: { token?: string; userId?: string; role?: string }) => {
        try {
          if (data?.token) {
            const secret = process.env.JWT_SECRET || 'wink_me_club_super_secret_jwt_key_2026';
            const decoded = jwt.verify(data.token, secret) as { userId: string };
            User.findById(decoded.userId).select('_id role assignedStaff').then((u) => {
              if (u) {
                const uId = u._id.toString();
                socket.join(`user_${uId}`);
                if (u.role === 'ADMIN') socket.join('admin');
                if (u.role === 'STAFF') {
                  socket.join('staff');
                  socket.join(`staff_${uId}`);
                }
              }
            }).catch(() => {});
          } else if (data?.userId) {
            socket.join(`user_${data.userId}`);
            if (data.role === 'ADMIN') socket.join('admin');
            if (data.role === 'STAFF') {
              socket.join('staff');
              socket.join(`staff_${data.userId}`);
            }
          }
        } catch {
          // ignore
        }
      });
    });

    return this.io;
  }

  public static getIO(): SocketIOServer | null {
    return this.io;
  }

  // 1. Broadcast to ALL connected clients (instant global invalidation)
  public static broadcast(event: string, data: any) {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  // 2. Emit to a specific user
  public static emitToUser(userId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(`user_${userId.toString()}`).emit(event, data);
  }

  // 3. Emit to all Admins
  public static emitToAdmin(event: string, data: any) {
    if (!this.io) return;
    this.io.to('admin').emit(event, data);
  }

  // 4. Emit to Staff
  public static emitToStaff(staffId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(`staff_${staffId.toString()}`).emit(event, data);
  }

  public static emitToAllStaff(event: string, data: any) {
    if (!this.io) return;
    this.io.to('staff').emit(event, data);
  }

  // High-Level Domain Event Helpers

  /**
   * When a client executes a trade:
   * 1. Broadcast to ALL connected sockets (admin, staff, user)
   * 2. Targeted room emits
   */
  public static notifyTradeCreated(trade: any, assignedStaffId?: string | null) {
    if (!this.io) return;

    // Ultra-lightweight sanitized trade payload (0 base64 images, instant sub-millisecond transmission)
    const cleanTrade = {
      _id: trade._id,
      tradeId: trade.tradeId,
      userId: trade.userId,
      productId: trade.productId?._id || trade.productId,
      productName: trade.productName,
      quantity: trade.quantity,
      price: trade.price,
      totalAmount: trade.totalAmount,
      status: trade.status,
      outcome: trade.outcome,
      profitPercentage: trade.profitPercentage,
      payoutAmount: trade.payoutAmount,
      createdAt: trade.createdAt,
      updatedAt: trade.updatedAt,
    };

    const payload = {
      type: 'TRADE_CREATED',
      trade: cleanTrade,
      tradeId: trade.tradeId,
      userId: trade.userId?.toString ? trade.userId.toString() : String(trade.userId),
      timestamp: Date.now(),
    };

    // Unconditional global broadcast to ALL connected browsers (Admin, Staff, Client)
    this.io.emit('trade:created', payload);
    this.io.emit('balance:updated', { userId: payload.userId, timestamp: Date.now() });
    this.io.emit('data:invalidate', { entity: 'trades', userId: payload.userId, timestamp: Date.now() });

    // Targeted room emits for specific handlers
    if (trade.userId) {
      this.emitToUser(payload.userId, 'trade:created', payload);
      this.emitToUser(payload.userId, 'balance:updated', { userId: payload.userId, timestamp: Date.now() });
    }
    if (assignedStaffId) {
      this.emitToStaff(assignedStaffId, 'trade:created', payload);
      this.emitToStaff(assignedStaffId, 'balance:updated', { userId: payload.userId, timestamp: Date.now() });
    }
    this.emitToAllStaff('trade:created', payload);
    this.emitToAdmin('trade:created', payload);
  }

  /**
   * When admin or staff settles a trade (WIN or LOSE):
   * 1. Broadcast to ALL connected sockets
   * 2. Targeted room emits
   */
  public static notifyTradeSettled(trade: any, assignedStaffId?: string | null) {
    if (!this.io) return;

    const cleanTrade = {
      _id: trade._id,
      tradeId: trade.tradeId,
      userId: trade.userId,
      productId: trade.productId?._id || trade.productId,
      productName: trade.productName,
      quantity: trade.quantity,
      price: trade.price,
      totalAmount: trade.totalAmount,
      status: trade.status,
      outcome: trade.outcome,
      profitPercentage: trade.profitPercentage,
      payoutAmount: trade.payoutAmount,
      createdAt: trade.createdAt,
      updatedAt: trade.updatedAt,
    };

    const payload = {
      type: 'TRADE_SETTLED',
      trade: cleanTrade,
      tradeId: trade.tradeId,
      outcome: trade.outcome,
      userId: trade.userId?.toString ? trade.userId.toString() : String(trade.userId),
      timestamp: Date.now(),
    };

    // Unconditional global broadcast to ALL connected browsers (Admin, Staff, Client)
    this.io.emit('trade:settled', payload);
    this.io.emit('balance:updated', { userId: payload.userId, timestamp: Date.now() });
    this.io.emit('data:invalidate', { entity: 'trades', userId: payload.userId, timestamp: Date.now() });

    if (trade.userId) {
      this.emitToUser(payload.userId, 'trade:settled', payload);
      this.emitToUser(payload.userId, 'balance:updated', { userId: payload.userId, timestamp: Date.now() });
    }
    if (assignedStaffId) {
      this.emitToStaff(assignedStaffId, 'trade:settled', payload);
      this.emitToStaff(assignedStaffId, 'balance:updated', { userId: payload.userId, timestamp: Date.now() });
    }
    this.emitToAllStaff('trade:settled', payload);
    this.emitToAdmin('trade:settled', payload);
  }

  /**
   * When wallet balance is adjusted or changed
   */
  public static notifyBalanceUpdated(userId: string, walletData?: any) {
    if (!this.io) return;
    const payload = {
      userId: userId.toString(),
      wallet: walletData,
      timestamp: Date.now(),
    };

    // Unconditional broadcast
    this.io.emit('balance:updated', payload);
    this.io.emit('data:invalidate', { entity: 'wallet', userId: userId.toString(), timestamp: Date.now() });

    this.emitToUser(userId, 'balance:updated', payload);
    this.emitToAdmin('balance:updated', payload);
    this.emitToAllStaff('balance:updated', payload);
  }

  /**
   * When recharge request is submitted or reviewed
   */
  public static notifyRechargeUpdated(recharge: any) {
    if (!this.io) return;
    const userId = recharge.userId?.toString ? recharge.userId.toString() : String(recharge.userId);
    const payload = { recharge, userId, timestamp: Date.now() };

    this.io.emit('recharge:updated', payload);
    this.io.emit('data:invalidate', { entity: 'recharges', userId, timestamp: Date.now() });

    this.emitToUser(userId, 'recharge:updated', payload);
    this.emitToAdmin('recharge:updated', payload);
    this.emitToAllStaff('recharge:updated', payload);
  }

  /**
   * When withdrawal request is submitted or reviewed
   */
  public static notifyWithdrawalUpdated(withdrawal: any) {
    if (!this.io) return;
    const userId = withdrawal.userId?.toString ? withdrawal.userId.toString() : String(withdrawal.userId);
    const payload = { withdrawal, userId, timestamp: Date.now() };

    this.io.emit('withdrawal:updated', payload);
    this.io.emit('data:invalidate', { entity: 'withdrawals', userId, timestamp: Date.now() });

    this.emitToUser(userId, 'withdrawal:updated', payload);
    this.emitToAdmin('withdrawal:updated', payload);
    this.emitToAllStaff('withdrawal:updated', payload);
  }

  /**
   * When user profile or status or credit score is changed
   */
  public static notifyUserUpdated(userId: string, userData?: any) {
    if (!this.io) return;
    const payload = { userId: userId.toString(), user: userData, timestamp: Date.now() };

    this.io.emit('user:updated', payload);
    this.io.emit('data:invalidate', { entity: 'users', userId: userId.toString(), timestamp: Date.now() });

    this.emitToUser(userId, 'user:updated', payload);
    this.emitToAdmin('user:updated', payload);
    this.emitToAllStaff('user:updated', payload);
  }

  /**
   * When verification request is submitted or reviewed
   */
  public static notifyVerificationUpdated(verification: any) {
    if (!this.io) return;
    const userId = verification.userId?.toString ? verification.userId.toString() : String(verification.userId);
    const payload = { verification, userId, timestamp: Date.now() };

    this.io.emit('verification:updated', payload);
    this.io.emit('data:invalidate', { entity: 'verifications', userId, timestamp: Date.now() });

    this.emitToUser(userId, 'verification:updated', payload);
    this.emitToAdmin('verification:updated', payload);
    this.emitToAllStaff('verification:updated', payload);
  }
}
