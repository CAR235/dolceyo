# Verifica pre-consegna

Il 15 agosto 2026 la landing è stata controllata a 1280×720 e a 375×812. La gerarchia desktop e mobile conserva il logo ufficiale in header, location e footer; i contenuti restano leggibili; la navigazione mobile è disponibile tramite menu; i link esterni conducono a Deliveroo, Instagram, TikTok, telefono e mappa.

Il build TypeScript e Vite è stato completato senza errori. Il build segnala soltanto un avviso non bloccante sulla dimensione del bundle generato; non impedisce il funzionamento della landing.

## Scena di composizione

La scena sticky è stata aperta in browser dopo l’implementazione. La pagina riconosce correttamente il contenuto e il trigger di scroll; la sezione mantiene il suo layout mentre il valore di composizione viene aggiornato in base alla posizione verticale. Il comportamento a movimento ridotto mostra lo stato completo senza dipendere dallo scroll.

Durante la prima navigazione il valore di composizione risultava correttamente aggiornato, ma il wrapper con clipping impediva alla scena sticky di restare ferma lungo tutto il tratto. Il clipping è stato rimosso dal wrapper della sezione; la maschera rimane confinata al solo contenitore visuale, così il widget può ora restare fissato nel viewport e completarsi in sequenza.

Un secondo controllo ha individuato un clipping anche nel wrapper globale della pagina. È stato sostituito da un limite di larghezza con clip orizzontale sul `body`, preservando il comportamento sticky verticale senza introdurre overflow laterale.

La verifica finale nel browser conferma ora che, con la sezione già in corso, il contenitore sticky ha coordinata superiore pari a zero e l’illustrazione è centrata nel viewport. Il widget resta pertanto visibile mentre il valore di composizione continua a evolvere.

Nel tratto conclusivo il valore di composizione raggiunge `1.000`: frutta, salsa e crunch risultano tutti visibili. La scena usa il frame iniziale dello yogurt come base e costruisce il frame finale con livelli visuali controllati dallo scroll; è quindi reversibile verso l’alto e non è una GIF autonoma che ignora il comportamento del visitatore.

## Hero Canvas con rotazione 3D

La hero ora mostra un loader centrato che riporta la percentuale effettiva del preload dei 300 frame. Una volta completato il caricamento, il canvas appare sul fondale panna senza checkerboard visibile; il prodotto rimane in rapporto `contain`, centrato e sovrapponibile ai contenuti della hero.

La verifica della landing integrata mostra il frame scontornato sul fondale panna dopo il preload. La prima posizione del file HTML autonomo veniva intercettata dal fallback della SPA; il file è stato quindi reso pubblico come `/rotation-sequence.html` per un accesso diretto.

La verifica mobile del file HTML autonomo conferma che la sequenza è visibile e centrata. Nella landing integrata il prodotto interferiva con le CTA al primo frame, quindi il centro di disegno del canvas è stato spostato più in basso esclusivamente per viewport stretti.

Il type-check e il build Vite sono stati completati con esito positivo dopo la hero Canvas. Il file autonomo `/rotation-sequence.html` risponde correttamente; il manifest dei frame risponde con redirect allo storage del progetto, previsto per gli asset persistenti. La verifica mobile finale mostra il prodotto separato da headline e CTA.
