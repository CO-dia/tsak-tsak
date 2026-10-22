"use client";

import Image from "next/image";
import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  startCheckout,
  type CheckoutFormState,
} from "@/app/[lang]/panier/actions";
import AddressAutocomplete, {
  type AddressFields,
} from "@/components/shop/AddressAutocomplete";
import { cart, useCartLines } from "@/components/shop/cart-store";
import { getDictionary } from "@/lib/dictionaries";
import { href, type Locale } from "@/lib/i18n";
import { estimateTaxes, formatMoney } from "@/lib/money";

export type CheckoutProduct = {
  id: string;
  name: string;
  format: string;
  priceCents: number;
  imageUrl: string | null;
  stock: number | null;
  isTaxable: boolean;
};

export type CheckoutSettings = {
  shopOpen: boolean;
  closedMessage: string;
  pickupEnabled: boolean;
  pickupInstructions: string;
  deliveryEnabled: boolean;
  deliveryFeeCents: number;
  deliveryInstructions: string;
  taxesEnabled: boolean;
};

const initialState: CheckoutFormState = {};

const emptyAddress: AddressFields = {
  line1: "",
  line2: "",
  city: "Montréal",
  province: "QC",
  postalCode: "",
  placeId: "",
  lat: "",
  lng: "",
};

type FieldProblem = { field: string; message: string };

function FieldError({ message }: { message: string | null }) {
  return message ? <small className="field-error">{message}</small> : null;
}

