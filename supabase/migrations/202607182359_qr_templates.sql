create table if not exists public.qr_templates (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null,
  template_name text not null,
  logo_url text,
  primary_color text not null default '#B06A3A',
  background_color text not null default '#FFFDF8',
  text_color text not null default '#241E1B',
  qr_color text not null default '#111111',
  heading jsonb not null default '{"en":"Scan to Order","ar":"امسح رمز QR للطلب"}',
  instruction_text jsonb not null default '{"en":"Scan the QR code to explore our menu and order directly from your table.","ar":"امسح الرمز لاستعراض قائمة الطعام والطلب مباشرة من طاولتك."}',
  footer_text jsonb not null default '{"en":"No app required. Simply scan with your phone camera.","ar":"لا تحتاج إلى تحميل أي تطبيق. امسح الرمز بكاميرا الهاتف."}',
  language text not null default 'en' check (language in ('en', 'ar', 'both')),
  orientation text not null default 'portrait' check (orientation in ('portrait', 'landscape')),
  width numeric not null default 100,
  height numeric not null default 150,
  unit text not null default 'mm' check (unit in ('mm', 'cm')),
  border_style text not null default 'solid' check (border_style in ('solid', 'dashed', 'double', 'none')),
  font_family text not null default 'Arial',
  show_menu_feature boolean not null default true,
  show_order_feature boolean not null default true,
  show_waiter_feature boolean not null default true,
  show_bill_feature boolean not null default true,
  show_feedback_feature boolean not null default true,
  show_offers_feature boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.qr_templates enable row level security;

create policy "admins can manage qr templates"
on public.qr_templates
for all
using (auth.jwt() ->> 'role' = 'admin')
with check (auth.jwt() ->> 'role' = 'admin');
