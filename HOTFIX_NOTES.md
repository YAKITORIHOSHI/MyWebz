# Readability and Theme Hotfix

This package corrects the mixed light/dark theme and washed-out component surfaces.

## Corrected

- Tailwind `dark:` utilities now respond only to the application's Dark button.
- Operating-system dark preference no longer forces individual components into dark mode while the app is in light mode.
- Cards, tables, filters, dropdowns, and the navbar use their declared solid background colors.
- Hover elevation uses neutral shadows and a restrained 2px lift.
- Moving sheen was removed from content containers so text remains unobstructed.
- The saved theme is applied before React renders to prevent a light/dark flash.

## Run

```powershell
npm install
npm run dev
```

After replacing an already-running project, stop Vite with `Ctrl + C`, replace the source files, and start it again. A hard refresh (`Ctrl + F5`) clears the old CSS from the browser.
