# Classic Smash Burger RealityScan Inspection

Generated for preview hardening on 2026-07-18.

## Scale And Orientation

- Production model: `public/models/brunch-cafe/classic-smash-burger/model.glb`
- Physical plate diameter: `0.28 m`
- Scene bounding box from `gltf-transform inspect`: min `[-0.14318, 0, -0.14205]`, max `[0.14318, 0.13176, 0.14205]`
- Actual model width: `0.28636 m`
- Actual model depth: `0.28410 m`
- Actual model height: `0.13176 m`
- Bounding-box centre: approximately `[0, 0.06588, 0]`
- Up axis: `Y`
- Ground position: bottom rests at `Y = 0`
- Orientation: plate is horizontal and dish faces upward
- Scale correction required: no. The model is about `2.3%` wider than the measured `0.28 m` plate, which is acceptable for the current pilot.

## Performance

- Original source GLB size: `3,177,784 bytes`
- Original source package size with diffuse and normal JPGs: `6,267,661 bytes`
- Production standalone GLB size: `3,648,288 bytes`
- Poster size: `84,708 bytes`
- Mesh count: `1`
- Mesh primitive count: `1`
- Triangle count: `99,998`
- Vertex count: `61,754`
- Material count: `1`
- Texture count: `1`
- Production texture: embedded JPEG, `2048 x 2048`, `470.63 KB`
- Source textures: diffuse JPG `4096 x 4096`, normal JPG `4096 x 4096`; the source GLB references the diffuse map only.
- Compression extensions: none
- Estimated production GLB download at 5 Mbps: about `5.8 s`
- Estimated production GLB download at 20 Mbps: about `1.5 s`

## Delivery Notes

- The production GLB is below the preferred `8 MB` target.
- No mesh decimation was applied in this pass because the model is already below the pilot budget and visual fidelity should be preserved.
- The exact tested `model-viewer` runtime, version `4.1.0`, is self-hosted at `public/vendor/model-viewer/4.1.0/model-viewer.min.js`.
- The current GLB uses no Draco, meshopt, KTX, or other decoder-dependent extensions.
- A future `model.usdz` may be added beside `model.glb`; the viewer checks for it and passes it to `ios-src` when present.
