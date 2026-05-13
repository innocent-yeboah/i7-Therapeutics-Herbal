-- If an earlier migration referenced healing-with-diet.png, switch to the JPEG asset.
update public.services
set image = '/services/healing-with-diet.jpg'
where name = 'Healing with diet';
