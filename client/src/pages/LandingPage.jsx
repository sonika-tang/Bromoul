import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import styles from './LandingPage.module.css';

/* ── Icons (inline SVG, stroke-based, friendly) ───────────────── */
const Icon = {
    Arrow: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.btnIcon}>
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
    ),
    Store: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l1-5h16l1 5" /><path d="M4 9v11a1 1 0 001 1h14a1 1 0 001-1V9" /><path d="M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0" /><path d="M9 21v-6h6v6" />
        </svg>
    ),
    Chart: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" /><rect x="7" y="11" width="3" height="7" rx="1" /><rect x="12" y="7" width="3" height="11" rx="1" /><rect x="17" y="13" width="3" height="5" rx="1" />
        </svg>
    ),
    Chat: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
    ),
    Tag: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
    ),
    Verified: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 1.8 3 .2.2 3L19.4 9 21 12l-1.6 3-.8 2.8-3 .2L12 20l-2.4-1.8-3-.2-.2-3L4.6 12 6 9l.8-2.8 3-.2z" /><polyline points="9 12 11 14 15 10" />
        </svg>
    ),
    Layers: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
        </svg>
    ),
    Bulb: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 00-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0012 2z" />
        </svg>
    ),
    Cross: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" />
        </svg>
    ),
    Check: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    Leaf: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6" />
        </svg>
    ),
};

/* ── Data ─────────────────────────────────────────────────────── */
const problems = [
    { title: 'ដាំមិនត្រូវតម្រូវការទីផ្សារ', text: 'កសិករដាំដំណាំដែលមិនត្រូវនឹងតម្រូវការទីផ្សារ ធ្វើឱ្យផលិតផលដាំលើស និងធ្លាក់ថ្លៃ។' },
    { title: 'ពឹងលើឈ្មួញកណ្តាល', text: 'ឈ្មួញកណ្តាល និងតម្លៃមិនយុត្តិធម៌ កាត់បន្ថយប្រាក់ចំណេញរបស់កសិករ។' },
    { title: 'ខ្វះព័ត៌មានទីផ្សារ', text: 'កសិករមិនអាចដឹងពីនិន្នាការទីផ្សារ និងតម្រូវការពិតប្រាកដ។' },
];

const solutions = [
    {
        tag: 'ផ្សារ · Psar',
        icon: <Icon.Store />,
        title: 'ទីផ្សារភ្ជាប់កសិករ និងផ្សារទំនើប',
        text: 'លក់ផលិតផលរបស់អ្នកដោយផ្ទាល់ទៅផ្សារទំនើបដូចជា Chip Mong, AEON MaxValu និង Lucky ដោយគ្មានឈ្មួញកណ្តាល។',
        to: '/psar',
        cta: 'ចូលទីផ្សារ',
        accent: '#4CAF50',
        bg: 'linear-gradient(135deg, #e8f5e9, #f1f8f1)',
    },
    {
        tag: 'វិភាគ · Vipheak',
        icon: <Icon.Chart />,
        title: 'ការវិភាគទិន្នន័យសម្រាប់ការដាំដុះឆ្លាតវៃ',
        text: 'ដឹងពីអ្វីដែលផ្សារទំនើបត្រូវការ តាមរយៈទិន្នន័យពិតប្រាកដ ដើម្បីសម្រេចចិត្តដាំដុះបានត្រឹមត្រូវ។',
        to: '/vipheak',
        cta: 'មើលការវិភាគ',
        accent: '#2196F3',
        bg: 'linear-gradient(135deg, #e3f2fd, #f0f8ff)',
    },
];

