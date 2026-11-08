import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowDown, ArrowRight, ArrowUpRight, BrainCircuit, Braces, Check,
  Code2, Cpu, Database, Github, GraduationCap, Layers3, Linkedin,
  Mail, Menu, MessageCircle, Mouse, Send, Sparkles, Terminal, X,
  Workflow, Zap
} from "lucide-react";
import "./styles.css";

/* ============================================================
   GitHub configuration
   ============================================================ */
const GITHUB_USERNAME = "seraphyx8-x";
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;
const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;

const skills = [
  { name: "Python", type: "LANGUAGE", note: "Automation · AI systems", icon: "Py", tone: "lime" },
  { name: "React", type: "FRONTEND", note: "Interfaces · Components", icon: "Re", tone: "purple" },
  { name: "JavaScript", type: "LANGUAGE", note: "Modern web experiences", icon: "JS", tone: "ink" },
  { name: "C", type: "LANGUAGE", note: "Core programming", icon: "C", tone: "lime" },
  { name: "Data Structures", type: "FOUNDATIONS", note: "Problem solving · DSA", icon: "{}", tone: "purple" },
  { name: "RAG systems", type: "AI ENGINEERING", note: "Retrieval · Knowledge", icon: "R", tone: "ink" },
  { name: "LLM fine-tuning", type: "AI ENGINEERING", note: "Model adaptation", icon: "AI", tone: "purple" },
  { name: "Chatbots", type: "AI PRODUCTS", note: "Conversational systems", icon: "✳", tone: "lime" }
];

const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } }
};

const projectVisuals = ["nexus", "campus", "nexora"];

/* ============================================================
   Helpers
   ============================================================ */
function getRepoIcon(language) {
  const lang = (language || "").toLowerCase();
  if (lang === "python") return <BrainCircuit size={23} />;
  if (lang === "javascript" || lang === "typescript") return <Code2 size={23} />;
  if (lang === "html" || lang === "css") return <Layers3 size={23} />;
  return <Braces size={23} />;
}

function Eyebrow({ children }) {
  return <div className="eyebrow"><span className="eyebrow-line" />{children}</div>;
}

function SectionTitle({ eyebrow, title, accent, text }) {
  return (
    <motion.div
      className="section-heading"
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2>{title} <span>{accent}</span></h2>
      {text && <p>{text}</p>}
    </motion.div>
  );
}

/* ============================================================
   RepoCard — maps a GitHub repo onto the existing card design
   ============================================================ */
function RepoCard({ repo, index }) {
  const visual = projectVisuals[index % projectVisuals.length];
  const displayNumber = String(index + 1).padStart(2, "0");
  const updatedDate = new Date(repo.updated_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric"
  });
  const language = repo.language || "Code";
  const topics = Array.isArray(repo.topics) ? repo.topics : [];
  const stars = typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0;

  return (
    <motion.a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`project-card ${visual}`}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, delay: (index % 6) * 0.08 }}
      aria-label={`Open ${repo.name} on GitHub`}
    >
      <div className="project-visual">
        <div className="visual-top">
          <span>BS / REPO-{displayNumber}</span>
          <span>{updatedDate.toUpperCase()}</span>
        </div>

        <div className="visual-center">
          <div className="visual-window">
            <div className="window-bar">
              <i /><i /><i />
              <span>{(repo.name || "repository").toLowerCase()}</span>
            </div>
            <div className="window-content">
              <div className="window-symbol">{getRepoIcon(repo.language)}</div>
              <div className="window-lines"><i /><i /><i /></div>
              <div className="window-chip">{language.toUpperCase()}</div>
            </div>
          </div>
          <div className="visual-decoration deco-one" />
          <div className="visual-decoration deco-two" />
        </div>

        <div className="visual-bottom">
          <span>★ {stars}</span>
          <span>↗</span>
        </div>
      </div>

      <div className="project-info">
        <div className="project-number">
          {displayNumber} <span>—</span> {language.toUpperCase()}
        </div>
        <h3>{repo.name}</h3>
        <p>{repo.description || "No description provided yet."}</p>
        <div className="tag-row">
          {topics.slice(0, 3).map((topic) => (
            <span key={topic}>{topic}</span>
          ))}
          {topics.length === 0 && <span>{language}</span>}
        </div>
        <span className="project-arrow"><ArrowUpRight size={20} /></span>
      </div>
    </motion.a>
  );
}

