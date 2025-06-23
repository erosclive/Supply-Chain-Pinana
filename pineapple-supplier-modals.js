// Enhanced Input Fields Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize country code dropdowns
  initCountryCodeDropdowns();
  
  // Initialize location dropdowns
  initLocationDropdowns();
  
  // Initialize harvest season selects
  initHarvestSeasonSelects();
  
  // Initialize planting cycle selects
  initPlantingCycleSelects();
  
  // Initialize variety selects
  initVarietySelects();
  
  // Initialize shelf life selects
  initShelfLifeSelects();
  
  // Initialize form submission handlers
  initFormSubmissionHandlers();
});

// Country Code Dropdown Functionality
function initCountryCodeDropdowns() {
  document.querySelectorAll('.country-code-dropdown .dropdown-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const code = this.getAttribute('data-code');
      const dropdown = this.closest('.input-group').querySelector('.country-code-btn');
      dropdown.textContent = code;
      updateContactInfo(this.closest('.input-group'));
    });
  });
  
  document.querySelectorAll('.phone-input').forEach(input => {
    input.addEventListener('input', function() {
      updateContactInfo(this.closest('.input-group'));
    });
  });
}

function updateContactInfo(inputGroup) {
  const countryCode = inputGroup.querySelector('.country-code-btn').textContent;
  const phoneNumber = inputGroup.querySelector('.phone-input').value;
  const fullContactField = inputGroup.querySelector('.full-contact-info');
  fullContactField.value = `${countryCode} ${phoneNumber}`.trim();
}

