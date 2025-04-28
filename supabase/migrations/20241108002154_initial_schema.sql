create table "public"."stages" (
    "created_at" timestamp with time zone not null default now(),
    "title" text not null default ''::text,
    "creator_id" uuid default auth.uid(),
    "url_slug" text default gen_random_uuid(),
    "collaborator_ids" uuid[] not null default '{}'::uuid[],
    "features" jsonb[] default '{}'::jsonb[],
    "id" uuid not null default gen_random_uuid()
);


alter table "public"."stages" enable row level security;

CREATE UNIQUE INDEX stages_pkey ON public.stages USING btree (id);

alter table "public"."stages" add constraint "stages_pkey" PRIMARY KEY using index "stages_pkey";

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



create policy "Give open read access"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'assets'::text));


create policy "Give users authenticated access to folders of stages they edit"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'assets'::text) AND (auth.role() = 'authenticated'::text) AND ((split_part(name, '/'::text, 1))::uuid IN ( SELECT stages.id
   FROM stages
  WHERE (auth.uid() = ANY (stages.collaborator_ids))))));



