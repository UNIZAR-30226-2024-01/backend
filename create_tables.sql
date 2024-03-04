-- Type: jugadorUDT

-- DROP TYPE IF EXISTS grace_hopper."jugadorUDT";

CREATE TYPE grace_hopper."jugadorUDT" AS
(
	"userName" character varying(16),
	ficha character varying(16),
	partida_actual integer,
	sospechas character varying(4096),
	posicion grace_hopper.posicion,
	estado character(1)
);

ALTER TYPE grace_hopper."jugadorUDT"
    OWNER TO ufjuuu4tmgx8hdaosrpx;


-- Type: posicion

-- DROP TYPE IF EXISTS grace_hopper.posicion;

CREATE TYPE grace_hopper.posicion AS
(
	x integer,
	y integer
);

ALTER TYPE grace_hopper.posicion
    OWNER TO ufjuuu4tmgx8hdaosrpx;

-- Table: grace_hopper.arma

-- DROP TABLE IF EXISTS grace_hopper.arma;

CREATE TABLE IF NOT EXISTS grace_hopper.arma
(
    nombre character varying(16) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT arma_pkey PRIMARY KEY (nombre)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.arma
    OWNER to ufjuuu4tmgx8hdaosrpx;

-- Table: grace_hopper.bot

-- DROP TABLE IF EXISTS grace_hopper.bot;

CREATE TABLE IF NOT EXISTS grace_hopper.bot
(
    "userName" character varying(16) COLLATE pg_catalog."default" NOT NULL,
    nivel_dificultad integer NOT NULL,
    CONSTRAINT bot_pkey PRIMARY KEY ("userName"),
    CONSTRAINT "bot_userName" FOREIGN KEY ("userName")
        REFERENCES grace_hopper.jugador ("userName") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.bot
    OWNER to ufjuuu4tmgx8hdaosrpx;

-- Table: grace_hopper.cartas_armas_jugador

-- DROP TABLE IF EXISTS grace_hopper.cartas_armas_jugador;

CREATE TABLE IF NOT EXISTS grace_hopper.cartas_armas_jugador
(
    "userName" character varying(16) COLLATE pg_catalog."default" NOT NULL,
    "cartasArma" character varying(16) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT cartas_armas_jugador_pkey PRIMARY KEY ("userName", "cartasArma"),
    CONSTRAINT carta FOREIGN KEY ("cartasArma")
        REFERENCES grace_hopper.arma (nombre) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT "user" FOREIGN KEY ("userName")
        REFERENCES grace_hopper.jugador ("userName") MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.cartas_armas_jugador
    OWNER to ufjuuu4tmgx8hdaosrpx;


-- Table: grace_hopper.cartas_lugar_jugador

-- DROP TABLE IF EXISTS grace_hopper.cartas_lugar_jugador;

CREATE TABLE IF NOT EXISTS grace_hopper.cartas_lugar_jugador
(
    "userName" character varying(16) COLLATE pg_catalog."default" NOT NULL,
    "cartaLugar" character varying(16) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT cartas_lugar_jugador_pkey PRIMARY KEY ("userName", "cartaLugar")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.cartas_lugar_jugador
    OWNER to ufjuuu4tmgx8hdaosrpx;


-- Table: grace_hopper.cartas_personajes_jugador

-- DROP TABLE IF EXISTS grace_hopper.cartas_personajes_jugador;

CREATE TABLE IF NOT EXISTS grace_hopper.cartas_personajes_jugador
(
    "userName" character varying(16) COLLATE pg_catalog."default" NOT NULL,
    "cartaPersonaje" character varying(16) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT cartas_personajes_jugador_pkey PRIMARY KEY ("cartaPersonaje", "userName"),
    CONSTRAINT carta FOREIGN KEY ("cartaPersonaje")
        REFERENCES grace_hopper.personajes (nombre) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT "user" FOREIGN KEY ("userName")
        REFERENCES grace_hopper.jugador ("userName") MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.cartas_personajes_jugador
    OWNER to ufjuuu4tmgx8hdaosrpx;


-- Table: grace_hopper.conversacion

-- DROP TABLE IF EXISTS grace_hopper.conversacion;

CREATE TABLE IF NOT EXISTS grace_hopper.conversacion
(
    instante timestamp(6) with time zone NOT NULL,
    "isQuestion" character(1) COLLATE pg_catalog."default",
    partida integer NOT NULL,
    contenido character varying(4096) COLLATE pg_catalog."default" NOT NULL,
    emisor character varying(16) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT conversacion_pkey PRIMARY KEY (partida, emisor, instante),
    CONSTRAINT emisor FOREIGN KEY (emisor)
        REFERENCES grace_hopper.jugador ("userName") MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL
        NOT VALID,
    CONSTRAINT partida FOREIGN KEY (partida)
        REFERENCES grace_hopper.partida (id_partida) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT "isQuestion Valido" CHECK ("isQuestion" = '0'::bpchar OR "isQuestion" = '1'::bpchar) NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.conversacion
    OWNER to ufjuuu4tmgx8hdaosrpx;


-- Table: grace_hopper.jugador

-- DROP TABLE IF EXISTS grace_hopper.jugador;

CREATE TABLE IF NOT EXISTS grace_hopper.jugador
    OF grace_hopper."jugadorUDT"
(
    -- Inherited from type grace_hopper."jugadorUDT": "userName" character varying(16) COLLATE pg_catalog."default" NOT NULL,
    -- Inherited from type grace_hopper."jugadorUDT": ficha character varying(16) COLLATE pg_catalog."default",
    -- Inherited from type grace_hopper."jugadorUDT": partida_actual integer,
    -- Inherited from type grace_hopper."jugadorUDT": sospechas character varying(4096) COLLATE pg_catalog."default" NOT NULL,
    -- Inherited from type grace_hopper."jugadorUDT": posicion grace_hopper.posicion NOT NULL,
    -- Inherited from type grace_hopper."jugadorUDT": estado character(1) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT jugador_pkey PRIMARY KEY ("userName"),
    CONSTRAINT ficha FOREIGN KEY (ficha)
        REFERENCES grace_hopper.personajes (nombre) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT partida_actual FOREIGN KEY (partida_actual)
        REFERENCES grace_hopper.partida (id_partida) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL
        NOT VALID,
    CONSTRAINT "estado valido" CHECK (estado = '0'::bpchar OR estado = '1'::bpchar) NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.jugador
    OWNER to ufjuuu4tmgx8hdaosrpx;


-- Table: grace_hopper.lugar

-- DROP TABLE IF EXISTS grace_hopper.lugar;

CREATE TABLE IF NOT EXISTS grace_hopper.lugar
(
    nombre character varying(16) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT lugar_pkey PRIMARY KEY (nombre)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.lugar
    OWNER to ufjuuu4tmgx8hdaosrpx;


-- Table: grace_hopper.mensajes_predefinidos

-- DROP TABLE IF EXISTS grace_hopper.mensajes_predefinidos;

CREATE TABLE IF NOT EXISTS grace_hopper.mensajes_predefinidos
(
    text character varying(64) COLLATE pg_catalog."default" NOT NULL,
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 0 MINVALUE 0 MAXVALUE 2147483647 CACHE 1 ),
    CONSTRAINT mensajes_predefinidos_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.mensajes_predefinidos
    OWNER to ufjuuu4tmgx8hdaosrpx;


-- Table: grace_hopper.partida

-- DROP TABLE IF EXISTS grace_hopper.partida;

CREATE TABLE IF NOT EXISTS grace_hopper.partida
(
    id_partida integer NOT NULL,
    estado character varying(1) COLLATE pg_catalog."default" NOT NULL,
    fecha_ini date NOT NULL,
    fecha_fin date NOT NULL,
    tipo character varying(1) COLLATE pg_catalog."default" NOT NULL,
    turno character varying(16) COLLATE pg_catalog."default",
    asesino character varying(16) COLLATE pg_catalog."default",
    arma character varying(16) COLLATE pg_catalog."default",
    lugar character varying(16) COLLATE pg_catalog."default",
    CONSTRAINT partida_pkey PRIMARY KEY (id_partida),
    CONSTRAINT arma FOREIGN KEY (arma)
        REFERENCES grace_hopper.arma (nombre) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT asesino FOREIGN KEY (asesino)
        REFERENCES grace_hopper.personajes (nombre) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT lugar FOREIGN KEY (lugar)
        REFERENCES grace_hopper.lugar (nombre) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT turno FOREIGN KEY (turno)
        REFERENCES grace_hopper.jugador ("userName") MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "estado partida" CHECK (estado::text = 'p'::text OR estado::text = '1'::text OR estado::text = '0'::text) NOT VALID,
    CONSTRAINT "fecha correcta" CHECK (fecha_ini <= fecha_fin) NOT VALID,
    CONSTRAINT tipo CHECK (tipo::text = 'o'::text OR tipo::text = 'l'::text) NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.partida
    OWNER to ufjuuu4tmgx8hdaosrpx;

-- Table: grace_hopper.personajes

-- DROP TABLE IF EXISTS grace_hopper.personajes;

CREATE TABLE IF NOT EXISTS grace_hopper.personajes
(
    nombre character varying(16) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT personajes_pkey PRIMARY KEY (nombre)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.personajes
    OWNER to ufjuuu4tmgx8hdaosrpx;


-- Table: grace_hopper.usuario

-- DROP TABLE IF EXISTS grace_hopper.usuario;

CREATE TABLE IF NOT EXISTS grace_hopper.usuario
(
    "userName" character varying(16) COLLATE pg_catalog."default" NOT NULL,
    passwd character varying COLLATE pg_catalog."default" NOT NULL,
    "XP" integer NOT NULL DEFAULT 0,
    n_ganadas_online integer NOT NULL DEFAULT 0,
    n_ganadas_local integer NOT NULL DEFAULT 0,
    n_jugadas integer NOT NULL DEFAULT 0,
    CONSTRAINT usuario_pkey PRIMARY KEY ("userName"),
    CONSTRAINT "user_userName" FOREIGN KEY ("userName")
        REFERENCES grace_hopper.jugador ("userName") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT n_jugadas CHECK (n_jugadas <= (n_ganadas_local + n_ganadas_online)) NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.usuario
    OWNER to ufjuuu4tmgx8hdaosrpx;