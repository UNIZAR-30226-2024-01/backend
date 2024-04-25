const { joinGame } = require('../game');

// Mock de controller
const controller = require('../controller');
jest.mock('../controller');

describe('joinGame', () => {
  test('should call controller.joinGame with the correct arguments', async () => {
    // Mock de los argumentos
    const username = 'testUser';
    const idGame = 'testGameId';

    // Llamar a la función joinGame
    await joinGame(username, idGame);

    // Verificar que controller.joinGame se llama con los argumentos correctos
    expect(controller.joinGame).toHaveBeenCalledWith(username, idGame);
  });
});
