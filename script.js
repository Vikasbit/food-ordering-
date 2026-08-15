document.addEventListener('DOMContentLoaded', () => {
    const panels = document.querySelectorAll('.panel');
    const navLinks = document.querySelectorAll('.right-nav a');

    // Setup Intersection Observer to update right nav dots
    const observerOptions = {
        root: document.querySelector('.scroll-container'),
        threshold: 0.5 // Trigger when 50% of the section is visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const navId = entry.target.getAttribute('data-nav');
                
                // Remove active class from all links
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    const dot = link.querySelector('.dot');
                    if (dot) dot.classList.remove('wave');
                });

                // Add active class to corresponding link
                const activeLink = document.querySelector(`.right-nav a[href="#${navId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                    // Add wave effect to active dot
                    const dot = activeLink.querySelector('.dot');
                    if (dot) dot.classList.add('wave');
                }
            }
        });
    }, observerOptions);

    panels.forEach(panel => {
        observer.observe(panel);
    });
});