export default function CartCheckout({
  lang,
  products,
  settings,
  pickupLocations,
  mapsApiKey,
  paymentCancelled,
}: {
  lang: Locale;
  products: CheckoutProduct[];
  settings: CheckoutSettings;
  pickupLocations: string[];
  mapsApiKey: string | null;
  paymentCancelled: boolean;
}) {
  const t = getDictionary(lang).cart;
  const money = (cents: number) => formatMoney(cents, lang);
  const lines = useCartLines();
  const [state, formAction, pending] = useActionState(
    startCheckout,
    initialState,
  );
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">(
    settings.pickupEnabled || !settings.deliveryEnabled ? "pickup" : "delivery",
  );
  const [pickupLocation, setPickupLocation] = useState(
    pickupLocations[0] ?? "",
  );
  const [address, setAddress] = useState<AddressFields>(emptyAddress);
  const [clientErrors, setClientErrors] = useState<FieldProblem[]>([]);
  // Une nouvelle réponse du serveur remplace l’erreur locale.
  const [seenState, setSeenState] = useState(state);
  if (seenState !== state) {
    setSeenState(state);
    setClientErrors([]);
  }
  // Erreur renvoyée par le serveur : on amène l’encadré à l’écran (les erreurs locales amènent le champ).
  useEffect(() => {
    if (state.error) {
      document
        .querySelector(".event-form__error--box")
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [state]);
  const errors: FieldProblem[] =
    clientErrors.length > 0
      ? clientErrors
      : state.error
        ? [{ field: state.field ?? "", message: state.error }]
        : [];
  const fieldError = (name: string) =>
    errors.find((problem) => problem.field === name)?.message ?? null;

  const rows = lines.map((line) => {
    const product = products.find(
      (candidate) => candidate.id === line.productId,
    );
    const maxQuantity = product?.stock ?? 50;
    return {
      line,
      product,
      unavailable: !product || product.stock === 0,
      tooMany: Boolean(
        product && product.stock !== null && line.quantity > product.stock,
      ),
      maxQuantity,
    };
  });
  const payable = rows.filter((row) => row.product && !row.unavailable);
  const subtotal = payable.reduce(
    (sum, row) =>
      sum +
      row.product!.priceCents * Math.min(row.line.quantity, row.maxQuantity),
    0,
  );
  const deliveryFee =
    fulfillment === "delivery" ? settings.deliveryFeeCents : 0;
  const taxableBase = settings.taxesEnabled
    ? payable
        .filter((row) => row.product!.isTaxable)
        .reduce(
          (sum, row) =>
            sum +
            row.product!.priceCents *
              Math.min(row.line.quantity, row.maxQuantity),
          0,
        ) + deliveryFee
    : 0;
  const taxes = settings.taxesEnabled ? estimateTaxes(taxableBase).total : 0;
  const total = subtotal + deliveryFee + taxes;
  const blocked = rows.some((row) => row.unavailable || row.tooMany);

  /** Mêmes règles que le serveur, avec des messages dans la langue du site : toutes les erreurs d’un coup. */
  function validate(formData: FormData): FieldProblem[] {
    const value = (name: string) => String(formData.get(name) ?? "").trim();
    const problems: FieldProblem[] = [];
    if (value("name").length < 2)
      problems.push({ field: "name", message: t.errName });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value("email")))
      problems.push({ field: "email", message: t.errEmail });
    if (value("phone").replace(/\D/g, "").length < 10)
      problems.push({ field: "phone", message: t.errPhone });
    if (fulfillment === "delivery") {
      if (value("line1").length < 4)
        problems.push({ field: "line1", message: t.errAddress });
      if (value("city").length < 2)
        problems.push({ field: "city", message: t.errCity });
      if (
        !/^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$/i.test(
          value("postalCode"),
        )
      )
        problems.push({ field: "postalCode", message: t.errPostalCode });
    }
    return problems;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const problems = validate(formData);
    if (problems.length > 0) {
      setClientErrors(problems);
      event.currentTarget
        .querySelector<HTMLElement>(`[name="${problems[0].field}"]`)
        ?.focus();
      return;
    }
    setClientErrors([]);
    formData.set(
      "cart",
      JSON.stringify(
        payable.map((row) => ({
          productId: row.line.productId,
          quantity: row.line.quantity,
        })),
      ),
    );
    // Appel manuel : le formulaire n’est pas réinitialisé si une erreur est retournée.
    startTransition(() => formAction(formData));
  }

  if (lines.length === 0) {
    return (
      <div className="cart-empty">
        {paymentCancelled && (
          <p className="cart-alert" role="status">
            {t.cancelledEmpty}
          </p>
        )}
        <h2>{t.emptyTitle}</h2>
        <p>{t.emptyText}</p>
        <Link className="button button--dark" href={href(lang, "shop")}>
          {t.seeShop} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="checkout__cart">
        {paymentCancelled && (
          <p className="cart-alert" role="status">
            {t.cancelled}
          </p>
        )}
        <div className="checkout__heading">
          <p className="eyebrow">{t.selection}</p>
          <Link className="text-link-inline" href={href(lang, "shop")}>
            {t.continue}
          </Link>
        </div>
        <ul className="cart-lines">
          {rows.map(({ line, product, unavailable, tooMany, maxQuantity }) => {
            const name = product?.name ?? line.name;
            const image = product?.imageUrl ?? line.imageUrl;
            return (
              <li
                className={`cart-line ${unavailable ? "cart-line--unavailable" : ""}`}
                key={line.productId}
              >
                <div className="cart-line__image">
                  {image ? (
                    <Image
                      src={image}
                      alt=""
                      width={160}
                      height={200}
                      unoptimized
                    />
                  ) : null}
                </div>
                <div className="cart-line__body">
                  <h3>{name}</h3>
                  <p className="cart-line__meta">
                    {product
                      ? money(product.priceCents)
                      : money(line.priceCents)}
                    {(product?.format ?? line.format)
                      ? ` · ${product?.format ?? line.format}`
                      : ""}
                  </p>
                  {unavailable && (
                    <p className="cart-line__warning">{t.unavailableItem}</p>
                  )}
                  {tooMany && (
                    <p className="cart-line__warning">
                      {t.onlyLeft(product?.stock ?? 0)}
                    </p>
                  )}
                  <div className="cart-line__actions">
                    {!unavailable && (
                      <div
                        className="quantity"
                        aria-label={t.quantityFor(name)}
                      >
                        <button
                          type="button"
                          aria-label={t.decrease}
                          onClick={() =>
                            cart.setQuantity(line.productId, line.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span aria-live="polite">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label={t.increase}
                          disabled={line.quantity >= maxQuantity}
                          onClick={() =>
                            cart.setQuantity(line.productId, line.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      className="cart-line__remove"
                      onClick={() => cart.remove(line.productId)}
                    >
                      {t.remove}
                    </button>
                  </div>
                </div>
                <strong className="cart-line__total">
                  {product && !unavailable
                    ? money(product.priceCents * line.quantity)
                    : "—"}
                </strong>
              </li>
            );
          })}
        </ul>
        <dl className="cart-summary">
          <div>
            <dt>{t.subtotal}</dt>
            <dd>{money(subtotal)}</dd>
          </div>
          {fulfillment === "delivery" && (
            <div>
              <dt>{t.delivery}</dt>
              <dd>{deliveryFee > 0 ? money(deliveryFee) : t.free}</dd>
            </div>
          )}
          {settings.taxesEnabled && (
            <div>
              <dt>{t.taxes}</dt>
              <dd>{money(taxes)}</dd>
            </div>
          )}
          <div className="cart-summary__total">
            <dt>{t.total}</dt>
            <dd>{money(total)}</dd>
          </div>
        </dl>
      </div>

      <form
        className="checkout__form event-form"
        action={formAction}
        onSubmit={submit}
        noValidate
      >
        <input type="hidden" name="lang" value={lang} />
        <p className="eyebrow event-form__wide">{t.yourDetails}</p>
        <label className="event-form__wide">
          <span>{t.name}</span>
          <input
            name="name"
            type="text"
            placeholder={t.namePlaceholder}
            autoComplete="name"
            required
          />
          <FieldError message={fieldError("name")} />
        </label>
        <label>
          <span>{t.email}</span>
          <input
            name="email"
            type="email"
            placeholder={t.emailPlaceholder}
            autoComplete="email"
            required
          />
          <FieldError message={fieldError("email")} />
        </label>
        <label>
          <span>{t.phone}</span>
          <input
            name="phone"
            type="tel"
            placeholder="514 000-0000"
            autoComplete="tel"
            required
          />
          <FieldError message={fieldError("phone")} />
        </label>

        <fieldset className="choice event-form__wide">
          <legend>{t.fulfillment}</legend>
          <div className="choice__options">
            {settings.pickupEnabled && (
              <label
                className={`choice__option ${fulfillment === "pickup" ? "is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  value="pickup"
                  checked={fulfillment === "pickup"}
                  onChange={() => setFulfillment("pickup")}
                />
                <strong>{t.pickup}</strong>
                <span>{t.pickupHint}</span>
              </label>
            )}
            {settings.deliveryEnabled && (
              <label
                className={`choice__option ${fulfillment === "delivery" ? "is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  value="delivery"
                  checked={fulfillment === "delivery"}
                  onChange={() => setFulfillment("delivery")}
                />
                <strong>{t.delivery}</strong>
                <span>
                  {settings.deliveryFeeCents > 0
                    ? t.deliveryHintFee(money(settings.deliveryFeeCents))
                    : t.deliveryHintFree}
                </span>
              </label>
            )}
          </div>
        </fieldset>

        {fulfillment === "pickup" ? (
          <>
            <fieldset className="choice event-form__wide">
              <legend>{t.restaurant}</legend>
              <div className="choice__options">
                {pickupLocations.map((location) => (
                  <label
                    key={location}
                    className={`choice__option ${pickupLocation === location ? "is-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="pickupLocation"
                      value={location}
                      checked={pickupLocation === location}
                      onChange={() => setPickupLocation(location)}
                    />
                    <strong>{location.replace("Tsak Tsak ", "")}</strong>
                    <span>{location}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {settings.pickupInstructions && (
              <p className="checkout__note event-form__wide">
                {settings.pickupInstructions}
              </p>
            )}
          </>
        ) : (
          <>
            <label className="event-form__wide">
              <span>{t.address}</span>
              <AddressAutocomplete
                apiKey={mapsApiKey}
                lang={lang}
                placeholder={t.addressPlaceholder}
                credit={t.googleCredit}
                value={address.line1}
                onChange={(line1) =>
                  setAddress((current) => ({ ...current, line1 }))
                }
                onSelect={(fields) =>
                  setAddress((current) => ({ ...current, ...fields }))
                }
              />
              <FieldError message={fieldError("line1")} />
            </label>
            <label>
              <span>{t.unit}</span>
              <input
                name="line2"
                type="text"
                placeholder={t.unitPlaceholder}
                autoComplete="address-line2"
                value={address.line2}
                onChange={(event) =>
                  setAddress((current) => ({
                    ...current,
                    line2: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              <span>{t.postalCode}</span>
              <input
                name="postalCode"
                type="text"
                placeholder="H2S 1R4"
                autoComplete="postal-code"
                required
                value={address.postalCode}
                onChange={(event) =>
                  setAddress((current) => ({
                    ...current,
                    postalCode: event.target.value.toUpperCase(),
                  }))
                }
              />
              <FieldError message={fieldError("postalCode")} />
            </label>
            <label className="event-form__wide">
              <span>{t.city}</span>
              <input
                name="city"
                type="text"
                autoComplete="address-level2"
                required
                value={address.city}
                onChange={(event) =>
                  setAddress((current) => ({
                    ...current,
                    city: event.target.value,
                  }))
                }
              />
              <FieldError message={fieldError("city")} />
            </label>
            <input type="hidden" name="province" value={address.province} />
            <input type="hidden" name="placeId" value={address.placeId} />
            <input type="hidden" name="lat" value={address.lat} />
            <input type="hidden" name="lng" value={address.lng} />
            {settings.deliveryInstructions && (
              <p className="checkout__note event-form__wide">
                {settings.deliveryInstructions}
              </p>
            )}
          </>
        )}

        <label className="event-form__wide">
          <span>{t.note}</span>
          <textarea
            name="note"
            rows={3}
            placeholder={
              fulfillment === "delivery"
                ? t.notePlaceholderDelivery
                : t.notePlaceholderPickup
            }
          />
        </label>

        <div className="event-form__footer event-form__wide">
          {!settings.shopOpen && (
            <p className="event-form__error">{settings.closedMessage}</p>
          )}
          {errors.length > 0 && (
            <div
              className="event-form__error event-form__error--box"
              role="alert"
            >
              {errors.map((problem) => (
                <p key={problem.field + problem.message}>{problem.message}</p>
              ))}
            </div>
          )}
          <button
            className="button button--dark button--full"
            type="submit"
            disabled={
              pending || blocked || payable.length === 0 || !settings.shopOpen
            }
          >
            {pending ? t.redirecting : t.pay(money(total))}{" "}
            <span aria-hidden="true">↗</span>
          </button>
          <p>
            {t.secure}
            {blocked ? t.removeUnavailable : ""}
          </p>
        </div>
      </form>
    </div>
  );
}
