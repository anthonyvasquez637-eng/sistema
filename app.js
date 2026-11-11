/**
 * AutoDrive - Frontend State Management and Business Logic
 * UASD - Grupo 5: Jorge Vásquez, Esteyesí Martínez, Glimmer Méndez, Dodany Pichardo
 */

// Initial Seed Data (Synched with SQL Server Schema)
const defaultData = {
  vehicles: [
    { id: 1, brand: 'Toyota', model: 'RAV4', category: 'SUV Premium', plate: 'G-584912', year: 2023, transmission: 'Automática', fuel: 'Gasolina', km: 28450, rate: 4800, deposit: 20000, status: 'Disponible' },
    { id: 2, brand: 'Toyota', model: 'Corolla', category: 'Sedán Confort', plate: 'A-492104', year: 2022, transmission: 'Automática', fuel: 'Gasolina', km: 42100, rate: 3000, deposit: 12000, status: 'Disponible' },
    { id: 3, brand: 'Toyota', model: 'Hilux 4x4', category: 'Camioneta / Pickup 4x4', plate: 'L-839201', year: 2024, transmission: 'Automática', fuel: 'Gasoil/Diésel', km: 15200, rate: 5500, deposit: 25000, status: 'Disponible' },
    { id: 4, brand: 'Ford', model: 'Explorer', category: 'SUV Premium', plate: 'G-619283', year: 2023, transmission: 'Automática', fuel: 'Gasolina', km: 33700, rate: 4800, deposit: 20000, status: 'Alquilado' },
    { id: 5, brand: 'Hyundai', model: 'Tucson', category: 'SUV Premium', plate: 'G-309182', year: 2021, transmission: 'Automática', fuel: 'Gasolina', km: 58000, rate: 4800, deposit: 20000, status: 'Mantenimiento' },
    { id: 6, brand: 'Hyundai', model: 'Elantra', category: 'Sedán Confort', plate: 'A-672190', year: 2023, transmission: 'Automática', fuel: 'Gasolina', km: 19500, rate: 3000, deposit: 12000, status: 'Disponible' }
  ],
  clients: [
    { id: 1, docType: 'Cédula', docNumber: '001-1827491-3', name: 'Manuel Rosario Méndez', phone: '809-555-0182', email: 'manuel.rosario@email.com', license: 'LIC-9481920', licenseExp: '2028-09-15' },
    { id: 2, docType: 'Cédula', docNumber: '402-2918273-1', name: 'Laura Guzmán Peña', phone: '829-555-8392', email: 'laura.guzman@email.com', license: 'LIC-1029481', licenseExp: '2027-11-20' }
  ],
  contracts: [
    {
      id: 1,
      contractNumber: 'CTR-2026-001',
      clientId: 1,
      clientName: 'Manuel Rosario Méndez',
      vehicleId: 4,
      vehicleDesc: 'Ford Explorer 2023 (G-619283)',
      startDate: '2026-11-09',
      endDate: '2026-11-13',
      days: 4,
      dailyRate: 4800,
      baseRent: 19200,
      insuranceCost: 3800,
      extrasCost: 1000,
      subtotal: 24000,
      itbis: 4320,
      total: 28320,
      deposit: 20000,
      status: 'Vigente',
      ncf: 'B0200000104'
    }
  ]
};

// Initialize State
let appState = JSON.parse(localStorage.getItem('autodrive_store')) || defaultData;

function saveState() {
  localStorage.setItem('autodrive_store', JSON.stringify(appState));
}

// Navigation Handler
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  renderDashboard();
  renderFleet();
  renderContracts();
  renderClients();
  populateClientSelect();
  setupQuoteCalculation();
});

function setupNavigation() {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const target = link.getAttribute('data-view');
      document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
      document.getElementById(target).classList.add('active');

      const titles = {
        'view-dashboard': 'Panel Principal y Resumen Operativo',
        'view-fleet': 'Control y Disponibilidad de Flota',
        'view-contracts': 'Gestión de Contratos y Rentas',
        'view-clients': 'Directorio de Clientes Registrados'
      };
      document.getElementById('current-page-title').textContent = titles[target] || 'AutoDrive';
    });
  });
}