const journey = [
    { before: 'ដាំដំណាំមិនត្រូវនឹងតម្រូវការទីផ្សារ', after: 'យល់ពីតម្រូវការទីផ្សារតាមទិន្នន័យផ្សារទំនើប' },
    { before: 'ឈ្មួញកណ្តាល និងតម្លៃមិនយុត្តិធម៌', after: 'ប្រមូល កាត់បន្ថយការពឹងផ្អែកលើឈ្មួញកណ្តាល' },
    { before: 'ខ្ជះខ្ជាយពេលវេលា ខ្វះទីផ្សារជឿជាក់', after: 'ភ្ជាប់ផ្ទាល់ជាមួយផ្សារទំនើប ដំណើរការងាយស្រួល' },
];

const values = [
    { icon: <Icon.Tag />, title: 'តម្លៃ', text: 'តម្លៃច្បាស់លាស់ យុត្តិធម៌' },
    { icon: <Icon.Verified />, title: 'ព័ត៌មានបានផ្ទៀងផ្ទាត់', text: 'ទិន្នន័យទីផ្សារពិតប្រាកដ' },
    { icon: <Icon.Layers />, title: 'មុខងារពេញលេញ', text: 'ផ្សារ វិភាគ និងសារ' },
    { icon: <Icon.Bulb />, title: 'សម្រេចចិត្តត្រឹមត្រូវ', text: 'ផ្អែកលើទិន្នន័យ' },
];

const impacts = [
    'បង្កើនចំណូល និងជីវភាពកសិករ',
    'ការភ្ជាប់ទីផ្សារ',
    'ទទួលបានព័ត៌មានថ្មីៗទាក់ទងនឹងទីផ្សារ',
    'កាត់បន្ថយការខ្ជះខ្ជាយ និងផលិតផលលើស',
];

const partners = ['Chip Mong', 'AEON MaxValu', 'Lucky', 'Bayon Market', 'Super Duper', 'Olympic'];

const crops = [
    { name: 'ត្រសក់' },
    { name: 'ប៉េងប៉ោះ' },
    { name: 'ខ្ញី' },
    { name: 'ឆៃថាវ' },
    { name: 'ល្ពៅ'},
];

