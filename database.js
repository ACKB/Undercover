/**
 * UNDERCOVER — Base de Datos v2.2
 *
 * Filosofía de pistas:
 * Un detalle o momento icónico DENTRO del universo de la palabra.
 * Sin conocer la respuesta: muchas interpretaciones posibles.
 * Conociéndola: tiene sentido perfecto.
 *
 * Ejemplos de la filosofía correcta:
 *   Matrix    → "elegir entre una pastilla roja y una azul"
 *   Piñata    → "los ojos cerrados y un palo"
 *   Perezoso  → "tarda una semana en bajar a hacer sus necesidades"
 */

const GAME_DATA = {

    "Infantil": [
        { word: "Bob Esponja",            hint: "vive dentro de una piña en el fondo del mar" },
        { word: "Dinosaurio",             hint: "los científicos los reconstruyen con huesos y ADN" },
        { word: "Helado",                 hint: "hay debates muy serios sobre el mejor sabor" },
        { word: "Bicicleta",              hint: "el primer intento casi siempre acaba en caída" },
        { word: "Payaso",                 hint: "su risa tan exagerada a veces da más miedo que gracia" },
        { word: "Cohete",                 hint: "3, 2, 1... y una nube de humo enorme" },
        { word: "Arcoíris",               hint: "aparece cuando menos te lo esperas, después de la lluvia" },
        { word: "Parque de diversiones",  hint: "hay una atracción que todos quieren pero nadie se atreve" },
        { word: "Piñata",                 hint: "los ojos cerrados y un palo" },
        { word: "Superhéroe",             hint: "de día es una persona completamente normal" },
        { word: "Dragón",                 hint: "en occidente es el villano, en oriente es el héroe" },
        { word: "Circo",                  hint: "hay que mirar hacia arriba para ver lo imposible" },
        { word: "Pirata",                 hint: "un mapa, una X y alguien que no quiere que llegues" },
        { word: "Hada",                   hint: "todo lo que toca se convierte en algo diferente" },
        { word: "Castillo",               hint: "hay que cruzar un puente levadizo para entrar" }
    ],

    "Peliculas": [
        { word: "Harry Potter",               hint: "un tren que sale de un andén que no existe" },
        { word: "Titanic",                    hint: "un collar muy caro termina en el fondo del mar" },
        { word: "El Padrino",                 hint: "encontraron la cabeza de un caballo en la cama" },
        { word: "Matrix",                     hint: "elegir entre una pastilla roja y una azul" },
        { word: "Joker",                      hint: "baila en unas escaleras después de un día horrible" },
        { word: "Coco",                       hint: "los muertos desaparecen si nadie los recuerda" },
        { word: "Shrek",                      hint: "usa las capas de una cebolla como metáfora de sí mismo" },
        { word: "Avengers",                   hint: "chasquear los dedos con un guante cambia todo" },
        { word: "El Señor de los Anillos",    hint: "hay que arrojarlo al fuego de una montaña específica" },
        { word: "Interstellar",               hint: "una hora allá equivale a siete años aquí" },
        { word: "Frozen",                     hint: "el amor verdadero era el de una hermana, no un romance" },
        { word: "Inception",                  hint: "un trompo que nunca para de girar" },
        { word: "Toy Story",                  hint: "cuando el niño sale de la habitación, todos cobran vida" },
        { word: "El Rey León",                hint: "el reflejo en el agua le habla" },
        { word: "Piratas del Caribe",         hint: "el capitán tiene que regresar el barco al fondo del mar" }
    ],

    "Objetos": [
        { word: "Tijeras",            hint: "dos piezas que no sirven de nada sin la otra" },
        { word: "Termómetro",         hint: "sube cuando tienes fiebre" },
        { word: "Brújula",            hint: "siempre apunta en la misma dirección pase lo que pase" },
        { word: "Linterna",           hint: "la buscas desesperado cuando ya es de noche" },
        { word: "Paraguas",           hint: "siempre lo olvidas el día que más lo necesitas" },
        { word: "Calculadora",        hint: "todos la usamos mal para la propina" },
        { word: "Candado",            hint: "alguien puede olvidar la combinación y quedarse fuera" },
        { word: "Reloj de arena",     hint: "cuando se acaba la arena hay que darle la vuelta" },
        { word: "Mochila",            hint: "te duele la espalda si la llevas muy pesada" },
        { word: "Espejo",             hint: "dicen que romperlo trae siete años de mala suerte" },
        { word: "Máquina de coser",   hint: "hace un ruido rítmico y repetitivo que hipnotiza" },
        { word: "Álbum de fotos",     hint: "está lleno de momentos que ya no existen" },
        { word: "Ventilador",         hint: "en verano salva vidas pero no te deja dormir" },
        { word: "Microscopio",        hint: "ves las cosas mucho más grandes de lo que realmente son" },
        { word: "Guitarra",           hint: "si no practicas a diario, los dedos lo notan" }
    ],

    "Lugares": [
        { word: "Aeropuerto",         hint: "hay más drama que en cualquier película en sus puertas" },
        { word: "Mazmorra",           hint: "entras por un crimen y sales cuando alguien lo decide" },
        { word: "Faro",               hint: "su único trabajo es no apagarse nunca" },
        { word: "Casino",             hint: "la casa siempre gana a largo plazo" },
        { word: "Iglesia",            hint: "hay silencio aunque estés rodeado de gente" },
        { word: "Zoológico",          hint: "el que observa y el que es observado depende del lado" },
        { word: "Submarino",          hint: "si algo falla, no hay hacia dónde huir" },
        { word: "Estación espacial",  hint: "todo flota, hasta las lágrimas" },
        { word: "Anfiteatro",         hint: "desde el asiento más lejano se oye perfectamente" },
        { word: "Biblioteca",         hint: "hay reglas de silencio que nadie impuso y todos respetan" },
        { word: "Cárcel",             hint: "el tiempo pasa diferente cuando no decides cuándo sales" },
        { word: "Volcán",             hint: "lo que escupe lleva millones de años ahí dentro" },
        { word: "Selva",              hint: "el ruido allí nunca para, ni de día ni de noche" },
        { word: "Cementerio",         hint: "hay personas que hablan con quienes ya no pueden responder" },
        { word: "Estadio",            hint: "ochenta mil personas pensando lo mismo al mismo tiempo" }
    ],

    "Adultos": [
        { word: "Resaca",             hint: "juras que nunca más, pero es mentira" },
        { word: "Hipoteca",           hint: "firmas un contrato con el banco antes de que nazcas tus hijos" },
        { word: "Tinder",             hint: "un dedo decide en menos de un segundo" },
        { word: "Suegra",             hint: "siempre hay una opinión sin que nadie la pida" },
        { word: "Divorcio",           hint: "los abogados cobran más que la boda" },
        { word: "Impuestos",          hint: "pagas sin saber muy bien a dónde va" },
        { word: "Jefe tóxico",        hint: "te manda un mensaje a las 11 de la noche y espera respuesta" },
        { word: "Burnout",            hint: "cuando llegas al trabajo ya vienes agotado del camino" },
        { word: "Deuda de tarjeta",   hint: "cada mes pagas y el número no baja" },
        { word: "Midlife crisis",     hint: "de repente quieres comprarte una moto a los 45" },
        { word: "Reunión de trabajo", hint: "pudo haber sido un correo pero aquí estamos" },
        { word: "Despedida de soltero", hint: "lo que pasa allí se supone que no se puede contar" },
        { word: "Política",           hint: "todo el mundo tiene razón y nadie se pone de acuerdo" },
        { word: "Infidelidad",        hint: "un segundo mensaje desde el baño lo cambia todo" },
        { word: "Terapia",            hint: "pagas para que alguien te haga preguntas sin darte respuestas" }
    ],

    "Profesiones": [
        { word: "Cirujano",       hint: "primero no hagas daño" },
        { word: "Astronauta",     hint: "flotar es lo más difícil de controlar" },
        { word: "Detective",      hint: "siempre hay un detalle que todos los demás ignoraron" },
        { word: "Chef",           hint: "el ego en la cocina puede ser tan peligroso como el cuchillo" },
        { word: "Piloto",         hint: "el despegue y el aterrizaje son los únicos momentos tensos" },
        { word: "Arqueólogo",     hint: "la brocha es tan importante como el pico" },
        { word: "Abogado",        hint: "importa más quién habla mejor que quién tiene razón" },
        { word: "Bombero",        hint: "entra cuando todos los demás están saliendo corriendo" },
        { word: "Fotógrafo",      hint: "el momento que capturas nunca volverá a existir" },
        { word: "Psicólogo",      hint: "hace preguntas pero nunca te da las respuestas directas" },
        { word: "Veterinario",    hint: "su paciente nunca le puede decir dónde le duele" },
        { word: "Arquitecto",     hint: "un error en el plano se convierte en un problema de toneladas" },
        { word: "Mecánico",       hint: "te cobra algo y nunca sabes si realmente era tan urgente" },
        { word: "Taxidermista",   hint: "su taller da escalofríos a quienes entran sin avisar" },
        { word: "Sommelier",      hint: "escupen lo que prueban y aun así es un trabajo muy serio" }
    ],

    "Partes del cuerpo": [
        { word: "Hígado",             hint: "trabaja toda la noche mientras tú duermes" },
        { word: "Retina",             hint: "si se desprende, el tiempo cuenta" },
        { word: "Tendón de Aquiles",  hint: "lo más fuerte puede tener el punto más débil" },
        { word: "Clavícula",          hint: "uno de los huesos que más se rompe en accidentes leves" },
        { word: "Tímpano",            hint: "un volumen muy alto puede dañarlo de por vida" },
        { word: "Cerebelo",           hint: "sin él no podrías caminar en línea recta" },
        { word: "Apéndice",           hint: "nadie sabe exactamente para qué sirve" },
        { word: "Córnea",             hint: "se puede trasplantar y devolverte algo que creías perdido" },
        { word: "Nuca",               hint: "es donde más se acumula el estrés sin que lo notes" },
        { word: "Diafragma",          hint: "cuando te da hipo no puedes controlarlo" },
        { word: "Meñique",            hint: "el más pequeño y el que más duele al golpearse" },
        { word: "Pómulo",             hint: "define el mapa de la cara" },
        { word: "Muñeca",             hint: "aquí se toma el pulso" },
        { word: "Encías",             hint: "si sangran hay que ir al dentista pero casi nadie va" },
        { word: "Lóbulo de la oreja", hint: "algunos se lo perforan tantas veces que ya no cierra" }
    ],

    "Animales": [
        { word: "Mantis religiosa",   hint: "la hembra termina con el macho después del apareamiento" },
        { word: "Ornitorrinco",       hint: "cuando lo describieron en Europa pensaron que era un fraude" },
        { word: "Tarántula",          hint: "su aspecto da mucho más miedo que su peligro real" },
        { word: "Delfín",             hint: "más inteligente de lo que cualquiera quisiera admitir" },
        { word: "Camaleón",           hint: "cambia para no ser visto, no para llamar la atención" },
        { word: "Perezoso",           hint: "tarda una semana en bajar del árbol a hacer sus necesidades" },
        { word: "Flamenco",           hint: "su color rosado viene de lo que come, no de lo que es" },
        { word: "Calamar gigante",    hint: "nadie lo ha visto vivo en su hábitat natural" },
        { word: "Buitre",             hint: "espera pacientemente a que otros hagan el trabajo sucio" },
        { word: "Puercoespín",        hint: "su defensa es simplemente quedarse muy quieto" },
        { word: "Mantarraya",         hint: "se mueve como si volara pero bajo el agua" },
        { word: "Rinoceronte",        hint: "su cuerno se vende ilegalmente más caro que el oro" },
        { word: "Luciérnaga",         hint: "produce su propia luz sin ninguna batería" },
        { word: "Axolote",            hint: "si pierde una extremidad, le vuelve a crecer" },
        { word: "Hurón",              hint: "siempre está metiéndose donde no debería" }
    ],

    "Emociones": [
        { word: "Nostalgia",      hint: "te hace querer volver a un lugar que ya no existe igual" },
        { word: "Euforia",        hint: "cuando llega hace que todo lo demás parezca insignificante" },
        { word: "Culpa",          hint: "aparece aunque nadie te haya visto" },
        { word: "Envidia",        hint: "nunca la reconoces fácilmente en ti mismo" },
        { word: "Asombro",        hint: "te paraliza un segundo antes de que puedas reaccionar" },
        { word: "Melancolía",     hint: "no es tristeza, pero tampoco es felicidad" },
        { word: "Orgullo",        hint: "puede ser lo mejor y lo peor de una persona a la vez" },
        { word: "Vergüenza",      hint: "quisieras que la tierra te tragara" },
        { word: "Frustración",    hint: "aparece cuando el esfuerzo no alcanza para el resultado" },
        { word: "Ternura",        hint: "difícil de fingir, imposible de forzar" },
        { word: "Aversión",       hint: "el cuerpo reacciona antes de que la mente decida" },
        { word: "Serenidad",      hint: "los maestros la buscan toda la vida" },
        { word: "Celos",          hint: "no son del otro, son del miedo a perder algo" },
        { word: "Desesperación",  hint: "cuando ya no importa si hay plan B" },
        { word: "Impotencia",     hint: "ves el problema pero no tienes las herramientas" }
    ],

    "Comida": [
        { word: "Sushi",           hint: "la temperatura del arroz lo cambia todo" },
        { word: "Guacamole",       hint: "se pone negro si no lo tapas bien" },
        { word: "Croissant",       hint: "necesita docenas de capas de mantequilla para ser perfecto" },
        { word: "Paella",          hint: "hay guerras familiares por cuál es la receta correcta" },
        { word: "Ramen",           hint: "el caldo puede llevar días preparándose" },
        { word: "Ceviche",         hint: "el limón hace lo que normalmente hace el fuego" },
        { word: "Tiramisú",        hint: "lleva café y alcohol pero lo comen hasta los niños" },
        { word: "Poutine",         hint: "mezcla tres cosas que parecen no ir juntas para nada" },
        { word: "Falafel",         hint: "crujiente por fuera, suave por dentro, comido en pan" },
        { word: "Dim Sum",         hint: "se pide señalando porque nadie sabe pronunciarlo bien" },
        { word: "Empanada",        hint: "el relleno define de qué región viene quien la prepara" },
        { word: "Fondue",          hint: "si se te cae el pan al queso, hay una prenda" },
        { word: "Tacos al pastor", hint: "el truco está en el trompo y en la piña de arriba" },
        { word: "Baklava",         hint: "tan dulce que con uno ya es suficiente... pero no lo es" },
        { word: "Bibimbap",        hint: "hay que mezclarlo todo antes de comerlo o no vale" }
    ],

    "Videojuegos": [
        { word: "Minecraft",                  hint: "puedes pasar horas sin hacer nada importante y está bien" },
        { word: "The Last of Us",             hint: "un hongo convierte a las personas en algo completamente diferente" },
        { word: "League of Legends",          hint: "puede destruir amistades sin el menor esfuerzo" },
        { word: "The Legend of Zelda",        hint: "siempre hay que encontrar la pieza que falta" },
        { word: "Among Us",                   hint: "la reunión de emergencia puede ser la peor decisión que tomes" },
        { word: "Red Dead Redemption",        hint: "al final importa más lo que fuiste que lo que eres" },
        { word: "Dark Souls",                 hint: "el mensaje en el suelo puede salvarte o mandarte a la muerte" },
        { word: "Fortnite",                   hint: "los bailes importan tanto como las armas" },
        { word: "God of War",                 hint: "matar a los dioses no te hace libre" },
        { word: "Portal",                     hint: "el pastel es mentira" },
        { word: "Skyrim",                     hint: "puedes ignorar la misión principal por cien horas y está bien" },
        { word: "GTA V",                      hint: "puedes ir al hospital, a la bolsa o a robar un banco el mismo día" },
        { word: "Undertale",                  hint: "puedes matar a todos o a nadie, y el juego lo va a recordar" },
        { word: "Stardew Valley",             hint: "te vas a dormir tarde aunque solo sea una granja virtual" },
        { word: "Hollow Knight",              hint: "hay más mundo debajo del mundo" }
    ],

    "Superhéroes": [
        { word: "Batman",           hint: "sus padres murieron en un callejón oscuro y todo empezó ahí" },
        { word: "Spider-Man",       hint: "un gran poder conlleva una gran responsabilidad" },
        { word: "Wonder Woman",     hint: "viene de una isla donde no había hombres" },
        { word: "Iron Man",         hint: "empezó siendo prisionero y salió con una armadura hecha de chatarra" },
        { word: "Thor",             hint: "perdió el acceso a su poder porque se volvió arrogante" },
        { word: "Wolverine",        hint: "no recuerda todo su pasado y eso lo define" },
        { word: "Doctor Strange",   hint: "arruinó sus manos antes de encontrar su verdadero poder" },
        { word: "Aquaman",          hint: "nadie lo tomaba en serio hasta que tuvieron que hacerlo" },
        { word: "Linterna Verde",   hint: "el límite es lo que puedes imaginar" },
        { word: "Magneto",          hint: "lo que lo convirtió en villano se lo hicieron cuando era niño" },
        { word: "Deadpool",         hint: "sabe perfectamente que es un personaje de ficción" },
        { word: "Flash",            hint: "morir y renacer del rayo lo cambió todo" },
        { word: "Capitán América",  hint: "se despertó décadas después de haberse dormido" },
        { word: "Black Panther",    hint: "el país que protege nadie sabe que existe" },
        { word: "Hawkeye",          hint: "el único cuyo superpoder fue la sordera" }
    ],

    "Famosos": [
        { word: "Elon Musk",          hint: "dice que va a hacer algo imposible y a veces lo cumple" },
        { word: "Beyoncé",            hint: "cuando prepara un álbum, nadie lo sabe hasta que ya salió" },
        { word: "Pablo Picasso",      hint: "pintaba las dos orejas aunque el personaje estuviera de perfil" },
        { word: "Albert Einstein",    hint: "sus mejores ideas las tuvo mientras soñaba despierto" },
        { word: "Shakira",            hint: "sus caderas nunca mienten" },
        { word: "Frida Kahlo",        hint: "pintaba su dolor pero lo hacía en colores muy vivos" },
        { word: "Cristiano Ronaldo",  hint: "tiene un museo dedicado exclusivamente a sus propios trofeos" },
        { word: "Lady Gaga",          hint: "se presentó ante el público dentro de un huevo gigante" },
        { word: "Steve Jobs",         hint: "presentó el futuro en jeans y cuello de tortuga" },
        { word: "Malala Yousafzai",   hint: "la bala no la detuvo" },
        { word: "Freddie Mercury",    hint: "llenó estadios con solo su voz y la respuesta del público" },
        { word: "Lionel Messi",       hint: "lloró cuando lo que más quería finalmente llegó" },
        { word: "Oprah Winfrey",      hint: "le regaló un auto a cada persona de su audiencia" },
        { word: "Salvador Dalí",      hint: "la inspiración le llegaba justo antes de quedarse dormido" },
        { word: "Cardi B",            hint: "su primera fama llegó por las redes antes que por la música" }
    ],

    "Paises": [
        { word: "Japón",          hint: "los trenes se disculpan cuando llegan dos minutos tarde" },
        { word: "Brasil",         hint: "el carnaval dura más de lo que nadie podría aguantar sobrio" },
        { word: "Islandia",       hint: "no tienen ejército pero sí la policía más simpática del mundo" },
        { word: "Egipto",         hint: "construyeron algo tan perfecto que todavía nadie sabe exactamente cómo" },
        { word: "India",          hint: "tiene más dioses que ciudades" },
        { word: "México",         hint: "celebran la muerte con más alegría que muchos celebran la vida" },
        { word: "Noruega",        hint: "el sol puede no ponerse durante semanas enteras" },
        { word: "Australia",      hint: "casi todo lo que vive ahí puede matarte" },
        { word: "Cuba",           hint: "los carros son de los años 50 y funcionan de milagro" },
        { word: "Corea del Sur",  hint: "el grupo de música más famoso del mundo no canta en inglés" },
        { word: "Marruecos",      hint: "el zoco puede confundirte y fascinarte al mismo tiempo" },
        { word: "Colombia",       hint: "durante años fue famosa por lo peor, ahora por el café" },
        { word: "Italia",         hint: "pelean por la receta original de cada plato pero cada región tiene la suya" },
        { word: "Turquía",        hint: "está en dos continentes distintos al mismo tiempo" },
        { word: "Nueva Zelanda",  hint: "los hobbits viven ahí, al menos en el cine" }
    ],

    "Abstracto": [
        { word: "Libertad",       hint: "es difícil de definir pero todos saben cuándo la pierden" },
        { word: "Tiempo",         hint: "lo único que no puedes comprar ni recuperar" },
        { word: "Verdad",         hint: "a veces duele más que la mentira" },
        { word: "Justicia",       hint: "la balanza siempre tiene dos lados" },
        { word: "Destino",        hint: "si lo crees, cambia la forma en que tomas decisiones" },
        { word: "Belleza",        hint: "depende completamente del ojo que la mira" },
        { word: "Silencio",       hint: "puede ser cómodo o insoportable según con quién estés" },
        { word: "Caos",           hint: "el origen de casi toda la creatividad" },
        { word: "Ilusión",        hint: "la mente puede convencerte de lo que no existe" },
        { word: "Karma",          hint: "tarde o temprano, dice la gente" },
        { word: "Conciencia",     hint: "la vocecita que no puedes silenciar del todo" },
        { word: "Infinito",       hint: "los matemáticos lo usan pero ninguno lo ha visto" },
        { word: "Paz",            hint: "todos la quieren pero muy pocos saben cómo conseguirla" },
        { word: "Poder",          hint: "corrompe de maneras que no siempre se notan al principio" },
        { word: "Miedo",          hint: "sin él no existiría el valor" }
    ]
};