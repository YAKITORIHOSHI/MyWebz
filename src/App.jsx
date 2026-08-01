import { useRef } from 'react'
import {
  BellRing,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  Coffee,
  MapPin,
  MessageCircle,
  Sparkles,
  Stars,
  Video,
  Zap,
} from 'lucide-react'
import './App.css'

const details = [
  {
    icon: CalendarDays,
    label: 'Date',
    value: 'August 1, 2026',
  },
  {
    icon: Clock3,
    label: 'Time',
    value: '10:00 PM',
  },
  {
    icon: MapPin,
    label: 'Place',
    value: 'See you there',
  },
]

const confetti = [
  ['6%', '12%', '0s', 'coral', '18deg'],
  ['15%', '82%', '1.2s', 'mint', '54deg'],
  ['21%', '24%', '0.6s', 'sun', '104deg'],
  ['31%', '72%', '1.8s', 'violet', '132deg'],
  ['43%', '16%', '0.3s', 'mint', '76deg'],
  ['52%', '88%', '1.5s', 'coral', '20deg'],
  ['64%', '21%', '0.9s', 'sun', '148deg'],
  ['73%', '78%', '2.1s', 'violet', '88deg'],
  ['82%', '33%', '0.4s', 'coral', '44deg'],
  ['93%', '64%', '1.1s', 'mint', '118deg'],
]

const backgroundObjects = [
  [CalendarDays, '8%', '27%', '0s', 'coral', '-12deg', '18s'],
  [Clock3, '19%', '66%', '-3s', 'violet', '9deg', '21s'],
  [Video, '77%', '18%', '-6s', 'mint', '14deg', '19s'],
  [ClipboardCheck, '86%', '72%', '-9s', 'sun', '-10deg', '23s'],
  [MessageCircle, '6%', '78%', '-11s', 'mint', '7deg', '20s'],
  [Coffee, '91%', '36%', '-14s', 'coral', '15deg', '24s'],
  [Zap, '33%', '13%', '-17s', 'violet', '-8deg', '22s'],
]

const lightTrails = [
  ['-14%', '16%', '17deg', '0s', '10s', 'coral'],
  ['-20%', '42%', '-9deg', '-2.4s', '12s', 'mint'],
  ['-18%', '73%', '22deg', '-5.1s', '11s', 'violet'],
  ['78%', '8%', '106deg', '-3.8s', '13s', 'sun'],
  ['82%', '63%', '71deg', '-7s', '12.5s', 'mint'],
]

const energyShapes = [
  ['12%', '49%', 'square', 'coral', '0s', '16deg', '8s'],
  ['28%', '19%', 'diamond', 'mint', '-1.8s', '-18deg', '9s'],
  ['39%', '82%', 'pill', 'violet', '-3.3s', '30deg', '10s'],
  ['61%', '14%', 'triangle', 'sun', '-5.2s', '-7deg', '8.8s'],
  ['71%', '86%', 'square', 'mint', '-6.4s', '18deg', '11s'],
  ['89%', '52%', 'diamond', 'coral', '-4.6s', '-25deg', '9.5s'],
]

const flowTiles = [
  ['10%', '18%', '0s', 'coral', '18deg', '14s'],
  ['24%', '77%', '-3s', 'mint', '-10deg', '16s'],
  ['43%', '27%', '-6s', 'violet', '12deg', '15s'],
  ['58%', '84%', '-9s', 'sun', '-16deg', '17s'],
  ['76%', '22%', '-12s', 'mint', '24deg', '14.5s'],
  ['91%', '66%', '-15s', 'coral', '-22deg', '18s'],
]

