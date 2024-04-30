###############################################
# Author: Grace Hopper
#
#
#
###############################################

import sys
import json

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
  'cafe envenenado',
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
			# print(c) (DEBUG)
			visited.append(int(c['isPath']))
		
		# print(f"la frontera es {frontera} y los visited son {visited}") (DEBUG)
		
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
		print("Número de dados no válido: ", dados, file=sys.stderr)
		sys.exit(1)

	with open('../bot/infoTablero.json', 'r') as file:
		global info_tablero
		info_tablero = json.load(file)
	
	# Leer el JSON desde el archivo
	with open('../bot/infoHabitaciones.json', 'r') as file:
		global info_habitaciones
		info_habitaciones = json.load(file)
		# Quitar ada byron
		info_habitaciones = info_habitaciones[:4] + info_habitaciones[5:]


	if casilla < 0 or casilla >= len(info_tablero):
		print("Casilla inicial no válida: ", casilla, file=sys.stderr)
		sys.exit(1)

	# Sintaxis del tablero: { isRoom: bool,  roomName: 'int', isStartingCell: bool, isWalkable: bool, isDoor: 'num_hab', idx:int }
	# Sintaxis de las habitaciones: { roomName: 'int', roomNumber: int, style: {} }
		
	# Comprobación de la casilla inicial
	if not checkIndex(casilla):
		print("Casilla inicial no válida: ", casilla, file=sys.stderr)
		sys.exit(1)
	
	# Comprobación de las casillas de los jugadores
	for i in range(len(casillas_pjs)):
		if not checkIndex(casillas_pjs[i]):
			print(f"Casilla del jugador {i} no válida: ", casillas_pjs[i], file=sys.stderr)
			sys.exit(1)
		# Marcar las casillas de los jugadores como no transitables
		info_tablero[casillas_pjs[i]]['isWalkable'] = False

	candidatos = bfs(casilla, dados, vecinos)
	candidatos = sorted(candidatos)
	# print(candidatos) (DEBUG)
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

def getLeastInfo(tarjeta, me):
	# Calcular la cantidad de información de cada carta
	info = [0 for i in range(len(tarjeta))]
	for i in range(len(tarjeta)):
		for j in range(N_PLAYERS):
			info[i] += abs(tarjeta[i][j]-50)
	
	min_info = info.index(min(info))
	_me = me
	for i in range(len(info)):
		if info[_me] <= info[min_info]:
			return _me
		_me = (_me + 1) % N_PLAYERS

def decidirMovimiento(candidatos, tarjeta, vecinos, casillas_pjs, me):
	min_prob = getLeastInfo(tarjeta, me)

	# Transformar el indice en las puertas de la habitación
	room = info_habitaciones[min_prob]['roomNumber']

	# print("place: ", info_habitaciones[min_prob]['roomName']) (DEBUG)

	# Volver a validar las casillas de los jugadores
	for i in range(len(casillas_pjs)):
		info_tablero[casillas_pjs[i]]['isWalkable'] = True

	return bfs_habitacion(candidatos, room, vecinos)


def sospecha(casilla, tarjeta, me, election, last_pos):
	if info_tablero[casilla]['roomName'] == '' or sameRoom(last_pos, casilla):
		# print("No se puede hacer una sospecha en una casilla que no es una habitación o si ya estabas ahí") (DEBUG)
		print(f"MOVE,{election},-1")
	else:
		# Seleccionar una carta de cada tipo (la de menor información)
		place = getLeastInfo(tarjeta[:N_PLACES], me)

		# Desde N_PLACES hasta N_PLACES+N_PEOPLE están los personajes
		who = getLeastInfo(tarjeta[N_PLACES:N_PLACES+N_PEOPLE], me)

		# Desde N_PLACES+N_PEOPLE hasta N_PLACES+N_PEOPLE+N_WEAPONS están las armas
		weapon = getLeastInfo(tarjeta[N_PLACES+N_PEOPLE:N_PLACES+N_PEOPLE+N_WEAPONS], me)

		# Imprimir la sospecha
		# print(f"Sospecha: {PLACES[place]}, {PEOPLE[who]}, {WEAPONS[weapon]}") (DEBUG)
		print(f"MOVE,{election},SUSPECT,{PLACES[place]},{PEOPLE[who]},{WEAPONS[weapon]}")

