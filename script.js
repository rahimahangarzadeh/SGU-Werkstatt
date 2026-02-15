// ============================================================
// SGU-Inspektion Script
// ============================================================

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Registriere SW relativ, damit es auch in Unterverzeichnissen geht
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}

// ============================================================
// TÄTIGKEIT: Magazin & Werkstatt
// ============================================================

function applyMagazinWerkstatt() {
  console.log('Applying Magazin & Werkstatt - setting all to i.O.');
  
  // Set all radio buttons to "i.O."
  const radioFields = [
    'ordnung_sauberkeit', 'unterweisungen', 'gefaehrdungsbeurteilung', 'lmra',
    'toolbox_meeting', 'ersthelfer', 'sicherheitspass', 'psa_vorhanden', 
    'psa_zustand', 'gefahrstoffe', 'erste_hilfe', 'feuerloescher',
    'fahrzeuge_geraete', 'leitern_absturz', 'regale', 'oelabscheider', 
    'abfallentsorgung'
  ];

  radioFields.forEach(fieldName => {
    const radioIO = document.querySelector(`input[name="${fieldName}"][value="i.O."]`);
    if (radioIO) {
      radioIO.checked = true;
      console.log(`Set ${fieldName} to i.O.`);
      
      // Hide conditional fields for n.i.O.
      const conditionalDiv = document.querySelector(`[data-conditional="${fieldName}_nio"]`);
      if (conditionalDiv) {
        conditionalDiv.classList.add('hidden');
        // Clear textarea
        const textarea = conditionalDiv.querySelector('textarea');
        if (textarea) textarea.value = '';
      }
    }
  });
  
  // Visual feedback
  const pageTitle = document.querySelector('.page-subtitle');
  if (pageTitle) {
    const originalText = pageTitle.textContent;
    pageTitle.textContent = 'Alle Fragen wurden als "i.O." markiert. Sie können die Antworten weiterhin anpassen.';
    pageTitle.style.color = 'var(--accent)';
    pageTitle.style.fontWeight = '600';
    setTimeout(() => {
      pageTitle.textContent = originalText;
      pageTitle.style.color = '';
      pageTitle.style.fontWeight = '';
    }, 4000);
  }
  
  console.log('All fields set to i.O. successfully');
}

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing...');
  
  // Set current date/time
  const now = new Date();
  const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  document.getElementById('datum').value = localDateTime;

  // Set default Baustelle address
  const baustelleInput = document.getElementById('baustelleInput');
  if (baustelleInput && !baustelleInput.value) {
    baustelleInput.value = 'J.-D.-Lauenstein-Str. 24, 49767 Twist';
    // Set coordinates for Twist
    document.getElementById('baustelleLat').value = '52.8044';
    document.getElementById('baustelleLng').value = '7.0456';
  }

  // Tätigkeit button handler
  const tatigkeitBtn = document.getElementById('tatigkeitBtn');
  if (tatigkeitBtn) {
    tatigkeitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Tätigkeit button clicked');
      applyMagazinWerkstatt();
    });
  }

  // Conditional field handlers
  setupConditionalFields();

  // Map handlers
  const openMapBtn = document.getElementById('openMapBtn');
  const closeMapBtn = document.getElementById('closeMapBtn');
  const confirmMapBtn = document.getElementById('confirmMapBtn');
  
  if (openMapBtn) openMapBtn.addEventListener('click', openMapModal);
  if (closeMapBtn) closeMapBtn.addEventListener('click', closeMapModal);
  if (confirmMapBtn) confirmMapBtn.addEventListener('click', confirmMapSelection);

  // Massnahmen table handlers
  const addMassnahmeBtn = document.getElementById('addMassnahmeBtn');
  if (addMassnahmeBtn) addMassnahmeBtn.addEventListener('click', addMassnahmeRow);

  // Form submission
  const form = document.getElementById('sguForm');
  if (form) form.addEventListener('submit', handleSubmit);
  
  console.log('Initialization complete');
});

// ============================================================
// CONDITIONAL FIELDS
// ============================================================

function setupConditionalFields() {
  // Get all radio groups
  const radioGroups = {};
  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    if (!radioGroups[radio.name]) {
      radioGroups[radio.name] = [];
    }
    radioGroups[radio.name].push(radio);
  });

  // Add listeners
  Object.keys(radioGroups).forEach(groupName => {
    radioGroups[groupName].forEach(radio => {
      radio.addEventListener('change', () => {
        updateConditionalField(groupName);
      });
    });
  });

  // Special case: toolbox_meeting always shows thema field
  const toolboxRadios = document.querySelectorAll('[name="toolbox_meeting"]');
  toolboxRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const conditionalDiv = document.querySelector('[data-conditional="toolbox_meeting_always"]');
      // Always visible for this field
      if (conditionalDiv) {
        conditionalDiv.classList.remove('hidden');
      }
    });
  });
}

