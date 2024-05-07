const {createGame} = require('../controller'); // Importa la función createGame desde el controlador
const {
  generarEnteroSeisDigitos,
  getAsesino,
  getArma,
  getLugar,
  getCurrentDate
} = require('../controller'); // Importa las funciones auxiliares desde el controlador
const pool = require('../connectionManager'); // Importa el pool desde el connectManager
const constants = require('../constants'); // Importa las constantes desde el archivo de constantes
  
  // Mock de funciones y constantes para las pruebas
  jest.mock('../controller', () => ({
    ...jest.requireActual('../controller'), // Importa todo del archivo original
    generarEnteroSeisDigitos: jest.fn(),
    getAsesino: jest.fn(),
    getArma: jest.fn(),
    getLugar: jest.fn(),
    getCurrentDate: jest.fn()
  }));
  describe('createGame function', () => {
    afterAll(() => {
        // Cierra el pool de conexiones después de cada prueba
        pool.end();
      });
    beforeEach(() => {
      jest.clearAllMocks(); // Limpia todos los mocks antes de cada prueba
    });
    /*afterEach(() => {
      pool.release(); // Limpia el pool después de cada prueba
    });*/
        test('creates a game successfully', async () => {
          const asesino = 'asesino';
          const arma = 'arma';
          const lugar = 'lugar';
          const date = 'date';
          const mockClient = {
            connect: jest.fn(),
            query: jest.fn()
              .mockResolvedValue({ rows: [{}] }),
            release: jest.fn(),

            };
          
          pool.connect = jest.fn().mockResolvedValue(mockClient);

          generarEnteroSeisDigitos.mockReturnValue('123456');
          

          getAsesino.mockResolvedValue(asesino);
          getArma.mockResolvedValue(arma);
          getLugar.mockResolvedValue(lugar);
          getCurrentDate.mockReturnValue(date);
          
      
          const result = await createGame('type');
      
          expect(result.exito).toBe(false);
          expect(result.id_partida).toBe('123456');
          expect(result.asesino).toBe(asesino);
          expect(result.arma).toBe(arma);
          expect(result.lugar).toBe(lugar);
      
          expect(generarEnteroSeisDigitos).toHaveBeenCalled();
          expect(pool.connect).toHaveBeenCalledTimes(2);
          expect(pool.connect).toHaveBeenCalledWith();
          expect(getAsesino).toHaveBeenCalled();
          expect(getArma).toHaveBeenCalled();
          expect(getLugar).toHaveBeenCalled();
          expect(getCurrentDate).toHaveBeenCalled();
        });
    });     
        /*test('handles error inserting game', async () => {
          generarEnteroSeisDigitos.mockReturnValueOnce('123456');
          pool.connect.mockResolvedValueOnce({
            query: jest.fn().mockResolvedValueOnce({ rows: [] }), // SELECT_ID_PARTIDA
            release: jest.fn()
          });
          getAsesino.mockResolvedValueOnce('asesino');
          getArma.mockResolvedValueOnce('arma');
          getLugar.mockResolvedValueOnce('lugar');
          getCurrentDate.mockReturnValueOnce('date');
          pool.connect.mockResolvedValueOnce({
            query: jest.fn().mockResolvedValueOnce({ rows: [] }), // INSERT_PARTIDA
            release: jest.fn()
          });
      
          // Simula un error al insertar la partida
          pool.connect.mockResolvedValueOnce({
            query: jest.fn().mockResolvedValueOnce({ rows: [] }), // SELECT_ID_PARTIDA
            release: jest.fn()
          });
          pool.connect.mockRejectedValueOnce(new Error('Error inserting game'));
      
          const result = await createGame('type');
      
          expect(result.exito).toBe(false);
          expect(result.msg).toBe('ERROR_INSERTING');
      
          expect(generarEnteroSeisDigitos).toHaveBeenCalled();
          expect(pool.connect).toHaveBeenCalledTimes(2);
          expect(pool.connect).toHaveBeenCalledWith();
          expect(getAsesino).toHaveBeenCalled();
          expect(getArma).toHaveBeenCalled();
          expect(getLugar).toHaveBeenCalled();
          expect(getCurrentDate).toHaveBeenCalled();
        });
      
        // Otros casos de prueba posibles...
      });*/
      
      