# Verifica hero scroll-triggered — 15 agosto 2026

- **Desktop 1280×720:** il frame iniziale viene caricato e disegnato correttamente; il frozen yogurt rimane il soggetto dominante e centrato.
- **Gerarchia:** copy a sinistra, indicatore di stato in alto a destra e rituale Base–Crema–Crunch in basso a destra risultano leggibili senza coprire il prodotto.
- **Ritmo:** la sezione è stata ridotta a 280vh desktop per evitare la precedente pausa verticale e il rituale è visibile fin dal primo frame.
- **Mobile 390×844:** il titolo, le CTA e il frozen yogurt restano visibili; gli elementi di servizio laterali vengono nascosti per non sovrapporsi al prodotto.
- **Esito:** TypeScript e build di produzione completano senza errori.

## Correzione: animazione pura

La hero desktop ora mostra soltanto il frozen yogurt centrato e la sequenza è libera da headline, CTA, step, indicatori e decorazioni. Il mapping non applica più inerzia: ogni evento di scroll calcola direttamente il frame corrispondente e ne richiede il rendering nel frame di repaint successivo.

Su mobile il prodotto è stato ricentrato verticalmente dopo la rimozione del copy: l’anteprima mostra il bicchiere intero nella scena, senza elementi sovrapposti.

## Ottimizzazione visiva

La scena mantiene il frozen yogurt come unico soggetto. La scala cresce leggermente durante la composizione, con una risalita minima e una luce ambientale che si intensifica progressivamente senza ricoprire o distrarre dal prodotto.

## Struttura corretta

La landing ora apre con una hero editoriale completa, contenente messaggio e azioni. Su desktop l’immagine mantiene tutto il prodotto nel riquadro, mentre su mobile titolo, CTA e prodotto restano leggibili nella stessa progressione. La sequenza scroll è stata spostata subito dopo come sezione autonoma.

La verifica mobile a pagina intera conferma una transizione diretta dalla hero alla sequenza autonoma: il frame è più grande, il prodotto rimane leggibile e la durata ridotta della sezione evita il tratto vuoto percepito nella versione precedente.

Anche su desktop la hero editoriale e la sequenza autonoma risultano chiaramente distinte: il prodotto è intero nei due momenti e non ci sono sovrapposizioni testuali dentro l’animazione.

## Navigazione durante lo scroll

La barra mantiene un layout leggibile nello stato iniziale sia su desktop sia su mobile. Durante lo scroll verso il basso viene traslata fuori dal viewport; un movimento verso l’alto o il ritorno vicino all’inizio la riporta in vista.

## Sequenza ricalibrata

Il prodotto è stato ridotto per preservare l’inquadratura e dare respiro alla composizione. Il percorso esteso assegna la progressione ai 300 frame lungo gran parte della sezione e mantiene il frame finale in vista prima dell’uscita dalla scena.

## Frame trasparenti

Il set rielaborato contiene 300 frame WebP con canale alfa. Il controllo su inizio, metà e finale conferma che bicchiere, fragole, salsa e crunch restano integri e che il fondale è stato rimosso; la sequenza pesa circa 10 MB complessivi.

## Palette del locale

La hero ora unisce il viola delle pareti del locale al lime acceso delle superfici e dell’insegna, con panna come colore di contrasto del prodotto. Le verifiche desktop e mobile confermano che il bicchiere scontornato è leggibile e la gerarchia tipografica mantiene contrasto sufficiente.

L’ultimo passaggio ha esteso il viola del logo anche ad accenti e CTA globali, così il sistema usa soltanto viola, lime e panna come colori dominanti.

## Sequenza su fondale chiaro

La sezione scroll usa ora un fondale bianco/panna con richiami molto lievi di lime e viola: il bicchiere isolato può quindi restare il solo soggetto della scena, senza confondersi con il precedente sfondo scuro.

## Ritmo della hero

Bubble waffle e bubble tea sono ora inseriti come piccole immagini circolari attorno allo yogurt. Su desktop creano una composizione più ricca, mentre su mobile si dispongono nella parte bassa senza sovrapporsi a titolo, copy o CTA.
