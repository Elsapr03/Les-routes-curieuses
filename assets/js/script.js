// script.js — inject sample routes from assets/data/routes.json

async function loadRoutes(){
  try{
    const res = await fetch('assets/data/routes.json');
    if(!res.ok) throw new Error('Network response was not ok');
    const routes = await res.json();
    const container = document.getElementById('routes-list');
    container.innerHTML = '';
    routes.forEach(r => {
      const card = document.createElement('article');
      card.className = 'route-card';
      card.innerHTML = `
        <img class="route-image" src="${r.image}" alt="${r.title}">
        <div class="route-content">
          <h3 class="route-title">${r.title}</h3>
          <div class="route-meta">${r.location} • ${r.duration} • ${r.difficulty}</div>
          <p class="route-excerpt">${r.summary}</p>
        </div>
        <div class="route-actions">
          <button class="btn btn-outline">Détails</button>
          <button class="btn btn-primary">Réserver</button>
        </div>
      `;
      container.appendChild(card);
    });
  }catch(err){
    console.error('Could not load routes', err);
    const container = document.getElementById('routes-list');
    container.innerHTML = '<p>Impossible de charger les itinéraires pour le moment.</p>';
  }
}

// Load on DOM ready
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', loadRoutes);
}else{
  loadRoutes();
}
