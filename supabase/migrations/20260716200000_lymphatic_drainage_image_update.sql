-- Point Lymphatic Drainage Massage at updated local brand imagery.
update public.services
set image = '/services/lymphatic-drainage-massage.png'
where slug = 'lymphatic-drainage-massage'
   or name = 'Lymphatic Drainage Massage';
