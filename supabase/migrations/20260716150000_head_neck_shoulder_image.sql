-- Point Head, Neck & Shoulder Massage at local brand imagery.
update public.services
set image = '/services/head-neck-shoulder-massage.png'
where slug = 'head-neck-shoulder-massage'
   or name ilike 'Head, Neck%Shoulder Massage';
