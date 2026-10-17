import { NextResponse, type NextRequest } from "next/server";

import { internalEnglishPath, routeFromPath, routes } from "@/lib/i18n";

/**
 * - www : redirigé vers le domaine sans www.
 * - Admin : désactivé par défaut (page introuvable) tant que ADMIN_ENABLED n’est pas true. Une fois
 *   activé, sans cookie de session on redirige vers la connexion (la vraie vérification de la
 *   session est faite dans chaque page et action).
 * - Site public : le français est servi sans préfixe et l’anglais sous /en avec des adresses
 *   traduites. Les pages vivent dans app/[lang]/… (dossiers en français) : on réécrit
 *   /a-propos → /fr/a-propos et /en/about → /en/a-propos, sans changer l’adresse affichée.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // www.tsaktsak.com → tsaktsak.com (une seule adresse par page, pour le référencement).
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "").split(":")[0];
  if (host.startsWith("www.")) {
    const apex = request.nextUrl.clone();
    apex.protocol = "https";
    apex.hostname = host.slice(4);
    apex.port = "";
    return NextResponse.redirect(apex, 308);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    // Admin masqué tant qu’il n’est pas mis en place : l’adresse donne une page introuvable.
    // Mettre ADMIN_ENABLED=true dans l’environnement pour l’activer.
    if (process.env.ADMIN_ENABLED !== "true") {
      const hidden = request.nextUrl.clone();
      hidden.pathname = "/fr/introuvable";
      const response = NextResponse.rewrite(hidden);
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
      return response;
    }

    const response =
      pathname !== "/admin/connexion" && !request.cookies.has("tt_admin")
        ? NextResponse.redirect(new URL("/admin/connexion", request.url))
        : NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  const url = request.nextUrl.clone();

  // /fr/… n’est pas une adresse publique : on renvoie vers l’adresse sans préfixe.
  if (pathname === "/fr" || pathname.startsWith("/fr/")) {
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const internal = internalEnglishPath(pathname);
    if (internal) {
      url.pathname = internal;
      return NextResponse.rewrite(url);
    }
    // Adresse française sous /en (ex. /en/a-propos) : on redirige vers l’adresse anglaise.
    const route = routeFromPath(pathname);
    if (route) {
      url.pathname = routes[route].en;
      return NextResponse.redirect(url, 308);
    }
    // Page inconnue : app/[lang]/[...rest] affiche la 404 en anglais.
    return NextResponse.next();
  }

  url.pathname = pathname === "/" ? "/fr" : `/fr${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    // Tout le reste sauf l’API, les photos, les fichiers internes de Next et les fichiers (icon.png…).
    "/((?!api/|media/|_next/|admin|.*\\..*).*)",
  ],
};
