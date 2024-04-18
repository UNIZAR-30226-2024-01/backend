###############################################
# Author: Grace Hopper
#
#
#
###############################################

import sys
import random
import json
import time

info_tablero = []
info_habitaciones = []

# Constantes para n_players y n_things
N_PLAYERS = 6
N_PLACES = 9
N_WEAPONS = 6
N_PEOPLE = 6
PLACES = ['aulas norte',
  'recepcion',
  'laboratorio',
  'escaleras',
  'biblioteca',
  'baños',
  'despacho',
  'cafeteria',
  'aulas sur']
PEOPLE = ['mr SOPER',
  'miss REDES',
  'mr PROG',
  'miss FISICA',
  'mr DISCRETO',
  'miss IA']
WEAPONS = ['teclado',
  'cable de red',
  'café envenenado',
  'router afilado',
  'troyano',
  'cd']

# Constantes para el tablero
N_COLS = 24

# Comprobación de que ua casilla es válida
def checkIndex(index):
	if index < 0 or index >= len(info_tablero):
		return False
	if info_tablero[index]['isWalkable'] == False or (info_tablero[index]['roomName'] != '' and info_tablero[index]['isDoor'] == False):
		return False
	return True

def checkNeighbour(index, vecino):
	if checkIndex(vecino):
		if (vecino % 24 == 0) and (index % 24 == 23):
			return False
		if (vecino % 24 == 23) and (index % 24 == 0):
			return False
		return True
	return False


# Comprobación de qué casillas vecinas son válidas
def checkNeighbours(index, vecinos):
	checked = []
	if info_tablero[index]['isDoor'] != False:
		if(info_tablero[index]['isDoor'] == 'd'):
			checked.append(index + vecinos[0])
		elif(info_tablero[index]['isDoor'] == 'r'):
			checked.append(index + vecinos[1])
		elif(info_tablero[index]['isDoor'] == 'u'):
			checked.append(index + vecinos[2])
		elif(info_tablero[index]['isDoor'] == 'l'):
			checked.append(index + vecinos[3])
	else:
		for i in range(4):
			if checkNeighbour(index, index + vecinos[i]):
				if info_tablero[index + vecinos[i]]['isDoor'] != False:
					if(i == 0 and info_tablero[index + vecinos[i]]['isDoor'] == 'u'):
						checked.append(index + vecinos[i])
					elif(i == 1 and info_tablero[index + vecinos[i]]['isDoor'] == 'l'):
						checked.append(index + vecinos[i])
					elif(i == 2 and info_tablero[index + vecinos[i]]['isDoor'] == 'd'):
						checked.append(index + vecinos[i])
					elif(i == 3 and info_tablero[index + vecinos[i]]['isDoor'] == 'r'):
						checked.append(index + vecinos[i])
				else:
					checked.append(index + vecinos[i])
	return checked


def bfs(casilla, dados, vecinos):
	visited = []
	if info_tablero[casilla]['roomName'] != '':
		# estamos en una habitacion y podemos salir por varias puertas y hay pasadizos
		frontera = [c['idx'] for c in info_tablero if info_tablero[casilla]['roomName'] == c['roomName'] and c['isDoor']!=False]
		paths = [c for c in info_tablero if info_tablero[casilla]['roomName'] == c['roomName'] and c['isPath']!=False]
		for c in paths:
			print(c)
			visited.append(int(c['isPath']))
		
		print(f"la frontera es {frontera} y los visited son {visited}")
		
	else:
		frontera = [casilla]
	while dados >= 0:
		for _ in range(len(frontera)):
			casilla = frontera.pop(0)
			visited.append(casilla)
			for neighbour in checkNeighbours(casilla, vecinos):
				if neighbour not in visited and neighbour not in frontera:
					frontera.append(neighbour)
		dados -= 1

	return visited

def turn(casillas_pjs, casilla, dados, vecinos):

	if dados < 2 or dados > 12:
		print("Número de dados no válido: ", dados)
		sys.exit(1)

	with open('../bot/infoTablero.json', 'r') as file:
		global info_tablero
		info_tablero = json.load(file)

	if casilla < 0 or casilla >= len(info_tablero):
		print("Casilla inicial no válida: ", casilla)
		sys.exit(1)

	# Sintaxis del tablero: { isRoom: bool,  roomName: 'int', isStartingCell: bool, isWalkable: bool, isDoor: 'num_hab', idx:int }
	# Sintaxis de las habitaciones: { roomName: 'int', roomNumber: int, style: {} }
		
	# Comprobación de la casilla inicial
	if not checkIndex(casilla):
		print("Casilla inicial no válida: ", casilla)
		sys.exit(1)
	
	# Comprobación de las casillas de los jugadores
	for i in range(len(casillas_pjs)):
		if not checkIndex(casillas_pjs[i]):
			print(f"Casilla del jugador {i} no válida: ", casillas_pjs[i])
			sys.exit(1)
		# Marcar las casillas de los jugadores como no transitables
		info_tablero[casillas_pjs[i]]['isWalkable'] = False

	candidatos = bfs(casilla, dados, vecinos)
	candidatos = sorted(candidatos)
	print(candidatos)
	return candidatos

