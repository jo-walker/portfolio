import { useDisplay } from '../shell/DisplayContext';
import { useReducedMotion } from '../window-manager/useMediaQuery';
import {
  backgroundStyle,
  showsClouds,
  FITS,
  WALLPAPERS,
  type WallpaperFit,
  type WallpaperId,
} from '../shell/display';

export function DisplayApp() {
  const { settings, update } = useDisplay();
  const reducedMotion = useReducedMotion();
  const animating = showsClouds(settings, reducedMotion);

  return (
    <div className="app-pad display-app">
      {/* The little CRT preview from the real Display Properties applet. */}
      <div className="display-monitor">
        <div className="display-bezel">
          <div className="display-screen" style={backgroundStyle(settings)}>
            {animating && <div className="desktop-clouds" aria-hidden />}
            <div className="display-dither" aria-hidden />
          </div>
        </div>
        <div className="display-stand" />
      </div>

      <div className="display-controls">
        <fieldset>
          <legend>Wallpaper</legend>
          <ul className="display-list" role="listbox" aria-label="Wallpaper">
            {WALLPAPERS.map((w) => (
              <li key={w.id}>
                <button
                  role="option"
                  aria-selected={settings.wallpaper === w.id}
                  className={settings.wallpaper === w.id ? 'selected' : undefined}
                  onClick={() => update({ wallpaper: w.id as WallpaperId })}
                >
                  {w.label}
                </button>
              </li>
            ))}
          </ul>
        </fieldset>

        <fieldset>
          <legend>Display</legend>
          {FITS.map((f) => (
            <div key={f.id} className="field-row">
              <input
                type="radio"
                id={`fit-${f.id}`}
                name="fit"
                checked={settings.fit === f.id}
                disabled={settings.wallpaper === 'none'}
                onChange={() => update({ fit: f.id as WallpaperFit })}
              />
              <label htmlFor={`fit-${f.id}`}>{f.label}</label>
            </div>
          ))}

          <div className="field-row display-animate">
            <input
              type="checkbox"
              id="animate"
              checked={settings.animate}
              disabled={reducedMotion || settings.wallpaper !== 'steppe'}
              onChange={(e) => update({ animate: e.target.checked })}
            />
            <label htmlFor="animate">Drifting clouds</label>
          </div>
          {reducedMotion && (
            <p className="display-note">Motion is off because your system asks to reduce it.</p>
          )}
          {!reducedMotion && settings.animate && settings.wallpaper !== 'steppe' && (
            <p className="display-note">Clouds need the Steppe wallpaper.</p>
          )}
        </fieldset>
      </div>
    </div>
  );
}