// Location Dropdowns Functionality
function initLocationDropdowns() {
  // Sample data structure for Philippines locations
  const locationData = {
    'NCR': {
      name: 'National Capital Region',
      provinces: {
        'Metro Manila': {
          cities: {
            'Manila': ['Binondo', 'Ermita', 'Intramuros', 'Malate', 'Quiapo', 'Sampaloc', 'San Nicolas', 'Santa Cruz', 'Tondo'],
            'Quezon City': ['Bagong Silangan', 'Batasan Hills', 'Commonwealth', 'Fairview', 'Novaliches', 'Cubao', 'Diliman'],
            'Makati': ['Poblacion', 'Bel-Air', 'San Lorenzo', 'Urdaneta', 'Dasmariñas', 'Forbes Park', 'Guadalupe Nuevo']
          }
        }
      }
    },
    'Region IV-A': {
      name: 'CALABARZON',
      provinces: {
        'Cavite': {
          cities: {
            'Bacoor': ['Molino', 'Talaba', 'Queens Row'],
            'Dasmariñas': ['Burol', 'Salawag', 'San Agustin'],
            'General Trias': ['Manggahan', 'Buenavista', 'Santiago']
          }
        },
        'Laguna': {
          cities: {
            'Santa Rosa': ['Balibago', 'Don Jose', 'Macabling'],
            'Calamba': ['Canlubang', 'Parian', 'Mayapa'],
            'Biñan': ['Canlalay', 'Malaban', 'San Antonio']
          }
        },
        'Batangas': {
          cities: {
            'Lipa': ['Antipolo', 'Banay-banay', 'Bolbok'],
            'Batangas City': ['Alangilan', 'Balagtas', 'Kumintang'],
            'Tanauan': ['Darasa', 'Natatas', 'Pantay Matanda']
          }
        }
      }
    }
    // Add more regions as needed
  };
  
  document.querySelectorAll('.location-region').forEach(regionSelect => {
    regionSelect.addEventListener('change', function() {
      const region = this.value;
      const provinceSelect = this.closest('.mb-3').querySelector('.location-province');
      const citySelect = this.closest('.mb-3').querySelector('.location-city');
      const barangaySelect = this.closest('.mb-3').querySelector('.location-barangay');
      
      // Reset province, city, and barangay selects
      resetSelect(provinceSelect, 'Select Province');
      resetSelect(citySelect, 'Select City/Municipality');
      resetSelect(barangaySelect, 'Select Barangay');
      
      // Disable selects by default
      provinceSelect.disabled = true;
      citySelect.disabled = true;
      barangaySelect.disabled = true;
      
      if (region && locationData[region]) {
        // Enable province select and populate options
        provinceSelect.disabled = false;
        
        const provinces = locationData[region].provinces;
        for (const province in provinces) {
          const option = document.createElement('option');
          option.value = province;
          option.textContent = province;
          provinceSelect.appendChild(option);
        }
      }
      
      updateLocationField(this.closest('.mb-3'));
    });
    
    const provinceSelect = regionSelect.closest('.mb-3').querySelector('.location-province');
    provinceSelect.addEventListener('change', function() {
      const region = this.closest('.mb-3').querySelector('.location-region').value;
      const province = this.value;
      const citySelect = this.closest('.mb-3').querySelector('.location-city');
      const barangaySelect = this.closest('.mb-3').querySelector('.location-barangay');
      
      // Reset city and barangay selects
      resetSelect(citySelect, 'Select City/Municipality');
      resetSelect(barangaySelect, 'Select Barangay');
      
      // Disable selects by default
      citySelect.disabled = true;
      barangaySelect.disabled = true;
      
      if (region && province && locationData[region] && locationData[region].provinces[province]) {
        // Enable city select and populate options
        citySelect.disabled = false;
        
        const cities = locationData[region].provinces[province].cities;
        for (const city in cities) {
          const option = document.createElement('option');
          option.value = city;
          option.textContent = city;
          citySelect.appendChild(option);
        }
      }
      
      updateLocationField(this.closest('.mb-3'));
    });
    
    const citySelect = regionSelect.closest('.mb-3').querySelector('.location-city');
    citySelect.addEventListener('change', function() {
      const region = this.closest('.mb-3').querySelector('.location-region').value;
      const province = this.closest('.mb-3').querySelector('.location-province').value;
      const city = this.value;
      const barangaySelect = this.closest('.mb-3').querySelector('.location-barangay');
      
      // Reset barangay select
      resetSelect(barangaySelect, 'Select Barangay');
      
      // Disable barangay select by default
      barangaySelect.disabled = true;
      
      if (region && province && city && 
          locationData[region] && 
          locationData[region].provinces[province] && 
          locationData[region].provinces[province].cities[city]) {
        // Enable barangay select and populate options
        barangaySelect.disabled = false;
        
        const barangays = locationData[region].provinces[province].cities[city];
        for (const barangay of barangays) {
          const option = document.createElement('option');
          option.value = barangay;
          option.textContent = barangay;
          barangaySelect.appendChild(option);
        }
      }
      
      updateLocationField(this.closest('.mb-3'));
    });
    
    const barangaySelect = regionSelect.closest('.mb-3').querySelector('.location-barangay');
    barangaySelect.addEventListener('change', function() {
      updateLocationField(this.closest('.mb-3'));
    });
  });
}

function resetSelect(select, defaultText) {
  select.innerHTML = '';
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = defaultText;
  select.appendChild(defaultOption);
}

function updateLocationField(container) {
  const region = container.querySelector('.location-region').value;
  const province = container.querySelector('.location-province').value;
  const city = container.querySelector('.location-city').value;
  const barangay = container.querySelector('.location-barangay').value;
  
  let locationParts = [];
  if (barangay) locationParts.push(barangay);
  if (city) locationParts.push(city);
  if (province) locationParts.push(province);
  if (region) locationParts.push(region);
  
  const fullLocationField = container.querySelector('.full-location');
  fullLocationField.value = locationParts.join(', ');
}

