# Demo sandbox

Open `/demo` or `/?demo=1` to load a realistic seven-food pantry and three
placed meals. The sample includes fibre, protein, and total sugar targets plus values
attributed to a package label or USDA FoodData Central.

The demo reads and writes only the IndexedDB key `demo:plan`. It never reads
`real:plan`. The lime banner says **Demo — sample data, nothing is saved** and
offers **Reset demo**. Every app route that leaves demo — **Start for real**,
Planner, Privacy, Terms, or home — discards the demo key. Re-entering `/demo`
then seeds a new sample. **Start for real** opens a blank plan stored under
`real:plan`.

After its first online visit, the service worker precaches the built app shell.
Reload `/demo` while offline to use the sample plan without a network connection.
