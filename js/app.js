import { supabase } from './supabase_client.js';

document.addEventListener('DOMContentLoaded', async () => {
  const filtersContainer = document.getElementById('filters');
  const modulesGrid = document.getElementById('modulesGrid');
  
  // State
  let modulesData = [];
  let currentFilter = 'all';

  // SVG Icons
  const Icons = {
    arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
    user: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
  };

  // Fetch Data
  try {
    const res = await fetch('data/modules.json');
    if (!res.ok) throw new Error('Failed to load modules config');
    const data = await res.json();
    let staticModules = data.modules || [];
    
    // Fetch public/approved modules from Supabase
    const { data: dbData, error } = await supabase
        .from('files')
        .select('*')
        .eq('is_public', true)
        .eq('is_approved', true);
        
    let dynamicModules = [];
    if (!error && dbData) {
        dynamicModules = dbData.map(file => ({
            id: file.id,
            type: file.file_type || 'html',
            title: file.title || file.filename,
            category: file.category || 'misc',
            author: file.owner_id ? 'Community Member' : 'Community', // ideally fetch author name, but simplify for now
            description: file.description || '',
            link: file.file_url,
            thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800&h=600', // Default fallback
            tags: file.tags || [],
            roles: ['general']
        }));
    }

    modulesData = [...staticModules, ...dynamicModules];
    
    renderFilters(data.categories);
    renderModules(modulesData);
    setupScrollAnimations();
    setupWizard();
  } catch (error) {
    console.error(error);
    modulesGrid.innerHTML = `
      <div style="text-align: center; width: 100%; color: var(--text-muted); padding: 3rem;">
        Failed to load knowledge modules.
      </div>`;
  }

  // Render Category Filters
  function renderFilters(categories) {
    filtersContainer.innerHTML = '';
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `filter-btn ${cat.id === 'all' ? 'active' : ''}`;
      btn.dataset.id = cat.id;
      btn.textContent = cat.name;
      btn.addEventListener('click', () => handleFilterClick(cat.id, btn));
      filtersContainer.appendChild(btn);
    });
  }

  // Handle Tab Switching
  function handleFilterClick(categoryId, btnElement) {
    if (currentFilter === categoryId) return;
    currentFilter = categoryId;
    
    // Update active UI
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');

    // Filter Logic
    const filtered = categoryId === 'all' 
      ? modulesData 
      : modulesData.filter(m => m.category === categoryId);
      
    // Animate out, then render new
    const cards = document.querySelectorAll('.module-card');
    cards.forEach(card => card.classList.add('fading-out'));
    
    setTimeout(() => {
      renderModules(filtered);
    }, 250); // wait for fade out transition (sync with CSS)
  }

  // Handle Wizard Filtering
  function setupWizard() {
    const btnFindPath = document.getElementById('btnFindPath');
    if (!btnFindPath) return;

    btnFindPath.addEventListener('click', () => {
      const role = document.getElementById('roleSelect').value;
      const interest = document.getElementById('interestSelect').value;
      
      // Update UI active filter button based on interest
      document.querySelectorAll('.filter-btn').forEach(b => {
        if(b.dataset.id === interest) {
          b.classList.add('active');
          currentFilter = interest;
        } else {
          b.classList.remove('active');
        }
      });

      // Filter Logic
      const filtered = modulesData.filter(m => {
        const matchesRole = role === 'all' || (m.roles && m.roles.includes(role));
        const matchesInterest = interest === 'all' || m.category === interest;
        return matchesRole && matchesInterest;
      });

      // Scroll to modules grid
      document.getElementById('explore').scrollIntoView({ behavior: 'smooth' });

      // Animate out, then render new
      const cards = document.querySelectorAll('.module-card');
      cards.forEach(card => card.classList.add('fading-out'));
      
      setTimeout(() => {
        renderModules(filtered);
      }, 250);
    });
  }

  // Render Grid
  function renderModules(modulesToRender) {
    modulesGrid.innerHTML = '';
    
    if (modulesToRender.length === 0) {
      modulesGrid.innerHTML = `
        <div style="text-align: center; width: 100%; grid-column: 1 / -1; color: var(--text-muted); padding: 3rem;">
          No modules found for this category yet. Be the first to contribute!
        </div>`;
      return;
    }

    modulesToRender.forEach((mod, index) => {
      // Create anchor element acts as the whole card
      const card = document.createElement('a');
      card.target = '_blank';
      
      if (mod.type === 'markdown') {
        card.href = `templates/markdown-viewer.html?file=${encodeURIComponent(mod.link)}`;
      } else if (mod.type === 'video' || mod.type === 'audio') {
        card.href = `templates/media-player.html?file=${encodeURIComponent(mod.link)}&type=${mod.type}`;
      } else {
        card.href = mod.link; // Default HTML external linking
      }
      
      card.className = 'module-card animate-fade-in';
      card.style.animationDelay = `${index * 0.05}s`;
      
      card.innerHTML = `
        <div class="card-image-wrap">
          <img src="${mod.thumbnailUrl}" alt="${mod.title} cover" class="card-image" loading="lazy">
          <div class="card-overlay"></div>
          <span class="card-badge">${mod.tags[0] || mod.category}</span>
        </div>
        <div class="card-content">
          <h3 class="card-title">${mod.title}</h3>
          <p class="card-desc">${mod.description}</p>
          <div class="card-footer">
            <span class="card-author">${Icons.user} ${mod.author}</span>
            <span class="card-link">Launch ${Icons.arrowRight}</span>
          </div>
        </div>
      `;
      modulesGrid.appendChild(card);
    });
  }

  // Intersection Observer for scroll animations
  function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.os-banner, .hero').forEach(el => {
      observer.observe(el);
    });
  }
});