// Harvest Season Functionality
function initHarvestSeasonSelects() {
  document.querySelectorAll('.harvest-season-select').forEach(select => {
    select.addEventListener('change', function() {
      const customDiv = this.closest('.mb-3').querySelector('.harvest-season-custom');
      
      if (this.value === 'custom') {
        customDiv.style.display = 'block';
      } else {
        customDiv.style.display = 'none';
      }
      
      updateHarvestSeasonField(this.closest('.mb-3'));
    });
    
    const fromMonth = select.closest('.mb-3').querySelector('.harvest-from-month');
    const toMonth = select.closest('.mb-3').querySelector('.harvest-to-month');
    
    if (fromMonth && toMonth) {
      fromMonth.addEventListener('change', function() {
        updateHarvestSeasonField(this.closest('.mb-3'));
      });
      
      toMonth.addEventListener('change', function() {
        updateHarvestSeasonField(this.closest('.mb-3'));
      });
    }
  });
}

function updateHarvestSeasonField(container) {
  const select = container.querySelector('.harvest-season-select');
  const fullField = container.querySelector('.full-harvest-season');
  
  if (select.value === 'custom') {
    const fromMonth = container.querySelector('.harvest-from-month').value;
    const toMonth = container.querySelector('.harvest-to-month').value;
    fullField.value = `${fromMonth} to ${toMonth}`;
  } else {
    fullField.value = select.value;
  }
}

// Planting Cycle Functionality
function initPlantingCycleSelects() {
  document.querySelectorAll('.planting-cycle-select').forEach(select => {
    select.addEventListener('change', function() {
      const customDiv = this.closest('.mb-3').querySelector('.planting-cycle-custom');
      
      if (this.value === 'custom') {
        customDiv.style.display = 'block';
      } else {
        customDiv.style.display = 'none';
      }
      
      updatePlantingCycleField(this.closest('.mb-3'));
    });
    
    const minInput = select.closest('.mb-3').querySelector('.planting-cycle-min');
    const maxInput = select.closest('.mb-3').querySelector('.planting-cycle-max');
    
    if (minInput && maxInput) {
      minInput.addEventListener('input', function() {
        updatePlantingCycleField(this.closest('.mb-3'));
      });
      
      maxInput.addEventListener('input', function() {
        updatePlantingCycleField(this.closest('.mb-3'));
      });
    }
  });
}

function updatePlantingCycleField(container) {
  const select = container.querySelector('.planting-cycle-select');
  const fullField = container.querySelector('.full-planting-cycle');
  
  if (select.value === 'custom') {
    const min = container.querySelector('.planting-cycle-min').value;
    const max = container.querySelector('.planting-cycle-max').value;
    
    if (min && max) {
      fullField.value = `${min}-${max} months`;
    } else if (min) {
      fullField.value = `${min} months`;
    } else if (max) {
      fullField.value = `Up to ${max} months`;
    } else {
      fullField.value = '';
    }
  } else {
    fullField.value = select.value;
  }
}

// Variety Functionality
function initVarietySelects() {
  document.querySelectorAll('.variety-select').forEach(select => {
    select.addEventListener('change', function() {
      const customDiv = this.closest('.mb-3').querySelector('.variety-custom');
      
      if (this.value === 'custom') {
        customDiv.style.display = 'block';
      } else {
        customDiv.style.display = 'none';
      }
      
      updateVarietyField(this.closest('.mb-3'));
    });
    
    const customInput = select.closest('.mb-3').querySelector('.variety-custom-input');
    
    if (customInput) {
      customInput.addEventListener('input', function() {
        updateVarietyField(this.closest('.mb-3'));
      });
    }
  });
}

function updateVarietyField(container) {
  const select = container.querySelector('.variety-select');
  const fullField = container.querySelector('.full-variety');
  
  if (select.value === 'custom') {
    const customValue = container.querySelector('.variety-custom-input').value;
    fullField.value = customValue;
  } else {
    fullField.value = select.value;
  }
}