/* ============================================================
   App
   ============================================================ */
function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState("idle");
  const [formMessage, setFormMessage] = useState("");

  const [repos, setRepos] = useState([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [reposError, setReposError] = useState("");
  const [reposReloadKey, setReposReloadKey] = useState(0);

  const { scrollYProgress } = useScroll();
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const closeMenu = () => setMenuOpen(false);

  const links = [
    ["About", "#about"],
    ["Expertise", "#expertise"],
    ["Projects", "#projects"],
    ["Journey", "#journey"],
    ["Contact", "#contact"]
  ];

  /* ---- Fetch public GitHub repos ---- */
  useEffect(() => {
    const controller = new AbortController();

    const fetchRepos = async () => {
      setReposLoading(true);
      setReposError("");

      try {
        const response = await fetch(GITHUB_API_URL, {
          signal: controller.signal,
          headers: { Accept: "application/vnd.github+json" }
        });

        if (!response.ok) {
          if (response.status === 403 || response.status === 429) {
            throw new Error(
              "GitHub API rate limit reached. Please try again in a few minutes."
            );
          }
          if (response.status === 404) {
            throw new Error("GitHub profile not found. Please check the username.");
          }
          throw new Error("Unable to load repositories right now. Please try again later.");
        }

        const data = await response.json();
        const publicRepos = Array.isArray(data) ? data : [];

        const filtered = publicRepos
          .filter((repo) => !repo.fork)
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        setRepos(filtered);
      } catch (err) {
        if (err.name === "AbortError") return;
        setReposError(err.message || "Something went wrong while loading repositories.");
      } finally {
        setReposLoading(false);
      }
    };

    fetchRepos();
    return () => controller.abort();
  }, [reposReloadKey]);

  const handleContactSubmit = async (event) => {
    event.preventDefault();

    if (formStatus === "sending") return;

    setFormStatus("sending");
    setFormMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/mwlljdyp", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });

      if (response.ok) {
        setFormStatus("success");
        setFormMessage("Your message has been sent successfully. I'll get back to you soon!");
        form.reset();
      } else {
        const result = await response.json().catch(() => null);
        setFormStatus("error");
        setFormMessage(
          result?.errors?.map((error) => error.message).join(", ") ||
          "Something went wrong. Please try again."
        );
      }
    } catch (error) {
      setFormStatus("error");
      setFormMessage("Unable to send your message right now. Please check your internet connection and try again.");
    }
  };

  return (
    <div className="site-shell">
      <motion.div className="scroll-progress" style={{ scaleX: progressScale }} />

      <header className="topbar">
        <a className="brand" href="#home" onClick={closeMenu} aria-label="Baljinder Singh home">
          <span className="brand-mark"><Code2 size={19} /></span>
          <span>baljinder<span className="brand-dot">.</span></span>
        </a>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          {links.map(([label, href]) => (
            <a key={href} href={href} onClick={closeMenu}>{label}</a>
          ))}
        </nav>

        <a className="nav-cta" href="#contact">
          Let's talk <ArrowUpRight size={15} />
        </a>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main>
        {/* ---------- HERO (unchanged) ---------- */}
        <section className="hero section-wrap" id="home">
          <div className="hero-copy">
            <motion.div
              className="availability"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .15 }}
            >
              <span className="availability-dot" /> SOFTWARE ENGINEER IN THE MAKING
            </motion.div>

            <motion.p
              className="hero-kicker"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: .25 }}
            >
              HELLO, I'M BALJINDER
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .8, delay: .2 }}
            >
              I build things<br />that make <span className="serif-accent">sense.</span>
            </motion.h1>

            <motion.p
              className="hero-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .38 }}
            >
              Software engineering, thoughtful design, and a little obsession with making AI genuinely useful.
            </motion.p>

            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .5 }}
            >
              <a className="button button-dark" href="#projects">
                Explore my work <ArrowUpRight size={16} />
              </a>
              <a className="text-link" href="#about">
                A little about me <ArrowDown size={15} />
              </a>
            </motion.div>

            <motion.div
              className="hero-footnote"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: .7 }}
            >
              <span className="footnote-rule" /> BASED IN PUNJAB, INDIA
              <span className="footnote-sep">·</span> OPEN TO BUILDING
            </motion.div>
          </div>

          <motion.div
            className="hero-art"
            initial={{ opacity: 0, scale: .94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: .2, ease: "easeOut" }}
          >
            <div className="portrait-halo" />
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />

            <div className="portrait-frame">
              <img
                src="/baljinder-portrait.webp"
                alt="Baljinder Singh wearing a pink turban and plum shirt"
              />
              <div className="portrait-fade" />
            </div>

            <motion.div
              className="float-note note-top"
              animate={{ y: [0, -9, 0], rotate: [-2, 1, -2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="note-icon"><BrainCircuit size={17} /></span>
              <span><b>AI enthusiast</b><small>Curiosity, built into code</small></span>
            </motion.div>

            <motion.div
              className="float-note note-bottom"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="note-status" />
              <span><b>Always learning</b><small>One build at a time</small></span>
            </motion.div>

            <div className="art-caption">
              <span>01 / 05</span>
              <span>THE PERSON BEHIND THE CODE</span>
            </div>

            <span className="sparkle sparkle-a">✳</span>
            <span className="sparkle sparkle-b">✳</span>
          </motion.div>

          <a href="#about" className="scroll-cue">
            <Mouse size={16} /> SCROLL TO EXPLORE <ArrowDown size={13} />
          </a>
          <div className="hero-side-label">DESIGNING · BUILDING · LEARNING</div>
        </section>

        {/* ---------- ABOUT (unchanged) ---------- */}
        <section className="intro-section section-wrap" id="about">
          <div className="intro-left">
            <SectionTitle
              eyebrow="A BIT ABOUT ME"
              title="Curious by nature."
              accent="Builder by choice."
            />

            <motion.div
              className="intro-copy"
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <p>
                I'm <strong>Baljinder Singh</strong>, a software engineering student at
                <strong> Bhai Gurdas College of Institutes</strong>. I enjoy taking an idea,
                pulling it apart, and turning it into something people can actually use.
              </p>
              <p>
                My world sits somewhere between full-stack development and artificial
                intelligence. I spend a lot of time experimenting with AI systems — from
                chatbots and RAG pipelines to adapting language models — while keeping
                my fundamentals sharp with programming and DSA.
              </p>
              <p>
                I have also worked on projects with clients, learning that good software
                is not just about making things work. It is about understanding the person
                on the other side of the screen.
              </p>
            </motion.div>

            <motion.a
              className="underlined-link"
              href="#contact"
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              Have an idea? Let's talk <ArrowUpRight size={16} />
            </motion.a>
          </div>

          <motion.div
            className="intro-aside"
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: .8 }}
          >
            <div className="aside-orb">
              <div className="orb-core"><Braces size={38} /></div>
              <span className="orb-ring ring-a" />
              <span className="orb-ring ring-b" />
            </div>

            <div className="aside-card">
              <div className="aside-card-icon"><GraduationCap size={20} /></div>
              <div><small>CURRENTLY</small><b>B.Tech Student</b><span>Bhai Gurdas Institute</span></div>
            </div>

            <div className="aside-card">
              <div className="aside-card-icon purple"><BrainCircuit size={20} /></div>
              <div><small>IN MY ELEMENT</small><b>AI & intelligent systems</b><span>Chatbots · RAG · LLMs</span></div>
            </div>

            <div className="aside-card">
              <div className="aside-card-icon dark"><Workflow size={20} /></div>
              <div><small>ALSO ENJOY</small><b>Building for people</b><span>Projects · Client collaboration</span></div>
            </div>

            <div className="aside-signature">stay curious<span>↗</span></div>
          </motion.div>
        </section>

        {/* ---------- EXPERTISE (unchanged) ---------- */}
        <section className="expertise-section" id="expertise">
          <div className="section-wrap expertise-inner">
            <SectionTitle
              eyebrow="WHAT I WORK WITH"
              title="Tools are useful."
              accent="Thinking is everything."
              text="A growing toolkit for turning complex ideas into practical products."
            />

            <div className="skill-grid">
              {skills.map((skill, i) => (
                <motion.article
                  className="skill-card"
                  key={skill.name}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: .2 }}
                  transition={{ delay: i * .055, duration: .55 }}
                >
                  <div className={`skill-symbol ${skill.tone}`}>{skill.icon}</div>
                  <div className="skill-meta">{skill.type}</div>
                  <h3>{skill.name}</h3>
                  <p>{skill.note}</p>
                  <ArrowUpRight className="skill-arrow" size={16} />
                </motion.article>
              ))}
            </div>

            <div className="expertise-bottom">
              <span>ALWAYS ADDING TO THE TOOLBOX</span>
              <div className="expertise-line" />
              <span>01 — 08</span>
            </div>
          </div>
        </section>

        {/* ---------- PROJECTS (now powered by GitHub) ---------- */}
        <section className="projects-section section-wrap" id="projects">
          <div className="projects-heading">
            <SectionTitle
              eyebrow="SELECTED WORK & EXPERIMENTS"
              title="Things I've"
              accent="put into motion."
              text="A live, automatically updated collection of everything I've been building — pulled straight from GitHub."
            />
            <span className="project-count">
              {reposLoading
                ? "—"
                : String(repos.length).padStart(2, "0")}
              <small>
                {reposLoading ? "LOADING" : "PUBLIC REPOS"}
              </small>
            </span>
          </div>

          <div className="project-list">
            {reposLoading && (
              <div className="project-status">
                <div className="project-spinner" />
                <p>Fetching repositories from GitHub…</p>
              </div>
            )}

            {!reposLoading && reposError && (
              <div className="project-status error">
                <Github size={28} />
                <p>{reposError}</p>
                <button
                  type="button"
                  className="button button-dark"
                  onClick={() => setReposReloadKey((key) => key + 1)}
                >
                  Try again <ArrowRight size={15} />
                </button>
              </div>
            )}

            {!reposLoading && !reposError && repos.length === 0 && (
              <div className="project-status empty">
                <Github size={28} />
                <p>No public repositories to show just yet. Check back soon — something is always brewing.</p>
              </div>
            )}

            {!reposLoading && !reposError && repos.length > 0 &&
              repos.map((repo, index) => (
                <RepoCard key={repo.id} repo={repo} index={index} />
              ))}
          </div>

          <div className="projects-footer">
            <a
              className="button button-dark"
              href={GITHUB_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={16} /> View All Projects
            </a>
          </div>
        </section>

        {/* ---------- JOURNEY (unchanged) ---------- */}
        <section className="journey-section" id="journey">
          <div className="section-wrap journey-inner">
            <div className="journey-title">
              <SectionTitle
                eyebrow="THE WAY I LIKE TO WORK"
                title="Learn. Make."
                accent="Make it better."
                text="I believe the best way to understand technology is to build with it, break things, and keep improving."
              />
            </div>

            <div className="journey-steps">
              {[
                ["01", "Stay curious", "Explore new ideas, read, experiment, and ask better questions.", <Sparkles size={20} />],
                ["02", "Build with intent", "Turn what I learn into projects that solve a real problem.", <Code2 size={20} />],
                ["03", "Keep refining", "Listen, iterate, and care about the details that make a product feel right.", <Zap size={20} />]
              ].map(([n, title, body, icon], i) => (
                <motion.div
                  className="journey-step"
                  key={n}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * .12 }}
                >
                  <span className="step-no">{n}</span>
                  <div className="step-icon">{icon}</div>
                  <div className="step-text"><h3>{title}</h3><p>{body}</p></div>
                  <ArrowUpRight className="step-arrow" size={18} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- CONTACT (unchanged) ---------- */}
        <section className="contact-section section-wrap" id="contact">
          <div className="contact-card">
            <div className="contact-glow" />

            <div className="contact-content">
              <Eyebrow>HAVE SOMETHING IN MIND?</Eyebrow>

              <h2>Let's make<br /><span>something meaningful.</span></h2>

              <p>
                Have a project, an interesting problem, or just want to talk about AI?
                Send me a message. I'd love to hear from you.
              </p>

              <div className="contact-direct-email">
                <Mail size={17} />
                <a href="mailto:seraphyx8@gmail.com">seraphyx8@gmail.com</a>
              </div>

              <motion.form
                className="contact-form"
                onSubmit={handleContactSubmit}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: .65 }}
              >
                <div className="contact-form-row">
                  <label>
                    Your name
                    <input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      autoComplete="name"
                      required
                      maxLength={100}
                    />
                  </label>

                  <label>
                    Email address
                    <input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      autoComplete="email"
                      required
                      maxLength={150}
                    />
                  </label>
                </div>

                <label>
                  Subject
                  <input
                    type="text"
                    name="subject"
                    placeholder="What would you like to discuss?"
                    required
                    maxLength={150}
                  />
                </label>

                <label>
                  Your message
                  <textarea
                    name="message"
                    placeholder="Tell me a little about your idea..."
                    rows="5"
                    required
                    maxLength={5000}
                  />
                </label>

                {/* Honeypot field for basic spam protection */}
                <input
                  type="text"
                  name="_gotcha"
                  tabIndex="-1"
                  autoComplete="off"
                  aria-hidden="true"
                  className="contact-honeypot"
                />

                <input type="hidden" name="_subject" value="New message from Baljinder's portfolio" />

                <button
                  className="button button-light contact-submit"
                  type="submit"
                  disabled={formStatus === "sending"}
                >
                  {formStatus === "sending" ? (
                    <>Sending message <span className="button-spinner" /></>
                  ) : formStatus === "success" ? (
                    <>Send another message <Send size={16} /></>
                  ) : (
                    <>Send message <Send size={16} /></>
                  )}
                </button>

                <AnimatePresence mode="wait">
                  {formMessage && (
                    <motion.div
                      key={formStatus}
                      className={`form-feedback ${formStatus}`}
                      initial={{ opacity: 0, y: 10, scale: .98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: .3 }}
                      role="status"
                      aria-live="polite"
                    >
                      {formStatus === "success" && <Check size={18} />}
                      {formStatus === "error" && <X size={18} />}
                      <span>{formMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.form>
            </div>

            <div className="contact-mark">
              <MessageCircle size={78} strokeWidth={1} />
              <span>OPEN<br />TO IDEAS</span>
            </div>

            <div className="contact-bottom">
              <span>PUNJAB, INDIA</span>
              <span>GOOD THINGS START WITH A HELLO.</span>
              <span>BS © 2026</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer section-wrap">
        <a className="brand" href="#home">
          <span className="brand-mark"><Code2 size={18} /></span>
          <span>baljinder<span className="brand-dot">.</span></span>
        </a>

        <span className="footer-note">Made with curiosity, care & a few lines of code.</span>

        <div className="social-links">
          <a
            href={GITHUB_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
          >
            <Github size={17} />
          </a>
          <a
            href="https://www.linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <Linkedin size={17} />
          </a>
          <a href="mailto:seraphyx8@gmail.com" aria-label="Email">
            <Mail size={17} />
          </a>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);