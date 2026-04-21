<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Opening Page</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Syne:wght@500;700;800&display=swap" rel="stylesheet">
	<style>
		:root {
			--bg: #08111f;
			--bg-soft: #13233d;
			--surface: rgba(11, 24, 44, 0.72);
			--surface-strong: rgba(10, 20, 34, 0.9);
			--line: rgba(255, 255, 255, 0.08);
			--text: #f4f7fb;
			--muted: #9db0cb;
			--accent: #ff8a3d;
			--accent-soft: #ffd166;
			--cyan: #77e3d2;
			--shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
		}

		* {
			box-sizing: border-box;
		}

		html {
			scroll-behavior: smooth;
		}

		body {
			margin: 0;
			min-height: 100vh;
			font-family: "Space Grotesk", sans-serif;
			color: var(--text);
			background:
				radial-gradient(circle at top left, rgba(255, 138, 61, 0.18), transparent 30%),
				radial-gradient(circle at 85% 15%, rgba(119, 227, 210, 0.18), transparent 25%),
				linear-gradient(160deg, #050b15 0%, #08111f 40%, #10213d 100%);
			overflow-x: hidden;
		}

		body::before {
			content: "";
			position: fixed;
			inset: 0;
			background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
				linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
			background-size: 72px 72px;
			mask-image: radial-gradient(circle at center, black 40%, transparent 90%);
			pointer-events: none;
			opacity: 0.4;
		}

		a {
			color: inherit;
			text-decoration: none;
		}

		.page-shell {
			position: relative;
			width: min(1200px, calc(100% - 2rem));
			margin: 0 auto;
			padding: 1.25rem 0 4rem;
		}

		.ambient {
			position: absolute;
			border-radius: 999px;
			filter: blur(20px);
			opacity: 0.65;
			pointer-events: none;
		}

		.ambient-one {
			top: 8rem;
			right: 2rem;
			width: 220px;
			height: 220px;
			background: rgba(255, 138, 61, 0.25);
		}

		.ambient-two {
			left: -3rem;
			top: 28rem;
			width: 180px;
			height: 180px;
			background: rgba(119, 227, 210, 0.18);
		}

		.topbar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 1rem;
			padding: 1rem 0 2rem;
		}

		.brand {
			display: inline-flex;
			align-items: center;
			gap: 0.85rem;
			font-weight: 700;
			letter-spacing: 0.08em;
			text-transform: uppercase;
		}

		.brand-mark {
			display: grid;
			place-items: center;
			width: 2.5rem;
			height: 2.5rem;
			border-radius: 18px;
			background: linear-gradient(145deg, var(--accent), var(--accent-soft));
			color: #07101d;
			box-shadow: 0 15px 30px rgba(255, 138, 61, 0.3);
		}

		.nav-links {
			display: inline-flex;
			gap: 2rem;
			color: var(--muted);
		}

		.nav-links a {
			position: relative;
		}

		.nav-links a::after {
			content: "";
			position: absolute;
			left: 0;
			bottom: -0.35rem;
			width: 100%;
			height: 2px;
			transform: scaleX(0);
			transform-origin: left;
			background: linear-gradient(90deg, var(--accent), var(--cyan));
			transition: transform 0.25s ease;
		}

		.nav-links a:hover::after,
		.nav-links a:focus-visible::after {
			transform: scaleX(1);
		}

		.nav-cta,
		.button {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			border-radius: 999px;
			font-weight: 700;
			transition: transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease;
		}

		.nav-cta {
			padding: 0.85rem 1.35rem;
			background: rgba(255, 255, 255, 0.06);
			border: 1px solid var(--line);
			backdrop-filter: blur(12px);
		}

		.hero {
			display: grid;
			grid-template-columns: 1.1fr 0.9fr;
			gap: 2rem;
			align-items: center;
			padding: 3rem 0 4rem;
		}

		.eyebrow,
		.section-label {
			display: inline-flex;
			align-items: center;
			gap: 0.6rem;
			margin: 0 0 1rem;
			color: var(--cyan);
			text-transform: uppercase;
			letter-spacing: 0.18em;
			font-size: 0.82rem;
		}

		.status-dot {
			width: 0.65rem;
			height: 0.65rem;
			border-radius: 50%;
			background: var(--accent-soft);
			box-shadow: 0 0 0 0 rgba(255, 209, 102, 0.7);
			animation: pulseDot 1.8s infinite;
		}

		.hero h1,
		.section-heading h2,
		.launch h2 {
			margin: 0;
			font-family: "Syne", sans-serif;
			line-height: 0.95;
		}

		.hero h1 {
			max-width: 10ch;
			font-size: clamp(3.8rem, 8vw, 7rem);
			letter-spacing: -0.05em;
		}

		.hero-text {
			max-width: 42rem;
			margin: 1.5rem 0 0;
			color: var(--muted);
			font-size: 1.08rem;
			line-height: 1.7;
		}

		.hero-actions {
			display: flex;
			flex-wrap: wrap;
			gap: 1rem;
			margin-top: 2rem;
		}

		.button {
			padding: 1rem 1.5rem;
		}

		.button:hover,
		.nav-cta:hover {
			transform: translateY(-2px);
		}

		.button-primary {
			background: linear-gradient(145deg, var(--accent), var(--accent-soft));
			color: #07101d;
			box-shadow: 0 20px 40px rgba(255, 138, 61, 0.28);
		}

		.button-secondary {
			border: 1px solid var(--line);
			background: rgba(255, 255, 255, 0.05);
			color: var(--text);
			backdrop-filter: blur(12px);
		}

		.hero-stats {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 1rem;
			margin-top: 2.5rem;
		}

		.stat-card,
		.visual-card,
		.feature-strip article,
		.experience-card,
		.launch {
			border: 1px solid var(--line);
			background: var(--surface);
			backdrop-filter: blur(18px);
			box-shadow: var(--shadow);
		}

		.stat-card {
			padding: 1.2rem;
			border-radius: 24px;
		}

		.stat-card strong {
			display: block;
			font-size: 2rem;
			font-family: "Syne", sans-serif;
		}

		.stat-card span,
		.feature-strip p,
		.experience-card p {
			color: var(--muted);
		}

		.hero-visual {
			position: relative;
			min-height: 540px;
		}

		.main-panel {
			position: absolute;
			inset: 2rem 0 0 0;
			padding: 1.5rem;
			border-radius: 32px;
			overflow: hidden;
		}

		.main-panel::before {
			content: "";
			position: absolute;
			inset: 0;
			background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 40%);
			pointer-events: none;
		}

		.panel-topline {
			display: flex;
			justify-content: space-between;
			color: var(--muted);
			font-size: 0.92rem;
			text-transform: uppercase;
			letter-spacing: 0.12em;
		}

		.signal-grid {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 1rem;
			margin-top: 3rem;
		}

		.signal-card {
			padding: 1.4rem;
			border-radius: 26px;
			min-height: 150px;
			border: 1px solid rgba(255, 255, 255, 0.08);
		}

		.signal-card span {
			color: rgba(255, 255, 255, 0.62);
			font-size: 0.92rem;
		}

		.signal-card strong {
			display: block;
			margin-top: 0.75rem;
			font-family: "Syne", sans-serif;
			font-size: 1.6rem;
			line-height: 1;
		}

		.accent-card {
			background: linear-gradient(160deg, rgba(255, 138, 61, 0.9), rgba(255, 209, 102, 0.72));
			color: #08111f;
		}

		.accent-card span {
			color: rgba(8, 17, 31, 0.75);
		}

		.dark-card {
			background: rgba(4, 10, 21, 0.88);
		}

		.wide-card {
			grid-column: 1 / -1;
			background: linear-gradient(140deg, rgba(119, 227, 210, 0.15), rgba(17, 34, 59, 0.88));
		}

		.pulse-line {
			width: 100%;
			height: 76px;
			margin-top: 1rem;
			border-radius: 18px;
			background:
				linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.12) 50%, transparent 100%),
				linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
			position: relative;
			overflow: hidden;
		}

		.pulse-line::after {
			content: "";
			position: absolute;
			inset: 0;
			background: linear-gradient(90deg, transparent, rgba(119, 227, 210, 0.55), transparent);
			animation: shimmer 2.4s linear infinite;
		}

		.floating-note {
			position: absolute;
			padding: 0.9rem 1.1rem;
			border-radius: 999px;
			border: 1px solid var(--line);
			background: rgba(255, 255, 255, 0.06);
			backdrop-filter: blur(16px);
			color: var(--text);
			font-size: 0.92rem;
			box-shadow: var(--shadow);
		}

		.note-one {
			left: -1rem;
			top: 5rem;
		}

		.note-two {
			right: -1rem;
			bottom: 3rem;
		}

		.feature-strip {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 1rem;
		}

		.feature-strip article,
		.experience-card,
		.launch {
			border-radius: 28px;
			padding: 1.5rem;
		}

		.feature-strip span,
		.experience-card h3 {
			display: block;
			margin-bottom: 0.65rem;
			font-size: 1.2rem;
			font-weight: 700;
		}

		.experience {
			padding: 5rem 0;
		}

		.section-heading {
			display: grid;
			gap: 1rem;
			max-width: 46rem;
			margin-bottom: 2rem;
		}

		.section-heading h2,
		.launch h2 {
			font-size: clamp(2.4rem, 5vw, 4.5rem);
			letter-spacing: -0.04em;
		}

		.experience-grid {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 1rem;
		}

		.launch {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 1rem;
			margin-bottom: 3rem;
		}

		.reveal {
			opacity: 0;
			transform: translateY(28px);
			transition: opacity 0.7s ease, transform 0.7s ease;
		}

		.reveal.is-visible {
			opacity: 1;
			transform: translateY(0);
		}

		@keyframes shimmer {
			from {
				transform: translateX(-100%);
			}
			to {
				transform: translateX(100%);
			}
		}

		@keyframes pulseDot {
			0% {
				box-shadow: 0 0 0 0 rgba(255, 209, 102, 0.65);
			}
			70% {
				box-shadow: 0 0 0 14px rgba(255, 209, 102, 0);
			}
			100% {
				box-shadow: 0 0 0 0 rgba(255, 209, 102, 0);
			}
		}

		@media (max-width: 980px) {
			.hero,
			.feature-strip,
			.experience-grid,
			.launch {
				grid-template-columns: 1fr;
			}

			.topbar,
			.launch {
				flex-direction: column;
				align-items: flex-start;
			}

			.nav-links {
				flex-wrap: wrap;
				gap: 1rem;
			}

			.hero-visual {
				min-height: 460px;
			}

			.note-two {
				right: 0;
			}
		}

		@media (max-width: 720px) {
			.page-shell {
				width: min(100% - 1.2rem, 1200px);
			}

			.topbar {
				padding-bottom: 1rem;
			}

			.nav-links {
				display: none;
			}

			.hero {
				padding-top: 1.5rem;
			}

			.hero h1 {
				max-width: 100%;
				font-size: clamp(3rem, 17vw, 4.8rem);
			}

			.hero-stats,
			.signal-grid {
				grid-template-columns: 1fr;
			}

			.hero-visual {
				min-height: auto;
			}

			.main-panel {
				position: relative;
				inset: 0;
			}

			.floating-note {
				display: none;
			}
		}
	</style>
