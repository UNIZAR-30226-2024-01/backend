-- Table: grace_hopper.arma

-- DROP TABLE IF EXISTS grace_hopper.arma;

CREATE TABLE IF NOT EXISTS grace_hopper.arma
(
    nombre character varying(16)[] COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT arma_pkey PRIMARY KEY (nombre)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.arma
    OWNER to ufjuuu4tmgx8hdaosrpx;

-- Table: grace_hopper.bot

-- DROP TABLE IF EXISTS grace_hopper.bot;

CREATE TABLE IF NOT EXISTS grace_hopper.bot
(
    "UserName" character varying(16)[] COLLATE pg_catalog."default" NOT NULL,
    "nivelDificultad" integer DEFAULT 0,
    CONSTRAINT bot_pkey PRIMARY KEY ("UserName"),
    CONSTRAINT "userName" FOREIGN KEY ("UserName")
        REFERENCES grace_hopper.jugador ("userName") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.bot
    OWNER to ufjuuu4tmgx8hdaosrpx;

-- Table: grace_hopper.cartas_armas_jugador

-- DROP TABLE IF EXISTS grace_hopper.cartas_armas_jugador;

CREATE TABLE IF NOT EXISTS grace_hopper.cartas_armas_jugador
(
    "userName" character varying(16)[] COLLATE pg_catalog."default" NOT NULL,
    "cartaArma" character varying(16)[] COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT cartas_armas_jugador_pkey PRIMARY KEY ("userName", "cartaArma"),
    CONSTRAINT "cartaArma" FOREIGN KEY ("cartaArma")
        REFERENCES grace_hopper.arma (nombre) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "userName" FOREIGN KEY ("userName")
        REFERENCES grace_hopper.jugador ("userName") MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.cartas_armas_jugador
    OWNER to ufjuuu4tmgx8hdaosrpx;

-- Table: grace_hopper.cartas_lugar_jugador

-- DROP TABLE IF EXISTS grace_hopper.cartas_lugar_jugador;

CREATE TABLE IF NOT EXISTS grace_hopper.cartas_lugar_jugador
(
    "userName" character varying(16)[] COLLATE pg_catalog."default" NOT NULL,
    "cartaLugar" character varying(16)[] COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT cartas_lugar_jugador_pkey PRIMARY KEY ("userName", "cartaLugar"),
    CONSTRAINT "cartaLugar" FOREIGN KEY ("cartaLugar")
        REFERENCES grace_hopper.lugar (nombre) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "userName" FOREIGN KEY ("userName")
        REFERENCES grace_hopper.jugador ("userName") MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.cartas_lugar_jugador
    OWNER to ufjuuu4tmgx8hdaosrpx;


-- Table: grace_hopper.cartas_personajes_jugador

-- DROP TABLE IF EXISTS grace_hopper.cartas_personajes_jugador;

CREATE TABLE IF NOT EXISTS grace_hopper.cartas_personajes_jugador
(
    "userName" character varying(16)[] COLLATE pg_catalog."default" NOT NULL,
    "cartaPersonaje" character varying(16)[] COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT cartas_personajes_jugador_pkey PRIMARY KEY ("userName", "cartaPersonaje"),
    CONSTRAINT "cartaPersonaje" FOREIGN KEY ("cartaPersonaje")
        REFERENCES grace_hopper.personajes (nombre) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "userName" FOREIGN KEY ("userName")
        REFERENCES grace_hopper.jugador ("userName") MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.cartas_personajes_jugador
    OWNER to ufjuuu4tmgx8hdaosrpx;

-- Table: grace_hopper.conversacion

-- DROP TABLE IF EXISTS grace_hopper.conversacion;

CREATE TABLE IF NOT EXISTS grace_hopper.conversacion
(
    instante timestamp with time zone NOT NULL,
    partida integer NOT NULL,
    emisor character varying(16)[] COLLATE pg_catalog."default" NOT NULL,
    contenido character varying(256)[] COLLATE pg_catalog."default" NOT NULL,
    "isQuestion" character(1) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT conversacion_pkey PRIMARY KEY (instante, partida, emisor),
    CONSTRAINT emisor FOREIGN KEY (emisor)
        REFERENCES grace_hopper.usuario ("userName") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT partida FOREIGN KEY (partida)
        REFERENCES grace_hopper.partida (id_partida) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.conversacion
    OWNER to ufjuuu4tmgx8hdaosrpx;

-- Table: grace_hopper.jugador

-- DROP TABLE IF EXISTS grace_hopper.jugador;

CREATE TABLE IF NOT EXISTS grace_hopper.jugador
(
    "userName" character varying(16)[] COLLATE pg_catalog."default" NOT NULL,
    ficha character varying(16)[] COLLATE pg_catalog."default",
    "partidaActual" integer,
    sospechas character varying(4096)[] COLLATE pg_catalog."default",
    "posicionTablero" character varying(8)[] COLLATE pg_catalog."default",
    CONSTRAINT jugador_pkey PRIMARY KEY ("userName"),
    CONSTRAINT ficha FOREIGN KEY (ficha)
        REFERENCES grace_hopper.personajes (nombre) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "partidaActual" FOREIGN KEY ("partidaActual")
        REFERENCES grace_hopper.partida (id_partida) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.jugador
    OWNER to ufjuuu4tmgx8hdaosrpx;

-- Table: grace_hopper.lugar

-- DROP TABLE IF EXISTS grace_hopper.lugar;

CREATE TABLE IF NOT EXISTS grace_hopper.lugar
(
    nombre character varying(16)[] COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT lugar_pkey PRIMARY KEY (nombre)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.lugar
    OWNER to ufjuuu4tmgx8hdaosrpx;

-- Table: grace_hopper.partida

-- DROP TABLE IF EXISTS grace_hopper.partida;

CREATE TABLE IF NOT EXISTS grace_hopper.partida
(
    id_partida integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 3 START 1000 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    estado character varying(1) COLLATE pg_catalog."default",
    fecha_ini date,
    fecha_fin date,
    tipo character varying(1) COLLATE pg_catalog."default",
    turno character varying(16)[] COLLATE pg_catalog."default",
    asesino character varying(16)[] COLLATE pg_catalog."default",
    arma character varying(16)[] COLLATE pg_catalog."default",
    lugar character varying(16)[] COLLATE pg_catalog."default",
    CONSTRAINT partida_pkey PRIMARY KEY (id_partida),
    CONSTRAINT arma FOREIGN KEY (arma)
        REFERENCES grace_hopper.arma (nombre) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT asesino FOREIGN KEY (asesino)
        REFERENCES grace_hopper.personajes (nombre) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT lugar FOREIGN KEY (lugar)
        REFERENCES grace_hopper.lugar (nombre) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT turno FOREIGN KEY (turno)
        REFERENCES grace_hopper.jugador ("userName") MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL
        NOT VALID,
    CONSTRAINT "fechaFinMayor" CHECK (fecha_fin > fecha_ini) NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.partida
    OWNER to ufjuuu4tmgx8hdaosrpx;

-- Trigger: verificar_turno

-- DROP TRIGGER IF EXISTS verificar_turno ON grace_hopper.partida;

CREATE OR REPLACE TRIGGER verificar_turno
    BEFORE INSERT OR UPDATE 
    ON grace_hopper.partida
    FOR EACH ROW
    EXECUTE FUNCTION grace_hopper.validar_turno();

-- Table: grace_hopper.personajes

-- DROP TABLE IF EXISTS grace_hopper.personajes;

CREATE TABLE IF NOT EXISTS grace_hopper.personajes
(
    nombre character varying(16)[] COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT personajes_pkey PRIMARY KEY (nombre)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.personajes
    OWNER to ufjuuu4tmgx8hdaosrpx;

    -- Table: grace_hopper.usuario

-- DROP TABLE IF EXISTS grace_hopper.usuario;

CREATE TABLE IF NOT EXISTS grace_hopper.usuario
(
    "userName" character varying(16)[] COLLATE pg_catalog."default" NOT NULL,
    passwd character varying(32)[] COLLATE pg_catalog."default" NOT NULL,
    n_jugadas integer NOT NULL DEFAULT 0,
    n_ganadas_local integer NOT NULL DEFAULT 0,
    n_ganadas_online integer NOT NULL DEFAULT 0,
    "XP" integer NOT NULL DEFAULT 0,
    CONSTRAINT usuario_pkey PRIMARY KEY ("userName")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS grace_hopper.usuario
    OWNER to ufjuuu4tmgx8hdaosrpx;