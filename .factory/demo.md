# Demo sandbox

Open `/?demo=1` for the catalog and first-screen sample path. `/demo` is the
equivalent direct route. Both open a seven-food plan with three meals and three
targets for fibre, protein, and total sugar.

The demo reads and writes only the IndexedDB key `demo:plan`. It never reads or
writes `real:plan`. A persistent banner says **Demo — sample data, nothing is
saved** and provides **Reset demo** and **Start for real**.

**Reset demo** deletes `demo:plan` and restores the bundled sample. Every link
that leaves the demo deletes `demo:plan`. **Start for real** opens `/plan`, which
uses `real:plan` and starts blank in a clean browser.

After one online visit, the service worker caches the built application shell.
Reload `/?demo=1` or `/demo` offline to keep planning with the bundled sample.
