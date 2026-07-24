# 🏆 Gala Porra Mundial 2026 — Plan de ruta

Documento vivo. Aquí vamos anotando decisiones, huecos por cerrar e ideas nuevas
según surjan. Formato: evento en Discord, tono "Balón de Oro pero de picoteo" —
solemne en la forma, coñero en el fondo.

---

## 0. Lo que ya sabemos con certeza (spoiler solo para ti, el organizador)

El torneo está cerrado, no quedan resultados pendientes. Esta es la clasificación
real que la web tiene "congelada" desde Octavos para el resto de participantes —
la gala es literalmente el evento de revelación que la propia web lleva meses
prometiendo en el banner de bloqueo.

| Pos | Participante | Puntos | Bonus grupos |
|---|---|---|---|
| 🥇 1º | **Fran** | 136 | +5 |
| 🥈 2º | **Yhon** | 130 | +3 |
| 🥉 3º | **Juan** | 109 | +5 |
| 4º | **Raúl** | 102 | +1 |
| 5º | **Miguel** | 94 | +4 |

Campeón real del Mundial: 🇪🇸 España 1–0 Argentina (gol en la prórroga).
3er/4º puesto real: 🇫🇷 Francia 4–6 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra (partidazo loco).

No hace falta volver a calcular nada de esto — si en algún momento quieres
recalcularlo o refrescarlo (por si tocáis algo de los JSON), el script que lo
generó está descrito en la sección 8.

---

## 1. Concepto y tono

- **Formato:** videollamada de Discord con los 5 participantes + un presentador
  externo (ajeno a la competición) que lee/dinamiza. Posibilidad de grabar para
  quien no pueda conectarse en directo.
- **Tono de referencia:** gala de premios de verdad (Balón de Oro / Goya) pero
  con el humor de siempre. Solemnidad de forma, coñeo de fondo — cuanto más
  serio suene el narrador anunciando una tontería, mejor funciona.
- **Ya tenéis un lenguaje visual establecido** (`assets/perdedores.jpg` y
  `assets/fran.jpg`): fotos reales de los participantes llevadas a escenas
  generadas por IA muy curradas (el "farolillo rojo" en un callejón de
  contenedores con un gato, el ganador con puro y anillo de oro en una fiesta de
  postín). Esa es la estética a explotar para las fotos-premio de esta gala:
  cuanto más específica la escena para cada premio, mejor.

---

## 2. Estructura de la noche (escaleta)

1. **Previa / alfombra roja** (mientras se conecta la gente): banter libre,
   "predicciones" en broma de quién gana qué, mini-entrevistas del presentador
   a cada uno según entra.
2. **Cold open**: narrador IA abre la gala en tono grandilocuente, repaso rápido
   del torneo (sustos, remontadas, la infame Curazao, etc.).
3. **Bloque de premios "de carácter"** (no dependen de la clasificación, se
   pueden intercalar libremente): Fair Play, Más llorón, Se olvidó de mandar
   resultados, Rey de las Palomitas, Peor pronóstico del torneo, Golazo del
   Mundial, Optimista / Cauto, etc.
4. **Bloque estadístico**: racha más larga, más exactos, bonus de grupos, más
   logros.
5. **Clasificación general**, revelada de abajo a arriba (5º → 3º), guardando
   **2º y 1º para el cierre** con toda la salsa dramática posible.
6. **Discurso del campeón + cierre + brindis.**

Regla de oro para el orden: que un mismo participante no encadene dos premios
seguidos (repartir el protagonismo a lo largo de la noche) salvo que sea a
propósito para un efecto cómico concreto.

Cada premio: **foto-IA del ganador revelándose en pantalla → narrador IA
anuncia con roast breve → 1 minuto de cámara para el discurso del premiado.**

---

## 3. Categorías de premios

### 3.1 Ya decididos por ti

| Premio | Ganador | Nota |
|---|---|---|
| 🏆 Campeón del Mundial(porra) | **Fran** | 136 pts, revelación final |
| 🪣 Farolillo rojo | **Miguel** | dato real, último clasificado |
| 🕊️ Fair Play (organizador) | **Miguel** | autoconcedido, con coña |
| 😢 Más llorón | **Raúl** | subjetivo, ya decidido |
| 📵 Se le olvidó mandar resultados | **Juan** | **encaja con los datos**: a Juan le faltaban de verdad R01 y FN sin rellenar en su porra |
| 🔥 Racha de aciertos más larga | **Yhon** | dato real: 9 partidos seguidos puntuando |
| 🏅 Más logros conseguidos | *(pendiente, ver 3.3)* | empate a 4 bandas, hay que decidir |