// Shelf Life Functionality
function initShelfLifeSelects() {
  document.querySelectorAll('.shelf-life-select').forEach(select => {
    select.addEventListener('change', function() {
      const customDiv = this.closest('.mb-3').querySelector('.shelf-life-custom');
      
      if (this.value === 'custom') {
        customDiv.style.display = 'block';
      } else {
        customDiv.style.display = 'none';
      }
      
      updateShelfLifeField(this.closest('.mb-3'));
    });
    
    const roomMinInput = select.closest('.mb-3').querySelector('.shelf-life-room-min');
    const roomMaxInput = select.closest('.mb-3').querySelector('.shelf-life-room-max');
    const refrigMinInput = select.closest('.mb-3').querySelector('.shelf-life-refrig-min');
    const refrigMaxInput = select.closest('.mb-3').querySelector('.shelf-life-refrig-max');
    
    if (roomMinInput && roomMaxInput && refrigMinInput && refrigMaxInput) {
      roomMinInput.addEventListener('input', function() {
        updateShelfLifeField(this.closest('.mb-3'));
      });
      
      roomMaxInput.addEventListener('input', function() {
        updateShelfLifeField(this.closest('.mb-3'));
      });
      
      refrigMinInput.addEventListener('input', function() {
        updateShelfLifeField(this.closest('.mb-3'));
      });
      
      refrigMaxInput.addEventListener('input', function() {
        updateShelfLifeField(this.closest('.mb-3'));
      });
    }
  });
}

function updateShelfLifeField(container) {
  const select = container.querySelector('.shelf-life-select');
  const fullField = container.querySelector('.full-shelf-life');
  
  if (select.value === 'custom') {
    const roomMin = container.querySelector('.shelf-life-room-min').value;
    const roomMax = container.querySelector('.shelf-life-room-max').value;
    const refrigMin = container.querySelector('.shelf-life-refrig-min').value;
    const refrigMax = container.querySelector('.shelf-life-refrig-max').value;
    
    let shelfLifeText = '';
    
    if (roomMin && roomMax) {
      shelfLifeText += `${roomMin}-${roomMax} days at room temperature`;
    } else if (roomMin) {
      shelfLifeText += `${roomMin}+ days at room temperature`;
    } else if (roomMax) {
      shelfLifeText += `Up to ${roomMax} days at room temperature`;
    }
    
    if ((roomMin || roomMax) && (refrigMin || refrigMax)) {
      shelfLifeText += ', ';
    }
    
    if (refrigMin && refrigMax) {
      shelfLifeText += `${refrigMin}-${refrigMax} days refrigerated`;
    } else if (refrigMin) {
      shelfLifeText += `${refrigMin}+ days refrigerated`;
    } else if (refrigMax) {
      shelfLifeText += `Up to ${refrigMax} days refrigerated`;
    }
    
    fullField.value = shelfLifeText;
  } else {
    fullField.value = select.value;
  }
}

// Form Submission Handlers
function initFormSubmissionHandlers() {
  // Edit Fixed Pineapple Form
  const editFixedForm = document.getElementById('edit-fixed-supplier-form');
  if (editFixedForm) {
    const updateBtn = document.getElementById('update-fixed-supplier-btn');
    if (updateBtn) {
      updateBtn.addEventListener('click', function() {
        // Transfer values from enhanced fields to original fields
        transferEnhancedFieldValues(editFixedForm, 'edit-fixed-');
        
        // Continue with the original update function
        updateFixedPineappleSupplier();
      });
    }
  }
  
  // Add Alternative Form
  const addAlternativeForm = document.getElementById('add-alternative-form');
  if (addAlternativeForm) {
    const saveBtn = document.getElementById('save-alternative-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        // Transfer values from enhanced fields to original fields
        transferEnhancedFieldValues(addAlternativeForm, 'alternative-');
        
        // Continue with the original save function
        saveAlternative();
      });
    }
  }
}