const LandingPage = () => {
    return (
        <div className={styles.landing}>

            {/* ── Hero ───────────────────────────────────────────── */}
            <section className={styles.hero}>
                <div className={styles.heroBg} aria-hidden="true">
                    <div className={styles.blob1} />
                    <div className={styles.blob2} />
                    <span className={`${styles.floatLeaf} ${styles.leaf1}`}>🌿</span>
                    <span className={`${styles.floatLeaf} ${styles.leaf2}`}>🍃</span>
                    <span className={`${styles.floatLeaf} ${styles.leaf3}`}>🌱</span>
                </div>
                <div className={`container ${styles.heroInner}`}>
                    <div className={styles.pill}>
                        <span className={styles.pillDot} />
                        ប្រព័ន្ធផ្សារកសិកម្មដំបូងគេនៅកម្ពុជា
                    </div>
                    <h1 className={styles.heroTitle}>
                        កន្លែងដែលកសិកម្មកម្ពុជា
                        <br />
                        <span className={styles.titleAccent}>ជួបតម្រូវការទីផ្សារពិតប្រាកដ</span>
                    </h1>
                    <p className={styles.heroSub}>
                        ភ្ជាប់ទំនាក់ទំនងផ្ទាល់ជាមួយផ្សារទំនើប ដោយគ្មានឈ្មួញកណ្តាល។
                        លក់បានតម្លៃល្អ ដឹងតម្រូវការទីផ្សារ និងបង្កើនចំណូលរបស់អ្នក។
                    </p>
                    <div className={styles.heroActions}>
                        <Link to="/psar" className={styles.btnPrimary}>
                            ចូលទីផ្សារ <Icon.Arrow />
                        </Link>
                        <Link to="/vipheak" className={styles.btnOutline}>
                            មើលតម្រូវការទីផ្សារ
                        </Link>
                    </div>
                    <div className={styles.stats}>
                        <div className={styles.stat}><strong>១០០ពាន់+</strong><span>កសិករគោលដៅ</span></div>
                        <div className={styles.statLine} />
                        <div className={styles.stat}><strong>២៤ ខេត្ត</strong><span>គ្របដណ្តប់</span></div>
                        <div className={styles.statLine} />
                        <div className={styles.stat}><strong>៦ ផ្សារ</strong><span>ដៃគូទំនើប</span></div>
                    </div>
                </div>
                <div className={styles.heroCrops}>
                    {crops.map((c, i) => (
                        <div key={c.name} className={styles.cropChip} style={{ animationDelay: `${i * 0.15}s` }}>
                            {c.name}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Problem ────────────────────────────────────────── */}
            <section className={styles.problem}>
                <div className="container">
                    <Reveal className={styles.sectionHead}>
                        <p className={styles.sectionTag} style={{ color: '#e65100', background: 'rgba(255,152,0,0.1)' }}>បញ្ហា</p>
                        <h2 className={styles.sectionTitle}>កសិករកម្ពុជានៅតែជួបការលំបាក</h2>
                        <p className={styles.sectionSub}>បញ្ហាដែលយើងដោះស្រាយគឺ ការដាំដំណាំដែលមិនត្រូវតាមតម្រូវការទីផ្សារ</p>
                    </Reveal>
                    <div className={styles.problemGrid}>
                        {problems.map((p, i) => (
                            <Reveal key={p.title} delay={i * 120} className={styles.problemCard}>
                                <h3 className={styles.problemTitle}>{p.title}</h3>
                                <p className={styles.problemText}>{p.text}</p>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Solution (Psar + Vipheak) ──────────────────────── */}
            <section className={styles.solution}>
                <div className="container">
                    <Reveal className={styles.sectionHead}>
                        <p className={styles.sectionTag}>ដំណោះស្រាយ</p>
                        <h2 className={styles.sectionTitle}>ប្រមូល - ផ្សារ និង វិភាគ</h2>
                        <p className={styles.sectionSub}>កន្លែងដែលជួយកសិករកម្ពុជា</p>
                    </Reveal>
                    <div className={styles.solutionGrid}>
                        {solutions.map((s, i) => (
                            <Reveal key={s.tag} delay={i * 140} className={styles.solutionCard} style={{ background: s.bg }}>
                                <div className={styles.solutionIcon} style={{ color: s.accent }}>{s.icon}</div>
                                <span className={styles.solutionTag} style={{ color: s.accent }}>{s.tag}</span>
                                <h3 className={styles.solutionTitle}>{s.title}</h3>
                                <p className={styles.solutionText}>{s.text}</p>
                                <Link to={s.to} className={styles.solutionLink} style={{ color: s.accent }}>
                                    {s.cta} <Icon.Arrow />
                                </Link>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Before / After ─────────────────────────────────── */}
            <section className={styles.journey}>
                <div className="container">
                    <Reveal className={styles.sectionHead}>
                        <p className={styles.sectionTag}>ដំណើរផ្លាស់ប្តូរ</p>
                        <h2 className={styles.sectionTitle}>ជីវិតកសិករ ប្រែប្រួលជាមួយ ប្រមូល</h2>
                    </Reveal>
                    <div className={styles.journeyGrid}>
                        <Reveal className={`${styles.journeyCol} ${styles.journeyBefore}`}>
                            <div className={styles.journeyColHead}>
                                <span className={styles.journeyBadge} style={{ background: 'rgba(211,47,47,0.1)', color: '#d32f2f' }}>មុនពេលប្រើ</span>
                                <h3>បទពិសោធន៍កសិករបច្ចុប្បន្ន</h3>
                            </div>
                            {journey.map((j) => (
                                <div key={j.before} className={styles.journeyRow}>
                                    <span className={styles.journeyIconBad}><Icon.Cross /></span>
                                    {j.before}
                                </div>
                            ))}
                        </Reveal>
                        <Reveal delay={140} className={`${styles.journeyCol} ${styles.journeyAfter}`}>
                            <div className={styles.journeyColHead}>
                                <span className={styles.journeyBadge} style={{ background: 'rgba(76,175,80,0.15)', color: '#2e7d32' }}>ជាមួយ ប្រមូល</span>
                                <h3>ដំណើរការឆ្លាតវៃជាងមុន</h3>
                            </div>
                            {journey.map((j) => (
                                <div key={j.after} className={styles.journeyRow}>
                                    <span className={styles.journeyIconGood}><Icon.Check /></span>
                                    {j.after}
                                </div>
                            ))}
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ── Value Proposition ──────────────────────────────── */}
            <section className={styles.values}>
                <div className="container">
                    <Reveal className={styles.sectionHead}>
                        <p className={styles.sectionTag}>គុណតម្លៃ</p>
                        <h2 className={styles.sectionTitle}>ហេតុអ្វីជ្រើសរើស ប្រមូល?</h2>
                    </Reveal>
                    <div className={styles.valueGrid}>
                        {values.map((v, i) => (
                            <Reveal key={v.title} delay={i * 100} className={styles.valueCard}>
                                <div className={styles.valueIcon}>{v.icon}</div>
                                <h3 className={styles.valueTitle}>{v.title}</h3>
                                <p className={styles.valueText}>{v.text}</p>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Social Impact ──────────────────────────────────── */}
            <section className={styles.impact}>
                <div className={styles.impactBg} aria-hidden="true">
                    <span className={`${styles.floatLeaf} ${styles.impactLeaf1}`}>🌿</span>
                    <span className={`${styles.floatLeaf} ${styles.impactLeaf2}`}>🍃</span>
                </div>
                <div className={`container ${styles.impactInner}`}>
                    <Reveal className={styles.impactText}>
                        <p className={styles.sectionTag} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>ផលប៉ះពាល់សង្គម</p>
                        <h2 className={styles.impactTitle}>ច្រើនជាងជំនួញ — យើងផ្លាស់ប្តូរជីវភាព</h2>
                        <p className={styles.impactSub}>ប្រមូល បង្កើតឡើងដើម្បីលើកស្ទួយកសិករកម្ពុជា និងសន្តិសុខស្បៀងជាតិ។</p>
                    </Reveal>
                    <div className={styles.impactList}>
                        {impacts.map((text, i) => (
                            <Reveal key={text} delay={i * 90} className={styles.impactItem}>
                                <span className={styles.impactCheck}><Icon.Leaf /></span>
                                {text}
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Partners ───────────────────────────────────────── */}
            <section className={styles.partners}>
                <div className="container">
                    <Reveal className={styles.partnersHead}>
                        <p className={styles.sectionSub} style={{ margin: 0 }}>ដៃគូផ្សារទំនើបដែលជឿទុកចិត្ត</p>
                    </Reveal>
                    <Reveal delay={120} className={styles.partnerLogos}>
                        {partners.map((p) => (
                            <span key={p} className={styles.partnerLogo}>{p}</span>
                        ))}
                    </Reveal>
                </div>
            </section>

            {/* ── CTA ────────────────────────────────────────────── */}
            <section className={styles.cta}>
                <div className={`container ${styles.ctaInner}`}>
                    <Reveal>
                        <h2 className={styles.ctaTitle}>ត្រៀមលក់ផលិតផលរបស់អ្នកហើយឬនៅ?</h2>
                        <p className={styles.ctaSub}>ចូលរួមជាមួយកសិករកម្ពុជា ដែលលក់ដោយផ្ទាល់ទៅផ្សារទំនើប តាមរយៈ ប្រមូល</p>
                        <Link to="/psar" className={styles.btnPrimaryLarge}>
                            ចាប់ផ្តើមឥឡូវនេះ <Icon.Arrow />
                        </Link>
                    </Reveal>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;
