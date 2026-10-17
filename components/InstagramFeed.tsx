import Image from "next/image";

import food1 from "@/assets/images/food1.webp";
import food2 from "@/assets/images/food2.webp";
import food3 from "@/assets/images/food3.webp";
import food5 from "@/assets/images/food5.webp";
import instaOne from "@/assets/images/insta-1.webp";
import instaThree from "@/assets/images/insta-3.webp";
import instaTwo from "@/assets/images/insta-2.webp";
import instaReel from "@/assets/images/insta-reel.webp";
import resto from "@/assets/images/resto1.webp";
import SocialLinks, { FacebookIcon, InstagramIcon } from "@/components/SocialLinks";
import { Logo } from "@/components/ui";
import { FACEBOOK_URL } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import { INSTAGRAM_HANDLE, INSTAGRAM_POSTS, INSTAGRAM_URL } from "@/lib/instagram";

// Photos des publications Instagram (lien vers la publication) et photos du site (lien vers le compte).
const tiles = [
  { src: instaReel, href: INSTAGRAM_POSTS.reel },
  { src: food1, href: INSTAGRAM_URL },
  { src: instaOne, href: INSTAGRAM_POSTS.one },
  { src: resto, href: INSTAGRAM_URL },
  { src: instaTwo, href: INSTAGRAM_POSTS.two },
  { src: food3, href: INSTAGRAM_URL },
  { src: instaThree, href: INSTAGRAM_POSTS.three },
  { src: food2, href: INSTAGRAM_URL },
  { src: food5, href: INSTAGRAM_URL },
];

/** Section réseaux sociaux : grille 3 × 3 façon Instagram, liens Instagram et Facebook. */
export default function InstagramFeed({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).home.instagram;

  return (
    <section className="instagram section" aria-labelledby="instagram-title">
      <p className="eyebrow">{t.eyebrow}</p>
      <div className="instagram__profile">
        <span className="instagram__avatar">
          <Logo />
        </span>
        <div>
          <h2 id="instagram-title">@{INSTAGRAM_HANDLE}</h2>
          <p>{t.tagline}</p>
        </div>
        <div className="instagram__buttons">
          <a className="button button--dark" href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
            <InstagramIcon /> {t.follow}
          </a>
          <a className="button button--ghost" href={FACEBOOK_URL} target="_blank" rel="noreferrer">
            <FacebookIcon /> {t.followFacebook}
          </a>
        </div>
      </div>
      <ul className="instagram__grid">
        {tiles.map((tile, index) => (
          <li key={index}>
            <a href={tile.href} target="_blank" rel="noreferrer" aria-label={t.openPost}>
              <Image src={tile.src} alt="" sizes="(max-width: 760px) 33vw, 320px" placeholder="blur" />
            </a>
          </li>
        ))}
      </ul>
      <div className="instagram__also">
        <span>{t.alsoOn}</span>
        <SocialLinks />
      </div>
    </section>
  );
}
