/** Dolceyo: Bubble Pop Club — logo ufficiale, viola-lime, prodotto e scelta al centro. */
/**
 * Dolceyo — Bubble Pop Club. La sequenza scroll è un rituale di prodotto:
 * tre battute (base, crema, crunch) pinnate accanto al dessert che si compone.
 */
import { ArrowDownRight, ArrowUpRight, Clock3, Instagram, MapPin, Menu, Phone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Questi percorsi sono stringhe, non import: Vite non li riscrive con `base`.
 * Su GitHub Pages il sito vive in /dolceyo/, quindi vanno prefissati a mano
 * con BASE_URL, altrimenti finiscono tutti in 404.
 */
const asset = (filePath: string) => `${import.meta.env.BASE_URL}${filePath.replace(/^\/+/, "")}`;

const logo = asset("manus-storage/dolceyo-logo-official_bdba928c.png");
const waffle = asset("manus-storage/dolceyo-bubble-waffle_3e0fe978.jpg");
const tea = asset("manus-storage/dolceyo-bubble-tea_558c07ec.jpg");
const socialFresh = asset("manus-storage/dolceyo-social-fresh_a72bc3a4.jpg");
const socialCrunch = asset("manus-storage/dolceyo-social-crunch_e208917c.jpg");
const socialBubbles = asset("manus-storage/dolceyo-social-bubbles_6b4449dc.jpg");
const delivery = "https://deliveroo.it/it/menu/napoli/sarno/dolceyosarno";
const heroFrame = asset("manus-storage/frame-001_eee33047.webp");
const frameManifest = asset("manus-storage/dolceyo-transparent-scroll-manifest_d3b5e7a0.json");

/** Quanta parte dello scroll serve a completare la sequenza: il resto tiene fermo l'ultimo frame. */
const sequenceScrollShare = 0.88;
/** Quanto insegue lo scroll il frame reale: più basso = più morbido. */
const frameEasing = 0.14;
/** Immagini caricate per ondata, per non aprire centinaia di richieste insieme. */
const loadBatchSize = 24;
/**
 * Usa un fotogramma ogni N. Con l'interpolazione attiva la differenza non si vede,
 * ma il peso scaricato si divide per N. Metti 1 per usarli tutti.
 */
const frameStride = 2;
/**
 * Quanto rimpicciolire il prodotto su schermi stretti. I fotogrammi sono 16:9:
 * riempire un telefono verticale in "cover" ritaglia moltissimo e sembra troppo
 * ingrandito. 1 = come prima (riempie tutto), più basso = più lontano.
 */
const mobileZoom = 0.8;

const moods = [
  ["01", "1 · BASE", "Scegli lo yogurt", "Fresco, proteico o senza lattosio. La pausa parte esattamente da come la vuoi."],
  ["02", "2 · CREMA", "Aggiungi il tuo gusto", "Creme, frutta e combinazioni da scegliere senza perdere il piacere di cambiare idea."],
  ["03", "3 · CRUNCH", "Chiudi con il wow", "Waffle, bubble waffle e topping croccanti: la texture che rende il tuo mix davvero tuo."],
];

const sequenceStages = [
  { id: "01", label: "Base", title: "Parte da te.", copy: "Yogurt fresco, proteico o senza lattosio: la prima scelta è già personale." },
  { id: "02", label: "Crema", title: "Prende gusto.", copy: "Creme e frutta si aggiungono finché il mix non è esattamente il tuo." },
  { id: "03", label: "Crunch", title: "Fa il wow.", copy: "Waffle, granelle e topping croccanti: l'ultimo gesto è quello che si ricorda." },
];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function FrameSequenceHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLElement>(null);
  const imagesRef = useRef<Array<HTMLImageElement | undefined>>([]);
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);
  const drawnFrameRef = useRef(-1);
  const scrollProgressRef = useRef(0);
  const stageRef = useRef(0);
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [stage, setStage] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let rafId = 0;
    let looping = false;
    // Numero di fotogrammi effettivamente in uso: ricavato dal manifest, non fissato a mano.
    let total = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** Finché una immagine non è arrivata, mostra la più vicina già disponibile: mai un buco. */
    const getDrawableFrame = (requestedFrame: number) => {
      const frames = imagesRef.current;
      for (let frame = requestedFrame; frame >= 0; frame -= 1) if (frames[frame]?.naturalWidth) return frame;
      for (let frame = requestedFrame + 1; frame < frames.length; frame += 1) if (frames[frame]?.naturalWidth) return frame;
      return -1;
    };

    const draw = (requestedFrame: number) => {
      const canvas = canvasRef.current;
      if (!canvas || total === 0) return;
      const drawableFrame = getDrawableFrame(Math.max(0, Math.min(total - 1, requestedFrame)));
      const image = drawableFrame >= 0 ? imagesRef.current[drawableFrame] : undefined;
      const context = canvas.getContext("2d");
      if (!image?.naturalWidth || !context) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      // I frame hanno un fondale studio proprio (non sono ritagli trasparenti):
      // riempiono il palco a tutto schermo, spostati per lasciare respiro alla copy.
      const mobile = width < 860;
      const cover = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      // Su mobile si allontana un po': il fondo che resta scoperto è dello stesso
      // tono del fondale dei fotogrammi (--stage), quindi non si nota lo stacco.
      const scale = mobile ? cover * mobileZoom : cover;
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const centerX = mobile ? width * 0.5 : width * 0.58;
      const centerY = mobile ? height * 0.44 : height * 0.5;
      context.drawImage(image, centerX - drawWidth / 2, centerY - drawHeight / 2, drawWidth, drawHeight);
    };

    const readScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const totalScrollableDistance = Math.max(1, section.offsetHeight - window.innerHeight);
      const distanceScrolledInsideSection = window.scrollY - section.offsetTop;
      const progress = clamp01(distanceScrolledInsideSection / totalScrollableDistance);
      scrollProgressRef.current = progress;

      const frameProgress = Math.min(1, progress / sequenceScrollShare);
      targetFrameRef.current = frameProgress * Math.max(0, total - 1);

      const nextStage = frameProgress >= 0.66 ? 2 : frameProgress >= 0.33 ? 1 : 0;
      if (nextStage !== stageRef.current) {
        stageRef.current = nextStage;
        setStage(nextStage);
      }
    };

    /** Un solo loop rAF: lo scroll aggiorna solo un ref, il disegno interpola. Niente scatti. */
    const tick = () => {
      const target = targetFrameRef.current;
      const distance = target - currentFrameRef.current;
      currentFrameRef.current = Math.abs(distance) < 0.05 ? target : currentFrameRef.current + distance * frameEasing;

      const rounded = Math.round(currentFrameRef.current);
      if (rounded !== drawnFrameRef.current) {
        drawnFrameRef.current = rounded;
        draw(rounded);
      }
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${scrollProgressRef.current})`;
      rafId = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (looping || disposed) return;
      looping = true;
      rafId = requestAnimationFrame(tick);
    };
    const stopLoop = () => {
      looping = false;
      cancelAnimationFrame(rafId);
    };

    const handleScroll = () => readScroll();
    const handleResize = () => {
      drawnFrameRef.current = -1;
      readScroll();
      draw(Math.round(currentFrameRef.current));
    };

    // Scarica il resto della sequenza solo quando la sezione si avvicina davvero.
    let armed = false;
    let resumeLoading: (() => void) | undefined;

    // Il loop gira solo quando la sezione è a schermo: zero lavoro altrove.
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startLoop() : stopLoop()),
      { rootMargin: "20% 0px" },
    );
    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || armed) return;
        armed = true;
        resumeLoading?.();
      },
      { rootMargin: "150% 0px" },
    );

    const initialize = async () => {
      try {
        const response = await fetch(frameManifest);
        if (!response.ok) throw new Error("Manifest non disponibile");
        const rawManifest = (await response.json()) as string[];
        if (!Array.isArray(rawManifest) || rawManifest.length === 0) throw new Error("Sequenza vuota");
        if (disposed) return;
        // Il manifest elenca percorsi assoluti dalla radice: vanno riportati sotto BASE_URL.
        const manifest = rawManifest.map(asset);

        // Tiene un fotogramma ogni `frameStride`, ma l'ultimo va sempre incluso:
        // è il fotogramma finale della composizione e il fallback per movimento ridotto.
        const sources = manifest.filter((_, index) => index % frameStride === 0);
        const last = manifest[manifest.length - 1];
        if (sources[sources.length - 1] !== last) sources.push(last);
        total = sources.length;

        if (reduceMotion) {
          targetFrameRef.current = total - 1;
          currentFrameRef.current = total - 1;
        } else {
          window.addEventListener("scroll", handleScroll, { passive: true });
          window.addEventListener("resize", handleResize);
          readScroll();
          currentFrameRef.current = targetFrameRef.current;
          if (sectionRef.current) {
            visibilityObserver.observe(sectionRef.current);
            preloadObserver.observe(sectionRef.current);
          }
          startLoop();
        }

        let loadFailures = 0;
        let cursor = 0;
        const loadNextBatch = () => {
          if (disposed || cursor >= total) return;
          // Oltre la prima ondata si aspetta che la sezione sia in avvicinamento.
          if (cursor > 0 && !armed && !reduceMotion) {
            resumeLoading = loadNextBatch;
            return;
          }
          const end = Math.min(cursor + loadBatchSize, total);
          let pending = end - cursor;
          const settle = () => {
            pending -= 1;
            if (pending === 0) loadNextBatch();
          };
          for (let index = cursor; index < end; index += 1) {
            const image = new Image();
            image.decoding = "async";
            if (index < loadBatchSize) image.fetchPriority = "high";
            image.onload = () => {
              settle();
              if (disposed) return;
              imagesRef.current[index] = image;
              if (index === 0) setFirstFrameReady(true);
              // Se è il frame che stiamo mostrando (o un suo vicino), forza un ridisegno.
              if (Math.abs(index - drawnFrameRef.current) < 18 || index === total - 1) {
                drawnFrameRef.current = -1;
                if (reduceMotion) draw(total - 1);
              }
            };
            image.onerror = () => {
              settle();
              loadFailures += 1;
              if (!disposed && loadFailures === total) setFailed(true);
            };
            image.src = sources[index];
          }
          cursor = end;
        };
        loadNextBatch();
      } catch {
        if (!disposed) setFailed(true);
      }
    };

    initialize();
    return () => {
      disposed = true;
      stopLoop();
      visibilityObserver.disconnect();
      preloadObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <section ref={sectionRef} className="frame-sequence-section" aria-label="Composizione scroll del prodotto Dolceyo">
    <div className="frame-sequence-sticky">
      <canvas ref={canvasRef} className={`frame-sequence-canvas ${firstFrameReady ? "is-ready" : ""}`} aria-label="Yogurt Dolceyo che si compone durante lo scroll" />

      <div className="frame-sequence-copy">
        <p className="eyebrow"><span /> Il rituale Dolceyo</p>
        <div className="sequence-slides">
          {sequenceStages.map((item, index) => <div className={`sequence-slide ${index === stage ? "is-active" : ""}`} key={item.id} aria-hidden={index !== stage}>
            <h2>{item.title}</h2>
            <p className="lead">{item.copy}</p>
          </div>)}
        </div>
      </div>

      <ol className="sequence-steps" aria-label="Fasi della composizione">
        {sequenceStages.map((item, index) => <li key={item.id} data-active={index === stage}>
          <b>{item.id}</b><span>{item.label}</span>
        </li>)}
      </ol>

      <div className="sequence-progress" aria-hidden="true"><i ref={progressRef} /></div>
      <p className="sequence-hint"><span /> Scorri</p>

      {failed && <p className="sr-only" role="status">La sequenza non è disponibile. Ricarica la pagina.</p>}
    </div>
  </section>;
}

function LandingHero() {
  const heroRef = useRef<HTMLElement>(null);

  // Le animazioni infinite dell'hero si fermano quando esce dal viewport.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => hero.classList.toggle("is-idle", !entry.isIntersecting));
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return <section ref={heroRef} className="landing-hero" aria-label="Dolceyo: dessert da comporre">
    <div className="landing-hero-copy">
      <p className="eyebrow"><span /> Yogurteria & dessert bar · Sarno</p>
      <h1>La pausa dolce,<br /><em>a modo tuo.</em></h1>
      <p className="lead">Yogurt, waffle, crêpes e bubble tea. Parti dalla voglia che hai adesso e componi il tuo Dolceyo.</p>
      <div className="hero-actions"><a className="button button-primary" href="#menu">Scegli il tuo mood <ArrowDownRight size={18} /></a><a className="button button-ghost" href={delivery} target="_blank" rel="noreferrer">Ordina a casa <ArrowUpRight size={17} /></a></div>
      <div className="hero-meta"><span>Fresco ogni giorno</span><i /><span>Corso G. Amendola 95</span></div>
    </div>
    <div className="landing-hero-product">
      <img src={heroFrame} alt="Frozen yogurt Dolceyo" />
      <div className="hero-mini hero-mini-waffle"><img src={waffle} alt="Bubble waffle Dolceyo" /></div>
      <div className="hero-mini hero-mini-tea"><img src={tea} alt="Bubble tea Dolceyo" /></div>
    </div>
  </section>;
}

export default function Home() {
  const [open, setOpen] = useState(false);
  const [navigationVisible, setNavigationVisible] = useState(true);
  const close = () => setOpen(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    const updateNavigation = () => {
      const currentScrollY = window.scrollY;
      const difference = currentScrollY - lastScrollY;
      if (currentScrollY < 36) setNavigationVisible(true);
      else if (difference > 7) setNavigationVisible(false);
      else if (difference < -7) setNavigationVisible(true);
      lastScrollY = currentScrollY;
      ticking = false;
    };
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateNavigation);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sections.forEach((section) => section.classList.add("is-revealed"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8%" });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return <div className="site-shell">
    <a className="skip-link" href="#top">Vai al contenuto</a>
    <header className={`site-header ${navigationVisible ? "" : "site-header-hidden"}`}>
      <a className="brand-lockup" href="#top" onClick={close} aria-label="Dolceyo, torna all'inizio">
        <span className="logo-disc"><img src={logo} alt="Logo Dolceyo" /></span><span>Dolceyo</span>
      </a>
      <nav className="desktop-nav" aria-label="Navigazione principale">
        <a href="#format">Il format</a><a href="#menu">Il menu</a><a href="#dove">Dove siamo</a>
        <a className="nav-pill" href={delivery} target="_blank" rel="noreferrer">Ordina ora <ArrowUpRight size={15} /></a>
      </nav>
      <button className="mobile-menu-button" type="button" onClick={() => setOpen(!open)} aria-label="Apri il menu" aria-expanded={open}>{open ? <X size={24} /> : <Menu size={24} />}</button>
    </header>
    {open && <nav className="mobile-nav" aria-label="Navigazione mobile">
      <a href="#format" onClick={close}>Il format</a><a href="#menu" onClick={close}>Il menu</a><a href="#dove" onClick={close}>Dove siamo</a>
      <a href={delivery} target="_blank" rel="noreferrer" onClick={close}>Ordina su Deliveroo <ArrowUpRight size={18} /></a>
    </nav>}

    <main id="top">
      <LandingHero />
      <FrameSequenceHero />

      <section id="format" className="statement-section" data-reveal>
        <p className="statement-kicker">Dolceyo è una scelta personale</p><h2>Una base vera.<br />Poi <span>la fai tua.</span></h2>
        <div className="statement-footer"><p>Dolceyo parte dallo yogurt, ma il bello arriva dopo: crema, frutta, crunch e quel dettaglio che cambia tutto.</p><a href="#menu" className="text-link">Componila in 3 gesti <ArrowDownRight size={18} /></a></div>
      </section>

      <section id="menu" className="moods-section" data-reveal>
        <div className="section-intro"><p className="eyebrow eyebrow-dark"><span /> Il gesto Dolceyo</p><h2>Base, crema, crunch.<br /><em>Il dessert sei tu.</em></h2></div>
        <div className="mood-grid">{moods.map(([number, tag, title, copy], index) => <article className={`mood-card mood-card-${index + 1}`} key={title}>
          <div className="mood-number">{number}</div><div className="mood-card-content"><p className="mood-tag">{tag}</p><h3>{title}</h3><p>{copy}</p><a href={delivery} target="_blank" rel="noreferrer" aria-label={`Esplora ${title}`}><ArrowUpRight size={23} /></a></div>
        </article>)}</div>
        <p className="menu-note">Le proposte e le varianti possono cambiare: per disponibilità, ingredienti e allergeni chiedi sempre al banco.</p>
      </section>

      <section className="feature-section" data-reveal>
        <div className="feature-image-shell"><img src={waffle} alt="Bubble waffle con yogurt, fragole e pistacchio" /><div className="feature-chip">YO<br />CRUNCH</div></div>
        <div className="feature-copy"><p className="eyebrow eyebrow-dark"><span /> La parte croccante</p><h2>Waffle appena fatti.<br /><em>Topping senza timidezza.</em></h2><p>Crêpes, pancake, waffle e bubble waffle: scegli la forma, inventa l'interno e lascia che sia il crunch a fare il resto.</p><a className="button button-dark" href={delivery} target="_blank" rel="noreferrer">Guarda il menu <ArrowUpRight size={17} /></a></div>
      </section>

      <section className="ingredient-band"><div className="band-word">FRESH</div><span className="band-dot" /><div className="band-word band-word-outline">CREAMY</div><span className="band-dot" /><div className="band-word">CRUNCHY</div></section>

      <section className="bubbles-section" data-reveal>
        <div className="bubbles-copy"><p className="eyebrow eyebrow-light"><span /> Anche da bere</p><h2>Più di un<br /><em>bubble tea.</em></h2><p>Frutta, ghiaccio, perle e quella voglia di qualcosa di diverso mentre passeggi per Sarno.</p><a className="button button-lime" href="https://www.instagram.com/dolceyosarno/" target="_blank" rel="noreferrer">Seguici su Instagram <Instagram size={17} /></a></div>
        <div className="bubbles-image-shell"><img src={tea} alt="Bubble tea ai frutti di bosco con perle" /></div>
      </section>

      <section className="social-section" aria-label="Mockup campagna social Dolceyo" data-reveal>
        <div className="social-heading"><p className="eyebrow eyebrow-dark"><span /> La campagna prende forma</p><h2>Fresh. Crunch.<br /><em>Bubble mood.</em></h2><p>Tre format social costruiti attorno al logo ufficiale e ai prodotti-eroe di Dolceyo.</p></div>
        <div className="social-posts"><img src={socialFresh} alt="Mockup post Dolceyo YO Fresh" /><img src={socialCrunch} alt="Mockup post Dolceyo YO Crunch" /><img src={socialBubbles} alt="Mockup post Dolceyo Bubble Mood" /></div>
      </section>

      <section id="dove" className="location-section" data-reveal>
        <div className="location-title"><p className="eyebrow eyebrow-dark"><span /> Vieni a trovarci</p><h2>Una voglia improvvisa?<br /><em>Hai già l'indirizzo.</em></h2></div>
        <div className="location-panel"><div className="location-mark"><img src={logo} alt="" /></div>
          <div className="location-detail"><MapPin size={21} /><div><p>Corso Giovanni Amendola 95</p><span>84087 · Sarno (SA)</span></div></div>
          <div className="location-detail"><Clock3 size={21} /><div><p>Da pomeriggio a tardi</p><span>Controlla i canali per gli orari aggiornati</span></div></div>
          <div className="location-actions"><a href="https://www.google.com/maps/search/?api=1&query=Dolceyo%2C%20Corso%20Giovanni%20Amendola%2095%2C%20Sarno" target="_blank" rel="noreferrer">Apri la mappa <ArrowUpRight size={17} /></a><a href="tel:+3908119240892"><Phone size={17} /> Chiama Dolceyo</a></div>
        </div>
      </section>
    </main>

    <footer className="site-footer"><div className="footer-brand"><span className="footer-logo"><img src={logo} alt="Logo Dolceyo" /></span><span>Dolceyo</span></div><p>Yogurteria, waffle, crêpes e bubble tea a Sarno.</p><div className="footer-links"><a href="https://www.instagram.com/dolceyosarno/" target="_blank" rel="noreferrer">Instagram</a><a href="https://www.tiktok.com/@dolceyosarno" target="_blank" rel="noreferrer">TikTok</a><a href={delivery} target="_blank" rel="noreferrer">Deliveroo</a></div></footer>
  </div>;
}
