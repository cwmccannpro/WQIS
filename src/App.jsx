import { lazy, Suspense, useEffect, useState } from 'react'

const SceneCanvas = lazy(() => import('./SceneCanvas.jsx'))

const services = [
  {
    id: 'WQ-01',
    title: 'Welder qualification',
    summary: 'Performance tests witnessed at your facility, essential variables recorded, and WQTR documentation completed.',
    output: 'WQTR',
  },
  {
    id: 'PQ-02',
    title: 'Procedure qualification',
    summary: 'PQR testing coordinated from coupon preparation through examination, with supporting WPS documentation.',
    output: 'PQR / WPS',
  },
  {
    id: 'VT-03',
    title: 'Component inspection',
    summary: 'On-site visual inspection of welded parts and assemblies against drawings, specifications, and acceptance criteria.',
    output: 'VT REPORT',
  },
  {
    id: 'EX-04',
    title: 'Weld test examination',
    summary: 'Visual examination plus coordination of required destructive or nondestructive testing through trusted partners.',
    output: 'TEST RECORD',
  },
]

const markets = [
  ['Aerospace', 'AWS D17.1 experience for demanding flight applications'],
  ['Defense', 'Disciplined records for military and DOD programs'],
  ['Transportation', 'Repeatable qualification for production welding'],
  ['Medical', 'Traceable inspection for exacting components'],
  ['Commercial', 'Responsive support for regional fabricators'],
]

function Arrow() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5" /></svg>
}

function Logo() {
  return (
    <span className="logo-lockup text-logo">
      <strong>WQIS</strong>
      <small>Welding Qualification<br />&amp; Inspection Services</small>
    </span>
  )
}

