# text-3d-engine

A tiny voxel-style ASCII 3D text renderer. Provide a container, dimensions, and a string and it will render animated 3D text using simple line art. Designed to be published directly to npm with a minimal, browser-friendly API.

## Install

```bash
npm install text-3d-engine
```

## Usage

```html
<div id="ascii"></div>
<script type="module">
  import { createTextRenderer } from 'text-3d-engine'

  const renderer = createTextRenderer({
    container: document.getElementById('ascii'),
    width: 120,
    height: 40,
    text: 'HELLO WORLD',
  })

  // Update the text later
  renderer.updateText('ASCII ROCKS!')

  // Resize if your container changes
  renderer.resize(160, 48)

  // Stop/start the animation
  renderer.stop()
  renderer.start()
</script>
```

### Options

| Option | Description | Default |
| --- | --- | --- |
| `container` | Target HTMLElement to receive the ASCII output. | **required** |
| `width` / `height` | Virtual canvas size in characters. | **required** |
| `text` | The text to render (supports A-Z, 0-9, `?`, `!`, `#`, and spaces). | **required** |
| `pixelSize` | Size of each voxel pixel. | `0.28` |
| `letterSpacing` | Spacing between letters in world units. | `0.25` |
| `lineSpacing` | Spacing between lines for multiline strings. | `0.35` |
| `autoRotate` | Whether to keep rotating the text. | `true` |
| `rotationSpeed` | Speed multiplier for the rotation loop. | `0.4` |

### Low-level model builder

If you want to compose the voxel text model yourself, the helper is also exported:

```js
import { createVoxelText } from 'text-3d-engine'

const model = createVoxelText('TEXT')
```
