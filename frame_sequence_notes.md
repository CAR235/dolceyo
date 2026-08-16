# Sequenza hero fornita dall’utente

I frame consegnati sono PNG 1280×720 con sfondo trasparente. I campioni verificati, `ezgif-frame-226.png` e `ezgif-frame-300.png`, mantengono lo stesso bicchiere centrato e la stessa inquadratura orizzontale; il prodotto è già completo con yogurt, fragole, salsa rossa, pistacchio e granola. Il checkerboard visualizzato è l’anteprima della trasparenza, non va incorporato nel sito.

La sequenza sarà caricata in ordine numerico e mostrata sullo scroll come una successione di frame reali. Il sito userà un singolo frame visibile per volta e il frame finale come fallback per movimento ridotto.

## Inventario completo

L’inventario automatico rileva 299 file effettivamente caricati: da `001` a `300` manca soltanto `143`, che è indicato come caricamento non riuscito nel messaggio dell’utente. Per evitare un salto della rotazione, la posizione `143` verrà temporaneamente popolata con una copia del frame `142`; potrà essere sostituita con il frame originale se verrà inviato in seguito.

## Correzione del checkerboard

I file ricevuti non contengono trasparenza reale: il checkerboard è rasterizzato con alpha piena. Il primo frame è stato elaborato con segmentazione del prodotto; il canale alpha risultante varia da `0` a `255`, quindi il bicchiere e lo yogurt possono essere sovrapposti al fondale panna della hero senza mostrare i quadrati grigi.