function useExperienceMotion() {
  useEffect(() => {
    const root = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const items = [...document.querySelectorAll('[data-reveal]')]

    if (reduced) {
      items.forEach((item) => item.classList.add('is-visible'))
      root.style.setProperty('--page-progress', '0')
      return undefined
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' })

    items.forEach((item) => observer.observe(item))

    let frame = 0
    const updateScroll = () => {
      frame = 0
      const available = document.documentElement.scrollHeight - window.innerHeight
      const progress = available > 0 ? window.scrollY / available : 0
      root.style.setProperty('--page-progress', progress.toFixed(4))
      root.style.setProperty('--parallax-y', `${Math.min(window.scrollY, window.innerHeight * 1.5)}px`)
    }
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateScroll)
    }
    updateScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [formReady, setFormReady] = useState(false)
  const [loaderMinimumElapsed, setLoaderMinimumElapsed] = useState(false)
  const [loaderDismissed, setLoaderDismissed] = useState(false)
  useExperienceMotion()

  useEffect(() => {
    const close = (event) => event.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  useEffect(() => {
    const minimumTimer = window.setTimeout(() => setLoaderMinimumElapsed(true), 900)
    const fallbackTimer = window.setTimeout(() => setLoaderDismissed(true), 4000)

    return () => {
      window.clearTimeout(minimumTimer)
      window.clearTimeout(fallbackTimer)
    }
  }, [])

  useEffect(() => {
    if (loaderMinimumElapsed && sceneReady) setLoaderDismissed(true)
  }, [loaderMinimumElapsed, sceneReady])

  useEffect(() => {
    document.body.classList.toggle('is-loading', !loaderDismissed)
    return () => document.body.classList.remove('is-loading')
  }, [loaderDismissed])

  return (
    <div className="site-shell" aria-busy={!loaderDismissed}>
      <div className={loaderDismissed ? 'site-loader is-complete' : 'site-loader'} role="status" aria-label="Loading WQIS website">
        <div className="site-loader-inner">
          <strong>WQIS</strong>
          <div className="site-loader-track" aria-hidden="true"><span /></div>
        </div>
      </div>
      <div className="scroll-progress" aria-hidden="true"><span /></div>

      <div className="utility-bar">
        <span>Rochester, New York</span>
        <div><span>AWS CWI</span><span>Visual Level II</span><span>On-site service</span></div>
      </div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="WQIS home"><Logo /></a>
        <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="Primary navigation">
          <a href="#services" onClick={() => setMenuOpen(false)}>Solutions</a>
          <a href="#standards" onClick={() => setMenuOpen(false)}>Standards</a>
          <a href="#process" onClick={() => setMenuOpen(false)}>Process</a>
          <a href="#markets" onClick={() => setMenuOpen(false)}>Markets</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
        </nav>
        <a className="quote-link" href="#contact">Request inspection <Arrow /></a>
        <button className="menu-toggle" type="button" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /></button>
      </header>

      <main id="main">
        <section className="hero snap-panel" id="top">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-copy">
            <p className="eyebrow reveal" data-reveal>Welding Qualification and Inspection Services</p>
            <h1 className="reveal reveal-title" data-reveal>
              <span className="title-primary"><b>Engineering</b><b>confidence</b></span>
              <em>in every weld.</em>
            </h1>
          </div>

          <div className="hero-visual" aria-label="A digital weld gauge assembling and seating onto a welded inspection coupon as the page scrolls">
            <div className={sceneReady ? 'scene-loader is-ready' : 'scene-loader'}><i /><span>Loading inspection instrument</span></div>
            <Suspense fallback={null}>
              <SceneCanvas onReady={() => setSceneReady(true)} />
            </Suspense>
          </div>

          <div className="hero-support reveal" data-reveal>
            <ul className="hero-points">
              <li><strong>Certified inspection</strong><span>AWS CWI and Visual Level II field judgment.</span></li>
              <li><strong>Qualification testing</strong><span>Witnessing and examination at your facility.</span></li>
              <li><strong>Code-ready records</strong><span>WPS, PQR, WQTR, and inspection documentation.</span></li>
            </ul>
            <div className="hero-actions hero-actions-mobile">
              <a className="button button-primary" href="#contact">Start a project <Arrow /></a>
              <a className="text-link" href="#services">Explore capabilities <span>↓</span></a>
            </div>
          </div>

          <div className="hero-metrics reveal" data-reveal>
            <div><strong>75+</strong><span>Years in the welding business</span></div>
            <div><strong>35</strong><span>Years of certified inspection experience</span></div>
            <div><strong>AWS</strong><span>Certified Welding Inspectors</span></div>
            <div><strong>VT II</strong><span>ASNT SNT-TC-1A qualified</span></div>
          </div>

          <div className="hero-actions hero-actions-desktop reveal" data-reveal>
            <a className="button button-primary" href="#contact">Start a project <Arrow /></a>
            <a className="text-link" href="#services">Explore capabilities <span>↓</span></a>
          </div>
        </section>

        <section className="code-rail" aria-label="Inspection result and qualification standards">
          <span className="inspection-status"><i />Inspection complete <b>6.24 mm</b></span>
          <div><strong>AWS D1.1</strong><strong>AWS D1.2</strong><strong>AWS D17.1</strong><strong>API 1104</strong><strong>ASNT SNT-TC-1A</strong></div>
        </section>

        <section className="solutions snap-panel" id="services">
          <div className="services-handoff" aria-label="Inspection result routed to services">
            <span>01 / MEASURE</span><i /><strong>6.24 mm captured</strong><i /><span>02 / QUALIFY + DOCUMENT</span>
          </div>
          <div className="section-heading reveal" data-reveal>
            <p className="eyebrow">Integrated services</p>
            <h2>From qualification<br />to <em>verified result.</em></h2>
            <p>One focused partner for witnessing, inspection, examination coordination, and the documentation that closes the loop.</p>
          </div>
          <div className="solutions-list">
            {services.map((service, index) => (
              <article className="solution reveal" data-reveal style={{ '--delay': `${index * 85}ms` }} key={service.id}>
                <span className="solution-id">{service.id}</span>
                <div><h3>{service.title}</h3><p>{service.summary}</p></div>
                <span className="solution-output">OUTPUT <strong>{service.output}</strong></span>
                <a href="#contact" aria-label={`Discuss ${service.title}`}><Arrow /></a>
              </article>
            ))}
          </div>
        </section>

        <section className="standards snap-panel" id="standards">
          <div className="scan-field" aria-hidden="true">
            <div className="orbit orbit-a" /><div className="orbit orbit-b" />
            <div className="document-stack">
              <div className="doc doc-back"><span>PQR / 24-018</span></div>
              <div className="doc doc-front">
                <div className="doc-head"><span>WQIS</span><small>Inspection record</small></div>
                <div className="doc-lines"><i /><i /><i /><i /></div>
                <strong>ACCEPTED</strong>
              </div>
            </div>
            <div className="scan-beam" />
          </div>
          <div className="standards-copy reveal" data-reveal>
            <p className="eyebrow">Code fluency</p>
            <h2>Evidence engineered<br />for <em>the requirement.</em></h2>
            <p>WQIS pairs field judgment with controlled documentation. The governing edition, contract documents, essential variables, and acceptance criteria are aligned before work begins.</p>
            <ul>
              <li><strong>AWS D1.1</strong><span>Structural steel</span></li>
              <li><strong>AWS D1.2</strong><span>Structural aluminum</span></li>
              <li><strong>AWS D17.1</strong><span>Aerospace fusion welding</span></li>
              <li><strong>API 1104</strong><span>Pipeline welding</span></li>
              <li><strong>ASNT SNT-TC-1A</strong><span>Visual Inspection Level II</span></li>
            </ul>
          </div>
        </section>

        <section className="process snap-panel" id="process">
          <div className="section-heading compact reveal" data-reveal>
            <p className="eyebrow">Controlled progression</p>
            <h2>Four checkpoints.<br /><em>One clear record.</em></h2>
          </div>
          <ol className="process-track">
            <li className="reveal" data-reveal><span>01</span><i /><strong>Align</strong><p>Confirm code, material, process, position, and deliverable.</p></li>
            <li className="reveal" data-reveal style={{ '--delay': '80ms' }}><span>02</span><i /><strong>Witness</strong><p>Observe qualification testing or inspect production work on site.</p></li>
            <li className="reveal" data-reveal style={{ '--delay': '160ms' }}><span>03</span><i /><strong>Examine</strong><p>Verify visual acceptance and coordinate any additional testing.</p></li>
            <li className="reveal" data-reveal style={{ '--delay': '240ms' }}><span>04</span><i /><strong>Document</strong><p>Deliver WPS, PQR, WQTR, or inspection records your team can use.</p></li>
          </ol>
        </section>

        <section className="markets snap-panel" id="markets">
          <div className="markets-intro reveal" data-reveal>
            <p className="eyebrow">Markets served</p>
            <h2>Built for demanding<br /><em>environments.</em></h2>
            <p>Deep welding and inspection experience, applied with the pace and discipline each program requires.</p>
          </div>
          <div className="market-grid">
            {markets.map(([name, description], index) => (
              <article className="market reveal" data-reveal style={{ '--delay': `${index * 70}ms` }} key={name}>
                <span>0{index + 1}</span><h3>{name}</h3><p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about snap-panel" id="about">
          <div className="about-statement reveal" data-reveal>
            <p className="eyebrow">The practical advantage</p>
            <h2>Inspectors who know<br /><em>how the weld is made.</em></h2>
          </div>
          <div className="about-copy reveal" data-reveal>
            <p>WQIS was shaped by decades in the Rochester welding industry—first as welders, then as AWS Certified Welding Inspectors. That dual perspective creates better conversations on the floor and clearer answers for the people responsible for quality.</p>
            <div className="about-proof"><span><strong>100%</strong>Visual Level II inspectors</span><span><strong>Local</strong>Rochester-area field support</span></div>
          </div>
        </section>

        <section className="contact snap-panel" id="contact">
          <div className="contact-copy reveal" data-reveal>
            <p className="eyebrow">Start with the requirement</p>
            <h2>Bring us the<br /><em>next joint.</em></h2>
            <p>Tell us what you are qualifying or inspecting. We’ll help define the right path, records, and next practical step.</p>
            <span>Rochester, NY + surrounding region</span>
          </div>
          <form className="inquiry-form reveal" data-reveal onSubmit={(event) => { event.preventDefault(); setFormReady(true) }}>
            <label><span>Name / company</span><input name="name" autoComplete="name" required /></label>
            <label><span>Work email</span><input type="email" name="email" autoComplete="email" required /></label>
            <label className="form-wide"><span>Service</span>
              <select name="service" defaultValue="">
                <option value="" disabled>Select a service</option>
                <option>Welder qualification / WQTR</option><option>Procedure qualification / PQR</option><option>Component inspection</option><option>Weld test examination</option><option>Not sure yet</option>
              </select>
            </label>
            <label className="form-wide"><span>Project details</span><textarea name="details" rows="3" /></label>
            <button className="button button-primary form-wide" type="submit">Prepare request <Arrow /></button>
            {formReady && <p className="form-status form-wide" role="status">Request captured in this prototype. Connect the production endpoint before launch.</p>}
          </form>
        </section>
      </main>

      <footer>
        <a className="brand" href="#top"><Logo /></a>
        <p>Welding Qualification and Inspection Services<br />Rochester, New York</p>
        <div><a href="#services">Solutions</a><a href="#standards">Standards</a><a href="#contact">Contact</a></div>
        <small>© {new Date().getFullYear()} WQIS</small>
      </footer>
    </div>
  )
}

export default App