function updateConditionalField(groupName) {
  const selectedRadio = document.querySelector(`[name="${groupName}"]:checked`);
  if (!selectedRadio) return;

  const conditionalDiv = document.querySelector(`[data-conditional="${groupName}_nio"]`);
  if (conditionalDiv) {
    if (selectedRadio.value === 'n.i.O.') {
      conditionalDiv.classList.remove('hidden');
    } else {
      conditionalDiv.classList.add('hidden');
      // Clear the textarea
      const textarea = conditionalDiv.querySelector('textarea');
      if (textarea) textarea.value = '';
    }
  }
}

// ============================================================
// MAP FUNCTIONALITY
// ============================================================

let map;
let marker;
let selectedLocation = null;

function openMapModal() {
  const modal = document.getElementById('mapModal');
  modal.classList.remove('hidden');

  if (!map) {
    initMap();
  }
}

function closeMapModal() {
  document.getElementById('mapModal').classList.add('hidden');
}

function initMap() {
  // Center map on Twist, Germany (default location)
  map = L.map('leafletMap').setView([52.8044, 7.0456], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Add marker for default location if it exists
  const defaultLat = document.getElementById('baustelleLat').value;
  const defaultLng = document.getElementById('baustelleLng').value;
  if (defaultLat && defaultLng) {
    marker = L.marker([parseFloat(defaultLat), parseFloat(defaultLng)]).addTo(map);
    selectedLocation = { lat: parseFloat(defaultLat), lng: parseFloat(defaultLng) };
    document.getElementById('selectedAddress').textContent = document.getElementById('baustelleInput').value;
    document.getElementById('selectedAddress').classList.add('has-addr');
  }

  map.on('click', (e) => {
    if (marker) {
      map.removeLayer(marker);
    }
    marker = L.marker(e.latlng).addTo(map);
    selectedLocation = e.latlng;
    
    // Reverse geocode
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json`)
      .then(res => res.json())
      .then(data => {
        const address = data.display_name || 'Unbekannte Adresse';
        document.getElementById('selectedAddress').textContent = address;
        document.getElementById('selectedAddress').classList.add('has-addr');
      })
      .catch(() => {
        document.getElementById('selectedAddress').textContent = `Koordinaten: ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
        document.getElementById('selectedAddress').classList.add('has-addr');
      });
  });

  // Search functionality
  document.getElementById('mapSearchBtn').addEventListener('click', searchLocation);
  document.getElementById('mapSearchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchLocation();
    }
  });
}

