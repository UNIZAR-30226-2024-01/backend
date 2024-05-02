
import json
global info_tablero
global info_habitaciones

PLACES = ['aulas norte',
  'recepcion',
  'laboratorio',
  'escaleras',
  'biblioteca',
  'ba:nos',
  'despacho',
  'cafeteria',
  'aulas sur']
def getInfo():
	with open('../bot/infoTablero.json', 'r') as file:
		global info_tablero
		info_tablero = json.load(file)
	
	# Leer el JSON desde el archivo
	with open('../bot/infoHabitaciones.json', 'r') as file:
		global info_habitaciones
		info_habitaciones = json.load(file)
		# Quitar ada byron
		info_habitaciones = info_habitaciones[:4] + info_habitaciones[5:]

if __name__ == "__main__":
	getInfo()
	elec = 105
	# Sacar el indice de la habitacion a partir del numero de casilla en infoTablero
	i = 0
	for kk in info_habitaciones:
		if int(info_tablero[elec]['roomName']) == kk['roomNumber']:
			print(i)
			break
		i += 1
	print(PLACES[i])