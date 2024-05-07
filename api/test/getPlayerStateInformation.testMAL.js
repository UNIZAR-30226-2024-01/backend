const { getPlayerStateInformation } = require('../controller'); // replace with actual path to controller.js
const { playerInformation } = require('../controller'); // replace with actual path
const { getCards } = require('../controller'); // replace with actual path
const pool = require('../connectionManager'); // replace with actual path
const constants = require('../constants'); // replace with actual path

describe('getPlayerStateInformation', () => {

    const playerInformation = jest.fn();
    const getCards = jest.fn();

  test('returns player state information', async () => {
    const mockClient = {
      query: jest.fn().mockResolvedValue({
        rows: [
          { ficha: 'mr SOPER', posicion: 'position1', turno: 'turno1' },
          // add more rows as needed
        ],
      }),
      release: jest.fn(),
    };

    playerInformation.mockResolvedValue({
      exito: true,
      character: 'character1',
      partida_actual: 'partida1',
      sospechas: 3,
      // Add other properties as needed
    });

    /*.connect = jest.fn().mockResolvedValue(mockClient);
    console.log('estoy en el test de getPlayerStateInformation');
    getCards.mockResolvedValue({ cards: ['card1', 'card2'] });
*/
    const result = await getPlayerStateInformation(123456, 'username1');

    console.log('MIS VALORES EN GETPLAYERSTATEINFORMATION');
    console.log(result);
    console.log('VALORES FUNCION');

    expect(result.exito).toEqual(true);
    expect(result.positions).toEqual(['position1']);
    expect(result.sospechas).toEqual(3);
    expect(result.cards).toEqual(['card1', 'card2']);
    expect(result.turnoOwner).toEqual('turno1');
    
  });
});