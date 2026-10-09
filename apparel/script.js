document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('sequence-canvas');
  const ctx = canvas.getContext('2d');
  const container = document.getElementById('sequence-container');
  const loader = document.getElementById('loader');
  const progressEl = document.getElementById('progress');
  const navbar = document.querySelector('.navbar');
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;
  
  // Frame settings
  const totalFrames = 300;
  // Reduce frames on mobile (load every 2nd frame)
  const frameStep = isMobile ? 2 : 1;
  const frameCount = Math.floor(totalFrames / frameStep);
  const frames = [];
  let loadedCount = 0;
  
  // Set container height for scrolling (600vh) if motion is allowed
  if (!prefersReducedMotion) {
    container.style.height = '600vh';
  }

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Resize canvas function
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderFrame(currentFrameIndex);
  }
  
  let currentFrameIndex = 0;

  // Object-fit cover logic for canvas
  function renderFrame(index) {
    if (!frames[index] || !ctx) return;
    const img = frames[index];
    
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);
    
    const centerShift_x = (canvas.width - img.width * ratio) / 2;
    const centerShift_y = (canvas.height - img.height * ratio) / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      0, 0, img.width, img.height,
      centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
    );
  }

  // Preload images
  function preloadImages() {
    for (let i = 1; i <= totalFrames; i += frameStep) {
      const img = new Image();
      const frameNum = i.toString().padStart(4, '0');
      img.src = `frames/frame_${frameNum}.webp`;
      
      img.onload = () => {
        loadedCount++;
        progressEl.innerText = Math.round((loadedCount / frameCount) * 100);
        
        if (loadedCount === frameCount) {
          initAnimation();
        }
      };
      // Handle error just in case some frames are missing
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          initAnimation();
        }
      };
      
      frames.push(img);
    }
  }

  function initAnimation() {
    // Hide loader
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 800);
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    if (prefersReducedMotion) {
      // Just render first frame and show all panels statically
      renderFrame(0);
      return;
    }
    
    gsap.registerPlugin(ScrollTrigger);

    // 1. Scrub through frames linked to scroll
    const animationObj = { frame: 0 };
    
    gsap.to(animationObj, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5 // Slight smoothing
      },
      onUpdate: () => {
        currentFrameIndex = Math.round(animationObj.frame);
        requestAnimationFrame(() => renderFrame(currentFrameIndex));
      }
    });

    // 2. Story Overlays Animations
    // 0-15%: Panel 1
    gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "15% top",
        scrub: true,
      }
    })
    .fromTo("#panel-1", { opacity: 0, y: 50, autoAlpha: 0 }, { opacity: 1, y: 0, autoAlpha: 1, duration: 0.2 })
    .to("#panel-1", { opacity: 0, y: -50, autoAlpha: 0, duration: 0.2 }, 0.8);

    // 15-45%: Panel 2
    gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "15% top",
        end: "45% top",
        scrub: true,
      }
    })
    .fromTo("#panel-2", { opacity: 0, y: 50, autoAlpha: 0 }, { opacity: 1, y: 0, autoAlpha: 1, duration: 0.2 })
    .to("#panel-2", { opacity: 0, y: -50, autoAlpha: 0, duration: 0.2 }, 0.8);

    // 45-75%: Panel 3
    gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "45% top",
        end: "75% top",
        scrub: true,
      }
    })
    .fromTo("#panel-3", { opacity: 0, y: 50, autoAlpha: 0 }, { opacity: 1, y: 0, autoAlpha: 1, duration: 0.2 })
    .to("#panel-3", { opacity: 0, y: -50, autoAlpha: 0, duration: 0.2 }, 0.8);

    // 75-100%: Panel 4
    gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "75% top",
        end: "100% top",
        scrub: true,
      }
    })
    .fromTo("#panel-4", { opacity: 0, y: 50, autoAlpha: 0 }, { opacity: 1, y: 0, autoAlpha: 1, duration: 0.2 });
  }

  // Start preloading
  preloadImages();
});
