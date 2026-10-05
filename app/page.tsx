import Header from "@/components/Header";
import Reveal from "@/components/Reveal";
import CateringModal from "@/components/CateringModal";
import { EPICERIE_URL, MENU_URL, RESERVATION_URL } from "@/lib/links";

const MARQUEE = ["Brunch", "Dîner", "Souper", "Fait maison", "Traiteur", "Épicerie"];

const LOCATIONS = [
  { name: "Tsak Tsak Beaubien", address: "200, rue Beaubien Est", phone: "514-495-7812", tel: "+15144957812", hours: "8h30 – 16h" },
  { name: "Tsak Tsak Saint-Laurent", address: "5115, boulevard Saint-Laurent", phone: "514-272-3369", tel: "+15142723369", hours: "8h30 – 16h" },
];

const GALLERY = [
  "linear-gradient(135deg,#7a2a12,#e4572e)",
  "linear-gradient(135deg,#3b2a1e,#c2431e)",
  "linear-gradient(135deg,#7a2a12,#f0b44c)",
  "linear-gradient(135deg,#c2431e,#3b2a1e)",
  "linear-gradient(135deg,#e4572e,#7a2a12)",
];

const SALLES = [
  { n: "01", title: "Salle 1", where: "Tsak Tsak Beaubien", cap: "Capacité de 30 à 40 personnes" },
  { n: "02", title: "Salle 2", where: "Tsak Tsak Beaubien", cap: "Capacité de 60 personnes" },
  { n: "03", title: "Salle privée", where: "Tsak Tsak Saint-Laurent", cap: "Capacité de 60 personnes" },
];

export default function Home() {
  const marquee = [...MARQUEE, ...MARQUEE];

  return (
    <>
      <Header />

      <section className="hero" id="accueil">
        <div className="wrap">
          <span className="tag">Depuis 2009 · Montréal</span>
          <h1>Bienvenue chez <em>Tsak Tsak</em></h1>
          <p>Un restaurant familial au cœur de Montréal, où vous pouvez savourer des brunchs, des dîners et des soupers.</p>
          <div className="btns">
            <a className="btn" href={RESERVATION_URL} target="_blank" rel="noopener">RÉSERVER →</a>
            <a className="btn ghost" href={MENU_URL} target="_blank" rel="noopener">VOIR LE MENU</a>
          </div>
        </div>
        <div className="scroll"></div>
      </section>

      <div className="marquee">
        <div>
          {marquee.map((word, i) => (
            <span key={i}>{word}<b> ✦</b></span>
          ))}
        </div>
      </div>

      <section className="section" id="cuisine">
        <div className="wrap split">
          <Reveal>
            <span className="eyebrow">Notre cuisine</span>
            <h2>Un menu <em>entièrement fait maison</em></h2>
            <p>
              <strong>Des produits de qualité.</strong> Du brunch au souper, découvrez une cuisine généreuse et savoureuse préparée avec soin. Et si vous aimez certains de nos produits, vous pouvez même les retrouver dans notre épicerie.
            </p>
            <ul className="points"><li>Fait maison</li><li>Produits de qualité</li><li>Cuisine généreuse</li></ul>
            <a className="btn dark" href={EPICERIE_URL} target="_blank" rel="noopener">🛒 DÉCOUVRIR NOTRE ÉPICERIE</a>
          </Reveal>
          <Reveal
            className="photo"
            style={{ backgroundImage: "url('/images/cuisine.jpg'), linear-gradient(135deg,#e4572e,#7a2a12)" }}
          >
            <div className="badge"><small>Depuis</small>2009</div>
          </Reveal>
        </div>
      </section>

      <section className="section addr" id="adresses">
        <div className="wrap">
          <Reveal className="head">
            <span className="eyebrow">Nous trouver</span>
            <h2>Nos adresses &amp; <em>heures d’ouverture</em></h2>
            <p>Pour mieux vous servir, Tsak Tsak vous accueille à deux adresses au cœur de Montréal.</p>
          </Reveal>
          <div className="cards">
            {LOCATIONS.map((l) => (
              <Reveal key={l.name} className="loc">
                <h3>{l.name}</h3>
                <div className="row"><i>📍</i><div><small>Adresse</small>{l.address}</div></div>
                <div className="row"><i>📞</i><div><small>Téléphone</small><a href={`tel:${l.tel}`}>{l.phone}</a></div></div>
                <div className="row"><i>🕐</i><div><small>Heures d’ouverture</small>{l.hours}</div></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section traiteur" id="traiteur">
        <div className="wrap">
          <Reveal className="head">
            <span className="eyebrow">Service traiteur &amp; événements</span>
            <h2>Vos événements, <em>notre savoir-faire</em></h2>
            <p>Que ce soit pour un anniversaire, un baby shower, un mariage, un événement corporatif ou une réception privée, Tsak Tsak vous accompagne pour créer un événement à votre image.</p>
          </Reveal>

          <Reveal className="gallery">
            {GALLERY.map((bg, i) => (
              <div key={i} style={{ backgroundImage: `url('/images/traiteur${i + 1}.jpg'), ${bg}` }}>
                Photo traiteur {i + 1}
              </div>
            ))}
          </Reveal>

          <Reveal className="head" style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)" }}>3 salles privées</h2>
            <p>Disponibles en dehors de nos heures d&apos;ouverture.</p>
          </Reveal>
          <div className="salles">
            {SALLES.map((s) => (
              <Reveal key={s.n} className="salle">
                <div className="n">{s.n}</div>
                <h4>{s.title}</h4>
                <div className="where">{s.where}</div>
                <p>{s.cap}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="cta">
            <p>Nos espaces et notre service traiteur s’adaptent à vos besoins, pour toute occasion spéciale.</p>
            <CateringModal />
          </Reveal>
        </div>
      </section>

      <footer className="site-footer">
        <div className="wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="Tsak Tsak" />
          <div className="links">
            <a href="#cuisine">Cuisine</a><a href="#adresses">Adresses</a><a href="#traiteur">Traiteur</a>
            <a href={MENU_URL} target="_blank" rel="noopener">Menu</a>
            <a href="tel:+15144957812">514-495-7812</a><a href="tel:+15142723369">514-272-3369</a>
          </div>
          <small>© {new Date().getFullYear()} Tsak Tsak — Créateur de saveurs · Montréal</small>
        </div>
      </footer>
    </>
  );
}