// Render Dashboard KPI Cards
function renderDashboard() {
  const total = appState.vehicles.length;
  const disponibles = appState.vehicles.filter(v => v.status === 'Disponible').length;
  const alquilados = appState.vehicles.filter(v => v.status === 'Alquilado').length;
  const mantenimiento = appState.vehicles.filter(v => v.status === 'Mantenimiento').length;

  document.getElementById('kpi-total').textContent = total;
  document.getElementById('kpi-disponibles').textContent = disponibles;
  document.getElementById('kpi-alquilados').textContent = alquilados;
  document.getElementById('kpi-mantenimiento').textContent = mantenimiento;

  const totalFacturado = appState.contracts.reduce((acc, c) => acc + c.total, 0);
  document.getElementById('kpi-facturado').textContent = `RD$ ${totalFacturado.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
}

// Render Fleet Grid
function renderFleet(filterQuery = '', filterCategory = 'all', filterStatus = 'all') {
  const container = document.getElementById('fleet-container');
  container.innerHTML = '';

  const filtered = appState.vehicles.filter(v => {
    const textMatch = `${v.brand} ${v.model} ${v.plate}`.toLowerCase().includes(filterQuery.toLowerCase());
    const catMatch = filterCategory === 'all' || v.category === filterCategory;
    const statusMatch = filterStatus === 'all' || v.status === filterStatus;
    return textMatch && catMatch && statusMatch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No se encontraron vehículos que coincidan con los filtros.</div>`;
    return;
  }

  filtered.forEach(v => {
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    card.innerHTML = `
      <div class="vehicle-card-header">
        <div>
          <div class="vehicle-title">${v.brand} ${v.model}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${v.category} • ${v.year}</div>
        </div>
        <span class="badge badge-${v.status.toLowerCase()}">${v.status}</span>
      </div>
      <div class="vehicle-card-body">
        <div class="spec-row">
          <span class="spec-label">Placa Dominicana:</span>
          <span class="spec-val" style="color: var(--accent-cyan);">${v.plate}</span>
        </div>
        <div class="spec-row">
          <span class="spec-label">Transmisión / Combustible:</span>
          <span class="spec-val">${v.transmission} / ${v.fuel}</span>
        </div>
        <div class="spec-row">
          <span class="spec-label">Kilometraje Actual:</span>
          <span class="spec-val">${v.km.toLocaleString()} km</span>
        </div>
        <div class="rate-tag">
          <span>Tarifa por Día:</span>
          <span class="rate-price">RD$ ${v.rate.toLocaleString()}</span>
        </div>
      </div>
      <div class="vehicle-card-actions">
        ${v.status === 'Disponible' 
          ? `<button class="btn btn-primary btn-sm" style="width: 100%;" onclick="openContractModal(${v.id})">Generar Contrato</button>`
          : v.status === 'Alquilado'
          ? `<button class="btn btn-secondary btn-sm" style="width: 100%;" onclick="openReturnModal(${v.id})">Inspección Retorno</button>`
          : `<button class="btn btn-secondary btn-sm" style="width: 100%;" disabled>En Taller Mecánico</button>`
        }
      </div>
    `;
    container.appendChild(card);
  });
}

// Filter listeners
document.getElementById('fleet-search')?.addEventListener('input', applyFleetFilters);
document.getElementById('filter-category')?.addEventListener('change', applyFleetFilters);
document.getElementById('filter-status')?.addEventListener('change', applyFleetFilters);

function applyFleetFilters() {
  const query = document.getElementById('fleet-search').value;
  const cat = document.getElementById('filter-category').value;
  const status = document.getElementById('filter-status').value;
  renderFleet(query, cat, status);
}

// Contract Modal & Calculation
let selectedVehicleForContract = null;

