###############################################
# Author: Grace Hopper
#
#
#
###############################################

import sys
import random
import time

# Constantes para n_players y n_things
N_PLAYERS = 6
N_PLACES = 9
N_WEAPONS = 6
N_PEOPLE = 6

MAX_PROB = 100
MIN_PROB = 0

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

def checkArgs():
	if len(sys.argv) != 10:
		print("Usage: python3 updateCard.py <me> <lvl> <asker> <holder> <where> <who> <what> <hasSmg> <card>")
		print(len(sys.argv))
		sys.exit(1)

def getCard():
	str_tarjeta = sys.argv[9]
	str_tarjeta = str_tarjeta.split(',')

	# Convertir la lista de tarjetas a una matriz de enteros
	tarjeta = [[int(str_tarjeta[i*N_PLAYERS+j]) for j in range(N_PLAYERS)] for i in range(N_PEOPLE+N_PLACES+N_WEAPONS)]

	return tarjeta

def level1():
	me = int(sys.argv[1])
	asker = int(sys.argv[3])
	tarjeta = getCard()

	if me == asker:
		holder = int(sys.argv[4])
		idx = (asker + 1) % N_PLAYERS
		where = PLACES.index(sys.argv[5])
		who = PEOPLE.index(sys.argv[6])
		what = WEAPONS.index(sys.argv[7])

		while idx != holder:
			# Este player no tiene la tarjeta que se pregunta
			tarjeta[where][idx] = MIN_PROB
			tarjeta[who+N_PLACES][idx] = MIN_PROB
			tarjeta[what+N_PLACES+N_PEOPLE][idx] = MIN_PROB
			idx = (idx + 1) % N_PLAYERS

		if idx != me:
			# Este player tiene la tarjeta que se pregunta
			hasSmg = int(sys.argv[8])
			line = 0

			if hasSmg == 0:
				tarjeta[where][idx] = MAX_PROB
				line = where
			elif hasSmg == 1:
				tarjeta[who+N_PLACES][idx] = MAX_PROB
				line = who+N_PLACES
			elif hasSmg == 2:
				tarjeta[what+N_PLACES+N_PEOPLE][idx] = MAX_PROB
				line = what+N_PLACES+N_PEOPLE
			
			for i in range(N_PLAYERS):
				if i != holder:
					tarjeta[line][i] = MIN_PROB

	return tarjeta


def level2():
	me = int(sys.argv[1])
	asker = int(sys.argv[3])
	holder = int(sys.argv[4])
	where = PLACES.index(sys.argv[5])
	who = PEOPLE.index(sys.argv[6])
	what = WEAPONS.index(sys.argv[7])

	tarjeta = getCard()
	if me == asker:
		hasSmg = int(sys.argv[8])

		if hasSmg == 0:
			tarjeta[where][holder] = MAX_PROB
			line = where
		elif hasSmg == 1:
			tarjeta[who+N_PLACES][holder] = MAX_PROB
			line = who+N_PLACES
		elif hasSmg == 2:
			tarjeta[what+N_PLACES+N_PEOPLE][holder] = MAX_PROB
			line = what+N_PLACES+N_PEOPLE

		for i in range(N_PLAYERS):
			if i != holder:
				tarjeta[line][i] = MIN_PROB

	idx = (asker + 1) % N_PLAYERS
	while idx != holder:
		# Este player no tiene la tarjeta que se pregunta
		tarjeta[where][idx] = MIN_PROB
		tarjeta[who+N_PLACES][idx] = MIN_PROB
		tarjeta[what+N_PLACES+N_PEOPLE][idx] = MIN_PROB
		idx = (idx + 1) % N_PLAYERS
	
	return tarjeta
	

def level3():
	me = int(sys.argv[1])
	asker = int(sys.argv[3])
	holder = int(sys.argv[4])
	where = PLACES.index(sys.argv[5])
	who = PEOPLE.index(sys.argv[6])
	what = WEAPONS.index(sys.argv[7])

	tarjeta = getCard()
	if me == asker:
		hasSmg = int(sys.argv[8])

		if hasSmg == 0:
			tarjeta[where][holder] = MAX_PROB
			line = where
		elif hasSmg == 1:
			tarjeta[who+N_PLACES][holder] = MAX_PROB
			line = who+N_PLACES
		elif hasSmg == 2:
			tarjeta[what+N_PLACES+N_PEOPLE][holder] = MAX_PROB
			line = what+N_PLACES+N_PEOPLE

		for i in range(N_PLAYERS):
			if i != holder:
				tarjeta[line][i] = MIN_PROB
	else:
		# Yo no pregunto
		tarjeta[where][holder] = min(tarjeta[where][holder] + 10, MAX_PROB)
		tarjeta[who+N_PLACES][holder] = min(tarjeta[who+N_PLACES][holder] + 10, MAX_PROB)
		tarjeta[what+N_PLACES+N_PEOPLE][holder] = min(tarjeta[what+N_PLACES+N_PEOPLE][holder] + 10, MAX_PROB)

		tarjeta[where][asker] = max(tarjeta[where][asker] - 10, MIN_PROB)
		tarjeta[who+N_PLACES][asker] = max(tarjeta[who+N_PLACES][asker] - 10, MIN_PROB)
		tarjeta[what+N_PLACES+N_PEOPLE][asker] = max(tarjeta[what+N_PLACES+N_PEOPLE][asker] - 10, MIN_PROB)

	idx = (asker + 1) % N_PLAYERS
	while idx != holder:
		# Este player no tiene la tarjeta que se pregunta
		tarjeta[where][idx] = MIN_PROB
		tarjeta[who+N_PLACES][idx] = MIN_PROB
		tarjeta[what+N_PLACES+N_PEOPLE][idx] = MIN_PROB
		idx = (idx + 1) % N_PLAYERS

	return tarjeta

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


if __name__ == '__main__':

	checkArgs()
	lvl = int(sys.argv[2])

	if lvl == 1:
		res = level1()
	elif lvl == 2:
		res = level2()
	elif lvl == 3:
		res = level3()
	else:
		print("Invalid level")
		sys.exit(1)
	printCard(res)    
