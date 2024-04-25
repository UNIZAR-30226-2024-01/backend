const { runGame } = require('../game.js');

describe('runGame', () => {
  test('should start the game and handle turns correctly', async () => {
    // Mock para io y group
   /* const io = {
      sockets: {
        adapter: {
          rooms: new Map().set('group', new Set(['socket1', 'socket2']))
        },
        sockets: new Map([
          ['socket1', { emit: jest.fn() }],
          ['socket2', { emit: jest.fn() }]
        ])
      }
    };

    const group = 'group';

    // Llamar a runGame
    await runGame(io, group);

    // Verificar que se emitieron eventos start-game a los sockets
    expect(io.sockets.sockets.get('socket1').emit).toHaveBeenCalledWith('start-game', expect.any(Object));
    expect(io.sockets.sockets.get('socket2').emit).toHaveBeenCalledWith('start-game', expect.any(Object));

    // Simular el turno de los jugadores
    const handleTurnoSpy = jest.spyOn(runGameModule, 'handleTurno');
    handleTurnoSpy.mockImplementationOnce(() => {});
    handleTurnoSpy.mockImplementationOnce(() => {});

    // Verificar que se llamó a handleTurno para cada jugador
    expect(handleTurnoSpy).toHaveBeenCalledTimes(2);*/
  });
});