function openContractModal(vehicleId) {
  selectedVehicleForContract = appState.vehicles.find(v => v.id === vehicleId);
  if (!selectedVehicleForContract) return;

  document.getElementById('modal-vehicle-desc').textContent = `${selectedVehicleForContract.brand} ${selectedVehicleForContract.model} (${selectedVehicleForContract.plate})`;
  document.getElementById('contract-rate').value = selectedVehicleForContract.rate;
  
  // Set default dates (today to +3 days)
  const today = new Date().toISOString().split('T')[0];
  const next3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  document.getElementById('contract-start').value = today;
  document.getElementById('contract-end').value = next3Days;

  calculateContractQuote();
  openModal('modal-contract');
}

function calculateContractQuote() {
  if (!selectedVehicleForContract) return;

  const start = new Date(document.getElementById('contract-start').value);
  const end = new Date(document.getElementById('contract-end').value);
  
  let diffTime = end - start;
  let days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (days <= 0) days = 1;

  document.getElementById('quote-days').textContent = `${days} día(s)`;

  const dailyRate = selectedVehicleForContract.rate;
  const baseRent = days * dailyRate;
  document.getElementById('quote-base').textContent = `RD$ ${baseRent.toLocaleString()}`;

  const insuranceDaily = parseFloat(document.getElementById('contract-insurance').value) || 0;
  const totalInsurance = days * insuranceDaily;
  document.getElementById('quote-insurance').textContent = `RD$ ${totalInsurance.toLocaleString()}`;

  let extrasDaily = 0;
  if (document.getElementById('extra-gps').checked) extrasDaily += 250;
  if (document.getElementById('extra-seat').checked) extrasDaily += 200;
  if (document.getElementById('extra-driver').checked) extrasDaily += 350;
  
  const totalExtras = days * extrasDaily;
  document.getElementById('quote-extras').textContent = `RD$ ${totalExtras.toLocaleString()}`;

  const subtotal = baseRent + totalInsurance + totalExtras;
  const itbis = subtotal * 0.18;
  const total = subtotal + itbis;

  document.getElementById('quote-subtotal').textContent = `RD$ ${subtotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  document.getElementById('quote-itbis').textContent = `RD$ ${itbis.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  document.getElementById('quote-total').textContent = `RD$ ${total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;

  return { days, dailyRate, baseRent, totalInsurance, totalExtras, subtotal, itbis, total };
}

function setupQuoteCalculation() {
  const triggers = ['contract-start', 'contract-end', 'contract-insurance', 'extra-gps', 'extra-seat', 'extra-driver'];
  triggers.forEach(id => {
    document.getElementById(id)?.addEventListener('change', calculateContractQuote);
  });
}

function submitContract() {
  const clientId = parseInt(document.getElementById('contract-client').value);
  if (!clientId) {
    alert('Por favor seleccione un cliente registrado.');
    return;
  }

  const client = appState.clients.find(c => c.id === clientId);
  const quote = calculateContractQuote();
  const nextNum = appState.contracts.length + 1;
  const contractNumber = `CTR-2026-${String(nextNum).padStart(3, '0')}`;
  const ncfNumber = `B020000${String(104 + nextNum).padStart(4, '0')}`;

  const newContract = {
    id: nextNum,
    contractNumber: contractNumber,
    clientId: client.id,
    clientName: `${client.name}`,
    vehicleId: selectedVehicleForContract.id,
    vehicleDesc: `${selectedVehicleForContract.brand} ${selectedVehicleForContract.model} (${selectedVehicleForContract.plate})`,
    startDate: document.getElementById('contract-start').value,
    endDate: document.getElementById('contract-end').value,
    days: quote.days,
    dailyRate: quote.dailyRate,
    baseRent: quote.baseRent,
    insuranceCost: quote.totalInsurance,
    extrasCost: quote.totalExtras,
    subtotal: quote.subtotal,
    itbis: quote.itbis,
    total: quote.total,
    deposit: selectedVehicleForContract.deposit,
    status: 'Vigente',
    ncf: ncfNumber
  };

  // Update vehicle status
  selectedVehicleForContract.status = 'Alquilado';

  appState.contracts.unshift(newContract);
  saveState();

  closeModal('modal-contract');
  renderDashboard();
  renderFleet();
  renderContracts();
  alert(`Contrato ${contractNumber} generado exitosamente.`);
}

// Render Contracts Table
function renderContracts() {
  const tbody = document.getElementById('contracts-tbody');
  tbody.innerHTML = '';

  appState.contracts.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 700; color: var(--accent-cyan);">${c.contractNumber}</td>
      <td>${c.clientName}</td>
      <td>${c.vehicleDesc}</td>
      <td>${c.startDate} al ${c.endDate}</td>
      <td>RD$ ${c.total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
      <td><span class="badge badge-${c.status.toLowerCase()}">${c.status}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="showInvoice(${c.id})">Ver Factura</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Show Printable Invoice
function showInvoice(contractId) {
  const contract = appState.contracts.find(c => c.id === contractId);
  const client = appState.clients.find(c => c.id === contract.clientId);
  if (!contract || !client) return;

  const invoiceHtml = `
    <div class="printable-invoice" id="invoice-doc">
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #0b0f19; padding-bottom: 15px; margin-bottom: 20px;">
        <div>
          <h2 style="margin: 0; color: #0b0f19; font-size: 24px;">AUTODRIVE RENT-A-CAR S.R.L.</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: #64748b;">RNC: 1-32-98471-2 | Barahona, República Dominicana</p>
          <p style="margin: 2px 0 0; font-size: 13px; color: #64748b;">Tel: (809) 555-DRIVE | info@autodrive.com.do</p>
        </div>
        <div style="text-align: right;">
          <h3 style="margin: 0; color: #2563eb; font-size: 18px;">FACTURA VENTA / ALQUILER</h3>
          <p style="margin: 4px 0 0; font-size: 14px; font-weight: bold;">NCF: ${contract.ncf}</p>
          <p style="margin: 2px 0 0; font-size: 12px; color: #64748b;">Tipo: Consumo (B02)</p>
          <p style="margin: 2px 0 0; font-size: 12px; color: #64748b;">Fecha: ${new Date().toLocaleDateString('es-DO')}</p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 13px;">
        <div>
          <strong style="color: #0b0f19;">DATOS DEL CLIENTE:</strong><br>
          Nombre: ${client.name}<br>
          Doc: ${client.docType} ${client.docNumber}<br>
          Licencia: ${client.license} (Vence: ${client.licenseExp})<br>
          Teléfono: ${client.phone}
        </div>
        <div style="text-align: right;">
          <strong style="color: #0b0f19;">DETALLES DEL SERVICIO:</strong><br>
          No. Contrato: ${contract.contractNumber}<br>
          Unidad: ${contract.vehicleDesc}<br>
          Período: ${contract.startDate} al ${contract.endDate} (${contract.days} días)<br>
          Depósito Garantía: RD$ ${contract.deposit.toLocaleString()}
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px;">
        <thead>
          <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
            <th style="padding: 10px; text-align: left;">Descripción</th>
            <th style="padding: 10px; text-align: center;">Cantidad</th>
            <th style="padding: 10px; text-align: right;">Precio Unitario</th>
            <th style="padding: 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px;">Alquiler de Vehículo (${contract.vehicleDesc})</td>
            <td style="padding: 10px; text-align: center;">${contract.days} días</td>
            <td style="padding: 10px; text-align: right;">RD$ ${contract.dailyRate.toLocaleString()}</td>
            <td style="padding: 10px; text-align: right;">RD$ ${contract.baseRent.toLocaleString()}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px;">Póliza de Seguro y Asistencia Vial</td>
            <td style="padding: 10px; text-align: center;">${contract.days} días</td>
            <td style="padding: 10px; text-align: right;">RD$ ${(contract.insuranceCost / contract.days).toLocaleString()}</td>
            <td style="padding: 10px; text-align: right;">RD$ ${contract.insuranceCost.toLocaleString()}</td>
          </tr>
          ${contract.extrasCost > 0 ? `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px;">Servicios y Accesorios Adicionales (GPS / Asientos)</td>
            <td style="padding: 10px; text-align: center;">1 global</td>
            <td style="padding: 10px; text-align: right;">RD$ ${contract.extrasCost.toLocaleString()}</td>
            <td style="padding: 10px; text-align: right;">RD$ ${contract.extrasCost.toLocaleString()}</td>
          </tr>` : ''}
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end;">
        <div style="width: 280px; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; padding: 4px 0;">
            <span>Subtotal:</span>
            <strong>RD$ ${contract.subtotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0;">
            <span>ITBIS (18%):</span>
            <strong>RD$ ${contract.itbis.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 2px solid #0b0f19; font-size: 16px; color: #2563eb;">
            <span>TOTAL FACTURA:</span>
            <strong>RD$ ${contract.total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('invoice-modal-body').innerHTML = invoiceHtml;
  openModal('modal-invoice');
}

// Return and Inspection
let selectedVehicleForReturn = null;
function openReturnModal(vehicleId) {
  selectedVehicleForReturn = appState.vehicles.find(v => v.id === vehicleId);
  const activeContract = appState.contracts.find(c => c.vehicleId === vehicleId && c.status === 'Vigente');
  if (!selectedVehicleForReturn || !activeContract) return;

  document.getElementById('return-vehicle-desc').textContent = `${selectedVehicleForReturn.brand} ${selectedVehicleForReturn.model} (${selectedVehicleForReturn.plate})`;
  document.getElementById('return-contract-num').textContent = activeContract.contractNumber;
  document.getElementById('return-km').value = selectedVehicleForReturn.km + 240; // example suggested km
  openModal('modal-return');
}

function submitReturnInspection() {
  const newKm = parseInt(document.getElementById('return-km').value);
  const fuel = document.getElementById('return-fuel').value;
  const sendToMaintenance = document.getElementById('return-maintenance').checked;

  selectedVehicleForReturn.km = newKm;
  selectedVehicleForReturn.status = sendToMaintenance ? 'Mantenimiento' : 'Disponible';

  // Mark contract as finalizado
  const activeContract = appState.contracts.find(c => c.vehicleId === selectedVehicleForReturn.id && c.status === 'Vigente');
  if (activeContract) {
    activeContract.status = 'Finalizado';
  }

  saveState();
  closeModal('modal-return');
  renderDashboard();
  renderFleet();
  renderContracts();
  alert(`Vehículo ${selectedVehicleForReturn.plate} devuelto exitosamente e inspección registrada.`);
}

// Render Clients
function renderClients() {
  const tbody = document.getElementById('clients-tbody');
  tbody.innerHTML = '';

  appState.clients.forEach(cl => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600;">${cl.name}</td>
      <td>${cl.docType}: ${cl.docNumber}</td>
      <td>${cl.license} (Vence: ${cl.licenseExp})</td>
      <td>${cl.phone}</td>
      <td>${cl.email}</td>
    `;
    tbody.appendChild(tr);
  });
}

function populateClientSelect() {
  const sel = document.getElementById('contract-client');
  sel.innerHTML = '<option value="">-- Seleccionar Cliente Registrado --</option>';
  appState.clients.forEach(c => {
    sel.innerHTML += `<option value="${c.id}">${c.name} (${c.docNumber})</option>`;
  });
}

function submitNewClient() {
  const name = document.getElementById('client-name').value;
  const docType = document.getElementById('client-doctype').value;
  const docNumber = document.getElementById('client-docnumber').value;
  const license = document.getElementById('client-license').value;
  const licenseExp = document.getElementById('client-licenseexp').value;
  const phone = document.getElementById('client-phone').value;
  const email = document.getElementById('client-email').value;

  if (!name || !docNumber || !license) {
    alert('Por favor complete los campos obligatorios del cliente.');
    return;
  }

  const newId = appState.clients.length + 1;
  const newClient = { id: newId, docType, docNumber, name, phone, email, license, licenseExp };
  
  appState.clients.push(newClient);
  saveState();
  renderClients();
  populateClientSelect();
  closeModal('modal-client');
  alert(`Cliente ${name} registrado con éxito.`);
}

// Utility Modal Functions
function openModal(modalId) {
  document.getElementById(modalId)?.classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId)?.classList.remove('active');
}
