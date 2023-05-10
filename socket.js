let io;

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer,
            {
                cors: {
                    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://clientasm3.netlify.app', 'https://adminasm3.netlify.app']
                }
            });
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};