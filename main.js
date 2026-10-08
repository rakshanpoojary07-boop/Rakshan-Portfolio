(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Typed role text (your original strings) ---------- */
    var roleEl = document.querySelector('.text');
    if (roleEl) {
        if (reduceMotion || typeof Typed === 'undefined') {
            roleEl.textContent = 'Data Analyst';
        } else {
            roleEl.textContent = '';
            new Typed('.text', {
                strings: [
                    'Data Analyst',
                    'Data Analytics Enthusiast',
                    'Power BI Developer'
                ],
                typeSpeed: 80,
                backSpeed: 50,
                backDelay: 1200,
                loop: true
            });
        }
    }

    /* ---------- Header background + scroll progress ---------- */
    var header = document.querySelector('.header');
    var bar = document.querySelector('.progress');
    var ticking = false;

    function onScroll() {
        var y = window.scrollY || document.documentElement.scrollTop;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        header.classList.toggle('scrolled', y > 30);
        bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(onScroll);
        }
    }, { passive: true });
    onScroll();

    /* ---------- Mobile menu ---------- */
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.navbar');
    var toggleIcon = toggle.querySelector('i');

    function setMenu(open) {
        nav.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        toggleIcon.className = open ? 'bx bx-x' : 'bx bx-menu';
    }

    toggle.addEventListener('click', function () {
        setMenu(!nav.classList.contains('open'));
    });

    nav.addEventListener('click', function (e) {
        if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setMenu(false);
    });

    /* ---------- Highlight the current section in the nav ---------- */
    var links = Array.prototype.slice.call(document.querySelectorAll('.navbar a'));
    var sections = links
        .map(function (a) { return document.querySelector(a.getAttribute('href')); })
        .filter(Boolean);

    if ('IntersectionObserver' in window) {
        var navObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                links.forEach(function (a) {
                    var active = a.getAttribute('href') === '#' + entry.target.id;
                    if (active) {
                        a.setAttribute('aria-current', 'true');
                    } else {
                        a.removeAttribute('aria-current');
                    }
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        sections.forEach(function (s) { navObserver.observe(s); });
    }

    /* ---------- Scroll reveal ---------- */
    // Children of any [data-stagger] container reveal one after another.
    document.querySelectorAll('[data-stagger]').forEach(function (group) {
        Array.prototype.forEach.call(group.children, function (child, i) {
            child.classList.add('reveal');
            child.style.setProperty('--d', (i * 0.09) + 's');
        });
    });

    var revealEls = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window && !reduceMotion) {
        var revealObserver = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

        revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('in'); });
    }

    /* ---------- Number counters ---------- */
    function countUp(el) {
        var target = parseInt(el.getAttribute('data-count'), 10);
        var duration = 1100;
        var start = null;

        function step(ts) {
            if (start === null) start = ts;
            var p = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased);
            if (p < 1) window.requestAnimationFrame(step);
        }

        el.textContent = '0';
        window.requestAnimationFrame(step);
    }

    var counters = document.querySelectorAll('[data-count]');

    if ('IntersectionObserver' in window && !reduceMotion) {
        var countObserver = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    countUp(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });

        counters.forEach(function (el) { countObserver.observe(el); });
    }

    /* ---------- Timeline line draws itself ---------- */
    var timeline = document.querySelector('.timeline');
    if (timeline) {
        if ('IntersectionObserver' in window && !reduceMotion) {
            var tlObserver = new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        timeline.classList.add('drawn');
                        obs.disconnect();
                    }
                });
            }, { threshold: 0.2 });
            tlObserver.observe(timeline);
        } else {
            timeline.classList.add('drawn');
        }
    }

    /* ---------- Cursor glow on cards ---------- */
    if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
        document.addEventListener('pointermove', function (e) {
            var card = e.target.closest ? e.target.closest('.skill-group, .cert-card') : null;
            if (!card) return;
            var r = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        }, { passive: true });
    }

    /* ---------- Certificate + resume viewer ---------- */
    var lb = document.getElementById('lightbox');
    var lbImg = document.getElementById('lb-img');
    var lbTitle = document.getElementById('lb-title');
    var lbMeta = document.getElementById('lb-meta');
    var lbDownload = document.getElementById('lb-download');
    var lbVerify = document.getElementById('lb-verify');
    var lbPanel = lb.querySelector('.lb-panel');
    var certCards = Array.prototype.slice.call(document.querySelectorAll('.cert-card[data-image]'));
    var group = [];
    var index = 0;
    var lastFocus = null;

    var lbMissing = document.getElementById('lb-missing');

    lbImg.addEventListener('error', function () {
        lbImg.hidden = true;
        lbMissing.hidden = false;
    });

    function show() {
        var d = group[index].dataset;
        lbImg.classList.remove('zoomed');
        lbImg.hidden = false;
        lbMissing.hidden = true;
        lbImg.src = d.image;
        lbImg.alt = d.title + (d.issuer ? ' - ' + d.issuer : '');
        lbTitle.textContent = d.title;
        lbMeta.textContent = [d.issuer, d.date].filter(Boolean).join(' \u00b7 ');
        lbDownload.href = d.file;
        if (d.verify) {
            lbVerify.href = d.verify;
            lbVerify.hidden = false;
        } else {
            lbVerify.hidden = true;
        }
        lb.querySelector('.lb-stage').scrollTop = 0;
    }

    function openViewer(trigger) {
        group = trigger.classList.contains('cert-card') ? certCards : [trigger];
        index = group.indexOf(trigger);
        lastFocus = trigger;
        lb.classList.toggle('single', group.length < 2);
        show();
        lb.hidden = false;
        document.body.classList.add('lb-open');
        lb.querySelector('.lb-btn.icon').focus();
    }

    function closeViewer() {
        if (lb.hidden) return;
        lb.hidden = true;
        document.body.classList.remove('lb-open');
        if (lastFocus) lastFocus.focus();
    }

    function step(dir) {
        if (group.length < 2) return;
        index = (index + dir + group.length) % group.length;
        show();
    }

    document.addEventListener('click', function (e) {
        var trigger = e.target.closest('.cert-card[data-image], .resume-preview[data-image]');
        if (trigger) {
            openViewer(trigger);
            return;
        }
        if (e.target.closest('[data-close]')) closeViewer();
    });

    lb.querySelector('.lb-nav.prev').addEventListener('click', function () { step(-1); });
    lb.querySelector('.lb-nav.next').addEventListener('click', function () { step(1); });
    lbImg.addEventListener('click', function () { lbImg.classList.toggle('zoomed'); });

    document.addEventListener('keydown', function (e) {
        if (lb.hidden) return;
        if (e.key === 'Escape') closeViewer();
        if (e.key === 'ArrowLeft') step(-1);
        if (e.key === 'ArrowRight') step(1);
        if (e.key === 'Tab') {
            var focusable = Array.prototype.filter.call(
                lbPanel.querySelectorAll('a[href], button'),
                function (el) { return !el.hidden && el.offsetParent !== null; }
            );
            if (!focusable.length) return;
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    /* ---------- If a preview image is missing, show a neat placeholder ---------- */
    document.querySelectorAll('.cert-thumb img, .resume-preview img').forEach(function (img) {
        function markMissing() {
            img.parentNode.classList.add('img-missing');
        }
        if (img.complete && img.naturalWidth === 0) {
            markMissing();
        } else {
            img.addEventListener('error', markMissing);
        }
    });
})();
