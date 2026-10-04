# Hibiscus PETG V02

October 3, 2026, America/New_York. Owner requested opaque orange PETG, smooth finish, raised coaster wall and the U-front case from the concept image.

Original source: owner's JUP-LIFE-HIBISCUS-V01-PRINT-PACK.zip, read and preserved intact. V01 engraving function is retained in scripts/hibiscus_shape_v01.py. V02 uses positive top relief for visibility in opaque PETG, extra secondary veins, three glass-support lands, a rounded outer rim, a six-coaster case, slip lid and clearance ring. This is a new geometry variant, not a PETG material-only conversion.

The coaster has 1,054,080 triangles. All four STL files were reloaded and verified watertight, positive volume, winding and one connected solid. Geometry report includes hashes. Case nominal six-piece stack 32.4 mm; cavity 35.2 mm; 0.5 mm radial clearances. Physical fit and glass stability are untested.

Read public/prototypes/hibiscus-petg/PRINT-GUIDE.md before slicing. Rebuild into a non-public output directory with python scripts/build-hibiscus-petg.py output/hibiscus-petg. The raw coaster STL is about 53 MB and is replaced in the delivery pack by lossless model 3MF geometry. Do not put the raw STL in Cloudflare Pages assets, whose per-file size limit is 25 MiB. The complete ZIP is approximately 5 MB.

The actual CAD height preview is separate from the built-in imagegen material concept. The concept has natural flower forms and finish beyond the measured model; labels explicitly state it is not exact CAD or print photography.

## Image prompt

Edit the supplied JUP LIFE hibiscus coaster and case concept photo. Preserve the composition, teal setting, five-petal hibiscus, curved stamen, etched botanical veins, thin round coaster shape, U-shaped front access opening on the case, separate slip lid and six-coaster set. Change the translucent clear coasters to opaque glossy orange PETG, and change the teal case and lid to matching opaque orange PETG. Beautiful uniform orange polymer, not glass, not silicone, not metal. Make the coaster's rounded raised outer wall visibly 1.2mm above its nominal 4.2mm surface, 104mm disk diameter, 5.4mm overall. The flower is detailed shallow sculpture carved below the flat support areas, no fragile raised stamens or raised protruding petals. Maintain refined natural light, crisp fine detail and smooth rounded edges, realistic fine FDM layer texture on vertical walls, polished premium product concept imagery. No new logos or typography, no feature claims. This is an illustrative concept, not a photographed or verified print. High-resolution landscape.

## Claims

Use firm PETG and smooth-finish goals as prototype descriptions. No TPU softness, dishwasher, food-contact, recycled-content, biodegradability or restaurant-durability claims are established. Slicer settings are trial choices; use the exact spool and machine's current manufacturer profile. Sources: https://help.prusa3d.com/article/petg_2059


## P1S first article
Owner confirmed Bambu Lab P1S. A separate standard model 3MF contains one coaster and fit ring at millimetre scale, flat-bottom-down, with 9 mm spacing. It is unsliced and contains no machine/filament settings or G-code. P1S-SETUP.md documents explicit 0.4 mm nozzle assumptions and trial settings. The build script and setup guide are included in the complete print pack; the 3MF is included in the ZIP and also available separately. Each public asset stays below 25 MiB.

Transport packaging: the coaster mesh is shipped as standard 3MF geometry, preserving its full triangle count. The 52 MB raw STL is regenerable from the included source. The ZIP includes the 3MF, supporting STLs and guides, so it fits the connector request limit. No mesh reduction was performed.