</head>
<body>
	<div class="page-shell">
		<div class="ambient ambient-one"></div>
		<div class="ambient ambient-two"></div>

		<header class="topbar">
			<a class="brand" href="#home">
				<span class="brand-mark"></span>
				<span>Jagan</span>
			</a>

			<nav class="nav-links">
				<a href="#features">Features</a>
				<a href="#experience">Experience</a>
				<a href="#launch">Launch</a>
			</nav>

			<a class="nav-cta" href="#launch">Start Now</a>
		</header>

		<main>
			<section class="hero" id="home">
				<div class="hero-copy reveal">
					<p class="eyebrow">
						<span class="status-dot"></span>
						<span id="greeting">Now loading momentum</span>
					</p>

					<h1>Launch a first impression that actually feels alive.</h1>

					<p class="hero-text">
						A cinematic opening page with fast interactions, layered visuals,
						and a polished structure built to grab attention on desktop and mobile.
					</p>

					<div class="hero-actions">
						<a class="button button-primary" href="#launch">Open Experience</a>
						<a class="button button-secondary" href="#features">See Details</a>
					</div>

					<div class="hero-stats">
						<article class="stat-card">
							<strong class="counter" data-target="98">0</strong>
							<span>Visual impact</span>
						</article>
						<article class="stat-card">
							<strong class="counter" data-target="24">0</strong>
							<span>Motion details</span>
						</article>
						<article class="stat-card">
							<strong class="counter" data-target="100">0</strong>
							<span>Responsive fit</span>
						</article>
					</div>
				</div>

				<div class="hero-visual reveal">
					<div class="visual-card main-panel">
						<div class="panel-topline">
							<span>Creative Control</span>
							<span>01</span>
						</div>

						<div class="signal-grid">
							<div class="signal-card accent-card">
								<span>Realtime energy</span>
								<strong>Atmosphere synced</strong>
							</div>
							<div class="signal-card dark-card">
								<span>Engagement</span>
								<strong>Scroll to discover</strong>
							</div>
							<div class="signal-card wide-card">
								<span>Design System</span>
								<div class="pulse-line"></div>
							</div>
						</div>
					</div>

					<div class="floating-note note-one">Bold typography</div>
					<div class="floating-note note-two">Smooth reveal</div>
				</div>
			</section>

			<section class="feature-strip reveal" id="features">
				<article>
					<span>Layered visuals</span>
					<p>Gradients, depth, and texture without overwhelming the content.</p>
				</article>
				<article>
					<span>Responsive by default</span>
					<p>Clean stacking and spacing from large screens down to phones.</p>
				</article>
				<article>
					<span>Motion with purpose</span>
					<p>Animations support hierarchy instead of distracting from it.</p>
				</article>
			</section>

			<section class="experience reveal" id="experience">
				<div class="section-heading">
					<p class="section-label">Experience</p>
					<h2>Everything above the fold should feel intentional.</h2>
				</div>

				<div class="experience-grid">
					<article class="experience-card">
						<h3>Magnetic headline</h3>
						<p>Large-format type, clear CTA hierarchy, and immediate visual contrast.</p>
					</article>
					<article class="experience-card">
						<h3>Premium atmosphere</h3>
						<p>Soft glow, transparent panels, and layered shadows create depth.</p>
					</article>
					<article class="experience-card">
						<h3>Small smart touches</h3>
						<p>Greeting updates, count-up stats, and reveal timing add polish.</p>
					</article>
				</div>
			</section>

			<section class="launch reveal" id="launch">
				<div>
					<p class="section-label">Launch</p>
					<h2>Ready for a stronger opening move?</h2>
				</div>
				<a class="button button-primary" href="#home">Back to top</a>
			</section>
		</main>
	</div>

	<script>
		const greeting = document.getElementById("greeting");
		const revealItems = document.querySelectorAll(".reveal");
		const counters = document.querySelectorAll(".counter");

		function updateGreeting() {
			const hour = new Date().getHours();
			let message = "Now loading momentum";

			if (hour < 12) {
				message = "Good morning, build something sharp";
			} else if (hour < 18) {
				message = "Good afternoon, the page is ready";
			} else {
				message = "Good evening, launch with style";
			}

			greeting.textContent = message;
		}

		const revealObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-visible");
					}
				});
			},
			{
				threshold: 0.2
			}
		);

		const counterObserver = new IntersectionObserver(
			(entries, observer) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) {
						return;
					}

					const element = entry.target;
					const target = Number(element.dataset.target);
					let current = 0;
					const increment = Math.max(1, Math.ceil(target / 45));

					const timer = window.setInterval(() => {
						current += increment;

						if (current >= target) {
							element.textContent = `${target}+`;
							window.clearInterval(timer);
							return;
						}

						element.textContent = `${current}+`;
					}, 28);

					observer.unobserve(element);
				});
			},
			{
				threshold: 0.6
			}
		);

		revealItems.forEach((item, index) => {
			item.style.transitionDelay = `${index * 90}ms`;
			revealObserver.observe(item);
		});

		counters.forEach((counter) => {
			counterObserver.observe(counter);
		});

		updateGreeting();
	</script>
</body>
</html>