function transferEnhancedFieldValues(form, prefix) {
  // Contact Information
  const contactInfoField = form.querySelector(`#${prefix}contact`);
  const fullContactInfo = form.querySelector('.full-contact-info');
  if (contactInfoField && fullContactInfo && fullContactInfo.value) {
    contactInfoField.value = fullContactInfo.value;
    console.log(`Transferred contact info: ${fullContactInfo.value}`);
  }
  
  // Farm Location
  const farmLocationField = form.querySelector(`#${prefix}location`);
  const fullLocation = form.querySelector('.full-location');
  if (farmLocationField && fullLocation && fullLocation.value) {
    farmLocationField.value = fullLocation.value;
    console.log(`Transferred farm location: ${fullLocation.value}`);
  }
  
  // Harvest Season
  const harvestSeasonField = form.querySelector(`#${prefix}harvest`);
  const fullHarvestSeason = form.querySelector('.full-harvest-season');
  if (harvestSeasonField && fullHarvestSeason && fullHarvestSeason.value) {
    harvestSeasonField.value = fullHarvestSeason.value;
    console.log(`Transferred harvest season: ${fullHarvestSeason.value}`);
  }
  
  // Planting Cycle
  const plantingCycleField = form.querySelector(`#${prefix}planting`);
  const fullPlantingCycle = form.querySelector('.full-planting-cycle');
  if (plantingCycleField && fullPlantingCycle && fullPlantingCycle.value) {
    plantingCycleField.value = fullPlantingCycle.value;
    console.log(`Transferred planting cycle: ${fullPlantingCycle.value}`);
  }
  
  // Variety
  const varietyField = form.querySelector(`#${prefix}variety`);
  const fullVariety = form.querySelector('.full-variety');
  if (varietyField && fullVariety && fullVariety.value) {
    varietyField.value = fullVariety.value;
    console.log(`Transferred variety: ${fullVariety.value}`);
  }
  
  // Shelf Life
  const shelfLifeField = form.querySelector(`#${prefix}shelf`);
  const fullShelfLife = form.querySelector('.full-shelf-life');
  if (shelfLifeField && fullShelfLife && fullShelfLife.value) {
    shelfLifeField.value = fullShelfLife.value;
    console.log(`Transferred shelf life: ${fullShelfLife.value}`);
  }
}

