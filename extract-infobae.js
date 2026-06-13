// ============================================================
//  SCRIPT DE EXTRACCIÓN DE PREDICCIONES - INFOBAE SIMULATOR
// ============================================================
//
//  INSTRUCCIONES:
//  1. Abre tu enlace de predicciones en el navegador, ej:
//     https://www.infobae.com/mundial-2026/simulador/?predict=TU-UUID
//  2. Espera a que cargue completamente el simulador
//  3. Abre las DevTools (F12) → pestaña "Consola"
//  4. Pega TODO este script y pulsa Enter
//  5. Copia el JSON que aparece
//  6. Pega el contenido en participants/tunombre.json
// ============================================================

(function extractInfobaePredictions() {
  // Fixture map: matches infobae match keys to our IDs
  // This maps match fixture order to our match IDs M01-M72
  const INFOBAE_TO_ID = {
    // Group A
    'Mexico-SouthAfrica': 'M01', 'SouthKorea-Czechia': 'M02',
    'Czechia-SouthAfrica': 'M03', 'Mexico-SouthKorea': 'M04',
    'Czechia-Mexico': 'M05', 'SouthAfrica-SouthKorea': 'M06',
    // ... (will be resolved by order)
  };

  const predictions = {};

  // Strategy 1: try __NEXT_DATA__
  try {
    const nextData = document.getElementById('__NEXT_DATA__');
    if (nextData) {
      const data = JSON.parse(nextData.textContent);
      console.log('[Infobae Extractor] __NEXT_DATA__ encontrado:', data);
    }
  } catch(e) {}

  // Strategy 2: traverse React fiber tree to find simulator state
  function findReactFiber(el) {
    const key = Object.keys(el).find(k =>
      k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance')
    );
    return key ? el[key] : null;
  }

  function searchFiberForPredictions(fiber, depth = 0) {
    if (!fiber || depth > 50) return null;
    const state = fiber.memoizedState;
    if (state) {
      // Look for arrays that look like match predictions
      let s = state;
      while (s) {
        if (s.memoizedState && Array.isArray(s.memoizedState)) {
          const arr = s.memoizedState;
          if (arr.length >= 10 && arr[0] && typeof arr[0] === 'object') {
            const sample = arr[0];
            if ('homeScore' in sample || 'home' in sample || 'localScore' in sample ||
                'homeGoals' in sample || 'score' in sample) {
              return arr;
            }
          }
        }
        s = s.next;
      }
    }
    // Check child and sibling
    return searchFiberForPredictions(fiber.child, depth + 1)
        || searchFiberForPredictions(fiber.sibling, depth + 1);
  }

  // Strategy 3: read score inputs from DOM
  function extractFromDOM() {
    const results = {};

    // Look for score input fields (common patterns in simulators)
    const inputs = document.querySelectorAll('input[type="number"], input[class*="score"], input[class*="gol"], input[class*="result"]');
    console.log('[Infobae Extractor] Inputs de puntuación encontrados:', inputs.length);

    // Look for elements with data attributes
    const matchEls = document.querySelectorAll('[data-match-id], [data-game-id], [data-fixture-id]');
    console.log('[Infobae Extractor] Elementos de partido encontrados:', matchEls.length);

    // Print all elements that look like score boxes
    const allText = document.body.innerText;
    console.log('[Infobae Extractor] Primeros 2000 chars del DOM:', allText.slice(0, 2000));

    return results;
  }

  // Try React fiber on the main simulator container
  const container = document.querySelector('#__next, [class*="simulator"], [class*="simulador"], main, #app');
  if (container) {
    const fiber = findReactFiber(container);
    if (fiber) {
      const found = searchFiberForPredictions(fiber);
      if (found) {
        console.log('[Infobae Extractor] ¡Datos encontrados en React fiber!', found);
        console.log(JSON.stringify(found, null, 2));
        return;
      }
    }
  }

  // Fallback: DOM extraction + manual instructions
  extractFromDOM();

  console.log(`
╔════════════════════════════════════════════╗
║  EXTRACTOR MANUAL - Porra Mundial 2026     ║
╚════════════════════════════════════════════╝

No se encontraron datos automáticamente.
Por favor, inspecciona la pestaña "Network" en DevTools:
  1. Recarga la página con DevTools abierto
  2. Filtra por "Fetch/XHR"
  3. Busca una petición que devuelva tus predicciones
  4. Copia la URL de esa petición y compártela

O bien, busca en la pestaña "Application" → "Local Storage" o "Session Storage"
si el simulador guarda el estado ahí.
  `);
})();
