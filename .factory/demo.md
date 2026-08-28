# Demo sandbox

Open `/demo` or `/?demo=1` to load a realistic seven-food pantry and three
placed meals. The sample includes fibre, protein, and sugar targets plus values
attributed to a package label or USDA FoodData Central.

The demo reads and writes only the IndexedDB key `demo:plan`. It never reads
`real:plan`. The lime banner says **Demo — sample data, nothing is saved** and
offers **Reset demo**. **Start for real** leaves the sandbox and opens a blank
plan stored under `real:plan`.

After its first online visit, the service worker caches the app shell. The
planner continues to work without a network connection.
