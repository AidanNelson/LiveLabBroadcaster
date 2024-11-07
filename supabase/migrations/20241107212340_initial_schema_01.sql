create table "public"."stages" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "title" text not null default ''::text,
    "creator_id" uuid not null default auth.uid(),
    "collaborator_ids" uuid[] not null default '{}'::uuid[],
    "url_slug" text not null default gen_random_uuid(),
    "features" jsonb[] not null default '{}'::jsonb[]
);


alter table "public"."stages" enable row level security;

CREATE UNIQUE INDEX test_pkey ON public.stages USING btree (id);

CREATE UNIQUE INDEX test_url_slug_key ON public.stages USING btree (url_slug);

alter table "public"."stages" add constraint "test_pkey" PRIMARY KEY using index "test_pkey";

alter table "public"."stages" add constraint "test_url_slug_key" UNIQUE using index "test_url_slug_key";

grant delete on table "public"."stages" to "anon";

grant insert on table "public"."stages" to "anon";

grant references on table "public"."stages" to "anon";

grant select on table "public"."stages" to "anon";

grant trigger on table "public"."stages" to "anon";

grant truncate on table "public"."stages" to "anon";

grant update on table "public"."stages" to "anon";

grant delete on table "public"."stages" to "authenticated";

grant insert on table "public"."stages" to "authenticated";

grant references on table "public"."stages" to "authenticated";

grant select on table "public"."stages" to "authenticated";

grant trigger on table "public"."stages" to "authenticated";

grant truncate on table "public"."stages" to "authenticated";

grant update on table "public"."stages" to "authenticated";

grant delete on table "public"."stages" to "service_role";

grant insert on table "public"."stages" to "service_role";

grant references on table "public"."stages" to "service_role";

grant select on table "public"."stages" to "service_role";

grant trigger on table "public"."stages" to "service_role";

grant truncate on table "public"."stages" to "service_role";

grant update on table "public"."stages" to "service_role";

create policy "Enable insert for authenticated users only"
on "public"."stages"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."stages"
as permissive
for select
to public
using (true);


create policy "Enable update for users based on user_id"
on "public"."stages"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = ANY (collaborator_ids)))
with check ((( SELECT auth.uid() AS uid) = ANY (collaborator_ids)));



