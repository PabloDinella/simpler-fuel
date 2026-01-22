-- Supabase Database Schema for Simpler Fuel App
-- Run this in your Supabase SQL Editor

-- Enable required extensions
create extension if not exists moddatetime schema extensions;

-- Create fuel_entries table
create table "public"."fuel_entries" (
    "id" text primary key,
    "user_id" uuid not null references auth.users(id) on delete cascade,
    "date" timestamp with time zone not null default now(),
    "odometer_km" numeric(10, 2) not null,
    "liters" numeric(10, 3) not null,
    "notes" text,
    
    "_deleted" boolean default false not null,
    "_modified" timestamp with time zone default now() not null
);

-- Auto-update the _modified timestamp on updates
create trigger update_fuel_entries_modified_datetime 
    before update on public.fuel_entries 
    for each row
    execute function extensions.moddatetime('_modified');

-- Add table to realtime publication for live sync
alter publication supabase_realtime add table "public"."fuel_entries";

-- Enable Row Level Security
alter table "public"."fuel_entries" enable row level security;

-- RLS Policies: Users can only access their own entries
create policy "Users can view their own fuel entries"
    on "public"."fuel_entries"
    for select
    using (auth.uid() = user_id);

create policy "Users can insert their own fuel entries"
    on "public"."fuel_entries"
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own fuel entries"
    on "public"."fuel_entries"
    for update
    using (auth.uid() = user_id);

create policy "Users can delete their own fuel entries"
    on "public"."fuel_entries"
    for delete
    using (auth.uid() = user_id);

-- Create index for better query performance
create index fuel_entries_user_id_idx on "public"."fuel_entries"(user_id);
create index fuel_entries_date_idx on "public"."fuel_entries"(date desc);
create index fuel_entries_modified_idx on "public"."fuel_entries"(_modified);