### 3.2 Sugerencias nuevas, con ganador ya calculado

| Premio | Ganador | Justificación |
|---|---|---|
| 🎯 Francotirador del torneo (más marcadores exactos) | **Fran** (15 exactos) | Ojo: ya es el campeón — puedes dárselo igual ("no solo ganó, encima acertó más que nadie") o cedérselo a Yhon (10) para repartir protagonismo |
| ⚽ Golazo del Mundial (mejor jugada individual — más puntos en un solo partido) | **Yhon** — 14 pts por clavar la Final 0-0 (el gol de España fue en la prórroga, no cuenta) | El mejor pronóstico de todo el torneo, aislado. Muy potente para contar en directo |
| 🍿 Rey de las Palomitas (apostar más veces al perdedor que ganó por goleada) | **Miguel** — 7 palomitas | Refuerza el arco cómico de Miguel como farolillo rojo con mala suerte |
| 💥 Peor pronóstico del torneo (mayor cague en un solo partido) | **Fran o Juan** (empatados: fallo de 7 goles en el 3er puesto Francia 4-6 Inglaterra) | Bonus narrativo: el propio campeón (Fran) también tiene el peor cague de la noche — "hasta los grandes la lían" |
| 🎈 El optimista / marcador exagerado (más goles de media pronosticados) | **Raúl** — 3.38 goles/partido de media | — |
| 🧘 El cauto / aguafiestas (menos goles de media pronosticados) | **Yhon** — 2.52 goles/partido de media | Contraste simpático con que también es el de la racha más larga |
| 🌍 Mejor lectura de un grupo (bonus de orden exacto de grupo) | **Fran y Juan**, empatados a +5 | Podría fundirse con el de Francotirador si veis que sobran categorías |
| 🥶 Racha negra / Heladera (más partidos seguidos sin puntuar) | Empate a 5 entre **Juan, Raúl y Miguel** | Necesita desempate — ver 3.3 |

### 3.3 Empates que hay que decidir tú