function App() {
  const pageRef = useRef(null)

  function handlePointerMove(event) {
    const page = pageRef.current

    if (!page) {
      return
    }

    page.style.setProperty('--mouse-x', `${event.clientX}px`)
    page.style.setProperty('--mouse-y', `${event.clientY}px`)
  }

  function handlePointerLeave() {
    const page = pageRef.current

    if (!page) {
      return
    }

    page.style.setProperty('--mouse-x', '50vw')
    page.style.setProperty('--mouse-y', '50vh')
  }

  return (
    <main
      className="invite-page"
      ref={pageRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label="Team meeting invitation"
    >
      <div className="stage-lights" aria-hidden="true" />
      <div className="beat-grid" aria-hidden="true" />
      <div className="motion-ribbons" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="confetti-field" aria-hidden="true">
        {confetti.map(([left, top, delay, color, angle], index) => (
          <span
            className={`confetti confetti-${color}`}
            key={`${left}-${top}`}
            style={{
              '--left': left,
              '--top': top,
              '--delay': delay,
              '--angle': angle,
              '--drift': `${index % 2 === 0 ? 1 : -1}`,
            }}
          />
        ))}
      </div>
      <div className="kinetic-background" aria-hidden="true">
        <div className="mega-frame mega-frame-one" />
        <div className="mega-frame mega-frame-two" />
        <div className="scanner-line" />
        {backgroundObjects.map(
          ([Icon, left, top, delay, tone, rotation, duration], index) => (
            <div
              className={`kinetic-object kinetic-object-${tone}`}
              key={`${left}-${top}`}
              style={{
                '--object-left': left,
                '--object-top': top,
                '--object-delay': delay,
                '--object-rotation': rotation,
                '--object-duration': duration,
                '--object-direction': index % 2 === 0 ? 1 : -1,
              }}
            >
              <Icon size={28} strokeWidth={2.2} />
              <span />
              <span />
            </div>
          ),
        )}
      </div>
      <div className="animation-layer" aria-hidden="true">
        <div className="signal-stack">
          <span />
          <span />
          <span />
        </div>
        <div className="trail-system">
          {lightTrails.map(([left, top, rotate, delay, duration, tone]) => (
            <span
              className={`light-trail light-trail-${tone}`}
              key={`${left}-${top}`}
              style={{
                '--trail-left': left,
                '--trail-top': top,
                '--trail-rotate': rotate,
                '--trail-delay': delay,
                '--trail-duration': duration,
              }}
            />
          ))}
        </div>
        <div className="shape-system">
          {energyShapes.map(([left, top, form, tone, delay, rotate, duration]) => (
            <span
              className={`energy-shape energy-shape-${form} energy-shape-${tone}`}
              key={`${left}-${top}-${form}`}
              style={{
                '--shape-left': left,
                '--shape-top': top,
                '--shape-delay': delay,
                '--shape-rotate': rotate,
                '--shape-duration': duration,
              }}
            />
          ))}
        </div>
      </div>
      <div className="background-cinema" aria-hidden="true">
        <div className="flow-lane flow-lane-one">
          <span />
          <span />
          <span />
        </div>
        <div className="flow-lane flow-lane-two">
          <span />
          <span />
          <span />
        </div>
        <div className="flow-lane flow-lane-three">
          <span />
          <span />
          <span />
        </div>
        {flowTiles.map(([left, top, delay, tone, rotate, duration]) => (
          <span
            className={`flow-tile flow-tile-${tone}`}
            key={`${left}-${top}`}
            style={{
              '--tile-left': left,
              '--tile-top': top,
              '--tile-delay': delay,
              '--tile-rotate': rotate,
              '--tile-duration': duration,
            }}
          />
        ))}
      </div>

      <div className="card-shell">
        <div className="orbit-lines" aria-hidden="true">
          <span />
          <span />
        </div>

        <section className="invite-card">
          <div className="card-glow" aria-hidden="true" />
          <div className="spark-burst" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="invite-card__header">
            <div className="eyebrow">
              <Sparkles size={16} strokeWidth={2.4} aria-hidden="true" />
              <span>You're invited</span>
            </div>
            <div className="status-chip">
              <span className="status-dot" aria-hidden="true" />
              Team sync
            </div>
          </div>

          <div className="headline-wrap">
            <Stars className="headline-star" size={34} strokeWidth={1.8} />
            <h1>
              Team <span>Meeting</span>
            </h1>
            <div className="beat-bars" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>

          <p className="intro">
            A bright little checkpoint for updates, alignment, and good energy.
            Please make sure to join on time.
          </p>

          <div className="details" id="details">
            {details.map(({ icon: Icon, label, value }) => (
              <article className="detail-row" key={label}>
                <div className="detail-icon">
                  <Icon size={21} strokeWidth={2.2} aria-hidden="true" />
                </div>
                <div>
                  <p>{label}</p>
                  <strong>{value}</strong>
                </div>
              </article>
            ))}
          </div>

          <div className="reminder">
            <BellRing size={20} strokeWidth={2.3} aria-hidden="true" />
            <p>
              <strong>Don't be late!</strong>
              <span>See you soon, ready and cheerful.</span>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
