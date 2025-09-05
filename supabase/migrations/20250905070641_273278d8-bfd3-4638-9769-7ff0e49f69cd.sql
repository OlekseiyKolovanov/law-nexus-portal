-- Add authorized person field to enterprises table
ALTER TABLE public.enterprises 
ADD COLUMN authorized_person text;