- **Más logros conseguidos**: Yhon, Juan, Raúl y Miguel están los 4 empatados a
  10/18 logros (Fran se queda en 9/18 — dato curioso en sí mismo: "el campeón
  es el que menos insignias tiene, pura eficacia"). Opciones:
  - Desempatar por el logro más raro/difícil conseguido por cada uno.
  - Convertirlo en un mini-segmento "vitrina de logros" mostrando a los 4 en
    vez de una sola persona.
  - Descartar la categoría y dejar el chiste de que Fran gane todo menos esta.
- **Racha negra más larga**: empate a 5 entre Juan, Raúl y Miguel. Se puede
  desempatar por en qué momento del torneo cayó la racha (cuanto más dolorosa
  la fecha, mejor chiste), o convertirlo también en premio compartido.

### 3.4 Ideas sin datos / requieren decisión editorial o voto en directo

- Premio al mejor discurso de la noche (se vota entre los presentes al final).
- Premio del presentador externo / invitado (su propio "MVP" de la noche, a su
  criterio, para que también tenga un momento protagonista).
- Premio a la mejor/peor camiseta, fondo de videollamada, etc. — relleno
  puramente visual/en directo si hace falta alargar.
- Balón de Oro / Bota de Oro "real" del Mundial (quién predijo mejor al máximo
  goleador o al MVP del torneo real) — **no está tracked en la web**, habría
  que mirar a mano si alguien hizo esa apuesta en algún sitio. Descartar si no
  hay dato.

---

## 4. Producción de contenido

### 4.1 Fotos-premio por IA
- Reutilizar el estilo ya validado (`assets/perdedores.jpg`, `assets/fran.jpg`):
  foto real del participante → escena generada a medida del premio.
- Ideas de escena por premio (para pedírselo a la IA generativa):
  - Campeón: point de partida ya tenéis (`fran.jpg`, puro + anillo) — quiztable
    ampliarlo a photo pódium con confeti.
  - Farolillo rojo: ya tenéis `perdedores.jpg`, se puede reutilizar tal cual o
    hacer una versión individual solo de Miguel.
  - Rey de las Palomitas: sofá de cine, cubo de palomitas gigante, el estadio
    ardiendo de fondo.
  - Golazo del Mundial (Yhon): cámara lenta estilo gol histórico, confeti,
    posado de celebración exagerado.
  - Heladera / racha negra: dentro de un congelador industrial, carámbanos.
  - Peor pronóstico: cara de pánico frente a una pizarra llena de números
    tachados.
  - Fair Play (Miguel): toga de juez / balanza, "el árbitro que no compró
    ningún partido a pesar de tener el pito".
- Necesitas una foto base decente de cada uno (Fran, Yhon, Juan, Raúl, Miguel)
  — comprobar que las tienes todas antes de ponerte a generar.

### 4.2 Vídeos
- Sizzle reel de apertura (cold open): puede ser solo motion graphics + voz en
  off, no necesitáis metraje real de los partidos.
- Un bumper corto por bloque (premios de carácter / estadísticos / ranking).
- Cortinilla de "y el ganador es..." reutilizable para todos los premios
  (plantilla única, cambia el nombre/foto).

### 4.3 Narrador IA
- Un único narrador con voz consistente durante toda la gala (elegir la voz
  antes de generar nada, para no mezclar timbres).
- Para cada premio necesitas dos textos: (a) el "nominados/contexto" en tono
  grandilocuente, (b) el reveal + roast breve del ganador.
- Cuando tengáis la lista de premios cerrada, te puedo ayudar a redactar cada
  guion de narrador uno a uno (mismo patrón que hemos seguido hoy: uno por
  interacción, o todos de golpe si lo prefieres).

### 4.4 Gráficos
- Lower third con nombre + premio al hablar cada uno.
- Marcador/trofeo genérico reutilizable.
- Tabla de clasificación animada para el bloque final (opcional pero con
  mucho efecto: ir revelando puestos con una barra que sube).

---

## 5. Logística de Discord

- Canal de voz dedicado a la gala (probar que soporta bien pantalla compartida
  + audio del narrador/vídeos sin cortes).
- Rol o marcador visual para el presentador externo.
- Alguien (¿tú?) controlando la reproducción de vídeos/audios y el avance de
  la escaleta — considera tenerlo todo en una carpeta numerada en orden de
  reproducción.
- Cronómetro visible para el minuto de discurso de cada premiado (puede ser tan
  simple como un bot de Discord o compartir pantalla con un temporizador).
- Si alguien no puede conectarse en directo: grabar su hueco de discurso antes
  y reproducirlo en su momento, o dejarle mandar un audio/vídeo corto.
- Grabar la sesión completa (para el recuerdo / para quien no pueda asistir en
  directo).

---

## 6. Checklist de preparación

- [ ] Cerrar la lista definitiva de premios (secciones 3.1–3.4)
- [ ] Resolver los dos empates de la sección 3.3
- [ ] Fijar fecha y hora de la gala (avisar a todos con antelación por si
      alguno está fuera y tiene que cuadrar zona horaria)
- [ ] Confirmar quién es el presentador externo y pasarle un guion/chuleta
- [ ] Reunir foto base de cada participante para las imágenes IA
- [ ] Generar las fotos-premio
- [ ] Elegir voz del narrador IA y generar los audios/vídeos
- [ ] Montar la escaleta final con timings y orden de reproducción de archivos
- [ ] Prueba técnica de Discord (audio, pantalla compartida, cronómetro)
- [ ] Preparar la chuleta del presentador (premio → ganador → roast → pie para
      dar paso al discurso)

---

## 7. Ideas / backlog (ir añadiendo aquí sin miedo)

- Mini-segmento "vitrina de logros" mostrando insignias conseguidas por todos,
  no solo del ganador de esa categoría (encaja bien con el empate a 4 de la
  sección 3.3).
- Contar la anécdota de Yhon (FN 0-0, gol de España en la prórroga que no
  contaba) como parte del reveal del Golazo del Mundial — es un notición que
  se cuenta solo.
- Chiste recurrente sobre Curazao ("¿Dónde coño está Curazao?", ya está en el
  código de la web) como muletilla de transición entre bloques.
- Cerrar con un F5 en directo a la web ya "desbloqueada" para que todos vean
  su gráfica de evolución completa por primera vez.

---

## 8. Apéndice técnico — cómo se sacaron estos datos

Los números de este documento salen de ejecutar la lógica real de la web
(`js/fixture.js`, `js/api.js`, `js/scoring.js`, `js/achievements.js`) contra los
resultados reales de ESPN y los `participants/*.json`, en vez de a mano — así
coinciden exactamente con lo que la web mostrará al desbloquearse. Si cambiáis
algún JSON de predicciones antes de la gala, dímelo y vuelvo a recalcular todo
esto en un momento.
