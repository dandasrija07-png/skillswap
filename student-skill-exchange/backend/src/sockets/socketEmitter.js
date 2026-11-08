/**
 * Socket.IO Global Emitter Utility
 * Allows Express controllers and service hooks to push live notifications
 * and updates to connected client rooms
 */

let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => ioInstance;

export const emitToUser = (userId, eventName, data) => {
  if (ioInstance && userId) {
    ioInstance.to(`user_${Number(userId)}`).emit(eventName, data);
  }
};

export const emitNotification = (userId, notification) => {
  emitToUser(userId, 'notification_received', notification);
};