def acusacion(tarjeta):
	info_place = False
	info_who = False
	info_weapon = False

	idx_place = -1
	idx_who = -1
	idx_weapon = -1

	# Comprobar si se puede hacer una acusación
	for i in range(len(tarjeta)):
		if i < N_PLACES:
			# Lugares
			if sum(tarjeta[i]) <= 10:
				info_place = True
				idx_place = i
		else:
			if not info_place:
				# No hay suficiente información para hacer una acusación
				break
			if i < N_PLACES+N_PEOPLE:
				# Personas
				if sum(tarjeta[i]) <= 10:
					info_who = True
					idx_who = i
			else:
				if not (info_who and info_place):
					# No hay suficiente información para hacer una acusación
					break
				# Armas
				if sum(tarjeta[i]) <= 10:
					info_weapon = True
					idx_weapon = i

	return (info_place and info_who and info_weapon), idx_place, idx_who, idx_weapon

def printCard(tarjeta):
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

def sameRoom(last_pos, decision):
	room = info_tablero[last_pos]['roomName']
	# print(f"room: {room}, decision: {info_tablero[decision]['roomName']}") # (DEBUG)
	if room == '':
		return False
	if room == info_tablero[decision]['roomName']:
		return True
	return False

if __name__ == "__main__":
	
	# Comprobación de parámetros
	if len(sys.argv) != 5:
		print("Uso: python bot.py <[casillas_pjs]> <casilla_inicial> <dados> <tarjeta>", file=sys.stderr)
		sys.exit(1)

	# Inicialización de variables
	casillas_pjs = sys.argv[1]
	# Convertir la lista de casillas de los jugadores a una lista de enteros
	casillas_pjs = list(map(int, casillas_pjs.split(",")))  
	yo = int(sys.argv[2])
	casilla = casillas_pjs[yo]
	dados = int(sys.argv[3])
	str_tarjeta = sys.argv[4]

	# Rellenar la tarjeta como una matriz de n_jugadores x n_cartas
	str_tarjeta = str_tarjeta.split(",")

	# Convertir la lista de tarjetas a una matriz de enteros
	tarjeta = [[int(str_tarjeta[i*N_PLAYERS+j]) for j in range(N_PLAYERS)] for i in range(N_PEOPLE+N_PLACES+N_WEAPONS)]

	# Eliminar la componente "yo" de la lista de casillas de los jugadores
	last_pos = casillas_pjs[yo]
	casillas_pjs = casillas_pjs[:yo] + casillas_pjs[yo+1:]

	vecinos = [N_COLS, 1, -N_COLS, -1]

	candidatos = turn(casillas_pjs, casilla, dados, vecinos)

	acusar, idx_place, idx_who, idx_weapon = acusacion(tarjeta)
	
	if not acusar:
		# Pasar las primeras N_PLACES componentes de la tarjeta a una lista de lugares
		election = decidirMovimiento(candidatos, tarjeta[:N_PLACES], vecinos, casillas_pjs, yo)
		# printCard(tarjeta) (DEBUG)
		sospecha(election, tarjeta, yo, election, last_pos)
	else:
		decision = bfs_habitacion(candidatos, info_habitaciones[idx_place]['roomNumber'], vecinos)
		print(f"MOVE,{decision},-1") if (info_tablero[decision]['roomName'] == '' or sameRoom(last_pos, decision)) else print(f"MOVE,{decision},ACCUSE,{PLACES[idx_place]},{PEOPLE[idx_who-N_PLACES]},{WEAPONS[idx_weapon-N_PLACES-N_PEOPLE]}")
