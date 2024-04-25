const { runGame } = require('../game.js');
const controller = require('../controller.js');

// Mock de controller
jest.mock('../controller.js', () => ({
  getPlayersCharacter: jest.fn(() => ({ players: [{ userName: 'testUser', character: null }] })),
  dealCards: jest.fn(() => ({ cards: [[1, 2, 3]] })), 
  selectCharacter: jest.fn(),
}));

const group = 'testGroup';

const mockIo = {
  sockets: {
    adapter: {
      rooms: new Map([[group, new Set(['socket1', 'socket2'])]]), 
    },
    sockets: new Map([
      ['socket1', { handshake: { auth: { username: 'testUser1' } } }],
      ['socket2', { handshake: { auth: { username: 'testUser2' } } }],
    ]),
    get: jest.fn((socketId) => mockIo.sockets.sockets.get(socketId)),
    emit: jest.fn(), 
  },
  to: jest.fn((room) => mockIo.sockets), 
  emit: jest.fn(),
};

//REVISAR, NO ESTOY NADA SEGURA
describe('runGame', () => {
  it('should run the game with the given parameters', async () => {
    const group = 'testGroup';
    await runGame(mockIo, group);
    expect(controller.getPlayersCharacter).toHaveBeenCalledWith(group);
    expect(mockIo.sockets.emit).toHaveBeenCalledWith('start-game', expect.any(Object));
 
  });
});
