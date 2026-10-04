# Hibiscus V02 — Bambu Lab P1S first article

## Start here
Open HIBISCUS-PETG-V02-P1S-FIRST-PLATE.3mf in OrcaSlicer as geometry. It contains one coaster and one clearance ring, already flat on the bed at millimetre scale. This is a standard unsliced model 3MF, not a saved Orca printer profile or ready-to-run G-code. Select the printer and material before slicing.

1. Select **Bambu Lab P1S / 0.4 mm nozzle**. Confirm your installed nozzle matches. The P1S's nominal 256 × 256 mm plate accommodates both parts with a 9 mm gap; preview the placement and printer exclusion zones.
2. Select your installed build plate. For smooth PEI, follow Bambu's plate-specific PETG release instructions; textured PEI textures the underside. Do not assume an adhesive or temperature suits every plate.
3. Select the exact orange PETG preset. Use Generic PETG only as a starting point for an unlisted brand; PETG HF requires its own matching preset. Keep nozzle/bed temperature, cooling and maximum volumetric speed matched to the actual spool supplier. Dry it as instructed by that supplier.
4. Start from a supported 0.12 mm process and set 4 wall loops, 6 top shell layers, 6 bottom shell layers, 100% rectilinear infill for this first coaster, outer wall 30 mm/s and top surface 30 mm/s. These are trial settings, not validated print results. If fine layers behave poorly, establish a reliable 0.16 mm sample first.
5. Keep supports off and scale at 100%. Coaster flower and rim face upward; both flat bottoms stay on the bed. Leave ironing off for the sculpted coaster. Follow the filament preset's enclosure ventilation guidance.
6. Slice and inspect every layer: complete bottom, three equal support lands, continuous rim, no unexpected support or thin-wall omissions. Choose seams deliberately and run the applicable flow calibration. Do not send the job until the preview matches.
7. Print the trial. Check glass stability, rim quality and coaster clearance inside the ring. Then print the case base down and lid closed roof down from the complete pack. Print six coasters only after the first passes.

The same high-resolution coaster geometry is supplied as the model 3MF, alongside the case/lid STL files in JUP-LIFE-HIBISCUS-PETG-V02-PRINT-PACK.zip. The included Python source can regenerate the coaster STL. Geometry meshes are verified; this first-plate 3MF has not been opened and sliced in OrcaSlicer here. It contains no material assignment, filament profile, toolpath or time estimate.

PETG remains firm. Thin walls can bend more, but do not become TPU-soft. A smooth finish still depends on drying, flow, cooling and the physical first print. The AI concept is an illustration, not a guaranteed printed surface.

Sources:
- https://us.store.bambulab.com/products/p1s (P1S build volume, included nozzle, PETG support)
- https://help.prusa3d.com/article/petg_2059 (PETG surface preparation and finishing)

Orca import reference: https://github.com/OrcaSlicer/OrcaSlicer/wiki/import_export