function searchLocation() {
  const query = document.getElementById('mapSearchInput').value;
  if (!query) return;

  fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`)
    .then(res => res.json())
    .then(data => {
      if (data && data.length > 0) {
        const location = data[0];
        const latlng = { lat: parseFloat(location.lat), lng: parseFloat(location.lon) };
        map.setView(latlng, 15);
        
        if (marker) {
          map.removeLayer(marker);
        }
        marker = L.marker(latlng).addTo(map);
        selectedLocation = latlng;
        
        document.getElementById('selectedAddress').textContent = location.display_name;
        document.getElementById('selectedAddress').classList.add('has-addr');
      } else {
        alert('Adresse nicht gefunden');
      }
    })
    .catch(err => {
      console.error('Search error:', err);
      alert('Fehler bei der Suche');
    });
}

function confirmMapSelection() {
  if (!selectedLocation) {
    alert('Bitte wählen Sie einen Standort auf der Karte aus');
    return;
  }

  const address = document.getElementById('selectedAddress').textContent;
  document.getElementById('baustelleInput').value = address;
  document.getElementById('baustelleLat').value = selectedLocation.lat;
  document.getElementById('baustelleLng').value = selectedLocation.lng;
  
  closeMapModal();
}

// ============================================================
// MASSNAHMEN TABLE
// ============================================================

let massnahmeCounter = 1;

function addMassnahmeRow() {
  const tbody = document.getElementById('massnahmenBody');
  const row = document.createElement('tr');
  
  row.innerHTML = `
    <td style="padding: 8px; border: 1px solid var(--border);">
      <input type="text" class="field-input" name="massnahme_text_${massnahmeCounter}" style="margin: 0;">
    </td>
    <td style="padding: 8px; border: 1px solid var(--border);">
      <input type="text" class="field-input" name="massnahme_verantwortlich_${massnahmeCounter}" style="margin: 0;">
    </td>
    <td style="padding: 8px; border: 1px solid var(--border);">
      <input type="date" class="field-input" name="massnahme_erledigt_${massnahmeCounter}" style="margin: 0;">
    </td>
    <td style="padding: 8px; border: 1px solid var(--border); text-align: center;">
      <button type="button" class="remove-row-btn" onclick="removeRow(this)" style="background: #c82020; color: #fff; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">✕</button>
    </td>
  `;
  
  tbody.appendChild(row);
  massnahmeCounter++;
}

function removeRow(btn) {
  const row = btn.closest('tr');
  const tbody = document.getElementById('massnahmenBody');
  
  // Keep at least one row
  if (tbody.children.length > 1) {
    row.remove();
  } else {
    // Clear the inputs instead
    row.querySelectorAll('input').forEach(input => input.value = '');
  }
}

// ============================================================
// FORM SUBMISSION
// ============================================================

async function handleSubmit(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  const messageDiv = document.getElementById('formMessage');
  
  // Validate required fields
  const form = e.target;
  if (!form.checkValidity()) {
    messageDiv.textContent = 'Bitte füllen Sie alle Pflichtfelder aus.';
    messageDiv.className = 'form-message error';
    messageDiv.classList.remove('hidden');
    
    // Highlight invalid fields
    form.querySelectorAll(':invalid').forEach(field => {
      field.classList.add('invalid');
    });
    return;
  }

  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Wird gesendet...';

  // Collect form data
  const formData = collectFormData(form);

  try {
    const response = await fetch('https://n8n.node.janning-it.de/webhook/368921c2-1f7c-4c9c-911e-713601dd76d5', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      messageDiv.textContent = 'Formular erfolgreich gesendet!';
      messageDiv.className = 'form-message success';
      messageDiv.classList.remove('hidden');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        form.reset();
        // Reset date to current
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        document.getElementById('datum').value = localDateTime;
        
        // Hide conditional fields
        document.querySelectorAll('[data-conditional]').forEach(el => {
          if (!el.dataset.conditional.includes('always')) {
            el.classList.add('hidden');
          }
        });
        
        messageDiv.classList.add('hidden');
      }, 2000);
    } else {
      throw new Error('Server error');
    }
  } catch (error) {
    console.error('Submission error:', error);
    messageDiv.textContent = 'Fehler beim Senden. Bitte versuchen Sie es erneut.';
    messageDiv.className = 'form-message error';
    messageDiv.classList.remove('hidden');
  } finally {
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
      Formular absenden
    `;
  }
}

function collectFormData(form) {
  const formData = {
    formular_typ: 'SGUInspektioMagazin',
    timestamp: new Date().toISOString()
  };

  // Text inputs, textareas, hidden fields
  form.querySelectorAll('input[type="text"], input[type="email"], input[type="datetime-local"], input[type="date"], input[type="hidden"], textarea').forEach(field => {
    if (field.name) {
      formData[field.name] = field.value || '';
    }
  });

  // Checkboxes (firma - multiple selection)
  const firmaValues = [];
  form.querySelectorAll('[name="firma"]:checked').forEach(cb => {
    firmaValues.push(cb.value);
  });
  formData.firma = firmaValues.join(', ');

  // Radio buttons
  form.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
    formData[radio.name] = radio.value;
  });

  // Collect all massnahmen rows
  const massnahmen = [];
  const massnahmenRows = document.querySelectorAll('#massnahmenBody tr');
  massnahmenRows.forEach((row, index) => {
    const text = row.querySelector(`[name^="massnahme_text_"]`)?.value || '';
    const verantwortlich = row.querySelector(`[name^="massnahme_verantwortlich_"]`)?.value || '';
    const erledigt = row.querySelector(`[name^="massnahme_erledigt_"]`)?.value || '';
    
    if (text || verantwortlich || erledigt) {
      massnahmen.push({
        massnahme: text,
        verantwortlich: verantwortlich,
        erledigt: erledigt
      });
    }
  });
  formData.massnahmen = massnahmen;

  return formData;
}

// Make removeRow globally accessible
window.removeRow = removeRow;

// ============================================================
// AUTO-HIDE HEADER ON SCROLL
// ============================================================
let lastScrollTop = 0;
let scrollThreshold = 100; // Erst nach 100px scrollen reagieren
const header = document.querySelector('.site-header');

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  // Nur reagieren wenn genug gescrollt wurde
  if (Math.abs(scrollTop - lastScrollTop) < 5) return;
  
  if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
    // Runterscrollen - Header verstecken
    header.classList.add('header-hidden');
  } else {
    // Hochscrollen - Header zeigen
    header.classList.remove('header-hidden');
  }
  
  lastScrollTop = scrollTop;
});
