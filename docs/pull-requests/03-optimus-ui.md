# Replace PrimeNG with MIT-licensed Optimus UI

Base: `improvement/angular-21-bridge`  
Head: `improvement/optimus-ui`

- Run the official Optimus UI 1 migration; replace components, services,
  provider, icons and custom Lara theme package.
- Configure Tailwind 4's Optimus plugin and shared dark-mode selector; remove
  obsolete/empty legacy configuration files.
- Replace deprecated template slots; retain compatible `p-*` selectors and
  `--p-*` theme overrides. Improve form labels and icon-button names.
- Add a rendered light/dark theme integration check.

Validation: zero-warning lint, 21 passing tests, production/PWA build and zero
production audit findings. No old library imports remain in `src` or the package
manifest. Browser smoke check on an isolated origin: PIN entry, dashboard,
mobile menu, dark theme, portfolio table and asset drawer; no console errors.

This is the supported Optimus 1 migration bridge. The next PR upgrades Angular
and Optimus together to 22/2. No automatic merge.
