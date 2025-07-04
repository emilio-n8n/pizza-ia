drop policy "Allow pizzeria owner to view orders" on "public"."orders";

drop policy "Allow pizzeria owner to manage menu" on "public"."menu_items";

revoke delete on table "public"."orders" from "anon";

revoke insert on table "public"."orders" from "anon";

revoke references on table "public"."orders" from "anon";

revoke select on table "public"."orders" from "anon";

revoke trigger on table "public"."orders" from "anon";

revoke truncate on table "public"."orders" from "anon";

revoke update on table "public"."orders" from "anon";

revoke delete on table "public"."orders" from "authenticated";

revoke insert on table "public"."orders" from "authenticated";

revoke references on table "public"."orders" from "authenticated";

revoke select on table "public"."orders" from "authenticated";

revoke trigger on table "public"."orders" from "authenticated";

revoke truncate on table "public"."orders" from "authenticated";

revoke update on table "public"."orders" from "authenticated";

revoke delete on table "public"."orders" from "service_role";

revoke insert on table "public"."orders" from "service_role";

revoke references on table "public"."orders" from "service_role";

revoke select on table "public"."orders" from "service_role";

revoke trigger on table "public"."orders" from "service_role";

revoke truncate on table "public"."orders" from "service_role";

revoke update on table "public"."orders" from "service_role";

alter table "public"."orders" drop constraint "orders_pizzeria_id_fkey";

alter table "public"."orders" drop constraint "orders_pkey";

drop index if exists "public"."orders_pkey";

drop table "public"."orders";

create policy "1. Pizzerias: Allow insert for authenticated users"
on "public"."pizzerias"
as permissive
for insert
to authenticated
with check ((auth.uid() = owner_id));


create policy "2. Pizzerias: Allow select for owner"
on "public"."pizzerias"
as permissive
for select
to authenticated
using ((auth.uid() = owner_id));


create policy "3. Pizzerias: Allow update for owner"
on "public"."pizzerias"
as permissive
for update
to authenticated
using ((auth.uid() = owner_id))
with check ((auth.uid() = owner_id));


create policy "4. Pizzerias: Allow delete for owner"
on "public"."pizzerias"
as permissive
for delete
to authenticated
using ((auth.uid() = owner_id));


create policy "Allow pizzeria owner to manage menu"
on "public"."menu_items"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM pizzerias
  WHERE ((pizzerias.id = menu_items.pizzeria_id) AND (pizzerias.owner_id = auth.uid())))));



