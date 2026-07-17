-- Point Meridian Massage at local brand imagery.
update public.services
set image = '/services/meridian-massage.png'
where slug = 'meridian-massage'
   or name = 'Meridian Massage';
