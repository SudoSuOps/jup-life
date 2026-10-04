# JUP LIFE — Orange PETG Hibiscus V02 / first-print pack

This is a new, unprinted prototype inspired by the supplied render. The original V01 five-petal function is retained, with fine secondary veins added. The opaque PETG version shows shallow positive sculpture on top rather than hiding the flower underneath.

## Open and print
- HIBISCUS-PETG-V02-P1S-FIRST-PLATE.3mf: contains one high-resolution coaster plus one fit ring. The coaster is one solid, 104 mm diameter, 5.4 mm maximum height. Print the flat underside on the bed, sculpture and rounded rim upward. Do not flip.
- HIBISCUS-PETG-V02-CASE.stl: print base down, opening up.
- HIBISCUS-PETG-V02-LID.stl: print flat closed roof down, skirt/opening up. Flip the lid to fit the case.
- HIBISCUS-PETG-V02-FIT-RING.stl: small 5 mm high case/lid clearance trial. Print this and one coaster before the full case.

All files are in millimetres. Keep scale at 100%. No supports are intended; inspect all toolpaths. The case opening is open at the top and has rounded lower corners.

## Dimensions and functional geometry
- Coaster base 3.3 mm; flower rises up to 0.8 mm above the base.
- Three flat 3.4 mm diameter support lands at radius 18 mm, height 4.2 mm. Flower peaks are at most 4.1 mm.
- Rounded raised outer rim reaches 5.4 mm: 1.2 mm above the support plane. Clearance inside its start is about 97.2 mm diameter.
- Nominal 104 mm overall diameter. Rounded/chamfered outermost edge has a local minimum modeled thickness of 2.65 mm.
- Test glasses whose actual flat base spans all three lands (roughly >=40 mm diameter) and fits within the rim; small, recessed, concave or footed glasses may contact differently.
- Case cavity 105 mm diameter, 35.2 mm tall, floor 2.4 mm. Case 110 mm OD x 37.6 mm high.
- Six coasters stacked rim-to-bottom: 32.4 mm nominal. Cavity headroom 2.8 mm.
- Lid inner diameter 111 mm over 110 mm case OD: 0.5 mm nominal radial clearance. Fit is untested.

## Smooth-finish trial — assumptions, not a validated machine profile
The owner confirmed a Bambu Lab P1S. This first trial assumes its standard 0.4 mm nozzle; the orange PETG brand and build plate remain unspecified. See P1S-SETUP.md and use the current matching filament and plate profiles.
- 0.4 mm nozzle; 0.12 mm layers for the fine-detail trial. If that profile behaves poorly, first establish a reliable 0.16 mm print.
- 4 walls, 6 top/bottom layers, 100% infill for the first sample. Reducing infill later can reduce material use; it does not turn PETG into an elastomer.
- Start with 25–30 mm/s external/detail surface speed as a conservative trial, within the supplier profile's extrusion limits. Adjust from actual print quality.
- Dry the actual spool per its supplier; no universal drying temperature or nozzle/bed temperature is specified.
- Calibrate flow and pressure advance. Use consistent external-wall speed and monotonically ordered exposed flat skin where supported.
- Do not iron every sculpted surface. An optional calibrated final-rim-only ironing test must be checked in the slicer before use.
- Use the supplier's recommended cooling and seam strategy. A seam on the back of the case is easier to inspect.
- PETG can adhere strongly to smooth PEI: follow the build-surface manufacturer's release/barrier directions. A polished top finish comes from controlled printing; the bed primarily finishes the underside.
- Fine digital veins may merge with a 0.4 mm nozzle. The million-triangle model preserves geometry, not a promise of microscopic printed detail.
- Light wet sanding can refine accessible flat rim and exterior surfaces. Keep it away from the flower details; test first. No solvent smoothing or heat-softening process is proposed.

## Can PETG be softer?
PETG stays a firm thermoplastic. Thinner sections or sparse interiors change part flexibility, not the polymer's softness. Keep this prototype solid enough to compare surface quality and support. For a soft, grippy material, use TPU; a removable TPU pad would be a separate design/material addition.

## First article
Check dimensions, flat underside, all three lands, glass stability, no contact between glass and delicate relief, rim finish, stringing, case and lid clearance, handling, cleaning and wet-table behavior. Compare against your current TPU V01, but note V02 has different geometry and art orientation: this is not a material-only A/B test. For a controlled material comparison, print exactly the same geometry in both materials.

Original transparent TPU V01 has its art on the underside and a smooth top. Do not confuse that older PRINT file's orientation with this V02 file.

Geometry was verified after STL export/reload: watertight, positive volume, consistent winding and one connected solid for each mesh. A physical sample remains necessary. No commercial care, dishwasher, food-contact, heat or environmental claim is established.

## Image distinction and rebuild
HIBISCUS-PETG-V02-CAD.png is a rendered height map of the modeled geometry, with simulated orange color.
The website AI photo is an illustrative concept. Its natural petal forms and finish are not an exact CAD or print measurement.
build-hibiscus-petg.py and hibiscus_shape_v01.py are included. Install numpy, scipy, trimesh, manifold3d, shapely, mapbox-earcut and matplotlib; place both Python files together, then run:
python build-hibiscus-petg.py output
The mesh report records the original STL hashes from which the 3MF was generated. Coaster STL is regenerated by the source; the geometry 3MF is the packaged import format for OrcaSlicer.

Sources: https://help.prusa3d.com/article/petg_2059 (PETG properties, cooling, surface preparation and sanding).
The actual spool and printer manufacturer instructions take precedence.


To regenerate the standard first-article 3MF after generating STLs: python build-hibiscus-p1s-plate.py output
