-- Point Advanced Deep Tissue / NMT at updated local brand imagery.
update public.services
set image = '/services/advanced-deep-tissue-nmt.png'
where slug = 'advanced-deep-tissue-nmt'
   or name = 'Advanced Deep Tissue / Neuromuscular Therapy (NMT)';