// Function to populate enhanced fields from existing values
function populateEnhancedFields(form, prefix) {
  // Contact Information
  const contactInfoField = form.querySelector(`#${prefix}contact`);
  if (contactInfoField) {
    const contactValue = contactInfoField.value;
    const countryCodeBtn = form.querySelector('.country-code-btn');
    const phoneInput = form.querySelector('.phone-input');
    const fullContactInfo = form.querySelector('.full-contact-info');
    
    if (contactValue && countryCodeBtn && phoneInput && fullContactInfo) {
      // Try to extract country code and phone number
      const match = contactValue.match(/^(\+\d+)\s*(.*)$/);
      if (match) {
        countryCodeBtn.textContent = match[1];
        phoneInput.value = match[2];
      } else {
        // Default to +63 and use the whole value as phone
        countryCodeBtn.textContent = '+63';
        phoneInput.value = contactValue;
      }
      fullContactInfo.value = contactValue;
    }
  }
  
  // Farm Location
  const farmLocationField = form.querySelector(`#${prefix}location`);
  if (farmLocationField) {
    const locationValue = farmLocationField.value;
    const fullLocation = form.querySelector('.full-location');
    
    if (locationValue && fullLocation) {
      fullLocation.value = locationValue;
      // Note: We don't try to parse the location into region/province/city/barangay
      // as that would require a complex reverse lookup
    }
  }
  
  // Harvest Season
  const harvestSeasonField = form.querySelector(`#${prefix}harvest`);
  if (harvestSeasonField) {
    const harvestValue = harvestSeasonField.value;
    const harvestSelect = form.querySelector('.harvest-season-select');
    const fullHarvestSeason = form.querySelector('.full-harvest-season');
    
    if (harvestValue && harvestSelect && fullHarvestSeason) {
      // Try to match with predefined options
      const options = Array.from(harvestSelect.options).map(opt => opt.value);
      if (options.includes(harvestValue)) {
        harvestSelect.value = harvestValue;
      } else {
        harvestSelect.value = 'custom';
        form.querySelector('.harvest-season-custom').style.display = 'block';
        
        // Try to parse custom range (e.g., "January to April")
        const match = harvestValue.match(/(\w+)\s+to\s+(\w+)/i);
        if (match) {
          const fromMonth = form.querySelector('.harvest-from-month');
          const toMonth = form.querySelector('.harvest-to-month');
          if (fromMonth && toMonth) {
            // Try to set the months if they exist in the dropdown
            try {
              fromMonth.value = match[1];
              toMonth.value = match[2];
            } catch (e) {
              console.error('Error setting harvest months:', e);
            }
          }
        }
      }
      fullHarvestSeason.value = harvestValue;
    }
  }
  
  // Planting Cycle
  const plantingCycleField = form.querySelector(`#${prefix}planting`);
  if (plantingCycleField) {
    const plantingValue = plantingCycleField.value;
    const plantingSelect = form.querySelector('.planting-cycle-select');
    const fullPlantingCycle = form.querySelector('.full-planting-cycle');
    
    if (plantingValue && plantingSelect && fullPlantingCycle) {
      // Try to match with predefined options
      const options = Array.from(plantingSelect.options).map(opt => opt.value);
      if (options.includes(plantingValue)) {
        plantingSelect.value = plantingValue;
      } else {
        plantingSelect.value = 'custom';
        form.querySelector('.planting-cycle-custom').style.display = 'block';
        
        // Try to parse custom range (e.g., "12-18 months")
        const match = plantingValue.match(/(\d+)-(\d+)\s*months/i);
        if (match) {
          const minInput = form.querySelector('.planting-cycle-min');
          const maxInput = form.querySelector('.planting-cycle-max');
          if (minInput && maxInput) {
            minInput.value = match[1];
            maxInput.value = match[2];
          }
        }
      }
      fullPlantingCycle.value = plantingValue;
    }
  }
  
  // Variety
  const varietyField = form.querySelector(`#${prefix}variety`);
  if (varietyField) {
    const varietyValue = varietyField.value;
    const varietySelect = form.querySelector('.variety-select');
    const fullVariety = form.querySelector('.full-variety');
    
    if (varietyValue && varietySelect && fullVariety) {
      // Try to match with predefined options
      const options = Array.from(varietySelect.options).map(opt => opt.value);
      if (options.includes(varietyValue)) {
        varietySelect.value = varietyValue;
      } else {
        varietySelect.value = 'custom';
        form.querySelector('.variety-custom').style.display = 'block';
        form.querySelector('.variety-custom-input').value = varietyValue;
      }
      fullVariety.value = varietyValue;
    }
  }
  
  // Shelf Life
  const shelfLifeField = form.querySelector(`#${prefix}shelf`);
  if (shelfLifeField) {
    const shelfLifeValue = shelfLifeField.value;
    const shelfLifeSelect = form.querySelector('.shelf-life-select');
    const fullShelfLife = form.querySelector('.full-shelf-life');
    
    if (shelfLifeValue && shelfLifeSelect && fullShelfLife) {
      // Try to match with predefined options
      const options = Array.from(shelfLifeSelect.options).map(opt => opt.value);
      if (options.includes(shelfLifeValue)) {
        shelfLifeSelect.value = shelfLifeValue;
      } else {
        shelfLifeSelect.value = 'custom';
        form.querySelector('.shelf-life-custom').style.display = 'block';
        
        // We don't try to parse the complex shelf life format here
        // as it could have various formats
      }
      fullShelfLife.value = shelfLifeValue;
    }
  }
}

// Call this function when the edit modal is opened
document.addEventListener('shown.bs.modal', function(event) {
  const modal = event.target;
  
  if (modal.id === 'editFixedPineappleModal') {
    const form = document.getElementById('edit-fixed-supplier-form');
    populateEnhancedFields(form, 'edit-fixed-');
  } else if (modal.id === 'addAlternativeModal') {
    const form = document.getElementById('add-alternative-form');
    populateEnhancedFields(form, 'alternative-');
  }
});