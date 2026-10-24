import { useEffect, useRef, useState } from 'react';
import { brand, categories } from './config';
import { search, trending } from './lib/giphy';
function Header() {
  const [o, setO] = useState(false);
  return (
    <header className="header">
      <a className="brand" href="/">
        <i>✦</i>
        {brand.name}
      </a>
      <button className="menu" onClick={() => setO(!o)} aria-expanded={o}>
        ☰<span className="sr">Menu</span>
      </button>
      <nav className={o ? 'open' : ''}>
        <a href="/">Discover</a>
        <a href="/#trending">Trending</a>
        <a href="/#categories">Categories</a>
        <a href="/about">About</a>
      </nav>
    </header>
  );
}
function Footer() {
  return (
    <footer>
      <a className="brand" href="/">
        <i>✦</i>
        {brand.name}
      </a>
      <p>A thoughtful place to find the perfect GIF for the moment.</p>
      <nav>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
        <a href="/privacy-policy">Privacy</a>
        <a href="/terms">Terms</a>
      </nav>
      <small>
        Third-party media is supplied by GIPHY. Results are visibly attributed to GIPHY.
      </small>
    </footer>
  );
}
function Card({ x }) {
  const [n, setN] = useState('');
  const link = x.url;
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: x.title, url: link });
      else {
        await navigator.clipboard.writeText(link);
        setN('Link copied');
      }
    } catch {
      setN('Could not share');
    }
  }
  return (
    <article className="card">
      <a href={link} target="_blank" rel="noopener noreferrer">
        <img src={x.preview} width={x.width} height={x.height} loading="lazy" alt={x.title} />
      </a>
      <div>
        <b>{x.title}</b>
        <span>
          <button onClick={share}>↗ Share</button>
          <a
            href={x.original || x.preview}
            target="_blank"
            rel="noopener noreferrer"
            download={`${x.id || 'meme-muse-gif'}.gif`}
            aria-label={`Download ${x.title}`}
          >
            ↓ Download
          </a>
        </span>
        <em className="sr" aria-live="polite">
          {n}
        </em>
      </div>
    </article>
  );
}
function Grid({ data, loading, error, retry }) {
  if (loading)
    return (
      <div className="grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div className="skeleton" key={i} />
        ))}
      </div>
    );
  if (error)
    return (
      <section className="notice">
        <h3>We couldn’t load memes</h3>
        <p>{error}</p>
        <button onClick={retry}>Try again</button>
      </section>
    );
  if (!data.length)
    return (
      <section className="notice">
        <h3>No memes found yet</h3>
        <p>Try a broader search or a category above.</p>
      </section>
    );
  return (
    <>
      <div className="grid">
        {data.map((x) => (
          <Card x={x} key={x.id} />
        ))}
      </div>
      <p className="attribution">Powered by GIPHY</p>
    </>
  );
}
function Info({ kind }) {
  const c = {
    about: [
      'About MemeMuse',
      'MemeMuse makes it simpler to discover expressive, shareable GIFs for everyday conversations. Search is powered by GIPHY and every result keeps a link to its source. We do not claim ownership of third-party media.',
      'For rights or removal questions, contact ' + brand.contact + '.',
    ],
    privacy: [
      'Privacy Policy',
      'This draft should be reviewed for your jurisdiction before launch. GIPHY may process technical data when your browser requests search results. Hosting providers may retain standard logs. We do not provide user accounts or collect payment data.',
      'External links are governed by their own services. For privacy requests, contact ' +
        brand.contact +
        '.',
    ],
    terms: [
      'Terms & Conditions',
      'This draft needs legal review before launch. Use the service lawfully and respect creators’ rights. Third-party media remains subject to provider terms and applicable intellectual-property law.',
      'Do not misuse the service or claim ownership of third-party media. Contact ' +
        brand.contact +
        ' for removal requests.',
    ],
  }[kind];
  return (
    <main className="legal">
      <p className="eyebrow">INFORMATION</p>
      <h1>{c[0]}</h1>
      {c.slice(1).map((x) => (
        <p key={x}>{x}</p>
      ))}
      <small>Effective date: {brand.effectiveDate}</small>
    </main>
  );
}
function Contact() {
  const [f, setF] = useState({ name: '', email: '', subject: '', message: '' }),
    [m, setM] = useState('');
  function send(e) {
    e.preventDefault();
    if (Object.values(f).some((x) => !x)) {
      setM('Please complete every field.');
      return;
    }
    location.href = `mailto:${brand.contact}?subject=${encodeURIComponent(f.subject)}&body=${encodeURIComponent(`Name: ${f.name}\nEmail: ${f.email}\n\n${f.message}`)}`;
    setM('Your email app should open with this message.');
  }
  return (
    <main className="contact">
      <p className="eyebrow">GET IN TOUCH</p>
      <h1>Let’s make the internet more expressive.</h1>
      <p>This form opens your email app; it does not silently submit your details to a server.</p>
      <form onSubmit={send}>
        {['name', 'email', 'subject'].map((k) => (
          <label key={k}>
            {k[0].toUpperCase() + k.slice(1)}
            <input
              required
              type={k === 'email' ? 'email' : 'text'}
              value={f[k]}
              onChange={(e) => setF({ ...f, [k]: e.target.value })}
            />
          </label>
        ))}
        <label>
          Message
          <textarea
            required
            value={f.message}
            onChange={(e) => setF({ ...f, message: e.target.value })}
          />
        </label>
        <button>Open email app →</button>
        <span aria-live="polite">{m}</span>
      </form>
    </main>
  );
}
export default function App() {
  const path = location.pathname,
    slug = path.split('/')[2],
    cat = categories.find((x) => x[0] === slug),
    initial = new URLSearchParams(location.search).get('q') || cat?.[2] || '';
  const [q, setQ] = useState(initial),
    [data, setData] = useState([]),
    [load, setLoad] = useState(true),
    [error, setError] = useState(''),
    [offset, setOffset] = useState(0),
    [more, setMore] = useState(false),
    ctrl = useRef();
  const get = async (o = 0, term = q, add = false) => {
    ctrl.current?.abort();
    ctrl.current = new AbortController();
    setLoad(true);
    setError('');
    try {
      const r = term
        ? await search(term, o, ctrl.current.signal)
        : await trending(o, ctrl.current.signal);
      setData((old) => (add ? [...old, ...r.items] : r.items));
      setMore(r.more);
      setOffset(o);
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      setLoad(false);
    }
  };
  useEffect(() => {
    get(0, initial);
    document.title = cat ? `${cat[1]} memes | MemeMuse` : 'MemeMuse — Find the perfect reaction';
    return () => ctrl.current?.abort();
  }, [path]);
  function go(e, term) {
    e?.preventDefault();
    const t = (term ?? q).trim();
    setQ(t);
    history.pushState({}, '', t ? '/?q=' + encodeURIComponent(t) : '/');
    get(0, t);
  }
  let page =
    path === '/about' ? (
      <Info kind="about" />
    ) : path === '/privacy-policy' ? (
      <Info kind="privacy" />
    ) : path === '/terms' ? (
      <Info kind="terms" />
    ) : path === '/contact' ? (
      <Contact />
    ) : (
      <main>
        <section className="hero">
          <p className="eyebrow">THE RIGHT REACTION, RIGHT NOW</p>
          <h1>
            Find the meme that says it <em>better.</em>
          </h1>
          <p>Search a living library of expressive GIFs, then share the moment in one tap.</p>
          <form className="hero-search" onSubmit={go}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try “Monday mood”"
              maxLength="50"
              aria-label="Search the meme library"
            />
            <button type="submit">
              <span>Search</span>
              <span aria-hidden="true">→</span>
            </button>
          </form>
          <aside>
            Popular:{' '}
            {['laughing', 'side eye', 'mind blown', 'applause'].map((x) => (
              <button key={x} onClick={() => go(null, x)}>
                {x}
              </button>
            ))}
          </aside>
        </section>
        <section className="content" id="trending">
          <div className="heading">
            <div>
              <p className="eyebrow">{q ? 'SEARCH RESULTS' : 'FRESH FROM THE FEED'}</p>
              <h2>{q ? `Memes for “${q}”` : cat ? `${cat[1]} memes` : 'Trending reactions'}</h2>
            </div>
            {q && (
              <button
                className="clear"
                onClick={() => {
                  setQ('');
                  go(null, '');
                }}
              >
                Clear ×
              </button>
            )}
          </div>
          <Grid data={data} loading={load} error={error} retry={() => get()} />
          {more && !load && (
            <p className="center">
              <button className="load" onClick={() => get(offset + 20, q, true)}>
                Load more
              </button>
            </p>
          )}
        </section>
        <section className="cats" id="categories">
          <p className="eyebrow">BROWSE BY MOOD</p>
          <h2>Start somewhere specific.</h2>
          <div>
            {categories.map((c) => (
              <a key={c[0]} href={'/categories/' + c[0]}>
                <i>{c[3]}</i>
                <strong>{c[1]}</strong>
                <small>{c[2]}</small>
                <b>→</b>
              </a>
            ))}
          </div>
        </section>
      </main>
    );
  return (
    <>
      <Header />
      {page}
      <Footer />
    </>
  );
}
