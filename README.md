# Lung cancer cause of death classification

A uniform definition of the lung cancer related cause of death is essential in lung cancer screening studies. The NELSON authors published their methodology[^1], including a comprehensive algorithm classifying each lung cancer death into the 6 categories of:

1. Definite lung cancer death
2. Probable LC death
3. Possible LC death
4. Unlikely LC death
5. Definitely not LC death
6. Intercurrent CoD, LC contributory


However, using this algorithm can be unwieldy for reviewers. This tool (a React app) allows the reviewer to quickly track down the tree (hopefully with fewer errors) and also shows the path taken down the tree.

## How to use

This is published at http://darylcheng.github.io/cod_classifer - simply visit the page and use. 

## Releases

- 25/3/2025 - First release

## Planned features

- Make usable offline / as mobile app as a PWA
- Ability to input trial IDs
- Ability to go back a step
- Batch output to export CSV after finished


[^1]: Horeweg, Nanda, et al. "Blinded and uniform cause of death verification in a lung cancer CT screening trial." Lung Cancer 77.3 (2012): 522-525.