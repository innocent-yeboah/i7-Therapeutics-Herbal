-- Point Cupping Therapy at local brand imagery.
update public.services
set image = '/services/cupping-therapy.png'
where slug = 'cupping-therapy'
   or name = 'Cupping Therapy';
