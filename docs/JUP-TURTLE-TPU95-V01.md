# JUP TURTLE 001 — TPU 95A Production Spec

## Product intent
Premium Jupiter/coastal sea-turtle coaster designed as a reusable, washable, durable JUP LIFE Studio piece. The drink face stays functionally flat; turtle artwork is engraved rather than raised so glassware remains stable.

## Geometry
- Overall diameter: 104.0 mm
- Base thickness: 3.0 mm
- Perimeter catch lip: +0.45 mm high, 1.8 mm wide
- Turtle engraving: 0.45 mm nominal depth
- Shell channel detail: ~0.28 mm nominal depth
- Edge: continuous round profile from cylindrical base; no sharp decorative protrusions
- Orientation: turtle head at 12 o'clock

## Material
- TPU 95A only for release V01
- Preferred aesthetic: translucent/clear, sea-glass, sand, white, or coastal green
- Dry filament before production if stringing or surface haze is present

## Orca / P1S-first print target
Starting profile — validate against actual spool before release:
- Nozzle: 0.4 mm
- Layer height: 0.20 mm
- First layer: 0.24 mm
- Walls: 4
- Top/bottom layers: 5 / 5
- Infill: 18–22% gyroid
- Supports: OFF
- Brim: OFF unless the specific TPU spool needs it
- Seam: rear / nearest 6 o'clock when possible
- Print face: flat bottom on build plate
- Outer-wall speed: conservative TPU quality profile
- Retraction: use the known-good TPU 95A machine profile; do not increase aggressively to chase stringing

## Functional design logic
1. **Flat glass interface** — no tall turtle emboss under the glass.
2. **Shallow engraving** — visual identity without creating a rocking point.
3. **Catch lip** — subtle perimeter containment for condensation without turning the coaster into a tray.
4. **One-piece TPU** — no adhesive, inserts, or mixed-material failure points in V01.
5. **Washable** — broad radii and shallow channels reduce grime traps.

## First article QA
Do not release from CAD alone. Print one first article and verify:
- Diameter: 104.0 mm ±0.5 mm
- Total nominal height at rim: 3.45 mm ±0.25 mm
- No cup/glass rocking on the center field
- Turtle silhouette reads cleanly from arm's length
- Shell channels remain open and do not fuse closed
- No elephant-foot ridge that interferes with case fit
- No sharp strings, blobs, or loose whiskers
- Flatness: no obvious corner/edge lift on a known-flat surface
- Hand wash test: no debris trapped in channels after rinse/wipe

## Drop architecture
Suggested product name:
**JUP TURTLE — Jupiter Sea Turtle Coaster Set**

Suggested retail pack:
- 6 TPU 95A coasters
- matching reusable case / display holder
- optional mixed coastal color set

Suggested brand copy:
> A little piece of our happy place — a reusable sea-turtle coaster made in Jupiter from flexible TPU 95A. Wash it, use it, and keep it on the table.

## Release gate
Status: **ENGINEERING V01 / FIRST ARTICLE REQUIRED**

V01 becomes production-ready only after one physical TPU 95A print passes the QA list above and the chosen spool/profile is recorded.
