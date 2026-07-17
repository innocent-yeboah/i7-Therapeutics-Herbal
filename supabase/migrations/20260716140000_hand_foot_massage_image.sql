-- Point Hand and Foot Massage at local brand imagery.
update public.services
set image = '/services/hand-and-foot-massage.png'
where slug = 'hand-foot-massage'
   or name = 'Hand and Foot Massage';