def bfs_habitacion(candidatos, room, vecinos):

	room = str(room)
	# Inicializar la lista de explorados
	visitados = []
	frontera = [c['idx'] for c in info_tablero if c['roomName'] == room and c['isDoor'] != False]
	
	while frontera:
		casilla_actual = frontera.pop(0)
		
		# Verificar si la casilla actual es una candidata
		if casilla_actual in candidatos:
			return casilla_actual  # Se encontró una casilla candidata
		
		# Marcar la casilla actual como visitada
		visitados.append(casilla_actual)
		
		# Explorar los vecinos de la casilla actual
		for vecino in checkNeighbours(casilla_actual, vecinos):
			if vecino not in visitados:
				frontera.append(vecino)
	
	return None  # No se encontraron casillas candidatas

def getLeastInfo(tarjeta):
	# Calcular la cantidad de información de cada carta
	info = [0 for i in range(len(tarjeta))]
	for i in range(len(tarjeta)):
		for j in range(N_PLAYERS):
			info[i] += abs(tarjeta[i][j]-50)
	
	# Devolver el índice de la carta con menos información
	return info.index(min(info))

def decidirMovimiento(candidatos, tarjeta, vecinos):
	min_prob = getLeastInfo(tarjeta)

	# Leer el JSON desde el archivo
	with open('../bot/infoHabitaciones.json', 'r') as file:
		global info_habitaciones
		info_habitaciones = json.load(file)
	
	# Quitar ada byron
	info_habitaciones = info_habitaciones[:4] + info_habitaciones[5:]

	# Transformar el indice en las puertas de la habitación
	room = info_habitaciones[min_prob]['roomNumber']

	print("place: ", info_habitaciones[min_prob]['roomName'])
	return bfs_habitacion(candidatos, room, vecinos)


def sospecha(casilla, tarjeta):
	if info_tablero[casilla]['roomName'] == '':
		print("No se puede hacer una sospecha en una casilla que no es una habitación")
	else:
		# Seleccionar una carta de cada tipo (la de menor información)
		place = getLeastInfo(tarjeta[:N_PLACES])

		# Desde N_PLACES hasta N_PLACES+N_PEOPLE están los personajes
		who = getLeastInfo(tarjeta[N_PLACES:N_PLACES+N_PEOPLE])

		# Desde N_PLACES+N_PEOPLE hasta N_PLACES+N_PEOPLE+N_WEAPONS están las armas
		weapon = getLeastInfo(tarjeta[N_PLACES+N_PEOPLE:N_PLACES+N_PEOPLE+N_WEAPONS])

		# Imprimir la sospecha
		print(f"Sospecha: {PLACES[place]}, {PEOPLE[who]}, {WEAPONS[weapon]}")

if __name__ == "__main__":

	time_ini = time.time()
	
	# Comprobación de parámetros
	if len(sys.argv) != 5:
		print("Uso: python bot.py <[casillas_pjs]> <casilla_inicial> <dados> <tarjeta>")
		sys.exit(1)

	# Inicialización de variables
	casillas_pjs = sys.argv[1]
	# Convertir la lista de casillas de los jugadores a una lista de enteros
	casillas_pjs = list(map(int, casillas_pjs.split(",")))  
	yo = int(sys.argv[2])
	casilla = casillas_pjs[yo]
	dados = int(sys.argv[3])
	tarjeta = sys.argv[4]

	# Rellenar la tarjeta como una matriz de n_jugadores x n_cartas
	tarjeta = tarjeta.split(",")
	tarjeta = [[random.randint(0,100) for i in range(N_PLAYERS)] for j in range(N_PEOPLE+N_PLACES+N_WEAPONS)]

	# Eliminar la componente "yo" de la lista de casillas de los jugadores
	casillas_pjs = casillas_pjs[:yo] + casillas_pjs[yo+1:]

	vecinos = [N_COLS, 1, -N_COLS, -1]

	candidatos = turn(casillas_pjs, casilla, dados, vecinos)

	# Pasar las primeras N_PLACES componentes de la tarjeta a una lista de lugares
	election = decidirMovimiento(candidatos, tarjeta[:N_PLACES], vecinos)
	print("Movimiento: ", election)

	# Printear la tarjeta en orden
	print("Tarjeta:")
	print("Lugares:")
	for i in range(N_PLACES):
		print(f"{i}: {tarjeta[i]}")
	print("Personas:")
	for i in range(N_PLACES, N_PLACES+N_PEOPLE):
		print(f"{i}: {tarjeta[i]}")
	print("Armas:")
	for i in range(N_PLACES+N_PEOPLE, N_PLACES+N_PEOPLE+N_WEAPONS):
		print(f"{i}: {tarjeta[i]}")

	sospecha(election, tarjeta)

	time_fin = time.time()
	print("Tiempo de ejecucion: ", time_fin - time_ini)
