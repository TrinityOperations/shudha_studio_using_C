-- Optional catalog prices; existing products remain valid and unpriced.
alter table public.products
  add column if not exists price numeric(12, 2),
  add column if not exists compare_at_price numeric(12, 2),
  add column if not exists currency_code text not null default 'USD';

alter table public.products
  add constraint products_price_nonnegative
    check (price is null or price >= 0),
  add constraint products_compare_at_price_nonnegative
    check (compare_at_price is null or compare_at_price >= 0),
  add constraint products_currency_code_format
    check (currency_code ~ '^[A-Z]{3}$');

comment on column public.products.price is 'Optional current product price; null means inquire for pricing.';
comment on column public.products.compare_at_price is 'Optional reference price, shown only when greater than price.';
comment on column public.products.currency_code is 'ISO 4217 currency code for price fields.';